const { listPushAsync } = require("../redis/redis-client");

/**
 * Keys list:
 * - '${email}|accountSummaryChart'
 * - '${email}|sharesList'
 * - 'cachedShares|${companyCode}'
 * - 'RANKING_LIST'
 * - 'RANKING_LIST_${region}'
 */

const redisUpdateOverallRankingList = (user) => {
  const value = `${user.firstName}|${user.lastName}|${user.totalPortfolio}|${user.region}`;
  return listPushAsync("RANKING_LIST", value);
};

const redisUpdateRegionalRankingList = (region, user) => {
  const value = `${user.firstName}|${user.lastName}|${user.totalPortfolio}|${user.region}`;
  return listPushAsync(`RANKING_LIST_${region}`, value);
};

module.exports = {
  redisUpdateOverallRankingList,
  redisUpdateRegionalRankingList
};
