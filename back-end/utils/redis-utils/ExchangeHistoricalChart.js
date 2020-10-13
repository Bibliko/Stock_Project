const { isEqual, isEmpty } = require("lodash");

const {
  listRangeAsync,
  listLeftPushAsync,
  listPushAsync,
  delAsync
} = require("../../redis/redis-client");

const {
  createRedisValueFromExchangeHistoricalChart5min,
  parseCachedExchangeHistoricalChart5minItem,
  parseCachedExchangeHistoricalChartFullItem,
  createRedisValueFromExchangeHistoricalChartFull
} = require("../low-dependency/ParserUtil");

const {
  cachedExchangeHistoricalChartFull,
  cachedExchangeHistoricalChart5min
} = require("./RedisUtil");

const {
  SequentialPromisesWithResultsArray
} = require("../low-dependency/PromisesUtil");

const {
  getExchangeHistoricalChartFromFMP
} = require("../FinancialModelingPrepUtil");

/**
 * @description Use redis key 'cachedExchangeHistoricalChart5min|${exchange}'
 * @param {string} exchange NYSE or NASDAQ
 * @param {string} typeChart 5min or full
 * @return {Promise<object[]>} historicalChartObjectsArray. Each object will look like Historical Stock Index Prices endpoint on FMP
 */
