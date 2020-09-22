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

const {
  getPassportCallbackHost
} = require("./utils/low-dependency/NetworkUtil");

const {
  oneSecond,
  oneDay,
  oneMinute,
  // clearIntervals,
  clearIntervalsIfIntervalsNotEmpty
} = require("./utils/low-dependency/DayTimeUtil");

const {
  deleteExpiredVerification,
  checkAndUpdateAllUsers,
  updateRankingList
} = require("./utils/top-layer/UserUtil");

const {
  checkMarketClosedString,
  updatedAllUsersFlag,
  updatedRankingListFlag
} = require("./utils/top-layer/SocketUtil");

const {
  checkMarketClosed
} = require("./utils/top-layer/MainBackendIndexHelperUtil");

const { deletePrismaMarketHolidays } = require("./utils/MarketHolidaysUtil");

const {
  updateMarketHolidaysFromFMP
} = require("./utils/FinancialModelingPrepUtil");

const { cleanUserCache } = require("./utils/redis-utils/RedisUtil");

/*
const {
  updateCachedShareQuotesUsingCache,
  updateCachedShareProfilesUsingCache
} = require("./utils/redis-utils/SharesInfoBank");
*/

const { PORT: port, NODE_ENV, FRONTEND_HOST, SENDGRID_API_KEY } = process.env;
const express = require("express");
const app = express();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { pick } = require("lodash");

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(SENDGRID_API_KEY);

const fs = require("fs-extra");

const http = require("http");
const server = http.createServer(app);
const socketIO = require("socket.io");
const io = socketIO(server);

const bodyParser = require("body-parser");
const cors = require("cors");
const passport = require("passport");
const { setupPassport } = require("./passport");
const session = require("express-session");

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

