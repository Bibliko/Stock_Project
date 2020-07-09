const express = require('express');
const _ = require('lodash');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
//const { indices } = require('../algolia');

router.put('/changeData', (req, res) => {
    const { password, email } = req.body;

    let data = {};

    if(password) {
        data.password = password;
    }

    prisma.user.update({
        where: {
            email,
        },
        data,
    })
    .then(user => {
        res.send(user);
    })
    .catch(err => {
        console.log(err);
        res.status(404).send("Your email or credentials may be wrong.");
    })
});

router.get('/getData', (req, res) => {
    const { email, dataNeeded } = req.query;

    const dataJSON = JSON.parse(dataNeeded);

    /** 
     *  dataNeeded in form of:
     *      dataNeeded: {
     *          cash: true,
     *          region: true,
     *          ...
     *      }
     */
    prisma.user.findOne({
        where: {
            email,
        },
        select: dataJSON
    })
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        console.log(err);
        res.status(500).send("Get data of user fails.");
    })
});

module.exports = router;