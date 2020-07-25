const { exec } = require("child_process");
const { isEmpty } = require("lodash");

const consoleLog = (error, stdout, stderr) => {
    if(error) {
        console.error(`exec error at checkChangesInSchemaPrisma.js: ${error}`);
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
}

const checkAndPullSchemaPrismaFromOriginMaster = () => {
    exec('git diff --stat HEAD -- prisma/schema.prisma', (error, stdout, stderr) => {
        consoleLog(error, stdout, stderr);

        if(isEmpty(stdout)) {
            exec('echo \"No changes made in schema.prisma in your branch yet. Pulling schema prisma from origin/master...\"', consoleLog); 
            exec('git fetch && git checkout -m origin/master -- ./prisma/schema.prisma', consoleLog); 
            exec('git add prisma/schema.prisma', consoleLog);
            exec('echo \"Finished pulling schema prisma from origin/master!\"', consoleLog);
            exec('npm run update-db', consoleLog);
        }
        else {
            exec('echo \"There are changes in schema.prisma in your current branch. No pulling schema prisma would happen.\"', consoleLog);
        }
      });
}

checkAndPullSchemaPrismaFromOriginMaster();