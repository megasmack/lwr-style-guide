/**
 * Created by Steve M Schrab
 * https://github.com/megasmack/lwr-style-guide
 */

import { LightningElement, api, wire } from "lwc";
import { CurrentPageReference } from "lightning/navigation";
import Toast from "lightning/toast";
import ToastContainer from "lightning/toastContainer";
import AccordionPage from "./_accordion.html";
import ButtonsPage from "./_buttons.html";
import ColorsPage from "./_colors.html";
import FormPage from "./_form-fields.html";
import ToastsPage from "./_toasts.html";
import TabsPage from "./_tabs.html";
import TypographyPage from "./_typography.html";
import CustomPage from "./_slot.html";
import { COLUMN_SIZE_CLASSES, DXP_COLORS, NUM_OF_TABS } from "./constants";

/**
 * @slot CustomTitle
 * @slot CustomContent
 */
export default class SmsStyleGuide extends LightningElement {
  // --- Public Properties ---

  @api startingPage = "accordion";
  @api addCustom = false;

  // --- Private Properties ---

  styleHooks = [];
  pagesData = [
    { label: "Accordion", value: "accordion" },
    { label: "Buttons", value: "buttons" },
    { label: "Colors", value: "colors" },
    { label: "Form Fields", value: "form" },
    { label: "Tabs", value: "tabs" },
    { label: "Toasts", value: "toasts" },
    { label: "Typography", value: "typography" },
    { label: "Custom", value: "custom" }
  ];
  currentPage;
  colorsMapped = false;
  publishedState;

  radioValue = "option1";

  radioOptions = [
    { label: "Sales", value: "option1" },
    { label: "Force", value: "option2" }
  ];

  typographySample = "The quick brown fox jumps over the lazy dog.";

  // --- Wire Methods ---

  @wire(CurrentPageReference)
  setCurrentPageReference(currentPageReference) {
    const app = currentPageReference?.state?.app;
    const { hash } = window.location;
    const page = hash?.slice(1);
    if (app === "commeditor") {
      this.publishedState = "Draft";
    } else {
      this.publishedState = "Live";
    }
    if (page && this.pagesData.some((h) => h.value === page)) {
      this.currentPage = page;
    }
  }

  // --- Lifecycle Hooks ---

  connectedCallback() {
    this.currentPage = this.startingPage;
    const toastContainer = ToastContainer.instance();
    toastContainer.maxToasts = 5;
    toastContainer.toastPosition = "top-right";
  }

  render() {
    switch (this.currentPage) {
      case "accordion":
        return AccordionPage;
      case "colors":
        return ColorsPage;
      case "form":
        return FormPage;
      case "toasts":
        return ToastsPage;
      case "tabs":
        return TabsPage;
      case "typography":
        return TypographyPage;
      case "custom":
        return CustomPage;
      default:
        return ButtonsPage;
    }
  }

  renderedCallback() {
    if (this.currentPage === "colors" && !this.colorsMapped) {
      this.styleHooks = this.mapColors(DXP_COLORS);
      this.colorsMapped = true;
    } else {
      this.colorsMapped = false;
    }
  }

  // --- Private Methods ---

  /**
   * Maps properties for each color.
   * @param {ColorType[]} colors
   * @returns {ColorSectionData[]}
   */
  mapColors(colors) {
    return colors.map((section, idx) => {
      const cssVarLength = section.cssVars.length;
      const cssVarIndex =
        cssVarLength / 2 >= 1 ? cssVarLength / 2 : cssVarLength;
      const cssGroup1 = section.cssVars.slice(0, cssVarIndex);
      const cssGroup2 = section.cssVars.slice(cssVarIndex, cssVarLength);
      const cssGroups = [cssGroup1, cssGroup2];
      return {
        title: section.title,
        key: `sms-style-guide_section-${idx}`,
        cssVars: cssGroups.map((cssGroup, i) => {
          return cssGroup.map((cssVar) => {
            const color = this.getColor(cssVar);
            return {
              key: `sms-style-guide_color-${i}`,
              cssVar,
              hexColor: color?.startsWith("#") ? color : this.rgbToHex(color),
              rgbColor: color?.startsWith("rgb") ? color : this.hexToRgb(color),
              classes: COLUMN_SIZE_CLASSES,
              style: color
                ? `--sms-style-guide_color: var(${cssVar})`
                : undefined
            };
          });
        })
      };
    });
  }

  /**
   * Get the HEX color from the CSS Variable.
   * @param {string} cssVar
   * @returns {string}
   */
  getColor(cssVar) {
    const el = this.refs.colors;
    if (el && cssVar) {
      return getComputedStyle(el).getPropertyValue(cssVar);
    }
    return "";
  }

  /**
   * Convert HEX to RGB.
   * @param {string} hex
   * @returns {string}
   */
  hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => {
      return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return result ? `rgb(${r}, ${g}, ${b})` : "";
  }

  /**
   * Convert RGB to HEX.
   * @param {string} rgb
   * @returns {string}
   */
  rgbToHex(rgb) {
    const regex = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)/;
    const match = rgb.match(regex);
    if (match) {
      const r = parseInt(match[1], 10);
      const g = parseInt(match[2], 10);
      const b = parseInt(match[3], 10);
      const a = match[4] ? parseFloat(match[4]) : undefined;
      if (a) {
        // TODO: Handle alpha channel
        return (
          "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)
        );
      }
      return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
    }
    return "";
  }

  showToast(label, message, variant = "info", mode = "sticky") {
    Toast.show(
      {
        label,
        message,
        mode,
        variant
      },
      this
    );
  }

  // --- Getters ---

  get tabOverflow() {
    const tabArray = [...Array(NUM_OF_TABS).keys()];
    return tabArray.map((_t, i) => ({
      value: `${i}`,
      label: `Item ${i}`,
      content: `Tab Content ${i}`
    }));
  }

  get pages() {
    const baseClass = "slds-tabs_default__item";
    const activeClass = "slds-is-active";
    const hasCustom = this.addCustom || this.startingPage === "custom";
    return this.pagesData
      .map((page) => ({
        ...page,
        classes:
          page.value === this.currentPage
            ? `${baseClass} ${activeClass}`
            : baseClass,
        active: page.value === this.currentPage,
        tabIndex: page.value === this.currentPage ? -1 : 0
      }))
      .filter((page) => !(page.value === "custom" && !hasCustom));
  }

  get isLive() {
    return this.publishedState === "Live";
  }

  // --- Event Handlers ---

  handleCopyCode(event) {
    const { currentTarget } = event;
    const { code } = currentTarget.dataset;
    if (code && this.isLive) {
      navigator.clipboard
        .writeText(code)
        .then(() => {
          this.showToast("Copied to Clipboard", "", "success", "pester");
        })
        .catch((error) => {
          console.error("Failed to copy", error);
        });
    } else if (!this.isLive) {
      // The iframe in builder does not give us access to the clipboard.
      // So we will select the text and let the user copy it.
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(currentTarget);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      console.error("Failed to copy");
    }
  }

  handleTabClick(event) {
    event.preventDefault();
    event.stopPropagation();
    this.currentPage = event.target.dataset.key;
    window.location.hash = this.currentPage;
  }
}
