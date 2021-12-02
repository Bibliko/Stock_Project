const { prisma } = require("../low-dependency/PrismaClient");
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
  SequentialPromises,
  SequentialPromisesWithResultsArray
} = require("../low-dependency/PromisesUtil");

const { transactionTypeBuy } = require("../low-dependency/PrismaConstantUtil");

const { compareFloat } = require("../low-dependency/NumberUtil");

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
      .findMany({
        where: {
          userID: user.id
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1
      })
      .then((timestamp) => {
        timestamp = timestamp[0]
        // Only create new daily timestamp if there is no timestamp
        // or there is a change in totalPortfolio to reduce database's size
        if (
          !timestamp || (
            timestamp.UTCDateKey !== getFullDateUTCString(newDate()) &&
            compareFloat(timestamp.portfolioValue, user.totalPortfolio)
          )
        ) {
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
      .findMany({
        where: {
          userID: user.id
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1
      })
      .then((timestamp) => {
        timestamp = timestamp[0]
        // Only create new daily timestamp if there is no timestamp
        // or there is a change in ranking to reduce database's size
        if (
          !timestamp || (
            timestamp.UTCDateKey !== getFullDateUTCString(newDate()) && (
              timestamp.ranking !== user.ranking ||
              timestamp.regionalRanking !== user.regionalRanking
            )
          )
        ) {
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
          email: true,
          firstName: true,
          lastName: true,
          totalPortfolio: true,
          region: true
        },
        orderBy: [
          {
            totalPortfolio: "desc"
          },
          {
            id: "asc"
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

        return () => Promise.all([
          updateUserRanking,
          redisUpdateOverallRankingList(user),
          redisUpdateRegionalRankingList(nowRegion, user)
        ]);
      });

      return SequentialPromises(updateAllUsersRanking);
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
 * Perform buy action for the function proceedTransaction
 * @param {import(".prisma/client").User} user
 * @param {number} totalCashChange
 * @param {string} companyCode
 * @param {number} quantity
 * @param {number} recentPrice
 * @returns
 */
 const buyShareEvent = async (
  user,
  totalCashChange,
  companyCode,
  quantity,
  recentPrice
) => {
  try {
    // Check conditions
    if (user.cash + totalCashChange < 0) {
      throw new Error("Condition failed:  Not enough cash");
    }
    // Update user cash
    await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        cash: user.cash + totalCashChange
      }
    });

    // Find out whether user has owned this share already or not
    const buyShare = user.shares.find(
      (share) => share.companyCode === companyCode
    );

    // Update share
    // Case 1: user does not own this share => create new share
    if (!buyShare) {
      return await prisma.share.create({
        data: {
          companyCode: companyCode,
          quantity: quantity,
          buyPriceAvg: recentPrice,
          user: {
            connect: {
              id: user.id
            }
          }
        }
      });
    }
    // Case 2: user owns this share => update share quantity, buyPriceAvg
    buyShare.buyPriceAvg = ((buyShare.buyPriceAvg * buyShare.quantity) + (recentPrice * quantity)) / (quantity + buyShare.quantity);
    buyShare.quantity += quantity;
    await prisma.share.update({
      where: {
        id: buyShare.id
      },
      data: {
        buyPriceAvg: buyShare.buyPriceAvg,
        quantity: buyShare.quantity
      }
    });
  } catch (err) {
    if (!err.message || err.message.search("Condition") === -1)
      console.log(err);
    throw err;
  }
};

const sellShareEvent = async (
  user,
  totalCashChange,
  companyCode,
  quantity
) => {
  try {
    // Find the stock user want to sell and update its properties (quantity and average price)
    const sellShare = user.shares.find(
      (share) => share.companyCode === companyCode
    );

    // Check conditions
    if (!sellShare) {
      throw new Error("Condition failed: Couldn't find share");
    } else if (quantity > sellShare.quantity) {
      throw new Error("Condition failed: Not enough available shares");
    } else if (user.cash + totalCashChange < 0) {
      throw new Error("Condition failed: Not enough cash")
    }

    // Update user cash
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        cash: user.cash + totalCashChange,
      }
    });

    // Update share
    // Case 1: sell all shares => delete the share in prisma
    if (quantity === sellShare.quantity) {
      return await prisma.share.delete({
        where: {
          id: sellShare.id
        }
      });
    }
    // Case 2: sell some shares => update share quantity
    await prisma.share.update({
      where: {
        id: sellShare.id
      },
      data: {
        quantity: sellShare.quantity - quantity
      }
    });
  } catch (err) {
    if (!err.message || err.message.search("Condition") === -1)
      console.log(err);
    throw err;
  }
};

/**
 * Buy or sell if the transaction can be procceeded
 * @param {string} transactionID
 * @param {number} recentPrice
 */
const proceedTransaction = async (transactionID, recentPrice) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const userTransaction = await prisma.userTransaction.findUnique({
      where: {
        id: transactionID
      },
      include: {
        user: {
          include: {
            shares: true
          }
        }
      }
    });
    if (!userTransaction) return;

    const { user, type, quantity, companyCode } = userTransaction;
    const totalCashChange = (type === transactionTypeBuy ? -1 : 1) * (recentPrice * quantity) - userTransaction.brokerage;

    if (type === transactionTypeBuy) {
      await buyShareEvent(user, totalCashChange, companyCode, quantity, recentPrice);
    } else {
      await sellShareEvent(user, totalCashChange, companyCode, quantity);
    }

    // Update transaction after buying/selling
    await prisma.userTransaction.update({
      where: {
        id: transactionID
      },
      data: {
        isFinished: true,
        finishedTime: new Date(),
        priceAtTransaction: recentPrice,
        spendOrGain: totalCashChange
      }
    });
  } catch (err) {
    throw err;
  }
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
