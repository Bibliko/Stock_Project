const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
//const { indices } = require('../algolia');

router.get('/getData', (req, res) => {
    const { yearNeeded } = req.query;

    const yearNeededInt = parseInt(yearNeeded, 10);

    prisma.marketHolidays.findOne({
        where: {
            year: yearNeededInt,
        },
    })
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        console.log(err);
        res.status(500).send("Get data of market holidays fails.");
    })
});

module.exports = router;