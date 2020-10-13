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
  sharesList
} = require("../utils/redis-utils/RedisUtil");
const {
  getCachedExchangeHistoricalChart
} = require("../utils/redis-utils/ExchangeHistoricalChart");

const updateAccountSummaryChartWholeList = "updateAccountSummaryChartWholeList";
const updateAccountSummaryChartOneItem = "updateAccountSummaryChartOneItem";
const getAccountSummaryChartWholeList = "getAccountSummaryChartWholeList";
const getAccountSummaryChartLatestItem = "getAccountSummaryChartLatestItem";

const updateSharesList = "updateSharesList";
const getSharesList = "getSharesList";

const getCachedShareInfo = "getCachedShareInfo";
const getManyCachedSharesInfo = "getManyCachedSharesInfo";

const getExchangeHistoricalChart = "getExchangeHistoricalChart";

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
      res.send(timestampArray);
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
      res.send(timestampArray);
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
    const { id, companyCode, quantity, buyPriceAvg, userID } = share;
    const newValue = `${id}|${companyCode}|${quantity}|${buyPriceAvg}|${userID}`;
    tasksList.push(() => listPushAsync(redisKey, newValue));
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
      res.send(sharesList);
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
      console.log(err);
      res.sendStatus(500);
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
      console.log(err);
      res.sendStatus(500);
    });
});

router.get(`/${getExchangeHistoricalChart}`, (req, res) => {
  const { exchange, typeChart } = req.query;

  getCachedExchangeHistoricalChart(exchange, typeChart)
    .then((historicalChartData) => {
      res.send(historicalChartData);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});

module.exports = router;
