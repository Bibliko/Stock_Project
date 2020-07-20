const fetch = require('node-fetch');
const _ = require('lodash');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const {
    oneDay,
    newDate,
    getYearUTCString
} = require('./DayTimeUtil');

const {
    updatePrismaMarketHolidays
} = require('./MarketHolidaysUtil');

const {
    FINANCIAL_MODELING_PREP_API_KEY
} = process.env;

/** example response of getStockQuotesFromFMP: Array Objects
    [
        {
            symbol: 'FB',               [Important]
            name: 'Facebook, Inc.',     [Important]
            price: 245.07,              [Important]
            changesPercentage: 0.23,    [Important]
            change: 0.57,
            dayLow: 239.32,
            dayHigh: 245.49,
            yearHigh: 247.65,
            yearLow: 137.1,
            marketCap: 699189624832,
            priceAvg50: 233.44353,
            priceAvg200: 204.43474,
            volume: 22982716,
            avgVolume: 25883600,
            exchange: 'NASDAQ',         [Important]
            open: 243.685,
            previousClose: 244.5,
            eps: 7.288,
            pe: 33.62651,
            earningsAnnouncement: '2020-07-30T00:00:00.000+0000',
            sharesOutstanding: 2853020055,
            timestamp: 1594516866
        },
        [...]
    ]
*/
const getStockQuotesFromFMP = (prismaShares) => {
    // prismaShares means: shares with companyCode attribute
    // prismaShares won't be empty since you need to eliminate that case before using this function

    var stringShareSymbols = new String('');
    var setShareSymbols = new Set();

    for (let share of prismaShares) {

        // if we already add this share symbol into the String, we don't need to add again
        // if not, add to String and to Set
        if(!setShareSymbols.has(share.companyCode)) {
            stringShareSymbols = stringShareSymbols.concat(share.companyCode,',');
            setShareSymbols.add(share.companyCode);
        }
    }

    return new Promise((resolve, reject) => {
        fetch(`https://financialmodelingprep.com/api/v3/quote/${stringShareSymbols}?apikey=${FINANCIAL_MODELING_PREP_API_KEY}`)
        .then(stockQuotes => {
            return stockQuotes.json();
        })
        .then(stockQuotesJSON => {
            resolve(stockQuotesJSON);
        })
        .catch(err => {
            reject(err);
        })
    })
}

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
        prisma.marketHolidays.findMany({
            select: {
                id: true,
                year: true
            },
            orderBy: {
                year: 'desc'
            }
        })
        .then(marketHolidaysPrisma => {
            if(
                _.isEmpty(marketHolidaysPrisma) || 
                marketHolidaysPrisma[0].year <= year
            ) {
                return fetch(`https://financialmodelingprep.com/api/v3/market-hours?apikey=${FINANCIAL_MODELING_PREP_API_KEY}`);   
            }
        })
        .then(marketHours => {
            // example of marketHours is in note above!

            if(marketHours) {
                return marketHours.json();
            }
        })
        .then(marketHoursJSON => {
            if(marketHoursJSON) {
                let nyseMarket;

                marketHoursJSON.map(marketHoursObj => {
                    if(_.isEqual(marketHoursObj.stockExchangeName, "New York Stock Exchange")) {
                        nyseMarket = marketHoursObj;
                    }
                })

                return nyseMarket;
            }
        })
        .then(nyseMarket => {
            if(nyseMarket) {
                nyseMarket.stockMarketHolidays.map(stockMarketHoliday => {
                    return updatePrismaMarketHolidays(stockMarketHoliday);
                })
            }
        })
        .then(afterUpdated => {
            console.log("prisma market holidays updated FinancialModelingPrepUtil, 149");

            objVariables.isPrismaMarketHolidaysInitialized = true;

            resolve("prisma market holidays updated");
        })
        .catch(err => {
            reject(err);
        })
    });
}

module.exports = {
    getStockQuotesFromFMP,
    updateMarketHolidaysFromFMP
}
    