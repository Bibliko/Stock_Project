import axios from "axios";
import { getBackendHost } from "./low-dependency/NetworkUtil";
import { parseRedisSharesListItem } from "./low-dependency/ParserUtil";

const BACKEND_HOST = getBackendHost();

// const updateAccountSummaryChartWholeList = "updateAccountSummaryChartWholeList";
// const updateAccountSummaryChartOneItem = "updateAccountSummaryChartOneItem";
const getAccountSummaryChartWholeList = "getAccountSummaryChartWholeList";
// const getAccountSummaryChartLatestItem = "getAccountSummaryChartLatestItem";

// const updateSharesList = "updateSharesList";
const getSharesList = "getSharesList";

const getCachedShareInfo = "getCachedShareInfo";
const getManyCachedSharesInfo = "getManyCachedSharesInfo";

export const getCachedAccountSummaryChartInfo = (email) => {
  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/redis/${getAccountSummaryChartWholeList}`, {
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

export const getCachedSharesList = (email) => {
  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/redis/${getSharesList}`, {
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

/**
 * @param {string} companyCode company code. e.g: AAPl -> Must be in capital
 * @description Get full stock quote + profile (using FMP data)
 */
export const getFullStockInfo = (companyCode) => {
  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/redis/${getCachedShareInfo}`, {
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

/**
 * @param {string[]} companyCodes company codes. e.g: AAPL, GOOGL, ... -> Must be in capital
 * @description Get full stock quote + profile (using FMP data) of all company codes in parameter
 */
export const getManyFullStocksInfo = (companyCodes) => {
  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/redis/${getManyCachedSharesInfo}`, {
      method: "get",
      params: {
        companyCodes,
      },
      withCredentials: true,
    })
      .then((sharesInfo) => {
        const { data: fullStocksInfo } = sharesInfo;
        resolve(fullStocksInfo);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * @param {object[]} prismaShares objects of Prisma Share
 * - prismaShares means: shares with companyCode attribute
 * - prismaShares won't be empty since you need to eliminate that case before using this function
 * @description Wrapper over function getManyFullStocksInfo
 * @return {Promise<object[]>}
 */
export const getManyStockInfosUsingPrismaShares = (prismaShares) => {
  return new Promise((resolve, reject) => {
    const companyCodes = prismaShares.map((share) => {
      return share.companyCode;
    });
    getManyFullStocksInfo(companyCodes)
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

  getCachedSharesList, // Layout.js
  getParsedCachedSharesList, // AccountSummary, UserUtil

  getFullStockInfo,
  getManyFullStocksInfo,

  getManyStockInfosUsingPrismaShares,
};
