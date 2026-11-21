// @vitest-environment happy-dom
//
// The built toast entry exports ToastIcon and ToastProgress (#172): Node loads
// both through `import` and `require`, and TypeScript finds both, with their
// JSDoc, in the declarations of each condition. The Toast samples a consumer
// copies, from the develop pages (EN/MS) and from the Toast story's doc
// comment, compile against the built package as published, and the Advanced
// Usage toaster, run as published, shows the toast useToast() fires. Since
// these tests sit beside the components the build takes as entries, it also
// checks that no test file is built or exported. It needs `pnpm build` first,
// and fails, rather than skips, without it.
/// <reference types="node" />
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { computeAccessibleName } from "dom-accessibility-api";
import ts from "typescript";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { codeBlocks, commentText, metaComment } from "./docs-samples";
import type { ToastEvent } from "./toast";

const root = resolve(__dirname, "../..");
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")) as {
  name: string;
  exports: Record<string, unknown>;
};
const toastEntry = `${pkg.name}/toast`;
const hooksEntry = `${pkg.name}/hooks`;
const docsApp = resolve(root, "../../apps/docs");
const pagesDir = resolve(docsApp, "content/docs/develop/(components)");
const storyFile = resolve(
  root,
  "../../apps/storybook/stories/toast.stories.tsx",
);

const conditions = ["import", "require"] as const;
type Condition = (typeof conditions)[number];

// What the toast entry exports at runtime: everything it exported before
// #172, and ToastIcon and ToastProgress
const runtimeExports = [
  "AutoToast",
  "ToastClose",
  "ToastDescription",
  "ToastIcon",
  "ToastProgress",
  "ToastProvider",
  "ToastRoot",
  "ToastTitle",
  "ToastViewport",
];

/*========================================================================================================================*/
// The built entry

// A Node program that loads the toast entry by the package's own name from
// its root, through `condition`, and prints its export names and the two
// parts' display names
function loadBuilt(condition: Condition) {
  const load =
    condition === "import"
      ? `const entry = await import(${JSON.stringify(toastEntry)});`
      : `const entry = require(${JSON.stringify(toastEntry)});`;
  const output = execFileSync(
    process.execPath,
    [
      `--input-type=${condition === "import" ? "module" : "commonjs"}`,
      "--eval",
      `${load}
       console.log(JSON.stringify({
         names: Object.keys(entry).sort(),
         displayNames: [entry.ToastIcon?.displayName, entry.ToastProgress?.displayName],
       }));`,
    ],
    { cwd: root, encoding: "utf8" },
  );
  return JSON.parse(output) as { names: string[]; displayNames: string[] };
}

// The toast entry's declarations, as a consumer whose file is an ES module
// (`import`) or CommonJS (`require`) resolves them under `NodeNext`: the file
// they resolve to, and each export's JSDoc, by name
function declarations(condition: Condition) {
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
  const { resolvedModule } = ts.resolveModuleName(
    toastEntry,
    consumer,
    options,
    ts.sys,
    undefined,
    undefined,
    condition === "import" ? ts.ModuleKind.ESNext : ts.ModuleKind.CommonJS,
  );
  if (!resolvedModule) throw new Error(`${toastEntry} has no declarations`);
  const file = resolvedModule.resolvedFileName;
  const program = ts.createProgram([file], options);
  const checker = program.getTypeChecker();
  const source = program.getSourceFile(file);
  const module = source && checker.getSymbolAtLocation(source);
  if (!module) throw new Error(`${toastEntry} declares no module`);
  const targets = new Map(
    checker
      .getExportsOfModule(module)
      .map((symbol) => [
        symbol.name,
        symbol.flags & ts.SymbolFlags.Alias
          ? checker.getAliasedSymbol(symbol)
          : symbol,
      ]),
  );
  const docOf = (symbol: ts.Symbol | undefined) =>
    ts
      .displayPartsToString(symbol?.getDocumentationComment(checker))
      .replace(/\s+/g, " ");
  const jsdoc = Object.fromEntries(
    [...targets].map(([name, target]) => [name, docOf(target)]),
  );
  // The props a component takes: the type of its call signature's parameter
  const propsOf = (name: string) => {
    const [signature] = checker
      .getTypeOfSymbol(targets.get(name)!)
      .getCallSignatures();
    return checker.getTypeOfSymbol(signature!.parameters[0]!);
  };
  // The JSDoc of `type` on ToastEvent, ToastRoot's props and AutoToast's
  // props, as a consumer's editor shows it
  const typePropJsdoc = {
    ToastEvent: docOf(
      checker
        .getDeclaredTypeOfSymbol(targets.get("ToastEvent")!)
        .getProperty("type"),
    ),
    ToastRoot: docOf(propsOf("ToastRoot").getProperty("type")),
    AutoToast: docOf(propsOf("AutoToast").getProperty("type")),
  };
  return { file, jsdoc, typePropJsdoc };
}

