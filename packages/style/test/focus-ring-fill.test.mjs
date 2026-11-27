// A focused filled control draws its focus ring 2px wide, outside a 2px band
// in `fr-gap`, which separates the ring from the fill (#264). Its variant
// fills it, as on a `primary-fill` Button, or a state does, such as checked.
// Without the band, the opaque `fr-primary` ring sits close to the fill:
// 1.30:1 on `primary-600` in light, and 1.00:1 on a hovered `primary-700`
// fill, the ring's own colour. The controls are `primary-fill`
// and `danger-fill` Buttons, which ring on `focus:`, checked and
// indeterminate Checkboxes, checked Radios and DataTable radios, which ring
// on keyboard focus, checked Switches, which ring while their checkbox has
// focus, and the Calendar's selected day, range start and end, and selected
// month and year. Each reaches 4px out, as the 3px ring did plus 1px, so it
// fits the tight places: DataTable's selection cells, a Select's footer and
// the large SearchBar's search button. A button in a Select's header loses
// its top side to the Select's scroll box, as the 3px ring does (#284).
//
// The test reads the band and ring on each side of each control, at rest and
// hovered, in both themes, from the pixels Chromium paints: a line of pixels
// out from the middle of each side. The band contrasts at least 3:1 with the
// fill, and the ring with the band. Unfocused, a filled control draws neither,
// and under forced colours, which drop box-shadows, it draws an outline only
// while it has focus.
//
// The page is focus-ring-fill.page.jsx: the React components themselves,
// bundled with esbuild, on the stylesheet the Tailwind import compiles for
// full.css's sources.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";

import { build } from "esbuild";
import { chromium } from "playwright";

import { registryDefine } from "../../react/registry-define.mjs";
import { compile, fullCssSources } from "./compile.mjs";
import { colours } from "./field-looks.mjs";

const pageSource = fileURLToPath(
  new URL("./focus-ring-fill.page.jsx", import.meta.url),
);
// The page imports React and the components' dependencies from where the
// components resolve them, so the bundle has one copy of React
const reactModules = fileURLToPath(
  new URL("../../react/node_modules", import.meta.url),
);

const viewport = { width: 1200, height: 1900 };
// An empty part of the page, where the pointer rests
const away = { x: 1150, y: 20 };

// The fills, as [r, g, b]: primitives, the same in both themes, except the
// checked Switch's track, which is `primary-400` in dark
const fillColours = {
  "primary-600": [37, 99, 235],
  "primary-700": [29, 78, 216],
  "danger-600": [220, 38, 38],
  "danger-700": [185, 28, 28],
  "primary-400": [99, 148, 255],
};

const sizes = ["small", "medium", "large"];
const tableRadio = (row) =>
  `[data-test=table-radio] tbody tr:nth-child(${row}) div:has(> input[type=radio])`;
const day = (calendar, date) =>
  `[data-test=${calendar}] td[data-day="${date}"] > button`;

/**
 * Each filled control:
 * - `name`: what the test calls it
 * - `focus`: the element that takes focus
 * - `ring`: the element that draws the ring, if not the focused one
 * - `outline`: the element that draws the forced-colours outline, if not the
 *   focused one
 * - `fills`: its fill at rest and hovered, as `[rest, hover]`, or per theme
 * - `from`: the control Tab reaches first, if not this one
 * - `reach`: how keyboard focus reaches it, after Tab reaches `from` (or
 *   `focus`): `keys` presses `keys` there, `select` presses Space to fill
 *   it, and `list` opens the Select by keyboard, then focuses it by script,
 *   since Tab doesn't move through an open Select
 * - `view`: the Calendar's caption button that opens its month or year view
 * - `hidden`: sides that something hides, as it hides today's 3px ring: a
 *   neighbour that paints over them (#283) or a container that clips them
 *   (#284)
 * - `resting`: whether it can rest unfocused where it is
 * - `measured`: the pixel inside the edge the band is measured against, if
 *   not 2px in, as on the SearchBar's button: its 1px `primary-600` border,
 *   around a gradient from `primary-400`. Its edge is round, so the border's
 *   pixel is antialiased into the band, up to 16 off in a channel.
 * - `tolerance`: how far, in each channel, the measured pixel may be from the
 *   fill: 8 unless it says otherwise
 */
