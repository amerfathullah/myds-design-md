/**
 * The build's entry points, read from `entryPoints` in tsup.config.ts as
 * tsup reads them (#236). This is test support for Node only: it reads the
 * disk and loads TypeScript, so no entry may import it, and the context-
 * sharing guard (`registry.guard.test.ts`) fails if one does. That guard and
 * `entry-points.test.ts` read the entries through it.
 */
/// <reference types="node" />
import { readFileSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import ts from "typescript";

const root = resolve(__dirname, "../..");

const nameOf = (node: ts.ObjectLiteralElementLike) =>
  node.name && (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name))
    ? node.name.text
    : undefined;

/**
 * The patterns in a tsup config's `entryPoints`, in order. It throws unless
 * the config names them once, as an array of string literals. It throws, too,
 * where the config sets `entry` anywhere: beside `entryPoints`, tsup reads it
 * first (`options.entry || options.entryPoints`), and under `dts` or
 * `experimentalDts` it picks the declarations' entries. An `entry` that
 * reaches the config through its `options`, as `tsup <file>` passes one,
 * can't be seen here: `entry-points.dist.test.ts` finds what it builds.
 */
export function entryPatterns(configText: string): string[] {
  const config = ts.createSourceFile(
    "tsup.config.ts",
    configText,
    ts.ScriptTarget.Latest,
    true,
  );
  const lists: ts.ObjectLiteralElementLike[] = [];
  const visit = (node: ts.Node): void => {
    if (ts.isObjectLiteralElementLike(node)) {
      if (nameOf(node) === "entry")
        throw new Error(
          `tsup.config.ts sets \`entry\`, so \`entryPoints\` alone doesn't say what tsup builds: ${node.getText()}`,
        );
      if (nameOf(node) === "entryPoints") lists.push(node);
    }
    ts.forEachChild(node, visit);
  };
  visit(config);
  const [list, ...more] = lists;
  if (!list || more.length > 0)
    throw new Error(
      `tsup.config.ts names \`entryPoints\` ${lists.length} times, not once`,
    );
  if (
    !ts.isPropertyAssignment(list) ||
    !ts.isArrayLiteralExpression(list.initializer)
  )
    throw new Error(`\`entryPoints\` isn't an array: ${list.getText()}`);
  return list.initializer.elements.map((element) => {
    if (!ts.isStringLiteralLike(element))
      throw new Error(`An entry pattern isn't a string: ${element.getText()}`);
    return element.text;
  });
}

// What tinyglobby, which tsup expands the patterns with, reads another way
// than TypeScript's `readDirectory`: braces, brackets, parentheses (extended
// globs), escapes, and a `!` anywhere but at the start
const unreadable = /[{}[\]()\\]|.!/;

/**
 * The files `patterns` name under `root`, relative to it, sorted. A pattern
 * that starts with `!` leaves out what it names, wherever it comes in the
 * list, as tinyglobby reads it. `readDirectory` would read it as an include
 * that matches nothing, so it gets those as excludes. It throws on a pattern
 * it can't read as tinyglobby does, and on one that doesn't end in a `.ts`
 * or `.tsx` file name, since it lists only those.
 */
export function filesOf(root: string, patterns: readonly string[]): string[] {
  for (const pattern of patterns)
    if (unreadable.test(pattern) || !/\.tsx?$/.test(pattern))
      throw new Error(
        `The entry pattern \`${pattern}\` can't be read as tinyglobby reads it: only \`*\`, \`**\` and \`?\`, a leading \`!\`, and a \`.ts\` or \`.tsx\` file name`,
      );
  const includes = patterns.filter((pattern) => !pattern.startsWith("!"));
  const excludes = patterns
    .filter((pattern) => pattern.startsWith("!"))
    .map((pattern) => pattern.slice(1));
  // With no includes, `readDirectory` lists every file
  if (includes.length === 0) return [];
  return ts.sys
    .readDirectory(root, [".ts", ".tsx"], excludes, includes)
    .map((file) => relative(root, file).split(sep).join("/"))
    .sort();
}

/**
 * The build's entry points, relative to the package root, sorted, e.g.
 * `src/components/button.tsx`
 */
export function entryPoints(): string[] {
  return filesOf(
    root,
    entryPatterns(readFileSync(resolve(root, "tsup.config.ts"), "utf8")),
  );
}
