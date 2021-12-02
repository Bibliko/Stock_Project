/**
 * @description Compare 2 floats
 * @returns {Number} first < second: -1; first > second: 1; first === second: 0
 * @param {Number} firstNumber
 * @param {Number} secondNumber
 * @param {Number} precision
 */
const compareFloat = (firstNumber, secondNumber, precision=2) => {
  if (
    typeof firstNumber !== "number" ||
    typeof firstNumber !== "number"
  ) return;

  const base = 10 ** precision;
  firstNumber = Math.round(firstNumber * base)
  secondNumber = Math.round(secondNumber * base)

  if (firstNumber < secondNumber) return -1;
  if (firstNumber > secondNumber) return 1;
  return 0;
};

module.exports = {
  compareFloat
};
