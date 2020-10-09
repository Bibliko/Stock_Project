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
        })
        .catch(err => reject(err));
    });
}

/**
 * @description This function fetch the rating data with certain number of companies.
 * @param totalCompanies The number of companies that we will fetch.
 */
const getStockScreener = (totalCompanies) =>
{
    return new Promise((resolve, reject) =>
    {
        fetch(`https://financialmodelingprep.com/api/v3/stock-screener?limit=${totalCompanies}&apikey=${FINANCIAL_MODELING_PREP_API_KEY}`)
        .then((stockRatingsArray) => 
        {
            return stockRatingsArray.json()
        })
        .then((stockRatingsArrayJSON) =>
        {
            if (isEmpty(stockRatingsArrayJSON))
            {
                reject(new Error("There is a problem with FMP API key."));
            }
            else if (stockRatingsArrayJSON["Error Message"])
            {
                reject(stockRatingsArrayJSON["Error Message"]);
            }
            else
            {
                resolve(stockRatingsArrayJSON);
            }
        })
        .catch(err => reject(err));
    });
}

const getAllSharesRatings = () =>
{
    return new Promise((resolve, reject) =>
    {
        const totalCompanies = 600; // The number of companies that we will fetch.

        const StockScreener = getStockScreener(totalCompanies);
        
        // eslint-disable-next-line prefer-const
        let ratings = [];
        
        StockScreener.forEach((stockInfo) =>
        {
            ratings.push(getSingleShareRating(stockInfo.symbol));
        });
        
        if (isEmpty(ratings))
        {
            reject(new Error("There is a problem with FMP API key."));
        }
        else resolve(ratings);
    });
}

const updateCompaniesRatingsList = () => {
    return new Promise((resolve, reject) =>
    {
        const allSharesRatings = getAllSharesRatings();

        prisma.companiesRatings.update({
            data:
            {
                companiesRatings: allSharesRatings
            }
        })
        .then(() =>
        {
            resolve("Successfully update rating in database.")
        })
        .catch(err => reject(err));
    });


};

module.exports = {
    getSingleShareRating,

    getAllSharesRatings,

    updateCompaniesRatingsList
};