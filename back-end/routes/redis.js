const express = require("express");
const router = express.Router();
const { listPushAsync, listRangeAsync } = require("../redis/redis-client");
const {
  getSingleCachedShareInfo
} = require("../utils/redis-utils/SharesInfoBank");
const {
  SequentialPromisesWithResultsArray
} = require("../utils/low-dependency/PromisesUtil");
const {
  accountSummaryChart,
  sharesList,
  cachedMostGainers
} = require("../utils/redis-utils/RedisUtil");
const {
  getCachedHistoricalChart
} = require("../utils/redis-utils/HistoricalChart");
const {
  parseCachedMostGainer,
  createRedisValueFromSharesList,
  parseRedisSharesListItem
} = require("../utils/low-dependency/ParserUtil");

const updateAccountSummaryChartWholeList = "updateAccountSummaryChartWholeList";
const updateAccountSummaryChartOneItem = "updateAccountSummaryChartOneItem";
const getAccountSummaryChartWholeList = "getAccountSummaryChartWholeList";
const getAccountSummaryChartLatestItem = "getAccountSummaryChartLatestItem";

const updateSharesList = "updateSharesList";
const getSharesList = "getSharesList";

const getCachedShareInfo = "getCachedShareInfo";
const getManyCachedSharesInfo = "getManyCachedSharesInfo";

const getHistoricalChart = "getHistoricalChart";

const getMostGainers = "getMostGainers";

/**
 * 'doanhtu07@gmail.com|accountSummaryChart' : list -> "timestamp1|value1", "timestamp2|value2", ...
 */
router.put(`/${updateAccountSummaryChartWholeList}`, (req, res) => {
  const { email, prismaTimestamps } = req.body;

  const redisKey = `${email}|${accountSummaryChart}`;

  const tasksList = [];

  prismaTimestamps.forEach((timestamp) => {
    const { UTCDateString, portfolioValue } = timestamp;
    const newValue = `${UTCDateString}|${portfolioValue}`;
    tasksList.push(() => listPushAsync(redisKey, newValue));
  });

  SequentialPromisesWithResultsArray(tasksList)
    .then((finishedUpdatingRedisTimestampsList) => {
      res.sendStatus(200);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});

router.put(`/${updateAccountSummaryChartOneItem}`, (req, res) => {
  const { email, timestamp, portfolioValue } = req.body;

  const redisKey = `${email}|${accountSummaryChart}`;
  const newValue = `${timestamp}|${portfolioValue}`;

  listPushAsync(redisKey, newValue)
    .then((finishedUpdatingRedisAccountSummaryChart) => {
      res.sendStatus(200);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});

router.get(`/${getAccountSummaryChartWholeList}`, (req, res) => {
  const { email } = req.query;

  const redisKey = `${email}|${accountSummaryChart}`;

  listRangeAsync(redisKey, 0, -1)
    .then((timestampArray) => {
      // [timestamp, value]
      res.send(timestampArray.map((timestamp) => timestamp.split("|")));
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});

router.get(`/${getAccountSummaryChartLatestItem}`, (req, res) => {
  const { email } = req.query;

  const redisKey = `${email}|${accountSummaryChart}`;

  listRangeAsync(redisKey, -1, -1)
    .then((timestampArray) => {
      res.send(timestampArray.map((timestamp) => timestamp.split("|")));
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});

/**
 * 'doanhtu07@gmail.com|sharesList' :
 * List -> "id1|companyCode1|quantity1|buyPriceAvg1|userID1", "..."
 */
router.put(`/${updateSharesList}`, (req, res) => {
  const { email, shares } = req.body;

  const redisKey = `${email}|${sharesList}`;

  const tasksList = [];

  shares.forEach((share) => {
    tasksList.push(() =>
      listPushAsync(redisKey, createRedisValueFromSharesList(share))
    );
  });

  SequentialPromisesWithResultsArray(tasksList)
    .then((finishedUpdatingRedisSharesList) => {
      res.sendStatus(200);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});

router.get(`/${getSharesList}`, (req, res) => {
  const { email } = req.query;

  const redisKey = `${email}|${sharesList}`;

  listRangeAsync(redisKey, 0, -1)
    .then((sharesList) => {
      res.send(
        sharesList.map((userShare) => parseRedisSharesListItem(userShare))
      );
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});

/**
 * result sends ready-to-use json of stock info
 */
router.get(`/${getCachedShareInfo}`, (req, res) => {
  const { companyCode } = req.query;
  getSingleCachedShareInfo(companyCode.toUpperCase())
    .then((shareInfoJSON) => {
      res.send(shareInfoJSON);
    })
    .catch((err) => {
      if (err.message === "Share symbols do not exist in FMP.") {
        res.status(404).send(err.message);
      } else {
        console.log(err);
        res.sendStatus(500);
      }
    });
});

router.get(`/${getManyCachedSharesInfo}`, (req, res) => {
  const { companyCodes } = req.query;

  const tasksList = [];

  companyCodes.forEach((companyCode) => {
    tasksList.push(() => getSingleCachedShareInfo(companyCode.toUpperCase()));
  });

  SequentialPromisesWithResultsArray(tasksList)
    .then((sharesInfoJSON) => {
      res.send(sharesInfoJSON);
    })
    .catch((err) => {
      if (err.message.indexOf("Share symbols do not exist in FMP") > -1) {
        res.status(404).send(err);
      } else {
        console.log(err);
        res.sendStatus(500);
      }
    });
});

router.get(`/${getHistoricalChart}`, (req, res) => {
  const { exchangeOrCompany, typeChart, getFromCacheDirectly } = req.query;

  getCachedHistoricalChart(exchangeOrCompany, typeChart, getFromCacheDirectly)
    .then((historicalChartData) => {
      res.send(historicalChartData);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});

router.get(`/${getMostGainers}`, (req, res) => {
  listRangeAsync(cachedMostGainers, 0, -1)
    .then((gainers) => {
      res.send(gainers.map((gainer) => parseCachedMostGainer(gainer)));
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});

module.exports = router;
