// Keyboard focus shows MYDS's focus ring: a 3px ring in `fr-primary`, drawn
// as a box-shadow, or `fr-danger` on an invalid InputOTP, in both themes.
// These controls draw it on `:focus-visible`, so a mouse click shows none:
// the Link family (Link, SiteLink, NavbarMenuItem and NavbarLogo, with and
// without `asChild`), BreadcrumbLink, the Accordion, the NavbarMenuDropdown
// trigger, TooltipTrigger, TableCell, Radio, DataTable's radio column, the
// Tabs panel, and the toast card, its close button and its viewport.
// SearchBar and the active InputOTP slot ring on a click too, since they
// follow the input's focus. Some controls draw the ring on another element,
// where it isn't clipped: the Accordion item for its trigger, SearchBar's
// input container, the active InputOTP slot, and the radio wrapper in
// DataTable. TableCell's ring and the toast viewport's are inset. The pixels
// around each ring show it on all four sides. Under forced colours, where
// box-shadows don't render, an outline shows focus instead. A TooltipTrigger
// with `asChild` leaves its child's own ring alone.
//
// The page is focus-rings.page.jsx: the React components themselves, bundled
// with esbuild, on the stylesheet the Tailwind import compiles for full.css's
// sources.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";

import { build } from "esbuild";
import { chromium } from "playwright";

import { compile, fullCssSources } from "./compile.mjs";
import { colours } from "./field-looks.mjs";

const pageSource = fileURLToPath(
  new URL("./focus-rings.page.jsx", import.meta.url),
);
// The page imports React and the components' dependencies from where the
// components resolve them, so the bundle has one copy of React
const reactModules = fileURLToPath(
  new URL("../../react/node_modules", import.meta.url),
);

// Wide enough for the Navbar's desktop menu (`xl:`), and tall enough that
// nothing scrolls
const viewport = { width: 1400, height: 1500 };
// An empty part of the page, where the pointer rests
const away = { x: 1000, y: 700 };

// The NavbarMenuDropdown's trigger, and the elements that draw a ring or
// outline for a focused element inside them
const trigger = "header button[aria-expanded]";
const accordionItem = (test) => `div:has(> h3 > [data-test=${test}])`;
const otpSlot = (test) =>
  `[data-input-otp-container]:has(input[data-test=${test}]) > :first-child`;
const radioWrapper = (row) =>
  `[data-test=data-table] tbody tr:nth-child(${row}) div:has(> input[type=radio])`;
const tableCell = (row, column) => `[data-cell="${row}-${column}"]`;
const dataTableCell = (id) => `[data-test=data-table] [id="${id}"]`;

/**
 * Each control, in the page's tab order:
 * - `focus`: the element that takes focus
 * - `ring`: the element that draws the ring, if not the focused one
 * - `outline`: the element that draws the forced-colours outline, if not the
 *   focused one
 * - `colour`: the ring's token; `width`: its width; `inset`: drawn inside
 * - `reach`: how keyboard focus reaches it: `tab` (the default) presses Tab;
 *   `menu` Tabs to the NavbarMenuDropdown's trigger, presses Enter to open
 *   it, then Tabs on; `F8` presses the toast viewport's hotkey; `script`
 *   presses a key, then calls `focus()`, as on a TableCell, which is
 *   `tabIndex={-1}`
 * - `click`: whether a mouse click shows the ring too
 * - `pixels`: whether the pixels around the ring are checked for clipping
 */
