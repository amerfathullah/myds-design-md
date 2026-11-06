// The built package makes each React context and the toast emitter once, so
// a provider from one entry reaches a consumer from another: under the
// `require` condition (#119), under `import`, and with the provider loaded
// through one and its consumer through the other (#235). Node child
// processes load the package by its own name from the package root, in
// happy-dom where a case needs a DOM. It also checks what sharing them must
// leave as it is: the "use client" directives, the sourcemaps, every entry
// loading when globalThis or the registry's key can't be used, and what
// loads under React's react-server build. It needs `pnpm build` first, and
// fails, rather than skips, without it.
/// <reference types="node" />
import { execFile } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";
import { describe, expect, test } from "vitest";

import {
  buttonParents,
  caseEntries,
  casesProgram,
  censusProgram,
  type Condition,
  directions,
  type Fallback,
  fallbackProgram,
  fallbacks,
  mixedProgram,
  reactServerProgram,
  toastText,
} from "./registry-dist-programs";

const root = resolve(__dirname, "../..");
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")) as {
  name: string;
  version: string;
  exports: Record<string, unknown>;
};
const subpaths = Object.keys(pkg.exports);
const registryKey = `${pkg.name}@${pkg.version.split(".")[0]}/registry-v1`;
const conditions = ["require", "import"] as const;
// What the registry stores, each under the name of the const it makes
const sharedNames = [
  "AlertDialogContext",
  "ButtonContext",
  "CalloutContext",
  "CookieBannerContext",
  "DataTableContext",
  "DialogBodyContext",
  "InputContext",
  "NavbarContext",
  "NavbarMenuDropdownContext",
  "PaginationContext",
  "RadioContext",
  "RadioItemContext",
  "SearchBarContext",
  "SelectContext",
  "TabsContext",
  "ThemeContext",
  "ToastContext",
  "ToggleContext",
  "emitter",
];

// Runs a Node program from the package root and parses the JSON it prints.
// Every program starts as this file loads and runs alongside the others. A
// program that fails rejects only when a test reads it, so it fails only
// the tests of its configuration.
function start<T>(name: string, flags: string[], program: string) {
  const output = new Promise<{ value: T } | { error: Error }>((settle) => {
    execFile(
      process.execPath,
      [...flags, "--eval", program],
      { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error)
          return settle({
            error: new Error(`The ${name} program failed:\n${stderr}`),
          });
        try {
          settle({ value: JSON.parse(stdout) as T });
        } catch {
          settle({
            error: new Error(`The ${name} program printed no JSON:\n${stdout}`),
          });
        }
      },
    );
  });
  return async () => {
    const result = await output;
    if ("error" in result) throw result.error;
    return result.value;
  };
}

const inputType = (condition: Condition) =>
  `--input-type=${condition === "import" ? "module" : "commonjs"}`;

// What a case reports when it throws
type Threw = { threw: string };
type Case<T> = T | Threw;

interface Closed {
  before: boolean;
  after: boolean;
  dismissed: number;
}
interface ProbeClasses {
  icon: string | null;
  counter: string | null;
}
interface ThemeState {
  html: string[];
  saved: string | null;
  label: string | null;
}
interface Cases {
  files: Record<string, string>;
  themeProviderServer: Case<string>;
  themeProviderClient: Case<{ html: string[]; shows: string | null }>;
  themeContextServer: Case<string>;
  themeContextToggle: Case<string[][]>;
  themeToggle: Case<{ before: ThemeState; after: ThemeState }>;
  toast: Case<string[]>;
  alertDialogByDialogClose: Case<Closed>;
  dialogByAlertDialogClose: Case<Closed>;
  buttonChildren: Case<{
    outside: ProbeClasses;
    parents: Record<
      string,
      { inside: ProbeClasses; expected: ProbeClasses } | undefined
    >;
  }>;
}
interface Mixed {
  oneReact: boolean;
  files: Record<Condition, Record<string, string>>;
  directions: Record<
    `${Condition} to ${Condition}`,
    {
      themeProvider: Case<string>;
      themeContext: Case<string>;
      toast: Case<string[]>;
    }
  >;
}
interface Census {
  recording: boolean;
  mittFiles: { file: string; wrapped: boolean }[];
  failed: Record<string, string>;
  contexts: string[];
  emitters: string[];
  stored: string[] | null;
}
interface FallbackResult {
  failed: Record<string, string>;
  shows: Case<string>;
  frozen: boolean;
  extensible: boolean;
  onGlobal: boolean;
  untouched: boolean;
}
interface ReactServer {
  createContext: string;
  results: Record<string, string>;
}

