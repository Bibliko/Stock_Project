try {
  require("../config/config");
} catch (error) {
  console.log("No config found. Using default ENV.");
}

global.XMLHttpRequest = require("xhr2");
var firebase = require("firebase");

// Add the Firebase products that you want to use
require("firebase/auth");
require("firebase/storage");

const {
  FIREBASE_API_KEY: apiKey,
  FIREBASE_STORAGE_BUCKET: storageBucket,
  FIREBASE_PROJECT_ID: projectID,
  FIREBASE_AUTH_DOMAIN: authDomain,
  FIREBASE_DATABASE_URL: databaseURL
} = process.env;

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
