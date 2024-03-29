/**
 * Table of content of this file:
 * - 1st part: set up passport
 * - 2nd part: important intervals
 * - 3rd part: APIs for Passport
 * - 4th part: verification APIs
 * - 5th part: other APIs
 * - 6th part: socket
 */

const {
  oneSecond,
  oneMinute,
  oneHour,
  oneDay
} = require("./utils/low-dependency/DayTimeUtil");

const {
  excludeFromCors
} = require("./utils/low-dependency/NetworkUtil");

const {
  deleteExpiredVerification,
  checkAndUpdateAllUsers,
  updateRankingList
} = require("./utils/top-layer/UserUtil");

const {
  checkMarketClosed
} = require("./utils/top-layer/MainBackendIndexHelperUtil");

const { deletePrismaMarketHolidays } = require("./utils/MarketHolidaysUtil");

const {
  updateMarketHolidaysFromFMP
} = require("./utils/FinancialModelingPrepUtil");

const {
  SequentialPromisesWithResultsArray
} = require("./utils/low-dependency/PromisesUtil");

// TODO: Uncomment this in production
const {
  updateCachedShareQuotesUsingCache,
  updateCachedShareProfilesUsingCache
} = require("./utils/redis-utils/SharesInfoBank");

const {
  updateCompaniesRatingsList
} = require("./utils/PrismaCompanyRatingUtil");

const {
  getMostGainersAndCache,
  updateMostGainersDaily
} = require("./utils/redis-utils/MostGLA");

const {
  emptyPendingTransactionsListAllCompanies,
  addAllPendingTransactions,
  deleteAllPendingTransactions
} = require("./utils/redis-utils/PendingOrders");

const { startSocketIO } = require("./socketIO");

const {
  PORT,
  NODE_ENV,
  FRONTEND_HOST,
  REDIS_URL,
  SENDGRID_API_KEY
} = require('./config');
const express = require("express");
const app = express();
const { pick } = require("lodash");

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(SENDGRID_API_KEY);

const http = require("http");
const server = http.createServer(app);

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const passport = require("passport");
const { setupPassport } = require("./passport");
const session = require("express-session");

const redis = require("redis");
let RedisStore = require("connect-redis")(session);
let redisClient = redis.createClient(REDIS_URL);


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
      if (whitelist.indexOf(origin) !== -1 || (NODE_ENV === 'qa' && origin === undefined)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    }
  },
  credentials: true
};
const publicPaths = [
  "*/auth/google*",
  "*/auth/facebook*",
  "*/verificationSession/verification*"
];
const sessionOptions = {
  secret: "stock-project",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 86400000 } // 24 hours
};
if (NODE_ENV === "production") {
  sessionOptions.store = new RedisStore({ client: redisClient });
  sessionOptions.cookie.secure = true; // serve secure cookies over https
};

app.use(excludeFromCors(publicPaths, cors(corsOptions)));
app.use(cookieParser("stock-project"));
app.use(bodyParser.json());
app.set("trust proxy", 1);
app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());

setupPassport(passport);

/**
 * globalBackendVariables allow us to change variables inside the object by using
 * functions and passing in object as parameter
 */
var globalBackendVariables = {
  isMarketClosed: null, // init as null because we need to check if BE has checked marketCLosed or not
  isPrismaMarketHolidaysInitialized: false,

  hasReplacedAllExchangesHistoricalChart: false,
  hasUpdatedAllUsersToday: false,
  hasUpdatedMostGainersToday: false,

  updatedAllUsersFlag: false, // value true or false does not mean anything. This is just a flag
  updatedRankingListFlag: false, // value true or false does not mean anything. This is just a flag
  updatedMostGainersFlag: false
};

const tasksList = [];

// This function helps initialize prisma market holidays at first run
tasksList.push(() => updateMarketHolidaysFromFMP(globalBackendVariables));

tasksList.push(() => updateRankingList(globalBackendVariables));

tasksList.push(() => updateCompaniesRatingsList());

tasksList.push(() => getMostGainersAndCache(globalBackendVariables));

