// Under forced colours (Windows High Contrast), box-shadows don't render, so
// an outline is the only focus indicator, and an outline the page sets is
// painted in a system colour even when it's transparent. Tailwind's
// `outline-hidden` sets one under forced colours, so an element that has it
// without a focus variant draws an outline at rest too (#159). This checks
// the whole page: with nothing focused, and then with a control inside each
// container focused by keyboard, no element, `::before` or `::after` draws
// an outline, except the focused control, which draws a solid 2px one. No
// control on the page draws its outline on another element, as the Switch
// does on its track. The page has an Input with addons, the Masthead, a
// DataTable with pinned columns, the Navbar's open mobile menu, an open
// PopoverContent, a `multiple` Select's open list, whose disabled option and
// inert Checkboxes never take focus, and the CookieBanner. In normal colours
// no element draws an outline in any of these states, the focused control
// included: its focus ring is a box-shadow, and no browser `auto` outline
// shows.
//
// The page is forced-colours.page.jsx: the React components themselves,
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

const pageSource = fileURLToPath(
  new URL("./forced-colours.page.jsx", import.meta.url),
);
// The page imports React and the components' dependencies from where the
// components resolve them, so the bundle has one copy of React
const reactModules = fileURLToPath(
  new URL("../../react/node_modules", import.meta.url),
);

// Under 1280px wide, where the Navbar shows NavbarAction and its mobile menu
// in place of its desktop menu
const viewport = { width: 1024, height: 900 };

// The Navbar's mobile menu: the list in a Radix popper, which Radix renders
// in a portal
const mobileMenu = "[data-radix-popper-content-wrapper] ul";

// Each container on the page, and what's in the page while it's open
const containers = {
  CookieBanner: "[data-test=cookie-banner][data-state=open]",
  Masthead: "[data-test=masthead-trigger][data-state=open]",
  "mobile menu": mobileMenu,
  PopoverContent: "[data-test=popover][data-state=open]",
  "Select's list": "[data-test=select-list][data-state=open]",
};

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

// Compares only the entries that differ, so a failure lists just those
function assertEntries(actual, expected) {
  const differ = Object.keys({ ...actual, ...expected }).filter(
    (key) => !isDeepStrictEqual(actual[key], expected[key]),
  );
  const pick = (entries) =>
    Object.fromEntries(differ.map((key) => [key, entries[key]]));
  assert.deepEqual(pick(actual), pick(expected));
}

// Opens the page in a context of its own, in `theme`, with Playwright's
// `forcedColors` set to `forcedColors`, and runs `use` on it once the
// CookieBanner is open
async function withPage(theme, forcedColors, use) {
  const context = await browser.newContext({ viewport, forcedColors });
  try {
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setContent(html);
    await page.waitForSelector(containers.CookieBanner);
    await page.evaluate(
      (dark) => document.documentElement.classList.toggle("dark", dark),
      theme === "dark",
    );
    const result = await use(page);
    assert.deepEqual(errors, []);
    return result;
  } finally {
    await context.close();
  }
}

// Presses `key` until `selector` has focus
async function pressTo(page, key, selector) {
  for (let presses = 0; presses < 50; presses++) {
    if (
      await page.evaluate((s) => !!document.activeElement?.matches(s), selector)
    )
      return;
    await page.keyboard.press(key);
  }
  throw new Error(`${key} never reaches ${selector}`);
}

// Opens a container: focuses its trigger, presses Enter, and waits for
// `shown`. Tab can't always reach the trigger, as an open PopoverContent or
// mobile menu keeps Tab inside it.
async function openContainer(page, trigger, shown) {
  await page.focus(trigger);
  await page.keyboard.press("Enter");
  await page.waitForSelector(shown);
}

const openMasthead = (page) =>
  openContainer(page, "[data-test=masthead-trigger]", containers.Masthead);
const openMenu = (page) =>
  openContainer(page, "[data-test=menu-toggle]", containers["mobile menu"]);
// Radix moves focus to the Button in the PopoverContent, and to the Select's
// first option
const openPopover = (page) =>
  openContainer(
    page,
    "[data-test=popover-trigger]",
    "[data-test=popover-button]:focus",
  );
const openSelect = (page) =>
  openContainer(
    page,
    "[data-test=select-trigger]",
    "[data-test=option-apple]:focus",
  );
const blur = (page) => page.evaluate(() => document.activeElement?.blur());

/**
 * Each state the page is checked in:
 * - `reach`: what opens its containers and focuses its control, from the
 *   page as it loads
 * - `open`: the containers open in it
 * - `focused`: how `readOutlines` describes the control that ends with
 *   focus, or "nothing"
 */
