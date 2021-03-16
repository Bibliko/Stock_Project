const { chunk } = require("lodash");

const {
  getAsync,
  setAsync,
  listPushAsync,
  listRangeAsync
} = require("../../redis/redis-client");

const {
  SequentialPromisesWithResultsArray
} = require("../low-dependency/PromisesUtil");

const {
  getFullStockQuotesFromFMP,
  getFullStockProfilesFromFMP
} = require("../FinancialModelingPrepUtil");

const {
  parseCachedShareQuote,
  parseCachedShareProfile,
  createRedisValueFromStockProfileJSON,
  createSymbolsStringFromCachedSharesList,
  combineFMPStockQuoteAndProfile
} = require("../low-dependency/ParserUtil");

const { cachedShares } = require("./RedisUtil");

/**
 * 'cachedShares' only stores symbols using by users in server
 *
 * Every second, update stock quote of every company in 'cachedShares'
 * Every minute, update stock profile of every company in 'cachedShares'
 * If user gets in and see no company fitting his/her wish, get directly from FMP and update cache
 */

/**
 * @description Get array of stock symbols that all users in server are currently needing
 */
const getCachedShares = () => {
  return new Promise((resolve, reject) => {
    const redisKey = cachedShares;
    listRangeAsync(redisKey, 0, -1)
      .then((cachedSharesArray) => {
        resolve(cachedSharesArray);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * @description
 * - Get information of a stock from cache based on the stock symbol (quote + profile)
 * - If not from cache: Get information from FMP -> send to user and update cache
 * @param companyCode Stock symbol. E.g: "AAPL"
 */
const getSingleCachedShareInfo = (companyCode) => {
  return new Promise((resolve, reject) => {
    const redisKeyQuote = `${cachedShares}|${companyCode}|quote`;
    const redisKeyProfile = `${cachedShares}|${companyCode}|profile`;

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
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * @description Push all company codes in the parameter array to Redis 'cachedShares'
 * @note This function will ensure all codes pushed to cache in upper case
 * @param companyCodes Array of company codes
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

/**
 * @description
 * - Change cache data of a symbol
 * - Use redis key 'cachedShares|symbol|quote'
 * @param {*} stockQuoteJSON stock QUOTE information obtained from FMP (json object)
 */
const updateSingleCachedShareQuote = async (stockQuoteJSON) => {
  try {
    const { symbol } = stockQuoteJSON;
    const lastestPrice = stockQuoteJSON.price;

    const redisKeyQuote = `${cachedShares}|${symbol}|quote`;
    const oldPrice = await setAsync(redisKeyQuote);

    await updatePriceChangeStatus(stockQuoteJSON, oldPrice, lastestPrice);
  } catch (err) {
    // Failed to update
    console.error(err);
  }
};

/**
 * @description
 * - Change cache data of a symbol
 * - Use redis key 'cachedShares|symbol|profile'
 * @param stockQuoteJSON stock PROFILE information obtained from FMP (json object)
 */
const updateSingleCachedShareProfile = (stockProfileJSON) => {
  return new Promise((resolve, reject) => {
    const { symbol } = stockProfileJSON;

    const redisKey = `${cachedShares}|${symbol}|profile`;
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
 * @important_note
 * Maximum Parallel Queries:
 * - 10 queries/sec since there are maximum of only about 8000
 * companies right now in NYSE and NASDAQ combined.
 * - We can call 800 companies in 1 query.
 *
 * @description
 * 1. Divide array of stock symbols into chunks of 800 symbols. Each chunk, get stock QUOTE information from FMP
 * 2. Update cache of each symbol using redis key 'cachedShares|symbol|quote'
 * @param shareSymbols Array of stock symbols. E.g: ["AAPL", "GOOGL"]
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
 * @important_note
 * Maximum Parallel Queries: 0
 * - We will use Sequential Promises for updating profiles
 * - No parallel since profile query allows only up to 50 companies
 * -> If we do parellel queries, there could be more than 100 queries/sec since there are
 * at most 8000 companies in NYSE and NASDAQ combined!
 *
 * * @description
 * 1. Divide array of stock symbols into chunks of 50 symbols. Each chunk, get stock PROFILE information from FMP
 * 2. Update cache of each symbol using redis key 'cachedShares|symbol|profile'
 * @param shareSymbols Array of stock symbols. E.g: ["AAPL", "GOOGL"]
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

/**
 * @description
 * - Update cache of all stock symbols stored in 'cachedShares'
 * - Update each stock symbol using redis key 'cachedShares|symbol|quote'
 */
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

/**
 * @description
 * - Update cache of all stock symbols stored in 'cachedShares'
 * - Update each stock symbol using redis key 'cachedShares|symbol|profile'
 */
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

const updatePriceChangeStatus = (stockQuoteJSON, oldPrice, recentPrice) => {
  return new Promise((resolve, reject) => {
    const { companyCode } = stockQuoteJSON;

    const redisKey = `${cachedShares}|${companyCode}|priceStatus`;
    const valueString = oldPrice < recentPrice ? "1" : "-1";

    return setAsync(redisKey, valueString)
      .then((finishedUpdatingThePriceStatus) => {
        resolve(
          `Successfully updated price change status for company ${companyCode}`
        );
      })
      .catch((err) => reject(err));
  });
};

module.exports = {
  getCachedShares,
  getSingleCachedShareInfo,

  pushManyCodesToCachedShares,

  updateSingleCachedShareQuote,
  updateSingleCachedShareProfile,

  updateCachedShareQuotes,
  updateCachedShareProfiles,

  updateCachedShareQuotesUsingCache,
  updateCachedShareProfilesUsingCache,

  updatePriceChangeStatus
};
