const { cachedMostGainers } = require("./RedisUtil");
const { getMostGainersFromFMP } = require("../FinancialModelingPrepUtil");
const {
  SequentialPromisesWithResultsArray
} = require("../low-dependency/PromisesUtil");
const {
  createRedisValueFromMostGainer
} = require("../low-dependency/ParserUtil");
const {
  delAsync,
  listPushAsync,
  listLengthAsync
} = require("../../redis/redis-client");
const { NODE_ENV } = require('../../config');

/**
 * @description Cache all gainers in that day.
 * @param {object[]} mostGainers Array of most gainers from FMP
 */
const cacheMostGainers = (mostGainers) => {
  return new Promise((resolve, reject) => {
    delAsync(cachedMostGainers)
      .then((done) => {
        const tasksList = [];

        mostGainers.forEach((gainer) => {
          const value = createRedisValueFromMostGainer(gainer);
          tasksList.push(() => listPushAsync(cachedMostGainers, value));
        });

        return SequentialPromisesWithResultsArray(tasksList);
      })
      .then((finished) => {
        resolve("Successful");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * @description Get and cache all gainers in that day.
 * @param {object} globalBackendVariables Is in back-end/index.js
 */
const getMostGainersAndCache = (globalBackendVariables) => {
  listLengthAsync(cachedMostGainers)
    .then((length) => {
      if (length > 0 && NODE_ENV === "development") {
        console.log(
          "[DEVELOPMENT MODE] Unnecessary gainers (companies) update has been prevented."
        );
        return;
      }

      return getMostGainersFromFMP();
    })
    .then((mostGainers) => {
      if (mostGainers) {
        return cacheMostGainers(mostGainers);
      }
    })
    .then((done) => {
      globalBackendVariables.updatedMostGainersFlag = !globalBackendVariables.updatedMostGainersFlag;
      console.log("Successfully get and cache most gainers (companies).\n");
    })
    .catch((err) => {
      console.log(err);
    });
};

/**
 *
 * @param {object} globalBackendVariables Is in back-end/index.js
 */
const updateMostGainersDaily = (globalBackendVariables) => {
  if (!globalBackendVariables.isPrismaMarketHolidaysInitialized) {
    return;
  }

  // if market is opened but flag hasUpdatedMostGainersToday is still false
  // -> change it to true AND updateMostGainers
  if (
    !globalBackendVariables.isMarketClosed &&
    !globalBackendVariables.hasUpdatedMostGainersToday
  ) {
    globalBackendVariables.hasUpdatedMostGainersToday = true;
    getMostGainersAndCache(globalBackendVariables);
  }

  // if market is closed but flag hasUpdatedMostGainersToday not switch to false yet -> change it to false
  if (
    globalBackendVariables.isMarketClosed &&
    globalBackendVariables.hasUpdatedMostGainersToday
  ) {
    globalBackendVariables.hasUpdatedMostGainersToday = false;
  }
};

module.exports = {
  cacheMostGainers,
  getMostGainersAndCache,
  updateMostGainersDaily
};
