import axios from 'axios';
import _ from 'lodash';
import { 
  changeUserData, 
  calculateTotalSharesValue 
} from './UserUtil';
import { getBackendHost } from './NetworkUtil';

const BACKEND_HOST = getBackendHost();

/** Usage setupUserInformation
 * Use to set up user information for back-end Socket
 */
export const setupUserInformation = "setupUserInformation";

/** Usage checkStockQuotesForUser
 * Use to check stock quotes of user
 */
export const checkStockQuotesForUser = "checkStockQuotesForUser";

export const checkMarketClosed = "checkMarketClosed";

export const updateUserDataForSocket = (socket, userSession) => {
  if(userSession) {
    socket.emit(setupUserInformation, userSession);
    return;
  }

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
export const socketCheckStockQuotes = (socket, userSession, userSharesValue, mutateUser, mutateUserSharesValue) => {

  // example of stockQuotesJSON in back-end/utils/FinancialModelingPrepUtil.js
  socket.on(checkStockQuotesForUser, (stockQuotesJSON) => {
    calculateTotalSharesValue(stockQuotesJSON, userSession.email)
    .then(totalSharesValue => {
      //console.log(totalSharesValue);

      if(!_.isEqual(userSharesValue, totalSharesValue)) {
        mutateUserSharesValue(totalSharesValue);
      }

      const newTotalPortfolioValue = userSession.cash + totalSharesValue;

      /** 
       * changeData so that when we reload page or go to other page, the data
       * would be up-to-date.
       */ 
      const dataNeedChange = {
        totalPortfolio: newTotalPortfolioValue
      };

      if(!_.isEqual(newTotalPortfolioValue, userSession.totalPortfolio)) {
        changeUserData(dataNeedChange, userSession.email, mutateUser);
      }
      else {
        //console.log("No need to update user data.");
      }
    })
    .catch(err => {
      console.log(err);
    })
  })
}

/**
 * classState is state of the class using this socket connection.
 * state must include variable isMarketClosed (boolean)
 */
export const socketCheckMarketClosed = (socket, isMarketClosedInReduxStore, mutateMarket) => {
  socket.on(checkMarketClosed, (ifClosed) => {
    //console.log(ifClosed);

    if(!_.isEqual(ifClosed, isMarketClosedInReduxStore)) {

      if(ifClosed) {
        mutateMarket('closeMarket');
      }

      else {
        mutateMarket('openMarket');
      }
    }
  })  
}

/**
 * options are listed at the beginning of front-end/src/utils/SocketUtil
 * Off All Listeners 
 */
export const offSocketListeners = (socket, option) => {
  socket.off(option);
}

export default {
  setupUserInformation,
  checkStockQuotesForUser,
  checkMarketClosed,
  updateUserDataForSocket,
  socketCheckStockQuotes,
  socketCheckMarketClosed,
  offSocketListeners
}