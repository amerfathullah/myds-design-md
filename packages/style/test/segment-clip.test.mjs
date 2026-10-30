// Chromium overrides the width of a date or time input's
// `::-webkit-datetime-edit` with an estimate built from its segments' text,
// which leaves out author margins, and the edit's `overflow: hidden` cuts off
// whatever doesn't fit. Both fields put 2px margins around each separator,
// which cut the end of TimeField's last segment ("09:30 AM" read "09:30 AN");
// DateField's estimate had room to spare. So both give the edit no box, and
// the fields wrapper inside it sizes to the segments.
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
    type: "time",
    values: ["09:30", "12:00", "23:45"].flatMap((value) => [
      { value, step: 60, segments: ["hour", "minute", "ampm"] },
      { value, step: 1, segments: ["hour", "minute", "second", "ampm"] },
    ]),
  },
  {
    file: "date-field.tsx",
    container: "datefield_container_cva",
    input: "datefield_cva",
    type: "date",
    values: ["2026-09-26", ""].map((value) => ({
      value,
      segments: ["month", "day", "year"],
    })),
  },
];

// Every field at every size, which the wrapper sets as the text size the
// input inherits
const cases = fields.flatMap(({ values, ...field }) =>
  ["small", "medium", "large"].flatMap((size) =>
    values.map(({ value, step, segments }) => ({
      ...field,
      id: [field.type, size, value || "empty", step && `step-${step}`]
        .filter(Boolean)
        .join("-"),
      size,
      value,
      step,
      segments,
    })),
  ),
);

// The right edge of a DevTools box-model quad
const right = (quad) => Math.max(quad[0], quad[2], quad[4], quad[6]);

test("no DateField or TimeField segment is cut off in Chromium", async () => {
  const css = await compileComponents(fields.map(({ file }) => file));
  const browser = await launchInUSEnglish();
  try {
    // No viewport, so the page renders at a real scale factor of 1: emulating
    // a larger `deviceScaleFactor` widens Chromium's estimate and hides some
    // of the cut
    const page = await browser.newPage({ viewport: null, locale: "en-US" });
    await page.setContent(
      `<!doctype html><html><head><style>${css}</style></head><body>${cases
        .map(
          ({ id, file, container, input, type, size, value, step }) =>
            `<div class="${cvaClasses(file, container, { size })}"><input id="${id}" type="${type}" value="${value}"${step ? ` step="${step}"` : ""} class="${cvaClasses(file, input)}"></div>`,
        )
        .join("")}</body></html>`,
    );
    assert.equal(await page.evaluate(() => devicePixelRatio), 1);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("DOM.enable");
    const box = async ({ nodeId }) =>
      (await cdp.send("DOM.getBoxModel", { nodeId })).model;

    const cut = [];
    for (const { id, segments: names } of cases) {
      const { segments, ...parts } = await dateTimeParts(cdp, id);
      // A time ends in AM/PM, so this is the 12-hour layout
      assert.deepEqual(
        segments.map(({ name }) => name),
        names,
        id,
      );

      // The input cuts off what passes its content box, and the edit or the
      // fields wrapper, which have no border, what passes their border box
      const [, clipEdge] = await visibleSpan(cdp, parts);
      for (const { name, node } of segments) {
        const overflow = right((await box(node)).content) - clipEdge;
        if (overflow > 0.01)
          cut.push(`${id} ${name}: ${overflow.toFixed(2)}px`);
      }
    }
    assert.deepEqual(cut, []);
  } finally {
    await browser.close();
  }
});
