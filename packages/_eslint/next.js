const { resolve } = require("node:path");
const js = require("@eslint/js");
const nextPlugin = require("@next/eslint-plugin-next");
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
    ],
  },
  { files: ["**/*.js?(x)", "**/*.ts?(x)"] },
  js.configs.recommended,
  prettier,
  // What `@vercel/style-guide/eslint/next` used to provide. That package
  // doesn't support ESLint 9 or later.
  nextPlugin.configs.recommended,
  ...turbo,
  {
    plugins: { "only-warn": onlyWarn },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
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
