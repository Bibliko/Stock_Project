import axios from "axios";
import { getBackendHost } from "./NetworkUtil";

const BACKEND_HOST = getBackendHost();

// redisString: "timestamp1|value1"
export const parseRedisAccountSummaryChartItem = (redisString) => {
  const valuesArray = redisString.split("|");
  return valuesArray;
};

// redisString: "id1|companyCode1|quantity1|buyPriceAvg1|userID1"
export const parseRedisSharesListItem = (redisString) => {
  const valuesArray = redisString.split("|");

  return {
    id: valuesArray[0],
    companyCode: valuesArray[1],
    quantity: parseInt(valuesArray[2], 10),
    buyPriceAvg: parseFloat(valuesArray[3]),
    userID: valuesArray[4],
  };
};

// redisString: "isUpdatingUsingFMP|timestampLastUpdated|name|price|changesPercentage|change|dayLow|dayHigh|yearHigh|yearLow|marketCap|priceAvg50|priceAvg200|volume|avgVolume|exchange|open|previousClose|eps|pe|earningsAnnouncement|sharesOutstanding|timestamp"
export const parseRedisShareInfo = (redisString) => {
  const valuesArray = redisString.split("|");

  return {
    isUpdatingUsingFMP: valuesArray[0] === "true",
    timestampLastUpdated: parseInt(valuesArray[1], 10),
    name: valuesArray[2],
    price: parseFloat(valuesArray[3]),
    changesPercentage: parseFloat(valuesArray[4]),
    change: parseFloat(valuesArray[5]),
    dayLow: parseFloat(valuesArray[6]),
    dayHigh: parseFloat(valuesArray[7]),
    yearHigh: parseFloat(valuesArray[8]),
    yearLow: parseFloat(valuesArray[9]),
    marketCap: parseFloat(valuesArray[10]),
    priceAvg50: parseFloat(valuesArray[11]),
    priceAvg200: parseFloat(valuesArray[12]),
    volume: parseInt(valuesArray[13], 10),
    avgVolume: parseInt(valuesArray[14], 10),
    exchange: valuesArray[15],
    open: parseFloat(valuesArray[16]),
    previousClose: parseFloat(valuesArray[17]),
    eps: parseFloat(valuesArray[18]),
    pe: parseFloat(valuesArray[19]),
    earningsAnnouncement: valuesArray[20],
    sharesOutstanding: parseInt(valuesArray[21], 10),
    timestamp: parseInt(valuesArray[22], 10),
  };
};

/**
 * redisString: "id|createdAt|companyCode|quantity|priceAtTransaction|brokerage|finishedTime|isTypeBuy|userID"
 */
export const parseRedisTransactionsHistoryListItem = (redisString) => {
  const valuesArray = redisString.split("|");

  return {
    id: valuesArray[0],
    createdAt: valuesArray[1],
    companyCode: valuesArray[2],
    quantity: parseInt(valuesArray[3], 10),
    priceAtTransaction: parseFloat(valuesArray[4]),
    brokerage: parseFloat(valuesArray[5]),
    finishedTime: valuesArray[6],
    isTypeBuy: valuesArray[7] === "true" ? true : false,
    userID: valuesArray[8],
  };
};

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

export const getCachedPaginatedTransactionsHistoryList = (email, page) => {
  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/redis/getPaginatedTransactionsHistoryList`, {
      method: "get",
      params: {
        email,
        page,
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

export const getParsedCachedPaginatedTransactionsHistoryList = (
  email,
  page
) => {
  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/redis/getPaginatedTransactionsHistoryList`, {
      method: "get",
      params: {
        email,
        page,
      },
      withCredentials: true,
    })
      .then((res) => {
        const { data: redisTransactionsHistoryString } = res;
        let transactionsHistory = [];

        redisTransactionsHistoryString.map((transactionHistoryString) => {
          return transactionsHistory.push(
            parseRedisTransactionsHistoryListItem(transactionHistoryString)
          );
        });

        resolve(transactionsHistory);
      })
      .catch((e) => {
        reject(e);
      });
  });
};

/**
 * finishedTransactions will take in prisma transactions that have attribute isFinished true
 */
export const updateCachedTransactionsHistoryListWholeList = (
  email,
  finishedTransactions
) => {
  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/redis/updateTransactionsHistoryListWholeList`, {
      method: "put",
      data: {
        email,
        finishedTransactions,
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
 * finishedTransaction will take in one prisma transaction that have attribute isFinished true
 */
export const updateCachedTransactionsHistoryListOneItem = (
  email,
  finishedTransaction
) => {
  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/redis/updateTransactionsHistoryListOneItem`, {
      method: "put",
      data: {
        email,
        finishedTransaction,
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
export const getFullStockQuote = (companyCode) => {
  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/redis/getCachedShareInfo`, {
      method: "get",
      params: {
        companyCode,
      },
      withCredentials: true,
    })
      .then((shareInfo) => {
        const { data: stockQuoteJSON } = shareInfo;
        resolve(stockQuoteJSON);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const getManyStockQuotes = (prismaShares) => {
  // prismaShares means: shares with companyCode attribute
  // prismaShares won't be empty since you need to eliminate that case before using this function

  return new Promise((resolve, reject) => {
    const getCachedSharesInfoPromiseArray = prismaShares.map((share, index) => {
      return getFullStockQuote(share.companyCode);
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
  parseRedisAccountSummaryChartItem,
  parseRedisSharesListItem,
  parseRedisShareInfo,
  parseRedisTransactionsHistoryListItem,

  getCachedAccountSummaryChartInfo,
  getLatestCachedAccountSummaryChartInfoItem,
  updateCachedAccountSummaryChartInfoOneItem,
  updateCachedAccountSummaryChartInfoWholeList,

  getCachedSharesList, // Layout.js
  getParsedCachedSharesList, // AccountSummary, UserUtil
  updateCachedSharesList, // Layout.js

  getCachedPaginatedTransactionsHistoryList,
  getParsedCachedPaginatedTransactionsHistoryList,
  updateCachedTransactionsHistoryListOneItem,
  updateCachedTransactionsHistoryListWholeList,

  getFullStockQuote,
  getManyStockQuotes,
};
