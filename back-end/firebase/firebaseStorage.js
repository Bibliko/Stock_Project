global.XMLHttpRequest = require("xhr2");
var firebase = require("firebase");

// Add the Firebase products that you want to use
require("firebase/auth");
require("firebase/storage");

const config = require('../config');

const apiKey = config.FIREBASE_API_KEY;
const storageBucket = config.FIREBASE_STORAGE_BUCKET;
const projectID = config.FIREBASE_PROJECT_ID;
const authDomain = config.FIREBASE_AUTH_DOMAIN;
const databaseURL = config.FIREBASE_DATABASE_URL;

var firebaseConfig = {
  apiKey,
  projectID,
  authDomain,
  databaseURL,
  storageBucket
};

firebase.initializeApp(firebaseConfig);

var storage = firebase.storage();

module.exports = storage;
