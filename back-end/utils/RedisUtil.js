const {
  getAsync,
  setAsync,
  listPushAsync,
  listLeftPushAsync,
  delAsync,
  listRangeAsync,
  listPopAsync
} = require("../redis/redis-client");
const { isEqual } = require("lodash");

const { SequentialPromises } = require("./PromisesUtil");

/**
 * Keys list:
 * - '${email}|transactionsHistoryList'
 * - '${email}|transactionsHistoryM5RU' -> Most 5 recently used
 * - '${email}|transactionsHistoryM5RU|numberOfChunksSkipped|searchBy|searchQuery|orderBy|orderQuery'
 * - '${email}|passwordVerification'
 * - '${email}|accountSummaryChart'
 * - '${email}|sharesList'
 *
 * - 'cachedMarketHoliday'
 * - 'cachedShares|${companyCode}'
 *
 * - 'RANKING_LIST'
 * - 'RANKING_LIST_${region}'
 */

/**
 * 'doanhtu07@gmail.com|transactionsHistoryList' : isFinished of these transactions is true!
 * List -> "id|createdAt|companyCode|quantity|priceAtTransaction|limitPrice|brokerage|finishedTime|isTypeBuy|userID", "..."
 */
const formRedisValueFromFinishedTransaction = (finishedTransaction) => {
  const {
    id,
    createdAt,
    companyCode,
    quantity,
    priceAtTransaction,
    brokerage,
    spendOrGain,
    finishedTime,
    isTypeBuy,
    userID
  } = finishedTransaction;
  return `${id}|${createdAt}|${companyCode}|${quantity}|${priceAtTransaction}|${brokerage}|${spendOrGain}|${finishedTime}|${isTypeBuy}|${userID}`;
};
const updateTransactionsHistoryListOneItem = (email, finishedTransaction) => {
  return new Promise((resolve, reject) => {
    const redisKey = `${email}|transactionsHistoryList`;
    const newValue = formRedisValueFromFinishedTransaction(finishedTransaction);

    listPushAsync(redisKey, newValue)
      .then((finishedUpdatingRedisTransactionsHistoryList) => {
        resolve(
          `Successfully added transaction to ${email}'s cached transactions history.\n`
        );
      })
      .catch((err) => {
        reject(err);
      });
  });
};
const updateTransactionsHistoryListWholeList = (
  email,
  finishedTransactions
) => {
  return new Promise((resolve, reject) => {
    const redisKey = `${email}|transactionsHistoryList`;

    const tasksList = [];

    finishedTransactions.map((transaction) => {
      const newValue = formRedisValueFromFinishedTransaction(transaction);
      tasksList.push(() => listPushAsync(redisKey, newValue));
      return "dummy value";
    });

    SequentialPromises(tasksList)
      .then((finishedUpdatingRedisTransactionsHistoryList) => {
        resolve(
          `Successfully added many transactions to ${email}'s cached transactions history.\n`
        );
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * 'doanhtu07@gmail.com|transactionsHistoryM5RU' :
 * List -> "numberOfChunksSkipped|searchBy|searchQuery|orderBy"
 */
const isInTransactionsHistoryM5RU = (
  email,
  numberOfChunksSkipped, // required
  searchBy, // 'none' or 'type' or 'companyCode'
  searchQuery, // 'none' or 'buy'/'sell' or RANDOM
  orderBy, // 'none' or '...'
  orderQuery // 'none' or 'desc' or 'asc'
) => {
  return new Promise((resolve, reject) => {
    const redisKey = `${email}|transactionsHistoryM5RU`;

    listRangeAsync(redisKey, 0, -1)
      .then((M5RUList) => {
        const valueString = `${numberOfChunksSkipped}|${searchBy}|${searchQuery}|${orderBy}|${orderQuery}`;
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
  searchBy, // 'none' or 'type' or 'companyCode'
  searchQuery, // 'none' or 'buy'/'sell' or RANDOM
  orderBy, // 'none' or '...'
  orderQuery // 'none' or 'desc' or 'asc'
) => {
  return new Promise((resolve, reject) => {
    const redisKey = `${email}|transactionsHistoryM5RU`;
    const valueString = `${numberOfChunksSkipped}|${searchBy}|${searchQuery}|${orderBy}|${orderQuery}`;

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
  searchBy, // 'none' or 'type' or 'companyCode'
  searchQuery, // 'none' or 'buy'/'sell' or RANDOM
  orderBy, // 'none' or '...'
  orderQuery, // 'none' or 'desc' or 'asc'
  M5RUList // required
) => {
  return new Promise((resolve, reject) => {
    const redisKey = `${email}|transactionsHistoryM5RU`;
    const valueString = `${numberOfChunksSkipped}|${searchBy}|${searchQuery}|${orderBy}|${orderQuery}`;

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

        return SequentialPromises(tasksList);
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
  searchBy, // 'none' or 'type' or 'companyCode'
  searchQuery, // 'none' or 'buy'/'sell' or RANDOM
  orderBy, // 'none' or '...'
  orderQuery // 'none' or 'desc' or 'asc'
) => {
  return new Promise((resolve, reject) => {
    const redisKey = `${email}|transactionsHistoryM5RU`;
    listRangeAsync(redisKey, 0, -1)
      .then((M5RUList) => {
        const valueString = `${numberOfChunksSkipped}|${searchBy}|${searchQuery}|${orderBy}|${orderQuery}`;
        const index = M5RUList.indexOf(valueString);

        if (index !== 0) {
          if (index === -1) {
            return Promise.all([
              pushNewestItemAndDeleteOldItemToTransactionsHistoryM5RU(
                email,
                numberOfChunksSkipped,
                searchBy,
                searchQuery,
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
                searchBy,
                searchQuery,
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
 * 'doanhtu07@gmail.com|transactionsHistoryM5RU|numberOfChunksSkipped|searchBy|searchQuery|orderBy' :
 * List -> "id|createdAt|companyCode|quantity|priceAtTransaction|limitPrice|brokerage|finishedTime|isTypeBuy|userID"
 *
 * - Special Note: First element of the list is length of transactions history that fits the description attributes (searchBy, searchQuery, ...)
 */
const createOrOverwriteTransactionsHistoryM5RUItemRedisKey = (
  email,
  numberOfChunksSkipped, // required
  searchBy, // 'none' or 'type' or 'companyCode'
  searchQuery, // 'none' or 'buy'/'sell' or RANDOM
  orderBy, // 'none' or '...'
  orderQuery, // 'none' or 'desc' or 'asc'
  prismaTransactionsHistory // array of prisma finished transactions, required
) => {
  return new Promise((resolve, reject) => {
    const redisKey = `${email}|transactionsHistoryM5RU|${numberOfChunksSkipped}|${searchBy}|${searchQuery}|${orderBy}|${orderQuery}`;
    delAsync(redisKey)
      .then((finishedDeletingOldTransactionsHistoryM5RUItem) => {
        const tasksList = [];

        prismaTransactionsHistory.map((transaction) => {
          const redisValue = formRedisValueFromFinishedTransaction(transaction);
          tasksList.push(() => {
            listPushAsync(redisKey, redisValue);
          });
          return "dummy value";
        });

        return SequentialPromises(tasksList);
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
  searchBy, // 'none' or 'type' or 'companyCode'
  searchQuery, // 'none' or 'buy'/'sell' or RANDOM
  orderBy, // 'none' or '...'
  orderQuery, // 'none' or 'desc' or 'asc'
  transactionsHistoryLength
) => {
  const redisKey = `${email}|transactionsHistoryM5RU|${numberOfChunksSkipped}|${searchBy}|${searchQuery}|${orderBy}|${orderQuery}`;
  return listLeftPushAsync(redisKey, transactionsHistoryLength);
};
const getTransactionsHistoryItemInM5RU = (
  email,
  numberOfChunksSkipped, // required
  searchBy, // 'none' or 'type' or 'companyCode'
  searchQuery, // 'none' or 'buy'/'sell' or RANDOM
  orderBy, // 'none' or '...'
  orderQuery // 'none' or 'desc' or 'asc'
) => {
  return new Promise((resolve, reject) => {
    const redisKey = `${email}|transactionsHistoryM5RU|${numberOfChunksSkipped}|${searchBy}|${searchQuery}|${orderBy}|${orderQuery}`;
    listRangeAsync(redisKey, 0, -1)
      .then((transactionsHistoryM5RUItem) => {
        resolve(transactionsHistoryM5RUItem);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * 'doanhtu07@gmail.com|passwordVerification' : 'secretCode|timestamp'
 */
const cachePasswordVerificationCode = (email, secretCode) => {
  return new Promise((resolve, reject) => {
    const timestamp = Math.round(Date.now() / 1000);
    const redisKey = `${email}|passwordVerification`;
    const redisValue = `${secretCode}|${timestamp}`;

    setAsync(redisKey, redisValue)
      .then((finishedCachingSecretCode) => {
        resolve(`Finished caching password verification code for ${email}`);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
const getParsedCachedPasswordVerificationCode = (email) => {
  return new Promise((resolve, reject) => {
    const redisKey = `${email}|passwordVerification`;

    getAsync(redisKey)
      .then((redisString) => {
        if (!redisString) {
          resolve(null);
        } else {
          const valuesArray = redisString.split("|");
          resolve({
            secretCode: valuesArray[0],
            timestamp: parseInt(valuesArray[1], 10)
          });
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};
const removeCachedPasswordVerificationCode = (email) => {
  const redisKey = `${email}|passwordVerification`;
  return delAsync(redisKey);
};

const redisUpdateOverallRankingList = (user) => {
  const value = `${user.firstName}|${user.lastName}|${user.totalPortfolio}|${user.region}`;
  return listPushAsync("RANKING_LIST", value);
};
const redisUpdateRegionalRankingList = (region, user) => {
  const value = `${user.firstName}|${user.lastName}|${user.totalPortfolio}|${user.region}`;
  return listPushAsync(`RANKING_LIST_${region}`, value);
};

/**
 * 'cachedMarketHoliday': 'id|year|newYearsDay|martinLutherKingJrDay|washingtonBirthday|goodFriday|memorialDay|independenceDay|laborDay|thanksgivingDay|christmas'
 */
const parseCachedMarketHoliday = (redisString) => {
  const valuesArray = redisString.split("|");
  return {
    id: valuesArray[0],
    year: parseInt(valuesArray[1], 10),
    newYearsDay: valuesArray[2],
    martinLutherKingJrDay: valuesArray[3],
    washingtonBirthday: valuesArray[4],
    goodFriday: valuesArray[5],
    memorialDay: valuesArray[6],
    independenceDay: valuesArray[7],
    laborDay: valuesArray[8],
    thanksgivingDay: valuesArray[9],
    christmas: valuesArray[10]
  };
};
const getCachedMarketHoliday = () => {
  return new Promise((resolve, reject) => {
    const redisKey = "cachedMarketHoliday";
    getAsync(redisKey)
      .then((redisMarketHoliday) => {
        if (!redisMarketHoliday) {
          resolve(redisMarketHoliday);
        }
        resolve(parseCachedMarketHoliday(redisMarketHoliday));
      })
      .catch((err) => {
        reject(err);
      });
  });
};
const updateCachedMarketHoliday = (marketHoliday) => {
  return new Promise((resolve, reject) => {
    const {
      id,
      year,
      newYearsDay,
      martinLutherKingJrDay,
      washingtonBirthday,
      goodFriday,
      memorialDay,
      independenceDay,
      laborDay,
      thanksgivingDay,
      christmas
    } = marketHoliday;

    const redisKey = "cachedMarketHoliday";
    const redisValue = `${id}|${year}|${newYearsDay}|${martinLutherKingJrDay}|${washingtonBirthday}|${goodFriday}|${memorialDay}|${independenceDay}|${laborDay}|${thanksgivingDay}|${christmas}`;
    setAsync(redisKey, redisValue)
      .then((redisMarketHoliday) => {
        resolve("Cached market holiday object from database successfully");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * 'cachedShares|AAPL': 'isUpdatingUsingFMP|timestampLastUpdated|name|price|changesPercentage|change|dayLow|dayHigh|yearHigh|yearLow|marketCap|priceAvg50|priceAvg200|volume|avgVolume|exchange|open|previousClose|eps|pe|earningsAnnouncement|sharesOutstanding|timestamp'
 */
const parseCachedShareInfo = (redisString) => {
  const valuesArray = redisString.split("|");

  return {
    isUpdatingUsingFMP: valuesArray[0] === "true",
    timestampLastUpdated: parseInt(valuesArray[1], 10),
    name: valuesArray[2],
    price: parseFloat(valuesArray[3]),
    changesPercentage: parseFloat(valuesArray[4]),
    change: parseFloat(valuesArray[5]),
    dayLow: parseFloat(valuesArray[6]),
    dayHigh: parseFloat(valuesArray[7]),
    yearHigh: parseFloat(valuesArray[8]),
    yearLow: parseFloat(valuesArray[9]),
    marketCap: parseFloat(valuesArray[10]),
    priceAvg50: parseFloat(valuesArray[11]),
    priceAvg200: parseFloat(valuesArray[12]),
    volume: parseInt(valuesArray[13], 10),
    avgVolume: parseInt(valuesArray[14], 10),
    exchange: valuesArray[15],
    open: parseFloat(valuesArray[16]),
    previousClose: parseFloat(valuesArray[17]),
    eps: parseFloat(valuesArray[18]),
    pe: parseFloat(valuesArray[19]),
    earningsAnnouncement: valuesArray[20],
    sharesOutstanding: parseInt(valuesArray[21], 10),
    timestamp: parseInt(valuesArray[22], 10)
  };
};
const updateCachedShareInfo = (
  stockQuoteJSON,
  isUpdatingUsingFMP,
  timestampLastUpdated
) => {
  return new Promise((resolve, reject) => {
    const {
      symbol,
      name,
      price,
      changesPercentage,
      change,
      dayLow,
      dayHigh,
      yearHigh,
      yearLow,
      marketCap,
      priceAvg50,
      priceAvg200,
      volume,
      avgVolume,
      exchange,
      open,
      previousClose,
      eps,
      pe,
      earningsAnnouncement,
      sharesOutstanding,
      timestamp
    } = stockQuoteJSON;

    const redisKey = `cachedShares|${symbol}`;

    const valueString = `${isUpdatingUsingFMP}|${timestampLastUpdated}|${name}|${price}|${changesPercentage}|${change}|${dayLow}|${dayHigh}|${yearHigh}|${yearLow}|${marketCap}|${priceAvg50}|${priceAvg200}|${volume}|${avgVolume}|${exchange}|${open}|${previousClose}|${eps}|${pe}|${earningsAnnouncement}|${sharesOutstanding}|${timestamp}`;

    setAsync(redisKey, valueString)
      .then((quote) => {
        resolve(`Updated ${redisKey} successfully`);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
const switchFlagUpdatingUsingFMPToTrue = (symbol, timestampLastUpdated) => {
  return new Promise((resolve, reject) => {
    const redisKey = `cachedShares|${symbol}`;
    getAsync(redisKey)
      .then((cachedStockQuote) => {
        return updateCachedShareInfo(
          cachedStockQuote,
          true,
          timestampLastUpdated
        );
      })
      .then((afterUpdate) => {
        resolve(`Updated ${redisKey} successfully`);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = {
  // User Related
  formRedisValueFromFinishedTransaction,

  updateTransactionsHistoryListOneItem,
  updateTransactionsHistoryListWholeList,

  isInTransactionsHistoryM5RU,
  pushNewestItemAndDeleteOldItemToTransactionsHistoryM5RU,
  reorganizeTransactionsHistoryM5RU,
  searchAndUpdateTransactionsHistoryM5RU,

  createOrOverwriteTransactionsHistoryM5RUItemRedisKey,
  addLengthToFirstOfTransactionsHistoryM5RUItemRedisKey,
  getTransactionsHistoryItemInM5RU,

  cachePasswordVerificationCode,
  getParsedCachedPasswordVerificationCode,
  removeCachedPasswordVerificationCode,
  // User Related

  redisUpdateOverallRankingList,
  redisUpdateRegionalRankingList,

  parseCachedMarketHoliday,
  getCachedMarketHoliday,
  updateCachedMarketHoliday,

  parseCachedShareInfo,
  updateCachedShareInfo,
  switchFlagUpdatingUsingFMPToTrue
};
