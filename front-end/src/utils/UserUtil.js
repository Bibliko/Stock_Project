import axios from "axios";
import { isEmpty, isEqual } from "lodash";

import { getManyStockPricesFromFMP } from "./FinancialModelingPrepUtil";
import { getBackendHost } from "./NetworkUtil";
import { getParsedCachedSharesList } from "./RedisUtil";

const typeLoginUtil = ["facebook", "google"];
const BACKEND_HOST = getBackendHost();

// User Authorization and Login Related:

export const getUser = () => {
  return new Promise((resolve, reject) => {
    axios
      .get(`${BACKEND_HOST}/user`, { withCredentials: true })
      .then((user) => {
        user.data.dateOfBirth = new Date(user.data.dateOfBirth);
        resolve(user);
      })
      .catch((e) => {
        console.log(e);
        reject(e);
      });
  });
};

export const logoutUser = () => {
  return new Promise((resolve, reject) => {
    axios
      .get(`${BACKEND_HOST}/logout`, { withCredentials: true })
      .then(() => {
        resolve("Successful");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const loginUser = (typeLogin, credentials) => {
  return new Promise((resolve, reject) => {
    if (typeLoginUtil.indexOf(typeLogin) >= 0) {
      window.location = `${BACKEND_HOST}/auth/${typeLogin}`;
      resolve("Successful");
    } else {
      //typeLogin==='local'
      axios(`${BACKEND_HOST}/auth/login`, {
        method: "post",
        data: credentials,
        withCredentials: true,
      })
        .then(() => {
          resolve("Successful");
        })
        .catch((e) => {
          reject(e.response.data.message);
        });
    }
  });
};

export const signupUser = (credentials) => {
  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/auth/signup`, {
      method: "post",
      data: credentials,
      withCredentials: true,
    })
      .then((res) => {
        resolve(res.data.message);
      })
      .catch((e) => {
        reject(e.response.data.message);
      });
  });
};

// Forgot password process includes 3 functions below:

export const sendPasswordVerificationCode = (email) => {
  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/passwordVerification`, {
      method: "get",
      params: {
        email,
      },
      withCredentials: true,
    })
      .then((res) => {
        resolve(res.data.message);
      })
      .catch((err) => {
        reject(err.response.data);
      });
  });
};

export const checkVerificationCode = (code) => {
  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/checkVerificationCode`, {
      method: "get",
      params: {
        code,
      },
      withCredentials: true,
    })
      .then(() => {
        resolve("Successful");
      })
      .catch((err) => {
        reject(err.response.data);
      });
  });
};

export const changePassword = (password, email) => {
  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/userData/changeData`, {
      method: "put",
      data: {
        email,
        dataNeedChange: {
          password,
        },
      },
      withCredentials: true,
    })
      .then(() => {
        resolve("Successfully changed password");
      })
      .catch((err) => {
        console.log(err);
        reject("Your email or credentials may be wrong.");
      });
  });
};

// User Data Related:

