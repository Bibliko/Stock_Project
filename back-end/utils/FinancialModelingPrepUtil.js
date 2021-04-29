const fetch = require("node-fetch");
const { isEmpty, isEqual } = require("lodash");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { newDate, getYearUTCString } = require("./low-dependency/DayTimeUtil");
const {
  SequentialPromisesWithResultsArray
} = require("./low-dependency/PromisesUtil");

const { updatePrismaMarketHolidays } = require("./MarketHolidaysUtil");

const { FINANCIAL_MODELING_PREP_API_KEY } = require('../config');

/**
 *  @description
 *  - Initially, time for interval to update market holidays is one second.
 *  - After we initialize prisma market holidays, we change this time to one day.
 *  - We also change boolean isPrismaMarketHolidaysInitialized to true
 *  @param {object} globalBackendVariables global object declared in back-end/index
 */
const updateMarketHolidaysFromFMP = (globalBackendVariables) => {
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
        // example of marketHours is in FMP!
        if (marketHours) {
          return marketHours.json();
        }
      })
      .then((marketHoursJSON) => {
        if (marketHoursJSON && marketHoursJSON["Error Message"]) {
          console.log(
            FINANCIAL_MODELING_PREP_API_KEY,
            "FinancialModelingPrepUtil updateMarketHolidaysFromFMP"
          );
          reject(marketHoursJSON["Error Message"]);
          return;
        }
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
          "prisma market holidays updated FinancialModelingPrepUtil updateMarketHolidaysFromFMP.\n"
        );

        globalBackendVariables.isPrismaMarketHolidaysInitialized = true;

        resolve("Successfully updated prisma market holidays");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * @note Batch requests up to 800 companies in one request
 * @param {string} shareSymbolsString e.g: 'AAPL,GOOGL'
 */
const getFullStockQuotesFromFMP = (shareSymbolsString) => {
  return new Promise((resolve, reject) => {
    fetch(
      `https://financialmodelingprep.com/api/v3/quote/${shareSymbolsString}?apikey=${FINANCIAL_MODELING_PREP_API_KEY}`
    )
      .then((stockQuotes) => {
        return stockQuotes.json();
      })
      .then((stockQuotesJSON) => {
        if (isEmpty(stockQuotesJSON)) {
          reject(new Error(`Share symbols do not exist in FMP.`));
        } else if (stockQuotesJSON["Error Message"]) {
          console.log(
            FINANCIAL_MODELING_PREP_API_KEY,
            "FinancialModelingPrepUtil getFullStockQuotesFromFMP"
          );
          reject(stockQuotesJSON["Error Message"]);
        } else {
          resolve(stockQuotesJSON);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * @note Batch requests up to 50 companies in one request
 * @param {string} shareSymbolsString e.g: 'AAPL,GOOGL'
 */
const getFullStockProfilesFromFMP = (shareSymbolsString) => {
  return new Promise((resolve, reject) => {
    fetch(
      `https://financialmodelingprep.com/api/v3/profile/${shareSymbolsString}?apikey=${FINANCIAL_MODELING_PREP_API_KEY}`
    )
      .then((stockProfiles) => {
        return stockProfiles.json();
      })
      .then((stockProfilesJSON) => {
        if (isEmpty(stockProfilesJSON)) {
          reject(new Error(`Share symbols do not exist in FMP.`));
        } else if (stockProfilesJSON["Error Message"]) {
          console.log(
            FINANCIAL_MODELING_PREP_API_KEY,
            "FinancialModelingPrepUtil getFullStockProfilesFromFMP"
          );
          reject(stockProfilesJSON["Error Message"]);
        } else {
          resolve(stockProfilesJSON);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 *  @param {string} exchangeOrCompany NYSE or NASDAQ or company code
 *  @param {string} typeChart 5min or full
 */
const getHistoricalChartFromFMP = (exchangeOrCompany, typeChart) => {
  return new Promise((resolve, reject) => {
    const searchQuery =
      exchangeOrCompany.toUpperCase() === "NYSE"
        ? "^NYA"
        : exchangeOrCompany.toUpperCase() === "NASDAQ"
        ? "^IXIC"
        : exchangeOrCompany.toUpperCase();

    const fmpTypeChart =
      typeChart === "5min"
        ? "historical-chart/5min"
        : typeChart === "full"
        ? "historical-price-full"
        : "";

    if (fmpTypeChart === "") {
      reject(new Error(`FMP Chart Type should be 5min or full.`));
      return;
    }

    fetch(
      `https://financialmodelingprep.com/api/v3/${fmpTypeChart}/${searchQuery}?apikey=${FINANCIAL_MODELING_PREP_API_KEY}`
    )
      .then((historicalChart) => {
        return historicalChart.json();
      })
      .then((historicalChartJSON) => {
        if (isEmpty(historicalChartJSON)) {
          reject(
            new Error(
              `Share symbol's or exchange's historical chart does not exist in FMP.`
            )
          );
        } else if (historicalChartJSON["Error Message"]) {
          console.log(
            FINANCIAL_MODELING_PREP_API_KEY,
            "FinancialModelingPrepUtil getHistoricalChartFromFMP"
          );
          reject(historicalChartJSON["Error Message"]);
        } else {
          const result =
            typeChart === "5min"
              ? historicalChartJSON
              : historicalChartJSON.historical;
          resolve(result);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * Sample Request
 * [{
    "symbol" : "AAPL",
    "rating" : "S-",
    "ratingScore" : 5,
    "ratingRecommendation" : "Strong Buy",
    ...
  }]
 */
const getSingleShareRatingFromFMP = (shareSymbolString) => {
  return new Promise((resolve, reject) => {
    fetch(
      `https://financialmodelingprep.com/api/v3/rating/${shareSymbolString}?apikey=${FINANCIAL_MODELING_PREP_API_KEY}`
    )
      .then((stockRating) => {
        return stockRating.json();
      })
      .then((stockRatingJSON) => {
        if (isEmpty(stockRatingJSON)) {
          // Some shareSymbolStrings are not well formated on the server, causing things to collapsed
          console.log(shareSymbolString + " does not exist.");
          resolve(null);
        } else if (stockRatingJSON["Error Message"]) {
          reject(stockRatingJSON["Error Message"]);
        } else {
          resolve(stockRatingJSON[0]);
        }
      })
      .catch((err) => reject(err));
  });
};

/**
 * @description Fetch the rating data with certain number of companies.
 * @param totalCompanies The number of companies that we will fetch. In this version, we'll fetch 600 companies.
 * @return {Promise<object[]>} array of objects (those found in endpoint stock-screener FMP)
 */
const getStockScreenerFromFMP = (totalCompanies) => {
  return new Promise((resolve, reject) => {
    fetch(
      `https://financialmodelingprep.com/api/v3/stock-screener?limit=${totalCompanies}&apikey=${FINANCIAL_MODELING_PREP_API_KEY}`
    )
      .then((stockRatingsArray) => {
        return stockRatingsArray.json();
      })
      .then((stockRatingsArrayJSON) => {
        if (isEmpty(stockRatingsArrayJSON)) {
          reject(new Error("There is a problem with FMP API key."));
        } else if (stockRatingsArrayJSON["Error Message"]) {
          reject(stockRatingsArrayJSON["Error Message"]);
        } else {
          resolve(stockRatingsArrayJSON);
        }
      })
      .catch((err) => reject(err));
  });
};

/**
 *
 * @description Using Screener of FMP and keyword "limit" to get the name of companies, in this case is 20.
 * After that, loop over every company and use the rating api for each company.
 * @return {Promise<object[]>} array of stocks ratings (obtained from FMP)
 */

const getFullStockRatingsFromFMP = () => {
  return new Promise((resolve, reject) => {
    // The number of companies that we will fetch.
    const totalCompanies = 20;

    getStockScreenerFromFMP(totalCompanies)
      .then((stockScreener) => {
        // eslint-disable-next-line prefer-const
        let tasksList = [];
        stockScreener.forEach((stockInfo, index) => {
          if (stockInfo.symbol) {
            tasksList.push(() => getSingleShareRatingFromFMP(stockInfo.symbol));
          }
        });

        return SequentialPromisesWithResultsArray(tasksList);
      })
      .then((stockRatingsArray) => resolve(stockRatingsArray))
      .catch((err) => reject(err));
  });
};

/**
 * @description Get most gainers (companies) from NYSE and NASDAQ (default exchanges of FMP).
 * @return {Promise<object[]>} array of objects (those found in endpoint gainers FMP)
 */
const getMostGainersFromFMP = () => {
  return new Promise((resolve, reject) => {
    fetch(
      `https://financialmodelingprep.com/api/v3/gainers?apikey=${FINANCIAL_MODELING_PREP_API_KEY}`
    )
      .then((gainers) => {
        return gainers.json();
      })
      .then((gainers) => {
        if (isEmpty(gainers)) {
          reject(new Error("There is a problem with FMP API key."));
        } else if (gainers["Error Message"]) {
          reject(gainers["Error Message"]);
        } else {
          resolve(gainers);
        }
      })
      .catch((err) => reject(err));
  });
};

module.exports = {
  updateMarketHolidaysFromFMP,

  getSingleShareRatingFromFMP,
  getStockScreenerFromFMP,

  getFullStockQuotesFromFMP,
  getFullStockProfilesFromFMP,
  getFullStockRatingsFromFMP,

  getHistoricalChartFromFMP,

  getMostGainersFromFMP
};