const controls = [
  {
    name: "Button, primary-fill",
    focus: "[data-test=primary-fill]",
    fills: ["primary-600", "primary-700"],
  },
  {
    name: "Button, danger-fill",
    focus: "[data-test=danger-fill]",
    fills: ["danger-600", "danger-700"],
  },
  {
    name: "Checkbox, checked",
    focus: "[data-test=checked]",
    fills: ["primary-600", "primary-700"],
  },
  {
    name: "Checkbox, indeterminate",
    focus: "[data-test=indeterminate]",
    fills: ["primary-600", "primary-700"],
  },
  ...sizes.map((size) => ({
    name: `Radio, ${size}`,
    focus: `[data-test=radio-${size}]`,
    fills: ["primary-600", "primary-600"],
  })),
  ...sizes.map((size) => ({
    name: `Switch, ${size}`,
    focus: `#switch-${size}`,
    ring: `#switch-${size} + span`,
    outline: `#switch-${size} + span`,
    fills: {
      light: ["primary-600", "primary-600"],
      dark: ["primary-400", "primary-400"],
    },
  })),
  {
    name: "DataTable's radio column",
    focus: `${tableRadio(1)} > input`,
    ring: tableRadio(1),
    reach: "select",
    fills: ["primary-600", "primary-600"],
  },
  {
    name: "DataTable's checkbox column",
    focus: "[data-test=table-checkbox] tbody tr:nth-child(1) [role=checkbox]",
    reach: "select",
    fills: ["primary-600", "primary-700"],
  },
  {
    name: "Calendar, selected day",
    focus: day("calendar-day", "2026-10-14"),
    fills: ["primary-600", "primary-600"],
  },
  {
    name: "Calendar, range start",
    focus: day("calendar-range", "2026-10-06"),
    fills: ["primary-600", "primary-600"],
    // The next day's range fill, `bg-primary-100`, paints over it (#283)
    hidden: ["right"],
  },
  {
    name: "Calendar, range end",
    focus: day("calendar-range", "2026-10-09"),
    from: day("calendar-range", "2026-10-06"),
    reach: "keys",
    keys: ["ArrowRight", "ArrowRight", "ArrowRight"],
    fills: ["primary-600", "primary-600"],
  },
  {
    name: "Calendar, selected month",
    focus: "[data-test=calendar-month] button[data-selected=true]",
    view: { calendar: "calendar-month", button: "October" },
    fills: ["primary-600", "primary-700"],
  },
  {
    name: "Calendar, selected year",
    focus: "[data-test=calendar-year] button[data-selected=true]",
    view: { calendar: "calendar-year", button: "2026" },
    fills: ["primary-600", "primary-700"],
  },
  {
    name: "SearchBar's search button, large",
    focus: "[data-test=search-button]",
    fills: ["primary-600", "primary-600"],
    measured: 1,
    tolerance: 16,
  },
  {
    name: "Button, primary-fill, in a SelectHeader",
    focus: "[data-test=select-header-button]",
    reach: "list",
    fills: ["primary-600", "primary-700"],
    resting: false,
    // The Select's scroll box clips it, with no room above the header (#284)
    hidden: ["top"],
  },
  {
    name: "Button, primary-fill, in a SelectFooter",
    focus: "[data-test=select-footer-button]",
    reach: "list",
    fills: ["primary-600", "primary-700"],
    resting: false,
  },
];

// Controls beside them that don't fill, so keep the 3px ring with no band.
// The Calendar's month buttons are Buttons whose classes make them outlined.
const unfilled = [
  {
    name: "Calendar's next-month button",
    focus: '[data-test=calendar-day] button[aria-label="Go to the Next Month"]',
  },
  {
    name: "Calendar's next-year button, in the month view",
    focus:
      '[data-test=calendar-month] button[aria-label="Go to the Next Year"]',
  },
  {
    name: "Calendar, a day",
    focus: day("calendar-day", "2026-10-15"),
    from: day("calendar-day", "2026-10-14"),
    reach: "keys",
    keys: ["ArrowRight"],
  },
  {
    name: "Calendar, a day in a range",
    focus: day("calendar-range", "2026-10-07"),
    from: day("calendar-range", "2026-10-06"),
    reach: "keys",
    keys: ["ArrowRight"],
  },
  {
    name: "DataTable's checkbox column, unchecked",
    focus: "[data-test=table-checkbox] tbody tr:nth-child(2) [role=checkbox]",
  },
];

let browser;
let decoder;
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
  decoder = await browser.newPage();
});
after(() => browser?.close());

