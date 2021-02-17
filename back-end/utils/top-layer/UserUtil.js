const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { keysAsync, delAsync } = require("../../redis/redis-client");
const { isEqual, isEmpty } = require("lodash");

const {
  redisUpdateOverallRankingList,
  redisUpdateRegionalRankingList
} = require("../redis-utils/RedisUtil");

const {
  resetUserCachedAccountSummaryTimestamps
} = require("../redis-utils/UserCachedDataUtil");

const {
  newDate,
  getFullDateUTCString,
  getYearUTCString
} = require("../low-dependency/DayTimeUtil");

const { createPrismaFiltersObject } = require("../low-dependency/ParserUtil");
const {
  SequentialPromisesWithResultsArray
} = require("../low-dependency/PromisesUtil");

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
      .findUnique({
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
        console.log("Finished finding and creating account summary timestamp");
        resolve("Finished finding and creating account summary timestamp");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const createRankingTimestampIfNecessary = (user) => {
  return new Promise((resolve, reject) => {
    prisma.rankingTimestamp
      .findUnique({
        where: {
          UTCDateKey_userID: {
            UTCDateKey: getFullDateUTCString(newDate()),
            userID: user.id
          }
        }
      })
      .then((timestamp) => {
        if (!timestamp) {
          return prisma.rankingTimestamp.create({
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
          });
        }
      })
      .then(() => {
        console.log("Finished finding and creating ranking timestamp");
        resolve("Finished finding and creating ranking timestamp");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * @description_1 Update ranking and regional of each user in server.
 * @description_2 Update both data in database and in cache.
 * @description_3 Switch globalBackendVariables updatedRankingList flag whenever finished.
 * @param globalBackendVariables Is in back-end/index.js
 */
const updateRankingList = (globalBackendVariables) => {
  if (!globalBackendVariables.isPrismaMarketHolidaysInitialized) {
    return;
  }

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
        orderBy: [
          {
            totalPortfolio: "desc"
          }
        ]
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
      globalBackendVariables.updatedRankingListFlag = !globalBackendVariables.updatedRankingListFlag;
      console.log("Successfully updated all users ranking\n");
    })
    .catch((err) => {
      console.log(err);
    });
};

/**
 * @description_1 Update for all users in server
 * - portfolioLastClosure
 * - accountSummaryTimestamp
 * - rankingTimestamp
 * @description_2 Update data in database only.
 * @description_3
 * - Clean cache for account summary chart timestamps of each user
 * - On front-end, Layout.js will check updatedAllUsersFlag and update front-end account summary timestamps of user
 * @description_3 Switch globalBackendVariables updatedAllUsers flag whenever finished.
 * @param {object} globalBackendVariables Is in back-end/index.js
 */
const updateAllUsers = (globalBackendVariables) => {
  prisma.user
    .findMany({
      where: {
        hasFinishedSettingUp: true
      },
      select: {
        id: true,
        email: true,
        totalPortfolio: true,
        ranking: true,
        regionalRanking: true
      }
    })
    .then((usersArray) => {
      console.log(
        `Updating ${usersArray.length} user(s): portfolioLastClosure, accountSummaryTimestamp, rankingTimestamp`
      );

      const tasksList = [];

      usersArray.forEach((user, index) => {
        const updatePortfolioLastClosure = prisma.user.update({
          where: {
            id: user.id
          },
          data: {
            totalPortfolioLastClosure: user.totalPortfolio
          }
        });

        const accountSummaryPromise = createAccountSummaryChartTimestampIfNecessary(
          user
        );

        const rankingPromise = createRankingTimestampIfNecessary(user);

        tasksList.push(() => {
          return Promise.all([
            updatePortfolioLastClosure,
            accountSummaryPromise,
            rankingPromise,
            resetUserCachedAccountSummaryTimestamps(user.email)
          ]);
        });
      });

      return SequentialPromisesWithResultsArray(tasksList);
    })
    .then(() => {
      globalBackendVariables.updatedAllUsersFlag = !globalBackendVariables.updatedAllUsersFlag;
      console.log(
        "Successfully updated all users portfolioLastClosure, accountSummaryTimestamp, rankingTimestamp\n"
      );
    })
    .catch((err) => {
      console.log(err);
    });
};

/**
 * @description_1 Switch flag hasUpdatedAllUsersToday according to isMarketClosed
 * @description_2 Update all users data in database
 * @param globalBackendVariables object passed in from back-end/index
 */
const checkAndUpdateAllUsers = (globalBackendVariables) => {
  if (!globalBackendVariables.isPrismaMarketHolidaysInitialized) {
    return;
  }

  // if market is closed but flag hasUpdatedAllUsersToday is still false
  // -> change it to true AND updatePortfolioLastClosure
  if (
    globalBackendVariables.isMarketClosed &&
    !globalBackendVariables.hasUpdatedAllUsersToday
  ) {
    globalBackendVariables.hasUpdatedAllUsersToday = true;
    updateAllUsers(globalBackendVariables);
  }

  // if market is opened but flag hasUpdatedAllUsersToday not switch to false yet -> change it to false
  if (
    !globalBackendVariables.isMarketClosed &&
    globalBackendVariables.hasUpdatedAllUsersToday
  ) {
    globalBackendVariables.hasUpdatedAllUsersToday = false;
  }
};

const getChunkUserTransactionsHistoryForRedisM5RU = (
  email,
  chunkSize, // required
  numberOfChunksSkipped, // required
  filters,
  orderBy, // 'none' or '...'
  orderQuery // 'none' or 'desc' or 'asc'
) => {
  // Each transactions history page has 10 items, but we cache beforehand 100 items
  return new Promise((resolve, reject) => {
    const filtering = createPrismaFiltersObject(filters);

    // Order
    const orderObject = {};
    if (!isEqual(orderBy, "none")) {
      orderObject[`${orderBy}`] = orderQuery;
    }

    const orderByPrisma = [];
    if (!isEmpty(orderObject)) {
      orderByPrisma.push(orderObject);
    }

    prisma.user
      .findUnique({
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
const getLengthUserTransactionsHistoryForRedisM5RU = (email, filters) => {
  return new Promise((resolve, reject) => {
    const filtering = createPrismaFiltersObject(filters);

    prisma.user
      .findUnique({
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

/**
 * Buy or Sell a single transaction
 * @param {string} transactionID
 * @param {number} recentPrice
 */
const proceedTransaction = (transactionID, recentPrice) => {
  return new Promise((resolve, reject) => {
    return prisma.userTransaction
      .findUnique({
        where: {
          id: transactionID
        }
      })
      .then((userTransaction) => {
        const { user, isTypeBuy, quantity, companyCode } = userTransaction;

        const totalPendingPrice = recentPrice * quantity;
        if (isTypeBuy) {
          /**
           * Buy Event
           */
          if (user.cash < totalPendingPrice)
            reject(
              new Error(
                "The user does not have enough money to buy the pending stock"
              )
            );
          else {
            user.cash -= totalPendingPrice;
            prisma.share
              .findUnique({
                where: {
                  companyCode: companyCode
                }
              })
              .then((buyShare) => {
                if (!buyShare) {
                  prisma.share.create({
                    companyCode: companyCode,
                    quantity: quantity,
                    buyPriceAvg: recentPrice,
                    user: user,
                    userID: user.id
                  });
                } else {
                  buyShare.buyPriceAvg =
                    (buyShare.buyPriceAvg * buyShare.quantity +
                      recentPrice * (buyShare.quantity + quantity)) /
                    (quantity + buyShare.quantity);

                  buyShare.quantity += quantity;
                }
              });
          }
        } else {
          /**
           * Sell Event
           */
          user.cash += totalPendingPrice;
          prisma.share
            .findUnique({
              where: {
                companyCode: companyCode
              }
            })
            .then((sellShare) => {
              if (!sellShare) reject(new Error("Couldn't find transaction"));
              else if (quantity > sellShare.quantity) {
                reject(new Error("Not enough available shares"));
              } else {
                if (quantity === sellShare.quantity) {
                  prisma.share.delete({
                    where: {
                      companyCode: companyCode
                    }
                  });
                } else {
                  prisma.share
                    .findUnique({
                      where: {
                        companyCode: companyCode
                      }
                    })
                    .then((sellShare) => (sellShare.quantity -= quantity));
                }
              }
            });
        }
        return userTransaction;
      })
      .then((transaction) => {
        /**
         * Update status of the transaction.
         */
        transaction.isFinished = true;
        transaction.finishedTime = Date.now();
        transaction.priceAtTransaction = recentPrice;

        transaction.spendOrGain =
          transaction.priceAtTransaction * transaction.quantity +
          transaction.isTypeBuy
            ? transaction.brokerage
            : -transaction.brokerage;
      })
      .then((finishedProceedingTransaction) =>
        resolve("Successfully proceeded the transaction")
      )
      .catch((err) => reject(err));
  });
};

module.exports = {
  deleteExpiredVerification,

  createAccountSummaryChartTimestampIfNecessary,
  createRankingTimestampIfNecessary,

  updateAllUsers,
  checkAndUpdateAllUsers,

  updateRankingList,

  getChunkUserTransactionsHistoryForRedisM5RU,
  getLengthUserTransactionsHistoryForRedisM5RU,

  proceedTransaction
};
