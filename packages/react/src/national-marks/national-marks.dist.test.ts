// The built package's national marks, loaded by Node through the `import` and
// the `require` condition, and resolved by TypeScript as a consumer of each
// condition resolves them. `@amerfathullah/myds-react/icon` still exports
// both, deprecated, until the next major (ADR-0007). No other entry exports
// either. It needs `pnpm build` first, and fails, rather than skips, without
// it.
/// <reference types="node" />
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { describe, expect, test } from "vitest";

import { marks, mastheadFlagClass } from "./national-marks-test-cases";

const root = resolve(__dirname, "../..");
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")) as {
  name: string;
  exports: Record<string, unknown>;
};
const iconEntry = `${pkg.name}/icon`;
const entries = Object.keys(pkg.exports).map((key) =>
  key.replace(/^\./, pkg.name),
);

const propSets = [
  {},
  { className: "h-8 w-auto" },
  { className: mastheadFlagClass },
];
const iconExports = marks.map(({ iconExport }) => iconExport);

// A Node program that loads every entry through the `import` or `require`
// condition. It prints the file `/icon` resolved to, each entry's export
// names, the markup of each mark for each set of props, and the markup of the
// Masthead's header.
const program = (load: string, resolveEntry: string) => `
  ${load}
  const iconExports = ${JSON.stringify(iconExports)};
  const propSets = ${JSON.stringify(propSets)};
  const iconModule = modules[${JSON.stringify(iconEntry)}];
  const { MastheadHeader } = modules[${JSON.stringify(`${pkg.name}/masthead`)}];
  console.log(JSON.stringify({
    file: ${resolveEntry}(${JSON.stringify(iconEntry)}),
    names: Object.fromEntries(
      Object.entries(modules).map(([entry, module]) => [entry, Object.keys(module)]),
    ),
    markup: Object.fromEntries(iconExports.map((name) => [
      name,
      propSets.map((props) => renderToStaticMarkup(createElement(iconModule[name], props))),
    ])),
    masthead: renderToStaticMarkup(
      createElement(MastheadHeader, null, "An official website"),
    ),
  }));`;
const programs = {
  import: program(
    `import { createElement } from "react";
     import { renderToStaticMarkup } from "react-dom/server";
     const entries = ${JSON.stringify(entries)};
     const modules = Object.fromEntries(await Promise.all(
       entries.map(async (entry) => [entry, await import(entry)]),
     ));`,
    "import.meta.resolve",
  ),
  require: program(
    `const { createElement } = require("react");
     const { renderToStaticMarkup } = require("react-dom/server");
     const entries = ${JSON.stringify(entries)};
     const modules = Object.fromEntries(
       entries.map((entry) => [entry, require(entry)]),
     );`,
    "require.resolve",
  ),
};

