// Which DataTable columns truncate, in Chromium (#192, ADR-0012). A column
// is widenable when it's a leaf column with `meta.expandable`, however it's
// defined. Only a widenable column carries `data-expanded`, on its header,
// body and footer cells, and only a collapsed one truncates: one line, cut
// with an ellipsis at 230px. Each widen press shows its result. Every other
// column wraps, at every width, so its text shows in full and makes the table
// taller rather than wider. Group and placeholder cells never carry
// `data-expanded`. Pinning keeps main's inline offsets and widths, a focused
// button's ring shows on its left side, and Storybook's PinnedColumns story
// repeats no React key.
//
// The page is data-table-widen.page.jsx: the React components themselves,
// bundled with esbuild in a development build, on the stylesheet the Tailwind
// import compiles for full.css's sources.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";
import { chromium } from "playwright";

import { registryDefine } from "../../react/registry-define.mjs";
import { compile, fullCssSources } from "./compile.mjs";
import { colours } from "./field-looks.mjs";

const pageSource = fileURLToPath(
  new URL("./data-table-widen.page.jsx", import.meta.url),
);
// The page imports React and the components' dependencies from where the
// components resolve them, so the bundle has one copy of React
const reactModules = fileURLToPath(
  new URL("../../react/node_modules", import.meta.url),
);
// The Storybook story imports the components by their package paths, which
// resolve to their sources
const componentsDir = fileURLToPath(
  new URL("../../react/src/components", import.meta.url),
);

const height = 900;

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
      alias: { "@amerfathullah/myds-react": componentsDir },
      define: { ...registryDefine, "process.env.NODE_ENV": '"development"' },
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

// Opens the page `width` px wide and runs `use` on it once React has rendered
// it. Returns what `use` returns, and the errors and warnings the page logged.
async function openPage(width, use, { hasTouch = false } = {}) {
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
    return { result: await use(page), errors };
  } finally {
    await context.close();
  }
}

// As `openPage`, and nothing logs an error or a warning
async function withPage(width, use, options) {
  const { result, errors } = await openPage(width, use, options);
  assert.deepEqual(errors, []);
  return result;
}

test("Storybook's PinnedColumns story repeats no React key in a development build", async () => {
  const { errors } = await openPage(1280, () => {});
  assert.deepEqual(
    errors.filter((error) => /same key/.test(error)),
    [],
  );
});

// Runs in the page: the inline `width` of the table `table`, and each row's
// pinned cells, as "<side> <inline style>"
function readPinning(table) {
  const root = document.querySelector(`[data-test=${table}] table`);
  return {
    width: root.style.width,
    rows: [...root.querySelectorAll("tr")].map((row) =>
      [...row.children]
        .filter((cell) => ["left", "right"].includes(cell.dataset.pinned))
        .map((cell) => `${cell.dataset.pinned} ${cell.getAttribute("style")}`),
    ),
  };
}

// main's pinning (a82f2ab), measured in this harness: each table's inline
// width, and the pinned cells of each of its rows, header and body alike
const mainPinning = {
  "pinned-docs": {
    width: "750px",
    rows: Array(6).fill([
      "left left: 0px; width: 150px;",
      "right right: 0px; width: 150px;",
    ]),
  },
  "pinned-story": {
    width: "2326px",
    rows: Array(6).fill([
      "left left: 0px; width: 46px;",
      "left left: 46px; width: 180px;",
      "left left: 226px; width: 150px;",
      "right right: 0px; width: 150px;",
    ]),
  },
};

test("the docs' Pinned Columns preview and Storybook's PinnedColumns keep main's pinned offsets and widths, and table width", async () => {
  const actual = {};
  for (const width of [390, 1280])
    await withPage(width, async (page) => {
      for (const table of Object.keys(mainPinning)) {
        actual[`${table}, ${width}px`] = await page.evaluate(
          readPinning,
          table,
        );
      }
    });
  assert.deepEqual(
    actual,
    Object.fromEntries(
      Object.keys(actual).map((key) => [key, mainPinning[key.split(",")[0]]]),
    ),
  );
});

