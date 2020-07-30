const { PrismaClient } = require("@prisma/client");
const LocalStrategy = require("passport-local").Strategy;
const prisma = new PrismaClient();

const loginStrategy = new LocalStrategy(
  {
    usernameField: "email"
  },
  (email, password, done) => {
    prisma.user
      .findOne({
        where: {
          email
        }
      })
      .then((user) => {
        if (!user) {
          return done(null, false, { message: "Incorrect email." });
        }
        if (user.password !== password) {
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, user);
      })
      .catch((err) => {
        return done(err);
      });
  }
);

module.exports = loginStrategy;
