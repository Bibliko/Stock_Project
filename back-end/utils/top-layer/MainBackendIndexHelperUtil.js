const { isMarketClosedCheck } = require("../redis-utils/RedisUtil");

const checkMarketClosed = (globalBackendVariables) => {
  return new Promise((resolve, reject) => {
    if (!globalBackendVariables.isPrismaMarketHolidaysInitialized) {
      console.log("MainBackendIndexHelperUtil, checkMarketClosed");
      return resolve();
    }

    isMarketClosedCheck()
      .then((checkResult) => {
        // console.log(checkResult);
        globalBackendVariables.isMarketClosed = checkResult;
        resolve();
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

module.exports = {
  checkMarketClosed
};