const casesRun = Object.fromEntries(
  conditions.map((condition) => [
    condition,
    start<Cases>(
      `${condition} cases`,
      [inputType(condition)],
      casesProgram(condition, pkg.name, subpaths),
    ),
  ]),
) as Record<Condition, () => Promise<Cases>>;
const mixedRun = start<Mixed>(
  "mixed",
  [inputType("import")],
  mixedProgram(pkg.name, subpaths),
);
const censusRun = Object.fromEntries(
  conditions.map((condition) => [
    condition,
    start<Census>(
      `${condition} census`,
      ["--enable-source-maps", inputType(condition)],
      censusProgram(condition, pkg.name, subpaths, registryKey),
    ),
  ]),
) as Record<Condition, () => Promise<Census>>;
const fallbackRun = Object.fromEntries(
  conditions.flatMap((condition) =>
    fallbacks.map((fallback) => [
      `${condition} ${fallback}`,
      start<FallbackResult>(
        `${condition} fallback with ${fallback}`,
        [inputType(condition)],
        fallbackProgram(condition, fallback, pkg.name, subpaths, registryKey),
      ),
    ]),
  ),
) as Record<`${Condition} ${Fallback}`, () => Promise<FallbackResult>>;
const reactServerRun = Object.fromEntries(
  conditions.map((condition) => [
    condition,
    start<ReactServer>(
      `${condition} react-server`,
      ["--conditions=react-server", inputType(condition)],
      reactServerProgram(condition, pkg.name, subpaths),
    ),
  ]),
) as Record<Condition, () => Promise<ReactServer>>;

// A case's result, or the error it threw as a failed test
function resultOf<T>(result: Case<T>): T {
  if (result && typeof result === "object" && "threw" in result)
    throw new Error(`The case threw:\n${(result as Threw).threw}`);
  return result;
}

const timeout = 120_000;
const builtFile = { import: /\/dist\/.+\.mjs$/, require: /\/dist\/.+\.js$/ };

describe.each(conditions)(
  "the built package through `%s`",
  { timeout },
  (condition) => {
    const built = casesRun[condition];

    test("loads each case's entry through that condition", async () => {
      const { files } = await built();
      expect(Object.keys(files)).toEqual(Object.values(caseEntries));
      for (const file of Object.values(files))
        expect(file).toMatch(builtFile[condition]);
    });

    test('ThemeSwitch as="select" shows Dark in server HTML under ThemeProvider defaultTheme="dark"', async () => {
      expect(resultOf((await built()).themeProviderServer)).toBe("Dark");
    });

    test('ThemeProvider defaultTheme="dark" makes the page dark and ThemeSwitch as="select" show Dark', async () => {
      expect(resultOf((await built()).themeProviderClient)).toEqual({
        html: ["dark"],
        shows: "Dark",
      });
    });

    // The docs' ThemeBridge
    test('ThemeSwitch as="select" shows Dark under ThemeContext.Provider with the theme "dark"', async () => {
      expect(resultOf((await built()).themeContextServer)).toBe("Dark");
    });

    test('clicking ThemeSwitch as="toggle" calls the setTheme of the ThemeContext.Provider around it with the next theme', async () => {
      expect(resultOf((await built()).themeContextToggle)).toEqual([["light"]]);
    });

    test('clicking ThemeSwitch as="toggle" inside ThemeProvider makes the page dark, saves it and labels the toggle Dark', async () => {
      expect(resultOf((await built()).themeToggle)).toEqual({
        before: { html: ["light"], saved: null, label: "Light" },
        after: { html: ["dark"], saved: "dark", label: "Dark" },
      });
    });

    test("toast() from useToast shows in a mounted AutoToast", async () => {
      const { title, description } = toastText("Saved");
      expect(resultOf((await built()).toast)).toEqual([title + description]);
    });

    test("DialogClose closes an AlertDialogContent and calls its onDismiss once", async () => {
      expect(resultOf((await built()).alertDialogByDialogClose)).toEqual({
        before: true,
        after: false,
        dismissed: 1,
      });
    });

    test("AlertDialogClose closes a DialogBody and calls its onDismiss once", async () => {
      expect(resultOf((await built()).dialogByAlertDialogClose)).toEqual({
        before: true,
        after: false,
        dismissed: 1,
      });
    });

    // The expected classes are those of the same children of `./button`'s
    // own Button with the parent's variant and size. They differ from the
    // classes outside any Button, so the case can tell the two apart.
    // Skiplink's size is ButtonContext's default, so only its ButtonCounter's
    // colour differs.
    test.each(Object.keys(buttonParents))(
      "ButtonIcon and ButtonCounter inside %s take its Button's variant and size",
      async (parent) => {
        const { outside, parents } = resultOf((await built()).buttonChildren);
        const found = parents[parent];
        expect(found, parent).toBeDefined();
        expect(found?.expected).not.toEqual(outside);
        expect(found?.inside).toEqual(found?.expected);
      },
    );
  },
);