const controls = [
  { name: "NavbarLogo", focus: 'a[href="#logo"]', pixels: true },
  { name: "NavbarMenuItem", focus: 'a[href="#nav-item"]', pixels: true },
  { name: "NavbarMenuItem asChild", focus: 'a[href="#nav-item-as-child"]' },
  { name: "NavbarMenuDropdown's trigger", focus: trigger },
  {
    name: "NavbarMenuItem in a NavbarMenuDropdown",
    focus: 'a[href="#nav-dropdown-item"]',
    reach: "menu",
    pixels: true,
  },
  { name: "Link", focus: "[data-test=link]" },
  { name: "Link, wrapping", focus: "[data-test=link-wrap]", pixels: true },
  { name: "SiteLink", focus: "[data-test=site-link]" },
  { name: "SiteLink asChild", focus: "[data-test=site-link-as-child]" },
  { name: "BreadcrumbLink", focus: "[data-test=crumb]", pixels: true },
  {
    name: "BreadcrumbLink, truncated",
    focus: "[data-test=crumb-long]",
    pixels: true,
  },
  {
    name: "Accordion, closed",
    focus: "[data-test=accordion-closed]",
    ring: accordionItem("accordion-closed"),
    outline: accordionItem("accordion-closed"),
    pixels: true,
  },
  {
    name: "Accordion, open",
    focus: "[data-test=accordion-open]",
    ring: accordionItem("accordion-open"),
    outline: accordionItem("accordion-open"),
    pixels: true,
  },
  { name: "TooltipTrigger", focus: "[data-test=tooltip]" },
  {
    // The child's own 2px ring, which TooltipTrigger doesn't override
    name: "TooltipTrigger asChild",
    focus: "[data-test=tooltip-as-child]",
    width: 2,
  },
  { name: "TabsContent", focus: "[data-test=tabs-panel]" },
  { name: "Radio, small", focus: "[data-test=radio-small]" },
  { name: "Radio, medium", focus: "[data-test=radio-medium]" },
  { name: "Radio, large", focus: "[data-test=radio-large]" },
  {
    name: "SearchBar",
    focus: "[data-test=search-bar] input",
    ring: "[data-test=search-bar]",
    click: true,
  },
  {
    name: "InputOTP",
    focus: "input[data-test=otp]",
    ring: otpSlot("otp"),
    outline: otpSlot("otp"),
    click: true,
  },
  {
    name: "InputOTP, invalid",
    focus: "input[data-test=otp-invalid]",
    ring: otpSlot("otp-invalid"),
    outline: otpSlot("otp-invalid"),
    colour: "fr-danger",
    click: true,
  },
  {
    name: "TableTooltip's trigger",
    focus: "[data-test=table] button[aria-label=Tooltip]",
  },
  {
    name: "DataTable's radio column",
    focus: `${radioWrapper(1)} > input`,
    ring: radioWrapper(1),
    pixels: true,
  },
  { name: "the toast card", focus: "[data-test=toast]" },
  { name: "the toast's close button", focus: "[data-test=toast-close]" },
  {
    name: "the toast viewport",
    focus: "[data-test=toast-viewport]",
    reach: "F8",
    inset: true,
    pixels: true,
  },
  ...[
    ["first row", 0, 1],
    ["first column", 1, 0],
    ["interior", 1, 1],
    ["last column", 1, 2],
    ["last row", 2, 1],
  ].flatMap(([where, row, column]) => [
    {
      name: `TableCell, ${where}`,
      focus: tableCell(row, column),
      reach: "script",
      inset: true,
      pixels: true,
    },
    {
      name: `TableCell in DataTable, ${where}`,
      // DataTable's first column is its radio column
      focus: dataTableCell(`r${row + 1}_${["_radio", "role", "unit"][column]}`),
      reach: "script",
      inset: true,
      pixels: true,
    },
  ]),
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
      define: { "process.env.NODE_ENV": '"production"' },
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

// Opens the page in a context of its own, in `theme`, and runs `use` on it
async function withPage(theme, use, { forcedColors = "none" } = {}) {
  const context = await browser.newContext({ viewport, forcedColors });
  try {
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setContent(html);
    await page.waitForSelector("[data-test=toast]");
    await page.evaluate(
      (dark) => document.documentElement.classList.toggle("dark", dark),
      theme === "dark",
    );
    await page.mouse.move(away.x, away.y);
    const result = await use(page);
    assert.deepEqual(errors, []);
    return result;
  } finally {
    await context.close();
  }
}

// Presses Tab until `selector` has focus
async function tabTo(page, selector) {
  for (let presses = 0; presses < 100; presses++) {
    if (
      await page.evaluate((s) => !!document.activeElement?.matches(s), selector)
    )
      return;
    await page.keyboard.press("Tab");
  }
  throw new Error(`Tab never reaches ${selector}`);
}

// Gives a control keyboard focus, as its `reach` says
async function focusByKeyboard(page, { focus, reach = "tab" }) {
  if (reach === "menu") {
    await tabTo(page, trigger);
    if ((await page.getAttribute(trigger, "aria-expanded")) !== "true")
      await page.keyboard.press("Enter");
    await tabTo(page, focus);
  } else if (reach === "F8") {
    await page.keyboard.press("F8");
  } else if (reach === "script") {
    await page.keyboard.press("Shift");
    await page.focus(focus);
  } else await tabTo(page, focus);
}

// Moves focus off the page's controls, and closes the NavbarMenuDropdown
async function reset(page) {
  if ((await page.getAttribute(trigger, "aria-expanded")) === "true") {
    await page.focus(trigger);
    await page.keyboard.press("Enter");
    await page.waitForSelector(`${trigger}[aria-expanded=false]`);
  }
  await page.evaluate(() => document.activeElement?.blur());
  await page.mouse.move(away.x, away.y);
}

// Puts a control at rest: nothing focused and the pointer away, with the
// NavbarMenuDropdown open for the items inside it, which exist only while
// it's open
async function rest(page, { reach } = {}) {
  await reset(page);
  if (reach === "menu") {
    await tabTo(page, trigger);
    await page.keyboard.press("Enter");
    await page.evaluate(() => document.activeElement?.blur());
  }
}

// Runs in the page: whether `focus` has focus, its outline style, and the
// ring layers in `ring`'s box-shadow: spread-only layers that aren't
// Tailwind's empty, transparent ones
function readFocus({ focus, ring }) {
  const layers = getComputedStyle(document.querySelector(ring))
    .boxShadow.split(/,(?![^(]*\))/)
    .map((layer) => layer.trim())
    .filter(
      (layer) =>
        /^rgba?\([^)]*\) 0px 0px 0px [\d.]+px( inset)?$/.test(layer) &&
        !layer.startsWith("rgba(0, 0, 0, 0)"),
    );
  const focused = document.querySelector(focus);
  const { outlineStyle, outlineWidth } = getComputedStyle(focused);
  return {
    focused: document.activeElement === focused,
    // An outline 0px wide draws nothing, like InputOTP's own on its input
    outline: parseFloat(outlineWidth) === 0 ? "none" : outlineStyle,
    ring: layers,
  };
}

