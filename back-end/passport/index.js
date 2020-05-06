const facebookStrategy = require("./strategies/facebook");

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const setupPassport = (passport) => {
    passport.serializeUser(function(user, done) {
        done(null, user.email);
    });
      
    passport.deserializeUser(function(email, done) {
        prisma.user.findOne({
            where: {
                email
            },
        })
        .then(user => {
            done(null, user);
        })
        .catch(err => {
            done(err, null);
        });
    });

    passport.use(facebookStrategy);
}

module.exports = { setupPassport };