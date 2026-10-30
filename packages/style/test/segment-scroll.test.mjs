// An author can make a DateField's or TimeField's <input> narrower than its
// text, with a fixed `width` or a `min-width` inside a narrow parent. The
// segments past the input's edge are then hidden, so moving focus to one must
// bring it fully into view, fill included. Chromium's focus scroll leaves a
// partly hidden segment where it is, so the fields wrapper is a scroll-snap
// container whose only snap area is the focused segment. At natural width
// nothing may scroll, and the segments lay out as they did before.
import assert from "node:assert/strict";
import { test } from "node:test";

import { compileComponents, cvaClasses } from "./components.mjs";
import {
  dateTimeParts,
  launchInUSEnglish,
  visibleSpan,
} from "./datetime-input.mjs";

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

// Every field at every size, which the wrapper sets as the text size the
// input inherits
const natural = fields.flatMap(({ values, ...field }) =>
  ["small", "medium", "large"].flatMap((size) =>
    values.map(({ type, value, step }) => ({
      ...field,
      id: [type, size, step && `step-${step}`].filter(Boolean).join("-"),
      size,
      type,
      value,
      step,
    })),
  ),
);

// The two ways #107 narrows a field: a fixed width, and the `min-width`
// workaround DESIGN.md used to suggest, inside a parent too narrow for it.
// 5.5rem is wider than a TimeField without seconds below large, so it only
// narrows the others.
const narrowed = natural.flatMap((field) =>
  [
    { name: "width-60", style: "width: 60px" },
    { name: "min-width-5_5rem", style: "min-width: 5.5rem", parent: 100 },
  ]
    .filter(
      ({ parent }) =>
        !parent ||
        !(field.type === "time" && field.step === 60 && field.size !== "large"),
    )
    .map(({ name, ...narrowing }) => ({
      ...field,
      ...narrowing,
      id: `${field.id}-${name}`,
    })),
);

// The layout #106 gave the fields, for inputs with the class `before`: an
// edit that grows or shrinks to its content, and inline segments in a fields
// wrapper that doesn't clip
const beforeSegments = [
  "month",
  "day",
  "year",
  "hour",
  "minute",
  "second",
  "ampm",
]
  .map((name) => `.before::-webkit-datetime-edit-${name}-field`)
  .join(", ");
const before = `
.before::-webkit-datetime-edit { display: inline-flex !important; min-width: max-content !important; max-width: fit-content !important; }
.before::-webkit-datetime-edit-fields-wrapper { overflow: visible !important; }
${beforeSegments} { display: inline !important; text-box: normal !important; margin-block: 0 !important; }`;

// `date-field-segment-active` and `time-field-segment-active`
const fill = "rgb(37, 99, 235)";

const left = (quad) => Math.min(quad[0], quad[2], quad[4], quad[6]);
const right = (quad) => Math.max(quad[0], quad[2], quad[4], quad[6]);
const top = (quad) => Math.min(quad[1], quad[3], quad[5], quad[7]);
const bottom = (quad) => Math.max(quad[1], quad[3], quad[5], quad[7]);

/**
 * A page holding `cases`, each in a parent `parent` px wide or as wide as its
 * content, at a real scale factor of 1, and a DevTools session on it.
 */
async function render(browser, css, cases) {
  // No viewport, so the page renders at a real scale factor of 1
  const page = await browser.newPage({ viewport: null, locale: "en-US" });
  await page.setContent(
    `<!doctype html><html><head><style>${css}</style></head><body>${cases
      .map(
        ({ id, file, container, input, size, type, value, step, ...rest }) =>
          `<div style="width: ${rest.parent ? `${rest.parent}px` : "max-content"}"><div class="${cvaClasses(file, container, { size })}"><input id="${id}" type="${type}" value="${value}"${step ? ` step="${step}"` : ""} style="${rest.style ?? ""}" class="${cvaClasses(file, input)} ${rest.className ?? ""}"></div></div>`,
      )
      .join("")}</body></html>`,
  );
  assert.equal(await page.evaluate(() => devicePixelRatio), 1);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("DOM.enable");
  await cdp.send("CSS.enable");
  return { page, cdp };
}

