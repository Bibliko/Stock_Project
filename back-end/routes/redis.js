const express = require("express");
const router = express.Router();
const {
  getAsync,
  setAsync,
  listPushAsync,
  listRangeAsync
} = require("../redis/redis-client");

/**
 * Keys list:
 * - '${email}|accountSummaryChart'
 * - '${email}|sharesList'
 * - 'cachedShares|${companyCode}'
 * - 'RANKING_LIST'
 * - 'RANKING_LIST_${region}'
 */

/**
 * 'doanhtu07@gmail.com|accountSummaryChart' : list -> "timestamp1|value1", "timestamp2|value2", ...
 */
router.put("/updateAccountSummaryChartWholeList", (req, res) => {
  const { email, prismaTimestamps } = req.body;

  const redisKey = `${email}|accountSummaryChart`;

  listRangeAsync(redisKey, 0, -1)
    .then((timestampsList) => {
      if (timestampsList) {
        const listPushPromise = prismaTimestamps.map((timestamp) => {
          const { UTCDateString, portfolioValue } = timestamp;
          const newValue = `${UTCDateString}|${portfolioValue}`;
          return listPushAsync(redisKey, newValue);
        });
        return Promise.all(listPushPromise);
      }
    })
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

  listRangeAsync(redisKey, 0, -1)
    .then((timestampArray) => {
      if (timestampArray) {
        return listPushAsync(redisKey, newValue);
      }
    })
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
 * List -> "id1|companyCode1|quantity1|buyPriceAvg1|lastPrice1|userID1", "..."
 */
router.put("/updateSharesList", (req, res) => {
  const { email, shares } = req.body;

  const redisKey = `${email}|sharesList`;

  listRangeAsync(redisKey, 0, -1)
    .then((sharesList) => {
      if (sharesList) {
        const listPushPromise = shares.map((share) => {
          const {
            id,
            companyCode,
            quantity,
            buyPriceAvg,
            lastPrice,
            userID
          } = share;
          const newValue = `${id}|${companyCode}|${quantity}|${buyPriceAvg}|${lastPrice}|${userID}`;
          return listPushAsync(redisKey, newValue);
        });
        return Promise.all(listPushPromise);
      }
    })
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
 * 'cachedShares|AAPL': 'name|price|changesPercentage|change|dayLow|dayHigh|yearHigh|yearLow|marketCap|priceAvg50|priceAvg200|volume|avgVolume|exchange|open|previousClose|eps|pe|earningsAnnouncement|sharesOutstanding|timestamp'
 */
router.get("/getCachedShareInfo", (req, res) => {
  const { companyCode } = req.query;

  const redisKey = `cachedShares|${companyCode}`;

  getAsync(redisKey)
    .then((quote) => {
      res.send(quote);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});
router.put("/updateCachedShareInfo", (req, res) => {
  const { stockQuoteJSON } = req.body;
  if (!stockQuoteJSON) {
    res.send("stockQuoteJSON is empty, redis.js 156");
    return;
  }

  const {
    symbol,
    name,
    price,
    changesPercentage,
    change,
    dayLow,
    dayHigh,
    yearHigh,
    yearLow,
    marketCap,
    priceAvg50,
    priceAvg200,
    volume,
    avgVolume,
    exchange,
    open,
    previousClose,
    eps,
    pe,
    earningsAnnouncement,
    sharesOutstanding,
    timestamp
  } = stockQuoteJSON;

  const redisKey = `cachedShares|${symbol}`;

  const valueString = `${name}|${price}|${changesPercentage}|${change}|${dayLow}|${dayHigh}|${yearHigh}|${yearLow}|${marketCap}|${priceAvg50}|${priceAvg200}|${volume}|${avgVolume}|${exchange}|${open}|${previousClose}|${eps}|${pe}|${earningsAnnouncement}|${sharesOutstanding}|${timestamp}`;

  setAsync(redisKey, valueString)
    .then((quote) => {
      res.sendStatus(200);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});

module.exports = router;
