import fetch from "node-fetch";
import { isEmpty } from "lodash";

const {
  REACT_APP_FINANCIAL_MODELING_PREP_API_KEY: FINANCIAL_MODELING_PREP_API_KEY,
} = process.env;

/** example response of getManyStockPricesFromFMP: Array Objects
 *  [ { symbol: 'AAPL', price: 388, volume: 25207600 }, [...] ]
 */
export const getManyStockPricesFromFMP = (prismaShares) => {
  // prismaShares means: shares with companyCode attribute
  // prismaShares won't be empty since you need to eliminate that case before using this function

  var stringShareSymbols = "";

  for (let share of prismaShares) {
    stringShareSymbols = stringShareSymbols.concat(
      share.companyCode.toUpperCase(),
      ","
    );
  }

  return new Promise((resolve, reject) => {
    fetch(
      `https://financialmodelingprep.com/api/v3/quote-short/${stringShareSymbols}?apikey=${FINANCIAL_MODELING_PREP_API_KEY}`
    )
      .then((stockQuotes) => {
        return stockQuotes.json();
      })
      .then((stockQuotesJSON) => {
        console.log(stockQuotesJSON);
        resolve(stockQuotesJSON);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const getStockPriceFromFMP = (shareSymbol) => {
  return new Promise((resolve, reject) => {
    fetch(
      `https://financialmodelingprep.com/api/v3/quote-short/${shareSymbol.toUpperCase()}?apikey=${FINANCIAL_MODELING_PREP_API_KEY}`
    )
      .then((stockQuote) => {
        return stockQuote.json();
      })
      .then((stockQuoteJSON) => {
        console.log(stockQuoteJSON);

        if (isEmpty(stockQuoteJSON)) {
          resolve(null);
        } else {
          resolve(stockQuoteJSON[0]);
        }
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
export const getFullStockQuoteFromFMP = (shareSymbol) => {
  return new Promise((resolve, reject) => {
    fetch(
      `https://financialmodelingprep.com/api/v3/quote/${shareSymbol.toUpperCase()}?apikey=${FINANCIAL_MODELING_PREP_API_KEY}`
    )
      .then((stockQuote) => {
        return stockQuote.json();
      })
      .then((stockQuoteJSON) => {
        console.log(stockQuoteJSON);

        if (isEmpty(stockQuoteJSON)) {
          resolve(null);
        } else {
          resolve(stockQuoteJSON[0]);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const searchNYSETickers = (searchQuery, limit) => {
  return new Promise((resolve, reject) => {
    fetch(
      `https://financialmodelingprep.com/api/v3/search-ticker?query=${searchQuery.toUpperCase()}&limit=${limit}&exchange=${"NYSE"}&apikey=${FINANCIAL_MODELING_PREP_API_KEY}`
    )
      .then((NYSETickers) => {
        return NYSETickers.json();
      })
      .then((NYSEJSON) => {
        resolve(NYSEJSON);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const searchNASDAQTickers = (searchQuery, limit) => {
  return new Promise((resolve, reject) => {
    fetch(
      `https://financialmodelingprep.com/api/v3/search-ticker?query=${searchQuery.toUpperCase()}&limit=${limit}&exchange=${"NASDAQ"}&apikey=${FINANCIAL_MODELING_PREP_API_KEY}`
    )
      .then((NASDAQTickers) => {
        return NASDAQTickers.json();
      })
      .then((NASDAQJSON) => {
        resolve(NASDAQJSON);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * Example response:
 * [ {
  "symbol" : "MAA",
  "name" : "Mid-America Apartment Communities, Inc.",
  "currency" : "USD",
  "stockExchange" : "NYSE",
  "exchangeShortName" : "NYSE"
}, 
...
} ]
 */
export const searchCompanyTickers = (searchQuery) => {
  return new Promise((resolve, reject) => {
    const NYSEStocks = searchNYSETickers(searchQuery, 3);
    const NASDAQStocks = searchNASDAQTickers(searchQuery, 3);

    Promise.all([NYSEStocks, NASDAQStocks])
      .then(([NYSEJSON, NASDAQJSON]) => {
        resolve([NYSEJSON, NASDAQJSON]);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export default {
  getManyStockPricesFromFMP,
  getStockPriceFromFMP,
  getFullStockQuoteFromFMP,
  searchNYSETickers,
  searchNASDAQTickers,
  searchCompanyTickers,
};
