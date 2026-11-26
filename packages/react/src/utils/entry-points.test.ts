// The build's entry points and the package's `exports` agree, both ways
// (#236): every entry has the subpath that loads its built files, and every
// subpath belongs to an entry. Without that, the build ships files that no
// import can reach, as Calendar's and Popover's were. This reads the source
// and needs no build; entry-points.dist.test.ts checks the built files.
/// <reference types="node" />
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { posix, resolve } from "node:path";
import { describe, expect, test } from "vitest";

import { entryPatterns, entryPoints, filesOf } from "./entry-points";

const root = resolve(__dirname, "../..");
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")) as {
  exports: Record<string, unknown>;
};

// The index entries' subpaths. A component's is its file name.
const indexSubpaths: Record<string, string> = {
  "src/hooks/index.ts": "./hooks",
  "src/icons/index.ts": "./icon",
  "src/utils/index.ts": "./utils",
};
// Subpaths that aren't an entry's, with what they map to. Every other
// subpath must load an entry's built files.
const otherSubpaths: Record<string, unknown> = {};

// The directory esbuild writes each entry's files under `dist` relative to:
// the deepest one that holds every entry (its `outbase`)
function outbase(entries: readonly string[]) {
  const [first = [], ...rest] = entries.map((entry) =>
    posix.dirname(entry).split("/"),
  );
  let depth = first.length;
  for (const parts of rest)
    while (parts.slice(0, depth).join("/") !== first.slice(0, depth).join("/"))
      depth--;
  return first.slice(0, depth).join("/");
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isScript = (target: unknown) =>
  typeof target === "string" && /^\.\/dist\/.+\.m?js$/.test(target);
const show = (value: unknown) => JSON.stringify(value);

// Where `entries` and `exports` disagree: an entry without the subpath that
// loads its built files, or a subpath that isn't an entry's or listed in
// `others`, or that has conditions other than `import` and `require`
function mismatches(
  entries: readonly string[],
  exports: Record<string, unknown>,
  others: Record<string, unknown> = otherSubpaths,
): string[] {
  const base = outbase(entries);
  const found: string[] = [];
  const owned = new Set<string>();
  for (const entry of entries) {
    const subpath =
      indexSubpaths[entry] ??
      (entry.startsWith("src/components/")
        ? `./${posix.relative("src/components", entry).replace(/\.tsx?$/, "")}`
        : undefined);
    if (!subpath) {
      found.push(`${entry} is an entry, but no rule here names its subpath`);
      continue;
    }
    owned.add(subpath);
    const built = `./dist/${posix.relative(base, entry).replace(/\.tsx?$/, "")}`;
    const expected = { import: `${built}.mjs`, require: `${built}.js` };
    const value = exports[subpath];
    if (value === undefined)
      found.push(`${entry} is an entry, but \`exports\` has no ${subpath}`);
    else if (
      !isObject(value) ||
      value.import !== expected.import ||
      value.require !== expected.require
    )
      found.push(
        `${subpath} maps to ${show(value)}, not to ${entry}'s built files ${show(expected)}`,
      );
  }
  for (const [subpath, value] of Object.entries(exports)) {
    if (Object.hasOwn(others, subpath)) {
      if (show(value) !== show(others[subpath]))
        found.push(
          `${subpath} maps to ${show(value)}, not to the listed ${show(others[subpath])}`,
        );
      continue;
    }
    const targets = isObject(value) ? Object.values(value) : [value];
    if (!targets.some(isScript)) {
      found.push(
        `${subpath} maps to ${show(value)}, no built script, and isn't listed among the subpaths that aren't an entry's`,
      );
      continue;
    }
    const conditions = isObject(value) ? Object.keys(value).sort() : [];
    if (show(conditions) !== show(["import", "require"]))
      found.push(
        `${subpath} has the conditions ${show(conditions)}: an entry's subpath has exactly \`import\` and \`require\`, and no \`types\` (#234)`,
      );
    if (!owned.has(subpath))
      found.push(
        `${subpath} maps to built scripts, but it isn't an entry's subpath`,
      );
  }
  return found;
}

// tsup expands `entryPoints` with tinyglobby, which reads a leading `!` as
// an ignore. The reader must list the files that it does.
const { globSync } = createRequire(require.resolve("tsup"))("tinyglobby") as {
  globSync: (patterns: string[], options: { cwd: string }) => string[];
};
const tinyglobby = (patterns: string[]) =>
  globSync(patterns, { cwd: root }).sort();

const config = (body: string) =>
  `import { defineConfig } from "tsup";
export default defineConfig((options) => ({ ...options, ${body} }));`;

describe("the entry-list reader", () => {
  test("reads the patterns in a config's `entryPoints`, in order", () => {
    expect(
      entryPatterns(
        config(`entryPoints: ["src/a/**/*.tsx", "!src/a/b.tsx", 'src/c.ts'],`),
      ),
    ).toEqual(["src/a/**/*.tsx", "!src/a/b.tsx", "src/c.ts"]);
  });

  test.each([
    ["no `entryPoints`", config(`format: ["cjs"],`)],
    [
      "two `entryPoints`",
      config(`entryPoints: ["src/a.ts"], dts: { entryPoints: ["src/b.ts"] },`),
    ],
    ["an `entryPoints` that isn't an array", config(`entryPoints: entries,`)],
    ["a pattern that isn't a string literal", config(`entryPoints: [entry],`)],
    ["a spread in `entryPoints`", config(`entryPoints: [...entries],`)],
    [
      "an `entry` beside `entryPoints`, which tsup reads first",
      config(`entry: ["src/a.ts"], entryPoints: ["src/b.ts"],`),
    ],
    [
      "a `dts.entry`, which picks the declarations' entries",
      config(`entryPoints: ["src/b.ts"], dts: { entry: ["src/a.ts"] },`),
    ],
  ])("throws on a config with %s", (_, text) => {
    expect(() => entryPatterns(text)).toThrow();
  });

  test("lists the files the patterns name, as tinyglobby does", () => {
    const patterns = [
      "src/components/**/*.tsx",
      "!src/components/calendar.tsx",
      "src/hooks/index.ts",
    ];
    const files = filesOf(root, patterns);
    expect(files).toEqual(tinyglobby(patterns));
    expect(files).toContain("src/components/button.tsx");
    expect(files).toContain("src/hooks/index.ts");
    expect(files).not.toContain("src/components/calendar.tsx");
  });

  test("leaves out what a `!` pattern names wherever it comes in the list", () => {
    expect(
      filesOf(root, ["!src/components/calendar.tsx", "src/components/*.tsx"]),
    ).toEqual(
      filesOf(root, ["src/components/*.tsx"]).filter(
        (file) => file !== "src/components/calendar.tsx",
      ),
    );
  });

  test.each([[[]], [["!src/components/calendar.tsx"]]])(
    "lists nothing for %j, as tinyglobby does",
    (patterns: string[]) => {
      expect(tinyglobby(patterns)).toEqual([]);
      expect(filesOf(root, patterns)).toEqual([]);
    },
  );

  test.each([
    "src/components/{button,link}.tsx",
    "src/components/[bl]*.tsx",
    "src/components/@(button|link).tsx",
    "src/components/!(button).tsx",
    "src/components/*!.tsx",
    "!!src/components/button.tsx",
    "src\\components\\button.tsx",
    "src/components/*",
    "!src/components",
  ])("throws on `%s`, which it can't read as tinyglobby does", (pattern) => {
    expect(() => filesOf(root, ["src/hooks/index.ts", pattern])).toThrow(
      pattern,
    );
  });

  test("reads the build's entry points from tsup.config.ts, as tinyglobby does", () => {
    const entries = entryPoints();
    expect(entries).toContain("src/components/button.tsx");
    expect(entries).toContain("src/hooks/index.ts");
    expect(entries).toEqual(
      tinyglobby(
        entryPatterns(readFileSync(resolve(root, "tsup.config.ts"), "utf8")),
      ),
    );
  });
});

describe("the build's entry points and `exports`", () => {
  test("agree: each entry has the subpath that loads its built files, and each subpath is an entry's", () => {
    expect(mismatches(entryPoints(), pkg.exports)).toEqual([]);
  });

  // The pickers use Calendar and Popover, and no subpath loads them (#236)
  test("leave out Calendar and Popover, which aren't public", () => {
    const entries = entryPoints();
    expect(entries).not.toContain("src/components/calendar.tsx");
    expect(entries).not.toContain("src/components/popover.tsx");
  });
});

// Entries and the subpaths that load them, as they agree
const entries = [
  "src/components/button.tsx",
  "src/components/link.tsx",
  "src/hooks/index.ts",
  "src/icons/index.ts",
  "src/utils/index.ts",
];
const exports = {
  "./button": {
    import: "./dist/components/button.mjs",
    require: "./dist/components/button.js",
  },
  "./link": {
    import: "./dist/components/link.mjs",
    require: "./dist/components/link.js",
  },
  "./hooks": {
    import: "./dist/hooks/index.mjs",
    require: "./dist/hooks/index.js",
  },
  "./icon": {
    import: "./dist/icons/index.mjs",
    require: "./dist/icons/index.js",
  },
  "./utils": {
    import: "./dist/utils/index.mjs",
    require: "./dist/utils/index.js",
  },
};
const link = exports["./link"];

describe("the check", () => {
  test("accepts entries and subpaths that agree", () => {
    expect(mismatches(entries, exports, {})).toEqual([]);
  });

  test("accepts a subpath that isn't an entry's when it's listed with what it maps to", () => {
    const others = { "./package.json": "./package.json" };
    expect(mismatches(entries, { ...exports, ...others }, others)).toEqual([]);
  });

  // Each case, and the names each of its reports holds
  test.each<{
    name: string;
    entries?: string[];
    exports?: Record<string, unknown>;
    others?: Record<string, unknown>;
    reports: string[][];
  }>([
    {
      name: "a component with no subpath",
      entries: [...entries, "src/components/calendar.tsx"],
      reports: [["src/components/calendar.tsx", "./calendar"]],
    },
    {
      name: "a nested component with no subpath",
      entries: [...entries, "src/components/date/calendar.tsx"],
      reports: [["src/components/date/calendar.tsx", "./date/calendar"]],
    },
    {
      name: "an entry that no rule names a subpath for",
      entries: [...entries, "src/national-marks/index.ts"],
      reports: [["src/national-marks/index.ts"]],
    },
    {
      name: "a subpath with no entry",
      exports: {
        ...exports,
        "./ghost": {
          import: "./dist/components/ghost.mjs",
          require: "./dist/components/ghost.js",
        },
      },
      reports: [["./ghost"]],
    },
    {
      name: "a typo in a target",
      exports: {
        ...exports,
        "./link": { ...link, import: "./dist/components/lnk.mjs" },
      },
      reports: [["./link", "src/components/link.tsx"]],
    },
    {
      name: "a subpath that loads another entry",
      exports: { ...exports, "./link": exports["./button"] },
      reports: [["./link", "src/components/link.tsx"]],
    },
    {
      name: "a renamed subpath",
      exports: { ...exports, "./link": undefined, "./links": link },
      reports: [
        ["src/components/link.tsx", "./link"],
        ["./links", "isn't an entry's"],
      ],
    },
    {
      name: "swapped conditions",
      exports: {
        ...exports,
        "./link": { import: link.require, require: link.import },
      },
      reports: [["./link"]],
    },
    {
      name: "a `types` condition",
      exports: {
        ...exports,
        "./link": { types: "./dist/components/link.d.ts", ...link },
      },
      reports: [["./link", "exactly `import` and `require`"]],
    },
    {
      name: "a subpath that maps straight to a script",
      exports: { ...exports, "./link": link.import },
      reports: [
        ["./link", "src/components/link.tsx"],
        ["./link", "exactly `import` and `require`"],
      ],
    },
    {
      name: "a subpath that isn't an entry's and isn't listed",
      exports: { ...exports, "./package.json": "./package.json" },
      reports: [["./package.json", "isn't listed"]],
    },
    {
      name: "a listed subpath that maps to something else",
      exports: { ...exports, "./package.json": "./dist/package.json" },
      others: { "./package.json": "./package.json" },
      reports: [["./package.json", "listed"]],
    },
    {
      // esbuild then writes the components' files to `dist` itself
      name: "entries whose common directory moves their built files",
      entries: ["src/components/button.tsx", "src/components/link.tsx"],
      exports: { "./button": exports["./button"], "./link": link },
      reports: [
        ["./button", "./dist/button.mjs"],
        ["./link", "./dist/link.mjs"],
      ],
    },
  ])("reports $name", (sample) => {
    const found = mismatches(
      sample.entries ?? entries,
      Object.fromEntries(
        Object.entries(sample.exports ?? exports).filter(
          ([, value]) => value !== undefined,
        ),
      ),
      sample.others ?? {},
    );
    expect(found).toEqual(
      sample.reports.map((names) =>
        expect.toSatisfy(
          (report: unknown) =>
            typeof report === "string" &&
            names.every((name) => report.includes(name)),
          names.join(", "),
        ),
      ),
    );
  });
});