// The widen button of the column headed `name` in the table `table`
const widenButton = (page, table, name) =>
  page
    .locator(`[data-test=${table}] thead`)
    .getByRole("button", { name: `Widen ${name}`, exact: true });

// Runs in the page: whether `cell`'s content overflows it
const clippedSource = `(cell) => cell.scrollWidth > cell.clientWidth`;

// Runs in the page: the cells of the leaf column headed `name` in the table
// `table`, each as its `data-expanded` (null without one): its header cell,
// its body cells and its footer cell, null in a table with no footer. Also
// whether each body cell's content overflows it.
function readColumn({ table, name }) {
  const root = document.querySelector(`[data-test=${table}] table`);
  // The last header row holds every leaf column's header, and the first
  // footer row their footers, in the order of the body's cells
  const leafHeaders = [...root.querySelectorAll("thead tr")].at(-1).children;
  const index = [...leafHeaders].findIndex(
    (header) => header.textContent === name,
  );
  if (index < 0) throw new Error(`${table} has no column headed ${name}`);
  const body = [...root.querySelectorAll("tbody tr")].map(
    (row) => row.children[index],
  );
  const footer = root.querySelector("tfoot tr")?.children[index] ?? null;
  const expanded = (cell) => cell?.getAttribute("data-expanded") ?? null;
  return {
    header: expanded(leafHeaders[index]),
    body: body.map(expanded),
    footer: expanded(footer),
    clipped: body.map((cell) => cell.scrollWidth > cell.clientWidth),
  };
}

// The four kinds of widenable column in the `kinds` table, by header
const kinds = ["With id", "Accessor key", "Leaf", "Added"];

// Calls the page's `addColumn`, and waits for the column it adds
async function addColumn(page) {
  await page.evaluate(() => window.addColumn());
  await widenButton(page, "kinds", "Added").waitFor();
}

test("each kind of widenable column truncates at rest, its first widen press reveals all its text, and its second truncates it again, at 390px and 1280px", async () => {
  const actual = {};
  const expected = {};
  for (const width of [390, 1280])
    await withPage(width, async (page) => {
      await addColumn(page);
      for (const name of kinds) {
        const read = () => page.evaluate(readColumn, { table: "kinds", name });
        const steps = [await read()];
        for (let press = 0; press < 2; press++) {
          await widenButton(page, "kinds", name).click();
          steps.push(await read());
        }
        actual[`${name}, ${width}px`] = steps;
        const state = (expanded) => ({
          header: String(expanded),
          body: [String(expanded), String(expanded)],
          footer: String(expanded),
          clipped: [!expanded, !expanded],
        });
        expected[`${name}, ${width}px`] = [
          state(false),
          state(true),
          state(false),
        ];
      }
    });
  assert.deepEqual(actual, expected);
});

// Runs in the page: each group and placeholder cell in the table `table`,
// header and footer, as "<text>: <data-expanded>", null without one. They're
// every header cell above the last header row and every footer cell below
// the first footer row.
function readGroupCells(table) {
  const root = document.querySelector(`[data-test=${table}] table`);
  const rows = [
    ...[...root.querySelectorAll("thead tr")].slice(0, -1),
    ...[...root.querySelectorAll("tfoot tr")].slice(1),
  ];
  return rows.flatMap((row) =>
    [...row.children].map(
      (cell) => `${cell.textContent}: ${cell.getAttribute("data-expanded")}`,
    ),
  );
}

// The names of the header buttons in the table `table`
const headerButtonNames = (page, table) =>
  page
    .locator(`[data-test=${table}] thead button`)
    .evaluateAll((buttons) =>
      buttons.map((button) => button.getAttribute("aria-label")),
    );

