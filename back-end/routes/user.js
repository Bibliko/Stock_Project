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

router.get("/getOverallRanking", (_, res) => {
  keysAsync("RANKING|*")
    .then((keysList) => {
      const usersRankingList = keysList.map((key) => {
        return new Promise((resolve, reject) => {
          getAsync(key)
            .then((user) => {
              const getUser = user.split("|");
              resolve({
                firstName: getUser[0],
                lastName: getUser[1],
                totalPortfolio: parseInt(getUser[2], 10),
                region: getUser[3]
              });
            })
            .catch((err) => {
              reject(err);
            });
        });
      });
      return Promise.all(usersRankingList);
    })
    .then((usersList) => {
      res.send(usersList);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Failed to get overall ranking");
    });
});

router.get("/getRegionalRanking", (req, res) => {
  const { region } = req.query;

  keysAsync("RANKING|*")
    .then((keysList) => {
      const usersRankingList = keysList.map((key) => {
        return new Promise((resolve, reject) => {
          getAsync(key)
            .then((user) => {
              const getUser = user.split("|");
              if (getUser[3] === region) {
                resolve({
                  firstName: getUser[0],
                  lastName: getUser[1],
                  totalPortfolio: parseInt(getUser[2]),
                  region: getUser[3]
                });
              } else {
                resolve(0);
              }
            })
            .catch((err) => {
              reject(err);
            });
        });
      });
      return Promise.all(usersRankingList);
    })
    .then((usersList) => {
      res.send(usersList.filter((user) => user !== 0));
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Failed to get regional ranking");
    });
});

module.exports = router;
