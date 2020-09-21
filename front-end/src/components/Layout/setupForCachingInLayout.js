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

const setupSharesListForCaching = (thisComponent) => {
  const { email } = thisComponent.props.userSession;

  return new Promise((resolve, reject) => {
    getCachedSharesList(email)
      .then((res) => {
        const { data: cachedShares } = res;
        if (isEmpty(cachedShares)) {
          const dataNeeded = {
            shares: true,
          };
          return getUserData(dataNeeded, email);
        }
      })
      .then((sharesData) => {
        if (sharesData) {
          const { shares } = sharesData;
          if (shares && !isEmpty(shares)) {
            return updateCachedSharesList(email, shares);
          }
        }
      })
      .then((afterUpdatingCachedSharesList) => {
        // checkStockQuotesToCalculateSharesValue(
        //   thisComponent
        // );
        resolve("Finished setting up Redis Shares List.");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const setupAccountSummaryChartForCaching = (thisComponent) => {
  const { email } = thisComponent.props.userSession;

  return new Promise((resolve, reject) => {
    getCachedAccountSummaryChartInfo(email)
      .then((res) => {
        const { data: chartInfo } = res;
        if (isEmpty(chartInfo)) {
          return getUserAccountSummaryChartTimestamps(
            getYearUTCString(newDate()) - 2,
            email
          );
        }
      })
      .then((chartInfoFromDatabase) => {
        if (chartInfoFromDatabase && !isEmpty(chartInfoFromDatabase)) {
          return updateCachedAccountSummaryChartInfoWholeList(
            email,
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

/**
 * @param thisComponent reference of component (this) - in this case Layout.js
 */
export const mainSetup = (thisComponent) => {
  return Promise.all([
    setupSharesListForCaching(thisComponent),
    setupAccountSummaryChartForCaching(thisComponent),
  ]);
};

export default {
  setupSharesListForCaching,
  setupAccountSummaryChartForCaching,

  mainSetup,
};