describe.each(conditions)(
  "the built toast entry, through `%s`",
  (condition) => {
    test("exports ToastIcon and ToastProgress, and the rest as before", () => {
      const built = loadBuilt(condition);
      expect(built.names).toEqual(runtimeExports);
      expect(built.displayNames).toEqual(["ToastIcon", "ToastProgress"]);
    });

    test("declares the same exports, and the type ToastEvent", () => {
      const { file, jsdoc } = declarations(condition);
      expect(file).toMatch(
        condition === "import"
          ? /\/dist\/components\/toast\.d\.mts$/
          : /\/dist\/components\/toast\.d\.ts$/,
      );
      expect(Object.keys(jsdoc).sort()).toEqual(
        [...runtimeExports, "ToastEvent"].sort(),
      );
    });

    test("documents where ToastIcon and ToastProgress go and that they're hidden", () => {
      const { jsdoc } = declarations(condition);
      for (const part of ["ToastIcon", "ToastProgress"]) {
        expect(jsdoc[part]).toContain("inside a `ToastRoot`");
        expect(jsdoc[part]).toContain("hidden from assistive technology");
        expect(jsdoc[part]).toContain("the toast's title carries its meaning");
      }
      expect(jsdoc.ToastIcon).toContain("no icon for `message`");
      expect(jsdoc.ToastProgress).toContain("its duration (default 5000ms)");
    });

    // `type` sets how urgently screen readers announce a toast, and only an
    // error toast interrupts by default (ADR-0014)
    test("documents `type` on ToastEvent, ToastRoot and AutoToast: what it does, that it isn't the guideline's Type, and its default by Variant", () => {
      const { typePropJsdoc } = declarations(condition);
      for (const doc of Object.values(typePropJsdoc)) {
        expect(doc).toMatch(/^How urgently screen readers announce/);
        expect(doc).toContain(
          "It isn't the design guideline's Type, which is `variant`.",
        );
        expect(doc).toMatch(
          /an `error` toast defaults to `"foreground"`, and every other Variant to `"background"`/i,
        );
      }
      expect(typePropJsdoc.ToastRoot).toContain(
        'unlike Radix, whose default is `"foreground"` for every toast',
      );
      expect(typePropJsdoc.AutoToast).toContain(
        "a toast's own `type`, passed to `toast()`, wins",
      );
    });
  },
);

test("no test file is built, or exported as an entry", () => {
  const built = readdirSync(resolve(root, "dist"), { recursive: true }).map(
    String,
  );
  expect(built.length).toBeGreaterThan(0);
  expect(built.filter((file) => /\.test\b/.test(file))).toEqual([]);
  expect(
    JSON.stringify(pkg.exports).match(/[^"]*\.test\b[^"]*/g) ?? [],
  ).toEqual([]);
});

/*========================================================================================================================*/
// The samples

// Each Toast develop page, and the words it uses where the samples are
const pages = {
  en: {
    file: "toast.mdx",
    codeTab: '<Tab value="Code">',
    anatomy: 'title="Anatomy"',
    advanced: "### Advanced Usage",
  },
  ms: {
    file: "toast.ms.mdx",
    codeTab: '<Tab value="Kod">',
    anatomy: 'title="Anatomi"',
    advanced: "### Penggunaan Lanjutan",
  },
} as const;
type Page = keyof typeof pages;

const pageText = (page: Page) =>
  readFileSync(resolve(pagesDir, pages[page].file), "utf8");

// A page's samples: the first Code tab's, every Anatomy block, and the first
// block under the Advanced Usage heading
function samplesOf(page: Page) {
  const text = pageText(page);
  const lines = text.split("\n");
  const blocks = codeBlocks(text);
  const after = (line: string) => {
    const index = lines.findIndex((each) => each.trim() === line);
    expect(index, `${pages[page].file} has no "${line}"`).toBeGreaterThan(-1);
    return blocks.find((block) => block.line > index + 1)!;
  };
  return {
    blocks,
    codeTab: after(pages[page].codeTab),
    anatomy: blocks.filter((block) => block.info.includes(pages[page].anatomy)),
    advanced: after(pages[page].advanced),
  };
}

