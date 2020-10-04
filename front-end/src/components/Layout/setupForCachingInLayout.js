import { isEmpty } from "lodash";
import {
  checkStockQuotesToCalculateSharesValue,
  getUserData,
  getUserAccountSummaryChartTimestamps,
} from "../../utils/UserUtil";
import {
  updateCachedSharesList,
  getCachedSharesList,
  getCachedAccountSummaryChartInfo,
  updateCachedAccountSummaryChartInfoWholeList,
} from "../../utils/RedisUtil";
import {
  getYearUTCString,
  newDate,
} from "../../utils/low-dependency/DayTimeUtil";

const setupSharesListForCaching = (isMarketClosed, userSession, mutateUser) => {
  return new Promise((resolve, reject) => {
    getCachedSharesList(userSession.email)
      .then((res) => {
        const { data: cachedShares } = res;
        if (isEmpty(cachedShares)) {
          const dataNeeded = {
            shares: true,
          };
          return getUserData(dataNeeded, userSession.email);
        }
      })
      .then((sharesData) => {
        if (sharesData) {
          const { shares } = sharesData;
          if (shares && !isEmpty(shares)) {
            return updateCachedSharesList(userSession.email, shares);
          }
        }
      })
      .then((afterUpdatingCachedSharesList) => {
        // checkStockQuotesToCalculateSharesValue(
        //   isMarketClosed,
        //   userSession,
        //   mutateUser
        // );
        resolve("Finished setting up Redis Shares List.");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const setupAccountSummaryChartForCaching = (userSession) => {
  return new Promise((resolve, reject) => {
    getCachedAccountSummaryChartInfo(userSession.email)
      .then((res) => {
        const { data: chartInfo } = res;
        if (isEmpty(chartInfo)) {
          return getUserAccountSummaryChartTimestamps(
            getYearUTCString(newDate()) - 2,
            userSession.email
          );
        }
      })
      .then((chartInfoFromDatabase) => {
        if (chartInfoFromDatabase && !isEmpty(chartInfoFromDatabase)) {
          return updateCachedAccountSummaryChartInfoWholeList(
            userSession.email,
            chartInfoFromDatabase
          );
        }
      })
      .then((afterUpdatingCachedAccountSummaryChartInfoList) => {
        resolve("Finished setting up Redis Account Summary Chart List.");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const mainSetup = (isMarketClosed, userSession, mutateUser) => {
  return Promise.all([
    setupSharesListForCaching(isMarketClosed, userSession, mutateUser),
    setupAccountSummaryChartForCaching(userSession),
  ]);
};

export default {
  setupSharesListForCaching,
  setupAccountSummaryChartForCaching,

  mainSetup,
};