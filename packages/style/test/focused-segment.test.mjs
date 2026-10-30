// DateField and TimeField fill the focused segment of their native input with
// primitive `primary-600` and `white`. Chromium styles a segment only through
// its `::-webkit-datetime-edit-*-field` pseudo-element and never matches
// `:focus` there, so the components match the focused one with `:focus-within`.
import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";

import tailwindcss from "@tailwindcss/postcss";
import { chromium } from "playwright";
import postcss from "postcss";

const packageDir = new URL("..", import.meta.url).pathname;
const { exports } = JSON.parse(
  fs.readFileSync(new URL("../package.json", import.meta.url)),
);
const components = new URL("../../react/src/components/", import.meta.url);

// A consumer's Tailwind 4 stylesheet that scans the two components
async function compile() {
  const css = `@import "tailwindcss" source(none);
@import "./${exports["."].style.replace(/^\.\//, "")}";
@source "../react/src/components/date-field.tsx";
@source "../react/src/components/time-field.tsx";`;
  const result = await postcss([tailwindcss({ base: packageDir })]).process(
    css,
    {
      from: `${packageDir}consumer.css`,
    },
  );
  return result.css;
}

// The classes a component's `cva` call gives its <input>
function inputClasses(file, cvaName) {
  const source = fs.readFileSync(new URL(file, components), "utf8");
  const list = source.split(`const ${cvaName} = cva([`)[1]?.split("]);")[0];
  assert.ok(list, `${file} has no ${cvaName}`);
  return [...list.matchAll(/"([^"]*)"/g)]
    .map(([, classes]) => classes)
    .join(" ");
}

// Each segment's colours, in order. The segments sit in the input's
// user-agent shadow root, which only the DevTools protocol reaches.
async function segments(cdp, id) {
  const { root } = await cdp.send("DOM.getDocument", {
    depth: -1,
    pierce: true,
  });
  const attribute = (node, name) => {
    const attributes = node.attributes ?? [];
    const i = attributes.indexOf(name);
    return i % 2 === 0 ? attributes[i + 1] : undefined;
  };
  const found = [];
  const walk = (node, inInput) => {
    inInput ||= attribute(node, "id") === id;
    const segment = attribute(node, "pseudo")?.match(
      /^-webkit-datetime-edit-(\w+)-field$/,
    );
    if (inInput && segment) found.push({ name: segment[1], node });
    for (const child of [...(node.children ?? []), ...(node.shadowRoots ?? [])])
      walk(child, inInput);
  };
  walk(root, false);

  return Promise.all(
    found.map(async ({ name, node }) => {
      const { computedStyle } = await cdp.send("CSS.getComputedStyleForNode", {
        nodeId: node.nodeId,
      });
      const value = (prop) => computedStyle.find((p) => p.name === prop).value;
      return {
        name,
        backgroundColor: value("background-color"),
        color: value("color"),
      };
    }),
  );
}

// `date-field-segment-active` and `time-field-segment-active`: primitive
// `primary-600` and `white`, the same in both themes
const fill = {
  backgroundColor: "rgb(37, 99, 235)",
  color: "rgb(255, 255, 255)",
};

const fields = [
  {
    id: "date",
    classes: inputClasses("date-field.tsx", "datefield_cva"),
    attributes: 'type="date" value="2026-09-26"',
    segments: ["month", "day", "year"],
  },
  {
    id: "time",
    classes: inputClasses("time-field.tsx", "timefield_cva"),
    attributes: 'type="time" value="09:30" step="60"',
    segments: ["hour", "minute", "ampm"],
  },
  {
    id: "time-seconds",
    classes: inputClasses("time-field.tsx", "timefield_cva"),
    attributes: 'type="time" value="09:30:15" step="1"',
    segments: ["hour", "minute", "second", "ampm"],
  },
];

test("only the focused DateField or TimeField segment is filled, in both themes", async () => {
  const css = await compile();
  const browser = await chromium.launch();
  try {
    // en-US, so the segments come month first and the time has AM/PM
    const page = await browser.newPage({ locale: "en-US" });
    await page.setContent(
      `<!doctype html><html><head><style>${css}</style></head><body>${fields
        .map(
          ({ id, classes, attributes }) =>
            `<input id="${id}" ${attributes} class="${classes}">`,
        )
        .join("")}</body></html>`,
    );
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("DOM.enable");
    await cdp.send("CSS.enable");
    const filled = async (id) =>
      (await segments(cdp, id)).filter(
        ({ backgroundColor }) => backgroundColor === fill.backgroundColor,
      );

    for (const theme of ["light", "dark"]) {
      await page.evaluate(
        (dark) => document.documentElement.classList.toggle("dark", dark),
        theme === "dark",
      );
      for (const field of fields) {
        const input = page.locator(`#${field.id}`);
        assert.deepEqual(
          (await segments(cdp, field.id)).map(({ name }) => name),
          field.segments,
        );

        // Focus lands on the first segment, and ArrowRight moves it on
        await input.focus();
        for (const [i, name] of field.segments.entries()) {
          if (i) await page.keyboard.press("ArrowRight");
          assert.deepEqual(
            await filled(field.id),
            [{ name, ...fill }],
            `${field.id} (${theme}), ${name} focused`,
          );
        }

        await input.blur();
        assert.deepEqual(
          await filled(field.id),
          [],
          `${field.id} (${theme}), blurred`,
        );
      }
    }
  } finally {
    await browser.close();
  }
});
