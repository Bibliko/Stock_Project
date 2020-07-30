var storage = require('./firebase/firebaseStorage.js');
var storageRef = storage.ref();
const { isEqual } = require('lodash');
const fs = require('fs-extra');

const takeFirebaseFile = (ref, fileName) => new Promise((resolve, reject) => {
    ref.child(fileName).getDownloadURL()
    .then(url => {
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'blob';
        xhr.open('GET', url);
        xhr.send();
        xhr.onload = (event) => {
            var blob = xhr.response;
            resolve(blob);
        };
    })
    .catch(err => {
        console.log(err);
        reject(err);
    })
})

const areEnvFilesDifferent = () => {
    return new Promise((resolve, reject) => {
        const firebaseEnvFile = takeFirebaseFile(storageRef, '.env');
        const localEnvFile = fs.readFile('./.env', 'utf8');

        Promise.all([firebaseEnvFile, localEnvFile])
        .then(([envBlobFirebase, envBlobLocal]) => {

            if(isEqual(envBlobFirebase, envBlobLocal)) {
                console.log('2 .env files are the same.');
                resolve(false);
            }
            else {
                console.log('2 .env files are different.');
                resolve(true);
            }
        })
        .catch(err => {
            console.log(err);
            reject(err);
        })
    })
}

const writeFile = (relativePath, content) => {
    return new Promise((resolve, reject) => {
        fs.outputFile(relativePath, content)
        .then(() => {
            console.log(`write ${relativePath} successfully`);
            resolve(`write ${relativePath} successfully`);
        })
        .catch(err => {
            console.log(err);
            reject(err);
        })
    })
}

const checkEnvLocallyAndPullFromFirebaseIfNecessary = () => {
    const firebaseEnvFile = takeFirebaseFile(storageRef, '.env');

    firebaseEnvFile
    .then(firebaseEnvBlob => {
        return Promise.all([areEnvFilesDifferent(), firebaseEnvBlob]);
    })
    .then(([envNeedsUpdate, firebaseEnvBlob]) => {

        // if config folder need update
        if( envNeedsUpdate ) {
            return writeFile('./.env', firebaseEnvBlob);
        }
        else {
            console.log('Env does not need updates.');
        }
    })
    .then(() => {
        process.exit();
    })
    .catch(err => {
        console.log(err);
    })
}

checkEnvLocallyAndPullFromFirebaseIfNecessary();


