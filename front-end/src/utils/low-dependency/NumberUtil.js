import shortNumber from "short-number";

export const numberWithCommas = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const shortenNumber = (number) => {
  return shortNumber(parseFloat(number));
};

export const simplifyNumber = (number) => {
  if (number > 1e12)
  	return +(number/1e12).toFixed(2) + " T";
  if (number > 1e9)
  	return +(number/1e9).toFixed(2) + " B";
  if (number > 1e6)
  	return +(number/1e6).toFixed(2) + " M";
  return +number.toFixed(2);
};

export default {
  numberWithCommas,
  shortenNumber,
  simplifyNumber,
};
