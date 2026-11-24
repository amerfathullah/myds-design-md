// SummaryList's parts in Chromium's layout, on the compiled stylesheet. Each
// part is a table cell (#208), so `colSpan` and `rowSpan` work on
// SummaryListTerm and SummaryListAction as they do on SummaryListDetail and
// SummaryListAddition, and a row without a detail puts its action in the
// detail's column, beside its term. A cell with `display: flex` isn't a table
// cell: Chromium wraps it in an anonymous cell, which ignores the part's
// spans. Lists built as the docs build them look as they did: each term's
// text starts at its cell's left edge, on the same baseline as its row's
// first line, and an action's buttons sit side by side, the last ending 12px
// (`pr-3`) from its cell's right edge. A term that wraps starts each line at
// its cell's left edge: its lines used to be centred, as a `<th>` centres
// its text by default. In a right-to-left list the term's text still starts
// at its cell's right edge, inside its padding, and the action's buttons at
// its left edge. Each list's accessibility tree is a table whose rows hold a
// `rowheader` for the term and a `cell` for each other part. happy-dom has
// no layout, so the unit tests can't check this.
//
// The page is summary-list.page.jsx: the React components themselves,
// bundled with esbuild, on the stylesheet the Tailwind import compiles for
// full.css's sources.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";
import { chromium } from "playwright";

import { registryDefine } from "../../react/registry-define.mjs";
import { compile, fullCssSources } from "./compile.mjs";

const pageSource = fileURLToPath(
  new URL("./summary-list.page.jsx", import.meta.url),
);
// The page imports React and the components' dependencies from where the
// components resolve them, so the bundle has one copy of React
const reactModules = fileURLToPath(
  new URL("../../react/node_modules", import.meta.url),
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
      // React's development build, so the test sees its warnings
      define: { ...registryDefine, "process.env.NODE_ENV": '"development"' },
      logLevel: "silent",
    }),
    compile(`${fullCssSources()}\n@source "${pageSource}";`),
  ]);
  const script = bundle.outputFiles[0].text.replaceAll(
    "</script",
    "<\\/script",
  );
  html = `<!doctype html><html><head><style>${css}</style></head><body class="bg-bg-white"><div id="root"></div><script>${script}</script></body></html>`;
  browser = await chromium.launch();
});
after(() => browser?.close());

// Opens the page and runs `use` on it once React has rendered it. Nothing
// logs an error or a warning.
async function withPage(use) {
  const context = await browser.newContext({
    viewport: { width: 1024, height: 768 },
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
    const result = await use(page);
    assert.deepEqual(errors, []);
    return result;
  } finally {
    await context.close();
  }
}

// Runs in the page: the list `name`'s rows, each as its cells in order. A
// cell is its tag, its border box, its text's lines and first baseline, and
// its buttons, each as its border box and baseline. A line is its left and
// right edges. A box is its left,
// right, top and bottom edges. Every length is to the hundredth of a pixel,
// so edges on the table's grid compare equal.
function readRows(name) {
  const round = (value) => Math.round(value * 100) / 100;
  const box = ({ left, right, top, bottom }) => ({
    left: round(left),
    right: round(right),
    top: round(top),
    bottom: round(bottom),
  });
  // The first text in `element` that isn't white space
  const firstText = (element) =>
    document
      .createTreeWalker(element, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) =>
          node.data.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP,
      })
      .nextNode();
  // The baseline of `text`'s first line: the bottom of an empty inline block
  // just before it. Both go in a span for the measurement, so the block
  // shares the text's line whether its parent lays out a line or is a flex
  // container. Then the text goes back where it was.
  const baseline = (text) => {
    const wrapper = document.createElement("span");
    const probe = wrapper.appendChild(document.createElement("span"));
    probe.style.display = "inline-block";
    text.replaceWith(wrapper);
    wrapper.append(text);
    const { bottom } = probe.getBoundingClientRect();
    wrapper.replaceWith(text);
    return round(bottom);
  };
  // `element`'s text: its lines, its first line's left edge, and its
  // baseline
  const readText = (element) => {
    const text = firstText(element);
    if (!text) return null;
    const range = document.createRange();
    range.selectNodeContents(text);
    const lines = [...range.getClientRects()].map(({ left, right }) => ({
      left: round(left),
      right: round(right),
    }));
    return { lines, left: lines[0].left, baseline: baseline(text) };
  };
  // A button's baseline, which a flex container takes from its first item.
  // An icon has no baseline, so Chromium takes its bottom edge.
  const buttonBaseline = (button) => {
    const first = button.firstElementChild;
    return first instanceof SVGElement && !first.previousSibling
      ? round(first.getBoundingClientRect().bottom)
      : readText(button).baseline;
  };
  return [...document.querySelectorAll(`[data-test="${name}"] tbody > tr`)].map(
    (row) =>
      [...row.children].map((cell) => ({
        tag: cell.tagName.toLowerCase(),
        ...box(cell.getBoundingClientRect()),
        text: readText(cell),
        buttons: [...cell.querySelectorAll("button")].map((button) => ({
          ...box(button.getBoundingClientRect()),
          baseline: buttonBaseline(button),
        })),
      })),
  );
}

