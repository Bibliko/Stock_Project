const { isEqual } = require("lodash");

/**
 * @param redisString From 'cachedMarketHoliday' -> 'id|year|newYearsDay|martinLutherKingJrDay|washingtonBirthday|goodFriday|memorialDay|independenceDay|laborDay|thanksgivingDay|christmas'
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
 * @param redisString From 'cachedShares|AAPL|quote' -> 'name|price|changesPercentage|change|dayLow|dayHigh|yearHigh|yearLow|marketCap|priceAvg50|priceAvg200|volume|avgVolume|exchange|open|previousClose|eps|pe|earningsAnnouncement|sharesOutstanding|timestamp'
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

/**
 * @param redisString From 'cachedShares|AAPL|profile': 'price|beta|volAvg|mktCap|lastDiv|range|changes|companyName|exchange|exchangeShortName|industry|website|description|ceo|sector|country|fullTimeEmployees|phone|address|city|state|zip|dcfDiff|dcf|image|ipoDate'
 */
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

/**
 * @param finishedTransaction Prisma Model Transaction with isFinished attribute == TRUE
 * @returns Finished Transaction redis string
 */
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

/**
 * @param filters
 * {
 *    type: buy, sell, OR none
 *    code: none OR random string with NO String ";" -> this is special character used when these attributes in a string
 *    quantity: (int/none)_to_(int/none)
 *    price: (int/none)_to_(int/none)
 *    brokerage: (int/none)_to_(int/none)
 *    spendOrGain: (int/none)_to_(int/none)
 *    transactionTime: (DateTime/none)_to_(DateTime/none)
 * }
 * @returns Transactions History filters redis string
 */
const createRedisValueFromTransactionsHistoryFilters = (filters) => {
  const {
    type,
    code,
    quantity,
    price,
    brokerage,
    spendOrGain,
    transactionTime
  } = filters;
  return `${type};${code};${quantity};${price};${brokerage};${spendOrGain};${transactionTime}`;
};

/**
 * @param redisValue `type;code;quantity;price;brokerage;spendOrGain;transactionTime`
 * @returns Transactions History filter object
 */
const parseRedisTransactionsHistoryFilters = (redisValue) => {
  const values = redisValue.split(";");
  return {
    type: values[0],
    code: values[1],
    quantity: values[2].split("_to_"),
    price: values[3].split("_to_"),
    brokerage: values[4].split("_to_"),
    spendOrGain: values[5].split("_to_"),
    transactionTime: values[6].split("_to_")
  };
};

/**
 * @param filters
 * {
 *    type: buy, sell, OR none
 *    code: none OR random string with NO String ";" -> this is special character used when these attributes in a string
 *    quantity: (int/none)_to_(int/none)
 *    price: (int/none)_to_(int/none)
 *    brokerage: (int/none)_to_(int/none)
 *    spendOrGain: (int/none)_to_(int/none)
 *    transactionTime: (DateTime/none)_to_(DateTime/none)
 * }
 */
const createPrismaFiltersObject = (filters) => {
  const { type, code, price, transactionTime } = filters;
  const filtering = {
    isFinished: true
    // isTypeBuy
    // companyCode
    // priceAtTransaction
    // finishedTime
    // quantity
    // brokerage
    // spendOrGain
  };

  // type
  if (!isEqual(type, "none")) {
    filtering.isTypeBuy = isEqual(type, "buy");
  }

  // code
  if (!isEqual(code, "none")) {
    filtering.companyCode = { contains: code };
  }

  // price
  const priceValues = price.split("_to_");
  if (!isEqual(priceValues[0], "none")) {
    filtering.priceAtTransaction.gte = parseInt(priceValues[0], 10);
  }
  if (!isEqual(priceValues[1], "none")) {
    filtering.priceAtTransaction.lte = parseInt(priceValues[1], 10);
  }

  // transactionTime
  const timeValues = transactionTime.split("_to_");
  filtering.finishedTime = {};
  if (!isEqual(timeValues[0], "none")) {
    filtering.finishedTime.gte = new Date(timeValues[0]);
  }
  if (!isEqual(timeValues[1], "none")) {
    filtering.finishedTime.lte = new Date(timeValues[1]);
  }

  // quantity, brokerage, spendOrGain
  const forLoopItems = ["quantity", "brokerage", "spendOrGain"];
  for (let i = 0; i < 3; i++) {
    const item = forLoopItems[i];
    const values = filters[item].split("_to_");

    filtering[item] = {};

    if (!isEqual(values[0], "none")) {
      filtering[item].gte = parseInt(values[0], 10);
    }
    if (!isEqual(values[1], "none")) {
      filtering[item].lte = parseInt(values[1], 10);
    }
  }

  return filtering;
};

/**
 * @param marketHoliday Market Holiday object obtained from Database
 * @returns Redis market holiday value used for cache
 */
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

/**
 * @param stockQuoteJSON Stock quote similar to Financial Modeling Prep '/quote' API
 * @returns Redis stock quote value used for cache
 */
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

/**
 * @param stockProfileJSON Stock profile similar to Financial Modeling Prep '/profile' API
 * @returns Redis stock profile value used for cache
 */
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

/**
 * @param cachedSharesList Shares list of symbols ['AAPL', 'GOOGL', 'FB', ...]
 * @returns Redis symbols string value used for cache
 */
const createSymbolsStringFromCachedSharesList = (cachedSharesList) => {
  let symbolsString = "";
  cachedSharesList.map((symbol, index) => {
    if (index > 0) {
      symbolsString = symbolsString.concat(",", symbol);
    } else {
      symbolsString = symbolsString.concat(symbol);
    }
  });
  return symbolsString;
};

/**
 * @param stockQuoteJSON Stock quote similar to Financial Modeling Prep '/quote' API
 * @param stockProfileJSON Stock profile similar to Financial Modeling Prep '/profile' API
 * @returns Combined Stock Info Object (includes both quote and profile)
 */
const combineFMPStockQuoteAndProfile = (stockQuoteJSON, stockProfileJSON) => {
  return {
    ...stockQuoteJSON,
    ...stockProfileJSON
  };
};

/**
 * @param redisString `email|accountSummaryChart` -> 'UTCDateString|portfolioValue'
 */
const parseAccountSummaryTimestamp = (redisString) => {
  const valuesArray = redisString.split("|");
  return {
    UTCDateString: valuesArray[0],
    portfolioValue: parseFloat(valuesArray[1])
  };
};

module.exports = {
  parseCachedMarketHoliday,
  createRedisValueFromMarketHoliday,

  parseCachedShareQuote,
  parseCachedShareProfile,
  createRedisValueFromStockQuoteJSON,
  createRedisValueFromStockProfileJSON,
  combineFMPStockQuoteAndProfile,
  createSymbolsStringFromCachedSharesList,

  createRedisValueFromFinishedTransaction,

  createPrismaFiltersObject,
  createRedisValueFromTransactionsHistoryFilters,
  parseRedisTransactionsHistoryFilters,

  parseAccountSummaryTimestamp
};
