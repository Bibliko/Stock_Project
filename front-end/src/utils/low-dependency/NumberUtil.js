export const numberWithCommas = (number) => {
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

/**
 * @param {string} string Test if string contains only numbers
 */
export const isNum = (string) => {
  return /^\d+$/.test(string);
};

export default {
  numberWithCommas,
  simplifyNumber,
  isNum,
};
