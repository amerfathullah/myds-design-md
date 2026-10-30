// DESIGN.md against Google's DESIGN.md linter: the warnings it gives must be
// exactly the ones DESIGN.md's Linting section expects.
import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";

import { lint } from "@google/design.md/linter";

const designMd = fs.readFileSync(
  new URL("../../../DESIGN.md", import.meta.url),
  "utf8",
);
const report = lint(designMd);
const linting = designMd.split(/^## Linting$/m)[1]?.split(/^## /m)[0] ?? "";

test("DESIGN.md has a Linting section", () => {
  assert.ok(linting, "DESIGN.md has no `## Linting` section");
});

test("the Linting section pins the installed linter version", () => {
  const pinned = linting.match(/npx @google\/design\.md@(\S+) lint/)?.[1];
  const { version } = JSON.parse(
    fs.readFileSync(
      new URL("../package.json", import.meta.resolve("@google/design.md")),
    ),
  );
  assert.equal(pinned, version);
});

test("DESIGN.md lints with no errors", () => {
  const errors = report.findings.filter((f) => f.severity === "error");
  assert.deepEqual(errors, []);
});

// The categories the Linting section's list names
function expected(finding) {
  switch (finding.rule) {
    case "orphaned-tokens":
    case "missing-primary":
    case "contrast-ratio":
      return true;
    case "broken-ref":
      return /\.(borderColor|fontWeight)$/.test(finding.path);
    default:
      return false;
  }
}

test("every warning is one the Linting section expects", () => {
  const unexpected = report.findings.filter(
    (f) => f.severity === "warning" && !expected(f),
  );
  assert.deepEqual(unexpected, []);
});

test("the contrast warnings are the Linting section's table", () => {
  const hex = (token) =>
    report.designSystem.symbolTable.get(`colors.${token}`)?.hex ?? token;
  const documented = [
    ...linting.matchAll(
      /^\| `([\w-]+)` +\| `([\w-]+)` on `([\w-]+)` +\| ([\d.]+):1 +\|/gm,
    ),
  ].map(
    ([, component, text, background, ratio]) =>
      `${component}: ${hex(text)} on ${hex(background)} at ${ratio}:1`,
  );
  const linted = report.findings
    .filter((f) => f.rule === "contrast-ratio")
    .map((f) => {
      const [, text, background, ratio] = f.message.match(
        /textColor \((#\w+)\) on backgroundColor \((#\w+)\) has contrast ratio ([\d.]+):1/,
      );
      return `${f.path.replace(/^components\./, "")}: ${text} on ${background} at ${ratio}:1`;
    });
  assert.deepEqual(linted.sort(), documented.sort());
});
