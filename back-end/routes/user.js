const { Router } = require("express");
const { PrismaClient } = require("@prisma/client");
const router = Router();
const prisma = new PrismaClient();
// const { indices } = require('../algolia');

const { listRangeAsync } = require("../redis/redis-client");

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
      res.status(500).send("Failed to change user's data");
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
      res.status(500).send("Failed to get user's data");
    });
});

router.get("/getOverallRanking", (req, res) => {
  const { range } = req.query;

  listRangeAsync("RANKING_LIST", range - 9, range - 1)
    .then((usersList) => {
      res.send(usersList.map((user) => {
        const data = user.split("|");
        return {
          firstName: data[0],
          lastName: data[1],
          totalPortfolio: parseInt(data[2]),
          region: data[3]
        };
      }));
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Failed to get overall ranking");
    });
});

router.get("/getRegionalRanking", (req, res) => {
  const { region, range } = req.query;

  listRangeAsync(`RANKING_LIST_${region}`, range - 9, range - 1)
    .then((usersList) => {
      res.send(usersList.map((user) => {
        const data = user.split("|");
        return {
          firstName: data[0],
          lastName: data[1],
          totalPortfolio: parseInt(data[2]),
          region: data[3]
        };
      }));
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Failed to get regional ranking");
    });
});

module.exports = router;
