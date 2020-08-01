try {
  require("../config/config");
} catch (error) {
  console.log("No config found. Using default ENV.");
}

const algoliasearch = require("algoliasearch");

const { ALGOLIA_APPLICATION_ID, ALGOLIA_API_KEY } = process.env;

const client = algoliasearch(ALGOLIA_APPLICATION_ID, ALGOLIA_API_KEY);

var US_STOCK_SYMBOLS;

if (process.env.NODE_ENV && process.env.NODE_ENV === "production") {
  US_STOCK_SYMBOLS = client.initIndex("prod_Stock_Symbols");
} else {
  US_STOCK_SYMBOLS = client.initIndex("dev_Stock_Symbols");
}

module.exports = {
  US_STOCK_SYMBOLS
};
