// redisString: "timestamp1|value1"
export const parseRedisAccountSummaryChartItem = (redisString) => {
  const valuesArray = redisString.split("|");
  return valuesArray;
};

// redisString: "id1|companyCode1|quantity1|buyPriceAvg1|userID1"
export const parseRedisSharesListItem = (redisString) => {
  const valuesArray = redisString.split("|");

  return {
    id: valuesArray[0],
    companyCode: valuesArray[1],
    quantity: parseInt(valuesArray[2], 10),
    buyPriceAvg: parseFloat(valuesArray[3]),
    userID: valuesArray[4],
  };
};

// redisString: "isUpdatingUsingFMP|timestampLastUpdated|name|price|changesPercentage|change|dayLow|dayHigh|yearHigh|yearLow|marketCap|priceAvg50|priceAvg200|volume|avgVolume|exchange|open|previousClose|eps|pe|earningsAnnouncement|sharesOutstanding|timestamp"
export const parseRedisShareInfo = (redisString) => {
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
    timestamp: parseInt(valuesArray[22], 10),
  };
};

/**
 * redisString: "id|createdAt|companyCode|quantity|priceAtTransaction|brokerage|spendOrGain|finishedTime|isTypeBuy|userID"
 */
export const parseRedisTransactionsHistoryListItem = (redisString) => {
  const valuesArray = redisString.split("|");

  return {
    id: valuesArray[0],
    createdAt: valuesArray[1],
    companyCode: valuesArray[2],
    quantity: parseInt(valuesArray[3], 10),
    priceAtTransaction: parseFloat(valuesArray[4]),
    brokerage: parseFloat(valuesArray[5]),
    spendOrGain: parseFloat(valuesArray[6]),
    finishedTime: valuesArray[7],
    isTypeBuy: valuesArray[8] === "true" ? true : false,
    userID: valuesArray[9],
  };
};

export default {
  parseRedisAccountSummaryChartItem,
  parseRedisSharesListItem,
  parseRedisShareInfo,
  parseRedisTransactionsHistoryListItem,
};
