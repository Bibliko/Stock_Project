const fetch = require("node-fetch");
const { isEmpty, isEqual } = require("lodash");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { newDate, getYearUTCString } = require("./low-dependency/DayTimeUtil");
const { SequentialPromisesWithResultsArray } = require("./low-dependency/PromisesUtil");

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
        // example of marketHours is in note above!

        if (marketHours) {
          return marketHours.json();
        }
      })
      .then((marketHoursJSON) => {
        if (marketHoursJSON && marketHoursJSON["Error Message"]) {
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
 * Batch requests up to 800 companies in one request
 * 
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
  shareSymbolsString: 'AAPL,GOOGL,...'
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
 * Batch requests up to 50 companies in one request
 * 
 * [ {
  "symbol" : "AAPL",
  "price" : 120.96,
  "beta" : 1.28511,
  "volAvg" : 165778904,
  "mktCap" : 2068718420000,
  "lastDiv" : 0.75,
  "range" : "52.7675-137.98",
  "changes" : 0.08,
  "companyName" : "Apple Inc",
  "exchange" : "Nasdaq Global Select",
  "exchangeShortName" : "NASDAQ",
  "industry" : "Consumer Electronics",
  "website" : "https://www.apple.com/",
  "description" : "Apple, Inc. engages in the design, manufacture, and sale of smartphones, personal computers, tablets, wearables and accessories, and other variety of related services. The company is headquartered in Cupertino, California and currently employs 137,000 full-time employees. The company is considered one of the Big Four technology companies, alongside Amazon, Google, and Microsoft. The firm's hardware products include the iPhone smartphone, the iPad tablet computer, the Mac personal computer, the iPod portable media player, the Apple Watch smartwatch, the Apple TV digital media player, the AirPods wireless earbuds and the HomePod smart speaker. Apple's software includes the macOS, iOS, iPadOS, watchOS, and tvOS operating systems, the iTunes media player, the Safari web browser, the Shazam acoustic fingerprint utility, and the iLife and iWork creativity and productivity suites, as well as professional applications like Final Cut Pro, Logic Pro, and Xcode. Its online services include the iTunes Store, the iOS App Store, Mac App Store, Apple Music, Apple TV+, iMessage, and iCloud. Other services include Apple Store, Genius Bar, AppleCare, Apple Pay, Apple Pay Cash, and Apple Card.",
  "ceo" : "Mr. Timothy Cook",
  "sector" : "Technology",
  "country" : "US",gh90 
  "fullTimeEmployees" : "137000",
  "phone" : "14089961010",
  "address" : "1 Apple Park Way",
  "city" : "Cupertino",
  "state" : "CALIFORNIA",
  "zip" : "95014",
  "dcfDiff" : 89.92,
  "dcf" : 297.11,
  "image" : "https://financialmodelingprep.com/image-stock/AAPL.jpg",
  "ipoDate" : "1980-12-12"

  -> redisValue: price|beta|volAvg|mktCap|lastDiv|range|changes|companyName|exchange|exchangeShortName|industry|website|description|ceo|sector|country|fullTimeEmployees|phone|address|city|state|zip|dcfDiff|dcf|image|ipoDate
} ]

  shareSymbolsString: 'AAPL,GOOGL,...'
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
        } else {
          resolve(stockProfilesJSON);
        }
        if (isEmpty(stockProfilesJSON)) {
          reject(new Error(`Share symbols do not exist in FMP.`));
        } else if (stockProfilesJSON["Error Message"]) {
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
 * Sample Request
 * [{
    "symbol" : "AAPL",
    "rating" : "S-",
    "ratingScore" : 5,
    "ratingRecommendation" : "Strong Buy",
    ...
  }]
 */
const getSingleShareRatingFromFMP = (shareSymbolString) =>
{
    return new Promise((resolve, reject) =>
    {
        fetch(`https://financialmodelingprep.com/api/v3/rating/${shareSymbolString}?apikey=${FINANCIAL_MODELING_PREP_API_KEY}`)
        .then((stockRating) =>
        {
            return stockRating.json();
        })
        .then((stockRatingJSON) =>
        {
            if (isEmpty(stockRatingJSON))
            {
                // The share symbol of MSF.BR is currently unsupported.
                if (shareSymbolString !== "MSF.BR") reject(new Error("Share symbol does not exist."));
            }
            else if (stockRatingJSON["Error Message"])
            {
                reject(stockRatingJSON["Error Message"]);
            }
            else
            {
                resolve(stockRatingJSON[0]);
            }
        })
        .catch(err => reject(err));
    });
}

/**
 * @description Fetch the rating data with certain number of companies.
 * @param totalCompanies The number of companies that we will fetch. In this version, we'll fetch 600 companies.
 * @return {Promise<object[]>} array of objects (those found in endpoint stock-screener FMP)
 */
const getStockScreenerFromFMP = (totalCompanies) =>
{
    return new Promise((resolve, reject) =>
    {
        fetch(`https://financialmodelingprep.com/api/v3/stock-screener?limit=${totalCompanies}&apikey=${FINANCIAL_MODELING_PREP_API_KEY}`)
        .then((stockRatingsArray) => 
        {
            return stockRatingsArray.json()
        })
        .then((stockRatingsArrayJSON) =>
        {
            if (isEmpty(stockRatingsArrayJSON))
            {
              reject(new Error("There is a problem with FMP API key."));
            }
            else if (stockRatingsArrayJSON["Error Message"])
            {
              reject(stockRatingsArrayJSON["Error Message"]);
            }
            else
            {
              resolve(stockRatingsArrayJSON);
            }
        })
        .catch(err => reject(err));
    });
}



/**
 * @return {Promise<object[]>} array of stocks ratings (obtained from FMP)
 */

const getFullStockRatingsFromFMP = () =>
{
    return new Promise((resolve, reject) =>
    {
      // The number of companies that we will fetch.
      // Since MSF.BR's rating is currently unsupported, we need another company in order to have enough data.
      const totalCompanies = 600 + 1; 

      getStockScreenerFromFMP(totalCompanies)
      .then((stockScreener) =>
      {
          // eslint-disable-next-line prefer-const
          let tasksList = [];
          
          stockScreener.forEach((stockInfo) =>
          {
              tasksList.push(() => getSingleShareRatingFromFMP(stockInfo.symbol));
          });

          return SequentialPromisesWithResultsArray(tasksList);

      })
      .then((stockScreenerArray) => 
      {
        resolve(stockScreenerArray);
      })
      .catch(err => reject(err));
    });
}

module.exports = {
  updateMarketHolidaysFromFMP,

  getSingleShareRatingFromFMP,
  getStockScreenerFromFMP,

  getFullStockQuotesFromFMP,
  getFullStockProfilesFromFMP,
  getFullStockRatingsFromFMP
};
