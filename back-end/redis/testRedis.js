const redisClient = require("./redis-client");
// const { promisify } = require("util");

// app.get('/store/:key', async (req, res) => {
//     const { key } = req.params;
//     const value = req.query;
//     await redisClient.setAsync(key, JSON.stringify(value));
//     return res.send('Success');
// });

// app.get('/:key', async (req, res) => {
//     const { key } = req.params;
//     const rawData = await redisClient.getAsync(key);
//     return res.json(JSON.parse(rawData));
// });

// const test = () => {
//   Promise.all([
//     redisClient.setAsync("testKey", "testValue"),
//     redisClient.setAsync("testKey1", "testValue1"),
//     redisClient.setAsync("troll", "testValue")
//   ])
//     .then((value) => {
//       return redisClient.keysAsync("test*");
//     })
//     .then((value) => {
//       console.log(value);
//       return redisClient.delAsync(value);
//     })
//     .then((value) => {
//       console.log(value); // null
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };

// const test2 = () => {
//   redisClient
//     .getAsync("TestKeyWithoutPriorSetup") // -> return null if no key found
//     .then((value) => {
//       console.log(value);
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };

// const test3 = () => {
//   redisClient
//     .keysAsync("test*") // -> return [] if no key found
//     .then((values) => {
//       console.log(values);
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };

// const test4 = () => {
//   redisClient
//     .delAsync("cachedShares|AAPL") // -> return [] if no key found
//     .then((values) => {
//       console.log(values);
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };

// const testList1 = () => {
//   redisClient
//     .listRangeAsync("asdf", 0, -1)
//     .then((list) => {
//       console.log(list);
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };

// const testList2 = () => {
//   const redisKey = `test`;

//   redisClient
//     .listRangeAsync(redisKey, 0, -1)
//     .then((testValue) => {
//       console.log(testValue);
//       return redisClient.listPushAsync(redisKey, "hello");
//     })
//     .then((finishedUpdating) => {
//       console.log(finishedUpdating);
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };

const testRedisTransaction = () => {
  const multi = redisClient.multi();

  redisClient
    .watchAsync("test")
    .then((watched) => {
      console.log(watched);
      return redisClient.getAsync("test");
    })
    .then((value) => {
      console.log(value);
      return value;
    })
    .then((value) => {
      multi.setAsync("test", "hello");
      return multi.execAsync();
    })
    .then((results) => {
      console.log(results);
      console.log("Ending Process...");
    })
    .catch((err) => {
      console.log(err);
    });
};

testRedisTransaction();
