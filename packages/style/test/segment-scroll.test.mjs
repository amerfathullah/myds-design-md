// An author can make a DateField's or TimeField's <input> narrower than its
// text, with a fixed `width` or a `min-width` inside a narrow parent. The
// segments past the input's edge are then hidden, so moving keyboard focus to
// one must bring it fully into view, fill included. Chromium's focus scroll
// leaves a partly hidden segment where it is, so the fields wrapper's scroll
// padding leaves only its centre line, and any segment off it gets centred. At
// natural width nothing may scroll, and the segments lay out as they did
// before, in left-to-right and right-to-left locales alike.
import assert from "node:assert/strict";
import { test } from "node:test";

import { compileComponents, cvaClasses } from "./components.mjs";
import {
  dateTimeParts,
  launchInLocale,
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

// Two ways an author narrows a field: a fixed width, and the `min-width`
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

// The layout the fields had before their fields wrapper scrolled, for inputs
// with the class `baseline`: an edit that grows or shrinks to its content,
// around a fields wrapper that doesn't clip, holding the segments as inline
// text
const baselineSegments = [
  "month",
  "day",
  "year",
  "hour",
  "minute",
  "second",
  "ampm",
]
  .map((name) => `.baseline::-webkit-datetime-edit-${name}-field`)
  .join(", ");
const baseline = `
.baseline::-webkit-datetime-edit { display: inline-flex !important; min-width: max-content !important; max-width: fit-content !important; }
.baseline::-webkit-datetime-edit-fields-wrapper { overflow: visible !important; }
${baselineSegments} { display: inline !important; text-box: normal !important; margin-block: 0 !important; }`;

// `date-field-segment-active` and `time-field-segment-active`
const fill = "rgb(37, 99, 235)";

const left = (quad) => Math.min(quad[0], quad[2], quad[4], quad[6]);
const right = (quad) => Math.max(quad[0], quad[2], quad[4], quad[6]);
const top = (quad) => Math.min(quad[1], quad[3], quad[5], quad[7]);
const bottom = (quad) => Math.max(quad[1], quad[3], quad[5], quad[7]);

const borderBox = async (cdp, { nodeId }) =>
  (await cdp.send("DOM.getBoxModel", { nodeId })).model.border;

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
        ({
          id,
          file,
          container,
          input,
          size,
          type,
          value,
          step,
          style = "",
          parent,
          className = "",
        }) =>
          `<div style="width: ${parent ? `${parent}px` : "max-content"}"><div class="${cvaClasses(file, container, { size })}"><input id="${id}" type="${type}" value="${value}"${step ? ` step="${step}"` : ""} style="${style}" class="${cvaClasses(file, input)} ${className}"></div></div>`,
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
 * segment to its last, then with ArrowLeft back to the first. After each move
 * it calls `visit` with the focused segment's index and the number of keys
 * pressed so far.
 */
async function walkSegments(page, id, count, visit) {
  const order = [...Array(count).keys()];
  order.push(...order.slice(0, -1).reverse());
  await page.focus(`#${id}`);
  for (const [move, i] of order.entries()) {
    if (move)
      await page.keyboard.press(
        i > order[move - 1] ? "ArrowRight" : "ArrowLeft",
      );
    await visit(i, move);
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

    const hidden = [];
    for (const { id } of narrowed) {
      const atRest = await dateTimeParts(cdp, id);
      const names = atRest.segments.map(({ name }) => name);
      // The field really is narrowed: at rest, its last segment is hidden
      const [, visibleTo] = await visibleSpan(cdp, atRest);
      assert.ok(
        right(await borderBox(cdp, atRest.segments.at(-1).node)) >
          visibleTo + 1,
        `${id} isn't narrower than its text`,
      );

      await walkSegments(page, id, names.length, async (i, move) => {
        const focused = await dateTimeParts(cdp, id);
        const filled = [];
        for (const { name, node } of focused.segments)
          if ((await background(node)) === fill) filled.push(name);
        assert.deepEqual(filled, [names[i]], `${id}, move ${move}`);

        // Chromium scrolls by whole pixels, so the focused segment can still
        // pass an edge by under half a pixel
        const [from, to] = await visibleSpan(cdp, focused);
        const quad = await borderBox(cdp, focused.segments[i].node);
        const cut = Math.max(from - left(quad), right(quad) - to);
        if (cut >= 0.5)
          hidden.push(`${id} ${names[i]} (move ${move}): ${cut.toFixed(2)}px`);
      });
    }
    assert.deepEqual(hidden, []);
  } finally {
    await browser.close();
  }
});

// US English, and two right-to-left locales: Hebrew, whose times have no
// AM/PM, and Arabic, whose AM/PM is right-to-left text. A segment laid out as
// a box rather than as text would reverse their order in both.
for (const locale of ["en_US", "he_IL", "ar_EG"])
  test(`a DateField or TimeField at natural width keeps its layout and never scrolls in Chromium, in ${locale}`, async () => {
    const css = await compileComponents(fields.map(({ file }) => file));
    const browser = await launchInLocale(locale);
    try {
      const { page, cdp } = await render(browser, `${css}${baseline}`, [
        ...natural,
        ...natural.map((field) => ({
          ...field,
          id: `${field.id}-baseline`,
          className: "baseline",
        })),
      ]);
      // The input's size, and each segment's box from the input's top left
      const layout = async (id) => {
        const { input, segments } = await dateTimeParts(cdp, id);
        const outer = await borderBox(cdp, input);
        const size = (quad) =>
          `${(right(quad) - left(quad)).toFixed(2)}x${(bottom(quad) - top(quad)).toFixed(2)}`;
        const lines = [`input ${size(outer)}`];
        for (const { name, node } of segments) {
          const quad = await borderBox(cdp, node);
          lines.push(
            `${name} ${size(quad)} at ${(left(quad) - left(outer)).toFixed(2)},${(top(quad) - top(outer)).toFixed(2)}`,
          );
        }
        return lines;
      };

      for (const { id } of natural) {
        const atRest = await layout(id);
        assert.deepEqual(atRest, await layout(`${id}-baseline`), id);
        // Arrow keys move between segments only in a left-to-right locale
        if (locale !== "en_US") continue;
        const { segments } = await dateTimeParts(cdp, id);
        await walkSegments(page, id, segments.length, async (i, move) =>
          assert.deepEqual(await layout(id), atRest, `${id}, move ${move}`),
        );
      }
    } finally {
      await browser.close();
    }
  });
