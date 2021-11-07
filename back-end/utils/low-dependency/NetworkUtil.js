const pathToRegexp = require("path-to-regexp");
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

const excludeFromCors = (paths, fn) => {
  return (req, res, next) => {
    for (let i = 0; i < paths.length; i++) {
      const regexp = pathToRegexp(paths[i]);
      if (regexp.test(req.path)) {
        return next();
      }
    }
    return fn(req, res, next);
  };
};

module.exports = {
  getFrontendHost,
  getPassportCallbackHost,
  excludeFromCors
};
