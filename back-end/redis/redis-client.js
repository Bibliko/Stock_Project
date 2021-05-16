// @flow
const { REDIS_URL } = require('../config');

const PromiseBlueBird = require("bluebird");
const redis = require("redis");

PromiseBlueBird.promisifyAll(redis.RedisClient.prototype);
PromiseBlueBird.promisifyAll(redis.Multi.prototype);


const { promisify } = require("util");
const client = redis.createClient(REDIS_URL);

module.exports = {
  ...client,

  // Transaction
  // - https://medium.com/@stockholmux/using-the-redis-multi-object-in-node-js-for-fun-and-profit-daf8cb62b86b
  // - https://stackoverflow.com/questions/50716118/how-to-use-redis-watch-in-node-js
  // - (Most Easy Example) https://stackoverflow.com/questions/30134251/redis-insert-values-from-array-in-a-transaction-with-promises-bluebird
  // WATCH, MULTI, EXEC
  watchAsync: promisify(client.watch).bind(client),
  multi: client.multi.bind(client),

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
  listRangeAsync: promisify(client.lrange).bind(client) // listRange: both startIndex and endIndex elements are included.
};
