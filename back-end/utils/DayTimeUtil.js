const { isEqual } = require('lodash');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const oneSecond = 1000; // 1000 ms = 1 second
const oneMinute = 60 * oneSecond;
const oneHour = 60 * oneMinute;
const oneDay = 24 * oneHour;

const clearIntervals = (intervals) => {
    for (var interval of intervals) {
        clearInterval(interval);
    }
}

const clearIntervalsIfIntervalsNotEmpty = (intervals) => {
    for (var interval of intervals) {
        if(interval) {
            clearInterval(interval);
        }
    }
}

/**
 * Stock Market NYSE and NASDAQ conversion open time to UTC
 * https://www.google.com/search?rlz=1C5CHFA_enUS873US873&sxsrf=ALeKk013CdIZ70zSkWRJpY35E7Ids9sE0g%3A1594856100801&ei=pJIPX-bFMJCitQWc3I6YAw&q=time+NYSE+and+NASDAQ+close+UTC+time&oq=time+NYSE+and+NASDAQ+close+UTC+time&gs_lcp=CgZwc3ktYWIQAzIFCCEQqwIyBQghEKsCMgUIIRCrAjoHCAAQRxCwAzoHCCMQrgIQJzoICCEQFhAdEB46BAghEAo6BQghEKABOgcIIRAKEKABUMZDWMVPYMpQaABwAHgAgAF1iAGtB5IBAzcuM5gBAKABAaoBB2d3cy13aXq4AQI&sclient=psy-ab&ved=0ahUKEwjmp-z6tdDqAhUQUa0KHRyuAzMQ4dUDCAw&uact=5
 * 
 * Country	        Stock Exchange	                 UTC
 * United States	New York Stock Exchange (NYSE)	 (UTC -4) 1:30 p.m. to 8 p.m.
 * United States	NASDAQ	                         (UTC -4) 1:30 p.m. to 8 p.m.
 * 
 * new Date() -> toUTCString() -> String: Thu, 16 Jul 2020 00:10:14 GMT
 */

const getDayUTCString = (UTCString) => {
    var dayString = UTCString.substring(0, 3);
    return dayString;
}

const getDateUTCString = (UTCString) => {
    var dateString = UTCString.substring(5, 7);
    return parseInt(dateString, 10);
}

const getMonthUTCString = (UTCString) => {
    var monthString = UTCString.substring(8, 11);
    switch(monthString) {
        case 'Jan':
            return 1;
        case 'Feb':
            return 2;
        case 'Mar':
            return 3;
        case 'Apr':
            return 4;
        case 'May':
            return 5;
        case 'Jun':
            return 6;
        case 'Jul':
            return 7;
        case 'Aug':
            return 8;
        case 'Sep':
            return 9;
        case 'Oct':
            return 10;
        case 'Nov':
            return 11;
        case 'Dec':
            return 12;

        default:
            return 0;
    }
}

const getYearUTCString = (UTCString) => {
    var yearString = UTCString.substring(12, 16);
    return parseInt(yearString, 10);
}

const getHoursUTCString = (UTCString) => {
    var hoursString = UTCString.substring(17, 19);
    return parseInt(hoursString, 10);
}

const getMinutesUTCString = (UTCString) => {
    var minutesString = UTCString.substring(20, 22);
    return parseInt(minutesString, 10);
}

const getSecondsUTCString = (UTCString) => {
    var secondsString = UTCString.substring(23, 25);
    return parseInt(secondsString, 10);
}

const changeTimeUTCString = (UTCString, hourString, minuteString, secondString) => {
    let alreadyChangedTime = '';
    alreadyChangedTime = UTCString.substring(0, 16) + ' ' + `${hourString}:${minuteString}:${secondString}` + ' GMT';
    return alreadyChangedTime;
}

const newDate = () => {
    var timeNow = new Date().toUTCString();
    return timeNow;
}

/**
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

    Object.entries(marketHolidayObj).forEach(( [key, value] ) => {
        if(isEqual(key, 'id') || isEqual(key, 'year')) {
            return;
        }
        
        const date = parseInt(value.substring(8, 10), 10);
        const month = parseInt(value.substring(5, 7), 10);

        if(
            isEqual(UTCDate, date) &&
            isEqual(UTCMonth, month)
        ) {
            checkResult = true;
        }
    });

    return checkResult;
}

const findIfTimeNowIsOutOfRange = (timeNow) => {
    var UTCHours = getHoursUTCString(timeNow);
    var UTCMinutes = getMinutesUTCString(timeNow); 
    //console.log(UTCHours + ',' + UTCMinutes + ',' + UTCSeconds);

    // (UTC -4) to (UTC 0) 1:30 p.m. to 8 p.m. -> 13:30 to 20:00
    if(
        UTCHours < 13 || 
        (UTCHours === 13 && UTCMinutes < 30) ||
        (UTCHours >= 20 && UTCMinutes >= 0)
    ) {
        return true;
    }
    
    return false;
}

const findIfTimeNowIsWeekend = (timeNow) => {
    const UTCDay = getDayUTCString(timeNow);
    if(isEqual(UTCDay, "Sat") || isEqual(UTCDay, 'Sun')) {
        return true;
    }
    return false;
}

/**
 * return true if market closed
 * else return false if market opened
 */
const isMarketClosedCheck = () => {
    var timeNow = newDate();
    //console.log(timeNow);

    var UTCYear = getYearUTCString(timeNow);

    return new Promise((resolve, reject) => {
        prisma.marketHolidays.findOne({
            where: {
                year: UTCYear
            }
        })
        .then(marketHoliday => {
            //console.log(findIfTimeNowIsHoliday(marketHoliday));

            if(
                findIfTimeNowIsHoliday(marketHoliday) || 
                findIfTimeNowIsOutOfRange(timeNow) ||
                findIfTimeNowIsWeekend(timeNow)
            ) {
                resolve(true);
            }
            else {
                resolve(false);
            }
        })
        .catch(err => {
            reject(err);
        })
    });
}

module.exports = {
    oneSecond, 
    oneMinute,
    oneHour,
    oneDay,
    clearIntervals,
    clearIntervalsIfIntervalsNotEmpty,
    getDayUTCString,
    getDateUTCString,
    getMonthUTCString,
    getYearUTCString,
    getHoursUTCString,
    getMinutesUTCString,
    getSecondsUTCString,
    changeTimeUTCString,
    newDate,
    findIfTimeNowIsHoliday,
    findIfTimeNowIsOutOfRange,
    findIfTimeNowIsWeekend,
    isMarketClosedCheck
}