test("group and placeholder cells never carry `data-expanded`, even where a group shares its id with a leaf, and a group column with `meta.expandable` gets no widen button", async () => {
  await withPage(1280, async (page) => {
    await addColumn(page);
    // Each table's group and placeholder cells: the header cells above the
    // leaf headers, then the footer cells below the leaf footers
    const groupCells = {
      kinds: [
        ": null",
        ": null",
        "Group: null",
        ": null",
        ": null",
        ": null",
        "Group total: null",
        ": null",
      ],
      groups: [
        "Employee: null",
        "Application: null",
        "Notes: null",
        ": null",
        ": null",
        "Notes total: null",
      ],
    };
    const actual = {};
    for (const table of Object.keys(groupCells))
      actual[`${table}, at rest`] = await page.evaluate(readGroupCells, table);
    // Every widen button pressed once
    for (const [table, names] of [
      ["kinds", kinds],
      ["groups", ["Name", "Position", "Remark"]],
    ])
      for (const name of names) await widenButton(page, table, name).click();
    for (const table of Object.keys(groupCells))
      actual[`${table}, widened`] = await page.evaluate(readGroupCells, table);
    // The groups table's columns that can't be widened, among them Status,
    // which shares its id with its group, carry no `data-expanded` either
    for (const name of ["Age", "Status", "Action"]) {
      const { clipped, ...cells } = await page.evaluate(readColumn, {
        table: "groups",
        name,
      });
      actual[`groups, ${name}`] = cells;
    }
    actual["groups, widen buttons"] = (
      await headerButtonNames(page, "groups")
    ).filter((name) => name.startsWith("Widen"));
    const none = { header: null, body: Array(5).fill(null), footer: null };
    assert.deepEqual(actual, {
      "kinds, at rest": groupCells.kinds,
      "groups, at rest": groupCells.groups,
      "kinds, widened": groupCells.kinds,
      "groups, widened": groupCells.groups,
      "groups, Age": none,
      "groups, Status": none,
      "groups, Action": none,
      "groups, widen buttons": ["Widen Name", "Widen Position", "Widen Remark"],
    });
  });
});

// Runs in the page: how many lines `cell`'s text renders on
function lineCount(cell) {
  const range = document.createRange();
  range.selectNodeContents(cell);
  const tops = [...range.getClientRects()]
    .filter((rect) => rect.width > 0)
    .map((rect) => Math.round(rect.top));
  return new Set(tops).size;
}

// Runs in the page: each body cell of the column headed `name` in the table
// `table`, as its `data-expanded` (null without one), whether its content
// overflows it, the lines its text renders on, and its `text-overflow`
function readBodyCells({ table, name, lineCountSource }) {
  const lines = new Function(`return ${lineCountSource}`)();
  const root = document.querySelector(`[data-test=${table}] table`);
  const headers = [...[...root.querySelectorAll("thead tr")].at(-1).children];
  const index = headers.findIndex((header) => header.textContent === name);
  if (index < 0) throw new Error(`${table} has no column headed ${name}`);
  return [...root.querySelectorAll("tbody tr")].map((row) => {
    const cell = row.children[index];
    return {
      expanded: cell.getAttribute("data-expanded"),
      clipped: cell.scrollWidth > cell.clientWidth,
      lines: lines(cell),
      textOverflow: getComputedStyle(cell).textOverflow,
    };
  });
}

// `readBodyCells` for `page`
const bodyCells = (page, table, name) =>
  page.evaluate(readBodyCells, {
    table,
    name,
    lineCountSource: lineCount.toString(),
  });

test("a column that can't be widened carries no `data-expanded` and wraps its text in full, at 390px, 768px and 1280px", async () => {
  const actual = {};
  const expected = {};
  for (const width of [390, 768, 1280])
    await withPage(width, async (page) => {
      const header = await page
        .locator("[data-test=remark] thead tr:last-child th")
        .last()
        .getAttribute("data-expanded");
      const cells = await bodyCells(page, "remark", "Remark");
      actual[`${width}px`] = {
        header,
        cells: cells.map(({ expanded, clipped, lines }) => ({
          expanded,
          clipped,
          wraps: lines > 1,
        })),
      };
      expected[`${width}px`] = {
        header: null,
        cells: Array(5).fill({ expanded: null, clipped: false, wraps: true }),
      };
    });
  assert.deepEqual(actual, expected);
});

