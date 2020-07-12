const fetch = require('node-fetch');

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

    var stringShareSymbols = new String('');
    var arrayShareSymbols = new Set();

    for (let share of prismaShares) {

        // if we already add this share symbols into the String, we don't need to add again
        // if not, add to String and to Set
        if(!arrayShareSymbols.has(share.companyCode)) {
            stringShareSymbols = stringShareSymbols.concat(share.companyCode,',');
            arrayShareSymbols.add(share.companyCode);
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

module.exports = {
    getStockQuotesFromFMP
}
    