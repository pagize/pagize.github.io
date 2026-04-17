/*!
 * Stats
 * @copyright (c) 2020 Sixcious
 * @license https://github.com/sixcious/shr/blob/main/LICENSE
 */

/**
 * Stats handles all business logic involving validating, updating, and calculating stats.
 * Important: Stats is included in both the Background and Content Script to avoid waking up the Background and to allow the Options to use it.
 */
class Stats {

  /**
   * Validates and checks that the stats are valid and returns them, or a 0'd out stats object if found to be invalid.
   *
   * @param {Object} stats - the stats object
   * @param {string} statsSignature - the existing signature of the stats object
   * @returns {{Object, boolean}} the stats object and validated boolean
   */
  static async validateStats(stats, statsSignature) {
    const calculatedSignature = await Stats.calculateSignature(stats);
    const valid = statsSignature === calculatedSignature;
    if (!valid) {
      let items;
      // Important: Stats could be running in the context of the Background or Content Script
      if (typeof Storagify !== "undefined") {
        items = await Storagify.getStorageDefaultValues();
      } else {
        items = await Promisify.runtimeSendMessage({sender: "contentscript", receiver: "background", greeting: "getSDV"});
      }
      await Promisify.storageSet({"stats": items.stats, "statsSignature": items.statsSignature});
      stats = items.stats;
      statsSignature = items.statsSignature;
    }
    console.log("Stats.validateStats() - valid=" + valid + ", stats=" + JSON.stringify(stats) + ", statsSignature=" + statsSignature + ", calculatedSignature=" + calculatedSignature);
    return { stats, statsSignature, valid };
  }

  /**
   * Updates and sets the new stats object into storage after performing an action.
   *
   * @param {Object} instance - the instance to update the stats values from
   * @param {Object} extra - (optional), if needed, an extra object containing additional values for statistics (e.g. the page elements for Infy Scroll or the downloads for Downloadyze) (optional)
   */
  static async updateStats(instance, extra) {
    try {
      // We always get the stats fresh from storage and then validate them before writing to storage
      const items = await Promisify.storageGet(["stats", "statsSignature"]);
      // Note the parenthesis are required, as we are awaiting the return object, not the property
      const validated = (await Stats.validateStats(items.stats, items.statsSignature));
      const stats = validated.stats;
      let statsSignature = validated.statsSignature;
      // We only want to increase the actions stat if the app is in the right mode (e.g. URLI can't be passing in an extra (toolkitInstance) and Downloadyze has to be in multi page mode)
      if ((V.APP === "url-incrementer" && !extra?.toolkitEnabled) || (V.APP === "infy-scroll") || (V.APP === "downloadyze" && instance.mode === "multi")) {
        // Need this for apps like URLI which support reverse actions like decrement and prev to make them count
        const action = instance.action === "decrement" ? "increment" : instance.action === "prev" ? "next" : instance.action;
        stats.actions[action] += 1;
      }
      switch (V.APP) {
        case "url-incrementer":
          if (extra?.toolkitEnabled) {
            stats.toolkits[extra.toolkitTool] += 1;
          }
          break;
        case "infy-scroll":
          stats.appends[instance.append] += 1;
          // Elements is debatable; for Element/AJAX we use the page elements length (children if length is 1), we count None as 0 elements, and Page/Iframe/Media as just 1 element
          stats.elements[instance.append] += ["element", "ajax"].includes(instance.append) && typeof Elementify !== "undefined" ? Elementify.getPageElementsLength(extra, "effective") : instance.append === "none" ? 0 : 1;
          break;
        case "downloadyze":
          // Reminder: Downloadyze uses one instance in tabs mode, so we add all the tabs at once for this stat increment
          stats.modes[instance.mode] += instance.mode === "tabs" ? instance.downloadTabsQuantity : 1;
          if (!Util.isEmptyArray(extra)) {
            for (const download of extra) {
              stats.downloads[download.type || "other"] += 1;
            }
          }
          break;
      }
      statsSignature = await Stats.calculateSignature(stats);
      await Promisify.storageSet({stats: stats, statsSignature: statsSignature});
      console.log("Stats.updateStats() - after updating, stats=" + JSON.stringify(stats));
    } catch (e) {
      console.log("Stats.updateStats() - Error updating stats, Error:");
      console.log(e);
    }
  }

  /**
   * Calculates the signature value for the stats object.
   *
   * @param {Object} stats - the stats object
   * @returns {string} the computed signature of the stats object
   */
  static async calculateSignature(stats) {
    // TODO: Ensure JSON.stringify(object) is always the same result no matter what the object's keys order is
    // For example, it sometimes may be insertion order or alphabetical order of keys, we always alphabetize the initial default values in Storagify
    const signature = await Cryptography.sign(JSON.stringify(stats));
    console.log("Stats.calculateSignature() - stats, signature=" + signature);
    console.log(stats);
    return signature;
  }

}