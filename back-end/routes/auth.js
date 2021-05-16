const {
  getPassportCallbackHost
} = require("../utils/low-dependency/NetworkUtil");

const { FRONTEND_HOST, SENDGRID_API_KEY } = require('../config');

const { Router } = require("express");
const router = Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const passport = require("passport");
const fs = require("fs-extra");

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(SENDGRID_API_KEY);

router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: `${FRONTEND_HOST}/`,
    failureRedirect: `${FRONTEND_HOST}/login`
  })
);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: `${FRONTEND_HOST}/`,
    failureRedirect: `${FRONTEND_HOST}/login`
  })
);

router.post("/signup", (req, res, next) => {
  passport.authenticate("local-signup", (err, user, info) => {
    if (err) {
      return res.sendStatus(500);
    }

    if (user) {
      return res.status(401).send(info);
    }

    const { email, password } = info;

    /* month+1 because Date() counts month from 0 to 11, date+1 because
     * we want this verification token to expire the next day
     */
    let date = new Date();
    date =
      date.getMonth() +
      1 +
      "/" +
      (date.getDate() + 1) +
      "/" +
      date.getFullYear();

    // If there is no user, send verification email to sign up email!

    const file = new Promise((resolve, reject) => {
      fs.readFile(
        "./verificationHTML/verifyEmail.html",
        "utf8",
        (err, data) => {
          if (err) {
            reject(err);
          }
          console.log("read html file (verify email) successfully");
          resolve(data);
        }
      );
    });

    const verificationToken = new Promise((resolve, reject) => {
      prisma.userVerification
        .create({
          data: {
            email,
            password,
            expiredAt: date
          }
        })
        .then((res) => {
          console.log("create verification successfully");
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });

    Promise.all([file, verificationToken])
      .then(([file, verificationToken]) => {
        const PASSPORT_CALLBACK_HOST = getPassportCallbackHost();
        // console.log(PASSPORT_CALLBACK_HOST);

        // file is a string of the html file, we replace substring {{ formAction }}
        // by the string 'something else'...
        file = file.replace(
          "{{ formAction }}",
          `${PASSPORT_CALLBACK_HOST}/verificationSession/verification/${verificationToken.id}`
        );

        const msg = {
          to: `${email}`,
          from: "Bibliko <biblikoorg@gmail.com>",
          subject: "Email Verification",
          html: file
        };
        return sgMail.send(msg);
      })
      .then((emailVerification) => {
        if (emailVerification) {
          const notification = {
            message:
              "Processing (Can take a while). Check your inboxes... and spams."
          };
          return res.status(202).send(notification);
        }
      })
      .catch((err) => {
        console.log(err);
        res.sendStatus(500);
      });
  })(req, res, next);
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local-login", (err, user, info) => {
    if (err) {
      return res.sendStatus(500);
    }

    if (!user) {
      return res.status(401).send(info);
    }

    req.logIn(user, (err) => {
      if (err) {
        return res.sendStatus(500);
      }

      return res.sendStatus(200);
    });
  })(req, res, next);
});

module.exports = router;
