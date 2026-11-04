// The date pickers' triggers in Chromium's accessibility tree, at a phone's
// width (375px) and a desktop's (1280px), with the library's styles. Each
// picker renders a Dialog trigger for below `lg:` and a Popover trigger from
// `lg:` up, and the tree holds only the set the width shows. A picker named
// by a Label through `aria-labelledby`, or by `aria-label`, names each
// trigger by that label, then by what the trigger shows: DatePicker's date,
// or DateRangePicker's prefix and date, with a space between them. A hint
// `aria-describedby` names describes each trigger. A picker with none of the
// props is named by what it shows, as before. Each holds in pickers rendered
// on the client and in pickers hydrated from server HTML. A visible trigger
// still opens its calendar, and none of the naming props reaches it.
//
// The page is date-pickers.page.jsx: the React components themselves,
// bundled with esbuild, on the stylesheet the Tailwind import compiles for
// full.css's sources.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";
import { chromium } from "playwright";

import { compile, fullCssSources } from "./compile.mjs";

const pageSource = fileURLToPath(
  new URL("./date-pickers.page.jsx", import.meta.url),
);
// The page imports React and the components' dependencies from where the
// components resolve them, so the bundle has one copy of React
const reactModules = fileURLToPath(
  new URL("../../react/node_modules", import.meta.url),
);

const widths = [375, 1280];
const modes = ["csr", "ssr"];

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
  html = `<!doctype html><html><head><style>${css}</style><style>*,::before,::after{transition:none!important;animation:none!important}</style></head><body class="bg-bg-white"><div id="csr"></div><div id="ssr"></div><script>${script}</script></body></html>`;
  browser = await chromium.launch();
});
after(() => browser?.close());

// Opens the page `width` px wide and runs `use` on it, once React has
// rendered it and hydrated the server's HTML. Nothing logs an error, and
// hydration keeps the server's triggers.
async function withPage(width, use) {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
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
    await page.waitForFunction(() => window.ready.length === 2);
    assert.deepEqual(
      await page.evaluate(() => ({
        recoverable: window.recoverableErrors,
        kept: window.serverTriggers.every((trigger) => trigger.isConnected),
      })),
      { recoverable: [], kept: true },
    );
    const result = await use(page);
    assert.deepEqual(errors, []);
    return result;
  } finally {
    await context.close();
  }
}

// The buttons in the field `<mode>-<field>` that Chromium's accessibility
// tree holds, as each one's number among the field's triggers, its name and
// its description
async function treeButtons(page, mode, field) {
  const client = await page.context().newCDPSession(page);
  try {
    const {
      result: { objectId },
    } = await client.send("Runtime.evaluate", {
      expression: `document.querySelector('[data-test="${mode}-${field}"]')`,
    });
    const { nodes } = await client.send("Accessibility.queryAXTree", {
      objectId,
      role: "button",
    });
    const buttons = [];
    for (const node of nodes.filter((node) => !node.ignored)) {
      const { object } = await client.send("DOM.resolveNode", {
        backendNodeId: node.backendDOMNodeId,
      });
      const {
        result: { value: trigger },
      } = await client.send("Runtime.callFunctionOn", {
        objectId: object.objectId,
        functionDeclaration:
          "function () { return [...this.closest('[data-test]').querySelectorAll('button')].indexOf(this); }",
        returnByValue: true,
      });
      buttons.push({
        trigger,
        name: node.name?.value,
        description: node.description?.value ?? "",
      });
    }
    return buttons;
  } finally {
    await client.detach();
  }
}

// The trigger numbers each width shows: DatePicker its dialog's trigger
// below `lg:` and its popover's from `lg:` up; DateRangePicker its dialogs'
// From and To triggers, then its popovers'
const shown = {
  375: { date: [0], range: [0, 1] },
  1280: { date: [1], range: [2, 3] },
};

// The fields on the page, each a picker in a `<div data-test>`: which
// picker it is, and what its shown triggers are named and described by
const fields = {
  "date-labelled": {
    picker: "date",
    triggers: [["Date of birth 30 Oct 2026", "No earlier than 1 January 1950"]],
  },
  "date-aria-label": {
    picker: "date",
    triggers: [["Tarikh lahir 30 Okt 2026", ""]],
  },
  "date-unnamed": { picker: "date", triggers: [["30 Oct 2026", ""]] },
  "range-labelled": {
    picker: "range",
    triggers: [
      ["Travel dates From: 01 Oct 2026", "Up to 30 days"],
      ["Travel dates To: 30 Oct 2026", "Up to 30 days"],
    ],
  },
  "range-aria-label": {
    picker: "range",
    triggers: [
      ["Tarikh perjalanan Dari: 01 Okt 2026", ""],
      ["Tarikh perjalanan Hingga: 30 Okt 2026", ""],
    ],
  },
  "range-from-to": {
    picker: "range",
    triggers: [
      ["Stay Check-in: 01 Oct 2026", ""],
      ["Stay Check-out: 30 Oct 2026", ""],
    ],
  },
  "range-unnamed": {
    picker: "range",
    triggers: [
      ["From: 01 Oct 2026", ""],
      ["To: 30 Oct 2026", ""],
    ],
  },
};

for (const width of widths) {
  test(`at ${width}px, the tree holds only the shown triggers, each named by the label then what it shows, and described by the hint`, () =>
    withPage(width, async (page) => {
      const actual = {};
      const want = {};
      for (const mode of modes) {
        for (const [field, { picker, triggers: names }] of Object.entries(
          fields,
        )) {
          actual[`${mode} ${field}`] = await treeButtons(page, mode, field);
          const triggers = shown[width][picker];
          want[`${mode} ${field}`] = names.map(
            ([name, description], index) => ({
              trigger: triggers[index],
              name,
              description,
            }),
          );
        }
      }
      assert.deepEqual(actual, want);
    }));

  test(`at ${width}px, a shown trigger opens its calendar, and no naming prop reaches it`, () =>
    withPage(width, async (page) => {
      const actual = {};
      for (const mode of modes) {
        for (const field of ["date-labelled", "range-labelled"]) {
          const [trigger] = shown[width][fields[field].picker];
          await page
            .locator(`[data-test="${mode}-${field}"] button`)
            .nth(trigger)
            .click();
          actual[`${mode} ${field}`] = await page.evaluate((mode) => {
            const open = [...document.querySelectorAll('[role="dialog"]')];
            const ids = ["dob", "dob-hint", "travel", "travel-hint"].map(
              (id) => `${mode}-${id}`,
            );
            // The elements in the open dialogs and popovers that carry one
            // of the field's naming props, as "<tag> <attribute>"
            const naming = open
              .flatMap((dialog) => [dialog, ...dialog.querySelectorAll("*")])
              .flatMap((element) =>
                ["aria-labelledby", "aria-describedby"]
                  .filter((name) =>
                    (element.getAttribute(name) ?? "")
                      .split(/\s+/)
                      .some((id) => ids.includes(id)),
                  )
                  .map((name) => `${element.tagName.toLowerCase()} ${name}`),
              );
            return {
              open: open.length,
              calendars: open.filter((dialog) => dialog.querySelector("[lang]"))
                .length,
              naming,
            };
          }, mode);
          await page.keyboard.press("Escape");
          await page.waitForFunction(
            () => document.querySelectorAll('[role="dialog"]').length === 0,
          );
        }
      }
      const opened = { open: 1, calendars: 1, naming: [] };
      assert.deepEqual(actual, {
        "csr date-labelled": opened,
        "csr range-labelled": opened,
        "ssr date-labelled": opened,
        "ssr range-labelled": opened,
      });
    }));
}
