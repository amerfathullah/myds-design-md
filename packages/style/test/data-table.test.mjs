// DataTable's sort and widen buttons in Chromium, at a phone's width (390px)
// and a desktop's (1280px). Each button shows at rest, whether or not its
// column is sorted or widened, and looks as it did on main when its header
// was hovered. Tab stops on each one in DOM order, and each shows the
// `fr-primary` focus ring. Focus stays on a button after every activation,
// including the one that clears a sort or collapses a column, and after the
// pointer leaves its header. On a touch-only screen, where `(hover: hover)`
// doesn't match, a tap sorts or widens. In Chromium's accessibility tree,
// each column header is named by its text alone, not by the buttons and
// tooltip trigger inside it, and the ids those names use don't repeat across
// two tables on one page.
//
// The page is data-table.page.jsx: the React components themselves, bundled
// with esbuild, on the stylesheet the Tailwind import compiles for full.css's
// sources.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";
import { chromium } from "playwright";

import { registryDefine } from "../../react/registry-define.mjs";
import { compile, fullCssSources } from "./compile.mjs";
import { colours, shadowButton } from "./field-looks.mjs";

const pageSource = fileURLToPath(
  new URL("./data-table.page.jsx", import.meta.url),
);
// The page imports React and the components' dependencies from where the
// components resolve them, so the bundle has one copy of React
const reactModules = fileURLToPath(
  new URL("../../react/node_modules", import.meta.url),
);

const widths = [390, 1280];
const height = 900;
// A part of the page, below the tables, where the pointer rests
const away = { x: 8, y: height - 8 };

const tables = ["first", "second"];
// Each table's sort and widen buttons, by name, in DOM order
const tableButtons = [
  "Widen Name",
  "Sort by Name",
  "Sort by Age",
  "Widen Position",
  "Sort by Position",
];
// Both tables' buttons, as "table: name", in DOM order. A button's index here
// is its `data-probe`.
const allButtons = tables.flatMap((table) =>
  tableButtons.map((name) => `${table}: ${name}`),
);

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

// The button named `name` in the table `table` ("first" or "second"), shown
// or not
const button = (page, table, name) =>
  page
    .locator(`[data-test=${table}]`)
    .getByRole("button", { name, exact: true, includeHidden: true });

// Opens the page `width` px wide, in `theme`, and runs `use` on it once React
// has rendered it, with the pointer away from the tables. Each sort and widen
// button, found by its name, gets its index in `allButtons` as `data-probe`.
// Nothing logs an error, and no form is submitted.
async function withPage(width, use, { hasTouch = false, theme } = {}) {
  const context = await browser.newContext({
    viewport: { width, height },
    hasTouch,
  });
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
    for (const [index, entry] of allButtons.entries()) {
      const [table, name] = entry.split(": ");
      await button(page, table, name).evaluate(
        (element, index) => {
          element.dataset.probe = index;
        },
        index,
        { timeout: 2000 },
      );
    }
    if (!hasTouch) await page.mouse.move(away.x, away.y);
    const result = await use(page);
    assert.deepEqual(errors, []);
    assert.deepEqual(await page.evaluate(() => window.submits), []);
    return result;
  } finally {
    await context.close();
  }
}

// The `data-probe` of the button `name` in the table `table`
const probeOf = (table, name) =>
  String(allButtons.indexOf(`${table}: ${name}`));

// The probe of the focused element, or its `data-test`
const focused = (page) =>
  page.evaluate(
    () =>
      document.activeElement?.dataset.probe ??
      document.activeElement?.dataset.test,
  );

// Presses Tab until the probed button `probe` has focus
async function tabTo(page, probe) {
  for (let presses = 0; presses < 60; presses++) {
    if ((await focused(page)) === probe) return;
    await page.keyboard.press("Tab");
  }
  throw new Error(`Tab never reaches button ${allButtons[probe]}`);
}

// The text of each body row's name cell, top to bottom, in the table `table`
const names = (page, table) =>
  page.$$eval(`[data-test=${table}] tbody tr`, (rows) =>
    rows.map((row) => row.querySelector("td:not(:has(button))").textContent),
  );

// The order the first table's rows start in, and after its Name column sorts
// ascending and then descending
const [chong, aminah, badrul] = [
  "Chong Wei Ming bin Abdullah Hakim Al-Haj",
  "Aminah binti Abdullah Rahman Hakim Al-Haj",
  "Badrul",
];