test("on a phone, a collapsed column's text is one line cut with an ellipsis, and a tap on its widen button shows all of it, wrapped; from 1280px, widening puts it on one line", async () => {
  // Each body cell of the `kinds` table's Accessor key column, a widenable
  // column whose cells render plain text from its accessor
  const read = async (page) =>
    (await bodyCells(page, "kinds", "Accessor key")).map(
      ({ expanded, clipped, lines, textOverflow }) => ({
        expanded,
        clipped,
        lines: lines === 1 ? "one" : "several",
        textOverflow,
      }),
    );
  const actual = {};
  await withPage(
    390,
    async (page) => {
      actual["390px, at rest"] = await read(page);
      await widenButton(page, "kinds", "Accessor key").tap();
      actual["390px, widened"] = await read(page);
    },
    { hasTouch: true },
  );
  await withPage(1280, async (page) => {
    actual["1280px, at rest"] = await read(page);
    await widenButton(page, "kinds", "Accessor key").click();
    actual["1280px, widened"] = await read(page);
  });
  const collapsed = {
    expanded: "false",
    clipped: true,
    lines: "one",
    textOverflow: "ellipsis",
  };
  const widened = (lines) => ({
    expanded: "true",
    clipped: false,
    lines,
    textOverflow: "clip",
  });
  assert.deepEqual(actual, {
    "390px, at rest": [collapsed, collapsed],
    "390px, widened": [widened("several"), widened("several")],
    "1280px, at rest": [collapsed, collapsed],
    "1280px, widened": [widened("one"), widened("one")],
  });
});

test("at 768px, a long column that can't be widened wraps, so the docs' columns and it fit their 736px scroll wrapper", async () => {
  await withPage(768, async (page) => {
    const fit = await page
      .locator("[data-test=long] table")
      .evaluate((table) => {
        const wrapper = table.parentElement;
        return {
          wrapper: wrapper.clientWidth,
          scrolls: wrapper.scrollWidth > wrapper.clientWidth,
          table: table.getBoundingClientRect().width <= wrapper.clientWidth,
        };
      });
    const remarks = await bodyCells(page, "long", "Remark");
    assert.deepEqual(
      { ...fit, wraps: remarks.map(({ lines }) => lines > 1) },
      { wrapper: 736, scrolls: false, table: true, wraps: Array(5).fill(true) },
    );
  });
});

// The colour of the page's pixel at each point, as [r, g, b]
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
  return page.evaluate(
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

test("in the docs' Data & Columns table at 1280px, a focused Edit button's ring shows on its left side", async () => {
  await withPage(1280, async (page) => {
    const buttons = page
      .locator("[data-test=docs] tbody")
      .getByRole("button", { name: "Edit", exact: true });
    const ring = colours.light["fr-primary"].match(/\d+/g).map(Number);
    const actual = [];
    for (let row = 0; row < (await buttons.count()); row++) {
      const button = buttons.nth(row);
      // Mid-way up the button, in the middle of the 3px band left of it,
      // where its ring draws. The cell has no left padding, so that's where
      // the cell starts.
      const point = await button.evaluate((element) => {
        const { left, top, height } = element.getBoundingClientRect();
        return { x: Math.floor(left - 1.5), y: Math.floor(top + height / 2) };
      });
      const [resting] = await sample(page, [point]);
      await button.focus();
      const [focused] = await sample(page, [point]);
      await button.blur();
      // Within 8 of the ring's colour in each channel; the ring is opaque
      actual.push({
        rests: resting.some((channel, i) => Math.abs(channel - ring[i]) > 8),
        rings: focused.every((channel, i) => Math.abs(channel - ring[i]) <= 8),
      });
    }
    assert.deepEqual(actual, Array(5).fill({ rests: true, rings: true }));
  });
});
