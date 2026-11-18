// TableTooltip's trigger in Chromium, at a phone's width (390px) and a
// desktop's (1280px), in the light and dark themes: in a plain Table header,
// and in DataTable headers with a tooltip alone, after a sort button, after
// a widen button, and after both. Its hit area covers a 24×24 box centred on
// its icon and stops where the button before it starts. The area moves
// nothing: the icon, the trigger's own box, the header row and the columns
// sit where main's put them, and the tooltip opens where main's did.
// Hovering the area outside the icon opens the tooltip, and the pointer
// shows the `help` cursor over all of it. A keyboard-focused trigger's
// `fr-primary` ring is still drawn around its own box, and paints nothing
// inside the button before it or its header's text. A pinned DataTable
// column scrolled over a trigger still covers all of its area.
//
// The page is table-tooltip.page.jsx, on the stylesheet the Tailwind import
// compiles for full.css's sources. esbuild bundles it twice: as it is, and
// with main's TableTooltip (table-tooltip.main.jsx) in place of the table
// entry's, so the two compare in the same browser with the same fonts.
import assert from "node:assert/strict";
import path from "node:path";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";
import { chromium } from "playwright";

import { registryDefine } from "../../react/registry-define.mjs";
import { compile, fullCssSources } from "./compile.mjs";
import { colours } from "./field-looks.mjs";

const pageSource = fileURLToPath(
  new URL("./table-tooltip.page.jsx", import.meta.url),
);
const mainSource = fileURLToPath(
  new URL("./table-tooltip.main.jsx", import.meta.url),
);
// The table entry, as its importers name it, without an extension
const tableEntry = fileURLToPath(
  new URL("../../react/src/components/table", import.meta.url),
);
// The page imports React and the components' dependencies from where the
// components resolve them, so the bundle has one copy of React
const reactModules = fileURLToPath(
  new URL("../../react/node_modules", import.meta.url),
);

const widths = [390, 1280];
const themes = ["light", "dark"];
const height = 1400;
// A part of the page, below the tables, where the pointer rests
const away = { x: 8, y: height - 8 };

// Each trigger, by its table's `data-test`: its name, and the name of the
// button before it in its header, if it has one
const triggers = {
  plain: { name: "Maklumat" },
  tooltip: { name: "Tooltip" },
  sort: { name: "Tooltip", neighbour: "Sort by Umur" },
  widen: { name: "Tooltip", neighbour: "Widen Umur" },
  all: { name: "Tooltip", neighbour: "Sort by Umur" },
};

// The side of the box, centred on the icon, that the hit area must cover,
// and how far inside its edges the points checked are
const hitBox = { size: 24, inset: 0.5 };

// Resolves the table entry to main's module, everywhere but in that module
const mainTable = {
  name: "main-table-tooltip",
  setup(build) {
    build.onResolve(
      { filter: /(^|\/)table$/ },
      ({ path: request, importer, resolveDir }) =>
        importer !== mainSource &&
        path.resolve(resolveDir, request) === tableEntry
          ? { path: mainSource }
          : undefined,
    );
  },
};

async function bundle(plugins) {
  const { outputFiles } = await build({
    entryPoints: [pageSource],
    bundle: true,
    write: false,
    format: "iife",
    jsx: "automatic",
    nodePaths: [reactModules],
    define: { ...registryDefine, "process.env.NODE_ENV": '"production"' },
    logLevel: "silent",
    plugins,
  });
  return outputFiles[0].text.replaceAll("</script", "<\\/script");
}

let browser;
// The page's HTML, as it is ("current") and with main's TableTooltip
const html = {};
before(async () => {
  const [current, main, css] = await Promise.all([
    bundle([]),
    bundle([mainTable]),
    compile(
      `${fullCssSources()}\n@source "${pageSource}";\n@source "${mainSource}";`,
    ),
  ]);
  // Transitions and animations off, so each state reads as it ends
  for (const [variant, script] of Object.entries({ current, main }))
    html[variant] =
      `<!doctype html><html><head><style>${css}</style><style>*,::before,::after{transition:none!important;animation:none!important}</style></head><body class="bg-bg-white"><div id="root"></div><script>${script}</script></body></html>`;
  browser = await chromium.launch();
});
after(() => browser?.close());

