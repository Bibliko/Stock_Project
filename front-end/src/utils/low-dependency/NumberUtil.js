import shortNumber from "short-number";

export const numberWithCommas = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const shortenNumber = (number) => {
  return shortNumber(parseFloat(number));
};

export const simplifyNumber = (number) => {
  if (typeof(number) !== "number") return number;
  
  if (number >= 1e12)
  	return +(number/1e12).toFixed(1) + "T";
  if (number >= 1e9)
  	return +(number/1e9).toFixed(1) + "B";
  if (number >= 1e6)
  	return +(number/1e6).toFixed(1) + "M";
  if (number >= 1e3)
    return +(number/1e3).toFixed(1) + "K";
  return +number.toFixed(1);
};

export default {
  numberWithCommas,
  shortenNumber,
  simplifyNumber,
};
