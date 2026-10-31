// The built package's `getThemeScript`, loaded by Node through the `import`
// and the `require` condition of `@amerfathullah/myds-react/utils`. The build
// minifies and targets an older JavaScript version, so this checks that the
// script it returns still runs on its own in <head>. It needs `pnpm build`
// first, and fails, rather than skips, without it.
/// <reference types="node" />
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

import type { ThemeScriptOptions } from "./theme";
import { cases, keysRead, runScript } from "./theme-test-page";

const root = resolve(__dirname, "../..");
const entry = "@amerfathullah/myds-react/utils";

// Every set of options the cases use, the default options as no argument
const optionSets = [
  ...new Map(cases.map(({ options }) => [JSON.stringify(options), options])),
];

// A Node program that loads the entry through the `import` or `require`
// condition, and prints the file it resolved to and the script for each set
// of options. Node runs it unable to evaluate strings as code, as under a
// Content Security Policy without `'unsafe-eval'`.
const program = (load: string, resolveEntry: string) => `
  ${load}
  const sets = JSON.parse(process.env.THEME_OPTIONS);
  console.log(JSON.stringify({
    file: ${resolveEntry}("${entry}"),
    scripts: sets.map((o) => (Object.keys(o).length ? getThemeScript(o) : getThemeScript())),
  }));`;
const programs = {
  import: program(
    `import { getThemeScript } from "${entry}";`,
    "import.meta.resolve",
  ),
  require: program(
    `const { getThemeScript } = require("${entry}");`,
    "require.resolve",
  ),
};

function load(condition: keyof typeof programs) {
  const output = execFileSync(
    process.execPath,
    [
      "--disallow-code-generation-from-strings",
      `--input-type=${condition === "import" ? "module" : "commonjs"}`,
      "--eval",
      programs[condition],
    ],
    {
      cwd: root,
      encoding: "utf8",
      env: {
        ...process.env,
        THEME_OPTIONS: JSON.stringify(optionSets.map(([, options]) => options)),
      },
    },
  );
  const { file, scripts } = JSON.parse(output) as {
    file: string;
    scripts: string[];
  };
  const scriptFor = (options: ThemeScriptOptions) =>
    scripts[
      optionSets.findIndex(([key]) => key === JSON.stringify(options))
    ] as string;
  return { file, scriptFor };
}

describe.each([
  ["import", /\/dist\/utils\/index\.mjs$/],
  ["require", /\/dist\/utils\/index\.js$/],
] as const)("the built getThemeScript, through `%s`", (condition, file) => {
  const built = load(condition);

  test("resolves to the built entry for that condition", () => {
    expect(built.file).toMatch(file);
  });

  test.each(cases)("$name", (theCase) => {
    const { classes, reads, writes } = runScript(
      built.scriptFor(theCase.options),
      theCase.page,
    );
    expect(classes).toEqual(theCase.classes);
    expect([...new Set(reads)]).toEqual(keysRead(theCase));
    expect(writes).toEqual([]);
  });
});

// The ThemeSwitch develop pages show the script for the default options in a
// plain index.html, copied by hand. The minifier names its variables
// differently from build to build, so the copy must behave as the built
// script does, not match its text.
describe.each(["theme-switch.mdx", "theme-switch.ms.mdx"])(
  "the docs' index.html sample in %s",
  (page) => {
    const mdx = readFileSync(
      resolve(root, "../../apps/docs/content/docs/develop/(components)", page),
      "utf8",
    );
    const sample =
      mdx
        .split('```html title="index.html"')[1]
        ?.match(/<script>\s*([^\n]*)\s*<\/script>/)?.[1] ?? "";

    test("is a script", () => {
      expect(sample).toMatch(/^\(function /);
    });

    test.each(cases.filter(({ options }) => !Object.keys(options).length))(
      "$name",
      (theCase) => {
        const { classes, reads, writes } = runScript(sample, theCase.page);
        expect(classes).toEqual(theCase.classes);
        expect([...new Set(reads)]).toEqual(keysRead(theCase));
        expect(writes).toEqual([]);
      },
    );
  },
);
