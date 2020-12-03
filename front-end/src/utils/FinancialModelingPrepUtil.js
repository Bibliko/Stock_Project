import fetch from "node-fetch";
import { isEqual } from "lodash";

import { roundNumber } from "./low-dependency/NumberUtil";

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

/** param
{
  marketCapFilter: [lower bound, upper bound],
  priceFilter: [lower bound, upper bound],
  sectorFilter: string (FmpHelper.fmpSector),
  industryFilter: string (FmpHelper.fmpIndustry),
}
Path to FmpHelper: root/front-end/src/components/low-dependency/FmpHelper.js

If we use option Limit in FMP stock-screener, FMP will sort by market cap from largest to smallest first, then limit after.
**/
export const getStockScreener = ({
  marketCapFilter,
  sectorFilter,
  industryFilter,
  priceFilter,
}) => {
  const sectorString = sectorFilter !== "All" ? "&sector=" + sectorFilter : "";
  const industryString =
    industryFilter !== "All" ? "&industry=" + industryFilter : "";

  return new Promise((resolve, reject) => {
    fetch(
      `https://financialmodelingprep.com/api/v3/stock-screener?marketCapMoreThan=${roundNumber(
        marketCapFilter[0]
      )}&marketCapLowerThan=${roundNumber(
        marketCapFilter[1]
      )}${sectorString}${industryString}&exchange=${"NYSE,NASDAQ"}&apikey=${FINANCIAL_MODELING_PREP_API_KEY}`
    )
      .then((stockScreener) => {
        return stockScreener.json();
      })
      .then((stockScreenerJSON) => {
        resolve(
          stockScreenerJSON
            .map(
              ({ companyName, symbol, price, marketCap, industry, sector }) => {
                return {
                  name: companyName,
                  code: symbol,
                  price: price,
                  marketCap: marketCap,
                };
              }
            )
            .filter(
              ({ price }) => priceFilter[0] <= price && price <= priceFilter[1]
            )
        );
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 *
 * @param {String} companyCode company code needed
 * @param {Number} limit how many news do you need?
 */
export const getStockNews = (companyCode, limit) => {
  return new Promise((resolve, reject) => {
    fetch(
      `https://financialmodelingprep.com/api/v3/stock_news?tickers=${companyCode}&limit=${limit}&apikey=${FINANCIAL_MODELING_PREP_API_KEY}`
    )
      .then((news) => {
        return news.json();
      })
      .then((newsJSON) => {
        resolve(newsJSON);
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
  getStockScreener,
  getStockNews,

  shortenCompanyNameToFourWords,
};
