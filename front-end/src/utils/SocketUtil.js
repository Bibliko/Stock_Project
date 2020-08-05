import { isEqual, isEmpty } from "lodash";

export const checkMarketClosed = "checkMarketClosed";

/**
 * classState is state of the class using this socket connection.
 * state must include variable isMarketClosed (boolean)
 */
export const socketCheckMarketClosed = (
  socket,
  isMarketClosedInReduxStore,
  mutateMarket,
  marketCountdownInLayout
) => {
  socket.on(checkMarketClosed, (ifClosed) => {
    // Special case: I see that sometimes this socket is not running asynchronous with market countdown in Layout.js
    if (ifClosed && !isEmpty(marketCountdownInLayout)) {
      mutateMarket("closeMarket");
      return;
    }

    if (!isEqual(ifClosed, isMarketClosedInReduxStore)) {
      if (ifClosed) {
        mutateMarket("closeMarket");
      } else {
        mutateMarket("openMarket");
      }
    }
  });
};

/**
 * options are listed at the beginning of front-end/src/utils/SocketUtil
 * Off All Listeners
 */
export const offSocketListeners = (socket, option) => {
  socket.off(option);
};

export default {
  checkMarketClosed,
  socketCheckMarketClosed,
  offSocketListeners,
};
