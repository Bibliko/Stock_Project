const {
  newDate,
  getFullDateUTCString,
  getYearUTCString
} = require("../low-dependency/DayTimeUtil");

const {
  PrismaClient
} = require("@prisma/client");
const prisma = new PrismaClient();
const {
  keysAsync,
  delAsync
} = require("../../redis/redis-client");
const {
  isEqual,
  isEmpty
} = require("lodash");

const {
  isMarketClosedCheck,

  redisUpdateOverallRankingList,
  redisUpdateRegionalRankingList
} = require("../RedisUtil");

const deleteExpiredVerification = () => {
  let date = new Date();
  date = date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
  prisma.userVerification
    .deleteMany({
      where: {
        expiredAt: date
      }
    })
    .then((res) => {
      console.log("Deleted", res, "email verifications");
    })
    .catch((err) => {
      console.log(err);
    });
};

const createAccountSummaryChartTimestampIfNecessary = (user) => {
  return new Promise((resolve, reject) => {
    prisma.accountSummaryTimestamp
      .findOne({
        where: {
          UTCDateKey_userID: {
            UTCDateKey: getFullDateUTCString(newDate()),
            userID: user.id
          }
        }
      })
      .then((timestamp) => {
        if (!timestamp) {
          return prisma.accountSummaryTimestamp.create({
            data: {
              UTCDateString: newDate(),
              UTCDateKey: getFullDateUTCString(newDate()),
              year: getYearUTCString(newDate()),
              portfolioValue: user.totalPortfolio,
              user: {
                connect: {
                  id: user.id
                }
              }
            }
          });
        }
      })
      .then(() => {
        console.log("Finished finding and creating timestamp");
        resolve("Finished finding and creating timestamp");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const createRankingTimestampIfNecessary = (user) => {
  return new Promise((resolve, reject) => {
    prisma.RankingTimestamp.findOne({
        where: {
          UTCDateKey_userID: {
            UTCDateKey: getFullDateUTCString(newDate()),
            userID: user.id
          }
        }
      }).then((timestamp) => {
        if (!timestamp) {
          prisma.RankingTimestamp.create({
            data: {
              UTCDateString: newDate(),
              UTCDateKey: getFullDateUTCString(newDate()),
              year: getYearUTCString(newDate()),
              ranking: user.ranking,
              regionalRanking: user.regionalRanking,
              user: {
                connect: {
                  id: user.id
                }
              }
            }
          })
        }
      })
      .then(() => {
        console.log("Finished finding and creating timestamp");
        resolve("Finished finding and creating timestamp");
      })
      .catch((err) => {
        reject(err);
      })
  });
}

const updateRankingList = () => {
  keysAsync("RANKING_LIST*")
    .then((keysList) => {
      if (!isEmpty(keysList)) {
        return delAsync(keysList);
      }
    })
    .then(() => {
      console.log(`Deleted all redis ranking relating lists\n`);

      return prisma.user.findMany({
        where: {
          hasFinishedSettingUp: true
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          totalPortfolio: true,
          region: true
        },
        orderBy: [{
          totalPortfolio: "desc"
        }]
      });
    })
    .then((usersArray) => {
      console.log(`Updating ${usersArray.length} user(s): ranking`);

      const regionsList = new Map(); // `region : recent rank`
      const updateAllUsersRanking = usersArray.map((user, index) => {
        const nowRegion = user.region;

        if (regionsList.has(nowRegion)) {
          regionsList.set(nowRegion, regionsList.get(nowRegion) + 1);
        } else {
          regionsList.set(nowRegion, 1);
        }

        const updateUserRanking = prisma.user.update({
          where: {
            id: user.id
          },
          data: {
            ranking: index + 1,
            regionalRanking: regionsList.get(nowRegion)
          }
        });

        return Promise.all([
          updateUserRanking,
          redisUpdateOverallRankingList(user),
          redisUpdateRegionalRankingList(nowRegion, user)
        ]);
      });

      return Promise.all(updateAllUsersRanking);
    })
    .then(() => {
      console.log("Successfully updated all users ranking\n");
    })
    .catch((err) => {
      console.log(err);
    });
};

const updateAllUsers = () => {
  // update portfolioLastClosure and ranking for all users

  prisma.user
    .findMany({
      where: {
        hasFinishedSettingUp: true
      },
      select: {
        id: true,
        totalPortfolio: true
      },
      orderBy: [{
        totalPortfolio: "desc"
      }]
    })
    .then((usersArray) => {
      console.log(
        `Updating ${usersArray.length} user(s): portfolioLastClosure and accountSummaryTimestamp`
      );

      const updateAllUsersPromise = usersArray.map((user, index) => {
        const updatePortfolioLastClosure = prisma.user.update({
          where: {
            id: user.id
          },
          data: {
            totalPortfolioLastClosure: user.totalPortfolio
          }
        });

        const accountSummaryPromise = createAccountSummaryChartTimestampIfNecessary(user);
        const accountRankingPromise = createRankingTimestampIfNecessary(user)

        return Promise.all([updatePortfolioLastClosure, accountSummaryPromise, accountRankingPromise]);
      });
      return Promise.all(updateAllUsersPromise);
    })
    .then(() => {
      console.log(
        "Successfully updated all users portfolioLastClosure and accountSummaryChartTimestamp\n"
      );
    })
    .catch((err) => {
      console.log(err);
    });
};

/**
 * objVariables: object passed in from back-end/index
 */
const checkAndUpdateAllUsers = (objVariables) => {
  if (!objVariables.isPrismaMarketHolidaysInitialized) {
    return;
  }

  isMarketClosedCheck()
    .then((checkResult) => {
      // check if market is closed and update the status of objVariables
      if (!isEqual(checkResult, objVariables.isMarketClosed)) {
        objVariables.isMarketClosed = checkResult;
      }

      // if market is closed but flag isAlreadyUpdate is still false
      // -> change it to true AND updatePortfolioLastClosure
      if (
        objVariables.isMarketClosed &&
        !objVariables.isAlreadyUpdateAllUsers
      ) {
        objVariables.isAlreadyUpdateAllUsers = true;
        updateAllUsers();
      }

      // if market is opened but flag isAlreadyUpdate not switch to false yet -> change it to false
      if (
        !objVariables.isMarketClosed &&
        objVariables.isAlreadyUpdateAllUsers
      ) {
        objVariables.isAlreadyUpdateAllUsers = false;
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

/**
 * if searchBy === 'type' -> searchQuery takes in two of these parameters 'buy' or 'sell'
 * if searchBy === 'companyCode' -> searchQuery takes in any non-empty string
 *
 *
 */
const getChunkUserTransactionsHistoryForRedisM5RU = (
  email,
  chunkSize, // required
  numberOfChunksSkipped, // required
  searchBy, // 'none' or 'type' or 'companyCode'
  searchQuery, // 'none' or 'buy'/'sell' or RANDOM
  orderBy, // 'none' or '...'
  orderQuery // 'none' or 'desc' or 'asc'
) => {
  // Each transactions history page has 10 items, but we cache beforehand 100 items
  return new Promise((resolve, reject) => {
    const filtering = {
      isFinished: true
    };
    if (isEqual(searchBy, "companyCode")) {
      filtering.companyCode = {
        contains: searchQuery
      };
    }
    if (isEqual(searchBy, "type")) {
      filtering.isTypeBuy = isEqual(searchQuery, "buy");
    }

    const orderObject = {};
    if (!isEqual(orderBy, "none")) {
      orderObject[`${orderBy}`] = orderQuery;
    }

    const orderByPrisma = [];
    if (!isEmpty(orderObject)) {
      orderByPrisma.push(orderObject);
    }

    prisma.user
      .findOne({
        where: {
          email
        }
      })
      .transactions({
        where: filtering,
        orderBy: orderByPrisma,
        skip: chunkSize * numberOfChunksSkipped,
        take: chunkSize
      })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
const getLengthUserTransactionsHistoryForRedisM5RU = (
  email,
  searchBy, // 'none' or 'type' or 'companyCode'
  searchQuery // 'none' or 'buy'/'sell' or RANDOM
) => {
  return new Promise((resolve, reject) => {
    const filtering = {
      isFinished: true
    };
    if (isEqual(searchBy, "companyCode")) {
      filtering.companyCode = {
        contains: searchQuery
      };
    }
    if (isEqual(searchBy, "type")) {
      filtering.isTypeBuy = isEqual(searchQuery, "buy");
    }

    prisma.user
      .findOne({
        where: {
          email
        }
      })
      .transactions({
        where: filtering
      })
      .then((data) => {
        resolve(data.length);
      })
      .catch((err) => {
        reject(err);
      });
  });
};



module.exports = {
  deleteExpiredVerification,

  createAccountSummaryChartTimestampIfNecessary,

  updateAllUsers,
  checkAndUpdateAllUsers,

  updateRankingList,

  getChunkUserTransactionsHistoryForRedisM5RU,
  getLengthUserTransactionsHistoryForRedisM5RU
};