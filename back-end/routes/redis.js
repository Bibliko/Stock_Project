const express = require("express");
const router = express.Router();
const {
  getAsync,
  listPushAsync,
  listRangeAsync
} = require("../redis/redis-client");
const {
  getFullStockQuoteFromFMP
} = require("../utils/FinancialModelingPrepUtil");
const { isMarketClosedCheck } = require("../utils/DayTimeUtil");
const {
  parseCachedShareInfo,
  updateCachedShareInfo,
  switchFlagUpdatingUsingFMPToTrue
} = require("../utils/RedisUtil");

/**
 * Keys list:
 * - '${email}|transactionsHistoryList'
 * - '${email}|passwordVerification'
 * - '${email}|accountSummaryChart'
 * - '${email}|sharesList'
 *
 * - 'cachedMarketHoliday'
 * - 'cachedShares|${companyCode}'
 *
 * - 'RANKING_LIST'
 * - 'RANKING_LIST_${region}'
 */

/**
 * 'doanhtu07@gmail.com|accountSummaryChart' : list -> "timestamp1|value1", "timestamp2|value2", ...
 */
router.put("/updateAccountSummaryChartWholeList", (req, res) => {
  const { email, prismaTimestamps } = req.body;

  const redisKey = `${email}|accountSummaryChart`;

  const listPushPromise = prismaTimestamps.map((timestamp) => {
    const { UTCDateString, portfolioValue } = timestamp;
    const newValue = `${UTCDateString}|${portfolioValue}`;
    return listPushAsync(redisKey, newValue);
  });
  Promise.all(listPushPromise)
    .then((finishedUpdatingRedisTimestampsList) => {
      res.sendStatus(200);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});
router.put("/updateAccountSummaryChartOneItem", (req, res) => {
  const { email, timestamp, portfolioValue } = req.body;

  const redisKey = `${email}|accountSummaryChart`;
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
router.get("/getAccountSummaryChartWholeList", (req, res) => {
  const { email } = req.query;

  const redisKey = `${email}|accountSummaryChart`;

  listRangeAsync(redisKey, 0, -1)
    .then((timestampArray) => {
      res.send(timestampArray);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});
router.get("/getAccountSummaryChartLatestItem", (req, res) => {
  const { email } = req.query;

  const redisKey = `${email}|accountSummaryChart`;

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
router.put("/updateSharesList", (req, res) => {
  const { email, shares } = req.body;

  const redisKey = `${email}|sharesList`;

  const listPushPromise = shares.map((share) => {
    const { id, companyCode, quantity, buyPriceAvg, userID } = share;
    const newValue = `${id}|${companyCode}|${quantity}|${buyPriceAvg}|${userID}`;
    return listPushAsync(redisKey, newValue);
  });
  Promise.all(listPushPromise)
    .then((finishedUpdatingRedisSharesList) => {
      res.sendStatus(200);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});
router.get("/getSharesList", (req, res) => {
  const { email } = req.query;

  const redisKey = `${email}|sharesList`;

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
 * 'doanhtu07@gmail.com|transactionsHistoryList' : isFinished of these transactions is true!
 * List -> "id|createdAt|companyCode|quantity|priceAtTransaction|brokerage|finishedTime|isTypeBuy|userID", "..."
 */
router.put("/updateTransactionsHistoryListWholeList", (req, res) => {
  const { email, finishedTransactions } = req.body;

  const redisKey = `${email}|transactionsHistoryList`;

  const listPushPromise = finishedTransactions.map((transaction) => {
    const {
      id,
      createdAt,
      companyCode,
      quantity,
      priceAtTransaction,
      brokerage,
      finishedTime,
      isTypeBuy,
      userID
    } = transaction;
    const newValue = `${id}|${createdAt}|${companyCode}|${quantity}|${priceAtTransaction}|${brokerage}|${finishedTime}|${isTypeBuy}|${userID}`;
    return listPushAsync(redisKey, newValue);
  });
  Promise.all(listPushPromise)
    .then((finishedUpdatingRedisTransactionsHistoryList) => {
      res.sendStatus(200);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});
router.put("/updateTransactionsHistoryListOneItem", (req, res) => {
  const { email, finishedTransaction } = req.body;

  const redisKey = `${email}|transactionsHistoryList`;
  const {
    id,
    createdAt,
    companyCode,
    quantity,
    priceAtTransaction,
    brokerage,
    finishedTime,
    isTypeBuy,
    userID
  } = finishedTransaction;
  const newValue = `${id}|${createdAt}|${companyCode}|${quantity}|${priceAtTransaction}|${brokerage}|${finishedTime}|${isTypeBuy}|${userID}`;

  listPushAsync(redisKey, newValue)
    .then((finishedUpdatingRedisTransactionsHistoryList) => {
      res.sendStatus(200);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});
router.get("/getPaginatedTransactionsHistoryList", (req, res) => {
  // Each page has 10 transactions
  const { email, page } = req.query;

  const redisKey = `${email}|transactionsHistoryList`;
  const startIndex = 10 * (page - 1);
  const endIndex = startIndex + (10 - 1);

  listRangeAsync(redisKey, startIndex, endIndex)
    .then((transactionsHistoryList) => {
      res.send(transactionsHistoryList);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});

/**
 * 'cachedShares|AAPL': 'isUpdatingUsingFMP|timestampLastUpdated|name|price|changesPercentage|change|dayLow|dayHigh|yearHigh|yearLow|marketCap|priceAvg50|priceAvg200|volume|avgVolume|exchange|open|previousClose|eps|pe|earningsAnnouncement|sharesOutstanding|timestamp'
 *
 * find cachedShares first:
 *
 * if no exist:
 *  go to FMP directly
 *  cache
 *
 * if exist already:
 *  request send to this route -> get timestamp of request -> check if ( timestamp > timestampLastUpdated 500ms )
 *  - if ( timestamp > timestampLastUpdated 500ms && isUpdatingUsingFMP false) -> cache new stock
 *  - else -> get old stock
 *
 *
 */
router.get("/getCachedShareInfo", (req, res) => {
  const { companyCode } = req.query;

  const redisKey = `cachedShares|${companyCode}`;

  const timeNowOfRequest = new Date().getTime(); // in miliseconds

  isMarketClosedCheck()
    .then((isMarketClosed) => {
      return Promise.all([getAsync(redisKey), isMarketClosed]);
    })
    .then(([quote, isMarketClosed]) => {
      console.log(quote, "redis.js /getCachedShareInfo");
      if (!quote) {
        return Promise.all([getFullStockQuoteFromFMP(companyCode), null, null]);
      }

      const parsedCachedShare = parseCachedShareInfo(quote);
      const { timestampLastUpdated, isUpdatingUsingFMP } = parsedCachedShare;

      if (
        timeNowOfRequest >= timestampLastUpdated + 500 &&
        !isUpdatingUsingFMP &&
        !isMarketClosed
      ) {
        return Promise.all([
          getFullStockQuoteFromFMP(companyCode),
          parsedCachedShare,
          switchFlagUpdatingUsingFMPToTrue(companyCode, timeNowOfRequest)
        ]);
      }
      return [null, parsedCachedShare, null];
    })
    .then(([stockQuoteJSON, cachedQuote, switchUpdatingFromFMPFlag]) => {
      if (stockQuoteJSON) {
        res.send(stockQuoteJSON);
        return updateCachedShareInfo(stockQuoteJSON, false, timeNowOfRequest);
      } else {
        res.send(cachedQuote);
      }
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});

module.exports = router;
