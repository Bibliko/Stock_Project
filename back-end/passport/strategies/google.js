const { prisma } = require("../../utils/low-dependency/PrismaClient");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const { indices } = require('../../algolia');

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  PASSPORT_CALLBACK_HOST
} = require('../../config');

const googleStrategy = new GoogleStrategy(
  {
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: `${PASSPORT_CALLBACK_HOST}/auth/google/callback`
  },
  function (token, tokenSecret, profile, done) {
    const {
      given_name: firstName,
      family_name: lastName,
      picture,
      email
    } = profile._json;

    prisma.user
      .findUnique({
        where: {
          email
        }
      })
      .then((user) => {
        if (user) {
          done(null, user);
          return null;
        } else {
          return prisma.user.create({
            data: {
              firstName,
              lastName,
              email,
              password: "",
              avatarUrl: picture
            }
          });
        }
      })
      .then((newUser) => {
        // if (newUser) {
        //     newUser.objectID = newUser.id;
        //     indices.users_index.saveObject(newUser, {
        //         autoGenerateObjectIDIfNotExist: true,
        //     });
        //     done(null, newUser);
        //     return null;
        // }
        if (newUser) {
          done(null, newUser);
          return null;
        }
      })
      .catch((err) => {
        return done(err);
      });
  }
);

module.exports = googleStrategy;