test("every sort and widen button shows at rest, in DOM order, at 390px and 1280px", async () => {
  const actual = {};
  const expected = {};
  for (const width of widths)
    await withPage(width, async (page) => {
      actual[`${width}px`] = await page.$$eval("[data-probe]", (buttons) =>
        buttons.map((button) => {
          const { width, height } = button.getBoundingClientRect();
          return {
            probe: button.dataset.probe,
            checkVisibility: button.checkVisibility(),
            visibility: getComputedStyle(button).visibility,
            sized: width > 0 && height > 0,
          };
        }),
      );
      expected[`${width}px`] = allButtons.map((_, index) => ({
        probe: String(index),
        checkVisibility: true,
        visibility: "visible",
        sized: true,
      }));
    });
  assert.deepEqual(actual, expected);
});

// Runs in the page: the focused element's probe, or its `data-test`, and the
// ring layers in its box-shadow: spread-only layers that aren't Tailwind's
// empty, transparent ones
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
  return { focus: element.dataset.probe ?? element.dataset.test, ring };
}

test("Tab stops on every sort and widen button in DOM order, and each shows the fr-primary ring, at 390px and 1280px", async () => {
  const actual = {};
  const expected = {};
  for (const width of widths)
    await withPage(width, async (page) => {
      await page.focus("[data-test=before]");
      const stops = [];
      for (let presses = 0; presses < 60; presses++) {
        await page.keyboard.press("Tab");
        const stop = await page.evaluate(readFocus);
        if (stop.focus === "after") break;
        // Only the sort and widen buttons; the other stops are the tooltip
        // triggers, the selection checkboxes and the button between the
        // tables
        if (/^\d+$/.test(stop.focus ?? "")) stops.push(stop);
      }
      actual[`${width}px`] = stops;
      expected[`${width}px`] = allButtons.map((_, index) => ({
        focus: String(index),
        ring: [`${colours.light["fr-primary"]} 0px 0px 0px 3px`],
      }));
    });
  assert.deepEqual(actual, expected);
});

test("focus stays on a sort button pressed three times, through the press that clears the sort", async () => {
  const actual = {};
  const expected = {};
  for (const width of widths)
    await withPage(width, async (page) => {
      const probe = probeOf("first", "Sort by Name");
      await tabTo(page, probe);
      const steps = [];
      for (let press = 0; press < 3; press++) {
        await page.keyboard.press("Enter");
        steps.push({
          focus: await focused(page),
          names: await names(page, "first"),
        });
      }
      actual[`${width}px`] = steps;
      expected[`${width}px`] = [
        { focus: probe, names: [aminah, badrul, chong] },
        { focus: probe, names: [chong, badrul, aminah] },
        { focus: probe, names: [chong, aminah, badrul] },
      ];
    });
  assert.deepEqual(actual, expected);
});

test("focus stays on a widen button pressed twice, through the press that collapses its column", async () => {
  const actual = {};
  const expected = {};
  for (const width of widths)
    await withPage(width, async (page) => {
      const probe = probeOf("first", "Widen Name");
      await tabTo(page, probe);
      const steps = [];
      for (let press = 0; press < 2; press++) {
        await page.keyboard.press("Enter");
        steps.push({
          focus: await focused(page),
          pressed: await button(page, "first", "Widen Name").getAttribute(
            "aria-pressed",
          ),
        });
      }
      actual[`${width}px`] = steps;
      expected[`${width}px`] = [
        { focus: probe, pressed: "true" },
        { focus: probe, pressed: "false" },
      ];
    });
  assert.deepEqual(actual, expected);
});

// Moves the pointer over the header of the column headed `name` in the table
// `table`, clear of its buttons
async function hoverHeader(page, table, name) {
  const box = await page
    .locator(`[data-test=${table}] thead th`)
    .filter({ hasText: name })
    .boundingBox();
  await page.mouse.move(box.x + 12, box.y + box.height / 2);
}

test("focus stays on a sort or widen button after the pointer leaves its header", async () => {
  const actual = {};
  const expected = {};
  for (const width of widths)
    await withPage(width, async (page) => {
      for (const [name, header] of [
        ["Sort by Name", "Name"],
        ["Widen Position", "Position"],
      ]) {
        const probe = probeOf("first", name);
        await page.focus("[data-test=before]");
        await tabTo(page, probe);
        await hoverHeader(page, "first", header);
        const hovered = await focused(page);
        await page.mouse.move(away.x, away.y);
        actual[`${name}, ${width}px`] = [hovered, await focused(page)];
        expected[`${name}, ${width}px`] = [probe, probe];
      }
    });
  assert.deepEqual(actual, expected);
});

