import fetch from "node-fetch";
import { isEqual } from "lodash";

const {
  REACT_APP_FINANCIAL_MODELING_PREP_API_KEY: FINANCIAL_MODELING_PREP_API_KEY,
} = process.env;

export const searchNYSETickers = (searchQuery, limit) => {
  return new Promise((resolve, reject) => {
    fetch(
      `https://financialmodelingprep.com/api/v3/search?query=${searchQuery.toUpperCase()}&limit=${limit}&exchange=${"NYSE"}&apikey=${FINANCIAL_MODELING_PREP_API_KEY}`
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
      `https://financialmodelingprep.com/api/v3/search?query=${searchQuery.toUpperCase()}&limit=${limit}&exchange=${"NASDAQ"}&apikey=${FINANCIAL_MODELING_PREP_API_KEY}`
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

export const shortenCompanyNameToFourWords = (companyName) => {
  let resultName = "";
  let numberOfSpaces = 0;
  for (let i = 0; i < companyName.length; i++) {
    if (numberOfSpaces >= 4) {
      break;
    }
    if (isEqual(companyName.charAt(i), " ")) {
      numberOfSpaces++;
    }
    resultName += companyName.charAt(i);
  }
  return resultName;
};

export default {
  searchNYSETickers,
  searchNASDAQTickers,
  searchCompanyTickers,
  shortenCompanyNameToFourWords,
};
