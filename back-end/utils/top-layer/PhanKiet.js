/**
 * 
 * This file is here because I don't know where should I put these codes in.
 * Please tell me its suitable location so I can transfer these lines to an appropriate place.
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

const getStockScreener = (totalCompanies) =>
{
    return new Promise((resolve, reject) =>
    {
        fetch(
            `https://financialmodelingprep.com/api/v3/stock-screener?limit=${totalCompanies}&apikey=${FINANCIAL_MODELING_PREP_API_KEY}`
        )
        .then((stockRatingsArray) =>
        {
            return stockRatingsArray.json();
        })
        .then((stockRatingsArrayJSON) =>
        {
            resolve(stockRatingsArrayJSON);
        })
    });
}

const getAllSharesRatings = () =>
{
    return new Promise((resolve, reject) =>
    {
        try
        {
            const StockScreener = getStockScreener(600);
            // eslint-disable-next-line prefer-const
            let ratings = [];
            
            for (let i = 0; i < Object.values(StockScreener).length; ++ i)
            {
                ratings.push(getSingleShareRating(StockScreener[i].symbol));
            }

            resolve(ratings);
        }
        catch (err)
        {
            reject(err);
        }
    });
}

const updateCompaniesRatingsList = (user) => {
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