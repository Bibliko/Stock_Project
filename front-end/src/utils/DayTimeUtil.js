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

export const getHoursUTCString = (UTCString) => {
    var hoursString = UTCString.substring(17, 19);
    return parseInt(hoursString, 10);
}

export const getMinutesUTCString = (UTCString) => {
    var minutesString = UTCString.substring(20, 22);
    return parseInt(minutesString, 10);
}

export const getSecondsUTCString = (UTCString) => {
    var secondsString = UTCString.substring(23, 25);
    return parseInt(secondsString, 10);
}

export const newDate = () => {
    var timeNow = new Date().toUTCString();
    return timeNow;
}

export const marketCountdownUpdate = (setStateFn) => {
    var timeNow = newDate();
    //console.log(timeNow);
  
    var UTCHours = getHoursUTCString(timeNow);
    var UTCMinutes = getMinutesUTCString(timeNow);
    var UTCSeconds = getSecondsUTCString(timeNow);    
    //console.log(UTCHours + ',' + UTCMinutes + ',' + UTCSeconds);

    // (UTC -4) to (UTC 0) 1:30 p.m. to 8 p.m. -> 13:30 to 20:00
    if(
        UTCHours < 13 || 
        (UTCHours === 13 && UTCMinutes < 30) ||
        (UTCHours >= 20 && UTCMinutes >= 0)
    ) {
        setStateFn({
            countdown: '00:00:00'
        });
        return;
    }
    
    var hours = 20 - 1 - UTCHours;
    var min = 60 - UTCMinutes;
    var sec = 60 - UTCSeconds;

    if((hours + '').length === 1) {
        hours = '0' + hours;
    }

    if((min + '').length === 1) {
        min = '0' + min;
    }

    if((sec + '').length === 1) {
            sec = '0' + sec;
    }

    var countdown = hours+':'+min+':'+sec;

    setStateFn({
        countdown
    });
}

export const isMarketClosedCheck = () => {
    var timeNow = newDate();
    //console.log(timeNow);
  
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

export default {
    oneSecond, 
    oneMinute,
    oneHour,
    oneDay,
    getHoursUTCString,
    getMinutesUTCString,
    getSecondsUTCString,
    newDate,
    marketCountdownUpdate,
    isMarketClosedCheck
}