// The Toast story's doc comment, the JSDoc on `meta`, as written in the file
const storyComment = () => metaComment(readFileSync(storyFile, "utf8"));

// The code blocks in the story's doc comment
const storyBlocks = () => codeBlocks(commentText(storyComment()));

// Every sample a consumer pastes into a file of its own, by name
function samples() {
  const named: Record<string, string> = {};
  for (const page of ["en", "ms"] as const) {
    const { codeTab, anatomy, advanced } = samplesOf(page);
    named[`${page} Code tab`] = codeTab.code;
    anatomy.forEach((block, index) => {
      named[`${page} Anatomy ${index + 1}`] = block.code;
    });
    named[`${page} Advanced Usage`] = advanced.code;
  }
  storyBlocks().forEach((block, index) => {
    named[`story block ${index + 1}`] = block.code;
  });
  return named;
}

// The lines of `code` that are comments, and the rest, without blank lines
const commentLines = (code: string) =>
  code
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("//"));
const codeLines = (code: string) =>
  code
    .split("\n")
    .filter((line) => line.trim() && !line.trim().startsWith("//"));

describe("the Toast develop pages", () => {
  test("show one Anatomy block on each page, and the Malay one in Malay", () => {
    const en = samplesOf("en");
    const ms = samplesOf("ms");
    expect(en.anatomy).toHaveLength(1);
    expect(ms.anatomy).toHaveLength(1);
    expect(codeLines(ms.anatomy[0]!.code)).toEqual(
      codeLines(en.anatomy[0]!.code),
    );
    expect(commentLines(ms.anatomy[0]!.code)).toEqual([
      "// Kemudian, terbitkan atau hantar peristiwa baru kepada Toast",
    ]);
  });

  test("show the same code in Malay as in English, with the comments translated", () => {
    const en = samplesOf("en");
    const ms = samplesOf("ms");
    for (const sample of ["codeTab", "advanced"] as const) {
      expect(codeLines(ms[sample].code)).toEqual(codeLines(en[sample].code));
      const english = new Set(commentLines(en[sample].code));
      expect(
        commentLines(ms[sample].code).filter((line) => english.has(line)),
      ).toEqual([]);
    }
  });

  test.each(["en", "ms"] as const)(
    "copy no `props` in any %s code block",
    (page) => {
      const { blocks } = samplesOf(page);
      expect(blocks.length).toBeGreaterThan(0);
      expect(
        blocks
          .filter((block) => /\bprops\b/.test(block.code))
          .map((block) => block.line),
      ).toEqual([]);
    },
  );

  test("keep the English Advanced Usage heading, which other pages link to as #advanced-usage", () => {
    expect(pageText("en").split("\n")).toContain("### Advanced Usage");
  });

  // The names a page imports from the docs site's component module
  // (`@/components/myds`)
  const importedNames = (page: Page) =>
    [
      ...pageText(page).matchAll(
        /import\s*\{([^}]*)\}\s*from\s*"@\/components\/myds"/g,
      ),
    ].flatMap((match) =>
      match[1]!
        .split(",")
        .map((name) => name.trim().split(/\s+as\s+/)[0]!)
        .filter(Boolean),
    );

  // What the docs site's component module exports, by TypeScript's checker,
  // with the docs site's compiler options
  function docsModuleExports() {
    const config = ts.getParsedCommandLineOfConfigFile(
      resolve(docsApp, "tsconfig.json"),
      undefined,
      {
        ...ts.sys,
        onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
          throw new Error(
            ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
          );
        },
      },
    );
    if (!config) throw new Error("The docs site's tsconfig.json can't be read");
    const file = resolve(docsApp, "components/myds.tsx");
    const program = ts.createProgram([file], {
      ...config.options,
      incremental: false,
      noEmit: true,
    });
    const checker = program.getTypeChecker();
    const source = program.getSourceFile(file);
    const module = source && checker.getSymbolAtLocation(source);
    if (!module) throw new Error("components/myds.tsx declares no module");
    return checker.getExportsOfModule(module).map((symbol) => symbol.name);
  }

  test("import from the docs site's component module only names it exports", () => {
    const exported = new Set(docsModuleExports());
    expect(exported.has("AutoToast")).toBe(true);
    for (const page of ["en", "ms"] as const) {
      const names = importedNames(page);
      expect(names.length).toBeGreaterThan(0);
      expect(names.filter((name) => !exported.has(name))).toEqual([]);
    }
  });
});

