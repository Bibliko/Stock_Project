const { isEmpty } = require("lodash");

const { listRangeAsync, listPushAsync } = require("../../redis/redis-client");

const {
  createRedisValueFromHistoricalChart5min,
  parseCachedHistoricalChart5minItem,
  parseCachedHistoricalChartFullItem,
  createRedisValueFromHistoricalChartFull
} = require("../low-dependency/ParserUtil");

const {
  cachedHistoricalChartFull,
  cachedHistoricalChart5min
} = require("./RedisUtil");

const { getHistoricalChartFromFMP } = require("../FinancialModelingPrepUtil");

const {
  SequentialPromisesWithResultsArray
} = require("../low-dependency/PromisesUtil");

const { oneMinute } = require("../low-dependency/DayTimeUtil");

const redisClient = require("../../redis/redis-client");

/**
 * @description Check if exchange is really an exchange and is supported in our platform
 * @param {String} exchange
 */
const isExchangeSupported = (exchange) => {
  return exchange === "NYSE" || exchange === "NASDAQ";
};

/**
 * @description Use redis key 'cachedHistoricalChart5min|${exchangeOrCompany}' or 'cachedHistoricalChartFull|${exchangeOrCompany}'
 * @param {string} exchangeOrCompany NYSE or NASDAQ or company code
 * @param {string} typeChart 5min or full
 * @param {boolean} getFromCacheDirectly
 * @return {Promise<object[]>} historicalChartObjectsArray. Each object will look like Historical Stock Index Prices endpoint on FMP
 */
const getCachedHistoricalChart = (
  exchangeOrCompany,
  typeChart,
  getFromCacheDirectly
) => {
  return new Promise((resolve, reject) => {
    const cacheSection =
      typeChart === "5min"
        ? cachedHistoricalChart5min
        : typeChart === "full"
        ? cachedHistoricalChartFull
        : "";
    if (isEmpty(cacheSection)) {
      reject(new Error("FMP Chart Type should be 5min or full."));
    }

    const redisKey = `${cacheSection}|${exchangeOrCompany}`;

    listRangeAsync(redisKey, 0, -1)
      .then((historicalChartArray) => {
        const timeNow = new Date().getTime();
        const timestampLastUpdated = parseInt(
          historicalChartArray[historicalChartArray.length - 1],
          10
        );

        // If there is already cache AND time now is within 1 minute after time last updated
        if (
          !isEmpty(historicalChartArray) &&
          (timeNow < timestampLastUpdated + oneMinute || getFromCacheDirectly)
        ) {
          // Array of parsed history chart items
          const historicalChartObjectsArray = historicalChartArray
            .slice(0, historicalChartArray.length - 1)
            .map((historicalChartItem) => {
              if (typeChart === "5min") {
                return parseCachedHistoricalChart5minItem(historicalChartItem);
              }
              return parseCachedHistoricalChartFullItem(historicalChartItem);
            });

          resolve(historicalChartObjectsArray);
          return null;
        } else if (isEmpty(historicalChartArray)) {
          // Use multi redis transaction to do: Take from FMP, resolve, and update cache
          return Promise.all([
            getHistoricalChartFromFMP(exchangeOrCompany, typeChart),
            "Empty Cache"
          ]);
        } else {
          return Promise.all([
            getHistoricalChartFromFMP(exchangeOrCompany, typeChart),
            "Later Time"
          ]);
        }
      })
      .then((dataArray) => {
        if (dataArray) {
          const historicalChartFromFMP = dataArray[0];
          const message = dataArray[1];

          resolve(historicalChartFromFMP);

          if (message === "Empty Cache") {
            return createCachedHistoricalChartWholeList(
              exchangeOrCompany,
              typeChart,
              historicalChartFromFMP
            );
          }

          if (message === "Later Time") {
            return updateCachedHistoricalChartWholeList(
              exchangeOrCompany,
              typeChart,
              historicalChartFromFMP
            );
          }
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * @description Create the whole new list
 * @param {String} exchangeOrCompany NYSE or NASDAQ or company code
 * @param {String} typeChart 5min or full
 * @param {object[]} newHistoricalChartArray
 */
const createCachedHistoricalChartWholeList = (
  exchangeOrCompany,
  typeChart,
  newHistoricalChartArray
) => {
  return new Promise((resolve, reject) => {
    const cacheSection =
      typeChart === "5min"
        ? cachedHistoricalChart5min
        : typeChart === "full"
        ? cachedHistoricalChartFull
        : "";
    if (isEmpty(cacheSection)) {
      reject(new Error("FMP Chart Type should be 5min or full."));
    }

    const redisKey = `${cacheSection}|${exchangeOrCompany}`;

    const tasksList = [];

    newHistoricalChartArray.forEach((historicalChartItem, index) => {
      const redisValue =
        typeChart === "5min"
          ? createRedisValueFromHistoricalChart5min(historicalChartItem)
          : createRedisValueFromHistoricalChartFull(historicalChartItem);
      tasksList.push(() => listPushAsync(redisKey, redisValue));
    });

    // Push timestamp last updated: which is NOW
    tasksList.push(() => listPushAsync(redisKey, new Date().getTime()));

    SequentialPromisesWithResultsArray(tasksList)
      .then((done) => {
        console.log(
          `Created successfully historical chart ${typeChart} items of exchange or company ${exchangeOrCompany} to cache`
        );
        resolve("DONE");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * @description Delete old cached list AND create the whole new list with Redis Transaction method
 * @param {String} exchangeOrCompany NYSE or NASDAQ or company code
 * @param {String} typeChart 5min or full
 * @param {object[]} newHistoricalChartArray
 */
const updateCachedHistoricalChartWholeList = (
  exchangeOrCompany,
  typeChart,
  newHistoricalChartArray
) => {
  return new Promise((resolve, reject) => {
    const cacheSection =
      typeChart === "5min"
        ? cachedHistoricalChart5min
        : typeChart === "full"
        ? cachedHistoricalChartFull
        : "";
    if (isEmpty(cacheSection)) {
      reject(new Error("FMP Chart Type should be 5min or full."));
    }

    const redisKey = `${cacheSection}|${exchangeOrCompany}`;

    const multi = redisClient.multi();

    redisClient
      .watchAsync(redisKey)
      .then((watched) => {
        multi.delAsync(redisKey);
        newHistoricalChartArray.forEach((historicalChartItem) => {
          const redisValue =
            typeChart === "5min"
              ? createRedisValueFromHistoricalChart5min(historicalChartItem)
              : createRedisValueFromHistoricalChartFull(historicalChartItem);

          multi.rpushAsync(redisKey, redisValue);
        });

        // Push timestamp last updated: which is NOW
        multi.rpushAsync(redisKey, new Date().getTime());

        return multi.execAsync();
      })
      .then((done) => {
        console.log(
          `Updated successfully historical chart ${typeChart} items of exchange or company ${exchangeOrCompany} to cache`
        );
        resolve("DONE");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = {
  /* 
    - Historical Chart 5 min
    -> From FMP, 5 min historical chart only stores the latest 7 days

    - Historical Chart full 
    -> From FMP, we get stock info (endpoint: historical-price-full) each day from when the company was established.
  */
  getCachedHistoricalChart,
  createCachedHistoricalChartWholeList,
  updateCachedHistoricalChartWholeList,
  isExchangeSupported
};
