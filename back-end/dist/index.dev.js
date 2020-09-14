"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/**
 * Table of content of this file:
 * - 1st part: set up passport
 * - 2nd part: important intervals
 * - 3rd part: APIs for Passport
 * - 4th part: verification APIs
 * - 5th part: other APIs
 * - 6th part: socket
 */
try {
  require("./config/config");
} catch (err) {
  console.log("No config found. Using default ENV.");
}

var _require = require("./utils/low-dependency/NetworkUtil"),
    getFrontendHost = _require.getFrontendHost,
    getPassportCallbackHost = _require.getPassportCallbackHost;

var _require2 = require("./utils/low-dependency/DayTimeUtil"),
    oneSecond = _require2.oneSecond,
    oneDay = _require2.oneDay,
    oneMinute = _require2.oneMinute,
    clearIntervals = _require2.clearIntervals,
    clearIntervalsIfIntervalsNotEmpty = _require2.clearIntervalsIfIntervalsNotEmpty;

var _require3 = require("./utils/top-layer/UserUtil"),
    deleteExpiredVerification = _require3.deleteExpiredVerification,
    checkAndUpdateAllUsers = _require3.checkAndUpdateAllUsers,
    updateRankingList = _require3.updateRankingList;

var _require4 = require("./utils/top-layer/SocketUtil"),
    checkMarketClosed = _require4.checkMarketClosed;

var _require5 = require("./utils/MarketHolidaysUtil"),
    deletePrismaMarketHolidays = _require5.deletePrismaMarketHolidays;

var _require6 = require("./utils/FinancialModelingPrepUtil"),
    updateMarketHolidaysFromFMP = _require6.updateMarketHolidaysFromFMP;

var _require7 = require("./utils/RedisUtil"),
    cachePasswordVerificationCode = _require7.cachePasswordVerificationCode,
    getParsedCachedPasswordVerificationCode = _require7.getParsedCachedPasswordVerificationCode,
    removeCachedPasswordVerificationCode = _require7.removeCachedPasswordVerificationCode;

var _process$env = process.env,
    port = _process$env.PORT,
    NODE_ENV = _process$env.NODE_ENV,
    FRONTEND_HOST = _process$env.FRONTEND_HOST,
    SENDGRID_API_KEY = _process$env.SENDGRID_API_KEY;

var express = require("express");

var app = express();

var _require8 = require("@prisma/client"),
    PrismaClient = _require8.PrismaClient;

var prisma = new PrismaClient();

var _require9 = require("./redis/redis-client"),
    keysAsync = _require9.keysAsync,
    delAsync = _require9.delAsync;

var _require10 = require("lodash"),
    isEmpty = _require10.isEmpty;

var sgMail = require("@sendgrid/mail");

sgMail.setApiKey(SENDGRID_API_KEY);

var fs = require("fs-extra");

var randomKey = require("random-key");

var http = require("http");

var server = http.createServer(app);

var socketIO = require("socket.io");

var io = socketIO(server);

var bodyParser = require("body-parser");

var cors = require("cors");

var passport = require("passport");

var _require11 = require("./passport"),
    setupPassport = _require11.setupPassport;

var session = require("express-session");
/* cors: for example, if front-end sends request to back-end,
 * then front-end is cors (cross-origin requests),
 * and back-end is a cors receiver.
 * A cors reciever can choose to respond to specific cors,
 * and leave out the rest.
 * However, if the back-end initiate a request to another server,
 * e.g. Facebook server, then the back-end is a cors,
 * and Facebook is a cors receiver.
 * If Facebook respond anything back to back-end, then this
 * response is NOT a cors, and back-end accepts this response
 * without being regulated by this corsOptions.
 */


