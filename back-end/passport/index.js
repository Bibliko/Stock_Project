const loginStrategy = require("./strategies/login");
const signupStrategy = require("./strategies/signup");
const facebookStrategy = require("./strategies/facebook");
const googleStrategy = require("./strategies/google");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const setupPassport = (passport) => {
  passport.serializeUser(function (user, done) {
    done(null, user.email);
  });

  passport.deserializeUser((email, done) => {
    prisma.user
      .findUnique({
        where: {
          email
        }
      })
      .then((user) => {
        done(null, user);
      })
      .catch((err) => {
        done(err, null);
      });
  });

  passport.use("local-login", loginStrategy);
  passport.use("local-signup", signupStrategy);
  passport.use(facebookStrategy);
  passport.use(googleStrategy);
};

module.exports = { setupPassport };
