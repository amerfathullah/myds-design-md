// An author can make a DateField's or TimeField's <input> narrower than its
// text, with a fixed `width` or a `min-width` inside a narrow parent. The
// segments past the input's edge are then hidden, so moving keyboard focus to
// one must bring it fully into view, fill included.
import assert from "node:assert/strict";
import { test } from "node:test";

import { compileComponents, cvaClasses } from "./components.mjs";
import { dateTimeParts, launchInUSEnglish } from "./datetime-input.mjs";

const fields = [
  {
    file: "time-field.tsx",
    container: "timefield_container_cva",
    input: "timefield_cva",
    values: [
      { type: "time", value: "09:30", step: 60 },
      { type: "time", value: "09:30:15", step: 1 },
    ],
  },
  {
    file: "date-field.tsx",
    container: "datefield_container_cva",
    input: "datefield_cva",
    values: [{ type: "date", value: "2026-09-26" }],
  },
];

// The two ways #107 narrows a field: a fixed width, and the `min-width`
// workaround DESIGN.md used to suggest, inside a parent too narrow for it.
// 5.5rem is wider than a TimeField without seconds below large, so it only
// narrows the others.
const narrowings = [
  { name: "width-60", style: "width: 60px", narrows: () => true },
  {
    name: "min-width-5.5rem",
    style: "min-width: 5.5rem",
    parent: 100,
    narrows: ({ type, step, size }) =>
      !(type === "time" && step === 60 && size !== "large"),
  },
];

const cases = fields.flatMap(({ values, ...field }) =>
  ["small", "medium", "large"].flatMap((size) =>
    values.flatMap(({ type, value, step }) =>
      narrowings
        .filter(({ narrows }) => narrows({ type, step, size }))
        .map((narrowing) => ({
          ...field,
          ...narrowing,
          id: [type, size, step && `step-${step}`, narrowing.name]
            .filter(Boolean)
            .join("-")
            .replace(".", "_"),
          size,
          type,
          value,
          step,
        })),
    ),
  ),
);

// `date-field-segment-active` and `time-field-segment-active`
const fill = "rgb(37, 99, 235)";

const left = (quad) => Math.min(quad[0], quad[2], quad[4], quad[6]);
const right = (quad) => Math.max(quad[0], quad[2], quad[4], quad[6]);

test("a narrowed DateField or TimeField scrolls the focused segment into view in Chromium", async () => {
  const css = await compileComponents(fields.map(({ file }) => file));
  const browser = await launchInUSEnglish();
  try {
    // No viewport, so the page renders at a real scale factor of 1
    const page = await browser.newPage({ viewport: null, locale: "en-US" });
    await page.setContent(
      `<!doctype html><html><head><style>${css}</style></head><body>${cases
        .map(
          ({
            id,
            file,
            container,
            input,
            size,
            type,
            value,
            step,
            style,
            parent,
          }) =>
            `<div style="width: ${parent ? `${parent}px` : "max-content"}"><div class="${cvaClasses(file, container, { size })}"><input id="${id}" type="${type}" value="${value}"${step ? ` step="${step}"` : ""} style="${style}" class="${cvaClasses(file, input)}"></div></div>`,
        )
        .join("")}</body></html>`,
    );
    assert.equal(await page.evaluate(() => devicePixelRatio), 1);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("DOM.enable");
    await cdp.send("CSS.enable");
    const computed = async ({ nodeId }, name) =>
      (
        await cdp.send("CSS.getComputedStyleForNode", { nodeId })
      ).computedStyle.find((property) => property.name === name).value;
    const border = async ({ nodeId }) =>
      (await cdp.send("DOM.getBoxModel", { nodeId })).model.border;

    // The part of the input a segment can show in: the input clips to its
    // content box, and the edit and its fields wrapper to their border boxes,
    // if they have one and their overflow isn't visible
    const visibleBox = async ({ input, edit, wrapper }) => {
      const content = (
        await cdp.send("DOM.getBoxModel", { nodeId: input.nodeId })
      ).model.content;
      let [from, to] = [left(content), right(content)];
      for (const node of [edit, wrapper]) {
        if ((await computed(node, "display")) === "contents") continue;
        if ((await computed(node, "overflow-x")) === "visible") continue;
        const quad = await border(node);
        [from, to] = [Math.max(from, left(quad)), Math.min(to, right(quad))];
      }
      return [from, to];
    };

    const hidden = [];
    for (const { id } of cases) {
      const parts = await dateTimeParts(cdp, id);
      const names = parts.segments.map(({ name }) => name);
      // The field really is narrowed: at rest, its last segment is hidden
      const [, restTo] = await visibleBox(parts);
      assert.ok(
        right(await border(parts.segments.at(-1).node)) > restTo + 1,
        `${id} isn't narrower than its text`,
      );

      // Focus lands on the first segment; ArrowRight moves it on to the last,
      // then ArrowLeft back to the first
      await page.focus(`#${id}`);
      const order = [...names.keys(), ...[...names.keys()].reverse().slice(1)];
      for (const [step, i] of order.entries()) {
        if (step)
          await page.keyboard.press(
            i > order[step - 1] ? "ArrowRight" : "ArrowLeft",
          );
        const { segments, ...rest } = await dateTimeParts(cdp, id);
        const filled = [];
        for (const { name, node } of segments)
          if ((await computed(node, "background-color")) === fill)
            filled.push(name);
        assert.deepEqual(filled, [names[i]], `${id}, step ${step}`);

        const [from, to] = await visibleBox(rest);
        const quad = await border(segments[i].node);
        const cut = Math.max(from - left(quad), right(quad) - to);
        if (cut > 0.01)
          hidden.push(`${id} ${names[i]} (step ${step}): ${cut.toFixed(2)}px`);
      }
      await page.evaluate((id) => document.getElementById(id).blur(), id);
    }
    assert.deepEqual(hidden, []);
  } finally {
    await browser.close();
  }
});
