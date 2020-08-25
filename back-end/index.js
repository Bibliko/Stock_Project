/**
 * Table of content of this file:
 * - 1st part: set up passport
 * - 2nd part: important timers and intervals
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

const { PORT: port, FRONTEND_HOST, SENDGRID_API_KEY } = process.env;
const express = require("express");
const app = express();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { keysAsync, delAsync } = require("./redis/redis-client");

const {
  getFrontendHost,
  getPassportCallbackHost
} = require("./utils/NetworkUtil");

const {
  oneSecond,
  oneDay,
  oneMinute,
  clearIntervals,
  clearIntervalsIfIntervalsNotEmpty
} = require("./utils/DayTimeUtil");

const {
  deleteExpiredVerification,
  checkAndUpdateAllUsers,
  updateRankingList
} = require("./utils/UserUtil");

const { checkMarketClosed } = require("./utils/SocketUtil");

const { deletePrismaMarketHolidays } = require("./utils/MarketHolidaysUtil");

const {
  updateMarketHolidaysFromFMP
} = require("./utils/FinancialModelingPrepUtil");

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(SENDGRID_API_KEY);

const fs = require("fs-extra");
const randomKey = require("random-key");
let passwordVerificationCode = "";

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
const corsOptions = {
  origin: FRONTEND_HOST,
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

// important timers and intervals
var timerForSendCodeVerifyingPassword;

/**
 * objVariables allow us to change variables inside the object by using
 * functions and passing in object as parameter
 */
var objVariables = {
  isMarketClosed: false,
  isAlreadyUpdateAllUsers: false,
  isPrismaMarketHolidaysInitialized: false
};

setInterval(deleteExpiredVerification, oneDay);

// This function to help initialize prisma market holidays at first run
updateMarketHolidaysFromFMP(objVariables);

setInterval(() => updateMarketHolidaysFromFMP(objVariables), oneDay);

setInterval(deletePrismaMarketHolidays, oneDay);

setInterval(() => checkAndUpdateAllUsers(objVariables), oneSecond);

// Update RankingList after 10 minutes
updateRankingList();
setInterval(updateRankingList, 10 * oneMinute);

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
          `${PASSPORT_CALLBACK_HOST}/verification/${verificationToken.id}`
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
            message: "Processing (Can take a while). Check your inboxes."
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
  keysAsync(`${req.user.email}*`)
    .then((values) => {
      console.log(values);
      return delAsync(values);
    })
    .then((numberOfKeysDeleted) => {
      console.log(
        `User Logout - Delete ${numberOfKeysDeleted} Redis Relating Keys`
      );
      req.logout();
      res.send("Successful");
    })
    .catch((err) => {
      console.log(err);
    });
});

// verification APIs are listed below:

app.get("/passwordVerification", (req, res) => {
  if (
    timerForSendCodeVerifyingPassword &&
    timerForSendCodeVerifyingPassword._idleTimeout > -1
  ) {
    console.log(timerForSendCodeVerifyingPassword);
    return res
      .status(429)
      .send(
        `Wait ${
          timerForSendCodeVerifyingPassword._idleTimeout / 1000
        } seconds to send code again.`
      );
  }

  passwordVerificationCode = randomKey.generate(6);
  fs.readFile("./verificationHTML/verifyPassword.html", "utf8")
    .then((data) => {
      const htmlFile = data.replace(
        "{{ verificationKey }}",
        passwordVerificationCode
      );

      const msg = {
        to: `${req.query.email}`,
        from: "Bibliko <biblikoorg@gmail.com>",
        subject: "Password Reset Code",
        html: htmlFile
      };

      // return mg.messages().send(msg);
      return sgMail.send(msg);
    })
    .then(() => {
      console.log("Code for password recovery has been sent.");

      timerForSendCodeVerifyingPassword = setTimeout(() => {
        clearTimeout(timerForSendCodeVerifyingPassword);
      }, 15 * oneSecond);

      res.sendStatus(200);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/checkVerificationCode", (req, res) => {
  const { code } = req.query;
  if (code !== passwordVerificationCode) {
    res.status(404).send("Your verification code does not match.");
  } else {
    res.sendStatus(200);
  }
});

app.use("/verification/:tokenId", (req, res) => {
  const tokenId = req.params.tokenId;
  prisma.userVerification
    .findOne({
      where: {
        id: tokenId
      }
    })
    .then((token) => {
      if (token) {
        return prisma.user.create({
          data: {
            email: token.email,
            password: token.password
          }
        });
      }

      const FRONTEND_HOST_HERE = getFrontendHost();

      res.redirect(`${FRONTEND_HOST_HERE}/verificationFail`);
    })
    .then((newUser) => {
      if (newUser) {
        const deletePromise = prisma.userVerification.delete({
          where: {
            id: tokenId
          }
        });

        return Promise.all([newUser, deletePromise]);
      }
    })
    .then(([newUser, doneDelete]) => {
      if (doneDelete) {
        req.logIn(newUser, (err) => {
          if (err) {
            return res.sendStatus(500);
          }

          const FRONTEND_HOST_HERE = getFrontendHost();

          return res.redirect(`${FRONTEND_HOST_HERE}/verificationSucceed`);
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

// other APIs
app.use("/userData", require("./routes/user"));
app.use("/marketHolidaysData", require("./routes/marketHolidays"));
app.use("/shareData", require("./routes/share"));
app.use("/redis", require("./routes/redis"));

// set up socket.io server
var intervalCheckMarketClosed;

io.on("connection", (socket) => {
  console.log("New client connected");

  // Join socket by user ID
  socket.on("userConnected", socket.join);
  socket.on("userDisconnected", socket.leave);

  // disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearIntervals([intervalCheckMarketClosed]);
  });

  clearIntervalsIfIntervalsNotEmpty([intervalCheckMarketClosed]);

  intervalCheckMarketClosed = setInterval(
    () => checkMarketClosed(socket, objVariables),
    oneSecond
  );
});

// back-end server listen
server.listen(port, () => {
  console.log(`server is listening on port ${port}`);
});
