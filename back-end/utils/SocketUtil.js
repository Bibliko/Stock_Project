const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const _ = require('lodash');
const {
    getStockQuotesFromFMP
} = require('./FinancialModelingPrepUtil');
const { 
    isMarketClosedCheck
} = require('./DayTimeUtil');

const checkStockQuotesForUserString = "checkStockQuotesForUser";

const checkStockQuotesForUser = (socket, userData) => {
    if(isMarketClosedCheck()) {
        return null;
    }

    //console.log(userData, 'userData');
    if(!_.isEmpty(userData)) {
        prisma.user.findOne({
            where: {
                email: userData.email
            },
            select: {
                shares: true
            }
        })
        .then(userWithShares => {
            const { shares } = userWithShares;

            if(_.isEmpty(shares)) {
                socket.emit(checkStockQuotesForUserString, []);
                return null;
            }
            else {
                /** 
                 * Uncomment below line if in Production:
                 * - We are using Financial Modeling Prep free API key
                 * -> The amount of requests is limited. Use wisely when testing!
                 */
                //return getStockQuotesFromFMP(shares);
            }
        })
        .then(stockQuotesJSON => {
            if(stockQuotesJSON) {
                //console.log(stockQuotesJSON);
                socket.emit(checkStockQuotesForUserString, stockQuotesJSON);
            }
        })
        .catch(err => {
            console.log(err);
        })
    }
};

module.exports = {
    checkStockQuotesForUser,
}