// Opens the page `width` px wide, in `theme`, as it is or with main's
// TableTooltip (`variant`), and runs `use` on it once React has rendered
// it, with the pointer away from the tables. Each trigger gets its table's
// `data-test` as `data-trigger`, the button before it as `data-neighbour`,
// and its header's text as `data-text`. Nothing logs an error.
async function withPage({ variant = "current", width, theme }, use) {
  const context = await browser.newContext({ viewport: { width, height } });
  try {
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (["error", "warning"].includes(message.type()))
        errors.push(message.text());
    });
    await page.setContent(html[variant]);
    await page.waitForFunction(() => window.ready.length === 1);
    if (theme === "dark")
      await page.evaluate(() => document.documentElement.classList.add("dark"));
    await page.evaluate((triggers) => {
      for (const [test, { name, neighbour }] of Object.entries(triggers)) {
        const head = document.querySelector(`[data-test=${test}] thead`);
        const trigger = head.querySelector(`button[aria-label="${name}"]`);
        trigger.dataset.trigger = test;
        trigger.closest("th").querySelector("span[id]").dataset.text = test;
        if (neighbour)
          head.querySelector(
            `button[aria-label="${neighbour}"]`,
          ).dataset.neighbour = test;
      }
    }, triggers);
    await page.mouse.move(away.x, away.y);
    const result = await use(page);
    assert.deepEqual(errors, []);
    return result;
  } finally {
    await context.close();
  }
}

// Runs `use` on a page at each width and in each theme, and returns its
// results keyed by "<width>px, <theme>"
async function eachView(options, use) {
  const results = {};
  for (const width of widths)
    for (const theme of themes)
      results[`${width}px, ${theme}`] = await withPage(
        { ...options, width, theme },
        use,
      );
  return results;
}

// Each number in `actual` more than 0.01px from its place in `expected`, or
// a place one has and the other doesn't, as "path: actual ≠ expected"
function drift(actual, expected, at = "") {
  if (typeof actual === "number" && typeof expected === "number")
    return Math.abs(actual - expected) <= 0.01
      ? []
      : [`${at}: ${actual} ≠ ${expected}`];
  if (
    actual &&
    expected &&
    typeof actual === "object" &&
    typeof expected === "object"
  )
    return [...new Set([...Object.keys(actual), ...Object.keys(expected)])]
      .sort()
      .flatMap((key) =>
        drift(actual[key], expected[key], at ? `${at}.${key}` : key),
      );
  return actual === expected
    ? []
    : [`${at}: ${JSON.stringify(actual)} ≠ ${JSON.stringify(expected)}`];
}

// Sorts and widens every Age column that can be, then takes focus and the
// pointer away
async function sortAndWiden(page) {
  for (const test of ["sort", "all"])
    await page
      .locator(`[data-test=${test}] thead button[aria-label="Sort by Umur"]`)
      .click();
  for (const test of ["widen", "all"])
    await page
      .locator(`[data-test=${test}] thead button[aria-label="Widen Umur"]`)
      .click();
  await page.evaluate(() => document.activeElement.blur());
  await page.mouse.move(away.x, away.y);
}

// Runs in the page: for each trigger, its icon's and its own box, its
// header row's height, its table's column widths and the table's width
function readLayout() {
  const box = (element) => {
    const { x, y, width, height } = element.getBoundingClientRect();
    return { x, y, width, height };
  };
  return Object.fromEntries(
    [...document.querySelectorAll("[data-trigger]")].map((trigger) => {
      const table = trigger.closest("table");
      return [
        trigger.dataset.trigger,
        {
          icon: box(trigger.querySelector("svg")),
          trigger: box(trigger),
          headerRow: box(table.querySelector("thead tr")).height,
          columns: [...table.querySelectorAll("thead th")].map(
            (th) => box(th).width,
          ),
          table: box(table).width,
        },
      ];
    }),
  );
}

test("the icon, the trigger's own box, the header row and the columns sit where main's do, at rest and once sorted and widened", async () => {
  const measure = (variant) =>
    eachView({ variant }, async (page) => {
      const rest = await page.evaluate(readLayout);
      await sortAndWiden(page);
      return { rest, "sorted and widened": await page.evaluate(readLayout) };
    });
  const [current, main] = [await measure("current"), await measure("main")];
  assert.deepEqual(drift(current, main), []);
});

