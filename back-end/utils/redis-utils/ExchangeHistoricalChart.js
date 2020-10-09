const { isEqual } = require("lodash");

const {
  listRangeAsync,
  listLeftPushAsync,
  listPushAsync,
  delAsync
} = require("../../redis/redis-client");

const {
  createRedisValueFromExchangeHistoricalChart,
  parseCachedExchangeHistoricalChartItem
} = require("../low-dependency/ParserUtil");

const { cachedExchangeHistoricalChart } = require("./RedisUtil");

const {
  SequentialPromisesWithResultsArray
} = require("../low-dependency/PromisesUtil");

const {
  getExchangeHistoricalChart5MinFromFMP
} = require("../FinancialModelingPrepUtil");

/**
 * @description Use redis key 'cachedExchangeHistoricalChart|${exchange}'
 * @param {string} exchange NYSE or NASDAQ
 * @return {Promise<object[]>} historicalChartObjectsArray. Each object will look like Historical Stock Index Prices endpoint on FMP
 */
const getCachedExchangeHistoricalChart = (exchange) => {
  return new Promise((resolve, reject) => {
    const redisKey = `${cachedExchangeHistoricalChart}|${exchange}`;

    listRangeAsync(redisKey, 0, -1)
      .then((historicalChartArray) => {
        const historicalChartObjectsArray = historicalChartArray.map(
          (historicalChartItem) => {
            return parseCachedExchangeHistoricalChartItem(historicalChartItem);
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
 * @description Use redis key 'cachedExchangeHistoricalChart|${exchange}'
 * @description
 * - Remove current list
 * - Push each historical chart item to list so that LATEST date to the left (order from FMP too)
 * @param {string} exchange NYSE or NASDAQ
 * @param {object[]} historicalChartArray Array of ohclv chart from FMP
 */
const pushCachedExchangeHistoricalChartWholeList = (
  exchange,
  historicalChartArray
) => {
  return new Promise((resolve, reject) => {
    const redisKey = `${cachedExchangeHistoricalChart}|${exchange}`;
    delAsync(redisKey)
      .then((finishedErasingRecentList) => {
        const tasksList = [];

        historicalChartArray.forEach((historicalChartItem) => {
          const redisValue = createRedisValueFromExchangeHistoricalChart(
            historicalChartItem
          );
          tasksList.push(() => listPushAsync(redisKey, redisValue));
        });

        return SequentialPromisesWithResultsArray(tasksList);
      })
      .then((finishedPushing) => {
        resolve(
          `Successfully finished pushing all historical chart items of exchange ${exchange} to cache`
        );
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * @description Use redis key 'cachedExchangeHistoricalChart|${exchange}'
 * @description Compare latest item of new historical chart to latest one in cache
 * @param {string} exchange NYSE or NASDAQ
 * @param {object[]} newHistoricalChartArray Item of ohclv chart from FMP
 */
const pushCachedExchangeHistoricalChartLatestItem = (
  exchange,
  newHistoricalChartArray
) => {
  return new Promise((resolve, reject) => {
    const redisKey = `${cachedExchangeHistoricalChart}|${exchange}`;
    const redisValue = createRedisValueFromExchangeHistoricalChart(
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
          `Successfully finished pushing latest historical chart items of exchange ${exchange} to cache`
        );
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * @description Use redis key 'cachedExchangeHistoricalChart|${exchange}'
 * @description Update exchange historical chart whole list using FMP
 * @param {string} exchange NYSE or NASDAQ
 */
const updateCachedExchangeHistoricalChartWholeList = (exchange) => {
  return new Promise((resolve, reject) => {
    getExchangeHistoricalChart5MinFromFMP(exchange)
      .then((historicalChartJSON) => {
        return pushCachedExchangeHistoricalChartWholeList(
          exchange,
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
 * @description Use redis key 'cachedExchangeHistoricalChart|${exchange}'
 * @description Update exchange historical chart one item using FMP
 * @param {string} exchange NYSE or NASDAQ
 */
const updateCachedExchangeHistoricalChartOneItem = (exchange) => {
  return new Promise((resolve, reject) => {
    getExchangeHistoricalChart5MinFromFMP(exchange)
      .then((historicalChartJSON) => {
        return pushCachedExchangeHistoricalChartLatestItem(
          exchange,
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
    updateCachedExchangeHistoricalChartWholeList("NYSE");
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
  getCachedExchangeHistoricalChart,
  pushCachedExchangeHistoricalChartWholeList,
  pushCachedExchangeHistoricalChartLatestItem,
  updateCachedExchangeHistoricalChartWholeList,
  updateCachedExchangeHistoricalChartOneItem,

  resetAllExchangesHistoricalChart
};
