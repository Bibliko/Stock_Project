const { SENDGRID_API_KEY } = require('../config');
const { Router } = require("express");
const router = Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const fs = require("fs-extra");
const randomKey = require("random-key");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(SENDGRID_API_KEY);

const { getFrontendHost } = require("../utils/low-dependency/NetworkUtil");

const {
  cacheVerificationCode,
  getParsedCachedVerificationCode,
  removeCachedVerificationCode,
  passwordVerification,
  changeEmailVerification
} = require("../utils/redis-utils/RedisUtil");
const { oneSecond } = require("../utils/low-dependency/DayTimeUtil");

const passwordVerificationMailTopic = "Recovering Your Password";
const changeEmailVerificationMailTopic = "Changing Your Email";

router.get("/sendVerificationCode", (req, res) => {
  // credententialNeedVerication: "password" / "email"
  const { email, credentialNeedVerification } = req.query;
  const timestampNowOfRequest = new Date().getTime();

  const verificationCacheKey =
    credentialNeedVerification === "password"
      ? passwordVerification
      : changeEmailVerification;

  const verificationTopic =
    credentialNeedVerification === "password"
      ? passwordVerificationMailTopic
      : changeEmailVerificationMailTopic;

  getParsedCachedVerificationCode(email, verificationCacheKey)
    .then((redisCachedCode) => {
      if (!redisCachedCode) {
        const verificationCode = randomKey.generateDigits(6);
        return Promise.all([
          cacheVerificationCode(email, verificationCode, verificationCacheKey),
          verificationCode,
          verificationTopic
        ]);
      }

      const { timestamp } = redisCachedCode;
      if (timestampNowOfRequest < timestamp + 15 * oneSecond) {
        res
          .status(429)
          .send(
            `Wait ${Math.round(
              (timestamp + 15 * oneSecond - timestampNowOfRequest) / 1000
            )}  seconds to send code again.`
          );
      } else {
        const verificationCode = randomKey.generateDigits(6);
        return Promise.all([
          cacheVerificationCode(email, verificationCode, verificationCacheKey),
          verificationCode,
          verificationTopic
        ]);
      }
    })
    .then((resultArray) => {
      if (resultArray) {
        const verificationCode = resultArray[1];
        const verificationTopic = resultArray[2];

        return fs
          .readFile("./verificationHTML/verificationCode.html", "utf8")
          .then((dataHTML) => {
            let htmlFile = dataHTML.replace(
              "{{ verificationKey }}",
              verificationCode
            );

            htmlFile = htmlFile.replace(
              "{{ verificationMessage }}",
              `Here is Verification Code for ${verificationTopic}`
            );

            const msg = {
              to: `${email}`,
              from: "Bibliko <biblikoorg@gmail.com>",
              subject: verificationTopic,
              html: htmlFile
            };

            // return mg.messages().send(msg);
            return sgMail.send(msg);
          })
          .catch((err) => {
            console.log(err);
            res.sendStatus(500);
          });
      }
    })
    .then((passwordVerificationCodeSent) => {
      if (passwordVerificationCodeSent) {
        console.log(`Sent verification code for ${email}.`);
        res.sendStatus(200);
      }
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});

router.get("/checkVerificationCode", (req, res) => {
  // credententialNeedVerication: "password" / "email"
  const { email, code, credentialNeedVerification } = req.query;

  const verificationCacheKey =
    credentialNeedVerification === "password"
      ? passwordVerification
      : changeEmailVerification;

  getParsedCachedVerificationCode(email, verificationCacheKey)
    .then((redisCachedCode) => {
      const { secretCode } = redisCachedCode;
      if (code !== secretCode) {
        res.status(404).send("Your verification code does not match.");
      } else {
        res.sendStatus(200);
        return removeCachedVerificationCode(email, verificationCacheKey);
      }
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});

router.use("/verification/:tokenId", (req, res) => {
  const tokenId = req.params.tokenId;
  prisma.userVerification
    .findUnique({
      where: {
        id: tokenId
      }
    })
    .then((token) => {
      if (token) {
        return prisma.user.create({
          data: {
            email: token.email,
            password: token.password
          }
        });
      }

      const FRONTEND_HOST_HERE = getFrontendHost();

      res.redirect(`${FRONTEND_HOST_HERE}/verificationFail`);
    })
    .then((newUser) => {
      if (newUser) {
        const deletePromise = prisma.userVerification.delete({
          where: {
            id: tokenId
          }
        });

        return Promise.all([newUser, deletePromise]);
      }
    })
    .then(([newUser, doneDelete]) => {
      if (doneDelete) {
        req.logIn(newUser, (err) => {
          if (err) {
            return res.sendStatus(500);
          }

          const FRONTEND_HOST_HERE = getFrontendHost();

          return res.redirect(`${FRONTEND_HOST_HERE}/verificationSucceed`);
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});

module.exports = router;
