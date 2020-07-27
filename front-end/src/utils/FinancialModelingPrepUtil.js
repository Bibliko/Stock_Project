import fetch from 'node-fetch';

const {
    REACT_APP_FINANCIAL_MODELING_PREP_API_KEY: FINANCIAL_MODELING_PREP_API_KEY
} = process.env;


/** example response of getManyStockPricesFromFMP: Array Objects
 *  [ { symbol: 'AAPL', price: 388, volume: 25207600 }, [...] ]
 */
export const getManyStockPricesFromFMP = (prismaShares) => {
    // prismaShares means: shares with companyCode attribute
    // prismaShares won't be empty since you need to eliminate that case before using this function

    var stringShareSymbols = '';

    for (let share of prismaShares) {
        stringShareSymbols = stringShareSymbols.concat(share.companyCode,',');
    }

    return new Promise((resolve, reject) => {
        fetch(`https://financialmodelingprep.com/api/v3/quote-short/${stringShareSymbols}?apikey=${FINANCIAL_MODELING_PREP_API_KEY}`)
        .then(stockQuotes => {
            return stockQuotes.json();
        })
        .then(stockQuotesJSON => {
            console.log(stockQuotesJSON);
            resolve(stockQuotesJSON);
        })
        .catch(err => {
            reject(err);
        })
    })
}

export const getStockPriceFromFMP = (shareSymbol) => {
    return new Promise((resolve, reject) => {
        fetch(`https://financialmodelingprep.com/api/v3/quote-short/${shareSymbol}?apikey=${FINANCIAL_MODELING_PREP_API_KEY}`)
        .then(stockQuote => {
            return stockQuote.json();
        })
        .then(stockQuoteJSON => {
            console.log(stockQuoteJSON);
            resolve(stockQuoteJSON[0]);
        })
        .catch(err => {
            reject(err);
        })
    })
}

export default {
    getManyStockPricesFromFMP,
    getStockPriceFromFMP
}