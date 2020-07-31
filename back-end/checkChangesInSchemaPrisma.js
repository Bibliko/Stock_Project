const { exec } = require("child_process");
const { isEmpty } = require("lodash");

const consoleLog = (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error at checkChangesInSchemaPrisma.js: ${error}`);
  }
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);

  process.exit();
};

const chainCommands = (...cmds) => {
  let commandString = "";
  for (let index = 0; index < cmds.length; index++) {
    commandString = commandString.concat(cmds[index]);

    if (index < cmds.length - 1) {
      commandString = commandString.concat(" && ");
    }
  }
  return commandString;
};

const checkAndPullSchemaPrismaFromOriginMaster = () => {
  exec(
    "git diff --stat HEAD -- prisma/schema.prisma",
    (error, stdout, stderr) => {
      // consoleLog(error, stdout, stderr);
      if (error) {
        console.log(error);
      }

      const isSchemaPrismaBeingWorkedOn = isEmpty(stdout);

      if (isSchemaPrismaBeingWorkedOn) {
        const commandString = chainCommands(
          "echo",
          'echo "No changes made in schema.prisma in your branch yet. Pulling schema prisma from origin/master..."',
          "git fetch && git checkout -m origin/master -- ./prisma/schema.prisma",
          "git add prisma/schema.prisma",
          'echo "Finished pulling schema prisma from origin/master!"'
        );
        exec(commandString, consoleLog);
      } else {
        exec(
          'echo "There are changes in schema.prisma in your current branch. No pulling schema prisma would happen."',
          consoleLog
        );
      }
    }
  );
};

checkAndPullSchemaPrismaFromOriginMaster();
