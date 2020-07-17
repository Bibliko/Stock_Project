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
    require('./config/config');
} catch(err) {
    console.log("No config found. Using default ENV.");
}

const { 
    PORT:port,
    FRONTEND_HOST,
    //MAILGUN_API_KEY,
    SENDGRID_API_KEY
} = process.env;
const express = require('express');
const app = express();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// const mailgun = require("mailgun-js");
// const DOMAIN = 'minecommand.us';
// const mg = mailgun({apiKey: MAILGUN_API_KEY, domain: DOMAIN});

const {
    oneSecond, 
    oneMinute,
    oneDay,
    clearIntervals,
    clearIntervalsIfIntervalsNotEmpty,
} = require('./utils/DayTimeUtil');

const {
    deleteExpiredVerification,
    checkAndUpdatePortfolioLastClosure
} = require('./utils/UserUtil');

const {
    checkStockQuotesForUser,
} = require('./utils/SocketUtil');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(SENDGRID_API_KEY);

const fs = require('fs-extra');
const randomKey = require('random-key');
let passwordVerificationCode = "";

const http = require('http');
const server = http.createServer(app);
const socketIO = require('socket.io');
const io = socketIO(server);

const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const { setupPassport } = require('./passport');
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
app.use(session({ 
    secret: "stock-project",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

setupPassport(passport);

// important timers and intervals
var intervalForDeleteVerification;
var intervalForUpdatePortfolioLastClosure;
var timerForSendCodeVerifyingPassword;

intervalForDeleteVerification = setInterval(
    deleteExpiredVerification, 
    oneDay
);

/**
 * objVariables allow us to change variables inside the object by using 
 * functions and passing in object as parameter
 */
var objVariables = {
    isMarketClosed: false,
    isAlreadyUpdatePortfolioLastClosure: false,
};

intervalForUpdatePortfolioLastClosure = setInterval(
    checkAndUpdatePortfolioLastClosure.bind(this, objVariables),
    oneSecond
);


// All app routes are written below this comment:

// APIs for Passport are listed below:

app.get('/auth/facebook', passport.authenticate('facebook', { scope: ["email"] }));
app.get('/auth/facebook/callback', 
    passport.authenticate('facebook', { 
        successRedirect: `${FRONTEND_HOST}/`,
        failureRedirect: `${FRONTEND_HOST}/login` 
    })
);

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: `${FRONTEND_HOST}/`,
        failureRedirect: `${FRONTEND_HOST}/login` 
    })
);

app.post('/auth/signup', (req, res, next) => {
    passport.authenticate('local-signup', (err, user, info) => {
        if(err) {
            return res.sendStatus(500); 
        }

        if(user) {
            return res.status(401).send(info);
        }

        return res.status(202).send(info);
        
    })(req, res, next);
});

app.post('/auth/login', (req, res, next) => {
    passport.authenticate('local-login', (err, user, info) => {
        if(err) { 
            return res.sendStatus(500); 
        }
        
        if(!user) { 
            return res.status(401).send(info);
        }

        req.logIn(user, err => {
            if(err) { 
                return res.sendStatus(500); 
            }
            return res.sendStatus(200);
        });
    })(req, res, next);
})

app.use('/user', (req, res) => {
    res.send(req.user);
});

app.get('/logout', (req, res) => {
    req.logout();
    res.send("Successful");
});

// verification APIs are listed below:

app.get('/passwordVerification', (req, res) => {
    if(
        timerForSendCodeVerifyingPassword &&
        timerForSendCodeVerifyingPassword._idleTimeout > -1
    ) {
        console.log(timerForSendCodeVerifyingPassword);
        return res.status(429).send(`Wait ${timerForSendCodeVerifyingPassword._idleTimeout/1000} seconds to send code again.`);
    }

    passwordVerificationCode = randomKey.generate(6);
    fs.readFile('./verificationHTML/verifyPassword.html', 'utf8') 
    .then(data => {
        const htmlFile = data.replace("{{ verificationKey }}", passwordVerificationCode);

        const msg = {
            to: `${req.query.email}`,
            from: 'Bibliko <biblikoorg@gmail.com>',
            subject: 'Password Reset Code',
            html: htmlFile,
        };
    
        // return mg.messages().send(msg);
        return sgMail.send(msg);
    })
    .then(() => {
        console.log("Code for password recovery has been sent.");

        timerForSendCodeVerifyingPassword = setTimeout(
            () => {
                clearTimeout(timerForSendCodeVerifyingPassword);
            }, 
            15 * oneSecond
        );

        res.sendStatus(200);
    })
    .catch(err => {
        console.log(err);
    })
})

app.get('/checkVerificationCode', (req, res) => {
    const { code } = req.query;
    if(code!==passwordVerificationCode) {
        res.status(404).send("Your verification code does not match.");
    }
    else {
        res.sendStatus(200);
    }
})

app.use('/verification/:tokenId', (req, res) => {
    const tokenId = req.params.tokenId;
    prisma.userVerification.findOne({
        where: {
            id: tokenId
        }
    })
    .then(token => {
        if(token) {
            return prisma.user.create({
                data: {
                    name: token.email,
                    email: token.email,
                    password: token.password,
                }
            })
        }
        res.redirect(`${FRONTEND_HOST}/verificationFail`);
        return;
    })
    .then(newUser => {
        if(newUser) {
            /** 
             * newUser.objectID = newUser.id;
             * indices.users_index.saveObject(newUser, {
             *    autoGenerateObjectIDIfNotExist: true,
             * });
             */

            const deletePromise = prisma.userVerification.delete({
                where: {
                    id: tokenId
                }
            })

            return Promise.all([newUser, deletePromise]);
        }
    })
    .then(([newUser, doneDelete]) => {
        if(doneDelete) {
            req.logIn(newUser, err => {
                if (err) { 
                    return res.sendStatus(500); 
                }
                return res.redirect(`${FRONTEND_HOST}/verificationSucceed`);
            });
        }
    })
    .catch(err => {
        console.log(err);
    })
})

// other APIs
app.use('/userData', require('./routes/user'));


// set up socket.io server
var intervalCheckStockQuotesForUser;
var userData;

io.on("connection", (socket) => {
    console.log("New client connected");

    // Get user data from front-end: Main/AccountSummary
    socket.on("setupUserInformation", (data) => {
        userData = data;
    })

    clearIntervalsIfIntervalsNotEmpty([
        intervalCheckStockQuotesForUser,
    ]);

    /** 
     * For now, every 10 sec, check all prices of stock for user and update.
     * If market closed, checkStockQuotesForUser return null
     */
    intervalCheckStockQuotesForUser = setInterval(() => 
        checkStockQuotesForUser(socket, userData), 
        10 * oneSecond
        //20 * oneSecond // For Testing
    );

    // disconnect
    socket.on("disconnect", () => {
        console.log("Client disconnected");
        clearIntervals([
            intervalCheckStockQuotesForUser,
        ]);
    });
});


// back-end server listen
server.listen(port, () => {
    console.log(`server is listening on port ${port}`);
});
