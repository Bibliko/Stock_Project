const oneSecond = 1000; // 1000 ms = 1 second
const oneMinute = 60 * oneSecond;
const oneHour = 60 * oneMinute;
const oneDay = 24 * oneHour;

const clearIntervals = (intervals) => {
    for (interval of intervals) {
        clearInterval(interval);
    }
}

const clearIntervalsIfIntervalsNotEmpty = (intervals) => {
    for (interval of intervals) {
        if(interval) {
            clearInterval(interval);
        }
    }
}

module.exports = {
    oneSecond, 
    oneMinute,
    oneHour,
    oneDay,
    clearIntervals,
    clearIntervalsIfIntervalsNotEmpty
}