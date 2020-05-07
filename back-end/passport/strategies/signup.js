const { PrismaClient } = require('@prisma/client');
const LocalStrategy = require('passport-local').Strategy;
const prisma = new PrismaClient();

const signupStrategy = new LocalStrategy(
    (username, password, done) => {
        prisma.user.findOne({
            where: {
                username 
            }
        })
        .then(user => {
            if (user) {
                return done(null, user, { message: "User with this username already exists." }); 
            }

            return done(null, false, { username, password });
        })
        .catch(err => {
            console.log(err);
            return done(err);
        })
    }
);

module.exports = signupStrategy;