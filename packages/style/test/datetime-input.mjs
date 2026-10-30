// Launches Chromium and finds the parts of a date or time <input> it renders,
// for the DateField and TimeField tests.
import assert from "node:assert/strict";

import { chromium } from "playwright";

/**
 * Chromium in `locale`, which sets the order of a date's fields, whether a
 * time has AM/PM, and the input's direction. Headless Linux Chromium takes it
 * from the process's locale variables, not from a page's `locale`, and
 * `LANGUAGE` and `LC_ALL` outrank `LANG`.
 * @param {string} locale e.g. `he_IL`
 * @returns {Promise<import("playwright").Browser>}
 */
export function launchInLocale(locale) {
  return chromium.launch({
    env: {
      ...process.env,
      LANGUAGE: locale,
      LC_ALL: `${locale}.UTF-8`,
      LANG: `${locale}.UTF-8`,
    },
  });
}

/**
 * Chromium in US English, so a date reads month first and a time has AM/PM.
 * @returns {Promise<import("playwright").Browser>}
 */
export function launchInUSEnglish() {
  return launchInLocale("en_US");
}

/**
 * The <input> with `id`, its `-webkit-datetime-edit` and the
 * `-webkit-datetime-edit-fields-wrapper` inside it, and its segments in
 * order, as DevTools DOM nodes. They sit in the input's user-agent shadow
 * root, which only the DevTools protocol reaches, and their node ids last
 * until the next call.
 * @param {import("playwright").CDPSession} cdp with `DOM` enabled
 * @param {string} id
 * @returns {Promise<{ input: object, edit: object, wrapper: object, segments: { name: string, node: object }[] }>}
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
  let wrapper;
  const segments = [];
  const walk = (node, inInput) => {
    if (!inInput && attribute(node, "id") === id) {
      input = node;
      inInput = true;
    }
    const pseudo = inInput ? attribute(node, "pseudo") : undefined;
    if (pseudo === "-webkit-datetime-edit") edit = node;
    if (pseudo === "-webkit-datetime-edit-fields-wrapper") wrapper = node;
    const segment = pseudo?.match(/^-webkit-datetime-edit-(\w+)-field$/);
    if (segment) segments.push({ name: segment[1], node });
    for (const child of [...(node.children ?? []), ...(node.shadowRoots ?? [])])
      walk(child, inInput);
  };
  walk(root, false);
  assert.ok(input, `no #${id}`);
  assert.ok(edit, `#${id} has no -webkit-datetime-edit`);
  assert.ok(wrapper, `#${id} has no -webkit-datetime-edit-fields-wrapper`);
  return { input, edit, wrapper, segments };
}

const left = (quad) => Math.min(quad[0], quad[2], quad[4], quad[6]);
const right = (quad) => Math.max(quad[0], quad[2], quad[4], quad[6]);

/**
 * Where the input's segments can show, as its left and right edges: the
 * input's content box, narrowed to the border boxes of the edit and the fields
 * wrapper wherever they have a box and cut off their overflow.
 * @param {import("playwright").CDPSession} cdp with `DOM` enabled
 * @param {{ input: object, edit: object, wrapper: object }} parts from `dateTimeParts()`
 * @returns {Promise<[number, number]>}
 */
export async function visibleSpan(cdp, { input, edit, wrapper }) {
  const quad = async ({ nodeId }, box) =>
    (await cdp.send("DOM.getBoxModel", { nodeId })).model[box];
  const clips = async ({ nodeId }) => {
    const { object } = await cdp.send("DOM.resolveNode", { nodeId });
    const { result } = await cdp.send("Runtime.callFunctionOn", {
      objectId: object.objectId,
      functionDeclaration: `function () {
        const { display, overflowX } = getComputedStyle(this);
        return display !== "contents" && overflowX !== "visible";
      }`,
      returnByValue: true,
    });
    return result.value;
  };

  const content = await quad(input, "content");
  let [from, to] = [left(content), right(content)];
  for (const node of [edit, wrapper]) {
    if (!(await clips(node))) continue;
    const border = await quad(node, "border");
    [from, to] = [Math.max(from, left(border)), Math.min(to, right(border))];
  }
  return [from, to];
}
