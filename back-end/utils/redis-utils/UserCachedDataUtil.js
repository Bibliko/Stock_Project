const { isEmpty } = require("lodash");

const {
  getAsync,
  keysAsync,
  renameAsync,
  delAsync,
  listPushAsync,
  listRangeAsync
} = require("../../redis/redis-client");

const {
  sharesList,
  accountSummaryChart,
  clientTimestampLastJoinInSocketRoom
} = require("./RedisUtil");

const {
  SequentialPromisesWithResultsArray
} = require("../low-dependency/PromisesUtil");

const {
  getUserAccountSummaryChartTimestamps
} = require("../low-dependency/PrismaUserDataUtil");

const { getYearUTCString, newDate } = require("../low-dependency/DayTimeUtil");

/**
 * @param email User email
 * @param shares Prisma shares used to cache
 */
const pushWholeListToCachedSharesList = (email, shares) => {
  return new Promise((resolve, reject) => {
    const redisKey = `${email}|${sharesList}`;

    const tasksList = [];

    shares.forEach((share) => {
      const { id, companyCode, quantity, buyPriceAvg, userID } = share;
      const newValue = `${id}|${companyCode}|${quantity}|${buyPriceAvg}|${userID}`;
      tasksList.push(() => listPushAsync(redisKey, newValue));
    });

    SequentialPromisesWithResultsArray(tasksList)
      .then((finishedUpdatingRedisSharesList) => {
        resolve("Finished update cached shares list.");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * @param email User email
 * @param timestamps Prisma account summary timestamps used to cache
 */
const pushWholeListToCachedAccountSummaryTimestamps = (email, timestamps) => {
  return new Promise((resolve, reject) => {
    const redisKey = `${email}|${accountSummaryChart}`;

    const tasksList = [];

    timestamps.forEach((timestamp) => {
      const { UTCDateString, portfolioValue } = timestamp;
      const newValue = `${UTCDateString}|${portfolioValue}`;
      tasksList.push(() => listPushAsync(redisKey, newValue));
    });

    SequentialPromisesWithResultsArray(tasksList)
      .then((finishedUpdatingRedisTimestampsList) => {
        resolve("Finished update cached account summary timestamps list.");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * @param email User email
 * @param UTCDateString newDate() from utils/low-dependency/DayTimeUtil.js
 * @param portfolioValue Portfolio value at this timestamp
 */
const pushOneItemToCachedAccountSummaryTimestamps = (
  email,
  UTCDateString,
  portfolioValue
) => {
  return new Promise((resolve, reject) => {
    const redisKey = `${email}|${accountSummaryChart}`;
    const newValue = `${UTCDateString}|${portfolioValue}`;

    listPushAsync(redisKey, newValue)
      .then((finishedUpdatingRedisAccountSummaryChart) => {
        resolve(
          "Finished push one item to cached account summary timestamps list."
        );
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const getLastItemOfCachedAccountSummaryTimestamps = (email) => {
  return new Promise((resolve, reject) => {
    const redisKey = `${email}|${accountSummaryChart}`;
    listRangeAsync(redisKey, -1, -1)
      .then((array) => {
        if (!isEmpty(array)) {
          resolve(array[0]);
        } else {
          resolve(null);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * @description Clean all user's cache sections
 * @param email User email
 */
const cleanUserCache = (email) => {
  return new Promise((resolve, reject) => {
    getAsync(`${email}|${clientTimestampLastJoinInSocketRoom}`)
      .then((timestamp) => {
        return keysAsync(`${email}*`);
      })
      .then((keys) => {
        if (keys && !isEmpty(keys)) {
          return delAsync(keys);
        }
      })
      .then((numberOfKeysDeleted) => {
        console.log(
          `User Leaves -> Delete ${numberOfKeysDeleted} Redis Relating Keys\n`
        );
        resolve("Successful");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * @param email User email
 * @param chosenKey Redis key that is listed in RedisUtil Keys
 */
const cleanChosenUserCache = (email, chosenKey) => {
  return new Promise((resolve, reject) => {
    delAsync(`${email}|${chosenKey}`)
      .then((successfullyCleanKey) => {
        resolve("Successful");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * @description After clean cache of account summary timestamps, get the new ones from database and cache
 * @param email User email
 */
const resetUserCachedAccountSummaryTimestamps = (email) => {
  return new Promise((resolve, reject) => {
    cleanChosenUserCache(email, accountSummaryChart)
      .then(() => {
        return getUserAccountSummaryChartTimestamps(
          email,
          getYearUTCString(newDate()) - 2
        );
      })
      .then((timestamps) => {
        return pushWholeListToCachedAccountSummaryTimestamps(email, timestamps);
      })
      .then((finishedResetting) => {
        resolve("Finished resetting user cached account summary timestamps");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * @description Change names of cache keys
 * @param newEmail User new email
 * @param oldEmail User old email
 */
const changeNameUserCacheKeys = (newEmail, oldEmail) => {
  return new Promise((resolve, reject) => {
    keysAsync(`${oldEmail}*`)
      .then((keys) => {
        if (keys) {
          const changeNameKeys = keys.map((key) => {
            const indexSplitLine = key.indexOf("|");
            const extraInfoInKey = key.substring(indexSplitLine + 1);
            const newKey = `${newEmail}|${extraInfoInKey}`;

            return renameAsync(key, newKey);
          });
          return Promise.all(changeNameKeys);
        }
      })
      .then(() => {
        console.log(`Successfully change names of user's keys.\n`);
        resolve("Successful");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = {
  pushWholeListToCachedSharesList,

  pushWholeListToCachedAccountSummaryTimestamps,
  pushOneItemToCachedAccountSummaryTimestamps,

  getLastItemOfCachedAccountSummaryTimestamps,

  cleanUserCache,
  cleanChosenUserCache,
  resetUserCachedAccountSummaryTimestamps,

  changeNameUserCacheKeys
};
