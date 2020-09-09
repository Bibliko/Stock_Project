import shortNumber from "short-number";

export const numberWithCommas = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const shortenNumber = (number) => {
  return shortNumber(parseFloat(number));
};

export default {
  numberWithCommas,
  shortenNumber,
};
