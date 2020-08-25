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

export default {
  parseRedisAccountSummaryChartItem,
  parseRedisSharesListItem,
  parseRedisShareInfo,

  getCachedAccountSummaryChartInfo,
  getLatestCachedAccountSummaryChartInfoItem,
  updateCachedAccountSummaryChartInfoOneItem,

  getCachedSharesList, // Layout.js
  getParsedCachedSharesList, // AccountSummary, UserUtil
  updateCachedSharesList, // Layout.js
};