function load(condition: keyof typeof programs) {
  const output = execFileSync(
    process.execPath,
    [
      `--input-type=${condition === "import" ? "module" : "commonjs"}`,
      "--eval",
      programs[condition],
    ],
    // The Jata Negara alone renders about 600 KB of markup.
    { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  return JSON.parse(output) as {
    file: string;
    names: Record<string, string[]>;
    markup: Record<string, string[]>;
    masthead: string;
  };
}

// Every entry's declarations, as a consumer whose file is an ES module
// (`import`) or CommonJS (`require`) resolves them under `NodeNext`
function declarations(condition: "import" | "require") {
  const options: ts.CompilerOptions = {
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    strict: true,
    noEmit: true,
    types: [],
  };
  const consumer = resolve(
    root,
    condition === "import" ? "consumer.mts" : "consumer.cts",
  );
  const mode =
    condition === "import" ? ts.ModuleKind.ESNext : ts.ModuleKind.CommonJS;
  const files = Object.fromEntries(
    entries.map((entry) => {
      const { resolvedModule } = ts.resolveModuleName(
        entry,
        consumer,
        options,
        ts.sys,
        undefined,
        undefined,
        mode,
      );
      if (!resolvedModule) throw new Error(`${entry} has no declarations`);
      return [entry, resolvedModule.resolvedFileName];
    }),
  );
  const program = ts.createProgram(Object.values(files), options);
  const checker = program.getTypeChecker();
  const exportsOf = (entry: string) => {
    const source = program.getSourceFile(files[entry] as string);
    const module = source && checker.getSymbolAtLocation(source);
    if (!module) throw new Error(`${entry} declares no module`);
    return checker.getExportsOfModule(module).map((symbol) => {
      const target =
        symbol.flags & ts.SymbolFlags.Alias
          ? checker.getAliasedSymbol(symbol)
          : symbol;
      return {
        name: symbol.name,
        deprecated: target
          .getJsDocTags(checker)
          .filter((tag) => tag.name === "deprecated")
          .map((tag) =>
            ts.displayPartsToString(tag.text).replace(/\s+/g, " ").trim(),
          ),
        type: checker.typeToString(checker.getTypeOfSymbol(target)),
      };
    });
  };
  return { files, exportsOf };
}

describe.each([
  ["import", /\/dist\/icons\/index\.mjs$/, /\/dist\/icons\/index\.d\.mts$/],
  ["require", /\/dist\/icons\/index\.js$/, /\/dist\/icons\/index\.d\.ts$/],
] as const)("the built package, through `%s`", (condition, file, typesFile) => {
  const built = load(condition);
  const types = declarations(condition);
  const iconTypes = types.exportsOf(iconEntry);

  test("resolves `/icon` to the built entry for that condition", () => {
    expect(built.file).toMatch(file);
    expect(types.files[iconEntry]).toMatch(typesFile);
  });

  test("`/icon` exports 220 names, both marks among them", () => {
    const names = built.names[iconEntry];
    expect(names).toHaveLength(220);
    expect(names).toEqual(expect.arrayContaining(iconExports));
    expect(iconTypes.map(({ name }) => name).sort()).toEqual(
      [...(names ?? [])].sort(),
    );
  });

  test.each(marks)(
    "`/icon` renders $iconExport as the mark's own component does",
    ({ iconExport, component }) => {
      expect(built.markup[iconExport]).toEqual(
        propSets.map((props) =>
          renderToStaticMarkup(createElement(component, props)),
        ),
      );
    },
  );

  test.each(marks)(
    "`/icon` declares $iconExport deprecated, as a national mark leaving it at the next major",
    ({ iconExport, note }) => {
      const declared = iconTypes.find(({ name }) => name === iconExport);
      expect(declared?.type).toBe("FunctionComponent<SVGProps<SVGSVGElement>>");
      expect(declared?.deprecated).toHaveLength(1);
      const [text] = declared?.deprecated ?? [];
      expect(text).toMatch(/\bnational mark\b/);
      expect(text).toMatch(/\bonly an official service may show one\b/);
      expect(text).toContain(
        `removed from \`${iconEntry}\` in the next major version`,
      );
      expect(text).toMatch(note);
    },
  );

  test("`/icon` deprecates no other name", () => {
    expect(
      iconTypes
        .filter(({ deprecated }) => deprecated.length)
        .map(({ name }) => name)
        .sort(),
    ).toEqual([...iconExports].sort());
  });

  // under either the deprecated name or the component's own
  test("no other entry exports either mark", () => {
    for (const entry of entries.filter((entry) => entry !== iconEntry)) {
      const names = [
        ...(built.names[entry] ?? []),
        ...types.exportsOf(entry).map(({ name }) => name),
      ];
      for (const { privateName, iconExport } of marks) {
        expect(names, entry).not.toContain(iconExport);
        expect(names, entry).not.toContain(privateName);
      }
    }
  });

  test("the Masthead's header shows the same flag", () => {
    const flag = built.markup.MalaysiaFlagIcon?.[propSets.length - 1];
    expect(flag).toMatch(/^<svg /);
    expect(built.masthead).toContain(flag);
  });
});
