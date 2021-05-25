const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/user", async (req, res) => {
    try {
        const { userId } = req.query;

        const userTransactions =  (await prisma.user.findUnique({
            where: { 
                id: userId,
            },
            select: {
                transactions: {
                    where: {
                        isFinished: false,
                    },
                },
            }
        }));
        
        res.status(200).send(userTransactions);
    } catch (err) {
        console.error(err);
    }
});

module.exports = router;