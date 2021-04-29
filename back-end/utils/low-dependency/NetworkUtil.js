const ip = require("ip");
const myIPAddress = ip.address();

const getFrontendHost = () => {
  const { NODE_ENV, FRONTEND_HOST } = require('../../config');

  if (NODE_ENV === "development") {
    console.log(myIPAddress, "NetworkUtil.js 8");
    return `http://${myIPAddress}:3000`;
  } else {
    return FRONTEND_HOST;
  }
};

const getPassportCallbackHost = () => {
  const { NODE_ENV, PASSPORT_CALLBACK_HOST } = require('../../config');

  if (NODE_ENV === "development") {
    return `http://${myIPAddress}:3000/api`;
  } else {
    return PASSPORT_CALLBACK_HOST;
  }
};

module.exports = {
  getFrontendHost,
  getPassportCallbackHost
};