// Runs in the page: the maximum width of each body cell in the column headed
// `name` in the first table. Its cells stop at 230px until it widens.
function maxWidths(name) {
  const table = document.querySelector("[data-test=first] table");
  const headers = [...table.querySelectorAll("thead th")];
  const index = headers.findIndex((header) => header.textContent === name);
  return [...table.querySelectorAll(`tbody tr td:nth-child(${index + 1})`)].map(
    (cell) => getComputedStyle(cell).maxWidth,
  );
}

test("on a touch-only screen, a tap on a sort button sorts and one on a widen button widens, at 390px and 1280px", async () => {
  const actual = {};
  const expected = {};
  for (const width of widths)
    await withPage(
      width,
      async (page) => {
        const hover = await page.evaluate(
          () => matchMedia("(hover: hover)").matches,
        );
        await button(page, "first", "Sort by Name").tap();
        const sorted = await names(page, "first");
        const limited = await page.evaluate(maxWidths, "Name");
        await button(page, "first", "Widen Name").tap();
        actual[`${width}px`] = {
          hover,
          sorted,
          limited,
          pressed: await button(page, "first", "Widen Name").getAttribute(
            "aria-pressed",
          ),
          widened: await page.evaluate(maxWidths, "Name"),
        };
        expected[`${width}px`] = {
          hover: false,
          sorted: [aminah, badrul, chong],
          limited: ["230px", "230px", "230px"],
          pressed: "true",
          widened: ["none", "none", "none"],
        };
      },
      { hasTouch: true },
    );
  assert.deepEqual(actual, expected);
});

// The names of the column headers in the table `table`, in Chromium's
// accessibility tree
async function headerNames(page, table) {
  const client = await page.context().newCDPSession(page);
  try {
    const {
      result: { objectId },
    } = await client.send("Runtime.evaluate", {
      expression: `document.querySelector("[data-test=${table}] table")`,
    });
    const { nodes } = await client.send("Accessibility.queryAXTree", {
      objectId,
      role: "columnheader",
    });
    return nodes
      .filter((node) => !node.ignored)
      .map((node) => node.name?.value);
  } finally {
    await client.detach();
  }
}

test("each column header is named by its text alone, at rest, hovered, sorted and widened", async () => {
  await withPage(1280, async (page) => {
    const actual = {};
    const read = async (state) => {
      actual[state] = {
        first: await headerNames(page, "first"),
        second: await headerNames(page, "second"),
      };
    };
    await read("at rest");
    for (const name of ["Name", "Age", "Position"]) {
      await hoverHeader(page, "first", name);
      await read(`${name} hovered`);
    }
    await page.mouse.move(away.x, away.y);
    await button(page, "first", "Sort by Name").click();
    await button(page, "second", "Sort by Age").click();
    await read("sorted");
    await button(page, "first", "Widen Name").click();
    await button(page, "second", "Widen Position").click();
    await read("widened");
    const headers = {
      first: ["Select", "Name", "Age", "Position"],
      second: ["Name", "Age", "Position"],
    };
    assert.deepEqual(
      actual,
      Object.fromEntries(Object.keys(actual).map((state) => [state, headers])),
    );
  });
});

test("a column header that renders no text isn't named by the buttons and tooltip trigger inside it", async () => {
  await withPage(1280, async (page) => {
    const buttons = await page
      .locator("[data-test=blank] thead button")
      .evaluateAll((elements) =>
        elements.map((element) => element.getAttribute("aria-label")),
      );
    // Its name is blank: no text, and none of its controls' names
    const names = (await headerNames(page, "blank")).map((name) =>
      (name ?? "").trim(),
    );
    assert.deepEqual(
      { buttons, names },
      {
        buttons: ["Widen column", "Sort column", "Tooltip"],
        names: [""],
      },
    );
  });
});

test("with two DataTables on one page, no id their names use repeats", async () => {
  await withPage(1280, async (page) => {
    // The ids each table's names refer to. TanStack's header and cell ids
    // repeat across tables (#181), but no name refers to them.
    const [first, second] = await page.evaluate((tables) => {
      const attributes = ["aria-labelledby", "aria-describedby"];
      return tables.map((table) =>
        [
          ...document.querySelectorAll(
            attributes
              .map((attribute) => `[data-test=${table}] [${attribute}]`)
              .join(", "),
          ),
        ].flatMap((element) =>
          attributes.flatMap(
            (attribute) =>
              element.getAttribute(attribute)?.split(/\s+/).filter(Boolean) ??
              [],
          ),
        ),
      );
    }, tables);
    assert.ok(first.length > 0 && second.length > 0, "no name refers to an id");
    const counts = await page.evaluate(
      (ids) =>
        ids.map((id) => [id, document.querySelectorAll(`[id="${id}"]`).length]),
      [...first, ...second],
    );
    assert.deepEqual(
      counts.filter(([, count]) => count !== 1),
      [],
      "an id a name refers to isn't on exactly one element",
    );
    assert.deepEqual(
      first.filter((id) => second.includes(id)),
      [],
      "the tables' names refer to the same id",
    );
  });
});

