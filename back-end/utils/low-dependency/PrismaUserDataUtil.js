const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * @param email User email
 * @param dataNeeded Object { cash: true, totalPortfolio: true, ... } or key: "default"
 */
const getUserData = (email, dataNeeded) => {
  return new Promise((resolve, reject) => {
    var dataJSON = dataNeeded === "default" ? {} : { ...dataNeeded };

    if (dataJSON.shares) {
      dataJSON = {
        ...dataJSON,
        shares: {
          orderBy: [
            {
              companyCode: "asc"
            }
          ]
        }
      };
    }

    prisma.user
      .findOne({
        where: {
          email
        },
        select: dataNeeded !== "default" ? dataJSON : null
      })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 *
 * @param email User email
 * @param afterOrEqualThisYear Year integer after which you want your timestamp is
 */
const getUserAccountSummaryChartTimestamps = (email, afterOrEqualThisYear) => {
  return new Promise((resolve, reject) => {
    prisma.accountSummaryTimestamp
      .findMany({
        where: {
          user: {
            email
          },
          year: {
            gte: afterOrEqualThisYear
          }
        },
        orderBy: [
          {
            createdAt: "asc"
          }
        ]
      })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * @param email User email
 * @param afterOrEqualThisYear Year integer after which you want your timestamp is
 */
const getUserRankingTimestamps = (email, afterOrEqualThisYear) => {
  return new Promise((resolve, reject) => {
    prisma.rankingTimestamp
      .findMany({
        where: {
          user: {
            email
          },
          year: {
            gte: afterOrEqualThisYear
          }
        },
        orderBy: [
          {
            createdAt: "asc"
          }
        ]
      })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = {
  getUserData,
  getUserAccountSummaryChartTimestamps,
  getUserRankingTimestamps
};
