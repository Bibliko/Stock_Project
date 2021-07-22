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
 * @use Redis key 'email|transactionsHistoryM5RU' : List -> "numberOfChunksSkipped|filtersString|orderBy|orderQuery"
 * @description Push new item to the left, pop old item out to the right
 * @param email User email
 * @param numberOfChunksSkipped required
 * @param filters Example of filters object is in ParserUtil createRedisValueFromTransactionsHistoryFilters
 * @param orderBy Transaction filter: order field name
 * @param orderQuery Transaction filter: order field value (desc, asc, 'none')
 */
const pushNewestItemAndDeleteOldItemToTransactionsHistoryM5RU = (
  email,
  numberOfChunksSkipped,
  filters,
  orderBy,
  orderQuery
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

/**
 * @use Redis key 'email|transactionsHistoryM5RU' : List -> "numberOfChunksSkipped|filtersString|orderBy|orderQuery"
 * @description Re-order Most 5 Recently Used List
 * @param email User email
 * @param numberOfChunksSkipped required
 * @param filters Example of filters object is in ParserUtil createRedisValueFromTransactionsHistoryFilters
 * @param orderBy Transaction filter: order field name
 * @param orderQuery Transaction filter: order field value (desc, asc, 'none')
 * @param M5RUList Most 5 Recently Used List in cache
 */
const reorganizeTransactionsHistoryM5RU = (
  email,
  numberOfChunksSkipped,
  filters,
  orderBy,
  orderQuery,
  M5RUList
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

        M5RUList.forEach((M5RUItem) => {
          if (!isEqual(M5RUItem, valueString)) {
            tasksList.push(() => {
              listPushAsync(redisKey, M5RUItem);
            });
          }
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

/**
 * @use Redis key 'email|transactionsHistoryM5RU' : List -> "numberOfChunksSkipped|filtersString|orderBy|orderQuery"
 * @description Search transaction filter in M5RU List
 * - If not found, push to M5RU List
 * - If found, re-order the M5RU List
 * @param email User email
 * @param numberOfChunksSkipped required
 * @param filters Example of filters object is in ParserUtil createRedisValueFromTransactionsHistoryFilters
 * @param orderBy Transaction filter: order field name
 * @param orderQuery Transaction filter: order field value (desc, asc, 'none')
 */
const searchAndUpdateTransactionsHistoryM5RU = (
  email,
  numberOfChunksSkipped,
  filters,
  orderBy,
  orderQuery
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
 * @special_note First element of the list is length of transactions history that fits the description attributes
 * @use Redis key 'email|transactionsHistoryM5RU|numberOfChunksSkipped|filtersString|orderBy|orderQuery' : List -> "id|createdAt|companyCode|quantity|priceAtTransaction|limitPrice|brokerage|finishedTime|type|userID"
 * @description create or delete-then-create (if existed) new M5RU item to cache transactions history
 * @param email User email
 * @param numberOfChunksSkipped required
 * @param filters Example of filters object is in ParserUtil createRedisValueFromTransactionsHistoryFilters
 * @param orderBy Transaction filter: order field name
 * @param orderQuery Transaction filter: order field value (desc, asc, 'none')
 * @param prismaTransactionsHistory Array of prisma finished transactions
 */
const createOrOverwriteTransactionsHistoryM5RUItemRedisKey = (
  email,
  numberOfChunksSkipped,
  filters,
  orderBy,
  orderQuery,
  prismaTransactionsHistory
) => {
  return new Promise((resolve, reject) => {
    const filtersString = createRedisValueFromTransactionsHistoryFilters(
      filters
    );
    const redisKey = `${email}|transactionsHistoryM5RU|${numberOfChunksSkipped}|${filtersString}|${orderBy}|${orderQuery}`;
    delAsync(redisKey)
      .then((finishedDeletingOldTransactionsHistoryM5RUItem) => {
        const tasksList = [];

        prismaTransactionsHistory.forEach((transaction) => {
          const redisValue = createRedisValueFromFinishedTransaction(
            transaction
          );
          tasksList.push(() => {
            listPushAsync(redisKey, redisValue);
          });
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

/**
 * @special_note First element of the list is length of transactions history that fits the description attributes
 * @use Redis key 'email|transactionsHistoryM5RU|numberOfChunksSkipped|filtersString|orderBy|orderQuery' : List -> "id|createdAt|companyCode|quantity|priceAtTransaction|limitPrice|brokerage|finishedTime|type|userID"
 * @description Add length of transactions history fitting in THIS filters to the beginning of cached M5RU Item
 * @param email User email
 * @param numberOfChunksSkipped required
 * @param filters Example of filters object is in ParserUtil createRedisValueFromTransactionsHistoryFilters
 * @param orderBy Transaction filter: order field name
 * @param orderQuery Transaction filter: order field value (desc, asc, 'none')
 * @param transactionsHistoryLength Length of transactions history fitting in THIS filters
 */
const addLengthToFirstOfTransactionsHistoryM5RUItemRedisKey = (
  email,
  numberOfChunksSkipped,
  filters,
  orderBy,
  orderQuery,
  transactionsHistoryLength
) => {
  const filtersString = createRedisValueFromTransactionsHistoryFilters(filters);
  const redisKey = `${email}|transactionsHistoryM5RU|${numberOfChunksSkipped}|${filtersString}|${orderBy}|${orderQuery}`;
  return listLeftPushAsync(redisKey, transactionsHistoryLength);
};

/**
 * @special_note First element of the list is length of transactions history that fits the description attributes
 * @use Redis key 'email|transactionsHistoryM5RU|numberOfChunksSkipped|filtersString|orderBy|orderQuery' : List -> "id|createdAt|companyCode|quantity|priceAtTransaction|limitPrice|brokerage|finishedTime|type|userID"
 * @param email User email
 * @param numberOfChunksSkipped required
 * @param filters Example of filters object is in ParserUtil createRedisValueFromTransactionsHistoryFilters
 * @param orderBy Transaction filter: order field name
 * @param orderQuery Transaction filter: order field value (desc, asc, 'none')
 * @returns Transactions history M5RU item fitting described filters
 */
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
  pushNewestItemAndDeleteOldItemToTransactionsHistoryM5RU,
  reorganizeTransactionsHistoryM5RU,
  searchAndUpdateTransactionsHistoryM5RU,

  createOrOverwriteTransactionsHistoryM5RUItemRedisKey,
  addLengthToFirstOfTransactionsHistoryM5RUItemRedisKey,
  getTransactionsHistoryItemInM5RU
};