// Runs in the page: each point checked, as a description, that hit-testing
// doesn't send where it should. The points sit `inset` px inside each edge
// and corner of a box `size` px square centred on each trigger's icon, and
// at its centre, and each belongs to the trigger. One more sits 1px inside
// the right edge of the button before the trigger, level with the icon's
// centre, and belongs to that button.
function readMisses({ size, inset }) {
  const describe = (element) => {
    const target = element?.closest("button") ?? element;
    if (!target) return "nothing";
    const name = target.getAttribute("aria-label");
    return `${target.tagName.toLowerCase()}${name ? ` "${name}"` : ""}`;
  };
  const misses = [];
  for (const trigger of document.querySelectorAll("[data-trigger]")) {
    const test = trigger.dataset.trigger;
    const icon = trigger.querySelector("svg").getBoundingClientRect();
    const x = icon.x + icon.width / 2;
    const y = icon.y + icon.height / 2;
    const reach = size / 2 - inset;
    for (const dx of [-reach, 0, reach])
      for (const dy of [-reach, 0, reach]) {
        const hit = document.elementFromPoint(x + dx, y + dy);
        if (hit?.closest("button") !== trigger)
          misses.push(`${test} at (${dx}, ${dy}): ${describe(hit)}`);
      }
    const neighbour = document.querySelector(`[data-neighbour=${test}]`);
    if (neighbour) {
      const hit = document.elementFromPoint(
        neighbour.getBoundingClientRect().right - 1,
        y,
      );
      if (hit?.closest("button") !== neighbour)
        misses.push(`${test}'s neighbour: ${describe(hit)}`);
    }
  }
  return misses;
}

test("each trigger's hit area covers a 24×24 box centred on its icon and stops at the button before it, at rest and once sorted and widened", async () => {
  const misses = await eachView({}, async (page) => {
    const rest = await page.evaluate(readMisses, hitBox);
    await sortAndWiden(page);
    return {
      rest,
      "sorted and widened": await page.evaluate(readMisses, hitBox),
    };
  });
  assert.deepEqual(
    misses,
    Object.fromEntries(
      Object.keys(misses).map((view) => [
        view,
        { rest: [], "sorted and widened": [] },
      ]),
    ),
  );
});

// The open tooltip's box, relative to the icon of the trigger `test`, and
// its text, or "closed" if it doesn't open. Then closes it.
async function readTooltip(page, test) {
  const wrapper = "[data-radix-popper-content-wrapper]";
  const opened = await page
    .waitForSelector(wrapper, { state: "visible", timeout: 2000 })
    .then(
      () => true,
      () => false,
    );
  const tooltip = opened
    ? await page.evaluate(
        ({ wrapper, test }) => {
          const icon = document
            .querySelector(`[data-trigger=${test}] svg`)
            .getBoundingClientRect();
          const content = document
            .querySelector(wrapper)
            .firstElementChild.getBoundingClientRect();
          return {
            x: content.x - icon.x,
            y: content.y - icon.y,
            width: content.width,
            height: content.height,
            text: document.querySelector('[role="tooltip"]').textContent,
          };
        },
        { wrapper, test },
      )
    : "closed";
  await page.mouse.move(away.x, away.y);
  await page.keyboard.press("Escape");
  await page.waitForSelector(wrapper, { state: "detached" });
  return tooltip;
}

// The centre of the icon of the trigger `test`
async function iconCentre(page, test) {
  const { x, y, width, height } = await page
    .locator(`[data-trigger=${test}] svg`)
    .boundingBox();
  return { x: x + width / 2, y: y + height / 2 };
}

test("hovering the hit area beside the icon opens the tooltip where main's opened from the icon", async () => {
  const reach = hitBox.size / 2 - hitBox.inset;
  // Each trigger's tooltip, opened from a point `offset` px left of its icon's
  // centre
  const open = (variant, offset) =>
    eachView({ variant }, async (page) => {
      const tooltips = {};
      for (const test of Object.keys(triggers)) {
        const { x, y } = await iconCentre(page, test);
        await page.mouse.move(x - offset, y);
        tooltips[test] = await readTooltip(page, test);
      }
      return tooltips;
    });
  // Outside the icon, whose half is 8px wide, and inside the hit area
  const current = await open("current", reach);
  const main = await open("main", 0);
  assert.deepEqual(drift(current, main), []);
});

// Runs in the page: whether the focused element is a trigger, whether it
// shows its focus as `:focus-visible`, and the ring layers in its
// box-shadow: spread-only layers that aren't Tailwind's empty, transparent
// ones
function readFocus() {
  const element = document.activeElement;
  const ring = getComputedStyle(element)
    .boxShadow.split(/,(?![^(]*\))/)
    .map((layer) => layer.trim())
    .filter(
      (layer) =>
        /^rgba?\([^)]*\) 0px 0px 0px [\d.]+px( inset)?$/.test(layer) &&
        !layer.startsWith("rgba(0, 0, 0, 0)"),
    );
  return {
    trigger: element.dataset.trigger,
    visible: element.matches(":focus-visible"),
    ring,
  };
}

// Screenshots of the boxes of the elements that match `selectors`, each
// grown to whole pixels
async function shots(page, selectors) {
  const images = [];
  for (const selector of selectors) {
    const { x, y, width, height } = await page.locator(selector).boundingBox();
    const left = Math.floor(x);
    const top = Math.floor(y);
    images.push(
      await page.screenshot({
        clip: {
          x: left,
          y: top,
          width: Math.ceil(x + width) - left,
          height: Math.ceil(y + height) - top,
        },
      }),
    );
  }
  return images;
}

