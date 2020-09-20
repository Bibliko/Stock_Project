import { isEqual } from "lodash";

export const checkMarketClosed = "checkMarketClosed";
export const updatedAllUsersFlag = "updatedAllUsersFlag";
export const updatedRankingListFlag = "updatedRankingListFlag";

/**
 * @description listen to socket from back-end and update redux isMarketClosed boolean
 * @param socket Initialized in App.js
 * @param mutateMarket redux function to change redux isMarketClosed boolean
 */
export const socketCheckMarketClosed = (
  socket,
  isMarketClosedInReduxStore,
  mutateMarket
) => {
  socket.on(checkMarketClosed, (ifClosed) => {
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
 * @description listen to socket from back-end and check against Layout.js updatedAllUsersFlag
 * @param socket Initialized in App.js
 * @param openRefreshCard boolean from Layout state showing whether Refresh Card is shown or not
 * @param hasFinishedSettingUp boolean whether user has finished setting up account
 * @param setState allow after check, open notification in Layout for user to reset the page
 */
export const checkIsDifferentFromSocketUpdatedAllUsersFlag = (
  socket,
  updatedAllUsersFlagFromLayoutState,
  openRefreshCard,
  hasFinishedSettingUp,
  setState
) => {
  socket.on(updatedAllUsersFlag, (flagFromBackend) => {
    if (
      !isEqual(flagFromBackend, updatedAllUsersFlagFromLayoutState) &&
      !openRefreshCard
    ) {
      setState({
        updatedAllUsersFlagFromLayout: flagFromBackend,
        openRefreshCard: true,
      });
    }
  });
};

/**
 * @description listen to socket from back-end and check against Layout.js updatedRankingFlag
 * @param socket Initialized in App.js
 * @param openRefreshCard boolean from Layout state showing whether Refresh Card is shown or not
 * @param hasFinishedSettingUp boolean whether user has finished setting up account
 * @param setState allow after check, open notification in Layout for user to reset the page
 */
export const checkIsDifferentFromSocketUpdatedRankingListFlag = (
  socket,
  updatedRankingListFlagFromLayoutState,
  openRefreshCard,
  hasFinishedSettingUp,
  setState
) => {
  socket.on(updatedRankingListFlag, (flagFromBackend) => {
    if (
      !isEqual(flagFromBackend, updatedRankingListFlagFromLayoutState) &&
      !openRefreshCard
    ) {
      setState({
        updatedRankingListFlagFromLayout: flagFromBackend,
        openRefreshCard: true,
      });
    }
  });
};

/**
 * @note options are listed at the beginning of front-end/src/utils/SocketUtil
 * @description Remove All Listeners on That Event
 */
export const offSocketListeners = (socket, option) => {
  socket.off(option);
};

export default {
  checkMarketClosed,
  socketCheckMarketClosed,
  checkIsDifferentFromSocketUpdatedAllUsersFlag,
  checkIsDifferentFromSocketUpdatedRankingListFlag,
  offSocketListeners,
};
