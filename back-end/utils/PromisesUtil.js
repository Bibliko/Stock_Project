/**
 * tasksArray are promise returning functions.
 * - Expanded look:
 *     Promise.resolve().then(fn1).then(fn2).(...).then(fnN).catch(err => {
 *          console.error(err);
 *     });
 */
const SequentialPromises = (tasksArray) => {
  return new Promise((resolve, reject) => {
    tasksArray
      .reduce((currentStack, currentTask) => {
        return currentStack.then(currentTask);
      }, Promise.resolve())
      .then((finishedSequentialPromises) => {
        resolve("Successfully finished all tasks.");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = {
  SequentialPromises
};