describe(
  "the built package with providers and consumers loaded through different conditions",
  { timeout },
  () => {
    test("loads one React, and each case's entry through each condition", async () => {
      const { oneReact, files } = await mixedRun();
      expect(oneReact).toBe(true);
      for (const condition of conditions) {
        expect(Object.keys(files[condition])).toEqual(
          Object.values(caseEntries),
        );
        for (const file of Object.values(files[condition]))
          expect(file).toMatch(builtFile[condition]);
      }
    });

    test.each(directions)(
      'ThemeProvider defaultTheme="dark" from `%s` reaches ThemeSwitch as="select" from `%s`',
      async (from, to) => {
        const results = (await mixedRun()).directions[`${from} to ${to}`];
        expect(resultOf(results.themeProvider)).toBe("Dark");
      },
    );

    test.each(directions)(
      'ThemeContext.Provider with the theme "dark" from `%s` reaches ThemeSwitch as="select" from `%s`',
      async (from, to) => {
        const results = (await mixedRun()).directions[`${from} to ${to}`];
        expect(resultOf(results.themeContext)).toBe("Dark");
      },
    );

    test.each(directions)(
      "toast() from useToast from `%s` shows in AutoToast from `%s`",
      async (from, to) => {
        const results = (await mixedRun()).directions[`${from} to ${to}`];
        const { title, description } = toastText(`${from} to ${to}`);
        expect(resultOf(results.toast)).toEqual([title + description]);
      },
    );
  },
);

// It records a createContext or mitt call made where a frame in src comes
// before any module-loading frame on the call's source-mapped stack, and
// names the last such frame. That catches a call through an alias and a
// third-party factory such as Radix's createContextScope called from src,
// but not the contexts Radix makes as its own modules load.
describe.each(conditions)(
  "every exported entry, loaded through `%s` in one process",
  { timeout },
  (condition) => {
    const census = censusRun[condition];

    test("loads with React's createContext and mitt recorded as that condition loads them", async () => {
      const { recording, mittFiles, failed } = await census();
      expect(recording).toBe(true);
      expect(mittFiles).toEqual([
        {
          file: `mitt/dist/mitt.${condition === "import" ? "mjs" : "js"}`,
          wrapped: true,
        },
      ]);
      expect(failed).toEqual({});
    });

    // A place made a context twice when two bundled copies of its module ran
    test("makes 18 React contexts, each in a different place in src", async () => {
      const { contexts } = await census();
      expect({
        made: contexts.length,
        again: contexts.filter((place, i) => contexts.indexOf(place) !== i),
      }).toEqual({ made: 18, again: [] });
    });

    test("makes one toast emitter", async () => {
      const { emitters } = await census();
      expect(emitters).toHaveLength(1);
    });

    // So a second copy of the major finds them, and the fallbacks below put
    // their foreign value where the build looks
    test("stores them on globalThis under the registry's key, for the React it loads", async () => {
      const { stored } = await census();
      expect(stored).toEqual([...sharedNames].sort());
    });
  },
);

// The directives in a file's prologue: its string literal statements before
// any other statement
function directives(file: string) {
  const kind = /\.tsx$/.test(file)
    ? ts.ScriptKind.TSX
    : /\.ts$/.test(file)
      ? ts.ScriptKind.TS
      : ts.ScriptKind.JS;
  const source = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    false,
    kind,
  );
  const found: string[] = [];
  for (const statement of source.statements) {
    if (
      !ts.isExpressionStatement(statement) ||
      !ts.isStringLiteral(statement.expression)
    )
      break;
    found.push(statement.expression.getText(source).slice(1, -1));
  }
  return found;
}

