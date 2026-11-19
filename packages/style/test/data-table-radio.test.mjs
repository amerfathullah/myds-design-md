// DataTable's radio selection in Chromium. Each table's row radios are one
// radio group, so the table is one Tab stop: its selected row, or its first
// selectable row while none is selected or the selected row can't be
// selected. The arrow keys move between the table's selectable rows and
// select them, and never reach another table. "Clear selection" never
// submits a form. A disabled radio looks as the library's Radio does,
// selected or not, in both themes, and keyboard focus rings a radio while a
// click doesn't.
//
// The page is data-table-radio.page.jsx: the React components themselves,
// bundled with esbuild, on the stylesheet the Tailwind import compiles for
// full.css's sources.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";
import { chromium } from "playwright";

import { registryDefine } from "../../react/registry-define.mjs";
import { compile, fullCssSources } from "./compile.mjs";
import { colours } from "./field-looks.mjs";

const pageSource = fileURLToPath(
  new URL("./data-table-radio.page.jsx", import.meta.url),
);
// The page imports React and the components' dependencies from where the
// components resolve them, so the bundle has one copy of React
const reactModules = fileURLToPath(
  new URL("../../react/node_modules", import.meta.url),
);

const width = 1280;
const height = 1400;
// A part of the page, clear of every control, where the pointer rests
const away = { x: width - 8, y: 8 };

let browser;
let html;
before(async () => {
  const [bundle, css] = await Promise.all([
    build({
      entryPoints: [pageSource],
      bundle: true,
      write: false,
      format: "iife",
      jsx: "automatic",
      nodePaths: [reactModules],
      define: { ...registryDefine, "process.env.NODE_ENV": '"production"' },
      logLevel: "silent",
    }),
    compile(`${fullCssSources()}\n@source "${pageSource}";`),
  ]);
  const script = bundle.outputFiles[0].text.replaceAll(
    "</script",
    "<\\/script",
  );
  // Transitions and animations off, so each state reads as it ends
  html = `<!doctype html><html><head><style>${css}</style><style>*,::before,::after{transition:none!important;animation:none!important}</style></head><body class="bg-bg-white"><div id="root"></div><script>${script}</script></body></html>`;
  browser = await chromium.launch();
});
after(() => browser?.close());

// Opens the page in `theme` and runs `use` on it once React has rendered it,
// with the pointer away from every control. Nothing logs an error or a
// warning, and the form submits only when `use` expects it to.
async function withPage(use, { theme = "light" } = {}) {
  const context = await browser.newContext({ viewport: { width, height } });
  try {
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (["error", "warning"].includes(message.type()))
        errors.push(message.text());
    });
    await page.setContent(html);
    await page.waitForFunction(() => window.ready.length === 1);
    if (theme === "dark")
      await page.evaluate(() => document.documentElement.classList.add("dark"));
    await page.mouse.move(away.x, away.y);
    const result = await use(page);
    assert.deepEqual(errors, []);
    return result;
  } finally {
    await context.close();
  }
}

// The row radio of row `id` in the table `table` ("first", "second" or
// "form")
const radio = (page, table, id) =>
  page.locator(`[data-test=${table}] tbody input[type=radio][value=${id}]`);

// Runs in the page: the focused element, as "table row" for a row radio,
// "table Clear selection" for a table's reset button, or its `data-test`
function describeFocus() {
  const element = document.activeElement;
  const table = element.closest("table")?.closest("[data-test]")?.dataset.test;
  if (element.matches("input[type=radio]")) return `${table} ${element.value}`;
  if (table) return `${table} ${element.getAttribute("aria-label")}`;
  return element.dataset.test ?? element.tagName;
}

// Focuses the element with `data-test={from}`, presses `key` `count` times,
// and returns where focus lands after each press
async function stops(page, from, key, count) {
  await page.focus(`[data-test=${from}]`);
  const landed = [];
  for (let press = 0; press < count; press++) {
    await page.keyboard.press(key);
    landed.push(await page.evaluate(describeFocus));
  }
  return landed;
}

