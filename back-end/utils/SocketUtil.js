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

const checkMarketClosedString = "checkMarketClosed";

const checkStockQuotesForUser = (socket, userData) => {
    isMarketClosedCheck()
    .then(checkResult => {
        if(checkResult) {
            //console.log('market is closed SocketUtil 17');
            socket.emit(checkStockQuotesForUserString, []);
            return null;
        }

        //console.log(userData, 'userData');

        if(!_.isEmpty(userData)) {
            return prisma.user.findOne({
                where: {
                    email: userData.email
                },
                select: {
                    shares: true
                }
            })
        }
    })
    .then(userWithShares => {
        if( !userWithShares ) {
            return null;
        }

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
};

const checkMarketClosed = (socket, objVariables) => {

    if(!objVariables.isPrismaMarketHolidaysInitialized) {
        console.log("SocketUtil, 70");
        return;
    }

    isMarketClosedCheck()
    .then(checkResult => {
        //console.log(checkResult);

        socket.emit(checkMarketClosedString, checkResult);
    })
    .catch(err => {
        console.log(err);
    })
}

module.exports = {
    checkStockQuotesForUserString,
    checkMarketClosedString,
    checkStockQuotesForUser,
    checkMarketClosed
}