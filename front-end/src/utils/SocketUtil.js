import _ from 'lodash';

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