// The ring a control shows on keyboard focus, in `theme`
function ringOf(control, theme) {
  const { colour = "fr-primary", width = 3, inset = false } = control;
  return `${colours[theme][colour]} 0px 0px 0px ${width}px${inset ? " inset" : ""}`;
}

const themes = ["light", "dark"];

test("each control shows its focus ring on keyboard focus, in both themes", async () => {
  const actual = {};
  const expected = {};
  for (const theme of themes)
    await withPage(theme, async (page) => {
      for (const control of controls) {
        const key = `${control.name} (${theme})`;
        await rest(page, control);
        await focusByKeyboard(page, control);
        actual[key] = await page.evaluate(readFocus, {
          focus: control.focus,
          ring: control.ring ?? control.focus,
        });
        expected[key] = {
          focused: true,
          outline: "none",
          ring: [ringOf(control, theme)],
        };
      }
    });
  assertEntries(actual, expected);
});

test("a mouse click shows no ring, except on SearchBar and InputOTP", async () => {
  const actual = {};
  const expected = {};
  for (const theme of themes)
    await withPage(theme, async (page) => {
      for (const control of controls) {
        const key = `${control.name} (${theme})`;
        await rest(page, control);
        // Press the button on the middle of the control, or of a wrapped
        // link's first line. Focus moves on the press, and releasing it
        // elsewhere follows no link and toggles nothing.
        const box = await page.$eval(control.focus, (element) => {
          const { x, y, width, height } = element.getClientRects()[0];
          return { x, y, width, height };
        });
        const at =
          control.reach === "F8"
            ? { x: box.x + 6, y: box.y + 6 } // the viewport's padding
            : { x: box.x + box.width / 2, y: box.y + box.height / 2 };
        await page.mouse.move(at.x, at.y);
        await page.mouse.down();
        actual[key] = await page.evaluate(readFocus, {
          focus: control.focus,
          ring: control.ring ?? control.focus,
        });
        await page.mouse.move(away.x, away.y);
        await page.mouse.up();
        expected[key] = {
          focused: true,
          outline: "none",
          ring: control.click ? [ringOf(control, theme)] : [],
        };
      }
    });
  assertEntries(actual, expected);
});