// The ids of the rows selected in the table `table`, by their radios
const selected = (page, table) =>
  page.$$eval(`[data-test=${table}] tbody input[type=radio]`, (radios) =>
    radios.filter((radio) => radio.checked).map((radio) => radio.value),
  );

// The calls the table `table`'s `onSelectionChange` has had
const selections = (page, table) =>
  page.evaluate((table) => window.selections[table], table);

// Makes the rows `ids` of the table `table` unselectable, besides d, and
// waits for React to disable their radios
async function lock(page, table, ids) {
  await page.evaluate(([table, ids]) => window.lock(table, ids), [table, ids]);
  for (const id of ids)
    await page.waitForFunction(
      ([table, id]) =>
        document.querySelector(
          `[data-test=${table}] tbody input[type=radio][value=${id}]`,
        ).disabled,
      [table, id],
    );
}

test("with nothing selected, each table is one Tab stop, its first row, in both directions", async () => {
  await withPage(async (page) => {
    assert.deepEqual(
      {
        tab: await stops(page, "before", "Tab", 4),
        shiftTab: await stops(page, "after", "Shift+Tab", 4),
      },
      {
        tab: ["first a", "between", "second a", "after"],
        shiftTab: ["second a", "between", "first a", "before"],
      },
    );
  });
});

test("with a row selected, Tab stops on Clear selection and then the selected row, and the other table stays at its first row", async () => {
  await withPage(async (page) => {
    await radio(page, "first", "c").click();
    await page.mouse.move(away.x, away.y);
    assert.deepEqual(await stops(page, "before", "Tab", 5), [
      "first Clear selection",
      "first c",
      "between",
      "second a",
      "after",
    ]);
  });
});

test("the arrow keys move between the table's selectable rows, wrapping, select each, and never reach the other table", async () => {
  await withPage(async (page) => {
    await page.focus("[data-test=before]");
    await page.keyboard.press("Tab");
    const visit = async (key) => {
      await page.keyboard.press(key);
      return {
        focus: await page.evaluate(describeFocus),
        selected: await selected(page, "first"),
      };
    };
    const down = [];
    for (let press = 0; press < 3; press++) down.push(await visit("ArrowDown"));
    const up = [];
    for (let press = 0; press < 3; press++) up.push(await visit("ArrowUp"));
    assert.deepEqual(
      {
        down,
        up,
        first: await selections(page, "first"),
        second: await selections(page, "second"),
        secondSelected: await selected(page, "second"),
      },
      {
        down: [
          { focus: "first b", selected: ["b"] },
          { focus: "first c", selected: ["c"] },
          { focus: "first a", selected: ["a"] },
        ],
        up: [
          { focus: "first c", selected: ["c"] },
          { focus: "first b", selected: ["b"] },
          { focus: "first a", selected: ["a"] },
        ],
        // The call on mount, then one call for each move
        first: [[], ["b"], ["c"], ["a"], ["c"], ["b"], ["a"]],
        second: [[]],
        secondSelected: [],
      },
    );
  });
});

test("Space selects the focused, unselected row", async () => {
  await withPage(async (page) => {
    await page.focus("[data-test=before]");
    await page.keyboard.press("Tab");
    const focus = await page.evaluate(describeFocus);
    await page.keyboard.press("Space");
    assert.deepEqual(
      {
        focus,
        selected: await selected(page, "first"),
        calls: await selections(page, "first"),
      },
      { focus: "first a", selected: ["a"], calls: [[], ["a"]] },
    );
  });
});

