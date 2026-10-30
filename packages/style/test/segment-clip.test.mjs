// Chromium sizes a date or time input's `::-webkit-datetime-edit` to a fixed
// estimate of its segments' text, which leaves out author margins, and the
// edit's `overflow: hidden` cuts off whatever doesn't fit. DateField's and
// TimeField's 2px separator margins cut the end of TimeField's last segment
// ("09:30 AM" read "09:30 AN"), so both let the edit grow to its content.
import assert from "node:assert/strict";
import { test } from "node:test";

import { chromium } from "playwright";

import { compile } from "./compile.mjs";
import { components, cvaClasses, inputParts } from "./components.mjs";

const fields = [
  {
    file: "time-field.tsx",
    container: "timefield_container_cva",
    input: "timefield_cva",
    type: "time",
    attributes: ["09:30", "12:00", "23:45"].flatMap((value) =>
      [60, 1].map((step) => `value="${value}" step="${step}"`),
    ),
  },
  {
    file: "date-field.tsx",
    container: "datefield_container_cva",
    input: "datefield_cva",
    type: "date",
    attributes: ['value="2026-09-26"', 'value=""'],
  },
];

// Every field at every size, enabled and disabled
const cases = fields.flatMap((field) =>
  ["small", "medium", "large"].flatMap((size) =>
    [false, true].flatMap((disabled) =>
      field.attributes.map((attributes) => ({
        ...field,
        id: `${field.type}-${size}${disabled ? "-disabled" : ""}-${attributes.match(/value="([^"]*)"/)[1] || "empty"}${attributes.match(/step="(\d+)"/)?.[1] === "1" ? "-seconds" : ""}`,
        size,
        disabled,
        attributes,
      })),
    ),
  ),
);

// The right edge of a DevTools box-model quad
const right = (quad) => Math.max(quad[0], quad[2], quad[4], quad[6]);

test("no DateField or TimeField segment is cut off in Chromium", async () => {
  // Scan the components, as the full stylesheet scans the React sources
  const files = new Set(fields.map(({ file }) => file));
  const css = await compile(
    [...files]
      .map((file) => `@source "${new URL(file, components).pathname}";`)
      .join("\n"),
  );
  // Headless Linux Chromium takes the 12/24-hour format from LANG, not from
  // the page's locale
  const browser = await chromium.launch({
    env: { ...process.env, LANG: "en_US.UTF-8" },
  });
  try {
    // No viewport, so no device-scale-factor emulation, which widens
    // Chromium's estimate and hides the cut
    const page = await browser.newPage({ viewport: null, locale: "en-US" });
    await page.setContent(
      `<!doctype html><html><head><style>${css}</style></head><body>${cases
        .map(
          ({ id, file, container, input, type, size, disabled, attributes }) =>
            `<div class="${cvaClasses(file, container, { size, disabled, invalid: false })}"><input id="${id}" type="${type}" ${attributes}${disabled ? " disabled" : ""} class="${cvaClasses(file, input)}"></div>`,
        )
        .join("")}</body></html>`,
    );
    assert.equal(await page.evaluate(() => devicePixelRatio), 1);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("DOM.enable");
    const box = async ({ nodeId }) =>
      (await cdp.send("DOM.getBoxModel", { nodeId })).model;

    const cut = [];
    for (const { id } of cases) {
      const { input, parts } = await inputParts(cdp, id);
      const edit = parts.find(
        ({ pseudo }) => pseudo === "-webkit-datetime-edit",
      );
      const segments = parts.flatMap(({ pseudo, node }) => {
        const segment = pseudo.match(/^-webkit-datetime-edit-(\w+)-field$/);
        return segment ? [{ name: segment[1], node }] : [];
      });
      if (id === "time-small-09:30")
        assert.ok(
          segments.some(({ name }) => name === "ampm"),
          `${id} has no AM/PM segment, so this isn't a 12-hour layout`,
        );

      // The input clips at its content box, and the edit at its border box
      const end = Math.min(
        right((await box(input)).content),
        right((await box(edit.node)).border),
      );
      for (const { name, node } of segments) {
        const over = right((await box(node)).content) - end;
        if (over > 0.01) cut.push(`${id} ${name}: ${over.toFixed(2)}px`);
      }
    }
    assert.deepEqual(cut, []);
  } finally {
    await browser.close();
  }
});
