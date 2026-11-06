// Every context, and the toast emitter, must be made through the registry
// (`registry.ts`), so that every bundled copy of the library shares one of
// each (#119, #235). This reads `src` with TypeScript's checker, by symbol
// rather than by name, so it needs no build. In the modules the build's entry
// points import, only the registry may refer to React's `createContext`,
// under any name or by any path, and mitt only as `sharedEmitter`'s second
// argument. `sharedContext` and `sharedEmitter` are only called, each with a
// string literal name, and no two calls take the same one. Every copy of a
// major shares what the first copy made, so the snapshot keeps each name and
// default value under review.
/// <reference types="node" />
import { readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import ts from "typescript";
import { beforeAll, describe, expect, test } from "vitest";

const root = resolve(__dirname, "../..");
const src = resolve(root, "src");
const registry = resolve(src, "utils/registry.ts");

const config = ts.getParsedCommandLineOfConfigFile(
  resolve(root, "tsconfig.json"),
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
if (!config) throw new Error("tsconfig.json can't be read");
const { options } = config;

// One host for every program here. It parses each file on disk once, and
// serves the self-tests' modules from memory.
const inMemory = new Map<string, string>();
const parsed = new Map<string, ts.SourceFile | undefined>();
const diskHost = ts.createCompilerHost(options, true);
const host: ts.CompilerHost = {
  ...diskHost,
  fileExists: (fileName) =>
    inMemory.has(fileName) || diskHost.fileExists(fileName),
  readFile: (fileName) => inMemory.get(fileName) ?? diskHost.readFile(fileName),
  getSourceFile: (fileName, languageVersion, onError) => {
    const text = inMemory.get(fileName);
    if (text !== undefined)
      return ts.createSourceFile(fileName, text, languageVersion, true);
    if (!parsed.has(fileName))
      parsed.set(
        fileName,
        diskHost.getSourceFile(fileName, languageVersion, onError),
      );
    return parsed.get(fileName);
  },
};
const programOf = (rootNames: readonly string[]) =>
  ts.createProgram({ rootNames, options, host });

const collapse = (text: string) => text.replace(/\s+/g, " ").trim();
const label = (fileName: string) => relative(src, fileName);

// The build's entry points, from `entryPoints` in tsup.config.ts
function entryPoints(): string[] {
  const file = resolve(root, "tsup.config.ts");
  const config = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  let globs: string[] | undefined;
  const visit = (node: ts.Node): void => {
    if (
      ts.isPropertyAssignment(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === "entryPoints" &&
      ts.isArrayLiteralExpression(node.initializer)
    )
      globs = node.initializer.elements.map((element) => {
        if (!ts.isStringLiteralLike(element))
          throw new Error(
            `An entry point isn't a string: ${element.getText()}`,
          );
        return element.text;
      });
    ts.forEachChild(node, visit);
  };
  visit(config);
  if (!globs) throw new Error("tsup.config.ts names no entryPoints");
  return ts.sys.readDirectory(root, [".ts", ".tsx"], undefined, globs);
}

// Each module a file loads: what it imports or re-exports, other than
// `import type` and `export type`, and what it imports dynamically
function moduleSpecifiers(file: ts.SourceFile): ts.Expression[] {
  const found: ts.Expression[] = [];
  const visit = (node: ts.Node): void => {
    if (
      ts.isImportDeclaration(node) &&
      node.importClause?.phaseModifier !== ts.SyntaxKind.TypeKeyword
    )
      found.push(node.moduleSpecifier);
    else if (
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier &&
      !node.isTypeOnly
    )
      found.push(node.moduleSpecifier);
    else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference) &&
      !node.isTypeOnly
    )
      found.push(node.moduleReference.expression);
    else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments[0]
    )
      found.push(node.arguments[0]);
    ts.forEachChild(node, visit);
  };
  visit(file);
  return found;
}

