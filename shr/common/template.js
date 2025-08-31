/**
 * Template
 * @copyright (c) 2020 Sixcious
 * @license https://github.com/sixcious/shr/blob/main/LICENSE
 */
import{html,nothing,render}from"/lib/lit/lit.all.mjs";class TemplateElement extends HTMLElement{slotChildren=!1;constructor(){super(),[...this.attributes].forEach(t=>this[t.nodeName]=t.nodeValue),this.class=this.hasAttribute("class")?" "+this.class:"",this.tooltip=this.hasAttribute("tooltip")?this.tooltip||this.id+"-tooltip":void 0}connectedCallback(){if(render(this.template(),this),this.slotChildren){const t=[...this.children];for(let e=0;e<t.length-1;e++){t[e].dataset.slot=this.id}}this.replaceWith(...this.children)}template(){return html``}}class MDButton extends TemplateElement{template(){return this.href?html`
      <a class="mdc-button mdc-button--${this.type||"raised"}${this.class}" id="${this.id}-button" href="${this.href}" target="${this.target?nothing:"_blank"}" data-tooltip="${this.tooltip??nothing}">
        <svg data-lit-remove="${this.hasAttribute("icon")?nothing:""}">
          <use href="/lib/${this.library??"fontawesome"}/${this.icon??"solid.svg#asterisk"}"></use>
        </svg>
        <span class="mdc-button__ripple"></span>
        <span class="mdc-button__label" data-i18n="${this.i18n||this.id+"-button"}">${this.id}</span>
      </a>
    `:html`
      <button class="mdc-button mdc-button--${this.type||"raised"}${this.class}" id="${this.id}-button" data-tooltip="${this.tooltip??nothing}">
        <svg data-lit-remove="${this.hasAttribute("icon")?nothing:""}">
          <use href="/lib/${this.library??"fontawesome"}/${this.icon??"solid.svg#asterisk"}"></use>
        </svg>
        <span class="mdc-button__ripple"></span>
        <span class="mdc-button__label" data-i18n="${this.i18n||this.id+"-button"}"></span>
      </button>
    `}}class MDCheckbox extends TemplateElement{template(){const t=this.hasAttribute("table-header"),e=this.hasAttribute("table-content");return html`
      <div id="${this.id?this.id+"-form-field":nothing}"
           data-slot="${this.dataset.slot??nothing}"
           class="${t||e?nothing:"mdc-form-field"+this.class}"
           data-tooltip="${this.tooltip??nothing}">
        <div class="mdc-checkbox${t?" mdc-data-table__header-row-checkbox":""}${e?" mdc-data-table__row-checkbox":""}" id="${this.id?this.id+"-checkbox":nothing}">
          <input type="checkbox" class="mdc-checkbox__native-control" id="${this.id?this.id+"-input":nothing}" aria-label="${t?"Checkbox for header row selection":nothing}" name="${t||e?"checkbox":nothing}" value="${this.value??nothing}" data-value="${this.dataset.value??nothing}">
          <div class="mdc-checkbox__background">
            <svg class="mdc-checkbox__checkmark" viewBox="0 0 24 24">
              <path class="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59">
            </svg>
            <div class="${t||e?"mdc-checkbox__mixedmark":""}"></div>
          </div>
          <div class="mdc-checkbox__ripple"></div>
        </div>
        <label for="${this.id?this.id+"-input":nothing}" data-i18n="${this.i18n?this.i18n:this.id?this.id+"-checkbox":nothing}" data-lit-remove="${this.id?nothing:""}"></label>
      </div>
    `}}class MDChip extends TemplateElement{template(){return html`
      <div class="mdc-chip${this.class}" role="row" id="${this.id}-chip" data-slot="${this.dataset.slot}" data-value="${this.value}" data-tooltip="${this.tooltip??nothing}">
        <div class="mdc-chip__ripple"></div>
        <svg class="mdc-chip__icon mdc-chip__icon--leading"><use href="/lib/fontawesome/solid.svg#circle-check"></use></svg>
        <span role="gridcell">
          <span role="button" tabindex="0" class="mdc-chip__primary-action">
            <span class="mdc-chip__text" data-i18n="${this.i18n||this.id+"-chip"}"></span>
          </span>
        </span>
      </div>
    `}}class MDChipSet extends TemplateElement{slotChildren=!0;template(){return html`
      <div class="chip-set-container${this.class}" id="${this.id}-chip-set-container">
        <span class="chip-set-label" id="${this.id}-chip-set-label" data-i18n="${this.i18n||this.id+"-chip-set-label"}" data-tooltip-without-underline="${this.tooltip??nothing}"></span>
        <div class="mdc-chip-set mdc-chip-set--choice" role="grid" id="${this.id}-chip-set">
          <slot id="${this.id}-slot"></slot>
        </div>
      </div>
    `}}class MDDataTable extends TemplateElement{template(){return html`
      <div class="mdc-data-table${this.class}" id="${this.id}-data-table">
        <table class="mdc-data-table__table" aria-label="Data Table">
          <thead id="${this.id}-header-slot">
            <tr class="mdc-data-table__header-row" data-slot-remove></tr>
          </thead>
          <tbody class="mdc-data-table__content" id="${this.id}-content-slot">
            <tr class="mdc-data-table__row" data-slot-remove></tr>
          </tbody>
        </table>
      </div>
    `}}class MDDataTableRow extends TemplateElement{slotChildren=!0;template(){return html`
      <tr class="mdc-data-table__${this.dataset.slot.endsWith("-header")?"header-row":"row"}${this.class}"
          id="${this.id}-slot"
          data-template="${this.dataset.template??nothing}"
          data-slot="${this.dataset.slot??nothing}"
          data-remove-id="${this.hasAttribute("data-remove-id")?"":nothing}">
      </tr>
    `}}class MDDataTableCell extends TemplateElement{slotChildren=!0;template(){return this.hasAttribute("header")?html`
      <th class="mdc-data-table__header-cell${this.class}${this.hasAttribute("checkbox")?" checkbox-cell mdc-data-table__header-cell--checkbox":""}"
          id="${this.id??nothing}"
          data-i18n="${this.i18n??nothing}"
          data-slot="${this.dataset.slot??nothing}"
          data-remove-id="${this.hasAttribute("data-remove-id")?"":nothing}"
          role="columnheader" scope="col">
        <slot id="${this.id}-slot"></slot>
      </th>
      `:html`
      <td class="mdc-data-table__cell${this.class}${this.hasAttribute("checkbox")?" checkbox-cell mdc-data-table__cell--checkbox":""}"
          id="${this.id??nothing}"
          data-i18n="${this.i18n??nothing}"
          data-slot="${this.dataset.slot??nothing}"
          data-remove-id="${this.hasAttribute("data-remove-id")?"":nothing}">
        <slot id="${this.id}-slot"></slot>
      </td>
    `}}class MDDialog extends TemplateElement{template(){return html`
      <div class="mdc-dialog${this.class}" role="alertdialog" aria-modal="true" aria-labelledby="${this.id}" aria-describedby="${this.id}-dialog-content" data-no-focus="${this["no-focus"]??nothing}" id="${this.id}">
        <div class="mdc-dialog__container">
          <div class="mdc-dialog__surface">
            <h2 class="mdc-dialog__title" id="${this.id}-title" data-i18n="${this.title?nothing:""}">${this.title??nothing}</h2>
            <div class="mdc-dialog__content" id="${this.id}-content">
              <slot id="${this.id}-content-slot"></slot>
            </div>
            <footer class="mdc-dialog__actions" data-lit-remove="${this.hasAttribute("no-actions")?"":nothing}">
              <slot id="${this.id}-actions-slot"></slot>
            </footer>
          </div>
        </div>
        <div class="mdc-dialog__scrim"></div>
      </div>
    `}}class MDDialogButton extends TemplateElement{template(){return this.hasAttribute("href")?html`
      <a type="button" class="mdc-button mdc-dialog__button${this.class}" id="${this.id??nothing}" href="${this.href}" target="_blank">
        <span class="mdc-button__label" data-i18n="${this.i18n||this.id}"></span>
      </a>
    `:html`
      <button type="button" class="mdc-button mdc-dialog__button${this.class}" data-mdc-dialog-action="${"nothing"===this.action?nothing:this.hasAttribute("action")?this.action:"close"}" id="${this.id??nothing}">
        <span class="mdc-button__label" data-i18n="${this.i18n||this.id}"></span>
      </button>
    `}}class MDDrawer extends TemplateElement{template(){return html`
      <div class="drawer-frame-root${this.class}">
        <aside id="app-drawer" class="mdc-drawer mdc-drawer--dismissible">
          <div class="mdc-drawer__header">
            <h3 class="mdc-drawer__title"><span id="name" data-i18n></span></h3>
          </div>
          <div class="mdc-drawer__content">
            <slot id="drawer-content-slot"></slot>
          </div>
          <div id="drawer-button" class="mdc-icon-button" aria-label="Toggle Menu">
            <svg id="drawer-button-icon" class="mdc-icon-button__icon"><use href="/lib/fontawesome/solid.svg#bars"></use></svg>
          </div>
          <div id="drawer-collapsed-app-icon-div">
            <svg id="drawer-collapsed-app-icon"><use href="/app/media/symbol.svg#icon"></use></svg>
          </div>
        </aside>
        <div id="app-content" class="mdc-drawer-app-content">
          <slot id="app-content-slot"></slot>
        </div>
      </div>
    `}}class MDFab extends TemplateElement{template(){return html`
      <div class="fab-div" data-tooltip="${this.id}-fab-tooltip" data-tooltip-placement="${this.hasAttribute("tooltip-placement")?this.getAttribute("tooltip-placement"):nothing}" id="${this.id}-fab-div">
        <input type="checkbox" class="display-none" id="${this.id}-input">
        <button class="mdc-fab mdc-fab--mini mdc-ripple-upgraded${this.class}" aria-label="Label" id="${this.id}-fab">
          <div class="mdc-fab__ripple"></div>
          <svg class="mdc-fab--icon" id="${this.id}-button-icon"><use href="/lib/fontawesome/${this.icon}">></use></svg>
        </button>
      </div>
    `}}class MDLinearProgress extends TemplateElement{template(){return html`
      <div role="progressbar" class="mdc-linear-progress${this.class}" aria-label="Progress Bar" aria-valuemin="0" aria-valuemax="1" aria-valuenow="0" id="${this.id}-linear-progress">
        <div class="mdc-linear-progress__buffer">
          <div class="mdc-linear-progress__buffer-bar"></div>
          <div class="mdc-linear-progress__buffer-dots"></div>
        </div>
        <div class="mdc-linear-progress__bar mdc-linear-progress__primary-bar">
          <span class="mdc-linear-progress__bar-inner"></span>
        </div>
        <div class="mdc-linear-progress__bar mdc-linear-progress__secondary-bar">
          <span class="mdc-linear-progress__bar-inner"></span>
        </div>
      </div>
    `}}class MDListGroup extends TemplateElement{slotChildren=!0;template(){return html`
    <div class="mdc-list-group${this.class}" id="${this.id}">
      <h3 class="mdc-list-group__subheader" id="${this.id}-subheader" data-i18n></h3>
      <slot id="${this.id}-slot"></slot>
    </div>
    `}}class MDList extends TemplateElement{slotChildren=!0;template(){return html`
      <ul class="mdc-list${this.class}" id="${this.id}" data-slot="${this.dataset.slot}">
        <slot id="${this.id}-slot"></slot>
      </ul>
    `}}class MDListItem extends TemplateElement{template(){const t=this.getAttribute("icon")?.startsWith("/");return html`
      <li id="${this.id}-list-item" class="mdc-list-item${this.class}" data-value="${this.value??nothing}" data-slot="${this.dataset.slot}">
        <svg class="mdc-list-item__graphic"><use href="${t?this.icon:"/lib/fontawesome/"+this.icon}"></use></svg>
        <span class="mdc-list-item__text" id="${this.id}-label" data-i18n="${this.i18n||this.id+"-label"}"></span>
        <div class="drawer-collapsed-tooltip" data-tooltip="${this.id}-label" data-lit-remove="${this.hasAttribute("no-collapse")?"":nothing}">&nbsp;</div>
      </li>
    `}}class MDRadio extends TemplateElement{template(){return this.id=this.id||this.name+"-"+this.value,this.tooltip=this.tooltip?this.id+"-tooltip":void 0,html`
      <div id="${this.id?this.id+"-form-field":nothing}" class="mdc-form-field${this.class}" data-tooltip="${this.tooltip??nothing}">
        <div class="mdc-radio" id="${this.id}-radio">
          <input class="mdc-radio__native-control" type="radio" id="${this.id}-input" name="${this.name}" value="${this.value}">
          <div class="mdc-radio__background">
            <div class="mdc-radio__outer-circle"></div>
            <div class="mdc-radio__inner-circle"></div>
          </div>
          <div class="mdc-radio__ripple"></div>
        </div>
        <label for="${this.id}-input">
          <img src="/app/media/${this.img??nothing}" alt="" width="" height="" data-lit-remove="x">
          <span data-i18n="${this.i18n||this.id+"-radio"}"></span>
        </label>
      </div>
    `}}class MDSelect extends TemplateElement{slotChildren=!0;template(){const t=this.hasAttribute("no-label");return html`
      <div class="mdc-select mdc-select--outlined mdc-select--no-label${this.class}" id="${this.id}-select">
        <div class="mdc-select__anchor">
          <input id="${this.id}-input" class="mdc-select__selected-text" type="text" disabled readonly>
          <i class="mdc-select__dropdown-icon"></i>
          <span class="mdc-notched-outline${t?" mdc-notched-outline--no-label":""}">
            <span class="mdc-notched-outline__leading"></span>
            <span class="mdc-notched-outline__notch" data-lit-remove="${t?"":nothing}">
              <span class="mdc-floating-label mdc-floating-label--float-above" data-i18n="${this.i18n||this.id+"-label"}"></span>
            </span>
            <span class="mdc-notched-outline__trailing"></span>
          </span>
        </div>
        <div class="mdc-select__menu mdc-menu mdc-menu-surface">
          <ul class="mdc-list" id="${this.id}-list">
            <slot id="${this.id}-slot"></slot>
          </ul>
        </div>
      </div>
    `}}class MDSelectItem extends TemplateElement{template(){return html`
      <li class="mdc-list-item${this.class}" role="option" data-value="${this.value??nothing}" data-slot="${this.dataset.slot??nothing}">
        <span class="mdc-list-item__ripple"></span>
        <span class="mdc-list-item__text" id="${this.id}-option" data-i18n="${this.textContent?nothing:""}">${this.textContent??nothing}</span>
      </li>
    `}}class MDSnackbar extends TemplateElement{template(){const t=this.hasAttribute("undo");return html`
      <div class="mdc-snackbar${this.class}" id="${this.id}-snackbar">
        <div class="mdc-snackbar__surface">
          <div class="mdc-snackbar__label" role="status" aria-live="polite">&nbsp;</div>
          <div class="mdc-snackbar__actions">
            <button id="ok-snackbar-button" type="button" class="mdc-button mdc-snackbar__action">
              <div class="mdc-button__ripple"></div>
              <span class="mdc-button__label" data-i18n="ok-button"></span>
            </button>
            <button id="undo-snackbar-button" type="button" class="mdc-button mdc-snackbar__action" data-lit-remove="${t?nothing:""}">
              <div class="mdc-button__ripple"></div>
              <span class="mdc-button__label" data-i18n="undo-button"></span>
            </button>
          </div>
        </div>
      </div>
    `}}class MDSwitch extends TemplateElement{template(){const t=this.hasAttribute("icon"),e=this.hasAttribute("smaller-label");return html`
      <div class="mdc-switch-container${this.class}">
        <svg class="mdc-switch__icon" id="${this.id}-icon" data-lit-remove="${t?nothing:""}"><use href="/lib/fontawesome/${this.icon??"solid.svg#asterisk"}"></use></svg>
        <label class="mdc-switch__label${e?" smaller-label":""}" for="${this.id}-input" id="${this.id}-label" data-i18n></label>
        <div class="mdc-switch" id=${this.id}>
          <div class="mdc-switch__track"></div>
          <div class="mdc-switch__thumb-underlay">
            <div class="mdc-switch__thumb">
              <input type="checkbox" class="mdc-switch__native-control" role="switch" id="${this.id}-input">
            </div>
          </div>
        </div>
      </div>
    `}}class MDTabBar extends TemplateElement{slotChildren=!0;template(){return html`
      <nav class="mdc-tab-bar${this.class}" role="tablist" id="${this.id}">
        <div class="mdc-tab-scroller">
          <div class="mdc-tab-scroller__scroll-area mdc-tab-scroller__scroll-area--scroll">
            <div class="mdc-tab-scroller__scroll-content">
              <slot id="${this.id}-slot"></slot>
            </div>
          </div>
        </div>
      </nav>
    `}}class MDTab extends TemplateElement{template(){const t=this.hasAttribute("active"),e=this.parentElement?.id+"-"+this.tab;return html`
      <button class="mdc-tab mdc-tab--stacked${t?" mdc-tab--active":""}${this.class}" role="tab" tabindex="${t?"0":"-1"}" aria-selected="${t?"true":nothing}" data-slot="${this.dataset.slot??nothing}" data-tab="${this.tab}">
        <span class="mdc-tab__content">
          <svg class="mdc-tab__icon" aria-hidden="true"><use href="/lib/fontawesome/${this.icon}"></use></svg>
          <span class="mdc-tab__text-label" id="${e}" data-i18n></span>
          <span class="mdc-tab-indicator${t?" mdc-tab-indicator--active":""}">
            <span class="mdc-tab-indicator__content mdc-tab-indicator__content--underline"></span>
          </span>
        </span>
        <span class="mdc-tab__ripple mdc-ripple-upgraded"></span>
      </button>
    `}}class MDTextarea extends TemplateElement{template(){return this.fullwidth=this.hasAttribute("fullwidth")?" mdc-text-field--fullwidth":"",this.spellcheck=this.hasAttribute("spellcheck")?this.getAttribute("spellcheck"):void 0,html`
      <div class="mdc-text-field mdc-text-field--textarea${this.fullwidth}${this.class}" id="${this.id}-text-field" data-extra="${this.extra??nothing}" data-tooltip="${this.tooltip??nothing}">
        <textarea class="mdc-text-field__input" aria-labelledby="${this.id}-label" id="${this.id}-textarea" readonly="${this.readonly??nothing}" spellcheck="${this.spellcheck??"false"}" data-value="${this.dataset.value??nothing}"></textarea>
        <div class="mdc-notched-outline">
          <div class="mdc-notched-outline__leading"></div>
          <div class="mdc-notched-outline__notch">
            <label class="mdc-floating-label" id="${this.id}-label" for="${this.id}-textarea" data-i18n="${this.i18n||""}"></label>
          </div>
          <div class="mdc-notched-outline__trailing"></div>
        </div>
      </div>
    `}}class MDTextField extends TemplateElement{template(){const t=this.hasAttribute("no-label");return this.spellcheck=this.hasAttribute("spellcheck")?this.getAttribute("spellcheck"):void 0,html`
      <div class="mdc-text-field mdc-text-field--outlined${this.class}" id="${this.id}-text-field" data-tooltip="${this.tooltip??nothing}">
        <input class="mdc-text-field__input" id="${this.id}-input" type="${this.type??"text"}" spellcheck="${this.spellcheck??"false"}" placeholder="${this.placeholder??nothing}" min="${this.min??nothing}" max="${this.max??nothing}" step="${this.step??nothing}" readonly="${this.readonly??nothing}" data-value="${this.dataset.value??nothing}">
        <div class="mdc-notched-outline">
          <div class="mdc-notched-outline__leading"></div>
          <div class="mdc-notched-outline__notch">
            <span class="mdc-floating-label" id="${this.id}-label" data-i18n data-lit-remove="${t?"":nothing}"></span>
          </div>
          <div class="mdc-notched-outline__trailing"></div>
        </div>
      </div>
    `}}class MDTextFieldHelperLine extends TemplateElement{slotChildren=!0;template(){return html`
      <div id="${this.id}-text-field-helper-line" class="mdc-text-field-helper-line${this.class}">
        <div class="mdc-text-field-helper-text mdc-text-field-helper-text--persistent"><span class="mdc-text-field-helper-span" data-i18n="${this.i18n||this.id}-helper-text"></span>
          <slot id="${this.id}-slot"></slot>
        </div>
      </div>
    `}}class MDIcon extends TemplateElement{id=this.hasAttribute("id")?this.id:void 0;class=this.hasAttribute("class")?this.class:void 0;href=this.hasAttribute("href")?this.href:"/lib/"+(this.library||"fontawesome")+"/"+this.icon;template(){return html`
      <svg id="${this.id??nothing}" class="${this.class??nothing}" data-value="${this.dataset.value??nothing}" data-tooltip="${this.tooltip??nothing}">
        <use id="${this.useid??nothing}" href="${this.href}"></use>
        <title id="${this.id}-title" data-i18n data-lit-remove="${this.hasAttribute("title")?nothing:""}"></title>
      </svg>
    `}}class OptionsHeader extends TemplateElement{slotChildren=!0;template(){return html`
      <header id="options-header" class="grid-row">
        <div>
          <svg id="options-header-icon"><use href="/app/media/symbol.svg#icon"></use></svg>
          <span id="name" data-i18n></span>
          <span class="special-badge" data-i18n="special-badge"></span>
          <span id="options-header-label" data-i18n="options-header"></span>
        </div>
        <div class="justify-self-end button-group">
          <div id="stats-button" class="icon-button" data-tooltip="stats-button-tooltip">
            <svg class="options-header-svg hvr-grow"><use href="/lib/fontawesome/solid.svg#ranking-star"></use></svg>
          </div>
          <div id="theme-button" class="icon-button" data-tooltip="theme-button-tooltip">
            <svg id="theme-icon" class="options-header-svg hvr-grow"><use href="/lib/feather/feather.svg#sun-moon"></use></svg>
          </div>
          <div id="feedback-button" class="icon-button" data-tooltip="feedback-button-tooltip">
            <svg id="feedback-icon" class="options-header-svg hvr-grow smaller-icon"><use href="/lib/fontawesome/regular.svg#comment-dots"></use></svg>
          </div>
          <md-button id="help-guide" type="raised" href="https://github.com/sixcious/__app__/wiki"></md-button>
          <md-button id="report-an-issue" type="outlined" href="https://github.com/sixcious/__app__/issues"></md-button>
        </div>
      </header>
    `}}class OptionsSection extends TemplateElement{slotChildren=!0;template(){return html`
      <section id="${this.id}" data-display="${this.hasAttribute("active")?"block":"none"}" data-tab-bar="options-tab-bar">
        <header>
          <svg><use href="/lib/fontawesome/${this.icon}"></use></svg>
          <span id="${this.id}-settings-header" data-i18n></span>
        </header>
        <p id="${this.id}-settings-description" data-i18n data-lit-remove="${this.hasAttribute("no-description")?"":nothing}"></p>
        <slot id="${this.id}-slot"></slot>
      </section>
    `}}class Template{static#t=(()=>{Template.#e(),Template.#s(),Template.#i()})();static#e(){for(const t of["md-data-table","md-data-table-row"]){const e=document.querySelectorAll(t);for(const t of e){let e=1;for(const s of t.children)s.id||(s.id=t.id+"-child-"+e++,s.setAttribute("data-remove-id",""))}}const t=document.querySelectorAll("md-data-table-row");for(const e of t)for(const t of e.children)t.type=e.slot.endsWith("header")?"header":"content"}static#s(){customElements.define("options-header",OptionsHeader),customElements.define("options-section",OptionsSection),customElements.define("md-button",MDButton),customElements.define("md-checkbox",MDCheckbox),customElements.define("md-chip-set",MDChipSet),customElements.define("md-chip",MDChip),customElements.define("md-fab",MDFab),customElements.define("md-data-table",MDDataTable),customElements.define("md-data-table-row",MDDataTableRow),customElements.define("md-data-table-cell",MDDataTableCell),customElements.define("md-dialog",MDDialog),customElements.define("md-dialog-button",MDDialogButton),customElements.define("md-drawer",MDDrawer),customElements.define("md-linear-progress",MDLinearProgress),customElements.define("md-list-group",MDListGroup),customElements.define("md-list",MDList),customElements.define("md-list-item",MDListItem),customElements.define("md-radio",MDRadio),customElements.define("md-select",MDSelect),customElements.define("md-select-item",MDSelectItem),customElements.define("md-snackbar",MDSnackbar),customElements.define("md-switch",MDSwitch),customElements.define("md-tab",MDTab),customElements.define("md-tab-bar",MDTabBar),customElements.define("md-textarea",MDTextarea),customElements.define("md-text-field",MDTextField),customElements.define("md-text-field-helper-line",MDTextFieldHelperLine),customElements.define("md-icon",MDIcon)}static#i(){const t=document.querySelectorAll("[data-slot]");for(const e of t){const t=document.getElementById(e.dataset.slot+"-slot");if(t)try{t.appendChild(e)}catch(t){}e.removeAttribute("data-slot")}const e=document.querySelectorAll("slot");for(const t of e)t.replaceWith(...t.children),t.remove();const s=document.querySelectorAll("[data-slot-remove],[data-lit-remove]");for(const t of s)t.remove();const i=document.querySelectorAll("[data-remove-id]");for(const t of i)t.removeAttribute("id"),t.removeAttribute("data-remove-id");const a=document.querySelectorAll("[data-template]");for(const t of a){const e=document.createElement("template");e.id=t.dataset.template,e.content.appendChild(t),document.body.appendChild(e),t.removeAttribute("id"),t.removeAttribute("data-template")}}}