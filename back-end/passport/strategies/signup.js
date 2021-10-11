const { prisma } = require("../../utils/low-dependency/PrismaClient");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require('bcrypt');

const saltRounds = 8;

// const mailgun = require("mailgun-js");
// const DOMAIN = 'minecommand.us';
// const mg = mailgun({apiKey: process.env.MAILGUN_API_KEY, domain: DOMAIN});

/* Verification flow:
 * - Create VerificationToken
 * - Send Email to verify
 * - If verify -> create new user
 * - If not -> don't create new user, the token eventually expires.
 */

const signupStrategy = new LocalStrategy(
  {
    usernameField: "email"
  },
  (email, password, done) => {
    console.log(email);
    prisma.user
      .findUnique({
        where: {
          email
        }
      })
      .then((user) => {
        if (user)
          return done(null, user, { message: "User with this email already exists." });

        return bcrypt.hash(password, saltRounds)
          .then((hashedPassword) => {
            return done(null, false, { email, hashedPassword });
          });
      })
      .catch((err) => {
        console.log(err);
        return done(err);
      });
  }
);

module.exports = signupStrategy;
