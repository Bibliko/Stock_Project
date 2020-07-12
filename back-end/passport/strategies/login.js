const { PrismaClient } = require('@prisma/client');
const LocalStrategy = require('passport-local').Strategy;
const prisma = new PrismaClient();

const {SHA3} = require('sha3');
const {isEqual} = require('lodash');

const loginStrategy = new LocalStrategy({
        usernameField: 'email',
    },
    (email, password, done) => {
        prisma.user.findOne({
            where: {
                email
            }
        })
        .then(user => {
            if (!user) { return done(null, false, { message: "Incorrect email." }); }

	    const hash1 = new SHA3(256);
	    hash1.update(user.password);
	    const hash2 = new SHA3(256);
	    hash2.update(password);

            if (!isEqual(hash1.digest('hex'), hash2.digest('hex')) { 
                return done(null, false, { message: "Incorrect password." })
            }
            return done(null, user);
        })
        .catch(err => {
            return done(err);
        })
    }
);

module.exports = loginStrategy;
