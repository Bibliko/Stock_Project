const { Router } = require("express");
const { PrismaClient } = require("@prisma/client");
const router = Router();
const prisma = new PrismaClient();
// const { indices } = require('../algolia');

const { keysAsync, getAsync } = require("../redis/redis-client");

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

router.get("/getOverallRanking", async (_, res) => {
  try {
    const rankingList = await keysAsync("RANKING*");
    let usersRankingList = new Array(rankingList.length);
    await Promise.all(rankingList.map(async (v) => {
      try {
        const getUser = await getAsync(v);
        const user = getUser.split("&");
        usersRankingList[parseInt(v.slice(7)) - 1] = {
          firstName: user[0],
          lastName: user[1],
          totalPortfolio: parseInt(user[2]),
          region: user[3]
        };
      } catch (err) {
        console.log(err);
      }
    }));
    res.send(usersRankingList);
  } catch (err) {
    console.log(err);
    res.status(500).send("Get overall ranking fails.");
  }
});

router.get("/getRegionalRanking", async (req, res) => {
  const {region} = req.query;

  try {
    const rankingList = await keysAsync("RANKING*");
    let usersRankingList = new Array(rankingList.length);
    await Promise.all(rankingList.map(async (v) => {
      try {
        const getUser = await getAsync(v);
        const user = getUser.split("&");
        if (region === user[3]) {
          usersRankingList[parseInt(v.slice(7)) - 1] = {
            firstName: user[0],
            lastName: user[1],
            totalPortfolio: parseInt(user[2]),
            region: user[3]
          };
        }

      } catch (err) {
        console.log(err);
      }
    }));
    res.send(usersRankingList.filter(user => user !== null));
  } catch (err) {
    console.log(err);
    res.status(500).send("Get overall ranking fails.");
  }
});

module.exports = router;