// Compares only the entries that differ, so a failure lists just those
function assertEntries(actual, expected) {
  const differ = Object.keys({ ...actual, ...expected }).filter(
    (key) => !isDeepStrictEqual(actual[key], expected[key]),
  );
  const pick = (entries) =>
    Object.fromEntries(differ.map((key) => [key, entries[key]]));
  assert.deepEqual(pick(actual), pick(expected));
}

// Opens the page in a context of its own, in `theme`, with the month and
// year views open, and runs `use` on it
async function withPage(theme, use, { forcedColors = "none" } = {}) {
  const context = await browser.newContext({ viewport, forcedColors });
  try {
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setContent(html);
    await page.waitForSelector(day("calendar-day", "2026-10-14"));
    await page.evaluate(
      (dark) => document.documentElement.classList.toggle("dark", dark),
      theme === "dark",
    );
    // Enter on the caption's button leaves focus nowhere, so a click opens
    // each view, at rest
    for (const { view } of controls.filter(({ view }) => view)) {
      await page
        .locator(`[data-test=${view.calendar}]`)
        .getByRole("button", { name: view.button, exact: true })
        .click();
      await page.waitForSelector(
        `[data-test=${view.calendar}] button[data-selected=true]`,
      );
    }
    await rest(page);
    const result = await use(page);
    assert.deepEqual(errors, []);
    return result;
  } finally {
    await context.close();
  }
}

// Presses Tab until `selector` has focus
async function tabTo(page, selector) {
  for (let presses = 0; presses < 200; presses++) {
    if (
      await page.evaluate((s) => !!document.activeElement?.matches(s), selector)
    )
      return;
    await page.keyboard.press("Tab");
  }
  throw new Error(`Tab never reaches ${selector}`);
}

// Gives a control keyboard focus, as its `reach` says
async function focusByKeyboard(page, { focus, from, reach, keys }) {
  if (reach === "list") {
    if (
      (await page.getAttribute(
        "[data-test=select-trigger]",
        "aria-expanded",
      )) !== "true"
    ) {
      await tabTo(page, "[data-test=select-trigger]");
      await page.keyboard.press("Enter");
      await page.waitForSelector(focus);
    }
    await page.keyboard.press("Shift");
    await page.focus(focus);
    return;
  }
  await tabTo(page, from ?? focus);
  if (reach === "keys") for (const key of keys) await page.keyboard.press(key);
  if (
    reach === "select" &&
    !(await page.$(`${focus}:is(:checked, [data-state=checked])`))
  )
    await page.keyboard.press("Space");
  await page.waitForFunction((s) => document.activeElement?.matches(s), focus);
}

// Moves focus off the page's controls and the pointer away
async function rest(page) {
  await page.evaluate(() => document.activeElement?.blur());
  await page.mouse.move(away.x, away.y);
}

// The middle of `selector`'s box, in the page
const middleOf = (page, selector) =>
  page.$eval(selector, (element) => {
    const { x, y, width, height } = element.getBoundingClientRect();
    return { x: x + width / 2, y: y + height / 2 };
  });

// Runs in the page: whether `focus` has focus, and the ring layers in
// `ring`'s box-shadow: spread-only layers that aren't Tailwind's empty,
// transparent ones
function readFocus({ focus, ring }) {
  const layers = getComputedStyle(document.querySelector(ring))
    .boxShadow.split(/,(?![^(]*\))/)
    .map((layer) => layer.trim())
    .filter(
      (layer) =>
        /^rgba?\([^)]*\) 0px 0px 0px [\d.]+px$/.test(layer) &&
        !layer.startsWith("rgba(0, 0, 0, 0)"),
    );
  return {
    focused: document.activeElement === document.querySelector(focus),
    ring: layers,
  };
}

// The band and ring a filled control shows while focused, in `theme`
const filledRingOf = (theme) => [
  `${colours[theme]["fr-gap"]} 0px 0px 0px 2px`,
  `${colours[theme]["fr-primary"]} 0px 0px 0px 4px`,
];

// Runs in the page: on each side of `selector`'s box, a line of pixels out
// from the middle of the side, clear of the corners, from 2px inside the
// edge to 6px outside it. Chromium snaps a box at a fractional position to
// whole pixels at its rounded edges.
function linesOut({ selector }) {
  const box = document.querySelector(selector).getBoundingClientRect();
  const edge = {
    top: Math.round(box.top),
    bottom: Math.round(box.bottom),
    left: Math.round(box.left),
    right: Math.round(box.right),
  };
  const x = Math.floor((box.left + box.right) / 2);
  const y = Math.floor((box.top + box.bottom) / 2);
  // k is the pixel's distance out from the edge: -2 and -1 inside, 0 and 1
  // the band, 2 and 3 the ring, 4 and 5 the surface around it
  const ks = [-2, -1, 0, 1, 2, 3, 4, 5];
  return {
    top: ks.map((k) => ({ x, y: edge.top - 1 - k })),
    bottom: ks.map((k) => ({ x, y: edge.bottom + k })),
    left: ks.map((k) => ({ x: edge.left - 1 - k, y })),
    right: ks.map((k) => ({ x: edge.right + k, y })),
  };
}

