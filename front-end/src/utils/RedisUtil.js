import axios from 'axios';
import { getBackendHost } from './NetworkUtil';

const BACKEND_HOST = getBackendHost();

// redisString: "timestamp1|value1"
export const parseRedisAccountSummaryChartItem = (redisString) => {
    const indexOfVerticalLine = redisString.indexOf('|');
    return [redisString.substring(0, indexOfVerticalLine), redisString.substring(indexOfVerticalLine+1)];
}

// redisString: "id1|companyCode1|quantity1|buyPriceAvg1|lastPrice1|userID1"
export const parseRedisSharesListItem = (redisString) => {
    const indicesOfVerticalLine = [
        redisString.indexOf('|')
    ];
    for(let i=1; i<5; i++) {
        indicesOfVerticalLine.push(redisString.indexOf('|', (indicesOfVerticalLine[i-1] + 1)));
    }
    return {
        id: redisString.substring(0, indicesOfVerticalLine[0]),
        companyCode: redisString.substring((indicesOfVerticalLine[0] + 1), indicesOfVerticalLine[1]),
        quantity: parseInt(redisString.substring((indicesOfVerticalLine[1] + 1), indicesOfVerticalLine[2]), 10),
        buyPriceAvg: parseFloat(redisString.substring((indicesOfVerticalLine[2] + 1), indicesOfVerticalLine[3])),
        lastPrice: parseFloat(redisString.substring((indicesOfVerticalLine[3] + 1), indicesOfVerticalLine[4])),
        userID: redisString.substring(indicesOfVerticalLine[4] + 1)
    };
}

export const getCachedAccountSummaryChartInfo = (email) => {
    return new Promise((resolve, reject) => {
        axios(`${BACKEND_HOST}/redis/getAccountSummaryChartWholeList`, {
            method: 'get',
            params: {
                email,  
            },
            withCredentials: true
        })
        .then(res => {
            resolve(res);
        })
        .catch(e => {
            reject(e);
        })
    });
}

export const getLatestCachedAccountSummaryChartInfoItem = (email) => {
    return new Promise((resolve, reject) => {
        axios(`${BACKEND_HOST}/redis/getAccountSummaryChartLatestItem`, {
            method: 'get',
            params: {
                email,  
            },
            withCredentials: true
        })
        .then(res => {
            resolve(res);
        })
        .catch(e => {
            reject(e);
        })
    });
}

export const updateCachedAccountSummaryChartInfoOneItem = (email, timestamp, portfolioValue) => {
    return new Promise((resolve, reject) => {
        axios(`${BACKEND_HOST}/redis/updateAccountSummaryChartOneItem`, {
            method: 'put',
            data: {
                email,
                timestamp,
                portfolioValue
            },
            withCredentials: true
        })
        .then(res => {
            resolve(res);
        })
        .catch(e => {
            reject(e);
        })
    });
}

export const updateCachedAccountSummaryChartInfoWholeList = (email, prismaTimestamps) => {
    return new Promise((resolve, reject) => {
        axios(`${BACKEND_HOST}/redis/updateAccountSummaryChartWholeList`, {
            method: 'put',
            data: {
                email,
                prismaTimestamps
            },
            withCredentials: true
        })
        .then(res => {
            resolve(res);
        })
        .catch(e => {
            reject(e);
        })
    });
}

export const getCachedSharesList = (email) => {
    return new Promise((resolve, reject) => {
        axios(`${BACKEND_HOST}/redis/getSharesList`, {
            method: 'get',
            params: {
                email,  
            },
            withCredentials: true
        })
        .then(res => {
            resolve(res);
        })
        .catch(e => {
            reject(e);
        })
    });
}

export const getParsedCachedSharesList = (email) => {
    return new Promise((resolve, reject) => {
        getCachedSharesList(email)
        .then(res => {
            const { data: redisSharesString } = res;
            let shares = [];

            redisSharesString.map(shareString => {
                return shares.push(parseRedisSharesListItem(shareString));
            })
            resolve(shares);
        })  
        .catch(err => {
            reject(err);
        })
    });
}

export const updateCachedSharesList = (email, shares) => {
    return new Promise((resolve, reject) => {
        axios(`${BACKEND_HOST}/redis/updateSharesList`, {
            method: 'put',
            data: {
                email,
                shares
            },
            withCredentials: true
        })
        .then(res => {
            resolve(res);
        })
        .catch(e => {
            reject(e);
        })
    });
}

export default {
    parseRedisAccountSummaryChartItem,
    parseRedisSharesListItem,
    getCachedAccountSummaryChartInfo,
    getLatestCachedAccountSummaryChartInfoItem,
    updateCachedAccountSummaryChartInfoOneItem,
    getCachedSharesList,
    getParsedCachedSharesList,
    updateCachedSharesList
}