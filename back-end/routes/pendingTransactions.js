const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/getPendingTransactions", async (req, res) => {
    const { userId } = req.query;

    try {
        const userTransaction =  await prisma.user.findUnique({
            where: { 
                id: userId,
            },
            select: {
                transactions: true,
            }
        });

        res.status(200).send(userTransaction);
    } catch (err) {
        console.error(err);
    }
});

module.exports = router;