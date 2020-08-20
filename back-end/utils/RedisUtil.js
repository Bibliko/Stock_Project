const { listPushAsync } = require("../redis/redis-client");

const redisUpdateOverallRankingList = (user) => {
  const value = `${user.firstName}|${user.lastName}|${user.totalPortfolio}|${user.region}`;
  return listPushAsync(['RANKING_LIST', value]);
};

const redisUpdateRegionalRankingList = (region, user) => {
  const value = `${user.firstName}|${user.lastName}|${user.totalPortfolio}|${user.region}`;
  console.log(value);
  return listPushAsync([`RANKING_LIST_${region}`, value]);
}

module.exports = {
  redisUpdateOverallRankingList,
  redisUpdateRegionalRankingList
};
