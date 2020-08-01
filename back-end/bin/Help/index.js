// @flow

const colors = require("colors");
const fs = require("fs");

type Info = {
  [key: string]: {
    description: string[],
    examples: Array<string[]>
  }
};
const mCommandInfo: Info = JSON.parse(
  fs.readFileSync(`${__dirname}/CommandInfo.json`, "utf8")
);

const formatCodeInstruction = (instructionText: string): string => {
  let formattedText: string = "    ";
  formattedText += `- ${instructionText}`;
  const reserveSpaces = 36;
  for (
    let spaceCount = 0;
    spaceCount < reserveSpaces - instructionText.length;
    spaceCount++
  ) {
    formattedText += " ";
  }
  return formattedText;
};

const formatCodeExample = (exampleText: string): string => {
  // $FlowFixMe
  return colors.brightCyan(exampleText);
};

const displayAllCommandInfo = () => {
  Object.keys(mCommandInfo).forEach((command: string) => {
    console.log(
      "[",
      // $FlowFixMe
      colors.brightBlue.bold(command),
      "]:\n"
    );
    const { description, examples } = mCommandInfo[command];
    description.forEach((line) => console.log(line));
    console.log();
    examples.forEach((example) => {
      console.log(
        `${formatCodeInstruction(example[0])}${formatCodeExample(example[1])}`
      );
    });
    console.log("\n");
  });
};

console.log(
  colors.bold("COMMAND"),
  ": npm run",
  // $FlowFixMe
  colors.brightBlue("SCRIPT_NAME")
);
console.log(
  // $FlowFixMe
  colors.brightBlue("SCRIPT_NAME"),
  "should be one of the followings:\n"
);
displayAllCommandInfo();
