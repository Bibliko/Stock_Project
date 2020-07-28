const { isEqual } = require('lodash');
const {
    isMarketClosedCheck,
    newDate,
    changeTimeUTCString
} = require('./DayTimeUtil');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const deleteExpiredVerification = () => {
    let date = new Date();
    date = (date.getMonth()+1) + '/' + date.getDate() + '/' + date.getFullYear(); 
    prisma.userVerification.deleteMany({
        where: {
            expiredAt: date
        }
    })
    .then(res => {
        console.log('Deleted', res, 'email verifications');
    })
    .catch(err => {
        console.log(err);
    })
}

const createAccountSummaryChartTimestampIfNecessary = (user) => {
    return new Promise((resolve, reject) => {
        prisma.accountSummaryTimestamp.findOne({
            where: {
                UTCDateString_userID: {
                    UTCDateString: changeTimeUTCString(newDate(), '20', '00', '00'),
                    userID: user.id
                }
            }
        })
        .then(timestamp => {
            if(!timestamp) {
                return prisma.accountSummaryTimestamp.create({
                    data: {
                        UTCDateString: changeTimeUTCString(newDate(), '20', '00', '00'),
                        portfolioValue: user.totalPortfolio,
                        user: {
                            connect: {
                                id: user.id
                            }
                        }
                    }
                })
            }
        })
        .then(() => {
            console.log('find and create timestamp done');
            resolve('find and create timestamp done');
        })
        .catch(err => {
            reject(err);
        })
    })
}

const updateAllUsers = () => {
    // update portfolioLastClosure and ranking for all users

    prisma.user.findMany({
        select: {
            id: true,
            totalPortfolio: true
        },
        orderBy: {
            totalPortfolio: 'desc'
        }
    })
    .then(usersArray => {
        //console.log(usersArray);

        const updateAllUsersPromise = usersArray.map((user, index) => {
            const updateRankingAndPortfolioLastClosure = prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    totalPortfolioLastClosure: user.totalPortfolio,
                    ranking: index + 1
                },
            });
            const accountSummaryPromise = createAccountSummaryChartTimestampIfNecessary(user);

            return Promise.all([updateRankingAndPortfolioLastClosure, accountSummaryPromise]);
        });
        return Promise.all(updateAllUsersPromise);
    })
    .then(() => {
        console.log('Update all users successfully.');
    })
    .catch(err => {
        console.log(err);
    })
}

/**
 * objVariables: object passed in from back-end/index
 */
const checkAndUpdateAllUsers = (objVariables) => {
    //console.log(objVariables);

    if(!objVariables.isPrismaMarketHolidaysInitialized) {
        console.log("UserUtil, 68");
        return;
    }

    isMarketClosedCheck()
    .then(checkResult => {
        // check if market is closed and update the status of objVariables
        if(!isEqual(checkResult, objVariables.isMarketClosed)) {
            console.log(checkResult, 'UserUtil, 76');
            objVariables.isMarketClosed = checkResult;
        }

        // if market is closed but flag isAlreadyUpdate is still false 
        // -> change it to true AND updatePortfolioLastClosure
        if(
            objVariables.isMarketClosed && 
            !objVariables.isAlreadyUpdateAllUsers
        ) {
            objVariables.isAlreadyUpdateAllUsers = true;
            updateAllUsers();
        }

        // if market is opened but flag isAlreadyUpdate not switch to false yet -> change it to false
        if(
            !objVariables.isMarketClosed && 
            objVariables.isAlreadyUpdateAllUsers
        ) {
            objVariables.isAlreadyUpdateAllUsers = false;
        }
    })
    .catch(err => {
        console.log(err);
    })
}

module.exports = {
    deleteExpiredVerification,
    createAccountSummaryChartTimestampIfNecessary,
    updateAllUsers,
    checkAndUpdateAllUsers
}