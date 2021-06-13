const {
  getAsync,
  sortedSetLengthAsync,
  sortedSetAddAsync,
  sortedSetRemoveAsync,
  sortedSetGetRangeByScoreAsync,
  setAddAsync,
  setRemoveAsync,
} = require("../../redis/redis-client");
const { parseCachedShareQuote } = require("../low-dependency/ParserUtil");
const { proceedTransaction } = require("../top-layer/UserUtil");
const {
  pendingCompaniesSet,
  pendingOrdersSet,
  cachedShares,
} = require("./RedisUtil");

/**
 * @description Add a single pending order of the assigned company.
 * @param transaction Pending order data.
 * Eg:
 *  {
 *    id,
 *    companyCode,
 *    limitPrice,
 *    option,
 *  }
 */
 const addSinglePendingTransaction = (transaction) => {
  return new Promise((resolve, reject) => {
    const { id, companyCode, limitPrice, option } = transaction;

    const redisKey = `${pendingOrdersSet}_${option}_${companyCode}`;
    const valueString = `${id}`;
    const weight = `${limitPrice ?? 0}`;

    setAddAsync(pendingCompaniesSet, companyCode)
      .then(() => (
        sortedSetAddAsync(
          redisKey,
          weight,
          valueString,
          )
        ))
      .then(() => resolve("Successfully added a pending order"))
      .catch((err) => reject(err));
  });
};

/**
 * @description Update a single pending order the assigned company.
 * @param transaction Pending order data.
 * Eg:
 *  {
 *    id,
 *    companyCode,
 *    limitPrice,
 *    option,
 *  }
 */
 const updateSinglePendingTransaction = (transaction) => {
  return new Promise((resolve, reject) => {
    const { id, companyCode, limitPrice, option } = transaction;

    const redisKey = `${pendingOrdersSet}_${option}_${companyCode}`;
    const valueString = `${id}`;
    const weight = `${limitPrice ?? 0}`;

    sortedSetAddAsync(
      redisKey,
      weight,
      valueString,
    )
      .then(() => resolve("Successfully updated a pending order"))
      .catch((err) => reject(err));
  });
};

/**
 * @description Delete a single pending order the assigned company.
 * @param transaction Pending order data.
 * Eg:
 *  {
 *    id,
 *    companyCode,
 *    option,
 *  }
 */
 const deleteSinglePendingTransaction = (transaction) => {
  return new Promise((resolve, reject) => {
    const { id, companyCode, option } = transaction;

    const redisKey = `${pendingOrdersSet}_${option}_${companyCode}`;
    const valueString = `${id}`;

    sortedSetRemoveAsync(redisKey, valueString)
      .then(() => sortedSetLengthAsync(redisKey))
      .then((length) => length || setRemoveAsync(pendingCompaniesSet, companyCode))
      .then(() => resolve("Successfully deleted a pending order"))
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
    const redisKeyStatus = `${cachedShares}|${companyCode}|priceStatus`;
    getAsync(redisKeyStatus)
    .then((status) => {
      const redisKey =
      status === "1"
      ? `${cachedShares}|${companyCode}|pendingSell`
      : `${cachedShares}|${companyCode}|pendingBuy`;

      const valueStringUp = status === "1" ? `${recentPrice}` : `+inf`;
      const valueStringDown = status === "1" ? `-inf` : `${recentPrice}`;

      return [
      queueGetRangeByScore(redisKey, valueStringDown, valueStringUp),
      redisKey
      ];
    })
    .then(([arrayToEmpty, redisKey]) => {
      const arrayToEmptyPromises = arrayToEmpty.map((transactionID, id) => {
        return proceedTransaction(transactionID, recentPrice)
        .then(() => queueRemove(redisKey, transactionID))
        .then((finishedPopOutOneTransaction) => {
          resolve(`Successfully pop out ${id + 1} transaction`);
        });
      });

      return Promise.all(arrayToEmptyPromises);
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
    const emptyAllCompaniesPromises = companyCodes
    .map((companyCode, id) => {
      const redisKeyQuote = `${cachedShares}|${companyCode}|quote`;

      return getAsync(redisKeyQuote)
      .then((quote) => {
        if (quote) {
          const quoteJSON = parseCachedShareQuote(quote);
          return emptyPendingTransactionsListOneCompany(
            companyCode,
            quoteJSON.price
            );
        } else reject(new Error(`No quote was found for ${companyCode}`));
      })
      .then((finishedEmptyPendingTransactionsListAllCompanies) =>
        console.log(
          "Successfully pop out all possible transactions of all companies"
          )
        );
    })
    .catch((err) => reject(err));

    return Promise.all(emptyAllCompaniesPromises);
  });
};

module.exports = {
  addSinglePendingTransaction,
  updateSinglePendingTransaction,
  deleteSinglePendingTransaction,

  emptyPendingTransactionsListOneCompany,
  emptyPendingTransactionsListAllCompanies,
};