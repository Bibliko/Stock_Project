import { isEqual } from "lodash";
import axios from "axios";
import { getBackendHost } from "./low-dependency/NetworkUtil";

const BACKEND_HOST = getBackendHost();

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
export const searchCompanyTickers = (searchQuery, limit=3) => {
  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/fmp/searchCompanyTickers`, {
      method: "get",
      params: { searchQuery, limit },
      withCredentials: true,
    })
      .then((searchResults) => {
        resolve(searchResults.data);
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
**/
export const filterStockScreener = ( stockScreener, {
  marketCapFilter,
  sectorFilter,
  industryFilter,
  priceFilter,
}) => {
  return stockScreener
    .filter( ({ price }) => (
      priceFilter[0] <= price && price <= priceFilter[1]
    ))
    .filter(({ marketCap }) => (
      marketCapFilter[0] <= marketCap && marketCap <= marketCapFilter[1]
    ))
    .filter(({ industry }) => (
      industryFilter === "All" || industry === industryFilter
    ))
    .filter(({ sector }) => (
      sectorFilter === "All" || sector === sectorFilter
    ));
};

export const getStockScreener = () => {
  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/fmp/stockScreener`, {
      method: "get",
      withCredentials: true,
    })
      .then((stockScreener) => {
        resolve(stockScreener.data);
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
    axios(`${BACKEND_HOST}/fmp/stockNews`, {
      method: "get",
      params: { companyCode, limit },
      withCredentials: true,
    })
      .then((news) => {
        resolve(news.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const getMostActiveStocks = () => {
  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/fmp/activeStocks`, {
      method: "get",
      withCredentials: true,
    })
      .then((activeStocks) => {
        resolve(activeStocks.data);
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
  searchCompanyTickers,
  filterStockScreener,
  getStockScreener,
  getStockNews,
  getMostActiveStocks,
  shortenCompanyNameToFourWords,
};
