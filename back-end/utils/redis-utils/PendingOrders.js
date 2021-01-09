const {
  queueAdd,
  getAsync,
  queueRemove,
  queueGetRangeByScore
} = require("../../redis/redis-client");
const { parseCachedShareQuote } = require("../low-dependency/ParserUtil");

/**
 *
 * @description Add a single pending order into pending queue of the assigned company.
 * @param userTransactionJSON An unit pending order of a user.
 * Eg:
 *  {
 *    id,
 *    companyCode,
 *    limitPrice,
 *    isTypeBuy
 *  }
 */
const updateSingleCachedPendingOrder = (userTransactionJSON) => {
  return new Promise((resolve, reject) => {
    const { id, limitPrice, isTypeBuy, companyCode } = userTransactionJSON;

    // const valueString = `${id}|${limitPrice}`;
    const valueString = `${id}`;
    const weight = `${limitPrice}`;

    const redisKey = isTypeBuy
      ? `cachedShares|${companyCode}|pendingBuy`
      : `cachedShares|${companyCode}|pendingSell`;

    queueAdd(redisKey, weight, valueString)
      .then((finishedAddingAPendingOrder) =>
        resolve("Successfully add a pending order")
      )
      .catch((err) => reject(err));
  });
};

/**
 * @description Clear all possible pending transactions in the pending queue of an input company
 * @param companyCodes The company to clear pending queue
 * @param recentPrice The current price of that company's stock
 */
const emptyPendingTransactionsListOneCompany = (companyCode, recentPrice) => {
  return new Promise((resolve, reject) => {
    const redisKeyStatus = `cachedShares|${companyCode}|priceStatus`;
    getAsync(redisKeyStatus)
      .then((status) => {
        const redisKey =
          status === "1"
            ? `cachedShares|${companyCode}|pendingSell`
            : `cachedShares|${companyCode}|pendingBuy`;

        const valueStringUp = `${recentPrice}`;
        const valueStringDown = `(`;

        return [
          queueGetRangeByScore(redisKey, valueStringDown, valueStringUp),
          redisKey
        ];
      })
      .then(([arrayToEmpty, redisKey]) => {
        arrayToEmpty
          .forEach((transaction, id) => {
            // Buy or sell... -> then
            queueRemove(redisKey, transaction).then(
              (finishedPopOutOneTransaction) => {
                resolve(`Successfully pop out ${id + 1} transaction`);
              }
            );
          })
          .catch((err) => reject(err));
      })
      .then((finishedPopAllPossibleTransactions) =>
        resolve(
          `Successfully pop out all possible transactions of ${companyCode}`
        )
      )
      .catch((err) => reject(err));
  });
};

/**
 * @description Clear all possible pending transactions in the whole server
 * @param companyCodes The list of companies that will be processed
 */
const emptyPendingTransactionsListAllCompanies = (companyCodes) => {
  return new Promise((resolve, reject) => {
    companyCodes
      .forEach((companyCode) => {
        const redisKeyQuote = `cachedShares|${companyCode}|quote`;

        getAsync(redisKeyQuote)
          .then((quote) => {
            if (quote) return parseCachedShareQuote(quote);
            else reject(new Error(`No quote was found for ${companyCode}`));
          })
          .then((quoteJSON) => {
            if (quoteJSON)
              emptyPendingTransactionsListOneCompany(
                companyCode,
                quoteJSON.price
              );
          })
          .catch((err) => reject(err));
      })
      .catch((err) => reject(err));
  });
};

module.exports = {
  updateSingleCachedPendingOrder,

  emptyPendingTransactionsListOneCompany,
  emptyPendingTransactionsListAllCompanies
};
