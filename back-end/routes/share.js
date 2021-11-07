const { Router } = require("express");
const { prisma } = require("../utils/low-dependency/PrismaClient");
const router = Router();
// const { indices } = require('../algolia');

router.put("/changeData", (req, res) => {
  const { dataNeedChange, id } = req.body;

  // const dataJSON = JSON.parse(dataNeedChange);

  /**
   * dataNeedChange in form:
   *  dataNeedChange: {
   *      password: "...",
   *      email: "...",
   *      [...]
   *  }
   */

  prisma.share
    .update({
      where: {
        id
      },
      data: dataNeedChange
    })
    .then((share) => {
      res.send(share);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Failed to change data of share");
    });
});

router.get("/getData", (req, res) => {
  const { id, dataNeeded } = req.query;

  const dataJSON = JSON.parse(dataNeeded);

  /**
   *  dataNeeded in form of:
   *      dataNeeded: {
   *          cash: true,
   *          region: true,
   *          ...
   *      }
   */
  prisma.share
    .findUnique({
      where: {
        id
      },
      select: dataJSON
    })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Failed to get data of share");
    });
});

module.exports = router;
