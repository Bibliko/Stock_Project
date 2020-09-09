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

/**
 *    'cachedShares|AAPL|quote': 'name|price|changesPercentage|change|dayLow|dayHigh|yearHigh|yearLow|marketCap|priceAvg50|priceAvg200|volume|avgVolume|exchange|open|previousClose|eps|pe|earningsAnnouncement|sharesOutstanding|timestamp'
 *    'cachedShares|AAPL|profile': 'price|beta|volAvg|mktCap|lastDiv|range|changes|companyName|exchange|exchangeShortName|industry|website|description|ceo|sector|country|fullTimeEmployees|phone|address|city|state|zip|dcfDiff|dcf|image|ipoDate'
 */
const parseCachedShareQuote = (redisString) => {
  const valuesArray = redisString.split("|");

  return {
    name: valuesArray[0],
    price: parseFloat(valuesArray[1]),
    changesPercentage: parseFloat(valuesArray[2]),
    change: parseFloat(valuesArray[3]),
    dayLow: parseFloat(valuesArray[4]),
    dayHigh: parseFloat(valuesArray[5]),
    yearHigh: parseFloat(valuesArray[6]),
    yearLow: parseFloat(valuesArray[7]),
    marketCap: parseFloat(valuesArray[8]),
    priceAvg50: parseFloat(valuesArray[9]),
    priceAvg200: parseFloat(valuesArray[10]),
    volume: parseInt(valuesArray[11], 10),
    avgVolume: parseInt(valuesArray[12], 10),
    exchange: valuesArray[13],
    open: parseFloat(valuesArray[14]),
    previousClose: parseFloat(valuesArray[15]),
    eps: parseFloat(valuesArray[16]),
    pe: parseFloat(valuesArray[17]),
    earningsAnnouncement: valuesArray[18],
    sharesOutstanding: parseInt(valuesArray[19], 10),
    timestamp: parseInt(valuesArray[20], 10)
  };
};
const parseCachedShareProfile = (redisString) => {
  const valuesArray = redisString.split("|");

  return {
    price: parseFloat(valuesArray[0]),
    beta: parseFloat(valuesArray[1]),
    volAvg: parseInt(valuesArray[2], 10),
    mktCap: parseInt(valuesArray[3], 10),
    lastDiv: parseFloat(valuesArray[4]),
    range: valuesArray[5],
    changes: parseFloat(valuesArray[6]),
    companyName: valuesArray[7],
    exchange: valuesArray[8],
    exchangeShortName: valuesArray[9],
    industry: valuesArray[10],
    website: valuesArray[11],
    description: valuesArray[12],
    ceo: valuesArray[13],
    sector: valuesArray[14],
    country: valuesArray[15],
    fullTimeEmployees: parseInt(valuesArray[16], 10),
    phone: valuesArray[17],
    address: valuesArray[18],
    city: valuesArray[19],
    state: valuesArray[20],
    zip: parseInt(valuesArray[21], 10),
    dcfDiff: parseFloat(valuesArray[22]),
    dcf: parseFloat(valuesArray[23]),
    image: valuesArray[24],
    ipoDate: new Date(valuesArray[25])
  };
};

const createRedisValueFromFinishedTransaction = (finishedTransaction) => {
  const {
    id,
    createdAt,
    companyCode,
    quantity,
    priceAtTransaction,
    brokerage,
    spendOrGain,
    finishedTime,
    isTypeBuy,
    userID
  } = finishedTransaction;
  return `${id}|${createdAt}|${companyCode}|${quantity}|${priceAtTransaction}|${brokerage}|${spendOrGain}|${finishedTime}|${isTypeBuy}|${userID}`;
};

const createRedisValueFromMarketHoliday = (marketHoliday) => {
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

  return `${id}|${year}|${newYearsDay}|${martinLutherKingJrDay}|${washingtonBirthday}|${goodFriday}|${memorialDay}|${independenceDay}|${laborDay}|${thanksgivingDay}|${christmas}`;
};

const createRedisValueFromStockQuoteJSON = (stockQuoteJSON) => {
  const {
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

  return `${name}|${price}|${changesPercentage}|${change}|${dayLow}|${dayHigh}|${yearHigh}|${yearLow}|${marketCap}|${priceAvg50}|${priceAvg200}|${volume}|${avgVolume}|${exchange}|${open}|${previousClose}|${eps}|${pe}|${earningsAnnouncement}|${sharesOutstanding}|${timestamp}`;
};

const createRedisValueFromStockProfileJSON = (stockProfileJSON) => {
  const {
    price,
    beta,
    volAvg,
    mktCap,
    lastDiv,
    range,
    changes,
    companyName,
    exchange,
    exchangeShortName,
    industry,
    website,
    description,
    ceo,
    sector,
    country,
    fullTimeEmployees,
    phone,
    address,
    city,
    state,
    zip,
    dcfDiff,
    dcf,
    image,
    ipoDate
  } = stockProfileJSON;

  return `${price}|${beta}|${volAvg}|${mktCap}|${lastDiv}|${range}|${changes}|${companyName}|${exchange}|${exchangeShortName}|${industry}|${website}|${description}|${ceo}|${sector}|${country}|${fullTimeEmployees}|${phone}|${address}|${city}|${state}|${zip}|${dcfDiff}|${dcf}|${image}|${ipoDate}`;
};

const combineFMPStockQuoteAndProfile = (stockQuoteJSON, stockProfileJSON) => {
  return {
    ...stockQuoteJSON,
    ...stockProfileJSON
  };
};

module.exports = {
  parseCachedMarketHoliday,

  parseCachedShareQuote,
  parseCachedShareProfile,

  createRedisValueFromFinishedTransaction,

  createRedisValueFromMarketHoliday,

  createRedisValueFromStockQuoteJSON,
  createRedisValueFromStockProfileJSON,

  combineFMPStockQuoteAndProfile
};
