// Callout in Chromium's accessibility tree. Its status icon, which it picks
// by Variant, and its `dismissible` close button's cross are hidden from
// assistive technology (ADR-0013), so nothing in a callout is an image: each
// reads as a note holding its title as a `term` and its content as a
// `definition`, and a dismissible one adds its "Close" button, with no image
// inside. The author's title says the Variant, e.g. "Ralat: Borang tidak
// dihantar"; Callout adds nothing for it. The unit tests check the same with
// dom-accessibility-api.
//
// The page is callout.page.jsx: the React components themselves, bundled
// with esbuild, on the stylesheet the Tailwind import compiles for full.css's
// sources. It renders each callout on the client and as server markup.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";
import { chromium } from "playwright";

import { registryDefine } from "../../react/registry-define.mjs";
import { compile, fullCssSources } from "./compile.mjs";

const pageSource = fileURLToPath(
  new URL("./callout.page.jsx", import.meta.url),
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
  html = `<!doctype html><html lang="ms"><head><style>${css}</style></head><body class="bg-bg-white"><div id="client"></div><div id="server"></div><script>${script}</script></body></html>`;
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

const modes = ["client", "server"];

const information = [
  "- note:",
  '  - term: "Maklumat: Permohonan sedang disemak"',
  "  - definition: Kami akan menghubungi anda dalam masa lima hari bekerja.",
];
const error = [
  "- note:",
  '  - term: "Ralat: Borang tidak dihantar"',
  "  - definition: Semak butiran anda dan cuba lagi.",
];

// Each callout's accessibility snapshot, by name: a note holding the title
// and the content, and the dismissible one's "Close" button. No image.
const expected = {
  omitted: information,
  info: information,
  success: [
    "- note:",
    '  - term: "Berjaya: Data disimpan"',
    "  - definition: Perubahan anda telah disimpan.",
  ],
  warning: [
    "- note:",
    '  - term: "Amaran: Sesi akan tamat"',
    "  - definition: Sesi anda akan tamat dalam masa lima minit.",
  ],
  danger: error,
  "dismissible-danger": [...error, '  - button "Close"'],
};

test("each callout reads as a note holding its title and content, and the dismissible one its Close button, with no image", () =>
  withPage(async (page) => {
    const actual = {};
    for (const mode of modes)
      for (const name of Object.keys(expected))
        actual[`${mode}-${name}`] = await page
          .locator(`[data-test="${mode}-${name}"]`)
          .ariaSnapshot();
    const wanted = {};
    for (const mode of modes)
      for (const [name, lines] of Object.entries(expected))
        wanted[`${mode}-${name}`] = lines.join("\n");
    assert.deepEqual(actual, wanted);
  }));

test("Chromium's full accessibility tree has no image: neither the status icons nor the close button's cross", () =>
  withPage(async (page) => {
    const client = await page.context().newCDPSession(page);
    try {
      const { nodes } = await client.send("Accessibility.getFullAXTree");
      // The page holds all twelve callouts' icons, and two crosses
      assert.equal(await page.locator("svg").count(), 14);
      const images = nodes.filter(
        (node) =>
          !node.ignored &&
          ["image", "img", "graphics-document", "graphics-symbol"].includes(
            node.role?.value,
          ),
      );
      assert.deepEqual(images, []);
      // Each "Close" button is named by `closeLabel`'s default alone
      const buttons = nodes
        .filter((node) => !node.ignored && node.role?.value === "button")
        .map((node) => node.name?.value);
      assert.deepEqual(buttons, ["Close", "Close"]);
    } finally {
      await client.detach();
    }
  }));
