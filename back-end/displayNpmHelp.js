// @flow

var colors = require("colors");

const formatCodeExample = (exampleText: string): string => {
  // $FlowFixMe
  return colors.brightCyan(exampleText);
};

const deps = () => {
  console.log(
    "[",
    // $FlowFixMe
    colors.brightBlue.bold("deps"),
    "]: to install npm packages with Flow support"
  );
  console.log(
    `\n\
    - Install all packages\t ${formatCodeExample("npm run deps")}\n\
    - Install a single package\t ${formatCodeExample(
      "npm run deps --package=PACKAGE_NAME"
    )}\n\
    - Install multiple packages\t ${formatCodeExample(
      'npm run deps --package="PACKAGE_NAME_1 PACKAGE_NAME_2"'
    )}\n`
  );
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
deps();
