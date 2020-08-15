const { setAsync } = require("../redis/redis-client");

function redisUpdateRankingList(user, ranking) {
  const value = `${user.firstName}|${user.lastName}|${user.totalPortfolio}|${user.region}`;
  return setAsync(`RANKING|${ranking}`, value);
}

module.exports = redisUpdateRankingList;
