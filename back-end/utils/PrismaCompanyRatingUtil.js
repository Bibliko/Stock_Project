const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { SequentialPromisesWithResultsArray } = require("./low-dependency/PromisesUtil");

const { getFullStockRatingsFromFMP } = require("./FinancialModelingPrepUtil.js");

const executeUpdateCompaniesRatingsList = () =>
{
    return new Promise((resolve, reject) =>
    {
        console.log("Updating companies' ratings");

        getFullStockRatingsFromFMP()
        .then((allSharesRatings) =>
        {
            // eslint-disable-next-line prefer-const
            let tasksList = [];

            // @returns: Object<Promise>
            allSharesRatings.forEach((shareRating) =>
            {
                if (shareRating === null) return;
                tasksList.push(() => 
                {
                    prisma.companyRating.findOne({
                        where:
                        {
                            symbol: shareRating.symbol
                        }
                    })
                    .then((shareRatingPrisma) =>
                    {
                        if (!shareRatingPrisma)
                        {
                            return prisma.companyRating.create({
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
                            return prisma.companyRating.update({
                                where:
                                {
                                    symbol: shareRatingPrisma.symbol
                                },
                                data:
                                {
                                    rating: shareRating.rating,
                                    ratingScore: shareRating.ratingScore,
                                    ratingRecommendation: shareRating.ratingRecommendation
                                }
                            });
                        }
                    });
                });
            });

            return SequentialPromisesWithResultsArray(tasksList);
        })
        .then((finishedUpdatingAllCompanyRatings) =>
        {
            console.log("Successfully update companies' ratings");
            resolve(null);
        })
        .catch(err => reject(err));
    });
}

/**
 * @description create Prisma models if they have not existed or update them.
 */
const updateCompaniesRatingsList = () => {

    return new Promise((resolve, reject) =>
    {
        const forceUpdate = false;

        if (forceUpdate === false && process.env.NODE_ENV === "development")
        {
            return prisma.companyRating.count()
            .then((countModels) =>
            {
                if (countModels > 0) console.log("[DEVELOPER MODE] Unnecessary ratings update has been prevented.");
                else executeUpdateCompaniesRatingsList();
            })
            .catch(err => reject(err));
        }
        else executeUpdateCompaniesRatingsList();
    });
};

module.exports = 
{
    updateCompaniesRatingsList
}