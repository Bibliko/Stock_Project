/**
 * 
 * Please review this file one last time before I transfer all the codes to FinancialModelingPrepUtil.js
 * I have fixed all the errors that you addressed, please take a look again.
 * 
 */


const { isEmpty } = require("lodash");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { FINANCIAL_MODELING_PREP_API_KEY } = process.env;


  
const getSingleShareRating = (shareSymbolString) =>
{
    return new Promise((resolve, reject) =>
    {
        fetch(`https://financialmodelingprep.com/api/v3/rating/${shareSymbolString}?apikey=${FINANCIAL_MODELING_PREP_API_KEY}`)
        .then((stockRating) =>
        {
            return stockRating.json();
        })
        .then((stockRatingJSON) =>
        {
            if (isEmpty(stockRatingJSON))
            {
                reject(new Error(`Share symbols do not exist in FMP.`));
            }
            else
            {
                resolve(stockRatingJSON[0]);
            }
        });
    });
}

const getAllSharesRatings = () =>
{
    return new Promise((resolve, reject) =>
    {

        // This function below will not encounter any problem unless the API key expries, therefore, I don't catch error and I use async-await for better visualization.
        const getStockScreener = async (totalCompanues) =>
        {
            const stockRatingsArray = await fetch(`https://financialmodelingprep.com/api/v3/stock-screener?limit=${totalCompanies}&apikey=${FINANCIAL_MODELING_PREP_API_KEY}`);
            const stockRatingsArrayJSON = await stockRatingsArray.json();

            return stockRatingsArrayJSON;
        };

        const totalCompanies = 600; // The number of companies that we will fetch.
        const StockScreener = getStockScreener(totalCompanies);


        // eslint-disable-next-line prefer-const
        let ratings = [];
        
        StockScreener.forEach((stockInfo) =>
        {
            ratings.push(getSingleShareRating(stockInfo.symbol));
        });

        resolve(ratings);
    });
}

const updateCompaniesRatingsList = () => {
    prisma.user
    .findMany({
        where: {
            hasFinishedSettingUp: true
        }
    })
    .then((usersArray) => {

        const allSharesRatings = getAllSharesRatings();

        const updateAllUsersCompaniesRatings = usersArray.map((user, index) =>
        {
            prisma.user.update({
                where:
                {
                    id: user.id
                },
                data:
                {
                    companiesRatings: allSharesRatings
                }
            });
        });

        return Promise.all(updateAllUsersCompaniesRatings);
    })
    .then(() =>
    {
        console.log("Successfully updated all users companies rating list\n")
    })
    .catch(err => console.log(err));
};

module.exports = {
    getSingleShareRating,

    getAllSharesRatings,

    updateCompaniesRatingsList
};