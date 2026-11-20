// SearchBarInput's accessible name in Chromium (#178). Its own
// `aria-labelledby` names it, then its own `aria-label`, then SearchBar's
// `label`, and with none of them it has no name: its placeholder doesn't
// name it either, since cmdk's hidden `<label for>` is there, empty. The
// unit tests check the same names with dom-accessibility-api, which until
// #178 disagreed with Chromium about an `aria-label` on SearchBarInput.
//
// cmdk finds its <input> by the id it generates, so an `id` on
// SearchBarInput never reaches it. With the docs' composition, typing,
// ArrowDown, ArrowUp and Enter work as they do without one.
//
// The page is search-bar-names.page.jsx: the React components themselves,
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
  new URL("./search-bar-names.page.jsx", import.meta.url),
);
// The page imports React and the components' dependencies from where the
// components resolve them, so the bundle has one copy of React
const reactModules = fileURLToPath(
  new URL("../../react/node_modules", import.meta.url),
);

const pageUrl = "http://search-bar-names.test/";
const people = ["Tunku Abdul Rahman", "Tun Abdul Razak", "Tun Hussein Onn"];

let browser;
let css;
let script;
before(async () => {
  const [bundle, compiled] = await Promise.all([
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
  css = compiled;
  script = bundle.outputFiles[0].text.replaceAll("</script", "<\\/script");
  browser = await chromium.launch();
});
after(() => browser?.close());

// Opens the page with `params` as its query, and runs `use` on it once
// React has rendered it. Nothing logs an error or a warning.
async function withPage(params, use) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  try {
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (["error", "warning"].includes(message.type()))
        errors.push(message.text());
    });
    await page.route(`${pageUrl}?*`, (route) =>
      route.fulfill({
        contentType: "text/html; charset=utf-8",
        body: `<!doctype html><html lang="ms"><head><style>${css}</style></head><body class="bg-bg-white"><div id="root"></div><script>${script}</script></body></html>`,
      }),
    );
    await page.goto(`${pageUrl}?${new URLSearchParams(params)}`);
    await page.waitForFunction(() => window.ready.length === 1);
    const result = await use(page);
    assert.deepEqual(errors, []);
    return result;
  } finally {
    await context.close();
  }
}

const input = "[data-test=input]";

// The role and name Chromium's accessibility tree gives the input
async function treeNode(page) {
  const client = await page.context().newCDPSession(page);
  try {
    const {
      result: { objectId },
    } = await client.send("Runtime.evaluate", {
      expression: `document.querySelector(${JSON.stringify(input)})`,
    });
    const {
      nodes: [node],
    } = await client.send("Accessibility.getPartialAXTree", {
      objectId,
      fetchRelatives: false,
    });
    return { role: node.role?.value, name: node.name?.value ?? "" };
  } finally {
    await client.detach();
  }
}

const named = (params) => withPage(params, treeNode);

test("with only a placeholder, the input has no name: there is no default", async () => {
  assert.deepEqual(await named({}), { role: "combobox", name: "" });
});

test('an `aria-label` on SearchBarInput names it, "Cari nama" here', async () => {
  assert.deepEqual(await named({ "aria-label": "Cari nama" }), {
    role: "combobox",
    name: "Cari nama",
  });
});

test("an `aria-labelledby` on SearchBarInput, pointing at a Label's `id`, names it by the Label's text", async () => {
  assert.deepEqual(await named({ labelledby: "Cari nama" }), {
    role: "combobox",
    name: "Cari nama",
  });
});

test("an `aria-labelledby` on SearchBarInput wins over its `aria-label`", async () => {
  assert.deepEqual(
    await named({ labelledby: "Cari nama", "aria-label": "Nama" }),
    { role: "combobox", name: "Cari nama" },
  );
});

test("SearchBar's `label` names it, and an `aria-label` on SearchBarInput wins over it", async () => {
  assert.deepEqual(
    [
      await named({ label: "Cari nama" }),
      await named({ label: "Cari nama", "aria-label": "Nama" }),
    ],
    [
      { role: "combobox", name: "Cari nama" },
      { role: "combobox", name: "Nama" },
    ],
  );
});

test("an `id` on SearchBarInput doesn't reach the input, and typing, ArrowDown, ArrowUp and Enter work", () =>
  withPage({ id: "q", "aria-label": "Cari nama" }, async (page) => {
    const wiring = await page.evaluate(() => {
      const field = document.querySelector("[data-test=input]");
      const label = document.querySelector("label[cmdk-label]");
      return { id: field.id, for: label.getAttribute("for") };
    });
    assert.notEqual(wiring.id, "q");
    assert.ok(wiring.id);
    assert.equal(wiring.for, wiring.id);

    // Typing mounts the results, and cmdk then selects one, which is when
    // an author's id on the input would send focus to the listbox
    await page.focus(input);
    await page.keyboard.type("tu");
    const focusedInput = () =>
      page.evaluate(
        () => document.activeElement?.getAttribute("data-test") === "input",
      );
    assert.equal(await focusedInput(), true);
    assert.equal(await page.inputValue(input), "tu");

    const selected = () =>
      page.evaluate(
        () =>
          document.querySelector('[cmdk-item][aria-selected="true"]')
            ?.textContent,
      );
    const walk = [];
    for (const key of ["ArrowDown", "ArrowDown", "ArrowUp"]) {
      await page.keyboard.press(key);
      walk.push(await selected());
    }
    assert.deepEqual(walk, [people[0], people[1], people[0]]);
    assert.equal(await focusedInput(), true);

    await page.keyboard.press("Enter");
    assert.deepEqual(await page.evaluate(() => window.chosen), [people[0]]);
  }));