const getCachedExchangeHistoricalChart = (exchange, typeChart) => {
  return new Promise((resolve, reject) => {
    const cacheSection =
      typeChart === "5min"
        ? cachedExchangeHistoricalChart5min
        : typeChart === "full"
        ? cachedExchangeHistoricalChartFull
        : "";
    if (isEmpty(cacheSection)) {
      reject(new Error("FMP Chart Type should be 5min or full."));
    }

    const redisKey = `${cacheSection}|${exchange}`;

    listRangeAsync(redisKey, 0, -1)
      .then((historicalChartArray) => {
        const historicalChartObjectsArray = historicalChartArray.map(
          (historicalChartItem) => {
            if (typeChart === "5min") {
              return parseCachedExchangeHistoricalChart5minItem(
                historicalChartItem
              );
            }
            return parseCachedExchangeHistoricalChartFullItem(
              historicalChartItem
            );
          }
        );

        resolve(historicalChartObjectsArray);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * @description Use redis key 'cachedExchangeHistoricalChart5min|${exchange}'
 * @description
 * - Remove current list
 * - Push each historical chart item to list so that LATEST date to the left (order from FMP too)
 * @param {string} exchange NYSE or NASDAQ
 * @param {string} typeChart 5min or full
 * @param {object[]} historicalChartArray Array of ohclv chart from FMP
 */
const pushCachedExchangeHistoricalChartWholeList = (
  exchange,
  typeChart,
  historicalChartArray
) => {
  return new Promise((resolve, reject) => {
    const cacheSection =
      typeChart === "5min"
        ? cachedExchangeHistoricalChart5min
        : typeChart === "full"
        ? cachedExchangeHistoricalChartFull
        : "";
    if (isEmpty(cacheSection)) {
      reject(new Error("FMP Chart Type should be 5min or full."));
    }

    const redisKey = `${cacheSection}|${exchange}`;

    delAsync(redisKey)
      .then((finishedErasingRecentList) => {
        const tasksList = [];

        historicalChartArray.forEach((historicalChartItem) => {
          const redisValue =
            typeChart === "5min"
              ? createRedisValueFromExchangeHistoricalChart5min(
                  historicalChartItem
                )
              : createRedisValueFromExchangeHistoricalChartFull(
                  historicalChartItem
                );
          tasksList.push(() => listPushAsync(redisKey, redisValue));
        });

        return SequentialPromisesWithResultsArray(tasksList);
      })
      .then((finishedPushing) => {
        resolve(
          `Successfully finished pushing historical chart ${typeChart} items of exchange ${exchange} to cache`
        );
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * @description Use redis key 'cachedExchangeHistoricalChart5min|${exchange}'
 * @description Compare latest item of new historical chart to latest one in cache
 * @param {string} exchange NYSE or NASDAQ
 * @param {string} typeChart 5min or full
 * @param {object[]} newHistoricalChartArray Item of ohclv chart from FMP
 */
const pushCachedExchangeHistoricalChartLatestItem = (
  exchange,
  typeChart,
  newHistoricalChartArray
) => {
  return new Promise((resolve, reject) => {
    const cacheSection =
      typeChart === "5min"
        ? cachedExchangeHistoricalChart5min
        : typeChart === "full"
        ? cachedExchangeHistoricalChartFull
        : "";
    if (isEmpty(cacheSection)) {
      reject(new Error("FMP Chart Type should be 5min or full."));
    }

    const redisKey = `${cacheSection}|${exchange}`;

    const redisValue =
      typeChart === "5min"
        ? createRedisValueFromExchangeHistoricalChart5min(
            newHistoricalChartArray[0]
          )
        : createRedisValueFromExchangeHistoricalChartFull(
            newHistoricalChartArray[0]
          );

    listRangeAsync(redisKey, 0, 0)
      .then((historicalChartLatestItemInCache) => {
        const cachedItem = historicalChartLatestItemInCache[0];

        if (!isEqual(cachedItem, redisValue)) {
          return listLeftPushAsync(redisKey, redisValue);
        }
      })
      .then((finishedPushing) => {
        resolve(
          `Successfully finished pushing latest historical chart ${typeChart} items of exchange ${exchange} to cache`
        );
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * @description Use redis key 'cachedExchangeHistoricalChart5min|${exchange}'
 * @description Update exchange historical chart whole list using FMP
 * @param {string} exchange NYSE or NASDAQ
 * @param {string} typeChart 5min or full
 */
const updateCachedExchangeHistoricalChartWholeList = (exchange, typeChart) => {
  return new Promise((resolve, reject) => {
    getExchangeHistoricalChartFromFMP(exchange, typeChart)
      .then((historicalChartJSON) => {
        return pushCachedExchangeHistoricalChartWholeList(
          exchange,
          typeChart,
          historicalChartJSON
        );
      })
      .then((finishedPushing) => {
        resolve(finishedPushing);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * @description Use redis key 'cachedExchangeHistoricalChart5min|${exchange}'
 * @description Update exchange historical chart one item using FMP
 * @param {string} exchange NYSE or NASDAQ
 * @param {string} typeChart 5min or full
 */
const updateCachedExchangeHistoricalChartOneItem = (exchange, typeChart) => {
  return new Promise((resolve, reject) => {
    getExchangeHistoricalChartFromFMP(exchange, typeChart)
      .then((historicalChartJSON) => {
        return pushCachedExchangeHistoricalChartLatestItem(
          exchange,
          typeChart,
          historicalChartJSON
        );
      })
      .then((finishedPushing) => {
        resolve(finishedPushing);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * @description Reset all exchanges historical chart only once every time market is opened
 * @param {object} globalBackendVariables specific global object in index.js (back-end)
 */
const resetAllExchangesHistoricalChart = (globalBackendVariables) => {
  if (!globalBackendVariables.isPrismaMarketHolidaysInitialized) {
    return;
  }

  // if market is opened but flag hasReplacedAllExchangesHistoricalChart is still false
  // -> change it to true AND reset all exchanges historical chart in cache
  if (
    !globalBackendVariables.isMarketClosed &&
    !globalBackendVariables.hasReplacedAllExchangesHistoricalChart
  ) {
    globalBackendVariables.hasReplacedAllExchangesHistoricalChart = true;
    updateCachedExchangeHistoricalChartWholeList("NYSE", "5min");
    updateCachedExchangeHistoricalChartWholeList("NYSE", "full");
  }

  // if market is closed but flag hasReplacedAllExchangesHistoricalChart not switch to false yet -> change it to false
  if (
    globalBackendVariables.isMarketClosed &&
    globalBackendVariables.hasReplacedAllExchangesHistoricalChart
  ) {
    globalBackendVariables.hasReplacedAllExchangesHistoricalChart = false;
  }
};

module.exports = {
  /* 
    - Historical Chart 5 min
    -> From FMP, 5 min historical chart only stores the latest 7 days

    - Historical Chart full 
    -> From FMP, we get stock info (endpoint: historical-price-full) each day from when the company was established.
  */
  getCachedExchangeHistoricalChart,
  pushCachedExchangeHistoricalChartWholeList,
  pushCachedExchangeHistoricalChartLatestItem,
  updateCachedExchangeHistoricalChartWholeList,
  updateCachedExchangeHistoricalChartOneItem,

  resetAllExchangesHistoricalChart
};
