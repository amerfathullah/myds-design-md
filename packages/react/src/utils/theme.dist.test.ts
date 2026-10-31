// The built package's `getThemeScript`, loaded by Node through the `import`
// and the `require` condition of `@amerfathullah/myds-react/utils`. The build
// minifies and targets an older JavaScript version, so this checks that the
// script it returns still runs on its own in <head>. It needs `pnpm build`
// first, and fails, rather than skips, without it.
/// <reference types="node" />
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

import {
  cases,
  keysRead,
  runScript,
  type ThemeOptions,
} from "./theme-test-page";

const root = resolve(__dirname, "../..");
const entry = "@amerfathullah/myds-react/utils";

// Every set of options the cases use, the default options as no argument
const optionSets = [
  ...new Map(cases.map(({ options }) => [JSON.stringify(options), options])),
];

// The `import` and `require` forms of a Node program that loads the entry,
// and prints the file it resolved to and the script for each set of options.
// Node runs it unable to evaluate strings as code, as under a Content
// Security Policy without `'unsafe-eval'`.
const programs = {
  import: `
    import { getThemeScript } from "${entry}";
    const sets = JSON.parse(process.env.THEME_OPTIONS);
    console.log(JSON.stringify({
      file: import.meta.resolve("${entry}"),
      scripts: sets.map((o) => (Object.keys(o).length ? getThemeScript(o) : getThemeScript())),
    }));`,
  require: `
    const { getThemeScript } = require("${entry}");
    const sets = JSON.parse(process.env.THEME_OPTIONS);
    console.log(JSON.stringify({
      file: require.resolve("${entry}"),
      scripts: sets.map((o) => (Object.keys(o).length ? getThemeScript(o) : getThemeScript())),
    }));`,
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
  const scriptFor = (options: ThemeOptions) =>
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