test("once the selected row can't be selected, the table is a Tab stop at its first selectable row, in both directions", async () => {
  await withPage(async (page) => {
    await radio(page, "first", "b").click();
    await page.mouse.move(away.x, away.y);
    const entered = await stops(page, "before", "Tab", 2);
    // Row b has focus as it's locked
    await lock(page, "first", ["b"]);
    assert.deepEqual(
      {
        entered,
        tab: await stops(page, "before", "Tab", 3),
        shiftTab: await stops(page, "between", "Shift+Tab", 3),
        selected: await selected(page, "first"),
      },
      {
        entered: ["first Clear selection", "first b"],
        tab: ["first Clear selection", "first a", "between"],
        shiftTab: ["first a", "first Clear selection", "before"],
        selected: ["b"],
      },
    );
  });
});

test("Enter in a form's text field submits through its submit button, not Clear selection, and the row stays selected", async () => {
  await withPage(async (page) => {
    await radio(page, "form", "b").click();
    const name = await radio(page, "form", "b").getAttribute("name");
    await page.focus("[data-test=field]");
    await page.keyboard.press("Enter");
    await page.waitForFunction(() => window.submits.length > 0);
    assert.deepEqual(
      {
        submits: await page.evaluate(() => window.submits),
        selected: await selected(page, "form"),
      },
      {
        submits: [{ submitter: "submit", entries: [[name, "b"]] }],
        selected: ["b"],
      },
    );
  });
});

// The page's pixels at `points`, as "rgb(r, g, b)"
async function pixels(page, points) {
  const png = await page.screenshot({ fullPage: true });
  return page.evaluate(
    async ({ src, points }) => {
      const image = new Image();
      image.src = src;
      await image.decode();
      const canvas = new OffscreenCanvas(image.width, image.height);
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.drawImage(image, 0, 0);
      return points.map(({ x, y }) => {
        const [r, g, b] = context.getImageData(x, y, 1, 1).data;
        return `rgb(${r}, ${g}, ${b})`;
      });
    },
    { src: `data:image/png;base64,${png.toString("base64")}`, points },
  );
}

// In a radio's 16px circle: its fill, between the dot and the edge; its
// centre, where the dot is; and its top-left corner, outside the circle
const spots = { fill: [3, 8], centre: [7, 7], corner: [0, 0] };

// The pixels at `spots` of each 16px radio `circles` names, as
// `{ name: { fill, centre, corner } }`. Each circle is a selector.
async function looks(page, circles) {
  const boxes = await Promise.all(
    Object.values(circles).map((selector) =>
      page.locator(selector).boundingBox(),
    ),
  );
  const points = boxes.flatMap((box) =>
    Object.values(spots).map(([dx, dy]) => ({
      x: Math.floor(box.x) + dx,
      y: Math.floor(box.y) + dy,
    })),
  );
  const read = await pixels(page, points);
  const names = Object.keys(spots);
  return Object.fromEntries(
    Object.keys(circles).map((circle, index) => [
      circle,
      Object.fromEntries(
        names.map((spot, at) => [spot, read[index * names.length + at]]),
      ),
    ]),
  );
}

// The circle drawn around the row radio of row `id` in the table `table`:
// the radio's wrapper
const circle = (table, id) =>
  `[data-test=${table}] tbody div:has(> input[type=radio][value=${id}])`;

// The disabled looks, from the issue (#165): the library's Radio, small,
// disabled, checked and not, measured in Chromium
const disabledLooks = {
  light: {
    checked: "rgb(188, 207, 248)",
    unchecked: colours.light["bg-washed"],
  },
  dark: { checked: "rgb(27, 46, 90)", unchecked: colours.dark["bg-washed"] },
};

