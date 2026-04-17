/*!
 * AI
 * @copyright (c) 2020 Sixcious
 * @license https://github.com/sixcious/shr/blob/main/LICENSE
 */

/**
 * AI contains various functions that interact with Chrome's Prompt API (LanguageModel).
 * This is used in the Popup to provide an AI assistant that can help the user determine the correct
 * settings for the current page.
 */
class AI {

  static #availability;

  static #session;

  static #abortController;

  static #busy = false;

  /**
   * Adds event listeners for the AI dialog interactions, including opening the dialog, enabling AI, sending chat messages, and cancelling responses.
   * This is public so the Popup can call it when adding event listeners.
   */
  static addEventListeners() {
    V.DOM["#ai-button"].addEventListener("click", async () => { MDC.dialogs.get("ai-dialog").open(); AI.#setup(); });
    V.DOM["#ai-dialog-enable-button"].addEventListener("click", () => { V.items[V.K.ai] = true; Promisify.storageSet({ [V.K.ai]: true }); AI.#setup(); });
    V.DOM["#ai-dialog-input-textarea"].addEventListener("keydown", AI.#chat);
    V.DOM["#ai-dialog-input-send"].addEventListener("click", AI.#chat);
    V.DOM["#ai-dialog-input-cancel"].addEventListener("click", AI.#cancel);
  }

  /**
   * Sets up the AI by checking availability, downloading the model if needed,
   * creating a session, feeding HTML context, and asking for an initial recommendation.
   */
  static async #setup() {
    V.DOM["#ai-dialog-enabled"].dataset.display = V.items[V.K.ai] ? "" : "none";
    V.DOM["#ai-dialog-disabled"].dataset.display = V.items[V.K.ai] ? "none" : "";
    // If we already have a session, don't re-setup
    const spxxEnabled = Object.values(await chrome.storage.local.get(V.K.e))[0];
    if (!spxxEnabled || !V.items[V.K.ai] || AI.#session) {
      return;
    }
    // Store previous availability so we don't keep appending the unavailable/downloading messages each time they re-open the popup
    const previousAvailability = AI.#availability;
    // Step 1: Check availability
    await AI.#checkAvailability();
    if (AI.#availability === "unavailable") {
      if (previousAvailability !== "unavailable") {
        AI.#message(Util.i18nGetMessage("ai_unavailable"), "error");
        AI.#message(Util.i18nGetMessage("ai_setup", ["em", Util.getSupportE()]));
      }
      return;
    }
    // Step 2: If downloadable (model not yet downloaded), or downloading (model was downloaded previously and/or deleted) show progress and trigger download
    if (AI.#availability === "downloadable" || AI.#availability === "downloading") {
      if (previousAvailability !== "downloadable" && previousAvailability !== "downloading") {
        AI.#message(Util.i18nGetMessage("ai_downloading"));
      }
      AI.#showDownloadProgress(true);
    } else {
      AI.#message(Util.i18nGetMessage("ai_available"));
    }
    // Step 3: Create session (this will trigger download if needed, with progress monitoring)
    try {
      await AI.#createSession();
    } catch (e) {
      console.log("AI.setup() - Error creating session:", e);
      AI.#showDownloadProgress(false);
      AI.#message(Util.i18nGetMessage("ai_session_error") + (e.message || ""), "error");
      return;
    }
    AI.#showDownloadProgress(false);
    V.DOM["#ai-dialog-input"].dataset.display = "";
    V.DOM["#ai-dialog-notice-text-field-helper-line"].dataset.display = "";
    // Step 4: Get page HTML and URL from content script
    AI.#message(Util.i18nGetMessage("ai_analyzing"));
    let htmlData;
    try {
      htmlData = await chrome.tabs.sendMessage(V.tab.id, { sender: "popup", receiver: "contentscript", greeting: "getHTML", type: "partial" });
    } catch (e) {
      console.log("AI.setup() - Error getting HTML from content script:", e);
      AI.#message(Util.i18nGetMessage("ai_html_exception"), "error");
      return;
    }
    if (!htmlData || (!htmlData.html && !htmlData.url)) {
      AI.#message(Util.i18nGetMessage("ai_html_error"), "error");
      return;
    }
    // Step 5: Feed the AI the HTML context and ask for initial recommendation
    await AI.#analyzePageAndRecommend(htmlData);
  }

  /**
   * Checks the availability of the Language Model API and updates the UI accordingly.
   */
  static async #checkAvailability() {
    AI.#availability = "unavailable";
    try {
      if (typeof LanguageModel !== "undefined" && typeof LanguageModel.availability === "function") {
        AI.#availability = await LanguageModel.availability({
          expectedInputs: [{ type: "text", languages: ["en"] }],
          expectedOutputs: [{ type: "text", languages: ["en"] }]
        });
      }
    } catch (e) {
      console.log("AI.checkAvailability() - Error:", e);
      AI.#availability = "unavailable";
    }
    console.log("AI.checkAvailability() - availability=" + AI.#availability);
  }

  /**
   * Creates a new session with the Language Model API.
   * Uses a system prompt that instructs the AI about the extension/app and its role.
   * Monitors download progress if the model needs to be downloaded first.
   */
  static async #createSession() {
    const systemPrompt = M.decode("SP");
    const previousPercentNumber = (await chrome.storage.session.get("lmDownloadPercentNumber")).lmDownloadPercentNumber || 0;
    AI.#session = await LanguageModel.create({
      initialPrompts: [{ role: "system", content: systemPrompt }],
      expectedInputs: [{ type: "text", languages: ["en"] }],
      expectedOutputs: [{ type: "text", languages: ["en"] }],
      monitor(m) {
        m.addEventListener("downloadprogress", (e) => {
          const percentNumber = Math.min(100, previousPercentNumber + Math.round((e.loaded / (e.total || 1)) * 100));
          // const percentNumber = (e.loaded * 100).toFixed(0);
          const progressPercent = percentNumber + "%";
          console.log("AI download progress=" + progressPercent + " e=", e);
          V.DOM["#ai-download-progress"].textContent = progressPercent;
          const mdcProgress = MDC.linearProgresses?.get("ai-download-linear-progress");
          if (mdcProgress) {
            // Switch to determinate mode once we have real progress
            mdcProgress.determinate = true;
            mdcProgress.progress = percentNumber / 100;
          }
          // Save percentNumber to session storage (persistence in case user closes and reopens the popup during the download)
          chrome.storage.session.set({ lmDownloadPercentNumber: percentNumber });
        });
      }
    });
  }

  /**
   * Feeds the page HTML and URL to the AI and asks for an initial recommendation.
   *
   * @param {Object} htmlData - the HTML data object { html, url, paginationOuterHTML }
   */
  static async #analyzePageAndRecommend(htmlData) {
    // Build the context prompt with the HTML and URL
    const contextPrompt = M.decode("CP1") + htmlData.url + M.decode("CP2") + htmlData.html + M.decode("CP3");
    // Send as a user chat message that the AI processes (not shown as user bubble)
    await AI.#chat(undefined, contextPrompt);
  }

