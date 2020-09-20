const { isEqual } = require("lodash");

const {
  listPushAsync,
  listLeftPushAsync,
  delAsync,
  listRangeAsync,
  listPopAsync
} = require("../../redis/redis-client");

const {
  createRedisValueFromFinishedTransaction,
  createRedisValueFromTransactionsHistoryFilters
} = require("../low-dependency/ParserUtil");

const {
  SequentialPromisesWithResultsArray
} = require("../low-dependency/PromisesUtil");

/**
 * 'doanhtu07@gmail.com|transactionsHistoryM5RU' :
 * List -> "numberOfChunksSkipped|filtersString|orderBy|orderQuery"
 */
const isInTransactionsHistoryM5RU = (
  email,
  numberOfChunksSkipped, // required
  filters, // example in ParserUtil createRedisValueFromTransactionsHistoryFilters
  orderBy, // 'none' or '...'
  orderQuery // 'none' or 'desc' or 'asc'
) => {
  return new Promise((resolve, reject) => {
    const redisKey = `${email}|transactionsHistoryM5RU`;

    listRangeAsync(redisKey, 0, -1)
      .then((M5RUList) => {
        const filtersString = createRedisValueFromTransactionsHistoryFilters(
          filters
        );
        const valueString = `${numberOfChunksSkipped}|${filtersString}|${orderBy}|${orderQuery}`;
        resolve(M5RUList.indexOf(valueString));
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const pushNewestItemAndDeleteOldItemToTransactionsHistoryM5RU = (
  email,
  numberOfChunksSkipped, // required
  filters, // example in ParserUtil createRedisValueFromTransactionsHistoryFilters
  orderBy, // 'none' or '...'
  orderQuery // 'none' or 'desc' or 'asc'
) => {
  return new Promise((resolve, reject) => {
    const redisKey = `${email}|transactionsHistoryM5RU`;
    const filtersString = createRedisValueFromTransactionsHistoryFilters(
      filters
    );
    const valueString = `${numberOfChunksSkipped}|${filtersString}|${orderBy}|${orderQuery}`;

    listLeftPushAsync(redisKey, valueString)
      .then((M5RUListLength) => {
        if (M5RUListLength > 5) {
          return listPopAsync(redisKey);
        }
      })
      .then((poppedItem) => {
        if (poppedItem) {
          return delAsync(`${redisKey}|${poppedItem}`);
        }
      })
      .then((finishedPoppingAndRemovingIfOverflow) => {
        resolve(
          `Successfully updated cached most-5-recently-used transactions history of ${email}.`
        );
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const reorganizeTransactionsHistoryM5RU = (
  email,
  numberOfChunksSkipped, // required
  filters, // example in ParserUtil createRedisValueFromTransactionsHistoryFilters
  orderBy, // 'none' or '...'
  orderQuery, // 'none' or 'desc' or 'asc'
  M5RUList // required
) => {
  return new Promise((resolve, reject) => {
    const redisKey = `${email}|transactionsHistoryM5RU`;
    const filtersString = createRedisValueFromTransactionsHistoryFilters(
      filters
    );
    const valueString = `${numberOfChunksSkipped}|${filtersString}|${orderBy}|${orderQuery}`;

    delAsync(redisKey)
      .then((finishedDeletingOldTransactionsHistoryM5RU) => {
        const tasksList = [];

        tasksList.push(() => {
          listPushAsync(redisKey, valueString);
        });

        M5RUList.map((M5RUItem) => {
          if (!isEqual(M5RUItem, valueString)) {
            tasksList.push(() => {
              listPushAsync(redisKey, M5RUItem);
            });
          }
          return "dummy value";
        });

        return SequentialPromisesWithResultsArray(tasksList);
      })
      .then((finishedReorganizingTransactionsHistoryM5RU) => {
        resolve(
          `Successfully reorganized most-5-recently-used transactions history for ${email}.\n`
        );
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const searchAndUpdateTransactionsHistoryM5RU = (
  email,
  numberOfChunksSkipped, // required
  filters, // example in ParserUtil createRedisValueFromTransactionsHistoryFilters
  orderBy, // 'none' or '...'
  orderQuery // 'none' or 'desc' or 'asc'
) => {
  return new Promise((resolve, reject) => {
    const redisKey = `${email}|transactionsHistoryM5RU`;
    listRangeAsync(redisKey, 0, -1)
      .then((M5RUList) => {
        const filtersString = createRedisValueFromTransactionsHistoryFilters(
          filters
        );

        const valueString = `${numberOfChunksSkipped}|${filtersString}|${orderBy}|${orderQuery}`;
        const index = M5RUList.indexOf(valueString);

        if (index !== 0) {
          if (index === -1) {
            return Promise.all([
              pushNewestItemAndDeleteOldItemToTransactionsHistoryM5RU(
                email,
                numberOfChunksSkipped,
                filters,
                orderBy,
                orderQuery
              ),
              index
            ]);
          } else {
            return Promise.all([
              reorganizeTransactionsHistoryM5RU(
                email,
                numberOfChunksSkipped,
                filters,
                orderBy,
                orderQuery,
                M5RUList
              ),
              index
            ]);
          }
        } else {
          return [null, index];
        }
      })
      .then(([finishedSearchedAndUpdated, indexInM5RUList]) => {
        resolve([
          `Successfully searched and updated most-5-recently-used transactions history for ${email}.\n`,
          indexInM5RUList
        ]);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * 'doanhtu07@gmail.com|transactionsHistoryM5RU|numberOfChunksSkipped|filtersString|orderBy|orderQuery' :
 * List -> "id|createdAt|companyCode|quantity|priceAtTransaction|limitPrice|brokerage|finishedTime|isTypeBuy|userID"
 *
 * - Special Note: First element of the list is length of transactions history that fits the description attributes
 */
const createOrOverwriteTransactionsHistoryM5RUItemRedisKey = (
  email,
  numberOfChunksSkipped, // required
  filters, // example in ParserUtil createRedisValueFromTransactionsHistoryFilters
  orderBy, // 'none' or '...'
  orderQuery, // 'none' or 'desc' or 'asc'
  prismaTransactionsHistory // array of prisma finished transactions, required
) => {
  return new Promise((resolve, reject) => {
    const filtersString = createRedisValueFromTransactionsHistoryFilters(
      filters
    );
    const redisKey = `${email}|transactionsHistoryM5RU|${numberOfChunksSkipped}|${filtersString}|${orderBy}|${orderQuery}`;
    delAsync(redisKey)
      .then((finishedDeletingOldTransactionsHistoryM5RUItem) => {
        const tasksList = [];

        prismaTransactionsHistory.map((transaction) => {
          const redisValue = createRedisValueFromFinishedTransaction(
            transaction
          );
          tasksList.push(() => {
            listPushAsync(redisKey, redisValue);
          });
          return "dummy value";
        });

        return SequentialPromisesWithResultsArray(tasksList);
      })
      .then((finishedPushingPrismaTransactionsHistoryToRedisKey) => {
        resolve(
          `Successfully updated most-5-recently-used transactions history redis key ${redisKey}.\n`
        );
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const addLengthToFirstOfTransactionsHistoryM5RUItemRedisKey = (
  email,
  numberOfChunksSkipped, // required
  filters, // example in ParserUtil createRedisValueFromTransactionsHistoryFilters
  orderBy, // 'none' or '...'
  orderQuery, // 'none' or 'desc' or 'asc'
  transactionsHistoryLength
) => {
  const filtersString = createRedisValueFromTransactionsHistoryFilters(filters);
  const redisKey = `${email}|transactionsHistoryM5RU|${numberOfChunksSkipped}|${filtersString}|${orderBy}|${orderQuery}`;
  return listLeftPushAsync(redisKey, transactionsHistoryLength);
};

const getTransactionsHistoryItemInM5RU = (
  email,
  numberOfChunksSkipped, // required
  filters, // example in ParserUtil createRedisValueFromTransactionsHistoryFilters
  orderBy, // 'none' or '...'
  orderQuery // 'none' or 'desc' or 'asc'
) => {
  return new Promise((resolve, reject) => {
    const filtersString = createRedisValueFromTransactionsHistoryFilters(
      filters
    );
    const redisKey = `${email}|transactionsHistoryM5RU|${numberOfChunksSkipped}|${filtersString}|${orderBy}|${orderQuery}`;
    listRangeAsync(redisKey, 0, -1)
      .then((transactionsHistoryM5RUItem) => {
        resolve(transactionsHistoryM5RUItem);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = {
  isInTransactionsHistoryM5RU,
  pushNewestItemAndDeleteOldItemToTransactionsHistoryM5RU,
  reorganizeTransactionsHistoryM5RU,
  searchAndUpdateTransactionsHistoryM5RU,

  createOrOverwriteTransactionsHistoryM5RUItemRedisKey,
  addLengthToFirstOfTransactionsHistoryM5RUItemRedisKey,
  getTransactionsHistoryItemInM5RU
};
