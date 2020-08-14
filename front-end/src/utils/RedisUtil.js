import axios from "axios";
import { getBackendHost } from "./NetworkUtil";

const BACKEND_HOST = getBackendHost();

// redisString: "timestamp1|value1"
export const parseRedisAccountSummaryChartItem = (redisString) => {
  const valuesArray = redisString.split("|");
  return valuesArray;
};

// redisString: "id1|companyCode1|quantity1|buyPriceAvg1|lastPrice1|userID1"
export const parseRedisSharesListItem = (redisString) => {
  const valuesArray = redisString.split("|");

  return {
    id: valuesArray[0],
    companyCode: valuesArray[1],
    quantity: parseInt(valuesArray[2], 10),
    buyPriceAvg: parseFloat(valuesArray[3]),
    lastPrice: parseFloat(valuesArray[4]),
    userID: valuesArray[5],
  };
};

// redisString: "name|price|changesPercentage|change|dayLow|dayHigh|yearHigh|yearLow|marketCap|priceAvg50|priceAvg200|volume|avgVolume|exchange|open|previousClose|eps|pe|earningsAnnouncement|sharesOutstanding|timestamp"
export const parseRedisShareInfo = (redisString) => {
  const valuesArray = redisString.split("|");

  return {
    name: valuesArray[0],
    price: parseFloat(valuesArray[1]),
    changesPercentage: parseFloat(valuesArray[2]),
    change: parseFloat(valuesArray[3]),
    dayLow: parseFloat(valuesArray[4]),
    dayHigh: parseFloat(valuesArray[5]),
    yearHigh: parseFloat(valuesArray[6]),
    yearLow: parseFloat(valuesArray[7]),
    marketCap: parseFloat(valuesArray[8]),
    priceAvg50: parseFloat(valuesArray[9]),
    priceAvg200: parseFloat(valuesArray[10]),
    volume: parseInt(valuesArray[11], 10),
    avgVolume: parseInt(valuesArray[12], 10),
    exchange: valuesArray[13],
    open: parseFloat(valuesArray[14]),
    previousClose: parseFloat(valuesArray[15]),
    eps: parseFloat(valuesArray[16]),
    pe: parseFloat(valuesArray[17]),
    earningsAnnouncement: valuesArray[18],
    sharesOutstanding: parseInt(valuesArray[19], 10),
    timestamp: parseInt(valuesArray[20], 10),
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

export const getParsedCachedShareInfo = (companyCode) => {
  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/redis/getCachedShareInfo`, {
      method: "get",
      params: {
        companyCode,
      },
      withCredentials: true,
    })
      .then((res) => {
        const { data: redisShareInfoString } = res;
        if (!redisShareInfoString) {
          resolve(null);
        } else {
          resolve(parseRedisShareInfo(redisShareInfoString));
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const updateCachedShareInfo = (stockQuoteJSON) => {
  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/redis/updateCachedShareInfo`, {
      method: "put",
      data: {
        stockQuoteJSON,
      },
      withCredentials: true,
    })
      .then((res) => {
        resolve(res);
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

  getCachedAccountSummaryChartInfo,
  getLatestCachedAccountSummaryChartInfoItem,
  updateCachedAccountSummaryChartInfoOneItem,

  getCachedSharesList,
  getParsedCachedSharesList,
  updateCachedSharesList,

  getParsedCachedShareInfo,
  updateCachedShareInfo,
};