/**
 * Focuses the input with `id` and moves focus with ArrowRight from its first
 * segment to its last, then with ArrowLeft back to the first, calling `visit`
 * with each focused segment's index.
 */
async function walkSegments(page, id, count, visit) {
  const order = [...Array(count).keys()];
  order.push(...order.slice(0, -1).reverse());
  await page.focus(`#${id}`);
  for (const [step, i] of order.entries()) {
    if (step)
      await page.keyboard.press(
        i > order[step - 1] ? "ArrowRight" : "ArrowLeft",
      );
    await visit(i, step);
  }
  await page.evaluate((id) => document.getElementById(id).blur(), id);
}

test("a narrowed DateField or TimeField scrolls the focused segment into view in Chromium", async () => {
  const css = await compileComponents(fields.map(({ file }) => file));
  const browser = await launchInUSEnglish();
  try {
    const { page, cdp } = await render(browser, css, narrowed);
    const background = async ({ nodeId }) =>
      (
        await cdp.send("CSS.getComputedStyleForNode", { nodeId })
      ).computedStyle.find(({ name }) => name === "background-color").value;
    const border = async ({ nodeId }) =>
      (await cdp.send("DOM.getBoxModel", { nodeId })).model.border;

    const hidden = [];
    for (const { id } of narrowed) {
      const parts = await dateTimeParts(cdp, id);
      const names = parts.segments.map(({ name }) => name);
      // The field really is narrowed: at rest, its last segment is hidden
      const [, restTo] = await visibleSpan(cdp, parts);
      assert.ok(
        right(await border(parts.segments.at(-1).node)) > restTo + 1,
        `${id} isn't narrower than its text`,
      );

      await walkSegments(page, id, names.length, async (i, step) => {
        const { segments, ...rest } = await dateTimeParts(cdp, id);
        const filled = [];
        for (const { name, node } of segments)
          if ((await background(node)) === fill) filled.push(name);
        assert.deepEqual(filled, [names[i]], `${id}, step ${step}`);

        // Chromium scrolls by whole pixels, so the focused segment can still
        // pass an edge by under half a pixel
        const [from, to] = await visibleSpan(cdp, rest);
        const quad = await border(segments[i].node);
        const cut = Math.max(from - left(quad), right(quad) - to);
        if (cut > 0.5)
          hidden.push(`${id} ${names[i]} (step ${step}): ${cut.toFixed(2)}px`);
      });
    }
    assert.deepEqual(hidden, []);
  } finally {
    await browser.close();
  }
});

test("a DateField or TimeField at natural width keeps its layout and never scrolls in Chromium", async () => {
  const css = await compileComponents(fields.map(({ file }) => file));
  const browser = await launchInUSEnglish();
  try {
    const { page, cdp } = await render(browser, `${css}${before}`, [
      ...natural,
      ...natural.map((field) => ({
        ...field,
        id: `${field.id}-before`,
        className: "before",
      })),
    ]);
    const box = async ({ nodeId }) =>
      (await cdp.send("DOM.getBoxModel", { nodeId })).model.border;
    // The input's size, and each segment's box from the input's top left
    const layout = async (id) => {
      const { input, segments } = await dateTimeParts(cdp, id);
      const outer = await box(input);
      const size = (quad) =>
        `${(right(quad) - left(quad)).toFixed(2)}x${(bottom(quad) - top(quad)).toFixed(2)}`;
      const parts = [`input ${size(outer)}`];
      for (const { name, node } of segments) {
        const quad = await box(node);
        parts.push(
          `${name} ${size(quad)} at ${(left(quad) - left(outer)).toFixed(2)},${(top(quad) - top(outer)).toFixed(2)}`,
        );
      }
      return parts;
    };

    for (const { id } of natural) {
      const rest = await layout(id);
      assert.deepEqual(rest, await layout(`${id}-before`), id);
      await walkSegments(page, id, rest.length - 1, async (i, step) =>
        assert.deepEqual(await layout(id), rest, `${id}, step ${step}`),
      );
    }
  } finally {
    await browser.close();
  }
});
