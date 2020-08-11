import axios from "axios";
import { getBackendHost } from "./NetworkUtil";
import { isEqual, includes } from "lodash";

const BACKEND_HOST = getBackendHost();

// redisString: "timestamp1|value1"
export const parseRedisAccountSummaryChartItem = (redisString) => {
  const indexOfVerticalLine = redisString.indexOf("|");
  return [
    redisString.substring(0, indexOfVerticalLine),
    redisString.substring(indexOfVerticalLine + 1),
  ];
};

// redisString: "id1|companyCode1|quantity1|buyPriceAvg1|lastPrice1|userID1"
export const parseRedisSharesListItem = (redisString) => {
  const indicesOfVerticalLine = [redisString.indexOf("|")];
  for (let i = 1; i < 5; i++) {
    indicesOfVerticalLine.push(
      redisString.indexOf("|", indicesOfVerticalLine[i - 1] + 1)
    );
  }

  const resultObj = {};
  const keys = [
    "id",
    "companyCode",
    "quantity",
    "buyPriceAvg",
    "lastPrice",
    "userID",
  ];
  resultObj["id"] = redisString.substring(0, indicesOfVerticalLine[0]);
  resultObj["userID"] = redisString.substring(indicesOfVerticalLine[4] + 1);

  for (let i = 1; i < 5; i++) {
    const key = keys[i];
    const valueInsideRedisString = redisString.substring(
      indicesOfVerticalLine[i - 1] + 1,
      indicesOfVerticalLine[i]
    );
    if (isEqual(key, "companyCode")) {
      resultObj[key] = valueInsideRedisString;
    } else if (isEqual(key, "quantity")) {
      resultObj[key] = parseInt(valueInsideRedisString, 10);
    } else {
      resultObj[key] = parseFloat(valueInsideRedisString);
    }
  }

  return resultObj;
};

// redisString: "name|price|changesPercentage|change|dayLow|dayHigh|yearHigh|yearLow|marketCap|priceAvg50|priceAvg200|volume|avgVolume|exchange|open|previousClose|eps|pe|earningsAnnouncement|sharesOutstanding|timestamp"
export const parseRedisShareInfo = (redisString) => {
  const indicesOfVerticalLine = [redisString.indexOf("|")];
  for (let i = 1; i < 20; i++) {
    indicesOfVerticalLine.push(
      redisString.indexOf("|", indicesOfVerticalLine[i - 1] + 1)
    );
  }

  const resultObj = {};
  const keys = [
    "name",
    "price",
    "changesPercentage",
    "change",
    "dayLow",
    "dayHigh",
    "yearHigh",
    "yearLow",
    "marketCap",
    "priceAvg50",
    "priceAvg200",
    "volume",
    "avgVolume",
    "exchange",
    "open",
    "previousClose",
    "eps",
    "pe",
    "earningsAnnouncement",
    "sharesOutstanding",
    "timestamp",
  ];
  const itemsNeedParseInt = ["volume", "sharesOutstanding"];
  const itemsNeedPureString = ["exchange", "earningsAnnouncement"];
  resultObj["name"] = redisString.substring(0, indicesOfVerticalLine[0]);
  resultObj["timestamp"] = parseInt(
    redisString.substring(indicesOfVerticalLine[19] + 1),
    10
  );

  for (let i = 1; i < 20; i++) {
    const key = keys[i];
    const valueInsideRedisString = redisString.substring(
      indicesOfVerticalLine[i - 1] + 1,
      indicesOfVerticalLine[i]
    );
    if (includes(itemsNeedPureString, key)) {
      resultObj[key] = valueInsideRedisString;
    } else if (includes(itemsNeedParseInt, key)) {
      resultObj[key] = parseInt(valueInsideRedisString, 10);
    } else {
      resultObj[key] = parseFloat(valueInsideRedisString);
    }
  }

  return resultObj;
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
