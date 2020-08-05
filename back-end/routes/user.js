const { Router } = require("express");
const { PrismaClient } = require("@prisma/client");
const router = Router();
const prisma = new PrismaClient();
// const { indices } = require('../algolia');

router.put("/changeData", (req, res) => {
  const { dataNeedChange, email } = req.body;

  // const dataJSON = JSON.parse(dataNeedChange);

  /**
   * dataNeedChange in form:
   *  dataNeedChange: {
   *      password: "...",
   *      email: "...",
   *      [...]
   *  }
   */

  prisma.user
    .update({
      where: {
        email
      },
      data: dataNeedChange
    })
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Change data of user fails.");
    });
});

router.get("/getData", (req, res) => {
  const { email, dataNeeded } = req.query;

  var dataJSON = JSON.parse(dataNeeded);

  if (dataJSON.shares) {
    dataJSON = {
      shares: {
        orderBy: {
          companyCode: "asc"
        }
      }
    };
  }

  /**
   *  dataNeeded in form of:
   *      dataNeeded: {
   *          cash: true,
   *          region: true,
   *          ...
   *      }
   */
  prisma.user
    .findOne({
      where: {
        email
      },
      select: dataJSON
    })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Get data of user fails.");
    });
});

router.get("/getOverallRanking", async (_req, res) => {
  prisma.user
    .findMany({
      orderBy: { totalPortfolio: "desc" },
      select: {
        firstName: true,
        lastName: true,
        totalPortfolio: true,
        region: true
      }
    })
    .then(users => res.json(users))
    .catch(err => {
      console.log(err);
      res.status(500).send("Get overall ranking fails.");
    });
});

router.get("/getRegionalRanking", async (req, res) => {
  const { region } = req.query;
  
  prisma.user
    .findMany({
      where: { region },
      orderBy: { totalPortfolio: "desc" },
      select: {
        firstName: true,
        lastName: true,
        totalPortfolio: true,
        region: true
      }
    })
    .then(users => res.json(users))
    .catch(err => {
      console.log(err);
      res.status(500).send("Get regional ranking fails.");
    });
});

module.exports = router;
