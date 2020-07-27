try {
    require("dotenv").config();
} catch(error) {
    console.log("No .env found. Using default ENV.");
}

global.XMLHttpRequest = require("xhr2");
var firebase = require("firebase");

// // Add the Firebase products that you want to use
require("firebase/auth");
require("firebase/storage");

const {
    REACT_APP_FIREBASE_API_KEY: apiKey,
    REACT_APP_FIREBASE_STORAGE_BUCKET: storageBucket,
    REACT_APP_FIREBASE_PROJECT_ID: projectID,
    REACT_APP_FIREBASE_AUTH_DOMAIN: authDomain,
    REACT_APP_FIREBASE_DATABASE_URL: databaseURL,
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