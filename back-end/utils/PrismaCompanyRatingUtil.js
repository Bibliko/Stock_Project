const { isEmpty } = require("lodash");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { SequentialPromisesWithResultsArray } = './low-dependency/PromisesUtil';

const { getFullStockRatingsFromFMP } = './FinancialModelingPrepUtil.js'

/**
 * @description create Prisma models if they have not existed or update them.
 */
const updateCompaniesRatingsList = () => {
    return new Promise((resolve, reject) =>
    {
        const updateCompaniesRatingPromise = getFullStockRatingsFromFMP((allSharesRatings) =>
        {
            // eslint-disable-next-line prefer-const
            let tasksList = [];

            
            // @returns: Object<Promise>
            allSharesRatings.forEach((shareRating) =>
            {
                tasksList.push(() => 
                {
                    prisma.companiesRatings.findMany({
                        where:
                        {
                            symbol: shareRating.symbol
                        }
                    })
                    .then((shareRatingPrisma) =>
                    {
                        if (isEmpty(shareRatingPrisma))
                        {
                            return prisma.companiesRatings.create({
                                data:
                                {
                                    symbol: shareRating.symbol,
                                    rating: shareRating.rating,
                                    ratingScore: shareRating.ratingScore,
                                    ratingRecommendation: shareRating.ratingRecommendation
                                }
                            });
                        }
                        else
                        {
                            return prisma.companies.update({
                                where:
                                {
                                    symbol: shareRatingPrisma[0].symbol
                                },
                                data:
                                {
                                    rating: shareRating.rating,
                                    ratingScore: shareRating.ratingScore,
                                    ratingRecommendation: shareRating.ratingRecommendation
                                }
                            });
                        }
                    })
                    .catch(err => reject(err));
                });
            });

            return SequentialPromisesWithResultsArray(tasksList);
        })
        .then((finishedUpdatingCompaniesRatingsList) =>
        {
            resolve("Successfully updating companies' ratings list");
        })
        .catch((err) => reject(err));

        return Promise.all(updateCompaniesRatingPromise);

    });
};

module.exports = 
{
    updateCompaniesRatingsList
}