const {
  getAsync,
  setAsync,
  listPushAsync,
  delAsync
} = require("../redis/redis-client");

/**
 * Keys list:
 * - '${email}|transactionsHistoryList'
 * - '${email}|passwordVerification'
 * - '${email}|accountSummaryChart'
 * - '${email}|sharesList'
 *
 * - 'cachedMarketHoliday'
 * - 'cachedShares|${companyCode}'
 *
 * - 'RANKING_LIST'
 * - 'RANKING_LIST_${region}'
 */

/**
 * 'doanhtu07@gmail.com|transactionsHistoryList' : isFinished of these transactions is true!
 * List -> "id|createdAt|companyCode|quantity|priceAtTransaction|limitPrice|brokerage|finishedTime|isTypeBuy|userID", "..."
 */
const updateTransactionsHistoryListOneItem = (email, finishedTransaction) => {
  const redisKey = `${email}|transactionsHistoryList`;
  const {
    id,
    createdAt,
    companyCode,
    quantity,
    priceAtTransaction,
    brokerage,
    finishedTime,
    isTypeBuy,
    userID
  } = finishedTransaction;
  const newValue = `${id}|${createdAt}|${companyCode}|${quantity}|${priceAtTransaction}|${brokerage}|${finishedTime}|${isTypeBuy}|${userID}`;

  listPushAsync(redisKey, newValue)
    .then((finishedUpdatingRedisTransactionsHistoryList) => {
      console.log(
        `Successfully added transaction to ${email}'s cached transactions history.`
      );
    })
    .catch((err) => {
      console.log(err);
    });
};

/**
 * 'doanhtu07@gmail.com|passwordVerification' : 'secretCode|timestamp'
 */
