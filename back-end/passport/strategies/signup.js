// @flow

const { PrismaClient } = require("@prisma/client");
const LocalStrategy = require("passport-local").Strategy;
const prisma = new PrismaClient();

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
      .findOne({
        where: {
          email
        }
      })
      .then((user) => {
        if (user) {
          done(null, user, { message: "User with this email already exists." });
        } else {
          done(null, false, { email, password });
        }
      })
      .catch((err) => {
        console.log(err);
        return done(err);
      });
  }
);

module.exports = signupStrategy;
