const { listRangeAsync } = require("../redis/redis-client");

const { Router } = require("express");
const router = Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const {
  searchAndUpdateTransactionsHistoryM5RU,
  getTransactionsHistoryItemInM5RU,
  createOrOverwriteTransactionsHistoryM5RUItemRedisKey,
  addLengthToFirstOfTransactionsHistoryM5RUItemRedisKey
} = require("../utils/RedisUtil");
const {
  getChunkUserTransactionsHistoryForRedisM5RU,
  getLengthUserTransactionsHistoryForRedisM5RU
} = require("../utils/top-layer/UserUtil");

// const { indices } = require('../algolia');

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

router.get("/getData", (req, res) => {
  const { email, dataNeeded } = req.query;

  var dataJSON = JSON.parse(dataNeeded);

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

  /**
   *  dataNeeded in form of:
   *      dataNeeded: {
   *          cash: true,
   *          region: true,
   *          ...
   *      }
   */
  prisma.user
    .findOne({
      where: {
        email
      },
      select: dataJSON
    })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Failed to get user's data");
    });
});

router.get("/getOverallRanking", (req, res) => {
  const { page } = req.query;

  listRangeAsync("RANKING_LIST", 8 * (page - 1), 8 * page - 1)
    .then((usersList) => {
      const usersListJson = usersList.map((user) => {
        const data = user.split("|");
        return {
          firstName: data[0],
          lastName: data[1],
          totalPortfolio: parseInt(data[2]),
          region: data[3]
        };
      });

      res.send(usersListJson);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Failed to get overall ranking");
    });
});

router.get("/getRegionalRanking", (req, res) => {
  const { region, page } = req.query;

  listRangeAsync(`RANKING_LIST_${region}`, 8 * (page - 1), 8 * page - 1)
    .then((usersList) => {
      const usersListJson = usersList.map((user) => {
        const data = user.split("|");
        return {
          firstName: data[0],
          lastName: data[1],
          totalPortfolio: parseInt(data[2]),
          region: data[3]
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
    searchBy, // 'none' or 'type' or 'companyCode'
    searchQuery, // 'none' or 'buy'/'sell' or RANDOM
    orderBy, // 'none' or '...'
    orderQuery // 'none' or 'desc' or 'asc'
  } = req.query;

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
    searchBy,
    searchQuery,
    orderBy,
    orderQuery
  )
    .then(([note, indexInM5RUList]) => {
      if (indexInM5RUList === -1) {
        return getChunkUserTransactionsHistoryForRedisM5RU(
          email,
          chunkSize,
          numberOfChunksSkipped,
          searchBy,
          searchQuery,
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
            searchBy,
            searchQuery,
            orderBy,
            orderQuery,
            new100TransactionsFromPrisma
          ),
          getLengthUserTransactionsHistoryForRedisM5RU(
            email,
            searchBy,
            searchQuery
          )
        ]);
      }
    })
    .then((newToM5RU) => {
      if (newToM5RU) {
        const transactionsHistoryLength = newToM5RU[1];
        return addLengthToFirstOfTransactionsHistoryM5RUItemRedisKey(
          email,
          numberOfChunksSkipped,
          searchBy,
          searchQuery,
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
        searchBy,
        searchQuery,
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
      );

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

  /**
   * filtering in form:
   *    filtering = {
   *      isFinished: true, -> prisma relation filtering
   *      ...
   *    }
   */

  prisma.accountSummaryTimestamp
    .findMany({
      where: {
        user: {
          email
        },
        year: {
          gte: afterOrEqualThisYearInteger
        }
      }
    })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Failed to get user's data.");
    });
});

router.get("/getUserRankingTimestamp", (req, res) => {
  const { email, afterOrEqualThisYear } = req.query;

  const afterOrEqualThisYearInteger = parseInt(afterOrEqualThisYear, 10);

  prisma.rankingTimestamp
    .findMany({
      where: {
        user: {
          email
        },
        year: {
          gte: afterOrEqualThisYearInteger
        }
      }
    })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Failed to get user's data.");
    });
});

module.exports = router;
