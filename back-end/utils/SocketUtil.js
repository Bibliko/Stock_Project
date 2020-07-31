const { isMarketClosedCheck } = require("./DayTimeUtil");

const checkMarketClosedString = "checkMarketClosed";

const checkMarketClosed = (socket, objVariables) => {
  if (!objVariables.isPrismaMarketHolidaysInitialized) {
    console.log("SocketUtil, 70");
    return;
  }

  isMarketClosedCheck()
    .then((checkResult) => {
      // console.log(checkResult);

      socket.emit(checkMarketClosedString, checkResult);
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = {
  checkMarketClosedString,
  checkMarketClosed
};