test("a disabled radio, selected or not, looks as the library's Radio does, in both themes", async () => {
  for (const theme of ["light", "dark"])
    await withPage(
      async (page) => {
        // In the first table, row b is selected and then locked, and d is
        // never selectable. In the second, c is selected, and a isn't.
        await radio(page, "first", "b").click();
        await lock(page, "first", ["b"]);
        await radio(page, "second", "c").click();
        await page.evaluate(() => document.activeElement?.blur());
        await page.mouse.move(away.x, away.y);
        const actual = await looks(page, {
          lockedSelected: circle("first", "b"),
          disabled: circle("first", "d"),
          selected: circle("second", "c"),
          unselected: circle("second", "a"),
          radioDisabledChecked: "[data-test=radio-disabled-on]",
          radioDisabled: "[data-test=radio-disabled-off]",
          radioChecked: "[data-test=radio-on]",
          radioUnchecked: "[data-test=radio-off]",
        });
        // An unselected radio draws no dot
        const dots = await page.$$eval(
          "[data-test=second] tbody input[type=radio]:not(:checked)",
          (radios) =>
            radios.map(
              (radio) => getComputedStyle(radio, "::before").backgroundColor,
            ),
        );
        const pageColour = colours[theme]["bg-white"];
        const { checked, unchecked } = disabledLooks[theme];
        assert.deepEqual(
          { ...actual, dots },
          {
            // Faded primary-600, with its dot, round
            lockedSelected: {
              fill: checked,
              centre: actual.radioDisabledChecked.centre,
              corner: pageColour,
            },
            // bg-washed at full opacity, with no dot, round
            disabled: {
              fill: unchecked,
              centre: unchecked,
              corner: pageColour,
            },
            // As before: primary-600 with its bg-white dot
            selected: actual.radioChecked,
            unselected: {
              fill: pageColour,
              centre: pageColour,
              corner: pageColour,
            },
            radioDisabledChecked: {
              fill: checked,
              centre: actual.radioDisabledChecked.centre,
              corner: pageColour,
            },
            radioDisabled: {
              fill: unchecked,
              centre: unchecked,
              corner: pageColour,
            },
            radioChecked: actual.radioChecked,
            radioUnchecked: {
              fill: pageColour,
              centre: pageColour,
              corner: pageColour,
            },
            // a, b and d
            dots: ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0)"],
          },
          theme,
        );
        // The dot shows: the centre isn't the fill
        for (const name of ["lockedSelected", "selected"])
          assert.notEqual(actual[name].centre, actual[name].fill, name);
      },
      { theme },
    );
});

// Runs in the page: the fr-primary-looking ring layers on the focused row
// radio's circle, its wrapper: spread-only layers that aren't Tailwind's
// empty, transparent ones
function readRing() {
  return getComputedStyle(document.activeElement.parentElement)
    .boxShadow.split(/,(?![^(]*\))/)
    .map((layer) => layer.trim())
    .filter(
      (layer) =>
        /^rgba?\([^)]*\) 0px 0px 0px [\d.]+px( inset)?$/.test(layer) &&
        !layer.startsWith("rgba(0, 0, 0, 0)"),
    );
}

test("keyboard focus rings a row radio with fr-primary, 3px, and a click doesn't, in both themes", async () => {
  const actual = {};
  const expected = {};
  for (const theme of ["light", "dark"])
    await withPage(
      async (page) => {
        await page.focus("[data-test=before]");
        await page.keyboard.press("Tab");
        actual[`${theme}, keyboard`] = {
          focus: await page.evaluate(describeFocus),
          ring: await page.evaluate(readRing),
        };
        await radio(page, "second", "b").click();
        actual[`${theme}, click`] = {
          focus: await page.evaluate(describeFocus),
          ring: await page.evaluate(readRing),
        };
        expected[`${theme}, keyboard`] = {
          focus: "first a",
          ring: [`${colours[theme]["fr-primary"]} 0px 0px 0px 3px`],
        };
        expected[`${theme}, click`] = { focus: "second b", ring: [] };
      },
      { theme },
    );
  assert.deepEqual(actual, expected);
});

test("inside a form, Clear selection clears the selection and submits nothing", async () => {
  await withPage(async (page) => {
    await radio(page, "form", "c").click();
    // The radio column's header holds only Clear selection
    await page.locator("[data-test=form] thead button").click();
    assert.deepEqual(
      {
        submits: await page.evaluate(() => window.submits),
        selected: await selected(page, "form"),
      },
      { submits: [], selected: [] },
    );
  });
});
