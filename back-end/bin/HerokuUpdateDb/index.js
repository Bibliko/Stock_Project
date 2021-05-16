/* Create firebase
 * File node: take firebase schema, compare schema firebase with schema in folder Git
 * - Different: take migrations firebase, run prisma generate back-end heroku -> send firebase newest migration and schema
 * - Same: skip generate, go straight npm build
 */
const { NODE_ENV } = require('../../config');

if (NODE_ENV !== "production") {
  console.log("Not in production ==> Will not update DB.");
  process.exit();
}

var storage = require("../../firebase/firebaseStorage.js");
var migrationsFolder = storage.ref("/system/migrations");
var schemaFolder = storage.ref("/system/schema");
const fs = require("fs-extra");
const { exec } = require("child_process");

const addSchema = () =>
  new Promise((resolve, reject) => {
    const file = fs.readFileSync("./prisma/schema.prisma");
    schemaFolder
      .child("schema.prisma")
      .put(file)
      .then(() => {
        console.log("Successfully added schema to firebase");
        resolve("Successfully added schema to firebase");
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });

const addMigrations = () =>
  new Promise((resolve, reject) => {
    fs.readdir("./prisma/migrations")
      .then((entries) => {
        const entryPromiseList = entries.map((entry) => {
          // entry can be migrate.lock or name of directory
          if (entry === "migrate.lock") {
            const file = fs.readFileSync("./prisma/migrations/migrate.lock");
            return migrationsFolder.child("migrate.lock").put(file);
          } else {
            fs.readdir(`./prisma/migrations/${entry}`, (err, files) => {
              if (err) {
                console.log(err);
                reject(err);
              }

              const filesPromise = files.map((file) => {
                const fileData = fs.readFileSync(
                  `./prisma/migrations/${entry}/${file}`
                );
                return migrationsFolder.child(`${entry}/${file}`).put(fileData);
              });
              return Promise.all(filesPromise);
            });
          }
        });

        return Promise.all(entryPromiseList);
      })
      .then(() => {
        console.log("Successfully added migrations to firebase");
        resolve("Successfully added migrations to firebase");
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });

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

const fsWriteFilePrismaMigrations = (contents, fileName, migrationName) =>
  new Promise((resolve, reject) => {
    if (migrationName) {
      fs.outputFile(
        `./prisma/migrations/${migrationName}/${fileName}`,
        contents
      )
        .then(() => {
          console.log(`Successfully wrote ${fileName}`);
          resolve(`Successfully wrote ${fileName}`);
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    } else {
      fs.outputFile(`./prisma/migrations/${fileName}`, contents)
        .then(() => {
          console.log(`Successfully wrote ${fileName}`);
          resolve(`Successfully wrote ${fileName}`);
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    }
  });

const putFirebaseToLocal = () =>
  new Promise((resolve, reject) => {
    migrationsFolder
      .list()
      .then((entryList) => {
        takeFirebaseFile(migrationsFolder, "migrate.lock")
          .then((file) => {
            if (!file) {
              console.log("No migrations yet");
              resolve("No migrations yet");
            }

            const migrateLockPromise = fsWriteFilePrismaMigrations(
              file,
              "migrate.lock"
            );

            const prefixPromiseList = entryList.prefixes.map((entry) => {
              const READMEPromise = takeFirebaseFile(entry, "README.md");
              const schemaPromise = takeFirebaseFile(entry, "schema.prisma");
              const stepsPromise = takeFirebaseFile(entry, "steps.json");

              // path_ in firebase: system/migrations/...
              const migrationName = entry.location.path_.substring(18);

              return Promise.all([
                READMEPromise,
                schemaPromise,
                stepsPromise
              ]).then(([README, schema, steps]) => {
                return Promise.all([
                  fsWriteFilePrismaMigrations(
                    README,
                    "README.md",
                    migrationName
                  ),
                  fsWriteFilePrismaMigrations(
                    schema,
                    "schema.prisma",
                    migrationName
                  ),
                  fsWriteFilePrismaMigrations(
                    steps,
                    "steps.json",
                    migrationName
                  )
                ]);
              });
            });

            Promise.all([migrateLockPromise, Promise.all(prefixPromiseList)])
              .then(() => {
                console.log("Successfully wrote all files");
                resolve("Successfully wrote all files");
              })
              .catch((err) => {
                // If there is migrateLock, there must be migrations.
                // Therefore, the then above should happen.
                // If err happens here, there's something wrong.
                reject(err);
              });
          })
          .catch((error) => {
            console.log(error);
            console.log("Error: No migrations yet, herokuUpdateDb.js 185");
            resolve(error);
          });
      })
      .catch((error) => {
        console.log(error);
        reject(error);
      });
  });

const main = () => {
  const localSchema = fs.readFileSync("./prisma/schema.prisma", "utf8");
  let firebaseSchema;

  takeFirebaseFile(schemaFolder, "schema.prisma")
    .then((firebaseSchemaResponse) => {
      firebaseSchema = firebaseSchemaResponse;
    })
    .catch((err) => {
      console.log(err);
      firebaseSchema = "";
    })
    .finally(() => {
      if (localSchema !== firebaseSchema) {
        putFirebaseToLocal().then((done) => {
          exec('echo "init" | npm run update-db', (error, stdout, stderr) => {
            if (error) {
              console.log(`error: ${error.message}`);
              return;
            }
            console.log(`stdout: ${stdout}`);
            Promise.all([addSchema(), addMigrations()]).then(() => {
              process.exit();
            });
          });
        });
      } else {
        // Firebase does not stop automatically
        process.exit();
      }
    });
};

main();
