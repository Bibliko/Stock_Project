import { isEqual } from "lodash";

export const checkMarketClosed = "checkMarketClosed";
export const updatedAllUsersFlag = "updatedAllUsersFlag";
export const updatedRankingListFlag = "updatedRankingListFlag";
export const finishedSettingUpUserCacheSession =
  "finishedSettingUpUserCacheSession";

export const joinUserRoom = "joinUserRoom";
export const leaveUserRoom = "leaveUserRoom";

/**
 * @description
 * - Listen to socket from back-end and update redux isMarketClosed boolean
 * - mutate Redux store variable: isMarketClosed
 * @param socket Initialized in App.js
 * @param thisComponent reference of component (this)  - in this case Layout.js
 */
export const socketCheckMarketClosed = (socket, thisComponent) => {
  socket.on(checkMarketClosed, (ifClosed) => {
    const { mutateMarket, isMarketClosed } = thisComponent.props;
    if (!isEqual(ifClosed, isMarketClosed)) {
      if (ifClosed) {
        mutateMarket("closeMarket");
      } else {
        mutateMarket("openMarket");
      }
    }
  });
};

/**
 * @description
 * - Listen to socket from back-end and check against Layout.js updatedAllUsersFlag
 * - setState updatedAllUsersFlagFromLayout
 * @param socket Initialized in App.js
 * @param thisComponent reference of component (this) - in this case Layout.js
 */
export const checkIsDifferentFromSocketUpdatedAllUsersFlag = (
  socket,
  thisComponent
) => {
  socket.on(updatedAllUsersFlag, (flagFromBackend) => {
    const {
      updatedAllUsersFlagFromLayout,
      openRefreshCard,
    } = thisComponent.state;
    const { hasFinishedSettingUp } = thisComponent.props.userSession;

    if (
      !isEqual(flagFromBackend, updatedAllUsersFlagFromLayout) &&
      !openRefreshCard &&
      hasFinishedSettingUp
    ) {
      thisComponent.setState({
        updatedAllUsersFlagFromLayout: flagFromBackend,
        openRefreshCard: true,
      });
    }
  });
};

/**
 * @description
 * - Listen to socket from back-end and check against Layout.js updatedRankingFlag
 * - setState updatedRankingListFlagFromLayout
 * @param socket Initialized in App.js
 * @param thisComponent reference of component (this)  - in this case Layout.js
 */
export const checkIsDifferentFromSocketUpdatedRankingListFlag = (
  socket,
  thisComponent
) => {
  socket.on(updatedRankingListFlag, (flagFromBackend) => {
    const {
      updatedRankingListFlagFromLayout,
      openRefreshCard,
    } = thisComponent.state;
    const { hasFinishedSettingUp } = thisComponent.props.userSession;

    if (
      !isEqual(flagFromBackend, updatedRankingListFlagFromLayout) &&
      !openRefreshCard &&
      hasFinishedSettingUp
    ) {
      thisComponent.setState({
        updatedRankingListFlagFromLayout: flagFromBackend,
        openRefreshCard: true,
      });
    }
  });
};

/**
 * @description
 * - Listen to socket from back-end and check against Layout.js updatedRankingFlag
 * - use this.afterSettingUpUserCacheSession()
 * @param socket Initialized in App.js
 * @param thisComponent reference of component (this)  - in this case Layout.js
 */
export const checkHasFinishedSettingUpUserCacheSession = (
  socket,
  thisComponent
) => {
  socket.on(finishedSettingUpUserCacheSession, (hasFinished) => {
    if (hasFinished) {
      thisComponent.afterSettingUpUserCacheSession();
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
  updatedAllUsersFlag,
  updatedRankingListFlag,
  finishedSettingUpUserCacheSession,

  joinUserRoom,
  leaveUserRoom,

  socketCheckMarketClosed,
  checkIsDifferentFromSocketUpdatedAllUsersFlag,
  checkIsDifferentFromSocketUpdatedRankingListFlag,
  checkHasFinishedSettingUpUserCacheSession,
  offSocketListeners,
};