SequentialPromisesWithResultsArray(tasksList).catch((err) => console.log(err));

const setupBackendIntervals = () => {
  // Check Market Closed
  setInterval(
    () => {
      const previousMarketState = globalBackendVariables.isMarketClosed;
      checkMarketClosed(globalBackendVariables)
        .then(() => {
          // Delete all pending transactions when market is closed
          if (
            previousMarketState === false &&
            globalBackendVariables.isMarketClosed === true
          )
            return deleteAllPendingTransactions();
        })
        .then((res) => res && console.log(res))
        .catch(err => console.log(err));
    },
    oneSecond
  );

  setInterval(deleteExpiredVerification, oneDay);

  // Update Market Holidays and Delete Market Holidays in Database that belong to last year (no longer needed)
  setInterval(
    () => updateMarketHolidaysFromFMP(globalBackendVariables),
    oneDay
  );
  setInterval(deletePrismaMarketHolidays, oneDay);

  // TODO: Uncomment this in production
  // Update Cached Shares

  setInterval(() => {
    if(
      globalBackendVariables.isPrismaMarketHolidaysInitialized &&
      !globalBackendVariables.isMarketClosed
    ) {
      updateCachedShareQuotesUsingCache()
      .catch(err => console.log(err));
    }
  }, 10 * oneSecond);

  setInterval(() => {
    if(
      globalBackendVariables.isPrismaMarketHolidaysInitialized &&
      !globalBackendVariables.isMarketClosed
    ) {
      updateCachedShareProfilesUsingCache()
      .catch(err => console.log(err));
    }
  }, oneMinute);

  setInterval(() => updateMostGainersDaily(globalBackendVariables), oneSecond);

  // Change flag and update all users data in database
  setInterval(() => checkAndUpdateAllUsers(globalBackendVariables), oneSecond);

  // All Users Ranking List
  setInterval(() => updateRankingList(globalBackendVariables), 10 * oneMinute);

  // Update the companies' ratings
  // parameter: forceUpdate <Boolean>
  // If forceUpdate is true and system is in developer mode, does not need to call API.
  setInterval(() => updateCompaniesRatingsList(), oneDay);

  setInterval(
    () => {
      if (
        globalBackendVariables.isPrismaMarketHolidaysInitialized &&
        !globalBackendVariables.isMarketClosed
      ) {
        addAllPendingTransactions()
          .then((res) => console.log(res))
          .catch((err) => console.log(err));
      }
    },
    oneHour
  );

  // TODO: Uncomment this in production
  setInterval(
    () => {
      if (
        globalBackendVariables.isPrismaMarketHolidaysInitialized &&
        !globalBackendVariables.isMarketClosed
      ) {
        emptyPendingTransactionsListAllCompanies()
          .catch((err) => console.log(err));
      }
    },
    5 * oneMinute
  );
};

setupBackendIntervals();

// All app routes are written below this comment:

// APIs for Passport are listed below:

app.use("/auth", require("./routes/auth"));

app.use("/user", (req, res) => {
  res.send(req.user);
});

app.get("/logout", (req, res) => {
  req.logout();
  res.send("Successful");
});

// verification APIs are listed below:

// other APIs
app.use("/userData", require("./routes/user"));
app.use("/marketHolidaysData", require("./routes/marketHolidays"));
app.use("/shareData", require("./routes/share"));
app.use("/redis", require("./routes/redis"));
app.use("/verificationSession", require("./routes/verification"));
app.use("/companyRating", require("./routes/companyRating"));
app.use("/transaction", require("./routes/transaction"));
app.use("/fmp", require("./routes/financialModelingPrep"));

app.use("/getGlobalBackendVariablesFlags", (_, res) => {
  const flags = ["updatedAllUsersFlag", "updatedRankingListFlag"];
  const flagsResult = pick(globalBackendVariables, flags);
  res.send(flagsResult);
});

// set up socket.io server

// user id <-> hasSetupCache
startSocketIO(server, globalBackendVariables);

// back-end server listen
server.listen(PORT, () => {
  console.log(`server is listening on port ${PORT}\n`);
});