// The colour of each point on the page, as [r, g, b] from 0 to 255
async function sample(page, points) {
  const xs = points.map(({ x }) => x);
  const ys = points.map(({ y }) => y);
  const clip = {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs) + 1,
    height: Math.max(...ys) - Math.min(...ys) + 1,
  };
  const png = await page.screenshot({ clip });
  return decoder.evaluate(
    async ({ src, points }) => {
      const image = new Image();
      image.src = src;
      await image.decode();
      const canvas = new OffscreenCanvas(image.width, image.height);
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0);
      return points.map(({ x, y }) => [
        ...context.getImageData(x, y, 1, 1).data.slice(0, 3),
      ]);
    },
    {
      src: `data:image/png;base64,${png.toString("base64")}`,
      points: points.map(({ x, y }) => ({ x: x - clip.x, y: y - clip.y })),
    },
  );
}

// WCAG 2.x relative luminance of an sRGB colour, as [r, g, b] from 0 to 255
function luminance(rgb) {
  const [r, g, b] = rgb.map((channel) => {
    const c = channel / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// WCAG 2.x contrast ratio between two colours
function contrast(a, b) {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (lighter + 0.05) / (darker + 0.05);
}

const rgbOf = (colour) => colour.match(/\d+/g).slice(0, 3).map(Number);
const distance = (a, b) => Math.max(...a.map((c, i) => Math.abs(c - b[i])));

// The name in `named` whose colour is nearest `pixel`
const nearest = (pixel, named) =>
  Object.entries(named).sort(
    ([, a], [, b]) => distance(pixel, a) - distance(pixel, b),
  )[0][0];

// What a side's line of pixels shows: the fill inside the edge, then, from
// the edge out, whether each of the next 4px is nearer the band's colour or
// the ring's, and whether the 2px after them are nearer the ring's or the
// page's, the surface around it. In light, `fr-gap` is the page's white, so
// the band and the surface are told apart by where they are. A round
// control's edges are antialiased, so a pixel counts as the colour it's
// nearest.
function readSide(line, { theme, measured = 2 }) {
  const gap = rgbOf(colours[theme]["fr-gap"]);
  const ring = rgbOf(colours[theme]["fr-primary"]);
  const surface = rgbOf(colours[theme]["bg-white"]);
  const inside = line[2 - measured];
  const outside = line.slice(2);
  const [band, rings] = [outside.slice(0, 2), outside.slice(2, 4)];
  return {
    inside,
    out: [
      ...outside.slice(0, 4).map((pixel) => nearest(pixel, { gap, ring })),
      ...outside.slice(4).map((pixel) => nearest(pixel, { ring, surface })),
    ].join(" "),
    // The lowest contrast of a band pixel with the fill, and of a ring pixel
    // with a band pixel
    bandOnFill: Math.min(...band.map((b) => contrast(b, inside))),
    ringOnBand: Math.min(
      ...rings.flatMap((r) => band.map((b) => contrast(r, b))),
    ),
  };
}

const themes = ["light", "dark"];
const fillsOf = ({ fills }, theme) =>
  Array.isArray(fills) ? fills : fills[theme];

test("each filled control, focused by keyboard, draws a 2px fr-gap band between its fill and a 2px fr-primary ring, at rest and hovered, in both themes", async () => {
  const actual = {};
  const expected = {};
  for (const theme of themes)
    await withPage(theme, async (page) => {
      for (const control of controls) {
        const ring = control.ring ?? control.focus;
        await focusByKeyboard(page, control);
        for (const [state, fillName] of [
          ["at rest", fillsOf(control, theme)[0]],
          ["hovered", fillsOf(control, theme)[1]],
        ]) {
          if (state === "hovered") {
            const { x, y } = await middleOf(page, ring);
            await page.mouse.move(x, y);
          } else await page.mouse.move(away.x, away.y);
          const key = `${control.name}, ${state} (${theme})`;
          actual[key] = await page.evaluate(readFocus, {
            focus: control.focus,
            ring,
          });
          expected[key] = { focused: true, ring: filledRingOf(theme) };
          const lines = await page.evaluate(linesOut, { selector: ring });
          const sides = Object.keys(lines).filter(
            (side) => !control.hidden?.includes(side),
          );
          const pixels = await sample(
            page,
            sides.flatMap((side) => lines[side]),
          );
          sides.forEach((side, i) => {
            const read = readSide(pixels.slice(8 * i, 8 * i + 8), {
              theme,
              measured: control.measured,
            });
            const sideKey = `${control.name}, ${state}, ${side} (${theme})`;
            // Within 8 of the fill in each channel, so the line starts on
            // the fill, hovered too; then 2px of band and 2px of ring, each
            // at least 3:1 with what it touches, and the page around them
            const want = fillColours[fillName];
            const { tolerance = 8 } = control;
            actual[sideKey] = {
              inside:
                distance(read.inside, want) <= tolerance
                  ? fillName
                  : read.inside,
              out: read.out,
              bandOnFill: read.bandOnFill >= 3 || read.bandOnFill.toFixed(2),
              ringOnBand: read.ringOnBand >= 3 || read.ringOnBand.toFixed(2),
            };
            expected[sideKey] = {
              inside: fillName,
              out: "gap gap ring ring surface surface",
              bandOnFill: true,
              ringOnBand: true,
            };
          });
        }
        await page.mouse.move(away.x, away.y);
      }
    });
  assertEntries(actual, expected);
});

test("a control beside them that doesn't fill keeps its 3px fr-primary ring, with no band, in both themes", async () => {
  const actual = {};
  const expected = {};
  for (const theme of themes)
    await withPage(theme, async (page) => {
      for (const control of unfilled) {
        const key = `${control.name} (${theme})`;
        await rest(page);
        await focusByKeyboard(page, control);
        actual[key] = await page.evaluate(readFocus, {
          focus: control.focus,
          ring: control.focus,
        });
        expected[key] = {
          focused: true,
          ring: [`${colours[theme]["fr-primary"]} 0px 0px 0px 3px`],
        };
      }
    });
  assertEntries(actual, expected);
});

test("unfocused, at rest or hovered, a filled control draws no band and no ring", async () => {
  const actual = {};
  const expected = {};
  for (const theme of themes)
    await withPage(theme, async (page) => {
      for (const control of controls.filter(
        ({ resting }) => resting !== false,
      )) {
        const ring = control.ring ?? control.focus;
        // Filled first, for the DataTable rows that fill on Space
        await focusByKeyboard(page, control);
        await rest(page);
        actual[`${control.name}, at rest (${theme})`] = await page.evaluate(
          readFocus,
          { focus: control.focus, ring },
        );
        const { x, y } = await middleOf(page, ring);
        await page.mouse.move(x, y);
        actual[`${control.name}, hovered (${theme})`] = await page.evaluate(
          readFocus,
          { focus: control.focus, ring },
        );
        for (const state of ["at rest", "hovered"])
          expected[`${control.name}, ${state} (${theme})`] = {
            focused: false,
            ring: [],
          };
        await rest(page);
      }
    });
  assertEntries(actual, expected);
});

// Runs in the page: the outline `selector` draws, as "<style> <width>", or
// "none" when it draws none
function readOutline({ selector }) {
  const { outlineStyle, outlineWidth } = getComputedStyle(
    document.querySelector(selector),
  );
  return outlineStyle === "none" || parseFloat(outlineWidth) === 0
    ? "none"
    : `${outlineStyle} ${outlineWidth}`;
}

test("under forced colours, a filled control draws a solid 2px outline only while it has focus, in both themes", async () => {
  const actual = {};
  const expected = {};
  for (const theme of themes)
    await withPage(
      theme,
      async (page) => {
        for (const control of controls) {
          const selector = control.outline ?? control.focus;
          await focusByKeyboard(page, control);
          actual[`${control.name}, focused (${theme})`] = await page.evaluate(
            readOutline,
            { selector },
          );
          expected[`${control.name}, focused (${theme})`] = "solid 2px";
          if (control.resting === false) continue;
          await rest(page);
          actual[`${control.name}, at rest (${theme})`] = await page.evaluate(
            readOutline,
            { selector },
          );
          expected[`${control.name}, at rest (${theme})`] = "none";
        }
      },
      { forcedColors: "active" },
    );
  assertEntries(actual, expected);
});
