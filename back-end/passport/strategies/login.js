const { prisma } = require("../../utils/low-dependency/PrismaClient");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require('bcrypt');

const loginStrategy = new LocalStrategy(
  {
    usernameField: "email"
  },
  (email, password, done) => {
    prisma.user
      .findUnique({
        where: {
          email
        }
      })
      .then((user) => {
        if (!user) {
          return done(null, false, { message: "Incorrect email." });
        }

        return bcrypt.compare(password, user.password)
          .then((res) => {
            if (!res) {
              return done(null, false, { message: "Incorrect password." });
            }
            return done(null, user);
          });
      })
      .catch((err) => {
        return done(err);
      });
  }
);

module.exports = loginStrategy;