test("a keyboard-focused trigger's fr-primary ring paints nothing inside the button before it or its header's text", async () => {
  const actual = {};
  const expected = {};
  for (const width of widths)
    for (const theme of themes)
      await withPage({ width, theme }, async (page) => {
        // Focus opens the tooltip, above the trigger. Hidden, it can't
        // paint into the boxes compared.
        await page.addStyleTag({
          content:
            "[data-radix-popper-content-wrapper]{visibility:hidden!important}",
        });
        for (const [test, { neighbour }] of Object.entries(triggers)) {
          const boxes = [
            ...(neighbour ? [`[data-neighbour=${test}]`] : []),
            `[data-text=${test}]`,
          ];
          const unfocused = await shots(page, boxes);
          await page.focus("[data-test=before]");
          for (let presses = 0; presses < 40; presses++) {
            await page.keyboard.press("Tab");
            if ((await page.evaluate(readFocus)).trigger === test) break;
          }
          const focus = await page.evaluate(readFocus);
          const focused = await shots(page, boxes);
          const key = `${test}, ${width}px, ${theme}`;
          actual[key] = {
            focus,
            unchanged: focused.map((image, index) =>
              image.equals(unfocused[index]),
            ),
          };
          expected[key] = {
            focus: {
              trigger: test,
              visible: true,
              ring: [`${colours[theme]["fr-primary"]} 0px 0px 0px 3px`],
            },
            unchanged: boxes.map(() => true),
          };
          await page.evaluate(() => document.activeElement.blur());
        }
      });
  assert.deepEqual(actual, expected);
});

// Runs in the page: the cursor over each trigger and over its hit area, its
// `::after`, and whether that area renders
function readCursors() {
  return Object.fromEntries(
    [...document.querySelectorAll("[data-trigger]")].map((trigger) => {
      const area = getComputedStyle(trigger, "::after");
      return [
        trigger.dataset.trigger,
        {
          trigger: getComputedStyle(trigger).cursor,
          area: area.cursor,
          rendered: area.content !== "none",
        },
      ];
    }),
  );
}

test("the pointer shows the help cursor over each trigger's whole hit area", async () => {
  const cursors = await eachView({}, (page) => page.evaluate(readCursors));
  const help = Object.fromEntries(
    Object.keys(triggers).map((test) => [
      test,
      { trigger: "help", area: "help", rendered: true },
    ]),
  );
  assert.deepEqual(
    cursors,
    Object.fromEntries(Object.keys(cursors).map((view) => [view, help])),
  );
});

// Runs in the page: scrolls the pinned DataTable until its Age column's
// trigger sits under the middle of its pinned Name column, then hit-tests
// the points `readMisses` checks around the icon. Each belongs to the
// pinned column's header.
function readPinned({ size, inset }) {
  const root = document.querySelector("[data-test=pinned]");
  const scroller = root.querySelector("table").parentElement;
  const pinned = root.querySelector('thead th[data-pinned="left"]');
  const trigger = root.querySelector('thead button[aria-label="Tooltip"]');
  const centre = (box) => ({
    x: box.x + box.width / 2,
    y: box.y + box.height / 2,
  });
  const start = centre(trigger.querySelector("svg").getBoundingClientRect());
  scroller.scrollLeft = start.x - centre(pinned.getBoundingClientRect()).x;
  const { x, y } = centre(trigger.querySelector("svg").getBoundingClientRect());
  const reach = size / 2 - inset;
  const hits = [];
  for (const dx of [-reach, 0, reach])
    for (const dy of [-reach, 0, reach]) {
      const hit = document.elementFromPoint(x + dx, y + dy);
      hits.push(
        hit?.closest("th") === pinned
          ? "pinned header"
          : `${hit?.tagName.toLowerCase() ?? "nothing"}${hit?.closest("button") === trigger ? " in the trigger" : ""}`,
      );
    }
  const box = pinned.getBoundingClientRect();
  return {
    scrolled: scroller.scrollLeft > 0,
    under: x - reach > box.left && x + reach < box.right,
    hits,
  };
}

test("a pinned DataTable column scrolled over a trigger covers its whole hit area", async () => {
  const pinned = await eachView({}, (page) =>
    page.evaluate(readPinned, hitBox),
  );
  assert.deepEqual(
    pinned,
    Object.fromEntries(
      Object.keys(pinned).map((view) => [
        view,
        {
          scrolled: true,
          under: true,
          hits: Array(9).fill("pinned header"),
        },
      ]),
    ),
  );
});
