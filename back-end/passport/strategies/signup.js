const { PrismaClient } = require('@prisma/client');
const LocalStrategy = require('passport-local').Strategy;
const prisma = new PrismaClient();

const {SHA3} = require('sha3');

const { 
    PASSPORT_CALLBACK_HOST,
    SENDGRID_API_KEY
} = process.env;

// const mailgun = require("mailgun-js");
// const DOMAIN = 'minecommand.us';
// const mg = mailgun({apiKey: process.env.MAILGUN_API_KEY, domain: DOMAIN});

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(SENDGRID_API_KEY);

const fs = require('fs-extra');

/* Verification flow:
 * - Create VerificationToken
 * - Send Email to verify
 * - If verify -> create new user
 * - If not -> don't create new user, the token eventually expires.
 */

const signupStrategy = new LocalStrategy({
        usernameField: 'email',
    },
    (email, password, done) => {
        console.log(email);
        prisma.user.findOne({
            where: {
                email
            }
        })
        .then(user => {
            if (user) {
                done(null, user, { message: "User with this email already exists." }); 
                return [null, null];
            }

            const file = new Promise((resolve, reject) => {
                fs.readFile('./verificationHTML/verifyEmail.html', 'utf8', (err, data) => {
                    if (err) {
                        reject(err);
                    }
                    console.log("read html file (verify email) successfully");
                    resolve(data);
                })
            });

            let date = new Date();
            /* month+1 because Date() counts month from 0 to 11, date+1 because
             * we want this verification token to expire the next day
             */
            date = (date.getMonth()+1) + '/' + (date.getDate()+1) + '/' + date.getFullYear();
            const verificationToken = new Promise((resolve, reject) => {
                const hash = new SHA3(256);
		hash.update(password);
		const pass = hash.digest('hex');
		prisma.userVerification.create({
                    data: {
                        email,
                        pass,
                        expiredAt: date
                    }
                })
                .then(res => {
                    console.log("create verification successfully");
                    resolve(res);
                })
                .catch(err => {
                    reject(err);
                })
            });

            return Promise.all([file, verificationToken]);
        })
        .then(([file, verificationToken]) => {
            if(!file && !verificationToken) {
                return null;
            }
            
            //file is a string of the html file, we replace substring {{ formAction }}
            //by the string 'something else'...
            file = file.replace(
                "{{ formAction }}", 
                `${PASSPORT_CALLBACK_HOST}/verification/${verificationToken.id}`
            );

            // const msg = {
            //     from: 'Bibliko <biblikoorg@gmail.com>',
            //     to: `${email}`,
            //     subject: 'Password Recovery',
            //     html: file,
            // };
            // return mg.messages().send(msg);

            const msg = {
                to: `${email}`,
                from: 'Bibliko <biblikoorg@gmail.com>',
                subject: 'Email Verification',
                html: file,
            };
            return sgMail.send(msg);
        })
        .then(emailVerification => {
            if(emailVerification) {
                done(null, false, { 
                    message: "Processing (Can take a while). Check your inboxes." 
                });
            }
        })
        .catch(err => {
            console.log(err);
            return done(err);
        })
    }
);

module.exports = signupStrategy;
