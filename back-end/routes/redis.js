const express = require('express');
const router = express.Router();
const {
    getAsync,
    setAsync,
    delAsync,
    listPushAsync,
    listRangeAsync
} = require('../redis/redis-client');


/**
 * 'doanhtu07@gmail.com|accountSummaryChart' : list -> "timestamp1|value1", "timestamp2|value2", ...
 */
router.put('/updateAccountSummaryChartWholeList', (req, res) => {
    //console.log(req.body, 'redis.js 14');
    const { email, prismaTimestamps } = req.body;

    const redisKey = `${email}|accountSummaryChart`;

    listRangeAsync(redisKey, 0, -1)
    .then(timestampsList => {
        if(timestampsList) {
            const listPushPromise = prismaTimestamps.map(timestamp => {
                const { UTCDateString, portfolioValue } = timestamp;
                const newValue = `${UTCDateString}|${portfolioValue}`;
                return listPushAsync(redisKey, newValue);
            });
            return Promise.all(listPushPromise);
        }
    })
    .then(finishedUpdatingRedisTimestampsList => {
        res.sendStatus(200);
    })
    .catch(err => {
        console.log(err);
        res.sendStatus(500);
    })
});
router.put('/updateAccountSummaryChartOneItem', (req, res) => {
    //console.log(req.body, 'redis.js 14');
    const { email, timestamp, portfolioValue } = req.body;

    const redisKey = `${email}|accountSummaryChart`;
    const newValue = `${timestamp}|${portfolioValue}`;

    listRangeAsync(redisKey, 0, -1)
    .then(timestampArray => {
        //console.log(timestampArray, 'redis.js 24');
        if(timestampArray) {
            return listPushAsync(redisKey, newValue);
        }
    })
    .then(finishedUpdatingRedisAccountSummaryChart => {
        res.sendStatus(200);
    })
    .catch(err => {
        console.log(err);
        res.sendStatus(500);
    })
});
router.get('/getAccountSummaryChartWholeList', (req, res) => {
    //console.log(req.query, 'redis.js 39');
    const { email } = req.query;

    const redisKey = `${email}|accountSummaryChart`;

    listRangeAsync(redisKey, 0, -1)
    .then(timestampArray => {
        res.send(timestampArray);
    })
    .catch(err => {
        console.log(err);
        res.sendStatus(500);
    })
});
router.get('/getAccountSummaryChartLatestItem', (req, res) => {
    const { email } = req.query;

    const redisKey = `${email}|accountSummaryChart`;

    listRangeAsync(redisKey, -1, -1)
    .then(timestampArray => {
        res.send(timestampArray);
    })
    .catch(err => {
        console.log(err);
        res.sendStatus(500);
    })
});

/**
 * 'doanhtu07@gmail.com|sharesList' : 
 * List -> "id1|companyCode1|quantity1|buyPriceAvg1|lastPrice1|userID1", "..."
 */
router.put('/updateSharesList', (req, res) => {
    const { email, shares } = req.body;

    const redisKey = `${email}|sharesList`;

    listRangeAsync(redisKey, 0, -1)
    .then(sharesList => {
        if(sharesList) {
            const listPushPromise = shares.map(share => {
                const { id, companyCode, quantity, buyPriceAvg, lastPrice, userID } = share;
                const newValue = `${id}|${companyCode}|${quantity}|${buyPriceAvg}|${lastPrice}|${userID}`;
                return listPushAsync(redisKey, newValue);
            });
            return Promise.all(listPushPromise);
        }
    })
    .then(finishedUpdatingRedisSharesList => {
        res.sendStatus(200);
    })
    .catch(err => {
        console.log(err);
        res.sendStatus(500);
    })
});
router.get('/getSharesList', (req, res) => {

    const { email } = req.query;

    const redisKey = `${email}|sharesList`;

    listRangeAsync(redisKey, 0, -1)
    .then(sharesList => {
        res.send(sharesList);
    })
    .catch(err => {
        console.log(err);
        res.sendStatus(500);
    })
});

module.exports = router;