// Runs in the page: a point on each side of each box `selector` draws its
// ring around, mid-way along the side and clear of the corners. An outer
// ring's points are just outside the border box, 1 to 2px out. An inset
// ring's are just inside the padding box, 1 to 2px in, and on the left and
// right sides 4px down, clear of the ring's top edge and of text that starts
// at the left edge. A wrapped inline element has a box for each line.
function edgePoints({ selector, inset }) {
  const element = document.querySelector(selector);
  const style = getComputedStyle(element);
  const border = (side) => parseFloat(style[`border${side}Width`]);
  const boxes = inset
    ? [element.getBoundingClientRect()].map((r) => ({
        left: r.left + border("Left"),
        top: r.top + border("Top"),
        right: r.right - border("Right"),
        bottom: r.bottom - border("Bottom"),
      }))
    : [...element.getClientRects()];
  return boxes.map(({ left, top, right, bottom }) => {
    const x = Math.floor((left + right) / 2);
    const y = Math.floor((top + bottom) / 2);
    return inset
      ? {
          top: { x, y: Math.ceil(top) + 1 },
          bottom: { x, y: Math.floor(bottom) - 2 },
          left: { x: Math.ceil(left) + 1, y: Math.ceil(top) + 4 },
          right: { x: Math.floor(right) - 2, y: Math.ceil(top) + 4 },
        }
      : {
          top: { x, y: Math.floor(top) - 2 },
          bottom: { x, y: Math.ceil(bottom) + 1 },
          left: { x: Math.floor(left) - 2, y },
          right: { x: Math.ceil(right) + 1, y },
        };
  });
}

// The colour of each point on the page, as [r, g, b, a] from 0 to 255
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
        ...context.getImageData(x, y, 1, 1).data,
      ]);
    },
    {
      src: `data:image/png;base64,${png.toString("base64")}`,
      points: points.map(({ x, y }) => ({ x: x - clip.x, y: y - clip.y })),
    },
  );
}

// `colour`, an rgba() string, laid over the opaque pixel `under`
function over(colour, under) {
  const [r, g, b, a] = colour.match(/[\d.]+/g).map(Number);
  return [r, g, b].map((channel, i) =>
    Math.round(channel * a + under[i] * (1 - a)),
  );
}

test("each ring shows on all four sides, unclipped", async () => {
  const actual = {};
  const expected = {};
  for (const theme of themes)
    await withPage(theme, async (page) => {
      for (const control of controls.filter(({ pixels }) => pixels)) {
        const selector = control.ring ?? control.focus;
        await rest(page, control);
        const boxes = await page.evaluate(edgePoints, {
          selector,
          inset: control.inset,
        });
        const points = boxes.flatMap((sides) => Object.values(sides));
        const resting = await sample(page, points);
        await focusByKeyboard(page, control);
        const focused = await sample(page, points);
        const ring = ringOf(control, theme).split(" 0px")[0];
        boxes.forEach((sides, line) =>
          Object.keys(sides).forEach((side, i) => {
            const at = line * 4 + i;
            const key = `${control.name}${boxes.length > 1 ? `, line ${line + 1}` : ""}, ${side} (${theme})`;
            // Within 8 of the ring over the resting pixel, in each channel.
            // The ring changes the pixel by 25 or more. The radio wrapper's
            // `shadow-button`, which overlaps its ring, moves it by up to 6.
            const want = over(ring, resting[at]);
            const got = focused[at].slice(0, 3);
            actual[key] = got.every((c, j) => Math.abs(c - want[j]) <= 8)
              ? want
              : got;
            expected[key] = want;
          }),
        );
      }
    });
  assertEntries(actual, expected);
});

// Runs in the page: the outline `selector` draws, as "<style> <width>", or
// "none" when it draws none, and a point mid-way along each side of its band,
// which starts `outline-offset` out from the border box, on the first line
// of a wrapped link
function readOutline(selector) {
  const element = document.querySelector(selector);
  const { outlineStyle, outlineWidth, outlineOffset } =
    getComputedStyle(element);
  const width = parseFloat(outlineWidth);
  const { left, top, right, bottom } = element.getClientRects()[0];
  const out = parseFloat(outlineOffset) + width / 2;
  const x = Math.floor((left + right) / 2);
  const y = Math.floor((top + bottom) / 2);
  return {
    outline:
      outlineStyle === "none" || width === 0
        ? "none"
        : `${outlineStyle} ${outlineWidth}`,
    band: {
      top: { x, y: Math.floor(top - out) },
      bottom: { x, y: Math.floor(bottom + out) },
      left: { x: Math.floor(left - out), y },
      right: { x: Math.floor(right + out), y },
    },
  };
}

