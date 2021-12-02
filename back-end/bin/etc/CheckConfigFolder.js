var storage = require("../../firebase/firebaseStorage.js");
var storageRef = storage.ref();
const { isEqual } = require("lodash");
const fs = require("fs-extra");

const takeFirebaseFile = (ref, fileName) =>
  new Promise((resolve, reject) => {
    ref
      .child(fileName)
      .getDownloadURL()
      .then((url) => {
        var xhr = new XMLHttpRequest();
        xhr.responseType = "blob";
        xhr.open("GET", url);
        xhr.send();
        xhr.onload = (event) => {
          var blob = xhr.response;
          resolve(blob);
        };
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });

const areConfigFilesDifferent = () => {
  return new Promise((resolve, reject) => {
    const firebaseConfigFile = takeFirebaseFile(storageRef, "config.js");
    const localConfigFile = fs.readFile("./config.js", "utf8");

    Promise.all([firebaseConfigFile, localConfigFile])
      .then(([configBlobFirebase, configBlobLocal]) => {
        if (isEqual(configBlobFirebase, configBlobLocal)) {
          console.log("2 config files are the same.");
          resolve(false);
        } else {
          console.log("2 config files are different.");
          resolve(true);
        }
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

const writeFile = (relativePath, content) => {
  return new Promise((resolve, reject) => {
    fs.outputFile(relativePath, content)
      .then(() => {
        console.log(`write ${relativePath} successfully`);
        resolve(`write ${relativePath} successfully`);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

const checkConfigFolderLocallyAndPullFromFirebaseIfNecessary = () => {
  const firebaseConfigFile = takeFirebaseFile(storageRef, "config.js");

  firebaseConfigFile
    .then((firebaseConfigBlob) => {
      return Promise.all([areConfigFilesDifferent(), firebaseConfigBlob]);
    })
    .then(([configFolderNeedsUpdate, firebaseConfigBlob]) => {
      // if config folder need update
      if (configFolderNeedsUpdate) {
        return writeFile("./config.js", firebaseConfigBlob);
      } else {
        console.log("Config Folder does not need updates.");
      }
    })
    .then(() => {
      process.exit();
    })
    .catch((err) => {
      console.log(err);
    });
};

checkConfigFolderLocallyAndPullFromFirebaseIfNecessary();
