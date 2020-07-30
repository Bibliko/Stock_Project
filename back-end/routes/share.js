import { Router } from "express";
import { PrismaClient } from "@prisma/client";
const router = Router();
const prisma = new PrismaClient();
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
      res.status(500).send("Change data of share fails.");
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
    .findOne({
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
      res.status(500).send("Get data of share fails.");
    });
});

export default router;
