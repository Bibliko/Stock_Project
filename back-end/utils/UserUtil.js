const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// const updateUsersRanking = () => {
//     prisma.user.findMany({
//         orderBy: {
//             totalPortfolio: 'desc'
//         }
//     })
//     .then(rankedUsers => {
//         var usersLength = rankedUsers.length;
//         for(var i = 0; i < usersLength; i++) {

//         }
//     })
//     .catch(err => {
//         console.log(err);
//     })
// }

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

module.exports = {
    deleteExpiredVerification
}