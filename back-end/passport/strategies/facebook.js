const { PrismaClient } = require("@prisma/client");

const FacebookStrategy = require("passport-facebook").Strategy;
const prisma = new PrismaClient();
const {
  FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET,
  PASSPORT_CALLBACK_HOST
} = require('../../config');
// const { indices } = require('../../algolia');

const facebookStrategy = new FacebookStrategy(
  {
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: `${PASSPORT_CALLBACK_HOST}/auth/facebook/callback`,
    profileFields: [
      "id",
      "email",
      "gender",
      "link",
      "locale",
      "name",
      "timezone",
      "updated_time",
      "verified"
    ]
  },
  function (accessToken, refreshToken, profile, done) {
    const {
      id,
      email,
      first_name: firstName,
      last_name: lastName
    } = profile._json;

    if (!email) {
      return done(
        "Can't find user email from Facebook. Check user Facebook profile to see if user already sets up email on Facebook."
      );
    }

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
              avatarUrl: `https://graph.facebook.com/${id}/picture?type=normal`
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

module.exports = facebookStrategy;