// The modules in `src` that the entry points load, themselves included
function shippedModules(program: ts.Program, entries: readonly string[]) {
  const checker = program.getTypeChecker();
  const seen = new Set<string>();
  const visit = (fileName: string): void => {
    if (seen.has(fileName)) return;
    const file = program.getSourceFile(fileName);
    if (!file) throw new Error(`${fileName} isn't in the program`);
    seen.add(fileName);
    for (const specifier of moduleSpecifiers(file)) {
      const loaded = checker
        .getSymbolAtLocation(specifier)
        ?.declarations?.find(ts.isSourceFile);
      if (
        loaded &&
        !loaded.isDeclarationFile &&
        !program.isSourceFileFromExternalLibrary(loaded) &&
        !relative(src, loaded.fileName).startsWith("..") &&
        /\.tsx?$/.test(loaded.fileName)
      )
        visit(loaded.fileName);
    }
  };
  entries.forEach(visit);
  return [...seen].sort();
}

type Rule = "createContext" | "mitt" | "helper" | "require" | "duplicate";
type Target = "createContext" | "mitt" | "sharedContext" | "sharedEmitter";

interface Made {
  name: string;
  kind: "context" | "emitter";
  file: string;
  line: number;
  text: string;
  value: ts.Expression | undefined;
}

const isLiteral = (node: ts.Expression) =>
  ts.isStringLiteralLike(node) ||
  ts.isNumericLiteral(node) ||
  ts.isBigIntLiteral(node) ||
  node.kind === ts.SyntaxKind.TrueKeyword ||
  node.kind === ts.SyntaxKind.FalseKeyword ||
  node.kind === ts.SyntaxKind.NullKeyword ||
  (ts.isPrefixUnaryExpression(node) &&
    node.operator === ts.SyntaxKind.MinusToken &&
    ts.isNumericLiteral(node.operand));

// An expression without the parentheses, type assertions and `!` around it
function unwrap(node: ts.Expression): ts.Expression {
  while (
    ts.isParenthesizedExpression(node) ||
    ts.isAsExpression(node) ||
    ts.isSatisfiesExpression(node) ||
    ts.isTypeAssertionExpression(node) ||
    ts.isNonNullExpression(node)
  )
    node = node.expression;
  return node;
}

