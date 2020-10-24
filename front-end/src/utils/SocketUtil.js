import { isEqual, pick } from "lodash";

export const checkMarketClosed = "checkMarketClosed";
export const updatedAllUsersFlag = "updatedAllUsersFlag";
export const updatedRankingListFlag = "updatedRankingListFlag";
export const updatedExchangeHistoricalChartFlag =
  "updatedExchangeHistoricalChartFlag";
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
 * - Listen to socket from back-end and check against MarketWatchChart.js updatedExchangeHistoricalChartFlag5min and updatedExchangeHistoricalChartFlagFull
 * - setState updatedExchangeHistoricalChartFlag5min and updatedExchangeHistoricalChartFlagFull
 * @param socket Initialized in App.js
 * @param thisComponent reference of component (this) - in this case MarketWatchChart.js
 */
export const checkIsDifferentFromSocketUpdatedExchangeHistoricalChartFlag = (
  socket,
  thisComponent
) => {
  socket.on(updatedExchangeHistoricalChartFlag, (twoFlagsFromBackend) => {
    const compareFlags = [
      "updatedExchangeHistoricalChart5minFlag",
      "updatedExchangeHistoricalChartFullFlag",
    ];
    const compareThisComponent = pick(thisComponent.state, compareFlags);

    const { exchange } = thisComponent.props;

    const {
      updatedExchangeHistoricalChart5minFlag,
      updatedExchangeHistoricalChartFullFlag,
    } = twoFlagsFromBackend[exchange];

    if (!isEqual(twoFlagsFromBackend[exchange], compareThisComponent)) {
      console.log("Updating");
      thisComponent.setState(
        {
          updatedExchangeHistoricalChart5minFlag,
          updatedExchangeHistoricalChartFullFlag,
        },
        () => {
          thisComponent
            .initializeHistoricalChartUsingDataFromCache()
            .catch((err) => console.log(err));
        }
      );
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
  updatedAllUsersFlag,
  updatedRankingListFlag,
  updatedExchangeHistoricalChartFlag,
  finishedSettingUpUserCacheSession,
  finishedUpdatingUserSession,
  updateUserSessionInitialMessage,

  joinUserRoom,
  leaveUserRoom,
  updateUserSession,

  socketCheckMarketClosed,

  checkIsDifferentFromSocketUpdatedAllUsersFlag,
  checkIsDifferentFromSocketUpdatedRankingListFlag,
  checkIsDifferentFromSocketUpdatedExchangeHistoricalChartFlag,

  checkHasFinishedSettingUpUserCacheSession,
  checkFinishedUpdatingUserSession,

  offSocketListeners,
};