const rows = (page, name) => page.evaluate(readRows, name);

// A cell's left and right edges, to compare which columns it covers
const columns = ({ left, right }) => ({ left, right });

test("an action with `colSpan={2}` spans the action and addition columns", () =>
  withPage(async (page) => {
    const [reference, spanning] = await rows(page, "action-colspan");
    const [, , action, addition] = reference;
    assert.deepEqual(columns(spanning[2]), {
      left: action.left,
      right: addition.right,
    });
  }));

test("a term with `rowSpan={2}` spans both rows in a term column at its 190px minimum, and the next row's detail stays in the detail column", () =>
  withPage(async (page) => {
    const [reference, first, second] = await rows(page, "term-rowspan");
    const [term] = first;
    assert.deepEqual(
      {
        term: { ...columns(term), top: term.top, bottom: term.bottom },
        detail: columns(second[0]),
      },
      {
        // Each term fits in 190px, so the column stays at its minimum
        term: {
          left: reference[0].left,
          right: reference[0].left + 190,
          top: first[1].top,
          bottom: second[0].bottom,
        },
        detail: columns(reference[1]),
      },
    );
  }));

test("a term with `colSpan={2}` spans the term and detail columns, and its action stays beside it in the action column", () =>
  withPage(async (page) => {
    const [reference, [term, action]] = await rows(page, "term-colspan");
    assert.deepEqual(
      {
        term: columns(term),
        action: { ...columns(action), top: action.top },
      },
      {
        term: { left: reference[0].left, right: reference[1].right },
        action: { ...columns(reference[2]), top: term.top },
      },
    );
  }));

test("a row without a detail puts its action in the detail column, beside its term", () =>
  withPage(async (page) => {
    const [reference, [term, action]] = await rows(page, "no-detail");
    assert.deepEqual(
      { ...columns(action), top: action.top },
      { ...columns(reference[1]), top: term.top },
    );
  }));

// In the docs example, the Status row's detail is a Tag in a taller cell, so
// that row's baseline is its action's: the bottom of the Refresh button's
// icon. Every other row's baseline is its detail's first line.
test("in the docs example, each term's text starts at its cell's left edge, on its row's baseline, and each button ends 12px from its action cell's right edge", () =>
  withPage(async (page) => {
    const docs = await rows(page, "docs");
    // Seven rows, each a term, a detail and an action. Two actions hold a
    // button; the rest are empty.
    assert.deepEqual(
      docs.map((row) => row.map(({ tag }) => tag)),
      Array(7).fill(["th", "td", "td"]),
    );
    assert.deepEqual(
      docs.map(([, , action]) => action.buttons.length),
      [0, 0, 0, 0, 1, 1, 0],
    );
    const actual = docs.map(([term, , action]) => ({
      termTextLeft: term.text.left,
      termBaseline: term.text.baseline,
      buttonRights: action.buttons.map(({ right }) => right),
    }));
    const expected = docs.map(([term, detail, action], index) => ({
      termTextLeft: term.left,
      termBaseline:
        index === 4 ? action.buttons[0].baseline : detail.text.baseline,
      buttonRights: action.buttons.map(() => action.right - 12),
    }));
    assert.deepEqual(actual, expected);
  }));

test("two buttons in an action sit side by side on one line, the second ending 12px from its cell's right edge", () =>
  withPage(async (page) => {
    const [, [, , action]] = await rows(page, "two-buttons");
    const [edit, remove] = action.buttons;
    assert.deepEqual(
      {
        editRight: edit.right,
        removeTop: remove.top,
        removeRight: remove.right,
      },
      {
        editRight: remove.left,
        removeTop: edit.top,
        removeRight: action.right - 12,
      },
    );
  }));