// What the files make through the registry, and every rule they break, each
// as `file:line: the line`. The registry itself may refer to anything, but
// not require react or mitt.
function inspect(program: ts.Program, fileNames: readonly string[]) {
  const checker = program.getTypeChecker();
  const resolveAlias = (symbol: ts.Symbol) =>
    symbol.flags & ts.SymbolFlags.Alias
      ? checker.getAliasedSymbol(symbol)
      : symbol;

  const helperFile = program.getSourceFile(registry);
  const helperModule = helperFile && checker.getSymbolAtLocation(helperFile);
  const helperDeclaration = (name: string) => {
    const symbol =
      helperModule && checker.tryGetMemberInModuleExports(name, helperModule);
    const declaration = symbol && resolveAlias(symbol).valueDeclaration;
    if (!declaration) throw new Error(`registry.ts exports no ${name}`);
    return declaration;
  };
  const helpers = new Map<ts.Declaration, Target>([
    [helperDeclaration("sharedContext"), "sharedContext"],
    [helperDeclaration("sharedEmitter"), "sharedEmitter"],
  ]);

  // React's `createContext`, mitt's default export, or one of the helpers
  const targetOf = (symbol: ts.Symbol | undefined): Target | undefined => {
    if (!symbol) return undefined;
    const target = resolveAlias(symbol);
    for (const declaration of target.declarations ?? []) {
      const helper = helpers.get(declaration);
      if (helper) return helper;
      if (!ts.isFunctionDeclaration(declaration)) continue;
      const { fileName } = declaration.getSourceFile();
      if (
        declaration.name?.text === "createContext" &&
        /\/node_modules\/@types\/react\/index\.d\.ts$/.test(fileName)
      )
        return "createContext";
      if (
        /\/node_modules\/mitt\/index\.d\.ts$/.test(fileName) &&
        declaration.modifiers?.some(
          ({ kind }) => kind === ts.SyntaxKind.DefaultKeyword,
        )
      )
        return "mitt";
    }
    return undefined;
  };

  // The symbol a name refers to: a destructured name to the property it
  // takes, and a shorthand property to the value it's given
  const referenced = (node: ts.Node): ts.Symbol | undefined => {
    const { parent } = node;
    if (!parent) return undefined;
    if (
      ts.isBindingElement(parent) &&
      ts.isObjectBindingPattern(parent.parent) &&
      (parent.propertyName ?? parent.name) === node
    ) {
      const key =
        ts.isIdentifier(node) || ts.isStringLiteralLike(node)
          ? node.text
          : ts.isComputedPropertyName(node) &&
              ts.isStringLiteralLike(node.expression)
            ? node.expression.text
            : undefined;
      return key === undefined
        ? undefined
        : checker.getTypeAtLocation(parent.parent).getProperty(key);
    }
    if (ts.isShorthandPropertyAssignment(parent) && parent.name === node)
      return checker.getShorthandAssignmentValueSymbol(parent);
    if (
      ts.isIdentifier(node) ||
      (ts.isStringLiteralLike(node) &&
        ts.isElementAccessExpression(parent) &&
        parent.argumentExpression === node)
    )
      return checker.getSymbolAtLocation(node);
    return undefined;
  };

  // The expression a reference is: `R.name` for the name in it, `R["name"]`
  // for the string in it
  const expressionOf = (node: ts.Node): ts.Node =>
    (ts.isPropertyAccessExpression(node.parent) && node.parent.name === node) ||
    (ts.isElementAccessExpression(node.parent) &&
      node.parent.argumentExpression === node)
      ? node.parent
      : node;
  const calleeOf = (call: ts.CallExpression) =>
    targetOf(
      checker.getSymbolAtLocation(
        ts.isPropertyAccessExpression(call.expression)
          ? call.expression.name
          : call.expression,
      ),
    );

  const violations = new Map<Rule, Map<string, string>>();
  const made: Made[] = [];
  const at = (file: ts.SourceFile, node: ts.Node) => {
    const { line } = file.getLineAndCharacterOfPosition(node.getStart(file));
    return {
      file: label(file.fileName),
      line: line + 1,
      text: (file.text.split("\n")[line] ?? "").trim(),
    };
  };
  const report = (
    rule: Rule,
    { file, line, text }: { file: string; line: number; text: string },
  ) => {
    const sites = violations.get(rule) ?? new Map<string, string>();
    sites.set(`${file}:${line}`, `${file}:${line}: ${text}`);
    violations.set(rule, sites);
  };

  const requiresReactOrMitt = (call: ts.CallExpression) => {
    if (!ts.isIdentifier(call.expression) || call.expression.text !== "require")
      return false;
    // Unless the module declares a `require` of its own
    const declared = checker.getSymbolAtLocation(call.expression)?.declarations;
    if (declared?.some((d) => !d.getSourceFile().isDeclarationFile))
      return false;
    // or loads a module it doesn't name
    const [specifier] = call.arguments;
    return (
      !specifier ||
      !ts.isStringLiteralLike(specifier) ||
      /^(react|mitt)(\/|$)/.test(specifier.text)
    );
  };

  for (const fileName of fileNames) {
    const file = program.getSourceFile(fileName);
    if (!file) throw new Error(`${fileName} isn't in the program`);
    const isHelper = fileName === registry;

    const check = (target: Target, node: ts.Node) => {
      const expression = expressionOf(node);
      const call = expression.parent;
      switch (target) {
        case "createContext":
          return report("createContext", at(file, node));
        case "mitt":
          if (
            !ts.isCallExpression(call) ||
            call.arguments[1] !== expression ||
            calleeOf(call) !== "sharedEmitter"
          )
            report("mitt", at(file, node));
          return;
        default: {
          const [name, value] = ts.isCallExpression(call) ? call.arguments : [];
          if (
            !ts.isCallExpression(call) ||
            call.expression !== expression ||
            !name ||
            !ts.isStringLiteralLike(name)
          )
            return report("helper", at(file, node));
          made.push({
            name: name.text,
            kind: target === "sharedContext" ? "context" : "emitter",
            ...at(file, call),
            value,
          });
        }
      }
    };

    const visit = (node: ts.Node): void => {
      if (ts.isCallExpression(node) && requiresReactOrMitt(node))
        report("require", at(file, node));
      if (isHelper) return ts.forEachChild(node, visit);
      // An import makes nothing on its own: each name it brings in is
      // checked where it's used
      if (ts.isImportDeclaration(node)) return;

      const target = targetOf(referenced(node));
      if (target) check(target, node);
      // A call, or a property read with a computed key, through any name
      const reached = ts.isCallExpression(node)
        ? node.expression
        : ts.isElementAccessExpression(node) &&
            !ts.isStringLiteralLike(node.argumentExpression)
          ? node
          : undefined;
      if (reached) {
        const typed = targetOf(checker.getTypeAtLocation(reached).symbol);
        if (typed === "createContext" || typed === "mitt")
          check(typed, reached);
      }
      ts.forEachChild(node, visit);
    };
    visit(file);
  }

  // Contexts and the emitter share one namespace
  for (const site of made)
    if (made.some((other) => other !== site && other.name === site.name))
      report("duplicate", site);

  const sorted = (rule: Rule) =>
    [...(violations.get(rule)?.values() ?? [])].sort((a, b) =>
      a.localeCompare(b, "en", { numeric: true }),
    );
  return {
    violations: Object.fromEntries(
      (
        ["createContext", "mitt", "helper", "require", "duplicate"] as const
      ).map((rule) => [rule, sorted(rule)]),
    ) as Record<Rule, string[]>,
    made,
    // Each name, what it makes and where, and a context's default value
    review: Object.fromEntries(
      made
        .sort((a, b) => a.name.localeCompare(b.name, "en"))
        .map(({ name, kind, file, value }) => [
          name,
          kind === "emitter"
            ? { kind, file }
            : { kind, file, default: describeValue(checker, value) },
        ]),
    ),
  };
}

