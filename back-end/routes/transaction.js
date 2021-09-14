const { Router } = require("express");
const { PrismaClient } = require("@prisma/client");
const router = Router();
const prisma = new PrismaClient();
const { omit } = require("lodash");

const {
  addSinglePendingTransaction,
  updateSinglePendingTransaction,
  deleteSinglePendingTransaction
} = require("../utils/redis-utils/PendingOrders");

router.put("/placeOrder", (req, res) => {
  /**
   * orderData follows the schema
   * orderData: {
   *   companyCode: "...",
   *   quantity: "...",
   *   [...]
   * }
   */
  const { userId, orderData } = req.body;

  prisma.userTransaction
    .create({
      data: {
        ...orderData,
        user: {
          connect: {
            id: userId,
          }
        }
      }
    })
    .then((transaction) => (
      addSinglePendingTransaction(transaction)
        .catch((err) => (
          // Revert change in case of failure
          prisma.userTransaction
            .delete({
              where: { id: transaction.id }
            })
            .then(() => { throw(err); })
            .catch((err) => { throw(err); })
        ))
    ))
    .then(() => {
      res.status(200).send("Successfully placed the order");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Failed to place the order");
    });
});

router.put("/amendOrder", (req, res) => {
  /**
   * user can only changes quantity, limitPrice, brokerage
   * orderData: {
   *   quantity: "...",
   *   limitPrice: "...",
   *   brokerage: "...",
   * }
   */
  const { id, orderData } = req.body;
  let backupOrderData;

  prisma.userTransaction
    .findUnique({
      where: { id },
    })
    .then((backupTransaction) => {
      backupOrderData = backupTransaction;

      return prisma.userTransaction.update({
        where: { id },
        data: orderData,
      })
    })
    .then((transaction) => (
      updateSinglePendingTransaction(transaction)
        .catch((err) => (
          // Revert change in case of failure
          prisma.userTransaction
            .update({
              where: { id },
              data: omit(backupOrderData, "userID"),
            })
            .then(() => { throw(err); })
            .catch((err) => { throw(err); })
        ))
    ))
    .then(() => {
      res.status(200).send("Successfully amended the order");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Failed to amend the order");
    });
});

router.delete("/deleteOrder", (req, res) => {
  const { id } = req.body;
  let backupOrderData;

  prisma.userTransaction
    .findUnique({
      where: { id },
    })
    .then((backupTransaction) => {
      backupOrderData = backupTransaction;

      return prisma.userTransaction.delete({
        where: { id }
      })
    })
    .then((transaction) => (
      deleteSinglePendingTransaction(transaction)
        .catch((err) => (
          // Revert change in case of failure
          prisma.userTransaction
            .create({
              data: {
                ...omit(backupOrderData, "userID"),
                user: {
                  connect: {
                    id: backupOrderData.userID,
                  }
                }
              }
            })
            .then(() => { throw(err); })
            .catch((err) => { throw(err); })
        ))
    ))
    .then(() => {
      res.status(200).send("Successfully deleted the order");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Failed to delete the order");
    });
});

module.exports = router;