test("under forced colours, each control draws no outline at rest and a visible outline on keyboard focus", async () => {
  const actual = {};
  const expected = {};
  for (const theme of themes)
    await withPage(
      theme,
      async (page) => {
        for (const control of controls) {
          const selector = control.outline ?? control.focus;
          await rest(page, control);
          const atRest = await page.evaluate(readOutline, selector);
          await focusByKeyboard(page, control);
          const { outline, band } = await page.evaluate(readOutline, selector);
          // The band's pixels at rest, then focused: a side shows where the
          // outline changes them. The page can hide a side, as a table's
          // scroll wrapper does a cell's outer edge, but one must show.
          const points = Object.values(band);
          await rest(page, control);
          const before = await sample(page, points);
          await focusByKeyboard(page, control);
          const after = await sample(page, points);
          actual[`${control.name} (${theme})`] = {
            atRest: atRest.outline,
            focused: outline,
            visible: points.some((_, i) =>
              before[i].some((c, j) => Math.abs(c - after[i][j]) >= 40),
            ),
          };
          expected[`${control.name} (${theme})`] = {
            atRest: "none",
            focused: "solid 2px",
            visible: true,
          };
        }
      },
      { forcedColors: "active" },
    );
  assertEntries(actual, expected);
});

test("a focused link in an open Accordion item's content doesn't ring the item", async () => {
  const actual = {};
  const expected = {};
  for (const theme of themes)
    await withPage(theme, async (page) => {
      await tabTo(page, "[data-test=accordion-link]");
      actual[theme] = await page.evaluate(readFocus, {
        focus: "[data-test=accordion-link]",
        ring: accordionItem("accordion-open"),
      });
      expected[theme] = { focused: true, outline: "none", ring: [] };
    });
  assertEntries(actual, expected);
});

// A PNG of `selector`'s box and 6px around it, enough for a 3px ring
async function picture(page, selector) {
  const { x, y, width, height } = await page.locator(selector).boundingBox();
  return page.screenshot({
    clip: { x: x - 6, y: y - 6, width: width + 12, height: height + 12 },
  });
}

test("an open Accordion item looks different focused by keyboard and hovered", async () => {
  const item = accordionItem("accordion-open");
  const actual = {};
  for (const theme of themes)
    await withPage(theme, async (page) => {
      await page.hover("[data-test=accordion-open]");
      const hovered = await picture(page, item);
      await page.mouse.move(away.x, away.y);
      await tabTo(page, "[data-test=accordion-open]");
      actual[theme] = !hovered.equals(await picture(page, item));
    });
  assert.deepEqual(actual, { light: true, dark: true });
});

test("the toast card and its close button look different focused and unfocused", async () => {
  const actual = {};
  const expected = {};
  for (const theme of themes)
    await withPage(theme, async (page) => {
      for (const selector of ["[data-test=toast]", "[data-test=toast-close]"]) {
        await reset(page);
        const unfocused = await picture(page, selector);
        await tabTo(page, selector);
        actual[`${selector} (${theme})`] = !unfocused.equals(
          await picture(page, selector),
        );
        expected[`${selector} (${theme})`] = true;
      }
    });
  assertEntries(actual, expected);
});

test("a BreadcrumbLink longer than its item's maximum width truncates to one line", () =>
  withPage("light", async (page) => {
    // The item shows one line of the link, at the item's maximum width
    const look = await page.$eval("[data-test=crumb-long]", (link) => {
      const { width, height } = link.closest("li").getBoundingClientRect();
      const { lineHeight } = getComputedStyle(link);
      return { lines: Math.round(height / parseFloat(lineHeight)), width };
    });
    assert.deepEqual(look, { lines: 1, width: 200 });
  }));

test("a Navbar menu item's link fills the item, so its ring outlines the item's hover background", () =>
  withPage("light", async (page) => {
    const actual = {};
    const expected = {};
    for (const href of [
      "#nav-item",
      "#nav-item-as-child",
      "#nav-dropdown-item",
    ]) {
      await reset(page);
      if (href === "#nav-dropdown-item") {
        await tabTo(page, trigger);
        await page.keyboard.press("Enter");
      }
      const [link, item] = await page.$eval(`a[href="${href}"]`, (a) =>
        [a, a.closest("li")].map((element) => {
          const { x, y, width, height } = element.getBoundingClientRect();
          return {
            box: [x, y, width, height].map(Math.round),
            radius: getComputedStyle(element).borderRadius,
          };
        }),
      );
      actual[href] = link;
      expected[href] = item;
    }
    assertEntries(actual, expected);
  }));