// A default value for review: an object literal as each key's source text,
// any other value as its own. A name bound to a `const` with a literal
// initializer reads as that literal, and a string literal is in single
// quotes, which the snapshot shows as they are.
function describeValue(
  checker: ts.TypeChecker,
  value: ts.Expression | undefined,
): string | Record<string, string> {
  const constant = (symbol: ts.Symbol | undefined) => {
    const target =
      symbol && symbol.flags & ts.SymbolFlags.Alias
        ? checker.getAliasedSymbol(symbol)
        : symbol;
    const declaration = target?.valueDeclaration;
    if (
      declaration &&
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer &&
      ts.getCombinedNodeFlags(declaration) & ts.NodeFlags.Const
    ) {
      const initializer = unwrap(declaration.initializer);
      if (isLiteral(initializer)) return literal(initializer);
    }
    return undefined;
  };
  const literal = (node: ts.Expression) =>
    ts.isStringLiteralLike(node)
      ? `'${node.text.replace(/[\\']/g, "\\$&")}'`
      : collapse(node.getText());
  const source = (node: ts.Expression) =>
    (ts.isIdentifier(node) && constant(checker.getSymbolAtLocation(node))) ||
    (isLiteral(node) ? literal(node) : collapse(node.getText()));
  const key = (name: ts.PropertyName) =>
    ts.isIdentifier(name) ||
    ts.isStringLiteral(name) ||
    ts.isNumericLiteral(name)
      ? name.text
      : collapse(name.getText());

  if (!value) return "(none)";
  const node = unwrap(value);
  if (!ts.isObjectLiteralExpression(node)) return source(node);
  return Object.fromEntries(
    node.properties.map((property) => {
      if (ts.isPropertyAssignment(property))
        return [key(property.name), source(unwrap(property.initializer))];
      if (ts.isShorthandPropertyAssignment(property))
        return [
          property.name.text,
          constant(checker.getShorthandAssignmentValueSymbol(property)) ??
            property.name.text,
        ];
      if (ts.isSpreadAssignment(property))
        return [collapse(property.getText()), source(property.expression)];
      return [key(property.name), collapse(property.getText())];
    }),
  );
}

