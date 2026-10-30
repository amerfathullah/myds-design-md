// Launches Chromium and finds the parts of a date or time <input> it renders,
// for the DateField and TimeField tests.
import assert from "node:assert/strict";

import { chromium } from "playwright";

/**
 * Chromium in US English, so a date reads month first and a time has AM/PM.
 * Headless Linux Chromium takes both from the process's locale variables, not
 * from a page's `locale`, and `LANGUAGE` and `LC_ALL` outrank `LANG`.
 * @returns {Promise<import("playwright").Browser>}
 */
export function launchInUSEnglish() {
  return chromium.launch({
    env: {
      ...process.env,
      LANGUAGE: "en_US",
      LC_ALL: "en_US.UTF-8",
      LANG: "en_US.UTF-8",
    },
  });
}

/**
 * The <input> with `id`, its `-webkit-datetime-edit`, and its segments in
 * order, as DevTools DOM nodes. They sit in the input's user-agent shadow
 * root, which only the DevTools protocol reaches, and their node ids last
 * until the next call.
 * @param {import("playwright").CDPSession} cdp with `DOM` enabled
 * @param {string} id
 * @returns {Promise<{ input: object, edit: object, segments: { name: string, node: object }[] }>}
 */
export async function dateTimeParts(cdp, id) {
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
  let edit;
  const segments = [];
  const walk = (node, inInput) => {
    if (!inInput && attribute(node, "id") === id) {
      input = node;
      inInput = true;
    }
    const pseudo = inInput ? attribute(node, "pseudo") : undefined;
    if (pseudo === "-webkit-datetime-edit") edit = node;
    const segment = pseudo?.match(/^-webkit-datetime-edit-(\w+)-field$/);
    if (segment) segments.push({ name: segment[1], node });
    for (const child of [...(node.children ?? []), ...(node.shadowRoots ?? [])])
      walk(child, inInput);
  };
  walk(root, false);
  assert.ok(input, `no #${id}`);
  assert.ok(edit, `#${id} has no -webkit-datetime-edit`);
  return { input, edit, segments };
}
