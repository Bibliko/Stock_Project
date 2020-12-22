const {
  queueAdd,
  getAsync,
  queueRemove,
  queueGetRangeByScore
} = require("../../redis/redis-client");

const updateSingleCachedPendingOrder = (UserTransactionJSON) => {
  return new Promise((resolve, reject) => {
    const { symbol } = UserTransactionJSON;

    let redisKey;
    if (symbol.isTypeBuy) redisKey = `${symbol.companyCode}|pendingBuy`;
    else redisKey = `${symbol.companyCode}|pendingSell`;
    const valueString = `${symbol.id}|{${symbol.limitPrice}`;

    queueAdd(redisKey, valueString);
  });
};

const emptyPendingTransactionsList = (companyCodes, price) => {
  return new Promise((resolve, reject) => {
    let redisKey;
    companyCodes
      .forEach((companyCode) => {
        const redisKeyStatus = `cachedShares|${companyCode}|priceStatus`;
        getAsync(redisKeyStatus)
          .then((status) => {
            if (status === "1") redisKey = `${companyCode}|pendingSell`;
            else redisKey = `${companyCode}|pendingBuy`;

            const valueString = `${price}`;

            return queueGetRangeByScore(redisKey, valueString);
          })
          .then((arrayToEmpty) => {
            arrayToEmpty
              .forEach((transaction, id) => {
                // Buy or sell... -> then
                queueRemove(redisKey, transaction).then(
                  (finishedPopOutOneTransaction) => {
                    resolve(`Successfully pop out ${id + 1} transaction`);
                  }
                );
              })
              .catch((err) => reject(err));
          });
      })
      .catch((err) => reject(err));
  });
};

module.exports = {
  updateSingleCachedPendingOrder,

  emptyPendingTransactionsList
};
