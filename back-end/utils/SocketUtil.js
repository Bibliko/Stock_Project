const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const _ = require('lodash');
const fetch = require('node-fetch');

const checkAllSharePricesForUser = (socket, userData) => {
    //console.log(userData);
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
                socket.emit("checkAllSharesPrices", 0);
            }
            else {
                var stringShareSymbols = new String('');
                for (var share of shares) {
                    stringShareSymbols = stringShareSymbols.concat(share.companyCode,',');
                }
            }

            /** 
             *  This code works. Asked and still waiting about request limits for APIs 
             *  on Financial Modeling Prep.
             * 
             *  fetchData = () => {
             *      fetch('https://financialmodelingprep.com/api/v3/quote-short/AAPL,FB?apikey=a0cca36a1992fbe5b55abcf0058df1e3')
             *      .then(res => {
             *          return res.json();
             *      })
             *      .then(json => {
             *          console.log(json);
             *      })
             *      .catch(err => {
             *          console.log(err);
             *      })
             *   }
             */

        })
        .catch(err => {
            console.log(err);
        })
    }
};

module.exports = {
    checkAllSharePricesForUser
}