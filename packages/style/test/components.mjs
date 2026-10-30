// Reads the React components' classes from their source, and finds the parts
// of a date or time <input> that Chromium renders, for the Chromium tests.
import assert from "node:assert/strict";
import fs from "node:fs";

export const components = new URL(
  "../../react/src/components/",
  import.meta.url,
);

/**
 * The classes a component's `cva` call gives: its base list, then the classes
 * of each variant value named in `variants`. Unnamed variants add nothing.
 * @param {string} file the component's file in `packages/react/src/components`
 * @param {string} cvaName the variable the `cva` call is assigned to
 * @param {Record<string, string | boolean>} [variants] e.g. `{ size: "small", disabled: false }`
 * @returns {string}
 */
export function cvaClasses(file, cvaName, variants = {}) {
  const source = fs.readFileSync(new URL(file, components), "utf8");
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
 * The <input> with `id`, and the parts in its user-agent shadow root, such as
 * `-webkit-datetime-edit`, by their `pseudo` attribute. Only the DevTools
 * protocol reaches them, and its node ids last until the next call.
 * @param {import("playwright").CDPSession} cdp with `DOM` enabled
 * @param {string} id
 */
export async function inputParts(cdp, id) {
  const { root } = await cdp.send("DOM.getDocument", {
    depth: -1,
    pierce: true,
  });
  const attribute = (node, name) => {
    const attributes = node.attributes ?? [];
    const i = attributes.indexOf(name);
    return i % 2 === 0 ? attributes[i + 1] : undefined;
  };
  let input;
  const parts = [];
  const walk = (node, inInput) => {
    if (!inInput && attribute(node, "id") === id) {
      input = node;
      inInput = true;
    }
    const pseudo = attribute(node, "pseudo");
    if (inInput && pseudo) parts.push({ pseudo, node });
    for (const child of [...(node.children ?? []), ...(node.shadowRoots ?? [])])
      walk(child, inInput);
  };
  walk(root, false);
  assert.ok(input, `no #${id}`);
  return { input, parts };
}
