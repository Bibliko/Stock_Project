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
        orderBy: {
          year: "desc"
        }
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
          "prisma market holidays updated FinancialModelingPrepUtil, 90"
        );

        objVariables.isPrismaMarketHolidaysInitialized = true;

        resolve("Successfully updated prisma market holidays");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = {
  updateMarketHolidaysFromFMP
};
