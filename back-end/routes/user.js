const {
  listLengthAsync,
  listRangeAsync,
} = require("../redis/redis-client");

const { Router } = require("express");
const router = Router();

const { prisma } = require("../utils/low-dependency/PrismaClient");

const {
  searchAndUpdateTransactionsHistoryM5RU,
  getTransactionsHistoryItemInM5RU,
  createOrOverwriteTransactionsHistoryM5RUItemRedisKey,
  addLengthToFirstOfTransactionsHistoryM5RUItemRedisKey
} = require("../utils/redis-utils/TransactionsHistoryMost5RecentlyUsed");

const {
  getChunkUserTransactionsHistoryForRedisM5RU,
  getLengthUserTransactionsHistoryForRedisM5RU
} = require("../utils/top-layer/UserUtil");

const { rankingList } = require("../utils/redis-utils/RedisUtil");

const {
  changeNameUserCacheKeys
} = require("../utils/redis-utils/UserCachedDataUtil");

const {
  getUserAccountSummaryChartTimestamps,
  getUserRankingTimestamps,
  getUserData
} = require("../utils/low-dependency/PrismaUserDataUtil");

const { parseRedisTransactionsHistoryListItem } = require("../utils/low-dependency/ParserUtil");

// const { indices } = require('../algolia');

/*

Routes List:
- changeData
- changeEmail
- getData
- getOverallRanking
- getRegionalRanking
- getUerTransactionsHistory
- getUserAccountSummaryChartTimestamps
- getUserRankingTimestamps

*/

router.put("/changeData", (req, res) => {
  const { dataNeedChange, email } = req.body;

  // const dataJSON = JSON.parse(dataNeedChange);

  /**
   * dataNeedChange in form:
   *  dataNeedChange: {
   *      password: "...",
   *      email: "...",
   *      [...]
   *  }
   */

  prisma.user
    .update({
      where: {
        email
      },
      data: dataNeedChange
    })
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Failed to change user's data");
    });
});

router.put("/changeEmail", (req, res) => {
  const { email, newEmail } = req.body;

  prisma.user
    .update({
      where: {
        email
      },
      data: {
        email: newEmail
      }
    })
    .then((user) => {
      req.logout();
      req.logIn(user, (err) => {
        if (err) {
          return res.sendStatus(500);
        }

        return res.send(user);
      });
    })
    .then(() => {
      return changeNameUserCacheKeys(newEmail, email);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Failed to change user's data");
    });
});

router.get("/getData", (req, res) => {
  const { email, dataNeeded } = req.query;

  var dataJSON;
  if (dataNeeded === "default") {
    dataJSON = "default";
  } else {
    dataJSON = JSON.parse(dataNeeded);
  }

  getUserData(email, dataJSON)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Failed to get user's data");
    });
});

/**
 * @description Get the length of ranking list.
 * @query (Optional) {String} region The desired ranking region (default to overall)
 */
router.get("/getRankingLength", (req, res) => {
  const { region } = req.query;
  const list = region ? `${rankingList}_${region}` : rankingList;

  listLengthAsync(list)
    .then((listLength) => {
      res.send(listLength.toString());
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Failed to get the length of ranking list");
    });
});

/**
 * @description Get top 8 users (overall ranking) on the given page in request.
 */
router.get("/getOverallRanking", (req, res) => {
  const { page } = req.query;

  listRangeAsync(rankingList, 8 * (page - 1), 8 * page - 1)
    .then((usersList) => {
      const usersListJson = usersList.map((user) => {
        const data = user.split("|");
        return {
          firstName: data[0],
          lastName: data[1],
          totalPortfolio: parseInt(data[2], 10),
          region: data[3],
          email: data[4],
        };
      });

      res.send(usersListJson);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Failed to get overall ranking");
    });
});

/**
 * @description Get top 8 users (regional ranking) on the given page and region in request.
 */
router.get("/getRegionalRanking", (req, res) => {
  const { region, page } = req.query;

  listRangeAsync(`${rankingList}_${region}`, 8 * (page - 1), 8 * page - 1)
    .then((usersList) => {
      const usersListJson = usersList.map((user) => {
        const data = user.split("|");
        return {
          firstName: data[0],
          lastName: data[1],
          totalPortfolio: parseInt(data[2], 10),
          region: data[3],
          email: data[4],
        };
      });
      res.send(usersListJson);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Failed to get regional ranking");
    });
});