var whitelist = [FRONTEND_HOST];
var corsOptions = {
  origin: function origin(_origin, callback) {
    if (NODE_ENV === "development") {
      callback(null, true);
    } else {
      if (whitelist.indexOf(_origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    }
  },
  credentials: true
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(session({
  secret: "stock-project",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
setupPassport(passport);
/**
 * objVariables allow us to change variables inside the object by using
 * functions and passing in object as parameter
 */

var objVariables = {
  isMarketClosed: false,
  isAlreadyUpdateAllUsers: false,
  isPrismaMarketHolidaysInitialized: false
};
setInterval(deleteExpiredVerification, oneDay); // This function to help initialize prisma market holidays at first run

updateMarketHolidaysFromFMP(objVariables); // Update Market Holidays and Delete Market Holidays in Database that belong to last year (no longer needed)

setInterval(function () {
  return updateMarketHolidaysFromFMP(objVariables);
}, oneDay);
setInterval(deletePrismaMarketHolidays, oneDay); // Check if market closed to update users portfolio last closure

setInterval(function () {
  return checkAndUpdateAllUsers(objVariables);
}, oneSecond); // Update Cached Shares
// setInterval(() => updateCachedShareQuotesUsingCache(), 2 * oneSecond);
// setInterval(() => updateCachedShareProfilesUsingCache(), oneMinute);
// Update Ranking List after 10 minutes

updateRankingList();
setInterval(updateRankingList, 10 * oneMinute); // All app routes are written below this comment:
// APIs for Passport are listed below:

app.get("/auth/facebook", passport.authenticate("facebook", {
  scope: ["email"]
}));
app.get("/auth/facebook/callback", passport.authenticate("facebook", {
  successRedirect: "".concat(FRONTEND_HOST, "/"),
  failureRedirect: "".concat(FRONTEND_HOST, "/login")
}));
app.get("/auth/google", passport.authenticate("google", {
  scope: ["profile", "email"]
}));
app.get("/auth/google/callback", passport.authenticate("google", {
  successRedirect: "".concat(FRONTEND_HOST, "/"),
  failureRedirect: "".concat(FRONTEND_HOST, "/login")
}));
app.post("/auth/signup", function (req, res, next) {
  passport.authenticate("local-signup", function (err, user, info) {
    if (err) {
      return res.sendStatus(500);
    }

    if (user) {
      return res.status(401).send(info);
    }

    var email = info.email,
        password = info.password;
    /* month+1 because Date() counts month from 0 to 11, date+1 because
     * we want this verification token to expire the next day
     */

    var date = new Date();
    date = date.getMonth() + 1 + "/" + (date.getDate() + 1) + "/" + date.getFullYear(); // If there is no user, send verification email to sign up email!

    var file = new Promise(function (resolve, reject) {
      fs.readFile("./verificationHTML/verifyEmail.html", "utf8", function (err, data) {
        if (err) {
          reject(err);
        }

        console.log("read html file (verify email) successfully");
        resolve(data);
      });
    });
    var verificationToken = new Promise(function (resolve, reject) {
      prisma.userVerification.create({
        data: {
          email: email,
          password: password,
          expiredAt: date
        }
      }).then(function (res) {
        console.log("create verification successfully");
        resolve(res);
      })["catch"](function (err) {
        reject(err);
      });
    });
    Promise.all([file, verificationToken]).then(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          file = _ref2[0],
          verificationToken = _ref2[1];

      var PASSPORT_CALLBACK_HOST = getPassportCallbackHost(); // console.log(PASSPORT_CALLBACK_HOST);
      // file is a string of the html file, we replace substring {{ formAction }}
      // by the string 'something else'...

      file = file.replace("{{ formAction }}", "".concat(PASSPORT_CALLBACK_HOST, "/verification/").concat(verificationToken.id));
      var msg = {
        to: "".concat(email),
        from: "Bibliko <biblikoorg@gmail.com>",
        subject: "Email Verification",
        html: file
      };
      return sgMail.send(msg);
    }).then(function (emailVerification) {
      if (emailVerification) {
        var notification = {
          message: "Processing (Can take a while). Check your inboxes."
        };
        return res.status(202).send(notification);
      }
    })["catch"](function (err) {
      console.log(err);
      res.sendStatus(500);
    });
  })(req, res, next);
});
app.post("/auth/login", function (req, res, next) {
  passport.authenticate("local-login", function (err, user, info) {
    if (err) {
      return res.sendStatus(500);
    }

    if (!user) {
      return res.status(401).send(info);
    }

    req.logIn(user, function (err) {
      if (err) {
        return res.sendStatus(500);
      }

      return res.sendStatus(200);
    });
  })(req, res, next);
});
app.use("/user", function (req, res) {
  res.send(req.user);
});
app.get("/logout", function (req, res) {
  keysAsync("".concat(req.user.email, "*")).then(function (values) {
    console.log(values);

    if (!isEmpty(values)) {
      return delAsync(values);
    }
  }).then(function (numberOfKeysDeleted) {
    console.log("User Logout - Delete ".concat(numberOfKeysDeleted, " Redis Relating Keys\n"));
    req.logout();
    res.send("Successful");
  })["catch"](function (err) {
    console.log(err);
    res.sendStatus(500);
  });
}); // verification APIs are listed below:

app.get("/passwordVerification", function (req, res) {
  var email = req.query.email;
  var timestampNowOfRequest = Math.round(Date.now() / 1000);
  getParsedCachedPasswordVerificationCode(email).then(function (redisCachedCode) {
    if (!redisCachedCode) {
      var passwordVerificationCode = randomKey.generate(6);
      return Promise.all([cachePasswordVerificationCode(email, passwordVerificationCode), passwordVerificationCode]);
    }

    var timestamp = redisCachedCode.timestamp;

    if (timestampNowOfRequest < timestamp + 15) {
      res.status(429).send("Wait ".concat(timestamp + 15 - timestampNowOfRequest, "  seconds to send code again."));
    } else {
      var _passwordVerificationCode = randomKey.generate(6);

      return Promise.all([cachePasswordVerificationCode(email, _passwordVerificationCode), _passwordVerificationCode]);
    }
  }).then(function (resultArray) {
    if (resultArray) {
      var passwordVerificationCode = resultArray[1];
      return fs.readFile("./verificationHTML/verifyPassword.html", "utf8").then(function (dataHTML) {
        var htmlFile = dataHTML.replace("{{ verificationKey }}", passwordVerificationCode);
        var msg = {
          to: "".concat(email),
          from: "Bibliko <biblikoorg@gmail.com>",
          subject: "Password Reset Code",
          html: htmlFile
        }; // return mg.messages().send(msg);

        return sgMail.send(msg);
      })["catch"](function (err) {
        console.log(err);
        res.sendStatus(500);
      });
    }
  }).then(function (passwordVerificationCodeSent) {
    if (passwordVerificationCodeSent) {
      console.log("Sent password verification code for ".concat(email, "."));
      res.sendStatus(200);
    }
  })["catch"](function (err) {
    console.log(err);
    res.sendStatus(500);
  });
});
app.get("/checkPasswordVerificationCode", function (req, res) {
  var _req$query = req.query,
      email = _req$query.email,
      code = _req$query.code;
  getParsedCachedPasswordVerificationCode(email).then(function (redisCachedCode) {
    var secretCode = redisCachedCode.secretCode;

    if (code !== secretCode) {
      res.status(404).send("Your verification code does not match.");
    } else {
      res.sendStatus(200);
      return removeCachedPasswordVerificationCode(email);
    }
  })["catch"](function (err) {
    console.log(err);
    res.sendStatus(500);
  });
});
app.use("/verification/:tokenId", function (req, res) {
  var tokenId = req.params.tokenId;
  prisma.userVerification.findOne({
    where: {
      id: tokenId
    }
  }).then(function (token) {
    if (token) {
      return prisma.user.create({
        data: {
          email: token.email,
          password: token.password
        }
      });
    }

    var FRONTEND_HOST_HERE = getFrontendHost();
    res.redirect("".concat(FRONTEND_HOST_HERE, "/verificationFail"));
  }).then(function (newUser) {
    if (newUser) {
      var deletePromise = prisma.userVerification["delete"]({
        where: {
          id: tokenId
        }
      });
      return Promise.all([newUser, deletePromise]);
    }
  }).then(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
        newUser = _ref4[0],
        doneDelete = _ref4[1];

    if (doneDelete) {
      req.logIn(newUser, function (err) {
        if (err) {
          return res.sendStatus(500);
        }

        var FRONTEND_HOST_HERE = getFrontendHost();
        return res.redirect("".concat(FRONTEND_HOST_HERE, "/verificationSucceed"));
      });
    }
  })["catch"](function (err) {
    console.log(err);
    res.sendStatus(500);
  });
}); // other APIs

app.use("/userData", require("./routes/user"));
app.use("/marketHolidaysData", require("./routes/marketHolidays"));
app.use("/shareData", require("./routes/share"));
app.use("/redis", require("./routes/redis")); // set up socket.io server

var intervalCheckMarketClosed;
io.on("connection", function (socket) {
  console.log("New client connected"); // Join socket by user ID

  socket.on("userConnected", socket.join);
  socket.on("userDisconnected", socket.leave); // disconnect

  socket.on("disconnect", function () {
    console.log("Client disconnected");
    clearIntervals([intervalCheckMarketClosed]);
  });
  clearIntervalsIfIntervalsNotEmpty([intervalCheckMarketClosed]);
  intervalCheckMarketClosed = setInterval(function () {
    return checkMarketClosed(socket, objVariables);
  }, oneSecond);
}); // back-end server listen

server.listen(port, function () {
  console.log("server is listening on port ".concat(port, "\n"));
});