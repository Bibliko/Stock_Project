const {
  updateClientTimestampLastJoinInSocketRoom
} = require("../utils/redis-utils/RedisUtil");

const { cleanUserCache } = require("../utils/redis-utils/UserCachedDataUtil");

const {
  checkMarketClosedString,
  updatedAllUsersFlag,
  updatedRankingListFlag,
  finishedSettingUpUserCacheSession,

  setupAllCacheSession,
  updateUserCacheSession
} = require("../utils/top-layer/SocketUtil");

const {
  oneSecond,
  clearIntervalsIfIntervalsNotEmpty,
  getYearUTCString,
  newDate
} = require("../utils/low-dependency/DayTimeUtil");

const socketIO = require("socket.io");

const clearAndCreateIntervalUpdateCacheSession = (intervalID, userSession) => {
  if (intervalID) {
    clearInterval(intervalID);
  }
  return setInterval(
    () => updateUserCacheSession(userSession.email),
    30 * oneSecond
  );
};

const cleanUpTheRoom = (
  hasRoomSetupCache,
  userSession,
  intervalsArrayNeedToBeCleaned
) => {
  clearIntervalsIfIntervalsNotEmpty(intervalsArrayNeedToBeCleaned);

  hasRoomSetupCache.delete(userSession.id);
  cleanUserCache(userSession.email).catch((err) => console.log(err));
};

/**
 * @param server backend server
 * @param hasRoomSetupCache Global backend Set where we store userID with boolean hasRoomSetupCache
 * @param globalBackendVariables Global backend variables (in backend main index)
 */
const startSocketIO = (server, hasRoomSetupCache, globalBackendVariables) => {
  const io = socketIO(server);

  io.on("connection", (socket) => {
    console.log("New client connected\n");

    let intervalCheckRoomEmpty = null;

    let intervalSendMarketClosed = null;
    let intervalSendUpdatedAllUsersFlag = null;
    let intervalSendUpdatedRankingListFlag = null;
    let intervalUpdateCacheSession = null;

    // Join socket room by key: user ID
    socket.on("joinUserRoom", (userSession) => {
      socket.userID = userSession.id;
      socket.join(userSession.id);

      const clients = io.sockets.adapter.rooms[userSession.id].length;

      console.log(`Client joins room ${userSession.id}`);
      console.log(`${clients} client(s) is/are in ${userSession.id} room.\n`);

      intervalCheckRoomEmpty = setInterval(() => {
        // This is to find room named "${userSession.id}" in socketIO
        if (!io.sockets.adapter.rooms[userSession.id]) {
          cleanUpTheRoom(hasRoomSetupCache, userSession, [
            intervalCheckRoomEmpty,
            intervalUpdateCacheSession
          ]);
        }
      }, oneSecond);

      updateClientTimestampLastJoinInSocketRoom(
        userSession.email
      ).catch((err) => console.log(err));

      if (hasRoomSetupCache.has(userSession.id)) {
        intervalUpdateCacheSession = clearAndCreateIntervalUpdateCacheSession(
          intervalUpdateCacheSession,
          userSession
        );
        socket.emit(finishedSettingUpUserCacheSession, true);
      } else {
        if (userSession.hasFinishedSettingUp) {
          hasRoomSetupCache.add(userSession.id);

          setupAllCacheSession(
            userSession.email,
            getYearUTCString(newDate()) - 2
          )
            .then(() => {
              intervalUpdateCacheSession = clearAndCreateIntervalUpdateCacheSession(
                intervalUpdateCacheSession,
                userSession
              );
              socket.emit(finishedSettingUpUserCacheSession, true);
            })
            .catch((err) => console.log(err));
        }
      }
    });

    socket.on("leaveUserRoom", (userSession) => {
      socket.leave(userSession.id);
      console.log(`Client leaves room ${userSession.id}\n`);

      if (io.sockets.adapter.rooms[userSession.id]) {
        clearInterval(intervalCheckRoomEmpty);
      }
      clearInterval(intervalUpdateCacheSession);
    });

    // disconnect, socket automatically leaves all rooms it is in.
    socket.on("disconnect", () => {
      clearIntervalsIfIntervalsNotEmpty([
        intervalSendMarketClosed,
        intervalSendUpdatedAllUsersFlag,
        intervalSendUpdatedRankingListFlag,
        intervalUpdateCacheSession
      ]);

      if (io.sockets.adapter.rooms[socket.userID]) {
        clearInterval(intervalCheckRoomEmpty);
      }

      console.log("Client disconnected\n");
    });

    /*

    Set up 3 general intervals all sockets will use:
    - Send boolean "Is market closed?"
    - Send boolean flag "Has just updated all users (portfolioLastClosure, accountSummaryChartTimestamp)?"
    - Send boolean flag "Has just updated ranking of all users?"

    */

    clearIntervalsIfIntervalsNotEmpty([
      intervalSendMarketClosed,
      intervalSendUpdatedAllUsersFlag,
      intervalSendUpdatedRankingListFlag
    ]);

    intervalSendMarketClosed = setInterval(() => {
      socket.emit(
        checkMarketClosedString,
        globalBackendVariables.isMarketClosed
      );
    }, oneSecond);

    intervalSendUpdatedAllUsersFlag = setInterval(() => {
      socket.emit(
        updatedAllUsersFlag,
        globalBackendVariables.updatedAllUsersFlag
      );
    }, oneSecond);

    intervalSendUpdatedRankingListFlag = setInterval(() => {
      socket.emit(
        updatedRankingListFlag,
        globalBackendVariables.updatedRankingListFlag
      );
    }, oneSecond);
  });
};

module.exports = { startSocketIO };