export const changeUserData = (dataNeedChange, email, mutateUser) => {
  /**
   * dataNeedChange in form:
   *  dataNeedChange: {
   *      password: "...",
   *      email: "...",
   *      [...]
   *  }
   */

  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/userData/changeData`, {
      method: "put",
      data: {
        email,
        dataNeedChange,
      },
      withCredentials: true,
    })
      .then((userDataRes) => {
        userDataRes.data.dateOfBirth = new Date(userDataRes.data.dateOfBirth);
        mutateUser(userDataRes.data);
        resolve("Successfully changed data");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const getUserData = (dataNeeded, email) => {
  /**
   *  dataNeeded in form of:
   *      dataNeeded: {
   *          cash: true,
   *          region: true,
   *          ...
   *      }
   */

  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/userData/getData`, {
      method: "get",
      params: {
        email,
        dataNeeded,
      },
      withCredentials: true,
    })
      .then((userData) => {
        userData.data.dateOfBirth = new Date(userData.data.dateOfBirth);
        resolve(userData.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// User Calculations Related:

// example of stockQuotesJSON in front-end/src/utils/FinancialModelingPrepUtil.js
export const calculateTotalSharesValue = (
  isMarketClosed,
  stockQuotesJSON,
  shares
) => {
  if (isEmpty(stockQuotesJSON)) {
    return 0;
  }

  let totalValue = 0;

  if (isMarketClosed) {
    // if market closed, we will use lastPrice we saved in our database
    for (let stockQuote of stockQuotesJSON) {
      totalValue += stockQuote.lastPrice * stockQuote.quantity;
    }
    return totalValue;
  }

  /**
   * if market opened, we use prices of stockQuotesJSON to calculate total shares
   * value
   */

  let hashSharesIndices = new Map();
  shares.map((share, index) => {
    return hashSharesIndices.set(share.companyCode, index);
  });

  for (let stockQuote of stockQuotesJSON) {
    let shareWithSameStockQuoteSymbol =
      shares[hashSharesIndices.get(stockQuote.symbol)];

    // add into total value this stock value: stock price * stock quantity
    totalValue += stockQuote.price * shareWithSameStockQuoteSymbol.quantity;
  }

  return totalValue;
};

/**
 * return [stockQuotesJSON, parsedCachedShares]
 */
export const checkStockQuotesForUser = (isMarketClosed, email) => {
  return new Promise((resolve, reject) => {
    getParsedCachedSharesList(email)
      .then((shares) => {
        if (isEmpty(shares)) {
          return [[], shares];
        } else {
          /**
           * Uncomment below line if in Production:
           * - We are using Financial Modeling Prep free API key
           * -> The amount of requests is limited. Use wisely when testing!
           */

          if (!isMarketClosed) {
            //return Promise.all([getManyStockPricesFromFMP(shares), shares]);
          } else {
            return [shares, shares];
          }
        }
      })
      .then((resultSharesList) => {
        if (resultSharesList) {
          resolve(resultSharesList);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/** Usage setupSocketToCheckStockQuotes
 * Set up Socket Check Stock Quotes for user
 * Use in front-end/src/pages/Main/AccountSummary
 */
export const checkStockQuotesToCalculateSharesValue = (
  isMarketClosed,
  userSession,
  mutateUser
) => {
  // example of stockQuotesJSON in back-end/utils/FinancialModelingPrepUtil.js
  checkStockQuotesForUser(isMarketClosed, userSession.email)
    .then((resultStockQuotes) => {
      if (resultStockQuotes) {
        const stockQuotesJSON = resultStockQuotes[0];
        const cachedShares = resultStockQuotes[1];

        const totalSharesValue = calculateTotalSharesValue(
          isMarketClosed,
          stockQuotesJSON,
          cachedShares
        );

        const newTotalPortfolioValue = userSession.cash + totalSharesValue;

        /**
         * changeData so that when we reload page or go to other page, the data
         * would be up-to-date.
         */

        const dataNeedChange = {
          totalPortfolio: newTotalPortfolioValue,
        };

        if (!isEqual(newTotalPortfolioValue, userSession.totalPortfolio)) {
          return changeUserData(dataNeedChange, userSession.email, mutateUser);
        } else {
          //console.log("No need to update user data.");
        }
      }
    })
    .catch((err) => {
      console.log(
        err,
        "\n This error can be caused as when market is opened, we have not enabled getManyStockPricesFromFMP in UserUtil.js checkStockQuotesForUser."
      );
    });
};

export default {
  getUser,
  logoutUser,
  loginUser,
  signupUser,
  sendPasswordVerificationCode,
  checkVerificationCode,
  changePassword,
  changeUserData,
  getUserData,
  calculateTotalSharesValue,
  checkStockQuotesForUser,
  checkStockQuotesToCalculateSharesValue,
};
