const { isEqual, isEmpty } = require("lodash");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const {
  getAsync,
  setAsync,
  listPushAsync,
  delAsync,
  keysAsync
} = require("../../redis/redis-client");

const { newDate, getYearUTCString } = require("../low-dependency/DayTimeUtil");
const {
  findIfTimeNowIsHoliday,
  findIfTimeNowIsOutOfRange,
  findIfTimeNowIsWeekend
} = require("../MarketTimeUtil");

const {
  parseCachedMarketHoliday,
  createRedisValueFromMarketHoliday
} = require("../low-dependency/ParserUtil");

/**
 * Keys list:
 * - '${email}|transactionsHistoryList': list
 * - '${email}|transactionsHistoryM5RU': list -> Most 5 recently used
 * - '${email}|transactionsHistoryM5RU|numberOfChunksSkipped|filtersString|orderBy|orderQuery': list
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

const cleanUserCache = (email) => {
  return new Promise((resolve, reject) => {
    keysAsync(`${email}*`)
      .then((values) => {
        if (!isEmpty(values)) {
          return delAsync(values);
        }
      })
      .then((numberOfKeysDeleted) => {
        console.log(
          `User Logout - Delete ${numberOfKeysDeleted} Redis Relating Keys\n`
        );
        resolve("Successful");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = {
  // Market Time
  isMarketClosedCheck,

  // User Related
  cachePasswordVerificationCode,
  getParsedCachedPasswordVerificationCode,
  removeCachedPasswordVerificationCode,

  // Ranking Update
  redisUpdateOverallRankingList,
  redisUpdateRegionalRankingList,

  // Market Holiday
  getCachedMarketHoliday,
  updateCachedMarketHoliday,

  cleanUserCache
};
