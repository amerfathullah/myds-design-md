const { resolve } = require("node:path");
const js = require("@eslint/js");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const prettier = require("eslint-config-prettier");
const turbo = require("eslint-config-turbo/flat").default;
const jsxA11y = require("eslint-plugin-jsx-a11y");
const onlyWarn = require("eslint-plugin-only-warn");
const globals = require("globals");

const project = resolve(process.cwd(), "tsconfig.json");

/*
 * This is a custom ESLint configuration for use with
 * internal (bundled by their consumer) libraries
 * that utilize React.
 */

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
  // Force ESLint to detect .tsx files
  { files: ["**/*.js?(x)", "**/*.ts?(x)"] },
  js.configs.recommended,
  prettier,
  ...turbo,
  jsxA11y.flatConfigs.recommended,
  ...tsPlugin.configs["flat/recommended"],
  {
    plugins: { "only-warn": onlyWarn },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project,
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
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
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
