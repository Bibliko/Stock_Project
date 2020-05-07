try {
    require('./config/config');
} catch(err) {
    console.log("No config found. Using default ENV.");
}

const { 
    PORT: port,
} = process.env;
const express = require('express');
const app = express();
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();

const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const { setupPassport } = require('./passport');
const session = require("express-session");

app.use(cors());
app.use(session({ 
    secret: "stock-project",
    resave: false,
    saveUninitialized: false
}));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

setupPassport(passport);

app.use((req, res, next) => {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000'/*, 'https://obscure-badlands-88487.herokuapp.com/'*/);

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

app.get('/auth/facebook', passport.authenticate('facebook', { scope: ["email"] }));
app.get('/auth/facebook/callback', 
    passport.authenticate('facebook', { 
        successRedirect: '/',
        failureRedirect: '/login' 
    })
);

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/login'
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
    res.send(req.user);
});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`app is listening on port ${port}`);
});
