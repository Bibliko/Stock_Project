import axios from 'axios';
import _ from 'lodash';
import { 
  changeUserData, 
  calculateTotalSharesValue 
} from './UserUtil';

const {
  REACT_APP_BACKEND_HOST: BACKEND_HOST
} = process.env;

/** Usage setupUserInformation
 * Use to set up user information for back-end Socket
 */
export const setupUserInformation = "setupUserInformation";

/** Usage checkStockQuotesForUser
 * Use to check stock quotes of user
 */
export const checkStockQuotesForUser = "checkStockQuotesForUser";

export const updateUserDataForSocket = (socket) => {
  axios.get(`${BACKEND_HOST}/user`, {withCredentials: true})
  .then(user => {
    socket.emit(setupUserInformation, user.data);
  })
  .catch(e => {
    console.log(e);
  })
}

/** Usage setupSocketToCheckStockQuotes
 * Set up Socket Check Stock Quotes for user
 * Use in front-end/src/pages/Main/AccountSummary
 */
export const setupSocketToCheckStockQuotes = (socket, userSession, setStateFn) => {

  // example of stockQuotesJSON in back-end/utils/FinancialModelingPrepUtil.js
  socket.on(checkStockQuotesForUser, (stockQuotesJSON) => {
    calculateTotalSharesValue(stockQuotesJSON, userSession.email)
    .then(totalSharesValue => {
      // console.log(totalSharesValue);

      const newTotalPortfolioValue = userSession.cash + totalSharesValue;
      
      // setState so that these variables can be used locally immediately.
      setStateFn({
        userTotalSharesValue: totalSharesValue,
        userTotalPortfolioValue: newTotalPortfolioValue
      });

      /** 
       * changeData so that when we reload page or go to other page, the data
       * would be up-to-date.
       */ 
      const dataNeedChange = {
        totalPortfolio: newTotalPortfolioValue
      };

      if(!_.isEqual(newTotalPortfolioValue, userSession.totalPortfolio)) {
        return changeUserData(dataNeedChange, userSession.email);
      }
      else {
        return "No need to update user data.";
      }
    })
    .then(log => {
      //console.log(log);
    })
    .catch(err => {
      console.log(err);
    })
  })
}

export default {
  setupUserInformation,
  checkStockQuotesForUser,
  updateUserDataForSocket,
  setupSocketToCheckStockQuotes
}