const scenarios = [
  {
    // The PopoverContent stays open as focus leaves it for the menu's
    // toggle. The menu would close as focus left it.
    name: "Nothing focused, with the Masthead, the Navbar's mobile menu and the PopoverContent open",
    async reach(page) {
      await openMasthead(page);
      await openPopover(page);
      await openMenu(page);
      await blur(page);
    },
    open: ["CookieBanner", "Masthead", "mobile menu", "PopoverContent"],
    focused: "nothing",
  },
  {
    // The Select's list is modal: the mobile menu would close as it opened
    name: "Nothing focused, with the Masthead, the PopoverContent and the Select's list open",
    async reach(page) {
      await openMasthead(page);
      await openPopover(page);
      await openSelect(page);
      await blur(page);
    },
    open: ["CookieBanner", "Masthead", "PopoverContent", "Select's list"],
    focused: "nothing",
  },
  {
    name: "The Input's field focused",
    reach: (page) => pressTo(page, "Tab", "[data-test=input]"),
    open: ["CookieBanner"],
    focused: 'input[data-test="input"]',
  },
  {
    name: "The Masthead's trigger focused, with the Masthead open",
    async reach(page) {
      await pressTo(page, "Tab", "[data-test=masthead-trigger]");
      await page.keyboard.press("Enter");
      await page.waitForSelector(containers.Masthead);
    },
    open: ["CookieBanner", "Masthead"],
    focused: 'button[data-test="masthead-trigger"]',
  },
  {
    name: "A row's selection Checkbox focused, in the DataTable's pinned columns",
    reach: (page) =>
      pressTo(
        page,
        "Tab",
        '[data-test=data-table] [aria-label="Select row 2"]',
      ),
    open: ["CookieBanner"],
    focused: 'button[aria-label="Select row 2"]',
  },
  {
    // Radix focuses the menu's container as it opens, as it holds only
    // links, and Tab moves on to them
    name: "An item focused in the Navbar's open mobile menu",
    async reach(page) {
      await openMenu(page);
      await pressTo(page, "Tab", `${mobileMenu} a[href="#services"]`);
    },
    open: ["CookieBanner", "mobile menu"],
    focused: 'a[href="#services"]',
  },
  {
    name: "A Button focused in the open PopoverContent",
    reach: openPopover,
    open: ["CookieBanner", "PopoverContent"],
    focused: 'button[data-test="popover-button"]',
  },
  {
    // From the first option, ArrowDown skips the disabled second one
    name: "An option focused in the `multiple` Select's open list, past its disabled option",
    async reach(page) {
      await openSelect(page);
      await pressTo(page, "ArrowDown", "[data-test=option-cherry]");
    },
    open: ["CookieBanner", "Select's list"],
    focused: 'div[data-test="option-cherry"]',
  },
  {
    name: "The CookieBanner's close cross focused",
    reach: (page) =>
      pressTo(
        page,
        "Tab",
        '[data-test=cookie-banner] button[aria-label="Close"]',
      ),
    open: ["CookieBanner"],
    focused: 'button[aria-label="Close"]',
  },
  {
    name: "A Button focused in the CookieBanner",
    reach: (page) => pressTo(page, "Tab", "[data-test=accept]"),
    open: ["CookieBanner"],
    focused: 'button[data-test="accept"]',
  },
];

// Runs in the page: the containers open, what has focus, and each element,
// `::before` and `::after` that draws an outline, as "<what>: <style>
// <width>". One draws an outline when its computed outline-style isn't
// `none` and its outline-width isn't 0. An element is described by its
// `data-test`, `aria-label` or `href`, else by its first classes and the
// nearest `data-test` around it.
function readOutlines(containers) {
  const describe = (element) => {
    const tag = element.tagName.toLowerCase();
    const name = ["data-test", "aria-label", "href"].find((attribute) =>
      element.hasAttribute(attribute),
    );
    if (name) return `${tag}[${name}="${element.getAttribute(name)}"]`;
    const classes = [...element.classList].slice(0, 3);
    const within = element.parentElement?.closest("[data-test]");
    return [
      tag,
      ...classes.map((name) => `.${name}`),
      within ? ` in [data-test="${within.dataset.test}"]` : "",
    ].join("");
  };
  const drawing = [];
  for (const element of document.querySelectorAll("*"))
    for (const pseudo of ["", "::before", "::after"]) {
      const { outlineStyle, outlineWidth } = getComputedStyle(
        element,
        pseudo || null,
      );
      if (outlineStyle !== "none" && parseFloat(outlineWidth) !== 0)
        drawing.push(
          `${describe(element)}${pseudo}: ${outlineStyle} ${outlineWidth}`,
        );
    }
  const active = document.activeElement;
  return {
    open: Object.keys(containers).filter((name) =>
      document.querySelector(containers[name]),
    ),
    focused: !active || active === document.body ? "nothing" : describe(active),
    drawing,
  };
}

const themes = ["light", "dark"];

test("under forced colours, no element, ::before or ::after on the page draws an outline, except the focused control, which draws a solid 2px one, in both themes", async () => {
  const actual = {};
  const expected = {};
  for (const theme of themes)
    for (const { name, reach, open, focused } of scenarios)
      await withPage(theme, "active", async (page) => {
        await reach(page);
        actual[`${name} (${theme})`] = await page.evaluate(
          readOutlines,
          containers,
        );
        expected[`${name} (${theme})`] = {
          open,
          focused,
          drawing: focused === "nothing" ? [] : [`${focused}: solid 2px`],
        };
      });
  assertEntries(actual, expected);
});

test("in normal colours, no element, ::before or ::after on the page draws an outline, the focused control included, in both themes", async () => {
  const actual = {};
  const expected = {};
  for (const theme of themes)
    for (const { name, reach, open, focused } of scenarios)
      await withPage(theme, "none", async (page) => {
        await reach(page);
        actual[`${name} (${theme})`] = await page.evaluate(
          readOutlines,
          containers,
        );
        expected[`${name} (${theme})`] = { open, focused, drawing: [] };
      });
  assertEntries(actual, expected);
});
