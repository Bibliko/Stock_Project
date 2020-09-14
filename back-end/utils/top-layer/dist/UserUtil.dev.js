"use strict";

var _require = require("../low-dependency/DayTimeUtil"),
    newDate = _require.newDate,
    getFullDateUTCString = _require.getFullDateUTCString,
    getYearUTCString = _require.getYearUTCString;

var _require2 = require("@prisma/client"),
    PrismaClient = _require2.PrismaClient;

var prisma = new PrismaClient();

var _require3 = require("../../redis/redis-client"),
    keysAsync = _require3.keysAsync,
    delAsync = _require3.delAsync;

var _require4 = require("lodash"),
    isEqual = _require4.isEqual,
    isEmpty = _require4.isEmpty;

var _require5 = require("../RedisUtil"),
    isMarketClosedCheck = _require5.isMarketClosedCheck,
    redisUpdateOverallRankingList = _require5.redisUpdateOverallRankingList,
    redisUpdateRegionalRankingList = _require5.redisUpdateRegionalRankingList;

var deleteExpiredVerification = function deleteExpiredVerification() {
  var date = new Date();
  date = date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
  prisma.userVerification.deleteMany({
    where: {
      expiredAt: date
    }
  }).then(function (res) {
    console.log("Deleted", res, "email verifications");
  })["catch"](function (err) {
    console.log(err);
  });
};

var createAccountSummaryChartTimestampIfNecessary = function createAccountSummaryChartTimestampIfNecessary(user) {
  return new Promise(function (resolve, reject) {
    prisma.accountSummaryTimestamp.findOne({
      where: {
        UTCDateKey_userID: {
          UTCDateKey: getFullDateUTCString(newDate()),
          userID: user.id
        }
      }
    }).then(function (timestamp) {
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
    }).then(function () {
      console.log("Finished finding and creating timestamp");
      resolve("Finished finding and creating timestamp");
    })["catch"](function (err) {
      reject(err);
    });
  });
};

var createRankingTimeStampIfNecessary = function createRankingTimeStampIfNecessary(user) {
  return new Promise(function (resolve, reject) {
    prisma.RankingTimeStamp.findOne({
      where: {
        UTCDateKey_userID: {
          UTCDateKey: getFullDateUTCString(newDate()),
          userID: user.id
        }
      }
    }).then(function (timestamp) {
      if (!timestamp) {
        prisma.RankingTimeStamp.create({
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
    }).then(function () {
      console.log("Finished finding and creating timestamp");
      resolve("Finished finding and creating timestamp");
    })["catch"](function (err) {
      reject(err);
    });
  });
};

var updateRankingList = function updateRankingList() {
  keysAsync("RANKING_LIST*").then(function (keysList) {
    if (!isEmpty(keysList)) {
      return delAsync(keysList);
    }
  }).then(function () {
    console.log("Deleted all redis ranking relating lists\n");
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
  }).then(function (usersArray) {
    console.log("Updating ".concat(usersArray.length, " user(s): ranking"));
    var regionsList = new Map(); // `region : recent rank`

    var updateAllUsersRanking = usersArray.map(function (user, index) {
      var nowRegion = user.region;

      if (regionsList.has(nowRegion)) {
        regionsList.set(nowRegion, regionsList.get(nowRegion) + 1);
      } else {
        regionsList.set(nowRegion, 1);
      }

      var updateUserRanking = prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          ranking: index + 1,
          regionalRanking: regionsList.get(nowRegion)
        }
      });
      return Promise.all([updateUserRanking, redisUpdateOverallRankingList(user), redisUpdateRegionalRankingList(nowRegion, user)]);
    });
    return Promise.all(updateAllUsersRanking);
  }).then(function () {
    console.log("Successfully updated all users ranking\n");
  })["catch"](function (err) {
    console.log(err);
  });
};

