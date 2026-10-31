// Reads the React components' sources for the Chromium tests: the classes a
// `cva` call gives, and the stylesheet the preset generates for them.
import assert from "node:assert/strict";
import fs from "node:fs";

import { compile } from "./compile.mjs";

const componentsDir = new URL("../../react/src/components/", import.meta.url);

// A component's `cva` call: its base classes, the classes of each variant
// value, and its `defaultVariants`
function readCva(file, cvaName) {
  const source = fs.readFileSync(new URL(file, componentsDir), "utf8");
  const call = source
    .split(`const ${cvaName} = cva(`)[1]
    ?.split(/\]\);|\n\);/)[0];
  assert.ok(call, `${file} has no ${cvaName}`);
  const [base, options = ""] = call.split("variants: {");
  const [variants, defaults = ""] = options.split("defaultVariants");
  const strings = (text) => [...text.matchAll(/"([^"]*)"/g)].map(([, s]) => s);

  const table = Object.fromEntries(
    [...variants.matchAll(/(\w+): \{([^{}]*)\}/g)].map(([, name, values]) => [
      name,
      Object.fromEntries(
        [...values.matchAll(/(\w+): "([^"]*)"/g)].map(([, value, classes]) => [
          value,
          classes,
        ]),
      ),
    ]),
  );
  const defaultVariants = Object.fromEntries(
    [...defaults.matchAll(/(\w+): (?:"([^"]*)"|(\w+))/g)].map(
      ([, name, string, value]) => [name, string ?? value],
    ),
  );
  return { base: strings(base), table, defaultVariants };
}

/**
 * The classes a component's `cva` call gives: its base list, then the classes
 * of each variant value named in `variants`. Unnamed variants add nothing.
 * @param {string} file the component's file in `packages/react/src/components`
 * @param {string} cvaName the variable the `cva` call is assigned to
 * @param {Record<string, string | boolean>} [variants] e.g. `{ size: "small", disabled: false }`
 * @returns {string}
 */
export function cvaClasses(file, cvaName, variants = {}) {
  const { base, table } = readCva(file, cvaName);
  const picked = Object.entries(variants).map(([name, value]) => {
    const classes = table[name]?.[String(value)];
    assert.ok(classes !== undefined, `${cvaName} has no ${name}: ${value}`);
    return classes;
  });
  return [...base, ...picked].join(" ");
}

/**
 * The classes a component's `cva` call returns when the component passes it
 * `props`, picked as cva picks them: a variant that's `undefined` takes its
 * `defaultVariants` value, one that's `null` adds nothing, and a prop that
 * isn't a variant is ignored.
 * @param {string} file the component's file in `packages/react/src/components`
 * @param {string} cvaName the variable the `cva` call is assigned to
 * @param {Record<string, string | boolean | null | undefined>} [props] e.g. `{ size: "small", disabled: undefined }`
 * @returns {string}
 */
export function cvaCall(file, cvaName, props = {}) {
  const { base, table, defaultVariants } = readCva(file, cvaName);
  const picked = Object.entries(table).flatMap(([name, values]) => {
    if (props[name] === null) return [];
    const value = props[name] ?? defaultVariants[name];
    if (value === undefined) return [];
    const classes = values[String(value)];
    assert.ok(classes !== undefined, `${cvaName} has no ${name}: ${value}`);
    return [classes];
  });
  return [...base, ...picked].join(" ");
}

/**
 * The fixed classes a component's JSX gives its elements, in source order: a
 * `className` string, or the first string a `className` passes to `clx()`.
 * @param {string} file the component's file in `packages/react/src/components`
 * @returns {string[]}
 */
export function jsxClasses(file) {
  const source = fs.readFileSync(new URL(file, componentsDir), "utf8");
  return [
    ...source.matchAll(/className=(?:"([^"]*)"|\{clx\(\s*"([^"]*)")/g),
  ].map(([, literal, clx]) => literal ?? clx);
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
