/** @typedef {Object} ColorSectionData - Formatted display data
 * @property {string} key - The ID key
 * @property {string} title - The group of the colors
 * @property {ColorData[]} cssVars - The CSS variables that define the colors within the group
 */
/**
 * @typedef {Object} ColorData
 * @property {string} key - The ID key
 * @property {string} cssVar - Name of the CSS Property
 * @property {string} classes - The classes to apply to the element
 * @property {string} hexColor - The HEX color
 * @property {string} rgbColor - The RGB color
 * @property {string | undefined} style - The CSS style to apply to the element
 */

/**
 * @typedef {Object} ColorType
 * @property {string} title - The group of the colors
 * @property {string[]} cssVars - The CSS variables that define the colors within the group
 */