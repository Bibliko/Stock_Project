const express = require("express");
const router = express.Router();
const { prisma } = require("../utils/low-dependency/PrismaClient");

router.get("/getOneCompany", (req, res) => {
  const { symbol } = req.query;

  prisma.companyRating
    .findUnique({
      where: {
        symbol: symbol
      }
    })
    .then((data) => res.send(data))
    .catch((err) => {
      console.log(err);
      res.status(500).send("Failed to get data of company rating");
    });
});

router.get("/getAllCompanies", (req, res) => {
  prisma.companyRating
    .findMany()
    .then((data) => res.send(data))
    .catch((err) => {
      console.log(err);
      res.status(500).send("Failed to get data of companies rating");
    });
});

module.exports = router;
