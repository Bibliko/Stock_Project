const algoliasearch = require('algoliasearch');

const {
    ALGOLIA_APPLICATION_ID,
    ALGOLIA_API_KEY,
} = process.env;

const client = algoliasearch(ALGOLIA_APPLICATION_ID, ALGOLIA_API_KEY);

var US_STOCK_SYMBOLS_FROM_FINNHUB;

if(process.env.NODE_ENV && process.env.NODE_ENV === "production") {
    US_STOCK_SYMBOLS_FROM_FINNHUB = client.initIndex('prod_US_STOCK_SYMBOLS_FROM_FINNHUB');
}
else {
    US_STOCK_SYMBOLS_FROM_FINNHUB = client.initIndex('dev_US_STOCK_SYMBOLS_FROM_FINNHUB');
}

module.exports = {
    US_STOCK_SYMBOLS_FROM_FINNHUB
}