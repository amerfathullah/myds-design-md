// The built files match `exports` (#236). Every file in `dist` is an
// `exports` target, a target's declaration, a file one of those imports by
// relative path (the chunks), or the sourcemap of one of these. So the build
// ships no entry that no subpath loads, whatever chose its entries: the
// `entryPoints` that entry-points.test.ts reads, an `entry` that tsup reads
// instead, or `tsup <file>`. It names no chunk, since chunk names change
// from build to build (#239). It needs `pnpm build` first, and fails, rather
// than skips, without it.
/// <reference types="node" />
import { readdirSync, readFileSync, statSync } from "node:fs";
import { posix, resolve, sep } from "node:path";
import ts from "typescript";
import { beforeAll, expect, test } from "vitest";

const root = resolve(__dirname, "../..");
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")) as {
  exports: Record<string, unknown>;
};

const isDeclaration = (file: string) => /\.d\.[mc]?ts$/.test(file);
// The declaration TypeScript finds beside a script: `x.d.mts` for `x.mjs`
const declarationOf = (script: string) =>
  script.replace(/\.([mc]?)js$/, ".d.$1ts");

const targets = [
  ...new Set(
    Object.values(pkg.exports).flatMap((value) =>
      typeof value === "object" && value !== null
        ? Object.values(value)
        : [value],
    ),
  ),
]
  .filter((target): target is string => typeof target === "string")
  // As the package's files name each other: `dist/components/button.mjs`
  .map((target) => posix.normalize(target))
  .sort();

// The files a built file loads by relative path, and its sourcemap. In a
// declaration, `./x.js` names `./x.d.ts`, as TypeScript reads it.
function references(file: string, text: string): string[] {
  const { importedFiles, referencedFiles } = ts.preProcessFile(
    text,
    true,
    true,
  );
  const named = [...importedFiles, ...referencedFiles]
    .map(({ fileName }) => fileName)
    .filter((name) => /^\.\.?\//.test(name))
    .map((name) => posix.join(posix.dirname(file), name))
    .map((path) => (isDeclaration(file) ? declarationOf(path) : path));
  const map = /\/\/# sourceMappingURL=(?!data:)(\S+)\s*$/.exec(text)?.[1];
  return map ? [...named, posix.join(posix.dirname(file), map)] : named;
}

let built: Set<string>;
// What the targets and their declarations reach, and what any of them names
// that isn't built
let reached: Set<string>;
let missing: string[];
beforeAll(() => {
  const dist = resolve(root, "dist");
  built = new Set(
    readdirSync(dist, { recursive: true, encoding: "utf8" })
      .filter((file) => statSync(resolve(dist, file)).isFile())
      .map((file) => posix.join("dist", file.split(sep).join("/"))),
  );
  reached = new Set();
  missing = [];
  const visit = (file: string, from: string) => {
    if (reached.has(file)) return;
    if (!built.has(file)) return void missing.push(`${from} names ${file}`);
    reached.add(file);
    for (const next of references(
      file,
      readFileSync(resolve(root, file), "utf8"),
    ))
      visit(next, file);
  };
  for (const target of targets) {
    visit(target, "`exports`");
    visit(declarationOf(target), `${target}'s declaration`);
  }
});

test("finds the built package, and the targets in `exports`", () => {
  expect(targets.length).toBeGreaterThan(0);
  expect(built.size).toBeGreaterThan(0);
});

test("every exports target, its declaration, and what those load is built", () => {
  expect(missing).toEqual([]);
});

test("every file in dist is an exports target, its declaration, what those load, or a sourcemap of one of these", () => {
  expect([...built].filter((file) => !reached.has(file)).sort()).toEqual([]);
});
