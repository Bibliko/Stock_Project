const {
  getAsync,
  setAsync,
  listPushAsync,
  listLeftPushAsync,
  delAsync,
  listRangeAsync,
  listPopAsync
} = require("../redis/redis-client");
const { isEqual, chunk } = require("lodash");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { newDate, getYearUTCString } = require("./low-dependency/DayTimeUtil");
const {
  findIfTimeNowIsHoliday,
  findIfTimeNowIsOutOfRange,
  findIfTimeNowIsWeekend
} = require("./MarketTimeUtil");

const {
  SequentialPromisesWithResultsArray
} = require("./low-dependency/PromisesUtil");
const {
  getFullStockQuotesFromFMP,
  getFullStockProfilesFromFMP
} = require("./FinancialModelingPrepUtil");
const {
  parseCachedMarketHoliday,
  parseCachedShareQuote,
  parseCachedShareProfile,
  createRedisValueFromStockQuoteJSON,
  createRedisValueFromStockProfileJSON,
  createSymbolsStringFromCachedSharesList,
  createRedisValueFromMarketHoliday,
  createRedisValueFromFinishedTransaction,
  combineFMPStockQuoteAndProfile
} = require("./low-dependency/ParserUtil");

/**
 * Keys list:
 * - '${email}|transactionsHistoryList': list
 * - '${email}|transactionsHistoryM5RU': list -> Most 5 recently used
 * - '${email}|transactionsHistoryM5RU|numberOfChunksSkipped|searchBy|searchQuery|orderBy|orderQuery': list
 * - '${email}|passwordVerification': value
 * - '${email}|accountSummaryChart': list
 * - '${email}|sharesList': list
 *
 * - 'cachedMarketHoliday': value
 *
 * - 'cachedShares': list
 * - 'cachedShares|${companyCode}|quote': value
 * - 'cachedShares|${companyCode}|profile': value
 *
 * - 'RANKING_LIST': list
 * - 'RANKING_LIST_${region}': list
 */

/**
 * return true if market closed
 * else return false if market opened
 */
