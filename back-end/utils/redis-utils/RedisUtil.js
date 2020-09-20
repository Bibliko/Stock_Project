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
 * @returns true if market is closed, false if market is opened
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
 * @use Redis key 'email|passwordVerification' : 'secretCode|timestamp'
 * @description Put verification code of user into cache section of that user
 * @param email User email
 * @param secretCode User randomly generated verification code
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

/**
 * @description Get verification code from cache section of user
 * @param email User email
 */
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

/**
 * @description Remove verification code cache section of user
 * @param email User email
 */
const removeCachedPasswordVerificationCode = (email) => {
  const redisKey = `${email}|passwordVerification`;
  return delAsync(redisKey);
};

/**
 * @description Add user into users ranking list
 * @param user User object containing attributes as in Prisma User Model
 */
const redisUpdateOverallRankingList = (user) => {
  const value = `${user.firstName}|${user.lastName}|${user.totalPortfolio}|${user.region}`;
  return listPushAsync("RANKING_LIST", value);
};

/**
 * @description Add user into users ranking list of a specific region
 * @param region Region: Africa, Asia, The Caribbean, Central America, Europe, North America, Oceania, South America
 * @param user User object containing attributes as in Prisma User Model
 */
const redisUpdateRegionalRankingList = (region, user) => {
  const value = `${user.firstName}|${user.lastName}|${user.totalPortfolio}|${user.region}`;
  return listPushAsync(`RANKING_LIST_${region}`, value);
};

/**
 * @returns Market Holiday Object obtained from Cache
 */
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

/**
 * @description Cache market holiday object
 * @param marketHoliday Market Holiday Object obtained from Database
 */
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
 * @description Clean all user's cache sections
 * @param email User email
 */
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