  /**
   * Shows or hides the download progress bar in the AI dialog.
   *
   * @param {boolean} show - whether to show or hide the progress bar
   */
  static #showDownloadProgress(show) {
    const container = V.DOM["#ai-dialog-download"];
    if (container) {
      container.dataset.display = show ? "" : "none";
      const mdcProgress = MDC.linearProgresses?.get("ai-download-linear-progress");
      if (mdcProgress && show) {
        mdcProgress.determinate = false;
        mdcProgress.open();
      }
    }
  }

  /**
   * Sends a message to the Language Model API and streams the response into the UI.
   * Sends the user's prompt or a system prompt (e.g. for the initial setup message).
   *
   * @param {Event} event - The event that triggered the chat (e.g., a keyboard event)
   * @param {string} systemPrompt - (Optional) The system prompt to send to the AI
   */
  static async #chat(event, systemPrompt) {
    // Handle keyboard events: only send on Enter (not Shift+Enter)
    if (event instanceof KeyboardEvent && (event.shiftKey || event.key !== "Enter")) {
      return;
    }
    const userPrompt = V.DOM["#ai-dialog-input-textarea"]?.value?.trim();
    // Don't send empty messages (unless we have a system prompt)
    if (!userPrompt && !systemPrompt) {
      return;
    }
    // Don't send if already busy
    if (AI.#busy) {
      return;
    }
    // Don't send if no session
    if (!AI.#session) {
      AI.#message(Util.i18nGetMessage("ai_session_error"), "error");
      return;
    }
    // Prevent the default action (like new line in textarea on Enter)
    if (event) {
      event.preventDefault();
    }
    AI.#busy = true;
    // Place user input in output area
    if (userPrompt) {
      const input = document.createElement("div");
      input.className = "ai-dialog-output-user";
      input.innerText = userPrompt;
      V.DOM["#ai-dialog-output"].appendChild(input);
    }
    if (V.DOM["#ai-dialog-input-textarea"]) {
      V.DOM["#ai-dialog-input-textarea"].value = "";
    }
    // Place loading indicator in output area
    const loading = document.createElement("div");
    loading.className = "ai-dialog-output-loading";
    const computedStyle = getComputedStyle(document.documentElement);
    const color = computedStyle.getPropertyValue("--icon-fill");
    const spinner = Util.createIcon("spinner", { color: color || "red", size: "20", animated: true });
    loading.appendChild(spinner);
    const text = document.createElement("span");
    text.textContent = Util.i18nGetMessage("ai_thinking");
    const dots = document.createElement("span");
    loading.appendChild(text);
    loading.appendChild(dots);
    let dotCount = 0;
    V.timeouts.aidots = setInterval(() => {
      dots.textContent = ".".repeat(dotCount);
      dotCount = (dotCount + 1) % 4;
    }, (dotCount * 1000) + 800);
    V.DOM["#ai-dialog-output"].appendChild(loading);
    // Scroll output to bottom
    AI.#scrollOutput();
    // Prepare output area for AI response
    const output = document.createElement("div");
    output.className = "ai-dialog-output-ai";
    V.DOM["#ai-dialog-input-send"].dataset.display = "none";
    V.DOM["#ai-dialog-input-cancel"].dataset.display = "";
    V.DOM["#ai-dialog-output"].appendChild(output);
    // Create abort controller for cancellation
    AI.#abortController = new AbortController();
    try {
      // The prompt to actually send to the AI (systemPrompt is the real prompt for hidden context prompts)
      const promptText = systemPrompt || userPrompt;
      const stream = AI.#session.promptStreaming(promptText, { signal: AI.#abortController.signal });
      for await (const chunk of stream) {
        // If we want the thinking loading to go away as soon as it starts outputting a message, need to optimize this better though. Commented out for now.
        // clearInterval(V.timeouts.aidots);
        // loading?.remove();
        output.innerText += chunk;
        AI.#scrollOutput();
      }
    } catch (e) {
      if (e.name === "AbortError") {
        output.innerText += "\n" + "[" + Util.i18nGetMessage("ai_cancelled") + "]";
      } else {
        console.log("AI.chat() - Error:", e);
        output.innerText += "\n[" + Util.i18nGetMessage("ai_error") + ": " + (e.message || "Unknown error") + "]";
      }
    }
    // Clean up
    clearInterval(V.timeouts.aidots);
    loading.remove();
    V.DOM["#ai-dialog-input-send"].dataset.display = "";
    V.DOM["#ai-dialog-input-cancel"].dataset.display = "none";
    AI.#abortController = undefined;
    AI.#busy = false;
    AI.#scrollOutput();
  }

  /**
   * Cancels the current AI response stream.
   */
  static #cancel() {
    if (AI.#abortController) {
      AI.#abortController.abort();
    }
  }

  /**
   * Displays a system/info message in the AI dialog output area.
   *
   * @param {string} text - The message text to display
   * @param {string} type - The message type (info, error, etc.)
   */
  static #message(text, type = "info") {
    if (!text) { return; }
    const message = document.createElement("div");
    message.className = `ai-dialog-output-message ${type}`;
    message.innerText = text;
    V.DOM["#ai-dialog-output"]?.appendChild(message);
    AI.#scrollOutput();
  }

  /**
   * Scrolls the AI dialog output area to the bottom.
   */
  static #scrollOutput() {
    const output = V.DOM["#ai-dialog-output"];
    if (output) {
      output.scrollTop = output.scrollHeight;
    }
  }

}