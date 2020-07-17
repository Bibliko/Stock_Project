const _ = require('lodash');
const {
    isMarketClosedCheck
} = require('./DayTimeUtil');

const { PrismaClient } = require('@prisma/client');
const { update } = require('lodash');
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

const updatePortfolioLastClosureForAllUsers = () => {
    prisma.user.findMany({
        select: {
            email: true,
            totalPortfolio: true
        }
    })
    .then(usersArray => {
        //console.log(usersArray);

        const updateAllUsersPromise = usersArray.map(user => {
            return prisma.user.update({
                where: {
                    email: user.email,
                },
                data: {
                    totalPortfolioLastClosure: user.totalPortfolio
                },
            })
        })
        return Promise.all(updateAllUsersPromise);
    })
    .then(() => {
        console.log('Update portfolio last closure for all users successfully');
    })
    .catch(err => {
        console.log(err);
    })
}

/**
 * objVariables: object passed in from back-end/index
 */
const checkAndUpdatePortfolioLastClosure = (objVariables) => {
    //console.log(objVariables);

    // check if market is closed and update the status of objVariables
    if(!_.isEqual(isMarketClosedCheck(), objVariables.isMarketClosed)) {
        objVariables.isMarketClosed = isMarketClosedCheck();
    }

    // if market is closed but flag isAlreadyUpdate is still false 
    // -> change it to true AND updatePortfolioLastClosure
    if(
        objVariables.isMarketClosed && 
        !objVariables.isAlreadyUpdatePortfolioLastClosure
    ) {
        objVariables.isAlreadyUpdatePortfolioLastClosure = true;
        updatePortfolioLastClosureForAllUsers();
    }

    // if market is opened but flag isAlreadyUpdate not switch to false yet -> change it to false
    if(
        !objVariables.isMarketClosed && 
        objVariables.isAlreadyUpdatePortfolioLastClosure
    ) {
        objVariables.isAlreadyUpdatePortfolioLastClosure = false;
    }
}

module.exports = {
    deleteExpiredVerification,
    updatePortfolioLastClosureForAllUsers,
    checkAndUpdatePortfolioLastClosure
}