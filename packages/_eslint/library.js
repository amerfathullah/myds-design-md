const { resolve } = require("node:path");
const js = require("@eslint/js");
const prettier = require("eslint-config-prettier");
const turbo = require("eslint-config-turbo/flat").default;
const onlyWarn = require("eslint-plugin-only-warn");
const globals = require("globals");

const project = resolve(process.cwd(), "tsconfig.json");

/** @type {import("eslint").Linter.Config[]} */
module.exports = [
  {
    ignores: [
      // Ignore dotfiles
      "**/.*.js",
      "**/node_modules/",
      "**/dist/",
    ],
  },
  { files: ["**/*.js?(x)", "**/*.ts?(x)"] },
  js.configs.recommended,
  prettier,
  ...turbo,
  {
    plugins: { "only-warn": onlyWarn },
    languageOptions: {
      globals: {
        ...globals.node,
        React: true,
        JSX: true,
      },
    },
    settings: {
      "import/resolver": {
        typescript: {
          project,
        },
      },
    },
  },
];
