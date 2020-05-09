try {
    require('./config/config');
} catch(err) {
    console.log("No config found. Using default ENV.");
}

const { 
    PORT:port,
    FRONTEND_HOST
} = process.env;
const express = require('express');
const app = express();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const { setupPassport } = require('./passport');
const session = require("express-session");

const corsOptions = {
    origin: [process.env.FRONTEND_HOST],
    credentials: true
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(session({ 
    secret: "stock-project",
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true
    }
}));
app.use(passport.initialize());
app.use(passport.session());

setupPassport(passport);

app.use((req, res, next) => {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', `${process.env.FRONTEND_HOST}`, "https://www.facebook.com");

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
    
});

// if (NODE_ENV === "production") {
//     // Serve static files from the React frontend app
//     app.use(express.static(path.join(__dirname, '../front-end/build')));
// }

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
        if (err) 
            return res.sendStatus(500); 

        if(user)
            return res.status(401).send(info);

        prisma.user.create({
            data: {
                username: info.username,
                password: info.password,
                name: info.username,
            }
        })
        .then(user => {
            req.logIn(user, (err) => {
                if(err) {
                    return err;
                }
                return res.sendStatus(200);
            });
        })
        .catch(err => {
            console.log(err);
            res.sendStatus(500);
        })
        
    })(req, res, next);
});

app.post('/auth/login', (req, res, next) => {
    passport.authenticate('local-login', (err, user, info) => {
        if (err) { 
            return res.sendStatus(500); 
        }
        if (!user) { 
            return res.status(401).send(info);
        }
        req.logIn(user, err => {
            if (err) { return res.sendStatus(500); }
            return res.sendStatus(200);
        });
    })(req, res, next);
})

app.use('/user', (req, res) => {
    console.log(req.user);
    console.log(req.cookies);
    console.log(req.session);
    res.send(req.user);
});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect(`${FRONTEND_HOST}/`);
});

// if (NODE_ENV === "production") {
//     // AFTER defining routes: Anything that doesn't match what's above, send back index.html; (the beginning slash ('/') in the string is important!)
//     app.get('*', (req, res) => {
//         res.sendFile(path.join(__dirname + '/../front-end/build/index.html'))
//     })
// }

app.listen(port, () => {
    console.log(`app is listening on port ${port}`);
});
