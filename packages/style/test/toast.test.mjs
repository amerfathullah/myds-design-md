// How urgently a toast is announced, in Chromium's accessibility tree
// (ADR-0014). Radix announces each toast in a visually hidden
// `role="status"` span of its own, portalled to `<body>`, that fills with
// "Notification" and the toast's text two animation frames after it mounts,
// and is removed a second after. Its `aria-live` follows ToastRoot's `type`,
// which ToastRoot defaults by Variant when none is given. So under a default
// AutoToast, an `error` toast's announcement is an assertive live region,
// which interrupts the screen reader, and a `success` toast's is a polite
// one, announced at the next pause. Each title names its Variant, e.g.
// "Ralat: Borang tidak dihantar". `ariaSnapshot()` doesn't show `live`, so the
// test reads the full tree through the Chrome DevTools Protocol. The unit
// tests check the same, and every Variant, by the span's `aria-live`.
//
// The page is toast.page.jsx: the React components themselves, bundled with
// esbuild, on the stylesheet the Tailwind import compiles for full.css's
// sources. It fires each toast through the library's toast hook.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";
import { chromium } from "playwright";

import { registryDefine } from "../../react/registry-define.mjs";
import { compile, fullCssSources } from "./compile.mjs";

const pageSource = fileURLToPath(new URL("./toast.page.jsx", import.meta.url));
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
  html = `<!doctype html><html lang="ms"><head><style>${css}</style></head><body class="bg-bg-white"><div id="root"></div><script>${script}</script></body></html>`;
  browser = await chromium.launch();
});
after(() => browser?.close());

// Opens the page and runs `use` on it once React has rendered it and
// AutoToast listens for toasts. Nothing logs an error or a warning.
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

// Fires a toast of `variant` titled `title`, waits until its announcement
// holds its text, and returns each `status` node in Chromium's accessibility
// tree: the text its children hold, and its `live`. The tree is read at
// once, as Radix removes the announcement a second after it mounts.
async function fireAndReadAnnouncements(page, variant, title) {
  const client = await page.context().newCDPSession(page);
  try {
    await page.evaluate((event) => window.fire(event.variant, event.title), {
      variant,
      title,
    });
    await page.waitForFunction(
      (text) =>
        [...document.querySelectorAll('[role="status"]')].some(
          (status) => status.textContent === text,
        ),
      `Notification ${title}`,
    );
    const { nodes } = await client.send("Accessibility.getFullAXTree");
    const byId = new Map(nodes.map((node) => [node.nodeId, node]));
    return nodes
      .filter((node) => !node.ignored && node.role?.value === "status")
      .map((node) => ({
        text: (node.childIds ?? [])
          .map((id) => byId.get(id)?.name?.value ?? "")
          .join(""),
        live: node.properties?.find((property) => property.name === "live")
          ?.value.value,
      }));
  } finally {
    await client.detach();
  }
}

test("an error toast's announcement is an assertive live region, which interrupts the screen reader", () =>
  withPage(async (page) => {
    const title = "Ralat: Borang tidak dihantar";
    assert.deepEqual(await fireAndReadAnnouncements(page, "error", title), [
      { text: `Notification ${title}`, live: "assertive" },
    ]);
  }));

test("a success toast's announcement is a polite live region, announced at the next pause", () =>
  withPage(async (page) => {
    const title = "Berjaya: Data disimpan";
    assert.deepEqual(await fireAndReadAnnouncements(page, "success", title), [
      { text: `Notification ${title}`, live: "polite" },
    ]);
  }));
