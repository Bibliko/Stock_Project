const { getAsync, setAsync } = require("../redis/redis-client");

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
  parseCachedMarketHoliday,
  getCachedMarketHoliday,
  updateCachedMarketHoliday,

  parseCachedShareInfo,
  updateCachedShareInfo,
  switchFlagUpdatingUsingFMPToTrue
};
