import { isEqual } from "lodash";

export const checkMarketClosed = "checkMarketClosed";
export const updatedUserDataFlags = "updatedUserDataFlags";
export const finishedSettingUpUserCacheSession =
  "finishedSettingUpUserCacheSession";

export const joinUserRoom = "joinUserRoom";
export const leaveUserRoom = "leaveUserRoom";
export const updateUserSession = "updateUserSession";
export const finishedUpdatingUserSession = "finishedUpdatingUserSession";
export const updateUserSessionInitialMessage =
  "I'm the first socket to update user session.";

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
 * - Listen to socket from back-end and check against AccountSummary.js updatedAllUsersFlag and updatedRankingListFlag
 * - setState updatedAllUsersFlag and updatedRankingListFlag
 * @param socket Initialized in App.js
 * @param thisComponent reference of component (this) - in this case AccountSummary.js
 */
export const checkSocketUpdatedUserDataFlags = (socket, thisComponent) => {
  socket.on(updatedUserDataFlags, (flagsFromBackend) => {
    const {
      updatedAllUsersFlag: allUsersComponent,
      updatedRankingListFlag: rankingComponent,
    } = thisComponent.state;

    const {
      updatedAllUsersFlag: allUsersBackend,
      updatedRankingListFlag: rankingBackend,
    } = flagsFromBackend;

    const { hasFinishedSettingUp } = thisComponent.props.userSession;

    if (
      (!isEqual(allUsersComponent, allUsersBackend) ||
        !isEqual(rankingComponent, rankingBackend)) &&
      hasFinishedSettingUp
    ) {
      thisComponent.setState({
        updatedAllUsersFlag: allUsersBackend,
        updatedRankingListFlag: rankingBackend,
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
 * @description
 * - Listen to socket from back-end "finishedUpdatingUserSession"
 * - Another client with the same userID updates userSession somewhere
 * -> Our client here needs to know and mutate Redux properly!
 * - use this.afterSettingUpUserCacheSession()
 * @param socket Initialized in App.js
 * @param thisComponent reference of component (this)  - in this case Layout.js
 */
export const checkFinishedUpdatingUserSession = (socket, thisComponent) => {
  socket.on(finishedUpdatingUserSession, (newUserSession) => {
    const { userSession } = thisComponent.props;

    if (!isEqual(newUserSession, userSession)) {
      socket.emit(updateUserSession, newUserSession, "");
      window.location.reload();
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
  updatedUserDataFlags,
  finishedSettingUpUserCacheSession,
  finishedUpdatingUserSession,
  updateUserSessionInitialMessage,

  joinUserRoom,
  leaveUserRoom,
  updateUserSession,

  socketCheckMarketClosed,

  checkSocketUpdatedUserDataFlags,

  checkHasFinishedSettingUpUserCacheSession,
  checkFinishedUpdatingUserSession,

  offSocketListeners,
};