test("a term that wraps starts each line at its cell's left edge", () =>
  withPage(async (page) => {
    const [[term]] = await rows(page, "wrapping-term");
    assert.deepEqual(
      term.text.lines.map(({ left }) => left),
      [term.left, term.left],
    );
  }));

test("in a right-to-left list, the term's text starts at its cell's right edge, inside its 12px padding, and the action's button sits at its cell's left edge", () =>
  withPage(async (page) => {
    const [[term, , action]] = await rows(page, "rtl");
    assert.deepEqual(
      {
        termTextRight: term.text.lines[0].right,
        buttonLeft: action.buttons[0].left,
      },
      { termTextRight: term.right - 12, buttonLeft: action.left },
    );
  }));

// Each list's accessibility snapshot: its title, then its table. Each row's
// term is a `rowheader`, and its detail, action and addition are `cell`s,
// whatever they span.
const emptyAction = "      - cell";
const row = (name, term, ...cells) =>
  [`    - row "${name}":`, `      - rowheader "${term}"`, ...cells].join("\n");
const cell = (name) => `      - cell "${name}"`;
const buttons = (...names) =>
  [
    `      - cell "${names.join(" ")}":`,
    ...names.map((name) => `        - button "${name}"`),
  ].join("\n");
const snapshot = (title, ...rows) =>
  [`- heading "${title}" [level=2]`, "- table:", "  - rowgroup:", ...rows].join(
    "\n",
  );
const applicationId = row(
  "Application ID SUB12345",
  "Application ID",
  cell("SUB12345"),
  emptyAction,
);

const snapshots = {
  docs: snapshot(
    "Government Subsidy Application",
    applicationId,
    row(
      "Applicant Name Lee Ming Wei",
      "Applicant Name",
      cell("Lee Ming Wei"),
      emptyAction,
    ),
    row(
      "Submission Date 15/10/2024 17:35:00",
      "Submission Date",
      cell("15/10/2024 17:35:00"),
      emptyAction,
    ),
    row(
      "Subsidy Type Petrol Subsidy",
      "Subsidy Type",
      cell("Petrol Subsidy"),
      emptyAction,
    ),
    row(
      "Status Pending Refresh",
      "Status",
      cell("Pending"),
      [
        '      - cell "Refresh":',
        '        - button "Refresh":',
        "          - img",
        "          - text: Refresh",
      ].join("\n"),
    ),
    row(
      "Document Submitted Proof Of Income ID Copy Add More",
      "Document Submitted",
      cell("Proof Of Income ID Copy"),
      buttons("Add More"),
    ),
    row(
      "Expected Response Date 23/03/2023 17:35:00",
      "Expected Response Date",
      cell("23/03/2023 17:35:00"),
      emptyAction,
    ),
  ),
  "two-buttons": snapshot(
    "Two buttons",
    applicationId,
    row(
      "Applicant Name Lee Ming Wei Edit Remove",
      "Applicant Name",
      cell("Lee Ming Wei"),
      buttons("Edit", "Remove"),
    ),
  ),
  "action-colspan": snapshot(
    "An action across two columns",
    row(
      "Application ID SUB12345 Change Additional information",
      "Application ID",
      cell("SUB12345"),
      buttons("Change"),
      cell("Additional information"),
    ),
    row(
      "Applicant Name Lee Ming Wei Edit Name",
      "Applicant Name",
      cell("Lee Ming Wei"),
      buttons("Edit Name"),
    ),
  ),
  "term-rowspan": snapshot(
    "A term across two rows",
    applicationId,
    row(
      "Document Submitted Proof Of Income Change",
      "Document Submitted",
      cell("Proof Of Income"),
      buttons("Change"),
    ),
    // The row the term spans into has no rowheader of its own
    ['    - row "ID Copy Change":', cell("ID Copy"), buttons("Change")].join(
      "\n",
    ),
  ),
  "term-colspan": snapshot(
    "A term across two columns",
    applicationId,
    row(
      "Supporting documents Add More",
      "Supporting documents",
      buttons("Add More"),
    ),
  ),
  "no-detail": snapshot(
    "A row without a detail",
    applicationId,
    row(
      "Supporting documents Add More",
      "Supporting documents",
      buttons("Add More"),
    ),
  ),
};

test("each list reads as a table whose rows hold a rowheader for the term and a cell for each other part", () =>
  withPage(async (page) => {
    const actual = {};
    for (const name of Object.keys(snapshots))
      actual[name] = await page.locator(`[data-test="${name}"]`).ariaSnapshot();
    assert.deepEqual(actual, snapshots);
  }));
