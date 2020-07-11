/**
 * - This file is only used to fetch available symbols in the US from Finnhub
 * and upload these symbols to Algolia. 
 * - We then use Algolia for searching symbols to see if they are in the US or not.
 * - If you want to use this file, ask doanhtu07@gmail.com first.
 */

const fetch = require('node-fetch');
const {
    FINNHUB_API_KEY
} = process.env;

const fetchData = () => {
    fetch(`https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${FINNHUB_API_KEY}`)
    .then(res => {
        return res.json();
    })
    .then(json => {
        console.log(json);
    })
    .catch(err => {
        console.log(err);
    })
}

fetchData();