const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/user", async (req, res) => {
    try {
        const { userId } = req.query;

        let userTransactions =  (await prisma.user.findUnique({
            where: { 
                id: userId,
            },
            select: {
                transactions: true,
            }
        })).transactions;

        if (userTransactions) {
            userTransactions = userTransactions.filter(userTransaction => !userTransaction.isFinished);
        }
        
        res.status(200).send(userTransactions);
    } catch (err) {
        console.error(err);
    }
});

module.exports = router;