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

const SequentialPromisesWithResultsArray = (tasksArray) => {
  return new Promise((resolve, reject) => {
    const resultsArray = [];

    tasksArray
      .reduce((currentStack, currentTask) => {
        return currentStack.then(currentTask).then((taskResult) => {
          resultsArray.push(taskResult);
          return taskResult;
        });
      }, Promise.resolve())
      .then((finishedSequentialPromises) => {
        resolve(resultsArray);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = {
  SequentialPromises,
  SequentialPromisesWithResultsArray
};