const cachePasswordVerificationCode = (email, secretCode) => {
  return new Promise((resolve, reject) => {
    const timestamp = Math.round(Date.now() / 1000);
    const redisKey = `${email}|passwordVerification`;
    const redisValue = `${secretCode}|${timestamp}`;

    setAsync(redisKey, redisValue)
      .then((finishedCachingSecretCode) => {
        resolve(`Finished caching password verification code for ${email}`);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
const getParsedCachedPasswordVerificationCode = (email) => {
  return new Promise((resolve, reject) => {
    const redisKey = `${email}|passwordVerification`;

    getAsync(redisKey)
      .then((redisString) => {
        if (!redisString) {
          resolve(null);
        } else {
          const valuesArray = redisString.split("|");
          resolve({
            secretCode: valuesArray[0],
            timestamp: parseInt(valuesArray[1], 10)
          });
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};
const removeCachedPasswordVerificationCode = (email) => {
  const redisKey = `${email}|passwordVerification`;
  return delAsync(redisKey);
};

const redisUpdateOverallRankingList = (user) => {
  const value = `${user.firstName}|${user.lastName}|${user.totalPortfolio}|${user.region}`;
  return listPushAsync("RANKING_LIST", value);
};
const redisUpdateRegionalRankingList = (region, user) => {
  const value = `${user.firstName}|${user.lastName}|${user.totalPortfolio}|${user.region}`;
  return listPushAsync(`RANKING_LIST_${region}`, value);
};

/**
 * 'cachedMarketHoliday': 'id|year|newYearsDay|martinLutherKingJrDay|washingtonBirthday|goodFriday|memorialDay|independenceDay|laborDay|thanksgivingDay|christmas'
 */
const parseCachedMarketHoliday = (redisString) => {
  const valuesArray = redisString.split("|");
  return {
    id: valuesArray[0],
    year: parseInt(valuesArray[1], 10),
    newYearsDay: valuesArray[2],
    martinLutherKingJrDay: valuesArray[3],
    washingtonBirthday: valuesArray[4],
    goodFriday: valuesArray[5],
    memorialDay: valuesArray[6],
    independenceDay: valuesArray[7],
    laborDay: valuesArray[8],
    thanksgivingDay: valuesArray[9],
    christmas: valuesArray[10]
  };
};
const getCachedMarketHoliday = () => {
  return new Promise((resolve, reject) => {
    const redisKey = "cachedMarketHoliday";
    getAsync(redisKey)
      .then((redisMarketHoliday) => {
        if (!redisMarketHoliday) {
          resolve(redisMarketHoliday);
        }
        resolve(parseCachedMarketHoliday(redisMarketHoliday));
      })
      .catch((err) => {
        reject(err);
      });
  });
};
const updateCachedMarketHoliday = (marketHoliday) => {
  return new Promise((resolve, reject) => {
    const {
      id,
      year,
      newYearsDay,
      martinLutherKingJrDay,
      washingtonBirthday,
      goodFriday,
      memorialDay,
      independenceDay,
      laborDay,
      thanksgivingDay,
      christmas
    } = marketHoliday;

    const redisKey = "cachedMarketHoliday";
    const redisValue = `${id}|${year}|${newYearsDay}|${martinLutherKingJrDay}|${washingtonBirthday}|${goodFriday}|${memorialDay}|${independenceDay}|${laborDay}|${thanksgivingDay}|${christmas}`;
    setAsync(redisKey, redisValue)
      .then((redisMarketHoliday) => {
        resolve("Cached market holiday object from database successfully");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * 'cachedShares|AAPL': 'isUpdatingUsingFMP|timestampLastUpdated|name|price|changesPercentage|change|dayLow|dayHigh|yearHigh|yearLow|marketCap|priceAvg50|priceAvg200|volume|avgVolume|exchange|open|previousClose|eps|pe|earningsAnnouncement|sharesOutstanding|timestamp'
 */
const parseCachedShareInfo = (redisString) => {
  const valuesArray = redisString.split("|");

  return {
    isUpdatingUsingFMP: valuesArray[0] === "true",
    timestampLastUpdated: parseInt(valuesArray[1], 10),
    name: valuesArray[2],
    price: parseFloat(valuesArray[3]),
    changesPercentage: parseFloat(valuesArray[4]),
    change: parseFloat(valuesArray[5]),
    dayLow: parseFloat(valuesArray[6]),
    dayHigh: parseFloat(valuesArray[7]),
    yearHigh: parseFloat(valuesArray[8]),
    yearLow: parseFloat(valuesArray[9]),
    marketCap: parseFloat(valuesArray[10]),
    priceAvg50: parseFloat(valuesArray[11]),
    priceAvg200: parseFloat(valuesArray[12]),
    volume: parseInt(valuesArray[13], 10),
    avgVolume: parseInt(valuesArray[14], 10),
    exchange: valuesArray[15],
    open: parseFloat(valuesArray[16]),
    previousClose: parseFloat(valuesArray[17]),
    eps: parseFloat(valuesArray[18]),
    pe: parseFloat(valuesArray[19]),
    earningsAnnouncement: valuesArray[20],
    sharesOutstanding: parseInt(valuesArray[21], 10),
    timestamp: parseInt(valuesArray[22], 10)
  };
};
const updateCachedShareInfo = (
  stockQuoteJSON,
  isUpdatingUsingFMP,
  timestampLastUpdated
) => {
  return new Promise((resolve, reject) => {
    const {
      symbol,
      name,
      price,
      changesPercentage,
      change,
      dayLow,
      dayHigh,
      yearHigh,
      yearLow,
      marketCap,
      priceAvg50,
      priceAvg200,
      volume,
      avgVolume,
      exchange,
      open,
      previousClose,
      eps,
      pe,
      earningsAnnouncement,
      sharesOutstanding,
      timestamp
    } = stockQuoteJSON;

    const redisKey = `cachedShares|${symbol}`;

    const valueString = `${isUpdatingUsingFMP}|${timestampLastUpdated}|${name}|${price}|${changesPercentage}|${change}|${dayLow}|${dayHigh}|${yearHigh}|${yearLow}|${marketCap}|${priceAvg50}|${priceAvg200}|${volume}|${avgVolume}|${exchange}|${open}|${previousClose}|${eps}|${pe}|${earningsAnnouncement}|${sharesOutstanding}|${timestamp}`;

    setAsync(redisKey, valueString)
      .then((quote) => {
        resolve(`Updated ${redisKey} successfully.`);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
const switchFlagUpdatingUsingFMPToTrue = (symbol, timestampLastUpdated) => {
  return new Promise((resolve, reject) => {
    const redisKey = `cachedShares|${symbol}`;
    getAsync(redisKey)
      .then((cachedStockQuote) => {
        return updateCachedShareInfo(
          cachedStockQuote,
          true,
          timestampLastUpdated
        );
      })
      .then((afterUpdate) => {
        resolve(`Updated ${redisKey} successfully.`);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = {
  updateTransactionsHistoryListOneItem, // user related

  cachePasswordVerificationCode, // user related
  getParsedCachedPasswordVerificationCode, // user related
  removeCachedPasswordVerificationCode, // user related

  redisUpdateOverallRankingList,
  redisUpdateRegionalRankingList,

  parseCachedMarketHoliday,
  getCachedMarketHoliday,
  updateCachedMarketHoliday,

  parseCachedShareInfo,
  updateCachedShareInfo,
  switchFlagUpdatingUsingFMPToTrue
};
