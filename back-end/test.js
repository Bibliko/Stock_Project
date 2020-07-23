require('./config/config');

const {
    FINANCIAL_MODELING_PREP_API_KEY
} = process.env;

const fetch = require('node-fetch');

const getStockQuoteFromFMP = (shareSymbol) => {
    return new Promise((resolve, reject) => {
        fetch(`https://financialmodelingprep.com/api/v3/quote-short/${shareSymbol}?apikey=${FINANCIAL_MODELING_PREP_API_KEY}`)
        .then(stockQuote => {
            return stockQuote.json();
        })
        .then(stockQuoteJSON => {
            console.log(stockQuoteJSON[0]);
            resolve(stockQuoteJSON[0]);
        })
        .catch(err => {
            reject(err);
        })
    })
}

getStockQuoteFromFMP('AAPL');

// [ { symbol: 'AAPL', price: 388, volume: 25207600 } ]