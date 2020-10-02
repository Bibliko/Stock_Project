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

/**
 * @param thisComponent reference of component (this) - in this case LayoutSpeedDial.js
 */
export const marketCountdownUpdate = (thisComponent) => {
  const { isMarketClosed } = thisComponent.props;
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

  if (sec === 60) {
    sec = 0;
    min++;
  }

  if (min === 60) {
    min = 0;
    hours++;
  }

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

  thisComponent.setState({
    countdown,
  });
};

export const isLeapYear = (year) => {
  return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
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
};
