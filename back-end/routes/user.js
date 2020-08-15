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

router.get("/getOverallRanking", (_, res) => {
  keysAsync("RANKING|*")
    .then((keysList) => {
      let usersRankingList = keysList.map((key) => {
        return getAsync(key)
          .then((user) => {
            const getUser = user.split("|");
            return {
              firstName: getUser[0],
              lastName: getUser[1],
              totalPortfolio: parseInt(getUser[2]),
              region: getUser[3]
            };
          });
      });
      return Promise.all(usersRankingList);
    })
    .then((usersList) => {
      res.send(usersList);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Get overall ranking fails.");
    })
});

router.get("/getRegionalRanking", (req, res) => {
  const {region} = req.query;

  keysAsync("RANKING|*")
    .then((keysList) => {
      let usersRankingList = keysList.map((key) => {
        return getAsync(key)
          .then((user) => {
            const getUser = user.split("|");
            if (getUser[3] === region) {
              return {
                firstName: getUser[0],
                lastName: getUser[1],
                totalPortfolio: parseInt(getUser[2]),
                region: getUser[3]
              };
            }
            return 0;
          });
      });
      return Promise.all(usersRankingList);
    })
    .then((usersList) => {
      res.send(usersList.filter(user => user !== 0));
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Get overall ranking fails.");
    })
});

module.exports = router;
