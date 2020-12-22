// @flow

try {
  require("../config/config");
} catch (err) {
  console.log("No config found. Using default ENV.");
}

const redis = require("redis");
const { promisify } = require("util");
const client = redis.createClient(process.env.REDIS_URL);

module.exports = {
  ...client,
  getAsync: promisify(client.get).bind(client),
  setAsync: promisify(client.set).bind(client),
  delAsync: promisify(client.del).bind(client),
  renameAsync: promisify(client.rename).bind(client),

  keysAsync: promisify(client.keys).bind(client),
  listLengthAsync: promisify(client.llen).bind(client),
  listLeftPushAsync: promisify(client.lpush).bind(client),
  listPushAsync: promisify(client.rpush).bind(client),
  listPopAsync: promisify(client.rpop).bind(client),
  listTrimAsync: promisify(client.ltrim).bind(client),
  listRangeAsync: promisify(client.lrange).bind(client), // listRange: both startIndex and endIndex elements are included.

  queueAdd: promisify(client.zadd).bind(client),
  queueRemove: promisify(client.zrem).bind(client),
  queueGetRangeByScore: promisify(client.zrangebyscore).bind(client)
};
