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
})

module.exports = router;