describe("the Toast story's doc comment", () => {
  test("closes only at its end", () => {
    const comment = storyComment();
    expect(comment.startsWith("/**")).toBe(true);
    expect(comment.indexOf("*/")).toBe(comment.length - 2);
  });

  test("shows the first Code tab's sample and the Advanced Usage toaster", () => {
    const en = samplesOf("en");
    expect(storyBlocks().map((block) => block.code)).toEqual([
      en.codeTab.code,
      en.advanced.code,
    ]);
  });
});

// Compiler options of a consumer's project: React 19's types, `strict`,
// `noUnusedLocals` and the automatic JSX runtime, resolving modules as Node
// or a bundler does
const consumerOptions = (resolution: "nodenext" | "bundler") => {
  const { options, errors } = ts.convertCompilerOptionsFromJson(
    {
      strict: true,
      noUnusedLocals: true,
      noEmit: true,
      jsx: "react-jsx",
      target: "es2022",
      lib: ["es2022", "dom", "dom.iterable"],
      module: resolution === "nodenext" ? "nodenext" : "esnext",
      moduleResolution: resolution,
      types: [],
    },
    root,
  );
  expect(errors).toEqual([]);
  return options;
};

// The errors TypeScript reports for each sample in a `.tsx` file of its own
// in a consumer's project, by sample
function compile(
  named: Record<string, string>,
  resolution: "nodenext" | "bundler",
) {
  const options = consumerOptions(resolution);
  const files = new Map(
    Object.entries(named).map(([name, code], index) => [
      resolve(root, `toast-sample-${index}.tsx`),
      { name, code },
    ]),
  );
  const diskHost = ts.createCompilerHost(options, true);
  const host: ts.CompilerHost = {
    ...diskHost,
    fileExists: (fileName) =>
      files.has(fileName) || diskHost.fileExists(fileName),
    readFile: (fileName) =>
      files.get(fileName)?.code ?? diskHost.readFile(fileName),
    getSourceFile: (fileName, languageVersion, onError) => {
      const file = files.get(fileName);
      return file
        ? ts.createSourceFile(fileName, file.code, languageVersion, true)
        : diskHost.getSourceFile(fileName, languageVersion, onError);
    },
  };
  const program = ts.createProgram({
    rootNames: [...files.keys()],
    options,
    host,
  });
  return Object.fromEntries(
    [...files].map(([fileName, { name }]) => [
      name,
      ts
        .getPreEmitDiagnostics(program, program.getSourceFile(fileName))
        .map((diagnostic) => {
          const { line } = diagnostic.start
            ? diagnostic.file!.getLineAndCharacterOfPosition(diagnostic.start)
            : { line: -1 };
          return `${line + 1}: TS${diagnostic.code} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")}`;
        }),
    ]),
  );
}

