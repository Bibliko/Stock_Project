import _ from 'lodash';
<<<<<<< HEAD
=======
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
>>>>>>> master

export const checkMarketClosed = "checkMarketClosed";

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
  checkMarketClosed,
  socketCheckMarketClosed,
  offSocketListeners
}