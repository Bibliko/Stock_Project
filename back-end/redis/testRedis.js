const redisClient = require("./redis-client");

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

const test = () => {
  Promise.all([
    redisClient.setAsync("testKey", "testValue"),
    redisClient.setAsync("testKey1", "testValue1"),
    redisClient.setAsync("troll", "testValue")
  ])
    .then((value) => {
      return redisClient.keysAsync("test*");
    })
    .then((value) => {
      console.log(value);
      return redisClient.delAsync(value);
    })
    .then((value) => {
      console.log(value); // null
    })
    .catch((err) => {
      console.log(err);
    });
};

test();