const isMarketClosedCheck = () => {
  var timeNow = newDate();

  var UTCYear = getYearUTCString(timeNow);

  return new Promise((resolve, reject) => {
    getCachedMarketHoliday()
      .then((marketHoliday) => {
        if (!marketHoliday || !isEqual(marketHoliday.year, UTCYear)) {
          const prismaPromise = prisma.marketHolidays.findOne({
            where: {
              year: UTCYear
            }
          });
          return Promise.all([prismaPromise, null]);
        }
        return [null, marketHoliday];
      })
      .then(([prismaMarketHoliday, marketHoliday]) => {
        var isTimeNowHoliday = false;
        if (prismaMarketHoliday) {
          updateCachedMarketHoliday(prismaMarketHoliday);
          isTimeNowHoliday = findIfTimeNowIsHoliday(prismaMarketHoliday);
        } else {
          isTimeNowHoliday = findIfTimeNowIsHoliday(marketHoliday);
        }

        if (
          isTimeNowHoliday ||
          findIfTimeNowIsOutOfRange(timeNow) ||
          findIfTimeNowIsWeekend(timeNow)
        ) {
          resolve(true);
        } else {
          resolve(false);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * 'doanhtu07@gmail.com|transactionsHistoryList' : isFinished of these transactions is true!
 * List -> "id|createdAt|companyCode|quantity|priceAtTransaction|limitPrice|brokerage|finishedTime|isTypeBuy|userID", "..."
 */
const updateTransactionsHistoryListOneItem = (email, finishedTransaction) => {
  return new Promise((resolve, reject) => {
    const redisKey = `${email}|transactionsHistoryList`;
    const newValue = createRedisValueFromFinishedTransaction(
      finishedTransaction
    );

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
      const newValue = createRedisValueFromFinishedTransaction(transaction);
      tasksList.push(() => listPushAsync(redisKey, newValue));
      return "dummy value";
    });

    SequentialPromisesWithResultsArray(tasksList)
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
    const redisKey = "cachedMarketHoliday";
    const redisValue = createRedisValueFromMarketHoliday(marketHoliday);
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
 * 'cachedShares' only stores symbols using by users in server
 *
 * Every second, update stock quote of every company in 'cachedShares'
 * Every minute, update stock profile of every company in 'cachedShares'
 * If user gets in and see no company fitting his/her wish, get directly from FMP and update cache
 *
 */
const getCachedShares = () => {
  return new Promise((resolve, reject) => {
    const redisKey = "cachedShares";
    listRangeAsync(redisKey, 0, -1)
      .then((cachedSharesArray) => {
        resolve(cachedSharesArray);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
const getSingleCachedShareInfo = (companyCode) => {
  return new Promise((resolve, reject) => {
    const redisKeyQuote = `cachedShares|${companyCode}|quote`;
    const redisKeyProfile = `cachedShares|${companyCode}|profile`;

    Promise.all([getAsync(redisKeyQuote), getAsync(redisKeyProfile)])
      .then(([quote, profile]) => {
        if (!quote || !profile) {
          return Promise.all([
            getFullStockQuotesFromFMP(companyCode),
            getFullStockProfilesFromFMP(companyCode),
            true
          ]);
        }
        return Promise.all([quote, profile, false]);
      })
      .then(([quote, profile, needsDirectDataFromFMP]) => {
        if (needsDirectDataFromFMP) {
          const shareInfoObject = combineFMPStockQuoteAndProfile(
            quote[0],
            profile[0]
          );
          resolve(shareInfoObject);
          return Promise.all([
            pushManyCodesToCachedShares([companyCode]),
            updateSingleCachedShareQuote(quote[0]),
            updateSingleCachedShareProfile(profile[0])
          ]);
        } else {
          const shareInfoObject = combineFMPStockQuoteAndProfile(
            parseCachedShareQuote(quote),
            parseCachedShareProfile(profile)
          );
          resolve(shareInfoObject);
        }
      })
      .then((finishedUpdating) => {
        if (finishedUpdating) {
          console.log(
            finishedUpdating,
            "RedisUtil.js getSingleCachedShareInfo"
          );
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * When push, this function already ensures code is in upper case.
 */
const pushManyCodesToCachedShares = (companyCodes) => {
  return new Promise((resolve, reject) => {
    getCachedShares()
      .then((cachedShares) => {
        const redisKey = "cachedShares";

        const pushCompanyCodesAndUpdate = companyCodes.map((code) => {
          if (cachedShares.indexOf(code) === -1) {
            return listPushAsync(redisKey, code.toUpperCase());
          }
        });

        return Promise.all(pushCompanyCodesAndUpdate);
      })
      .then((finishedPushing) => {
        resolve("Successfully pushed many company codes to cached shares.");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const updateSingleCachedShareQuote = (stockQuoteJSON) => {
  return new Promise((resolve, reject) => {
    const { symbol } = stockQuoteJSON;

    const redisKey = `cachedShares|${symbol}|quote`;
    const valueString = createRedisValueFromStockQuoteJSON(stockQuoteJSON);

    setAsync(redisKey, valueString)
      .then((quote) => {
        resolve(`Updated ${redisKey} successfully`);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
const updateSingleCachedShareProfile = (stockProfileJSON) => {
  return new Promise((resolve, reject) => {
    const { symbol } = stockProfileJSON;

    const redisKey = `cachedShares|${symbol}|profile`;
    const valueString = createRedisValueFromStockProfileJSON(stockProfileJSON);

    setAsync(redisKey, valueString)
      .then((quote) => {
        resolve(`Updated ${redisKey} successfully`);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * Maximum Parallel Queries:
 * - 10 queries/sec since there are maximum of only about 8000
 * companies right now in NYSE and NASDAQ combined.
 * - We can call 800 companies in 1 query.
 */
const updateCachedShareQuotes = (shareSymbols) => {
  return new Promise((resolve, reject) => {
    // FMP Stock Quotes can only batch up to 800 symbols
    const chunks800Symbols = chunk(shareSymbols, 800);

    const getStockQuotesFromFMPPromises = chunks800Symbols.map(
      (chunkSymbols) => {
        const symbolsString = createSymbolsStringFromCachedSharesList(
          chunkSymbols
        );
        return getFullStockQuotesFromFMP(symbolsString);
      }
    );

    Promise.all(getStockQuotesFromFMPPromises)
      .then((stockQuotesJSONArray) => {
        if (stockQuotesJSONArray) {
          // stockQuotesJSONArray: [ [first 800 chunk], [second 800 chunk], ... ]
          // We use two loops
          const updateAllChunks = stockQuotesJSONArray.map(
            (stockQuotesJSON) => {
              const updateOneChunk = stockQuotesJSON.map((stockQuote) => {
                return updateSingleCachedShareQuote(stockQuote);
              });
              return Promise.all(updateOneChunk);
            }
          );
          return Promise.all(updateAllChunks);
        }
      })
      .then((finishedUpdatingAllCachedShareQuotes) => {
        resolve("Successfully updated all cached share quotes.");
      })
      .catch((err) => {
        reject(err);
      });
  });
};
/**
 * Maximum Parallel Queries: 0
 * - We will use Sequential Promises for updating profiles
 * - No parallel since profile query allows only up to 50 companies
 * -> If we do parellel queries, there could be more than 100 queries/sec since there are
 * at most 8000 companies in NYSE and NASDAQ combined!
 */
const updateCachedShareProfiles = (shareSymbols) => {
  return new Promise((resolve, reject) => {
    // FMP Stock Profiles can only batch up to 50 symbols
    const chunks50Symbols = chunk(shareSymbols, 50);
    const tasksList = [];

    const getStockProfilesFromFMPPromises = chunks50Symbols.map(
      (chunkSymbols) => {
        const symbolsString = createSymbolsStringFromCachedSharesList(
          chunkSymbols
        );
        tasksList.push(() => getFullStockProfilesFromFMP(symbolsString));
      }
    );

    SequentialPromisesWithResultsArray(getStockProfilesFromFMPPromises)
      .then((stockProfilesJSONArray) => {
        if (stockProfilesJSONArray) {
          // stockQuotesJSONArray: [ [first 50 chunk], [second 50 chunk], ... ]
          // We use two loops
          const updateAllChunks = stockProfilesJSONArray.map(
            (stockProfilesJSON) => {
              const updateOneChunk = stockProfilesJSON.map((stockProfile) => {
                return updateSingleCachedShareProfile(stockProfile);
              });
              return Promise.all(updateOneChunk);
            }
          );
          return Promise.all(updateAllChunks);
        }
      })
      .then((finishedUpdatingAllCachedShareProfiles) => {
        resolve("Successfully updated all cached share profiles.");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const updateCachedShareQuotesUsingCache = () => {
  return new Promise((resolve, reject) => {
    getCachedShares()
      .then((cachedShares) => {
        return updateCachedShareQuotes(cachedShares);
      })
      .then((finishedUpdatingCachedShareQuotes) => {
        resolve("Successfully updated cached share quotes automatically.");
      })
      .catch((err) => {
        reject(err);
      });
  });
};
const updateCachedShareProfilesUsingCache = () => {
  return new Promise((resolve, reject) => {
    getCachedShares()
      .then((cachedShares) => {
        return updateCachedShareProfiles(cachedShares);
      })
      .then((finishedUpdatingCachedShareQuotes) => {
        resolve("Successfully updated cached share profiles automatically.");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = {
  // Market Time
  isMarketClosedCheck,
  // Market Time

  // User Related
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

  // Ranking Update
  redisUpdateOverallRankingList,
  redisUpdateRegionalRankingList,
  // Ranking Update

  // Market Holiday
  getCachedMarketHoliday,
  updateCachedMarketHoliday,
  // Market Holiday

  // Cached Shares Bank
  getCachedShares,
  getSingleCachedShareInfo,

  pushManyCodesToCachedShares,

  updateSingleCachedShareQuote,
  updateSingleCachedShareProfile,

  updateCachedShareQuotes,
  updateCachedShareProfiles,

  updateCachedShareQuotesUsingCache,
  updateCachedShareProfilesUsingCache
  // Cached Shares Bank
};
