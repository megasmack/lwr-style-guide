import Toast from 'lightning/toast';
import ToastContainer from 'lightning/toastContainer';
import { LightningElement } from 'lwc';
import ButtonsPage from './_buttons.html';
import ColorsPage from './_colors.html';
import FormPage from './_form-fields.html';
import TabsPage from './_tabs.html';
import TypographyPage from './_typography.html';
import { COLUMN_SIZE_CLASSES, DXP_COLORS, NUM_OF_TABS } from './constants';

export default class SmsStyleGuide extends LightningElement {

  // --- Private Properties ---

  styleHooks = [];
  currentPage = 'buttons';
  pagesData = [
    { label: 'Buttons', value: 'buttons' },
    { label: 'Colors', value: 'colors' },
    { label: 'Form Fields', value: 'form' },
    { label: 'Tabs', value: 'tabs' },
    { label: 'Typography', value: 'typography' },
  ];
  colorObservers = [];
  colorsMapped = false;

  // --- Lifecycle Hooks ---

  connectedCallback() {
    const toastContainer = ToastContainer.instance();
    toastContainer.maxToasts = 5;
    toastContainer.toastPosition = 'top-right';
  }

  render() {
    switch (this.currentPage) {
      case 'colors':
        return ColorsPage;
      case 'form':
        return FormPage;
      case 'tabs':
        return TabsPage;
      case 'typography':
        return TypographyPage;
      default:
        return ButtonsPage;
    }
  }

  renderedCallback() {
    if (this.currentPage === 'colors' && !this.colorsMapped) {
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
      const cssVarIndex = cssVarLength / 2 >= 1 ? cssVarLength / 2 : cssVarLength;
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
              hexColor: color?.startsWith('#') ? color : this.rgbToHex(color),
              rgbColor: color?.startsWith('rgb') ? color : this.hexToRgb(color),
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
   * @param cssVar
   * @returns {string}
   */
  getColor(cssVar) {
    // eslint-disable-next-line @lwc/lwc/no-document-query
    const el = this.refs.colors;
    if (el && cssVar) {
      return getComputedStyle(el).getPropertyValue(cssVar);
    }
    return '';
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
    return result ? `rgb(${r}, ${g}, ${b})` : '';
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
          '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)
        );
      }
      return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
    }
    return '';
  }

  showToast(label, message, variant = 'info', mode = 'sticky') {
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
      content: `Tab Content ${i}`,
    }));
  }

  get pages() {
    const baseClass = 'slds-tabs_default__item';
    const activeClass = 'slds-is-active';
    return this.pagesData.map((page) => {
      return {
        ...page,
        classes:
          page.value === this.currentPage
            ? `${baseClass} ${activeClass}`
            : baseClass,
        active: page.value === this.currentPage,
        tabIndex: page.value === this.currentPage ? -1 : 0
      };
    });
  }

  // --- Event Handlers ---

  handleCopyCode(event) {
    const { color } = event.target.dataset;
    this.showToast('Copied to Clipboard', '', 'success', 'pester');
    navigator.clipboard
      .writeText(color)
      .then(() => {
        this.showToast('Copied to Clipboard', '', 'success', 'pester');
      })
      .catch((error) => {
        console.error('Failed to copy', error);
      });
  }

  handleTabClick(event) {
    this.currentPage = event.target.dataset.key;
  }
}