describe("each Toast sample", () => {
  test("is there: three on each page and two in the story", () => {
    expect(Object.keys(samples())).toEqual([
      "en Code tab",
      "en Anatomy 1",
      "en Advanced Usage",
      "ms Code tab",
      "ms Anatomy 1",
      "ms Advanced Usage",
      "story block 1",
      "story block 2",
    ]);
  });

  test.each(["nodenext", "bundler"] as const)(
    "compiles with no errors in a consumer's file of its own, resolving modules as `%s`",
    (resolution) => {
      const named = samples();
      const errors = compile(named, resolution);
      expect(errors).toEqual(
        Object.fromEntries(Object.keys(named).map((name) => [name, []])),
      );
    },
  );

  test('that calls a hook or renders AutoToast or ToastProvider opens with "use client"', () => {
    const clientOnly = Object.entries(samples()).filter(([, code]) =>
      /\buse[A-Z]\w*\(|<(AutoToast|ToastProvider)\b/.test(code),
    );
    expect(clientOnly.length).toBeGreaterThan(0);
    expect(
      clientOnly
        .filter(([, code]) => !code.startsWith('"use client";\n'))
        .map(([name]) => name),
    ).toEqual([]);
  });
});

/*========================================================================================================================*/
// The Advanced Usage toaster, run as published

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

// The built package and React, loaded as a consumer's bundle loads them, by
// name from the package root, so the toaster and the test share them
const load = createRequire(resolve(root, "package.json"));
const React = load("react") as typeof import("react");
const { createRoot } = load(
  "react-dom/client",
) as typeof import("react-dom/client");
const { useToast } = load(hooksEntry) as typeof import("../hooks");

// The module a sample's code makes, compiled as a bundler compiles it, with
// its imports loaded from the built package
function run(code: string) {
  const { outputText } = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const module = { exports: {} as Record<string, unknown> };
  new Function("require", "module", "exports", outputText)(
    load,
    module,
    module.exports,
  );
  return module.exports;
}

const unmounts: (() => Promise<void>)[] = [];

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

// No test logs an error or a warning, and nothing is left on the page
afterEach(async () => {
  while (unmounts.length) await unmounts.pop()!();
  const logged = [
    ...vi.mocked(console.error).mock.calls,
    ...vi.mocked(console.warn).mock.calls,
  ];
  vi.restoreAllMocks();
  expect(logged).toEqual([]);
  expect(document.body.innerHTML).toBe("");
});

describe.each(["en", "ms"] as const)(
  "the %s Advanced Usage toaster, as published",
  (page) => {
    // Mounts the page's toaster beside a sibling that calls useToast(), on
    // its own or in StrictMode. Returns the container and the sibling's
    // `toast`.
    async function mountToaster(strict: boolean) {
      const Toaster = run(samplesOf(page).advanced.code).default as
        import("react").FunctionComponent | undefined;
      expect(typeof Toaster).toBe("function");

      let toast: ReturnType<typeof useToast>["toast"] = () => {};
      const Sender = () => {
        toast = useToast().toast;
        return null;
      };
      const container = document.body.appendChild(
        document.createElement("div"),
      );
      const reactRoot = createRoot(container);
      unmounts.push(async () => {
        await React.act(async () => reactRoot.unmount());
        container.remove();
      });
      const app = React.createElement(
        React.Fragment,
        null,
        React.createElement(Toaster!),
        React.createElement(Sender),
      );
      await React.act(async () =>
        reactRoot.render(
          strict ? React.createElement(React.StrictMode, null, app) : app,
        ),
      );
      expect(container.querySelectorAll("li")).toHaveLength(0);
      return { container, toast: (event: ToastEvent) => toast(event) };
    }

    // Only an error toast interrupts by default, and the toaster passes
    // each event's `type` to its ToastRoot, so `type` in toast() wins
    // (ADR-0014). Radix fills each toast's announcement in two animation
    // frames and removes it a second later, so it's read after 100ms.
    test.each([
      ["an error toast", "assertive", { variant: "error" }],
      ["a success toast", "polite", { variant: "success" }],
      [
        'a success toast fired with `type: "foreground"`',
        "assertive",
        { variant: "success", type: "foreground" },
      ],
    ] as const)("announces %s as %s", async (_, live, event) => {
      const { container, toast } = await mountToaster(false);
      await React.act(async () => toast({ ...event, title: "Disimpan" }));
      expect(container.querySelectorAll("li")).toHaveLength(1);
      await React.act(() => new Promise((resolve) => setTimeout(resolve, 100)));
      const [status, ...others] = document.querySelectorAll('[role="status"]');
      expect(others).toEqual([]);
      expect(status!.textContent).toBe("Notification Disimpan");
      expect(status!.getAttribute("aria-live")).toBe(live);
    });

    test.each([
      ["on its own", false],
      ["in StrictMode", true],
    ] as const)(
      "shows the one toast a sibling's useToast() fires, %s",
      async (_, strict) => {
        const { container, toast } = await mountToaster(strict);

        await React.act(async () =>
          toast({
            variant: "success",
            title: "Disimpan",
            description: "Perubahan anda disimpan.",
          }),
        );

        const [toastRoot, ...others] = container.querySelectorAll("li");
        expect(others).toEqual([]);
        expect(toastRoot!.textContent).toBe("DisimpanPerubahan anda disimpan.");
        const [close, ...otherButtons] = toastRoot!.querySelectorAll("button");
        expect(otherButtons).toEqual([]);
        expect(computeAccessibleName(close!)).toBe("Close");
        const statusIcons = [...toastRoot!.querySelectorAll("svg")].filter(
          (svg) => !close!.contains(svg),
        );
        expect(statusIcons).toHaveLength(1);
        expect(statusIcons[0]!.parentElement!.getAttribute("aria-hidden")).toBe(
          "true",
        );
        const [bar, ...otherBars] =
          toastRoot!.querySelectorAll(".animate-expire");
        expect(otherBars).toEqual([]);
        expect(bar!.getAttribute("aria-hidden")).toBe("true");
      },
    );
  },
);

test("the build is there", () => {
  for (const file of ["toast.js", "toast.mjs", "toast.d.ts", "toast.d.mts"])
    expect(existsSync(resolve(root, "dist/components", file))).toBe(true);
});