// Each value import or re-export of mitt in a file. The registry takes mitt
// as an argument, so an entry that makes only contexts never loads it.
function mittValueImports(file: ts.SourceFile): string[] {
  const loadsMitt = (statement: ts.Statement) => {
    if (ts.isImportDeclaration(statement)) {
      const clause = statement.importClause;
      const bindings = clause?.namedBindings;
      return (
        !clause ||
        (clause.phaseModifier !== ts.SyntaxKind.TypeKeyword &&
          (!!clause.name ||
            (!!bindings &&
              (ts.isNamespaceImport(bindings) ||
                bindings.elements.some(({ isTypeOnly }) => !isTypeOnly)))))
      );
    }
    if (ts.isExportDeclaration(statement)) {
      const clause = statement.exportClause;
      return (
        !statement.isTypeOnly &&
        (!clause ||
          ts.isNamespaceExport(clause) ||
          clause.elements.some(({ isTypeOnly }) => !isTypeOnly))
      );
    }
    return (
      ts.isImportEqualsDeclaration(statement) &&
      ts.isExternalModuleReference(statement.moduleReference) &&
      !statement.isTypeOnly
    );
  };
  const specifier = (statement: ts.Statement) =>
    ts.isImportDeclaration(statement) || ts.isExportDeclaration(statement)
      ? statement.moduleSpecifier
      : ts.isImportEqualsDeclaration(statement) &&
          ts.isExternalModuleReference(statement.moduleReference)
        ? statement.moduleReference.expression
        : undefined;
  return file.statements
    .filter((statement) => {
      const module = specifier(statement);
      return (
        module &&
        ts.isStringLiteralLike(module) &&
        module.text === "mitt" &&
        loadsMitt(statement)
      );
    })
    .map((statement) => collapse(statement.getText()));
}

describe("the modules the build ships", () => {
  let shipped: string[];
  let found: ReturnType<typeof inspect>;
  beforeAll(() => {
    const entries = entryPoints();
    // The registry, too, so its helpers are known before anything uses them
    const program = programOf([...entries, registry]);
    const modules = shippedModules(program, entries);
    shipped = modules.map(label);
    found = inspect(program, modules);
  }, 120_000);

  test("are the entry points' modules and what they import", () => {
    expect(shipped).toEqual(
      expect.arrayContaining([
        "components/button.tsx",
        "components/toast.tsx",
        "hooks/index.ts",
        "hooks/use-theme.tsx",
        "icons/index.ts",
        "utils/events.ts",
        "utils/index.ts",
      ]),
    );
    expect(
      shipped.filter((file) => /\.test\.|test-page|test-cases/.test(file)),
    ).toEqual([]);
  });

  test("refer to React's createContext only in the registry", () => {
    expect(found.violations.createContext).toEqual([]);
  });

  test("refer to mitt only as sharedEmitter's second argument", () => {
    expect(found.violations.mitt).toEqual([]);
  });

  test("only call sharedContext and sharedEmitter, each with a string literal name", () => {
    expect(found.violations.helper).toEqual([]);
  });

  test("give each context and the emitter a name of its own", () => {
    expect(found.violations.duplicate).toEqual([]);
  });

  test("don't require react or mitt", () => {
    expect(found.violations.require).toEqual([]);
  });

  test("make 18 contexts and 1 emitter through the registry", () => {
    const count = (kind: Made["kind"]) =>
      found.made.filter((made) => made.kind === kind).length;
    expect(
      { contexts: count("context"), emitters: count("emitter") },
      "every context and the toast emitter, made through the registry (#119)",
    ).toEqual({ contexts: 18, emitters: 1 });
  });

  // A change here is a change to what every copy of the major shares
  // (`registry.ts`)
  test("keep each name and default value under review", () => {
    expect(found.review).toMatchInlineSnapshot();
  });
});