// main's buttons (a0f9d3d), measured in this harness at 1280px with their
// header hovered, the only way they showed: in each theme, the button's
// size, fill, border, radius, padding, shadow and text colour, and its
// icon's size and colour. The same in every header, sorted or not.
const mainLook = {
  light: {
    size: "26x18",
    background: "rgb(255, 255, 255)",
    border: "1px solid rgb(194, 213, 255)",
    radius: "8px",
    padding: "0px 4px",
    shadow: shadowButton,
    colour: "rgb(37, 99, 235)",
    icon: "16x16 rgb(37, 99, 235)",
  },
  dark: {
    size: "26x18",
    background: "rgb(24, 24, 27)",
    border: "1px solid rgb(30, 64, 175)",
    radius: "8px",
    padding: "0px 4px",
    shadow: shadowButton,
    colour: "rgb(99, 148, 255)",
    icon: "16x16 rgb(99, 148, 255)",
  },
};

// Runs in the page: the look of each probed button, in DOM order. The shadow
// leaves out Tailwind's empty, transparent ring layers.
function readLooks() {
  return [...document.querySelectorAll("[data-probe]")].map((button) => {
    const style = getComputedStyle(button);
    const { width, height } = button.getBoundingClientRect();
    const icon = button.querySelector("svg");
    const iconBox = icon.getBoundingClientRect();
    return {
      size: `${width}x${height}`,
      background: style.backgroundColor,
      border: `${style.borderTopWidth} ${style.borderTopStyle} ${style.borderTopColor}`,
      radius: style.borderRadius,
      padding: style.padding,
      shadow: style.boxShadow
        .split(/,(?![^(]*\))/)
        .map((layer) => layer.trim())
        .filter((layer) => !layer.startsWith("rgba(0, 0, 0, 0) 0px 0px 0px"))
        .join(", "),
      colour: style.color,
      icon: `${iconBox.width}x${iconBox.height} ${getComputedStyle(icon).color}`,
    };
  });
}

test("each button looks at rest as main's did with its header hovered, also once sorted and widened, in both themes", async () => {
  const actual = {};
  const expected = {};
  for (const width of widths)
    for (const theme of ["light", "dark"])
      await withPage(
        width,
        async (page) => {
          const key = `${width}px, ${theme}`;
          const looks = allButtons.map(() => mainLook[theme]);
          actual[`${key}, at rest`] = await page.evaluate(readLooks);
          expected[`${key}, at rest`] = looks;
          await button(page, "first", "Sort by Name").click();
          await button(page, "first", "Widen Name").click();
          await page.evaluate(() => document.activeElement.blur());
          await page.mouse.move(away.x, away.y);
          actual[`${key}, sorted and widened`] = await page.evaluate(readLooks);
          expected[`${key}, sorted and widened`] = looks;
        },
        { theme },
      );
  assert.deepEqual(actual, expected);
});

// main's header borders (a0f9d3d), measured in this harness at 1280px: the
// bottom border of a sortable or expandable header at rest and hovered
const mainBorders = {
  light: { rest: colours.light["otl-gray-200"], hovered: "rgb(150, 183, 255)" },
  dark: { rest: colours.dark["otl-gray-200"], hovered: "rgb(29, 78, 216)" },
};

test("a sortable or expandable header's border turns otl-primary-300 on hover, as on main", async () => {
  const actual = {};
  const expected = {};
  for (const theme of ["light", "dark"])
    await withPage(
      1280,
      async (page) => {
        for (const name of ["Name", "Age", "Position"]) {
          const border = () =>
            page
              .locator("[data-test=first] thead th")
              .filter({ hasText: name })
              .evaluate((th) => getComputedStyle(th).borderBottomColor);
          const rest = await border();
          await hoverHeader(page, "first", name);
          actual[`${name} (${theme})`] = { rest, hovered: await border() };
          expected[`${name} (${theme})`] = mainBorders[theme];
          await page.mouse.move(away.x, away.y);
        }
      },
      { theme },
    );
  assert.deepEqual(actual, expected);
});
