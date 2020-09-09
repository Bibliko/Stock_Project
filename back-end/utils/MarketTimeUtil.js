const { isEqual } = require("lodash");
const {
  newDate,
  getDateUTCString,
  getMonthUTCString,
  getHoursUTCString,
  getMinutesUTCString,
  getDayUTCString
} = require("./low-dependency/DayTimeUtil");

/**
 *  marketHolidayObj:
 *  {
 *      "year":2019,
 *      "New Years Day":"2019-01-01", -> New York Timezone Date
 *      "Martin Luther King, Jr. Day":"2019-01-21",
 *      "Washington's Birthday":"2019-02-18",
 *      "Good Friday":"2019-04-19",
 *      "Memorial Day":"2019-05-27",
 *      "Independence Day":"2019-07-04",
 *      "Labor Day":"2019-09-02",
 *      "Thanksgiving Day":"2019-11-28",
 *      "Christmas":"2019-12-25"
 *  },
 *
 *  We still compare UTC with New York Timezone directly since
 *  it's only UTC -4, not a big deal in dates.
 */
const findIfTimeNowIsHoliday = (marketHolidayObj) => {
  var timeNow = newDate();

  var UTCDate = getDateUTCString(timeNow);
  var UTCMonth = getMonthUTCString(timeNow);

  var checkResult = false;

  // Check each key of marketHolidayObj
  Object.entries(marketHolidayObj).forEach(([key, value]) => {
    if (isEqual(key, "id") || isEqual(key, "year")) {
      return;
    }

    const date = parseInt(value.substring(8, 10), 10);
    const month = parseInt(value.substring(5, 7), 10);

    if (isEqual(UTCDate, date) && isEqual(UTCMonth, month)) {
      checkResult = true;
    }
  });

  return checkResult;
};

const findIfTimeNowIsOutOfRange = (timeNow) => {
  var UTCHours = getHoursUTCString(timeNow);
  var UTCMinutes = getMinutesUTCString(timeNow);
  // console.log(UTCHours + ',' + UTCMinutes + ',' + UTCSeconds);

  // (UTC -4) to (UTC 0) 1:30 p.m. to 8 p.m. -> 13:30 to 20:00
  if (
    UTCHours < 13 ||
    (UTCHours === 13 && UTCMinutes < 30) ||
    (UTCHours >= 20 && UTCMinutes >= 0)
  ) {
    return true;
  }

  return false;
};

const findIfTimeNowIsWeekend = (timeNow) => {
  const UTCDay = getDayUTCString(timeNow);
  if (isEqual(UTCDay, "Sat") || isEqual(UTCDay, "Sun")) {
    return true;
  }
  return false;
};

module.exports = {
  findIfTimeNowIsHoliday,
  findIfTimeNowIsOutOfRange,
  findIfTimeNowIsWeekend
};
