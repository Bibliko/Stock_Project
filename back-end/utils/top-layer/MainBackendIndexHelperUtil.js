const { isMarketClosedCheck } = require("../redis-utils/RedisUtil");

const checkMarketClosed = (globalBackendVariables) => {
  if (!globalBackendVariables.isPrismaMarketHolidaysInitialized) {
    console.log("MainIndexUtil, checkMarketClosed");
    return;
  }

  isMarketClosedCheck()
    .then((checkResult) => {
      // console.log(checkResult);
      globalBackendVariables.isMarketClosed = checkResult;
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = {
  checkMarketClosed
};
