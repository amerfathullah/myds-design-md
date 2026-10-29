const path = require("path");
const reactInternal = require("@myds/eslint-config/react-internal.js");

module.exports = [
  ...reactInternal,
  {
    ignores: [
      "dist/",
      "node_modules/",
      ".next/",
      "coverage/",
      "tsup.config.ts",
      "eslint.config.js",
    ],
  },
  // To fix the issue where the tsconfig is being looked at the root directory
  // https://github.com/microsoft/vscode-eslint/issues/1170
  {
    languageOptions: {
      parserOptions: {
        project: path.resolve(__dirname, "tsconfig.json"),
      },
    },
  },
];