router.get("/getUserTransactionsHistory", (req, res) => {
  /**
   * Each page has max 10 transactions. We only cache 100 transactions.
   * We need to be able to check if this page already exceeds 100 cached transactions.
   * - If no, just return the right page from these 100 cached transactions.
   * - If yes, cache the next 100 transactions into M5RU and return the right page.
   */

  const {
    email,
    rowsLengthChoices, // required, min to max
    page, // required
    rowsPerPage, // required
    filters, // Example in ParserUtil createRedisValueFromTransactionsHistoryFilters
    orderBy, // 'none' or '...'
    orderQuery // 'none' or 'desc' or 'asc'
  } = req.query;

  const filtersJSON = JSON.parse(filters);

  const pageInteger = parseInt(page, 10);
  const rowsPerPageInteger = parseInt(rowsPerPage, 10);
  const maxNumberOfTransactionsUpToThisPage = rowsPerPageInteger * pageInteger;

  let numberOfChunksSkipped = 0;
  const chunkSize = rowsLengthChoices[rowsLengthChoices.length - 1] * 10; // how many transactions we want to cache beforehand

  /**
   * Important Note:
   * - Both chunkSize and rowsLength must be multiples of 5. rowsLength exception is 1.
   * - chunkSize must be larger than or equal to rowsLength.
   */

  while (
    maxNumberOfTransactionsUpToThisPage >
    chunkSize * numberOfChunksSkipped
  ) {
    numberOfChunksSkipped++;
  }
  // return to true number of chunks 100 skipped
  numberOfChunksSkipped--;

  searchAndUpdateTransactionsHistoryM5RU(
    email,
    numberOfChunksSkipped,
    filtersJSON,
    orderBy,
    orderQuery
  )
    .then(([note, indexInM5RUList]) => {
      if (indexInM5RUList === -1) {
        return getChunkUserTransactionsHistoryForRedisM5RU(
          email,
          chunkSize,
          numberOfChunksSkipped,
          filtersJSON,
          orderBy,
          orderQuery
        );
      }
    })
    .then((new100TransactionsFromPrisma) => {
      if (new100TransactionsFromPrisma) {
        return Promise.all([
          createOrOverwriteTransactionsHistoryM5RUItemRedisKey(
            email,
            numberOfChunksSkipped,
            filtersJSON,
            orderBy,
            orderQuery,
            new100TransactionsFromPrisma
          ),
          getLengthUserTransactionsHistoryForRedisM5RU(email, filtersJSON)
        ]);
      }
    })
    .then((newToM5RU) => {
      if (newToM5RU) {
        const transactionsHistoryLength = newToM5RU[1];
        return addLengthToFirstOfTransactionsHistoryM5RUItemRedisKey(
          email,
          numberOfChunksSkipped,
          filtersJSON,
          orderBy,
          orderQuery,
          transactionsHistoryLength
        );
      }
    })
    .then((finishedUpdatingM5RU) => {
      return getTransactionsHistoryItemInM5RU(
        email,
        numberOfChunksSkipped,
        filtersJSON,
        orderBy,
        orderQuery
      );
    })
    .then((transactionsAndLength) => {
      const length = transactionsAndLength[0];

      const paginationStopsInChunk = [1];
      const numberOfStops = chunkSize / rowsPerPageInteger;
      for (let i = 1; i < numberOfStops; i++) {
        paginationStopsInChunk.push(
          paginationStopsInChunk[i - 1] + rowsPerPageInteger
        );
      }

      let startIndexStop = (pageInteger % paginationStopsInChunk.length) - 1;
      if (startIndexStop < 0) {
        startIndexStop = paginationStopsInChunk.length + startIndexStop;
      }

      const startIndex = paginationStopsInChunk[startIndexStop];
      const excludedEndIndex = startIndex + rowsPerPageInteger;

      const transactions = transactionsAndLength.slice(
        startIndex,
        excludedEndIndex
      ).map(transaction => parseRedisTransactionsHistoryListItem(transaction));

      res.send({ transactions, length });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Failed to get user's transactions history.");
    });
});

router.get("/getUserAccountSummaryChartTimestamps", (req, res) => {
  const { email, afterOrEqualThisYear } = req.query;

  const afterOrEqualThisYearInteger = parseInt(afterOrEqualThisYear, 10);

  getUserAccountSummaryChartTimestamps(email, afterOrEqualThisYearInteger)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Failed to get user's data.");
    });
});

router.get("/getUserRankingTimestamps", (req, res) => {
  const { email, afterOrEqualThisYear } = req.query;

  const afterOrEqualThisYearInteger = parseInt(afterOrEqualThisYear, 10);

  getUserRankingTimestamps(email, afterOrEqualThisYearInteger)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Failed to get user's data.");
    });
});

module.exports = router;
