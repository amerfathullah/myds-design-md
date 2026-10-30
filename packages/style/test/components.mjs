// Reads the React components' sources for the Chromium tests: the classes a
// `cva` call gives, and the stylesheet the preset generates for them.
import assert from "node:assert/strict";
import fs from "node:fs";

import { compile } from "./compile.mjs";

const componentsDir = new URL("../../react/src/components/", import.meta.url);

/**
 * The classes a component's `cva` call gives: its base list, then the classes
 * of each variant value named in `variants`. Unnamed variants add nothing.
 * @param {string} file the component's file in `packages/react/src/components`
 * @param {string} cvaName the variable the `cva` call is assigned to
 * @param {Record<string, string | boolean>} [variants] e.g. `{ size: "small", disabled: false }`
 * @returns {string}
 */
export function cvaClasses(file, cvaName, variants = {}) {
  const source = fs.readFileSync(new URL(file, componentsDir), "utf8");
  const call = source
    .split(`const ${cvaName} = cva(`)[1]
    ?.split(/\]\);|\n\);/)[0];
  assert.ok(call, `${file} has no ${cvaName}`);
  const [base, options = ""] = call.split("variants: {");
  const strings = (text) => [...text.matchAll(/"([^"]*)"/g)].map(([, s]) => s);

  const table = Object.fromEntries(
    [
      ...options.split("defaultVariants")[0].matchAll(/(\w+): \{([^{}]*)\}/g),
    ].map(([, name, values]) => [
      name,
      Object.fromEntries(
        [...values.matchAll(/(\w+): "([^"]*)"/g)].map(([, value, classes]) => [
          value,
          classes,
        ]),
      ),
    ]),
  );
  const picked = Object.entries(variants).map(([name, value]) => {
    const classes = table[name]?.[String(value)];
    assert.ok(classes !== undefined, `${cvaName} has no ${name}: ${value}`);
    return classes;
  });
  return [...strings(base), ...picked].join(" ");
}

/**
 * The stylesheet a consumer gets for `files`: the components are scanned as
 * the full stylesheet scans the React sources.
 * @param {string[]} files component files in `packages/react/src/components`
 * @returns {Promise<string>}
 */
export function compileComponents(files) {
  return compile(
    [...new Set(files)]
      .map((file) => `@source "${new URL(file, componentsDir).pathname}";`)
      .join("\n"),
  );
}