const whitelist = [FRONTEND_HOST];
const corsOptions = {
  origin: function (origin, callback) {
    if (NODE_ENV === "development") {
      callback(null, true);
    } else {
      if (whitelist.indexOf(origin) !== -1) {
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
app.use(
  session({
    secret: "stock-project",
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());

setupPassport(passport);

/**
 * globalBackendVariables allow us to change variables inside the object by using
 * functions and passing in object as parameter
 */
var globalBackendVariables = {
  isMarketClosed: false,
  hasUpdatedAllUsersToday: false,
  isPrismaMarketHolidaysInitialized: false,

  updatedAllUsersFlag: false, // value true or false does not mean anything. This is just a flag
  updatedRankingListFlag: false // value true or false does not mean anything. This is just a flag
};

setInterval(deleteExpiredVerification, oneDay);

// This function to help initialize prisma market holidays at first run
updateMarketHolidaysFromFMP(globalBackendVariables);

// Update Market Holidays and Delete Market Holidays in Database that belong to last year (no longer needed)
setInterval(() => updateMarketHolidaysFromFMP(globalBackendVariables), oneDay);
setInterval(deletePrismaMarketHolidays, oneDay);

// Check Market Closed
setInterval(() => checkMarketClosed(globalBackendVariables), oneSecond);

/* 
Check if market closed to update users portfolio last closure.
This interval will be moved to socket at the end of this file.
*/
setInterval(() => checkAndUpdateAllUsers(globalBackendVariables), oneSecond);

/*
Update Ranking List after 10 minutes
This interval will be moved to socket at the end of this file.
*/
updateRankingList(globalBackendVariables);
setInterval(() => updateRankingList(globalBackendVariables), 10 * oneMinute);

/*
Update Cached Shares
setInterval(() => updateCachedShareQuotesUsingCache(), 2 * oneSecond);
setInterval(() => updateCachedShareProfilesUsingCache(), oneMinute);
*/

// All app routes are written below this comment:

// APIs for Passport are listed below:

app.get(
  "/auth/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);
app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: `${FRONTEND_HOST}/`,
    failureRedirect: `${FRONTEND_HOST}/login`
  })
);

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: `${FRONTEND_HOST}/`,
    failureRedirect: `${FRONTEND_HOST}/login`
  })
);

app.post("/auth/signup", (req, res, next) => {
  passport.authenticate("local-signup", (err, user, info) => {
    if (err) {
      return res.sendStatus(500);
    }

    if (user) {
      return res.status(401).send(info);
    }

    const { email, password } = info;

    /* month+1 because Date() counts month from 0 to 11, date+1 because
     * we want this verification token to expire the next day
     */
    let date = new Date();
    date =
      date.getMonth() +
      1 +
      "/" +
      (date.getDate() + 1) +
      "/" +
      date.getFullYear();

    // If there is no user, send verification email to sign up email!

    const file = new Promise((resolve, reject) => {
      fs.readFile(
        "./verificationHTML/verifyEmail.html",
        "utf8",
        (err, data) => {
          if (err) {
            reject(err);
          }
          console.log("read html file (verify email) successfully");
          resolve(data);
        }
      );
    });

    const verificationToken = new Promise((resolve, reject) => {
      prisma.userVerification
        .create({
          data: {
            email,
            password,
            expiredAt: date
          }
        })
        .then((res) => {
          console.log("create verification successfully");
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });

    Promise.all([file, verificationToken])
      .then(([file, verificationToken]) => {
        const PASSPORT_CALLBACK_HOST = getPassportCallbackHost();
        // console.log(PASSPORT_CALLBACK_HOST);

        // file is a string of the html file, we replace substring {{ formAction }}
        // by the string 'something else'...
        file = file.replace(
          "{{ formAction }}",
          `${PASSPORT_CALLBACK_HOST}/verificationSession/verification/${verificationToken.id}`
        );

        const msg = {
          to: `${email}`,
          from: "Bibliko <biblikoorg@gmail.com>",
          subject: "Email Verification",
          html: file
        };
        return sgMail.send(msg);
      })
      .then((emailVerification) => {
        if (emailVerification) {
          const notification = {
            message:
              "Processing (Can take a while). Check your inboxes... and spams."
          };
          return res.status(202).send(notification);
        }
      })
      .catch((err) => {
        console.log(err);
        res.sendStatus(500);
      });
  })(req, res, next);
});

app.post("/auth/login", (req, res, next) => {
  passport.authenticate("local-login", (err, user, info) => {
    if (err) {
      return res.sendStatus(500);
    }

    if (!user) {
      return res.status(401).send(info);
    }

    req.logIn(user, (err) => {
      if (err) {
        return res.sendStatus(500);
      }

      return res.sendStatus(200);
    });
  })(req, res, next);
});

app.use("/user", (req, res) => {
  res.send(req.user);
});

app.get("/logout", (req, res) => {
  cleanUserCache(req.user.email)
    .then((successful) => {
      req.logout();
      res.send("Successful");
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});

// verification APIs are listed below:

// other APIs
app.use("/userData", require("./routes/user"));
app.use("/marketHolidaysData", require("./routes/marketHolidays"));
app.use("/shareData", require("./routes/share"));
app.use("/redis", require("./routes/redis"));
app.use("/verificationSession", require("./routes/verification"));

app.use("/getGlobalBackendVariablesFlags", (_, res) => {
  const flags = ["updatedAllUsersFlag", "updatedRankingListFlag"];
  const flagsResult = pick(globalBackendVariables, flags);
  res.send(flagsResult);
});

// set up socket.io server

io.on("connection", (socket) => {
  console.log("New client connected\n");

  let intervalSendMarketClosed = null;
  let intervalSendUpdatedAllUsersFlag = null;
  let intervalSendUpdatedRankingListFlag = null;

  // Join socket by user ID
  socket.on("userConnected\n", socket.join);
  socket.on("userDisconnected\n", socket.leave);

  // disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected\n");
  });

  clearIntervalsIfIntervalsNotEmpty([
    intervalSendMarketClosed,
    intervalSendUpdatedAllUsersFlag,
    intervalSendUpdatedRankingListFlag
  ]);

  intervalSendMarketClosed = setInterval(() => {
    socket.emit(checkMarketClosedString, globalBackendVariables.isMarketClosed);
  }, oneSecond);

  intervalSendUpdatedAllUsersFlag = setInterval(() => {
    socket.emit(
      updatedAllUsersFlag,
      globalBackendVariables.updatedAllUsersFlag
    );
  }, oneSecond);

  intervalSendUpdatedRankingListFlag = setInterval(() => {
    socket.emit(
      updatedRankingListFlag,
      globalBackendVariables.updatedRankingListFlag
    );
  }, oneSecond);
});

// back-end server listen
server.listen(port, () => {
  console.log(`server is listening on port ${port}\n`);
});
