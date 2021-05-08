export const capitalizeString = (string) => {
  const stringCapitalized =
    string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  return stringCapitalized;
};

export default {
  capitalizeString,
};
