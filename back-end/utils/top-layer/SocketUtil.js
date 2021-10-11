const { isEmpty } = require("lodash");
const { prisma } = require("../low-dependency/PrismaClient");

const { listRangeAsync } = require("../../redis/redis-client");

const { sharesList, accountSummaryChart } = require("../redis-utils/RedisUtil");

const { newDate, oneMinute } = require("../low-dependency/DayTimeUtil");

const {
  pushWholeListToCachedSharesList,
  pushWholeListToCachedAccountSummaryTimestamps,
  pushOneItemToCachedAccountSummaryTimestamps,
  getLastItemOfCachedAccountSummaryTimestamps
} = require("../redis-utils/UserCachedDataUtil");

const {
  parseAccountSummaryTimestamp
} = require("../low-dependency/ParserUtil");

const setupCachedSharesListForUserIfNecessary = (email) => {
  return new Promise((resolve, reject) => {
    const redisKey = `${email}|${sharesList}`;

    listRangeAsync(redisKey, 0, -1)
      .then((sharesList) => {
        if (isEmpty(sharesList)) {
          return prisma.user.findUnique({
            where: {
              email
            },
            select: {
              shares: true
            }
          });
        }
      })
      .then((sharesData) => {
        if (sharesData) {
          const { shares } = sharesData;
          if (!isEmpty(shares)) {
            return pushWholeListToCachedSharesList(email, shares);
          }
        }
      })
      .then((afterUpdatingCachedSharesList) => {
        resolve("Finished setting up Redis Shares List.");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const setupCachedAccountSummaryTimestampsIfNecessary = (
  email,
  afterOrEqualThisYearInteger
) => {
  return new Promise((resolve, reject) => {
    const redisKey = `${email}|${accountSummaryChart}`;

    listRangeAsync(redisKey, 0, -1)
      .then((timestampArray) => {
        if (isEmpty(timestampArray)) {
          return prisma.accountSummaryTimestamp.findMany({
            where: {
              user: {
                email
              },
              year: {
                gte: afterOrEqualThisYearInteger
              }
            }
          });
        }
      })
      .then((timestamps) => {
        if (timestamps && !isEmpty(timestamps)) {
          return pushWholeListToCachedAccountSummaryTimestamps(
            email,
            timestamps
          );
        }
      })
      .then((afterUpdatingCachedAccountSummaryTimestampsList) => {
        resolve("Finished setting up Redis Account Summary Timestamps List.");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * @param email User email
 * @param afterOrEqualThisYearInteger Specific year from which we want to cache account summary timestamps up till now.
 */
const setupAllCacheSession = (email, afterOrEqualThisYearInteger) => {
  return Promise.all([
    setupCachedSharesListForUserIfNecessary(email),
    setupCachedAccountSummaryTimestampsIfNecessary(
      email,
      afterOrEqualThisYearInteger
    )
  ]);
};

const updateUserCacheSession = (email) => {
  return new Promise((resolve, reject) => {
    const timeNow = newDate();

    getLastItemOfCachedAccountSummaryTimestamps(email)
      .then((timestampString) => {
        if (!timestampString) {
          return prisma.user.findUnique({
            where: { email },
            select: { totalPortfolio: true }
          });
        }

        const { UTCDateString } = parseAccountSummaryTimestamp(timestampString);
        const milisecNow = new Date(timeNow).getTime();
        const milisecInCache = new Date(UTCDateString).getTime();

        if (milisecNow >= milisecInCache + oneMinute) {
          return prisma.user.findUnique({
            where: { email },
            select: { totalPortfolio: true }
          });
        }
      })
      .then((userData) => {
        if (userData) {
          const { totalPortfolio } = userData;
          return pushOneItemToCachedAccountSummaryTimestamps(
            email,
            timeNow,
            totalPortfolio
          );
        }
      })
      .then((finishedUpdatingCacheSession) => {
        resolve("Finished updating user cache session.");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = {
  setupCachedSharesListForUserIfNecessary,
  setupCachedAccountSummaryTimestampsIfNecessary,
  setupAllCacheSession,

  updateUserCacheSession
};
