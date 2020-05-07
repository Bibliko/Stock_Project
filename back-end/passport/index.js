const _ = require('lodash');

const loginStrategy = require("./strategies/login");
const signupStrategy = require("./strategies/signup");
const facebookStrategy = require("./strategies/facebook");
const googleStrategy = require("./strategies/google");

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const setupPassport = (passport) => {
    passport.serializeUser(function(user, done) {
        if(!_.isEmpty(user.email)) {
            done(null, [user.email, "email"]);
        }
        else //user.username
            done(null, [user.username, "username"]);
    });
      
    passport.deserializeUser(function([userKey, type], done) {
        if(type==="email")
            prisma.user.findOne({
                where: {
                    email: userKey
                },
            })
            .then(user => {
                done(null, user);
            })
            .catch(err => {
                done(err, null);
            });
        else //type==="username"
            prisma.user.findOne({
                where: {
                    username: userKey
                },
            })
            .then(user => {
                done(null, user);
            })
            .catch(err => {
                done(err, null);
            });
    });

    passport.use('local-login', loginStrategy);
    passport.use('local-signup', signupStrategy);
    passport.use(facebookStrategy);
    passport.use(googleStrategy);
}

module.exports = { setupPassport };