var updateAllUsers = function updateAllUsers() {
  // update portfolioLastClosure and ranking for all users
  prisma.user.findMany({
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
  }).then(function (usersArray) {
    console.log("Updating ".concat(usersArray.length, " user(s): portfolioLastClosure and accountSummaryTimestamp"));
    var updateAllUsersPromise = usersArray.map(function (user, index) {
      var updatePortfolioLastClosure = prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          totalPortfolioLastClosure: user.totalPortfolio
        }
      });
      var accountSummaryPromise = createAccountSummaryChartTimestampIfNecessary(user);
      var accountRankingPromise = createRankingTimeStampIfNecessary(user);
      return Promise.all([updatePortfolioLastClosure, accountSummaryPromise, accountRankingPromise]);
    });
    return Promise.all(updateAllUsersPromise);
  }).then(function () {
    console.log("Successfully updated all users portfolioLastClosure and accountSummaryChartTimestamp\n");
  })["catch"](function (err) {
    console.log(err);
  });
};
/**
 * objVariables: object passed in from back-end/index
 */


var checkAndUpdateAllUsers = function checkAndUpdateAllUsers(objVariables) {
  if (!objVariables.isPrismaMarketHolidaysInitialized) {
    return;
  }

  isMarketClosedCheck().then(function (checkResult) {
    // check if market is closed and update the status of objVariables
    if (!isEqual(checkResult, objVariables.isMarketClosed)) {
      objVariables.isMarketClosed = checkResult;
    } // if market is closed but flag isAlreadyUpdate is still false
    // -> change it to true AND updatePortfolioLastClosure


    if (objVariables.isMarketClosed && !objVariables.isAlreadyUpdateAllUsers) {
      objVariables.isAlreadyUpdateAllUsers = true;
      updateAllUsers();
    } // if market is opened but flag isAlreadyUpdate not switch to false yet -> change it to false


    if (!objVariables.isMarketClosed && objVariables.isAlreadyUpdateAllUsers) {
      objVariables.isAlreadyUpdateAllUsers = false;
    }
  })["catch"](function (err) {
    console.log(err);
  });
};
/**
 * if searchBy === 'type' -> searchQuery takes in two of these parameters 'buy' or 'sell'
 * if searchBy === 'companyCode' -> searchQuery takes in any non-empty string
 *
 *
 */


var getChunkUserTransactionsHistoryForRedisM5RU = function getChunkUserTransactionsHistoryForRedisM5RU(email, chunkSize, // required
numberOfChunksSkipped, // required
searchBy, // 'none' or 'type' or 'companyCode'
searchQuery, // 'none' or 'buy'/'sell' or RANDOM
orderBy, // 'none' or '...'
orderQuery // 'none' or 'desc' or 'asc'
) {
  // Each transactions history page has 10 items, but we cache beforehand 100 items
  return new Promise(function (resolve, reject) {
    var filtering = {
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

    var orderObject = {};

    if (!isEqual(orderBy, "none")) {
      orderObject["".concat(orderBy)] = orderQuery;
    }

    var orderByPrisma = [];

    if (!isEmpty(orderObject)) {
      orderByPrisma.push(orderObject);
    }

    prisma.user.findOne({
      where: {
        email: email
      }
    }).transactions({
      where: filtering,
      orderBy: orderByPrisma,
      skip: chunkSize * numberOfChunksSkipped,
      take: chunkSize
    }).then(function (data) {
      resolve(data);
    })["catch"](function (err) {
      reject(err);
    });
  });
};

var getLengthUserTransactionsHistoryForRedisM5RU = function getLengthUserTransactionsHistoryForRedisM5RU(email, searchBy, // 'none' or 'type' or 'companyCode'
searchQuery // 'none' or 'buy'/'sell' or RANDOM
) {
  return new Promise(function (resolve, reject) {
    var filtering = {
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

    prisma.user.findOne({
      where: {
        email: email
      }
    }).transactions({
      where: filtering
    }).then(function (data) {
      resolve(data.length);
    })["catch"](function (err) {
      reject(err);
    });
  });
};

module.exports = {
  deleteExpiredVerification: deleteExpiredVerification,
  createAccountSummaryChartTimestampIfNecessary: createAccountSummaryChartTimestampIfNecessary,
  updateAllUsers: updateAllUsers,
  checkAndUpdateAllUsers: checkAndUpdateAllUsers,
  updateRankingList: updateRankingList,
  getChunkUserTransactionsHistoryForRedisM5RU: getChunkUserTransactionsHistoryForRedisM5RU,
  getLengthUserTransactionsHistoryForRedisM5RU: getLengthUserTransactionsHistoryForRedisM5RU
};