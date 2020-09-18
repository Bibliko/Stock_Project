import axios from "axios";
import { getBackendHost } from "./low-dependency/NetworkUtil";
import { parseRedisSharesListItem } from "./low-dependency/ParserUtil";

const BACKEND_HOST = getBackendHost();

export const getCachedAccountSummaryChartInfo = (email) => {
  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/redis/getAccountSummaryChartWholeList`, {
      method: "get",
      params: {
        email,
      },
      withCredentials: true,
    })
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
};

export const getLatestCachedAccountSummaryChartInfoItem = (email) => {
  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/redis/getAccountSummaryChartLatestItem`, {
      method: "get",
      params: {
        email,
      },
      withCredentials: true,
    })
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
};

export const updateCachedAccountSummaryChartInfoOneItem = (
  email,
  timestamp,
  portfolioValue
) => {
  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/redis/updateAccountSummaryChartOneItem`, {
      method: "put",
      data: {
        email,
        timestamp,
        portfolioValue,
      },
      withCredentials: true,
    })
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
};

export const updateCachedAccountSummaryChartInfoWholeList = (
  email,
  prismaTimestamps
) => {
  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/redis/updateAccountSummaryChartWholeList`, {
      method: "put",
      data: {
        email,
        prismaTimestamps,
      },
      withCredentials: true,
    })
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
};

export const getCachedSharesList = (email) => {
  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/redis/getSharesList`, {
      method: "get",
      params: {
        email,
      },
      withCredentials: true,
    })
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        reject(e);
      });
  });
};

export const getParsedCachedSharesList = (email) => {
  return new Promise((resolve, reject) => {
    getCachedSharesList(email)
      .then((res) => {
        const { data: redisSharesString } = res;
        let shares = [];

        redisSharesString.map((shareString) => {
          return shares.push(parseRedisSharesListItem(shareString));
        });
        resolve(shares);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const updateCachedSharesList = (email, shares) => {
  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/redis/updateSharesList`, {
      method: "put",
      data: {
        email,
        shares,
      },
      withCredentials: true,
    })
      .then((res) => {
        resolve(res);
      })
      .catch((e) => {
        reject(e);
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
export const getFullStockInfo = (companyCode) => {
  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/redis/getCachedShareInfo`, {
      method: "get",
      params: {
        companyCode,
      },
      withCredentials: true,
    })
      .then((shareInfo) => {
        const { data: fullStockInfo } = shareInfo;
        resolve(fullStockInfo);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const getManyStockInfosUsingPrismaShares = (prismaShares) => {
  // prismaShares means: shares with companyCode attribute
  // prismaShares won't be empty since you need to eliminate that case before using this function

  return new Promise((resolve, reject) => {
    const getCachedSharesInfoPromiseArray = prismaShares.map((share, index) => {
      return getFullStockInfo(share.companyCode);
    });
    Promise.all(getCachedSharesInfoPromiseArray)
      .then((cachedSharesArray) => {
        resolve(cachedSharesArray);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export default {
  getCachedAccountSummaryChartInfo,
  getLatestCachedAccountSummaryChartInfoItem,
  updateCachedAccountSummaryChartInfoOneItem,
  updateCachedAccountSummaryChartInfoWholeList,

  getCachedSharesList, // Layout.js
  getParsedCachedSharesList, // AccountSummary, UserUtil
  updateCachedSharesList, // Layout.js

  getFullStockInfo,
  getManyStockInfosUsingPrismaShares,
};