const clientModules = readdirSync(resolve(root, "src"), {
  recursive: true,
  encoding: "utf8",
})
  .filter((file) => /\.tsx?$/.test(file) && !file.endsWith(".d.ts"))
  .filter((file) =>
    directives(resolve(root, "src", file)).includes("use client"),
  )
  .sort();

describe("the built files", () => {
  test('some source modules begin with "use client"', () => {
    expect(clientModules).not.toEqual([]);
  });

  test.each(clientModules)(
    'the CommonJS and ESM files of %s keep its "use client" in their prologue',
    (file) => {
      for (const extension of [".js", ".mjs"]) {
        const built = resolve(root, "dist", file.replace(/\.tsx?$/, extension));
        expect(existsSync(built), built).toBe(true);
        expect(directives(built), built).toContain("use client");
      }
    },
  );

  test("no sourcemap holds an absolute path", () => {
    const dist = resolve(root, "dist");
    const maps = readdirSync(dist, {
      recursive: true,
      encoding: "utf8",
    }).filter((file) => file.endsWith(".map"));
    const absolute = (path: string) =>
      /^(?:[\\/]|file:|[A-Za-z]:)/i.test(path) || path.includes(root);
    const found = maps.flatMap((file) => {
      const { sources = [], sourceRoot } = JSON.parse(
        readFileSync(resolve(dist, file), "utf8"),
      ) as { sources?: string[]; sourceRoot?: string };
      return [...sources, ...(sourceRoot ? [sourceRoot] : [])]
        .filter(absolute)
        .map((path) => `${file}: ${path}`);
    });
    expect(maps.length).toBeGreaterThan(0);
    expect(found).toEqual([]);
  });
});

// Where the registry can't keep its store on globalThis, each bundled copy
// keeps its own, as on main, so an entry still works with itself
describe.each(
  conditions.flatMap((condition) =>
    fallbacks.map((fallback) => [condition, fallback] as const),
  ),
)(
  "every exported entry, loaded through `%s` with %s",
  { timeout },
  (condition, fallback: Fallback) => {
    const run = fallbackRun[`${condition} ${fallback}`];

    test("loads", async () => {
      expect((await run()).failed).toEqual({});
    });

    test("renders ThemeProvider from `./hooks` around a consumer of useTheme from `./hooks`", async () => {
      expect(resultOf((await run()).shows)).toBe("<span>dark</span>");
    });

    test("leaves globalThis and what the key held as they were", async () => {
      const { frozen, extensible, onGlobal, untouched } = await run();
      expect({ frozen, extensible, onGlobal, untouched }).toEqual({
        frozen: fallback === "globalThis frozen",
        extensible: !fallback.startsWith("globalThis"),
        onGlobal: !fallback.startsWith("globalThis"),
        untouched: true,
      });
    });
  },
);

// What each exported entry does under React's react-server build, measured
// on main before the registry: it loads, or throws an error of this name.
// The registry keeps it. An entry not listed throws the condition's `rest`.
const reactServer = {
  loads: [
    "./utils",
    "./textarea",
    "./summary-list",
    "./announce-bar",
    "./skeleton",
    "./spinner",
    "./footer",
    "./icon",
    "./label",
    "./date-field",
    "./time-field",
    "./tag",
    "./breadcrumb",
    "./link",
  ],
  require: { listed: { SyntaxError: ["./data-table"] }, rest: "TypeError" },
  import: {
    listed: {
      TypeError: ["./input-otp", "./masthead", "./checkbox", "./accordion"],
    },
    rest: "SyntaxError",
  },
};

describe.each(conditions)(
  "every exported entry, loaded through `%s` under React's react-server build",
  { timeout },
  (condition) => {
    test("loads or throws as on main", async () => {
      const { createContext, results } = await reactServerRun[condition]();
      const { listed, rest } = reactServer[condition];
      const named = Object.entries(listed as Record<string, string[]>);
      expect(createContext).toBe("undefined");
      expect(results).toEqual(
        Object.fromEntries(
          subpaths.map((subpath) => [
            subpath,
            reactServer.loads.includes(subpath)
              ? "loads"
              : (named.find(([, entries]) => entries.includes(subpath))?.[0] ??
                rest),
          ]),
        ),
      );
    });
  },
);
