const {
  getAsync,
  sortedSetLengthAsync,
  sortedSetAddAsync,
  sortedSetRemoveAsync,
  sortedSetGetRangeByScoreAsync,
  setAddAsync,
  setRemoveAsync,
  setGetAllItemsAsync,
} = require("../../redis/redis-client");
const { parseCachedShareQuote } = require("../low-dependency/ParserUtil");
const {
  SequentialPromisesWithResultsArray
} = require("../low-dependency/PromisesUtil");
const { proceedTransaction } = require("../top-layer/UserUtil");
const {
  pendingCompaniesSet,
  pendingOrdersSet,
  cachedShares,
} = require("./RedisUtil");
const {
  getSingleCachedShareInfo
} = require("./SharesInfoBank");
const {
  transactionOptionGreater,
  transactionOptionLess,
  transactionOptionDefault,
} = require("../low-dependency/PrismaConstantUtil");

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
 * @description Update a single pending order of the assigned company.
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
 * @description Delete a single pending order of the assigned company.
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
    let transactionsID;
    const options = [transactionOptionLess, transactionOptionGreater, transactionOptionDefault];

    Promise.all([
      sortedSetGetRangeByScoreAsync(
        `${pendingOrdersSet}_${transactionOptionLess}_${companyCode}`,
        recentPrice.toString(),
        "+inf"
      ),
      sortedSetGetRangeByScoreAsync(
        `${pendingOrdersSet}_${transactionOptionGreater}_${companyCode}`,
        "-inf",
        recentPrice.toString()
      ),
      sortedSetGetRangeByScoreAsync(
        `${pendingOrdersSet}_${transactionOptionDefault}_${companyCode}`,
        "-inf",
        "+inf"
      ),
    ])
      .then((transactions) => {
        transactionsID = transactions.flat();

        return Promise.allSettled(
          transactionsID.map((transactionID) => (
            proceedTransaction(transactionID, recentPrice)
          ))
        );
      })
      .then((proceedTransactionResults) => {
        const taskList = [];
        proceedTransactionResults
          .forEach((result, id) => {
            // Remove transaction from the set after being proceeded successfully
            if (result.status === "fulfilled")
              taskList.push(
                // Remove from all options' set because flattening the transactionsID array
                // loses info about option
                options.map((option) => (
                  sortedSetRemoveAsync(
                    `${pendingOrdersSet}_${option}_${companyCode}`,
                    transactionsID[id],
                  )
                ))
              );
          });
        return Promise.all(taskList);
      })
      .then(() => (
        Promise.all(
          options.map((option) => (
            sortedSetLengthAsync(`${pendingOrdersSet}_${option}_${companyCode}`)
          ))
        )
      ))
      .then((lengths) => {
        // If all sets of options are empty, remove company from pendingCompaniesSet
        if (lengths.every((length) => length === 0))
          return setRemoveAsync(pendingCompaniesSet, companyCode);
      })
      .then(() => (
        resolve(`Successfully pop out all possible transactions of ${companyCode}`)
      ))
      .catch((err) => reject(err));
  });
};

/**
 * @description Clear all possible pending transactions in the whole server
 */
 const emptyPendingTransactionsListAllCompanies = () => {
  return new Promise((resolve, reject) => {
    setGetAllItemsAsync(pendingCompaniesSet)
      .then((companyCodes) => (
        SequentialPromisesWithResultsArray(
          companyCodes.map((companyCode) => () => (
            getSingleCachedShareInfo(companyCode.toUpperCase())
          ))
        )
      ))
      .then((sharesInfoJSON) => (
        Promise.allSettled(
          sharesInfoJSON.map((shareInfo) => (
            emptyPendingTransactionsListOneCompany(
              shareInfo.symbol,
              shareInfo.price
            )
          ))
        )
      ))
      .then((emptyPendingTransactionsResults) => {
        if (emptyPendingTransactionsResults.every((result) => result.status === "fulfilled"))
          return resolve("Successfully proceeded all possible transactions of all companies");
        throw("Failed to proceed some transactions of all companies");
      })
      .catch((err) => reject(err));
  });
};

module.exports = {
  addSinglePendingTransaction,
  updateSinglePendingTransaction,
  deleteSinglePendingTransaction,

  emptyPendingTransactionsListOneCompany,
  emptyPendingTransactionsListAllCompanies,
};
