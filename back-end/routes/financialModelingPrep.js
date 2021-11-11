const { Router } = require("express");
const router = Router();

const NodeCache = require("node-cache");
const cache = new NodeCache();

const {
  searchTickers,
  getStockNews,
  getMostActiveStocks,
  getFullStockScreener
} = require("../utils/FinancialModelingPrepUtil");

/**
 * Example response:
 * [ {
 *  "symbol" : "MAA",
 *  "name" : "Mid-America Apartment Communities, Inc.",
 *  "currency" : "USD",
 *  "stockExchange" : "NYSE",
 *  "exchangeShortName" : "NYSE"
 * },
 * ...
 * ]
 */
router.get("/searchCompanyTickers", (req, res) => {
  const { searchQuery, limit } = req.query;
  const NYSEStocks = searchTickers(searchQuery, limit, "NYSE");
  const NASDAQStocks = searchTickers(searchQuery, limit, "NASDAQ");

  Promise.all([NYSEStocks, NASDAQStocks])
    .then(([NYSEJSON, NASDAQJSON]) => {
      res.status(200).send([NYSEJSON, NASDAQJSON]);
    })
    .catch((err) => {
      res.status(500).send("Failed to get tickers");
    });
});

router.get("/stockNews", (req, res) => {
  const { companyCode, limit } = req.query;

  getStockNews(companyCode, limit)
    .then((newsData) => {
      res.status(200).send(newsData);
    })
    .catch((err) => {
      res.status(500).send("Failed to get stock news");
    });
});

router.get("/activeStocks", (req, res) => {
  getMostActiveStocks()
    .then((activeStocks) => {
      res.status(200).send(activeStocks);
    })
    .catch((err) => {
      res.status(500).send("Failed to get most active stocks");
    });
});

const stockScreenerCache = (req, res, next) => {
  const duration = 600;

  // check if key exists in cache
  const key = req.originalUrl;
  const cachedResponse = cache.get(key);

  // if it exists, send cache result
  if (cachedResponse) {
    console.log("Cache hit");
    res.send(cachedResponse);
  } else {
    // if not, replace .send with method to set response to cache
    console.log("Cache missed");
    res.originalSend = res.send;
    res.send = (body) => {
      res.originalSend(body);
      cache.set(key, body, duration);
    };
    next();
  }
};

// Huge response (few MBs) => Cache for later requests
router.get("/stockScreener", stockScreenerCache, (req, res) => {
  getFullStockScreener()
    .then((stockScreener) => {
      res.status(200).send(stockScreener);
    })
    .catch((err) => {
      res.status(500).send("Failed to get stock screener");
    });
});

module.exports = router;
