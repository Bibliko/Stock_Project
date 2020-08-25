const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { newDate, getYearUTCString } = require("./DayTimeUtil");

const deletePrismaMarketHolidays = () => {
  var timeNow = newDate();
  var yearNow = getYearUTCString(timeNow);

  prisma.marketHolidays
    .findOne({
      where: {
        year: yearNow - 1
      }
    })
    .then((marketHoliday) => {
      if (marketHoliday) {
        return prisma.marketHolidays.delete({
          where: {
            id: marketHoliday.id
          }
        });
      }
    })
    .then(() => {
      console.log("unnessary market holidays deleted MarketHolidaysUtil 29");
    })
    .catch((err) => {
      console.log(err);
    });
};

/**
 *  {
 *      "year":2019,
 *      "New Years Day":"2019-01-01",
 *      "Martin Luther King, Jr. Day":"2019-01-21",
 *      "Washington's Birthday":"2019-02-18",
 *      "Good Friday":"2019-04-19",
 *      "Memorial Day":"2019-05-27",
 *      "Independence Day":"2019-07-04",
 *      "Labor Day":"2019-09-02",
 *      "Thanksgiving Day":"2019-11-28",
 *      "Christmas":"2019-12-25"
 *  },
 */
const updatePrismaMarketHolidays = (stockMarketHoliday) => {
  var timeNow = newDate();
  var yearNow = getYearUTCString(timeNow);

  const stockMarketHolidayMap = new Map(Object.entries(stockMarketHoliday));

  const year = stockMarketHolidayMap.get("year");
  const newYearsDay = stockMarketHolidayMap.get("New Years Day");
  const martinLutherKingJrDay = stockMarketHolidayMap.get(
    "Martin Luther King, Jr. Day"
  );
  const washingtonBirthday = stockMarketHolidayMap.get("Washington's Birthday");
  const goodFriday = stockMarketHolidayMap.get("Good Friday");
  const memorialDay = stockMarketHolidayMap.get("Memorial Day");
  const independenceDay = stockMarketHolidayMap.get("Independence Day");
  const laborDay = stockMarketHolidayMap.get("Labor Day");
  const thanksgivingDay = stockMarketHolidayMap.get("Thanksgiving Day");
  const christmas = stockMarketHolidayMap.get("Christmas");

  /**
   * if year >= yearNow then add into database
   */
  if (year < yearNow) {
    return;
  }

  return new Promise((resolve, reject) => {
    prisma.marketHolidays
      .findOne({
        where: {
          year
        },
        select: {
          id: true,
          year: true
        }
      })
      .then((marketHoliday) => {
        if (!marketHoliday) {
          return prisma.marketHolidays.create({
            data: {
              year,
              newYearsDay,
              martinLutherKingJrDay,
              washingtonBirthday,
              goodFriday,
              memorialDay,
              independenceDay,
              laborDay,
              thanksgivingDay,
              christmas
            }
          });
        }
      })
      .then(() => {
        console.log("Successfully updated market holiday");
        resolve("Successfully updated market holiday");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = {
  deletePrismaMarketHolidays,
  updatePrismaMarketHolidays
};