test("the registry imports mitt only as a type", () => {
  const file = ts.createSourceFile(
    registry,
    readFileSync(registry, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );
  expect(mittValueImports(file)).toEqual([]);
});

// The detector, over modules made here. A line it must report ends with the
// rules it breaks, as `// reported: rule, rule`.
describe("the check", () => {
  const cases: { name: string; modules: Record<string, string> }[] = [
    {
      name: "createContext imported by name and called",
      modules: {
        "a.tsx": `
          import { createContext } from "react";
          export const A = createContext(0); // reported: createContext
        `,
      },
    },
    {
      name: "createContext imported under another name",
      modules: {
        "a.tsx": `
          import { createContext as make } from "react";
          export const A = make(0); // reported: createContext
        `,
      },
    },
    {
      name: "React.createContext through a namespace import",
      modules: {
        "a.tsx": `
          import * as React from "react";
          export const A = React.createContext(0); // reported: createContext
        `,
      },
    },
    {
      name: "React.createContext through the default import",
      modules: {
        "a.tsx": `
          import React from "react";
          export const A = React.createContext(0); // reported: createContext
        `,
      },
    },
    {
      name: "a destructured alias",
      modules: {
        "a.tsx": `
          import * as React from "react";
          const { createContext: make } = React; // reported: createContext
          export const A = make(0); // reported: createContext
        `,
      },
    },
    {
      name: "a destructured name",
      modules: {
        "a.tsx": `
          import React from "react";
          const { createContext } = React; // reported: createContext
          export const A = createContext(0); // reported: createContext
        `,
      },
    },
    {
      name: "a variable alias",
      modules: {
        "a.tsx": `
          import * as React from "react";
          const make = React.createContext; // reported: createContext
          export const A = make(0); // reported: createContext
        `,
      },
    },
    {
      name: "a shorthand property",
      modules: {
        "a.tsx": `
          import { createContext } from "react";
          const react = { createContext }; // reported: createContext
          export const A = react.createContext(0); // reported: createContext
        `,
      },
    },
    {
      name: "createContext.call",
      modules: {
        "a.tsx": `
          import { createContext } from "react";
          export const A = createContext.call(null, 0); // reported: createContext
        `,
      },
    },
    {
      name: "createContext.apply",
      modules: {
        "a.tsx": `
          import { createContext } from "react";
          export const A = createContext.apply(null, [0]); // reported: createContext
        `,
      },
    },
    {
      name: "createContext.bind",
      modules: {
        "a.tsx": `
          import * as React from "react";
          const make = React.createContext.bind(null); // reported: createContext
          export const A = make(0); // reported: createContext
        `,
      },
    },
    {
      name: "(0, R.createContext)(…)",
      modules: {
        "a.tsx": `
          import * as R from "react";
          export const A = (0, R.createContext)(0); // reported: createContext
        `,
      },
    },
    {
      name: 'R["createContext"]',
      modules: {
        "a.tsx": `
          import * as R from "react";
          export const A = R["createContext"](0); // reported: createContext
        `,
      },
    },
    {
      name: "R[key] with a constant key",
      modules: {
        "a.tsx": `
          import * as R from "react";
          const key = "createContext";
          export const A = R[key](0); // reported: createContext
        `,
      },
    },
    {
      name: 'require("react").createContext',
      modules: {
        "a.tsx": `
          export const A = require("react").createContext(0); // reported: require
        `,
      },
    },
    {
      name: 'import R = require("react")',
      modules: {
        "a.tsx": `
          import R = require("react");
          export const A = R.createContext(0); // reported: createContext
        `,
      },
    },
    {
      name: 'import("react")',
      modules: {
        "a.tsx": `
          export const A = import("react").then((R) =>
            R.createContext(0), // reported: createContext
          );
        `,
      },
    },
    {
      name: "createContext re-exported",
      modules: {
        "a.tsx": `
          export { createContext as make } from "react"; // reported: createContext
        `,
      },
    },
    {
      name: "mitt()",
      modules: {
        "a.ts": `
          import mitt from "mitt";
          export const emitter = mitt<{ a: number }>(); // reported: mitt
        `,
      },
    },
    {
      name: "mitt aliased",
      modules: {
        "a.ts": `
          import mitt from "mitt";
          const make = mitt; // reported: mitt
          export const emitter = make(); // reported: mitt
        `,
      },
    },
    {
      name: "mitt imported as default under another name",
      modules: {
        "a.ts": `
          import make from "mitt";
          export const emitter = make(); // reported: mitt
        `,
      },
    },
    {
      name: 'import { default as m } from "mitt"',
      modules: {
        "a.ts": `
          import { default as make } from "mitt";
          export const emitter = make(); // reported: mitt
        `,
      },
    },
    {
      name: 'import * as M from "mitt" and M.default()',
      modules: {
        "a.ts": `
          import * as M from "mitt";
          export const emitter = M.default(); // reported: mitt
        `,
      },
    },
    {
      name: 'require("mitt")',
      modules: {
        "a.ts": `
          export const emitter = require("mitt").default(); // reported: require
        `,
      },
    },
    {
      name: "mitt called in what sharedEmitter's given",
      modules: {
        "a.ts": `
          import mitt from "mitt";
          import { sharedEmitter } from "../utils/registry";
          export const emitter = sharedEmitter("E", () => mitt()); // reported: mitt
        `,
      },
    },
    {
      name: "mitt given to sharedContext",
      modules: {
        "a.ts": `
          import mitt from "mitt";
          import { sharedContext } from "../utils/registry";
          export const A = sharedContext("A", mitt); // reported: mitt
        `,
      },
    },
    {
      name: "sharedContext with a name that isn't a literal",
      modules: {
        "a.tsx": `
          import { sharedContext } from "../utils/registry";
          const name = "A";
          export const A = sharedContext(name, 0); // reported: helper
        `,
      },
    },
    {
      name: "sharedContext with a template literal that has a substitution",
      modules: {
        "a.tsx": `
          import { sharedContext } from "../utils/registry";
          export const A = sharedContext(\`A\${1}\`, 0); // reported: helper
        `,
      },
    },
    {
      name: "sharedEmitter with a name that isn't a literal",
      modules: {
        "a.ts": `
          import mitt from "mitt";
          import { sharedEmitter } from "../utils/registry";
          const name = "E";
          export const emitter = sharedEmitter(name, mitt); // reported: helper
        `,
      },
    },
    {
      name: "a sharedContext alias",
      modules: {
        "a.tsx": `
          import { sharedContext } from "../utils/registry";
          const make = sharedContext; // reported: helper
          export const A = make("A", 0);
        `,
      },
    },
    {
      name: "sharedContext re-exported",
      modules: {
        "a.tsx": `
          export { sharedContext } from "../utils/registry"; // reported: helper
        `,
      },
    },
    {
      name: "one name in two modules",
      modules: {
        "a.tsx": `
          import { sharedContext } from "../utils/registry";
          export const A = sharedContext("A", 0); // reported: duplicate
        `,
        "b.tsx": `
          import { sharedContext } from "../utils/registry";
          export const B = sharedContext("A", 1); // reported: duplicate
        `,
      },
    },
    {
      name: "one name for a context and an emitter",
      modules: {
        "a.tsx": `
          import { sharedContext } from "../utils/registry";
          export const A = sharedContext("E", 0); // reported: duplicate
        `,
        "b.ts": `
          import mitt from "mitt";
          import { sharedEmitter } from "../utils/registry";
          export const emitter = sharedEmitter("E", mitt); // reported: duplicate
        `,
      },
    },
  ];
  const accepted: typeof cases = [
    {
      name: 'sharedContext("A", 1)',
      modules: {
        "a.tsx": `
          import { sharedContext } from "../utils/registry";
          export const A = sharedContext<number>("A", 1);
          export const B = sharedContext(\`B\`, null);
        `,
      },
    },
    {
      name: 'sharedEmitter("E", mitt)',
      modules: {
        "a.ts": `
          import mitt from "mitt";
          import type { Emitter } from "mitt";
          import { sharedEmitter } from "../utils/registry";
          export const emitter: Emitter<{ a: number }> = sharedEmitter("E", mitt);
        `,
      },
    },
    {
      name: "a module that only reads a context",
      modules: {
        "a.tsx": `
          import { useContext, type Context } from "react";
          export const useValue = (context: Context<number>) => useContext(context);
        `,
      },
    },
  ];

  // Each case's modules sit in a directory of their own in `src`, so "react",
  // "mitt" and "../utils/registry" resolve as they do beside `components`
  type Files = { module: string; fileName: string; text: string }[];
  let index = 0;
  const withFiles = (list: typeof cases) =>
    list.map(({ name, modules }) => {
      const directory = `registry-guard-case-${index++}`;
      const files: Files = Object.entries(modules).map(([module, text]) => ({
        module,
        fileName: resolve(src, directory, module),
        text,
      }));
      return { name, files };
    });
  const reportedCases = withFiles(cases);
  const acceptedCases = withFiles(accepted);
  let program: ts.Program;
  beforeAll(() => {
    const files = [...reportedCases, ...acceptedCases].flatMap(
      ({ files }) => files,
    );
    for (const { fileName, text } of files) inMemory.set(fileName, text);
    program = programOf(files.map(({ fileName }) => fileName));
  }, 60_000);

  // What the check reports for a case, and what it should, each as
  // `rule: module:line: the line`
  const run = (files: Files) => {
    const { violations } = inspect(
      program,
      files.map(({ fileName }) => fileName),
    );
    const reported = Object.entries(violations).flatMap(([rule, sites]) =>
      sites.map((site) => `${rule}: ${site.replace(/^[^:]*\//, "")}`),
    );
    const expected = files.flatMap(({ module, text }) =>
      text.split("\n").flatMap((line, index) => {
        const rules = /\/\/ reported: (.*)$/.exec(line)?.[1]?.split(", ") ?? [];
        return rules.map(
          (rule) => `${rule}: ${module}:${index + 1}: ${line.trim()}`,
        );
      }),
    );
    return { reported: reported.sort(), expected: expected.sort() };
  };

  test.each(reportedCases)("reports $name", ({ files }) => {
    const { reported, expected } = run(files);
    expect(expected).not.toEqual([]);
    expect(reported).toEqual(expected);
  });

  test.each(acceptedCases)("accepts $name", ({ files }) => {
    expect(run(files).reported).toEqual([]);
  });

  test("describes each default value", () => {
    const fileName = resolve(src, "registry-guard-case-values", "a.tsx");
    inMemory.set(
      fileName,
      `
        import mitt from "mitt";
        import { sharedContext, sharedEmitter } from "../utils/registry";
        const SIZE = "medium";
        const label = "Label";
        let open = false;
        const quote = "it's";
        export const A = sharedContext("A", {
          size: SIZE,
          open,
          label,
          empty: "",
          quote,
          onChange: () => {},
          nested: { a:   1 },
          "quoted-key": -1,
        } as const);
        export const B = sharedContext("B", null);
        export const C = sharedContext("C", undefined as string | undefined);
        export const D = sharedContext("D", SIZE);
        export const emitter = sharedEmitter("E", mitt);
      `,
    );
    const file = "registry-guard-case-values/a.tsx";
    expect(inspect(programOf([fileName]), [fileName]).review).toEqual({
      A: {
        kind: "context",
        file,
        default: {
          size: "'medium'",
          open: "open",
          label: "'Label'",
          empty: "''",
          quote: "'it\\'s'",
          onChange: "() => {}",
          nested: "{ a: 1 }",
          "quoted-key": "-1",
        },
      },
      B: { kind: "context", file, default: "null" },
      C: { kind: "context", file, default: "undefined" },
      D: { kind: "context", file, default: "'medium'" },
      E: { kind: "emitter", file },
    });
  });

  test.each([
    ['import mitt from "mitt";', true],
    ['import * as mitt from "mitt";', true],
    ['import { default as mitt } from "mitt";', true],
    ['import "mitt";', true],
    ['export { default } from "mitt";', true],
    ['import type { Emitter } from "mitt";', false],
    ['import { type Emitter } from "mitt";', false],
    ['export type { Emitter } from "mitt";', false],
  ])("finds that `%s` loads mitt: %s", (statement, loads) => {
    const file = ts.createSourceFile(
      "registry.ts",
      statement,
      ts.ScriptTarget.Latest,
      true,
    );
    expect(mittValueImports(file)).toEqual(loads ? [statement] : []);
  });
});
