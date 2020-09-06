const fetch = require("node-fetch");
const { isEmpty, isEqual } = require("lodash");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { newDate, getYearUTCString } = require("./DayTimeUtil");

const { updatePrismaMarketHolidays } = require("./MarketHolidaysUtil");

const { FINANCIAL_MODELING_PREP_API_KEY } = process.env;

/**
 *  Initially, time for interval to update market holidays is one second.
 *  After we initialize prisma market holidays, we change this time to one day.
 *  We also change boolean isPrismaMarketHolidaysInitialized to true
 *
 *  marketHours[index] =
 *  [
 *      {
 *          stockExchangeName: 'New York Stock Exchange',
 *          stockMarketHours: { openingHour: '09:30 a.m. ET', closingHour: '04:00 p.m. ET' },
 *          stockMarketHolidays: [ [Object], [Object], [Object], [Object] ],
 *          isTheStockMarketOpen: false,
 *          isTheEuronextMarketOpen: false,
 *          isTheForexMarketOpen: false,
 *          isTheCryptoMarketOpen: true
 *      }
 *  ]
 */
const updateMarketHolidaysFromFMP = (objVariables) => {
  var timeNow = newDate();

  var year = getYearUTCString(timeNow);

  return new Promise((resolve, reject) => {
    prisma.marketHolidays
      .findMany({
        select: {
          id: true,
          year: true
        },
        orderBy: [
          {
            year: "desc"
          }
        ]
      })
      .then((marketHolidaysPrisma) => {
        if (
          isEmpty(marketHolidaysPrisma) ||
          marketHolidaysPrisma[0].year <= year
        ) {
          return fetch(
            `https://financialmodelingprep.com/api/v3/market-hours?apikey=${FINANCIAL_MODELING_PREP_API_KEY}`
          );
        }
      })
      .then((marketHours) => {
        // example of marketHours is in note above!

        if (marketHours) {
          return marketHours.json();
        }
      })
      .then((marketHoursJSON) => {
        if (marketHoursJSON) {
          let nyseMarket;

          marketHoursJSON.map((marketHoursObj) => {
            if (
              isEqual(
                marketHoursObj.stockExchangeName,
                "New York Stock Exchange"
              )
            ) {
              nyseMarket = marketHoursObj;
            }
          });

          return nyseMarket;
        }
      })
      .then((nyseMarket) => {
        if (nyseMarket) {
          nyseMarket.stockMarketHolidays.map((stockMarketHoliday) => {
            return updatePrismaMarketHolidays(stockMarketHoliday);
          });
        }
      })
      .then((afterUpdated) => {
        console.log(
          "prisma market holidays updated FinancialModelingPrepUtil, 92\n"
        );

        objVariables.isPrismaMarketHolidaysInitialized = true;

        resolve("Successfully updated prisma market holidays");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/** 
 * Example response of full stock:
 * [ {
  "symbol" : "AAPL",
  "name" : "Apple Inc.",
  "price" : 425.04000000,
  "changesPercentage" : 10.47000000,
  "change" : 40.28000000,
  "dayLow" : 403.36000000,
  "dayHigh" : 425.66000000,
  "yearHigh" : 425.66000000,
  "yearLow" : 192.58000000,
  "marketCap" : 1842263621632.00000000,
  "priceAvg50" : 372.20715000,
  "priceAvg200" : 314.67236000,
  "volume" : 93573867,
  "avgVolume" : 35427873,
  "exchange" : "NASDAQ",
  "open" : 411.53500000,
  "previousClose" : 384.76000000,
  "eps" : 13.18500000,
  "pe" : 32.23663300,
  "earningsAnnouncement" : "2020-07-30T20:00:00.000+0000",
  "sharesOutstanding" : 4334329996,
  "timestamp" : 1596329461
},
 ...
]
 */
const getFullStockQuoteFromFMP = (shareSymbol) => {
  return new Promise((resolve, reject) => {
    fetch(
      `https://financialmodelingprep.com/api/v3/quote/${shareSymbol.toUpperCase()}?apikey=${FINANCIAL_MODELING_PREP_API_KEY}`
    )
      .then((stockQuote) => {
        return stockQuote.json();
      })
      .then((stockQuoteJSON) => {
        if (isEmpty(stockQuoteJSON)) {
          reject(
            new Error(`shareSymbol ${shareSymbol} does not exist in FMP.`)
          );
        } else {
          resolve(stockQuoteJSON[0]);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = {
  updateMarketHolidaysFromFMP,

  getFullStockQuoteFromFMP
};
