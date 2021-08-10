export const numberWithCommas = (number) => {
  if (typeof number !== "number") return number;
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * @description Round number
 * @returns {String} roundedNumber
 * @param {Number} number
 */
export const simplifyNumber = (number) => {
  if (typeof number !== "number") return number;

  if (number >= 1e12) return +(number / 1e12).toFixed(2) + "T";

  if (number >= 1e9) return +(number / 1e9).toFixed(2) + "B";

  if (number >= 1e6) return +(number / 1e6).toFixed(2) + "M";

  if (number >= 1e3) return +(number / 1e3).toFixed(2) + "K";

  return +number.toFixed(2);
};

export const roundNumber = (number, decimalPlaces = 0) => {
  if (typeof number !== "number") return number;
  decimalPlaces = 10 ** decimalPlaces;
  return Math.round((number + Number.EPSILON) * decimalPlaces) / decimalPlaces;
}

/**
 * @param {string} string Test if string contains only numbers
 */
export const isNum = (string) => {
  return /^\d+$/.test(string);
};

/**
 * @description Check if a string is a positive number
 * @returns {Boolean}
 * @param {String} str
 */
export const isNumeric = (str) => {
  if (typeof str != "string") return false // we only process strings!
  return (
    !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str)) && // ...and ensure strings of whitespace fail
    parseFloat(str) > 0
  );
};

export default {
  numberWithCommas,
  simplifyNumber,
  roundNumber,
  isNum,
  isNumeric,
};
