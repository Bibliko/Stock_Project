import { isInteger } from "lodash";

export const oneSecond = 1000; // 1000 ms = 1 second
export const oneMinute = 60 * oneSecond;
export const oneHour = 60 * oneMinute;
export const oneDay = 24 * oneHour;

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

export const getDateUTCString = (UTCString) => {
  var dateString = UTCString.substring(5, 7);
  return parseInt(dateString, 10);
};

export const getMonthUTCString = (UTCString) => {
  var monthString = UTCString.substring(8, 11);
  switch (monthString) {
    case "Jan":
      return 1;
    case "Feb":
      return 2;
    case "Mar":
      return 3;
    case "Apr":
      return 4;
    case "May":
      return 5;
    case "Jun":
      return 6;
    case "Jul":
      return 7;
    case "Aug":
      return 8;
    case "Sep":
      return 9;
    case "Oct":
      return 10;
    case "Nov":
      return 11;
    case "Dec":
      return 12;

    default:
      return 0;
  }
};

export const getYearUTCString = (UTCString) => {
  var yearString = UTCString.substring(12, 16);
  return parseInt(yearString, 10);
};

export const getHoursUTCString = (UTCString) => {
  var hoursString = UTCString.substring(17, 19);
  return parseInt(hoursString, 10);
};

export const getMinutesUTCString = (UTCString) => {
  var minutesString = UTCString.substring(20, 22);
  return parseInt(minutesString, 10);
};

export const getSecondsUTCString = (UTCString) => {
  var secondsString = UTCString.substring(23, 25);
  return parseInt(secondsString, 10);
};

export const convertToLocalTimeString = (UTCString) => {
  var localTime = new Date(UTCString).toLocaleString();
  return localTime;
};

export const newDate = () => {
  var timeNow = new Date().toUTCString();
  return timeNow;
};

export const marketCountdownUpdate = (setStateFn, isMarketClosed) => {
  if (isMarketClosed) {
    return;
  }

  var timeNow = newDate();
  //console.log(timeNow);

  var UTCHours = getHoursUTCString(timeNow);
  var UTCMinutes = getMinutesUTCString(timeNow);
  var UTCSeconds = getSecondsUTCString(timeNow);

  var hours = 20 - 1 - UTCHours;
  var min = 60 - UTCMinutes;
  var sec = 60 - UTCSeconds;

  if ((hours + "").length === 1) {
    hours = "0" + hours;
  }

  if ((min + "").length === 1) {
    min = "0" + min;
  }

  if ((sec + "").length === 1) {
    sec = "0" + sec;
  }

  var countdown = hours + ":" + min + ":" + sec;

  //console.log(countdown);

  setStateFn({
    countdown,
  });
};

export const isLeapYear = (year) => {
  return year % 100 === 0 ? year % 400 === 0 : year % 4 === 0;
};

/**
 * dateInput: mm/dd/yyyy
 *
 * *. Check for none or empty string -> return no error
 * 1. Check length (must fall in 8, 9, 10) and number of slashes
 * 2. Check if date contains only numbers and slashes
 * 3. Check if missing date, month, year and ensure year must be 4 digits
 * 4. Check range of date, month, year
 */
export const checkDateValidError = (dateInput) => {
  // General Check
  if (dateInput === "none" || dateInput === "") {
    return "";
  }

  const numberOfSlash = dateInput.split("/").length - 1;

  if (
    (dateInput.length !== 8 &&
      dateInput.length !== 9 &&
      dateInput.length !== 10) ||
    numberOfSlash !== 2
  ) {
    return "Not a valid date.";
  }

  for (let i = 0; i < dateInput.length; i++) {
    let char = dateInput.substring(i, i + 1);
    if (!isInteger(parseInt(char, 10)) && char !== "/") {
      return "Only numbers and / are allowed.";
    }
  }

  const date = dateInput.split("/");

  let month = date[0];
  if (month === "" || !month) {
    return "Missing Month.";
  }
  month = parseInt(month, 10);

  let dd = parseInt(date[1], 10);
  if (dd === "" || !dd) {
    return "Missing Date.";
  }
  dd = parseInt(dd, 10);

  let year = parseInt(date[2], 10);
  if (year === "" || !year) {
    return "Missing Year.";
  }
  year = parseInt(year, 10);
  if (parseInt(year / 1000, 10) === 0) {
    return "Year must be 4 digits.";
  }

  // Range Check

  if (month < 0 || month > 12) {
    return "Month is out of range.";
  }

  if (dd < 0 || dd > 31) {
    return "Date is out of range.";
  }

  if (year < 0 || year > new Date().getFullYear()) {
    return "Year is out of range.";
  }

  // Specific Check
  const oddMaxDays = 31;
  const evenMaxDays = 30;
  const FebMaxDays = isLeapYear(year) ? 29 : 28;

  if (
    (month === 2 && dd > FebMaxDays) ||
    ((month === 8 || month === 10 || month === 12) && dd > 31)
  ) {
    return "Date is out of range for this month.";
  } else {
    if (
      (month % 2 === 0 && dd > evenMaxDays) ||
      (month % 2 === 1 && dd > oddMaxDays)
    ) {
      return "Date is out of range for this month.";
    }
  }

  return "";
};

/**
 * dateInput: mm/dd/yyyy
 * return 0 if equal, 1 if larger, -1 if smaller
 */
export const compareTwoDates = (dateInput1, dateInput2) => {
  const date1 = dateInput1.split("/");
  const month1 = parseInt(date1[0], 10);
  const dd1 = date1.length >= 1 ? parseInt(date1[1], 10) : 0;
  const year1 = date1.length >= 2 ? parseInt(date1[2], 10) : 0;

  const date2 = dateInput2.split("/");
  const month2 = parseInt(date2[0], 10);
  const dd2 = date2.length >= 1 ? parseInt(date2[1], 10) : 0;
  const year2 = date2.length >= 2 ? parseInt(date2[2], 10) : 0;

  if (year1 > year2) {
    return 1;
  } else if (year1 < year2) {
    return -1;
  } else {
    if (month1 > month2) {
      return 1;
    } else if (month1 < month2) {
      return -1;
    } else {
      if (dd1 > dd2) {
        return 1;
      } else if (dd1 < dd2) {
        return -1;
      } else {
        return 0;
      }
    }
  }
};

export default {
  oneSecond,
  oneMinute,
  oneHour,
  oneDay,
  getDateUTCString,
  getMonthUTCString,
  getYearUTCString,
  getHoursUTCString,
  getMinutesUTCString,
  getSecondsUTCString,
  convertToLocalTimeString,
  newDate,
  marketCountdownUpdate,
  isLeapYear,
  checkDateValidError,
  compareTwoDates,
};
