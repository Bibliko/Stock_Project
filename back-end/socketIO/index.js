const {
  updateClientTimestampLastJoinInSocketRoom
} = require("../utils/redis-utils/RedisUtil");

const { cleanUserCache } = require("../utils/redis-utils/UserCachedDataUtil");

const {
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

const connection = "connection";
const disconnect = "disconnect";

const joinUserRoom = "joinUserRoom";
const leaveUserRoom = "leaveUserRoom";
const updateUserSession = "updateUserSession";
const finishedUpdatingUserSession = "finishedUpdatingUserSession";
const updateUserSessionInitialMessage =
  "I'm the first socket to update user session.";

const checkMarketClosedString = "checkMarketClosed";
const updatedAllUsersFlag = "updatedAllUsersFlag";
const updatedRankingListFlag = "updatedRankingListFlag";
const finishedSettingUpUserCacheSession = "finishedSettingUpUserCacheSession";

const setupIntervalUpdateCacheSession = (intervalID, userEmail) => {
  if (intervalID) {
    clearInterval(intervalID);
  }
  return setInterval(() => updateUserCacheSession(userEmail), 30 * oneSecond);
};

const cleanUpTheRoom = (userID, userEmail) => {
  console.log("Cleaning up cache in the room!");
  cleanUserCache(userEmail).catch((err) => console.log(err));
};

/**
 * @param server backend server
 * @param hasRoomSetupCache Global backend Set where we store userID with boolean hasRoomSetupCache
 * @param globalBackendVariables Global backend variables (in backend main index)
 * @param userSessions Map containing userSession information for each room
 */
const startSocketIO = (server, globalBackendVariables) => {
  const io = socketIO(server);

  let countSocketsInMainHall = 0;

  let intervalSendMarketClosed = null;
  let intervalSendUpdatedAllUsersFlag = null;
  let intervalSendUpdatedRankingListFlag = null;

  io.on(connection, (socket) => {
    console.log(`New client connected ${socket.id}\n`);
    countSocketsInMainHall++;

    // private intervals that use userSession email
    let intervalUpdateCacheSession = null;

    // Join socket room by key: user ID
    socket.on(joinUserRoom, (userSession) => {
      const {
        id: userID,
        email: userEmail,
        hasFinishedSettingUp
      } = userSession;

      socket.userID = userID;
      socket.userEmail = userEmail;
      socket.hasFinishedSettingUp = hasFinishedSettingUp;
      socket.join(userID);

      const numberOfClients = io.sockets.adapter.rooms[userID].length;

      console.log(`Client ${socket.id} joins room ${userID}`);
      console.log(`${numberOfClients} client(s) is/are in ${userID} room.\n`);

      updateClientTimestampLastJoinInSocketRoom(userEmail).catch((err) =>
        console.log(err)
      );

      if (numberOfClients > 1) {
        intervalUpdateCacheSession = setupIntervalUpdateCacheSession(
          intervalUpdateCacheSession,
          userEmail
        );
        socket.emit(finishedSettingUpUserCacheSession, true);
      } else {
        if (hasFinishedSettingUp) {
          setupAllCacheSession(userEmail, getYearUTCString(newDate()) - 2)
            .then(() => {
              intervalUpdateCacheSession = setupIntervalUpdateCacheSession(
                intervalUpdateCacheSession,
                userEmail
              );
              socket.emit(finishedSettingUpUserCacheSession, true);
            })
            .catch((err) => console.log(err));
        } else {
          socket.emit(finishedSettingUpUserCacheSession, true);
        }
      }
    });

    socket.on(leaveUserRoom, () => {
      const { userID, userEmail } = socket;
      console.log(`Client ${socket.id} leaves room ${userID}\n`);

      socket.leave(userID);

      if (!io.sockets.adapter.rooms[userID]) {
        cleanUpTheRoom(userID, userEmail);
      }
      clearInterval(intervalUpdateCacheSession);
    });

    socket.on(updateUserSession, (newUserSession, message) => {
      const {
        userID,
        userEmail,
        hasFinishedSettingUp: localHasFinishedSettingUp
      } = socket;
      const { email, hasFinishedSettingUp } = newUserSession;

      if (email && userEmail !== email) {
        socket.userEmail = email;

        intervalUpdateCacheSession = setupIntervalUpdateCacheSession(
          intervalUpdateCacheSession,
          email
        );
      }

      if (
        hasFinishedSettingUp &&
        localHasFinishedSettingUp !== hasFinishedSettingUp
      ) {
        socket.hasFinishedSettingUp = hasFinishedSettingUp;

        setupAllCacheSession(email, getYearUTCString(newDate()) - 2)
          .then(() => {
            intervalUpdateCacheSession = setupIntervalUpdateCacheSession(
              intervalUpdateCacheSession,
              email
            );
            socket.emit(finishedSettingUpUserCacheSession, true);
          })
          .catch((err) => console.log(err));
      }

      if (message === updateUserSessionInitialMessage) {
        socket.to(userID).emit(finishedUpdatingUserSession, newUserSession);
      }
    });

    // disconnect, socket automatically leaves all rooms it is in.
    socket.on(disconnect, () => {
      console.log(`Client disconnected ${socket.id}\n`);
      countSocketsInMainHall--;

      const { userID, userEmail } = socket;

      clearInterval(intervalUpdateCacheSession);

      if (userID && userEmail && !io.sockets.adapter.rooms[userID]) {
        cleanUpTheRoom(userID, userEmail);
      }

      if (countSocketsInMainHall === 0) {
        clearIntervalsIfIntervalsNotEmpty([
          intervalSendMarketClosed,
          intervalSendUpdatedAllUsersFlag,
          intervalSendUpdatedRankingListFlag
        ]);
      }
    });

    /*
      Set up 3 general intervals all sockets will use:
      - Send boolean "Is market closed?"
      - Send boolean flag "Has just updated all users (portfolioLastClosure, accountSummaryChartTimestamp)?"
      - Send boolean flag "Has just updated ranking of all users?"
    */

    if (countSocketsInMainHall === 1) {
      clearIntervalsIfIntervalsNotEmpty([
        intervalSendMarketClosed,
        intervalSendUpdatedAllUsersFlag,
        intervalSendUpdatedRankingListFlag
      ]);

      intervalSendMarketClosed = setInterval(() => {
        io.emit(checkMarketClosedString, globalBackendVariables.isMarketClosed);
      }, oneSecond);

      intervalSendUpdatedAllUsersFlag = setInterval(() => {
        io.emit(
          updatedAllUsersFlag,
          globalBackendVariables.updatedAllUsersFlag
        );
      }, oneSecond);

      intervalSendUpdatedRankingListFlag = setInterval(() => {
        io.emit(
          updatedRankingListFlag,
          globalBackendVariables.updatedRankingListFlag
        );
      }, oneSecond);
    }
  });
};

module.exports = { startSocketIO };
