// The Masthead as a page region, in the page frame, in Chromium (#218). The
// Masthead isn't a landmark on its own: it renders a plain `<div>`. Given
// `role="region"` and `aria-labelledby` pointing at its MastheadTitle's `id`,
// the element Masthead's ref gets is a region named by the title's own text,
// in English and in Malay, and the title sits in that landmark. axe-core
// (4.10.2, the lockfile's version), run over the whole document, then flags no
// `region` node ("All page content should be contained by landmarks") inside
// the Masthead. This holds with the Masthead closed and open, at 375px and at
// 1280px. The recipe relies on Masthead passing `role` and `aria-labelledby`
// through to that element, which this test guards.
//
// The page is masthead-region.page.jsx: the React components themselves,
// bundled with esbuild, on the stylesheet the Tailwind import compiles for
// full.css's sources.
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";
import { chromium } from "playwright";

import { registryDefine } from "../../react/registry-define.mjs";
import { compile, fullCssSources } from "./compile.mjs";

const pageSource = fileURLToPath(
  new URL("./masthead-region.page.jsx", import.meta.url),
);
// The page imports React and the components' dependencies from where the
// components resolve them, so the bundle has one copy of React
const reactModules = fileURLToPath(
  new URL("../../react/node_modules", import.meta.url),
);
const axeSource = fs.readFileSync(
  createRequire(import.meta.url).resolve("axe-core/axe.min.js"),
  "utf8",
);

const pageUrl = "http://masthead-region.test/";
// Each language's MastheadTitle, as the develop docs' example has it
const titles = {
  en: "Official Malaysian Government Website",
  ms: "Portal Rasmi Kerajaan Malaysia",
};

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

// Transitions and animations off, so each state reads as it ends
const still =
  "*,::before,::after{transition:none!important;animation:none!important}";

// Opens the page `width` pixels wide in `lang`, and runs `use` on it once
// React has rendered it. Nothing logs an error or a warning.
async function withPage(width, lang, use) {
  const context = await browser.newContext({
    viewport: { width, height: 800 },
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
        body: `<!doctype html><html lang="${lang}"><head><title>Masthead</title><style>${css}</style><style>${still}</style></head><body class="bg-bg-white"><div id="root"></div><script>${script}</script></body></html>`,
      }),
    );
    await page.goto(`${pageUrl}?${new URLSearchParams({ lang })}`);
    await page.waitForFunction(() => window.ready.length === 1);
    const result = await use(page);
    assert.deepEqual(errors, []);
    return result;
  } finally {
    await context.close();
  }
}

// The roles Chromium's accessibility tree gives landmarks
const landmarks = new Set([
  "banner",
  "complementary",
  "contentinfo",
  "form",
  "main",
  "navigation",
  "region",
  "search",
]);

// From Chromium's accessibility tree: the role and name of the element
// Masthead's ref gets, and the landmark nearest the MastheadTitle, with
// whether it is that element
async function tree(page) {
  const client = await page.context().newCDPSession(page);
  try {
    const backendId = async (expression) => {
      const {
        result: { objectId },
      } = await client.send("Runtime.evaluate", { expression });
      const { node } = await client.send("DOM.describeNode", { objectId });
      return node.backendNodeId;
    };
    await client.send("DOM.enable");
    const masthead = await backendId("window.masthead");
    const title = await backendId(
      'document.querySelector("[data-test=title]")',
    );
    const { nodes } = await client.send("Accessibility.getFullAXTree");
    const byId = new Map(nodes.map((node) => [node.nodeId, node]));
    const describe = (node) =>
      node && { role: node.role?.value, name: node.name?.value };
    // Up from the title, to the first landmark
    let node = nodes.find((n) => n.backendDOMNodeId === title);
    while (node && !landmarks.has(node.role?.value))
      node = byId.get(node.parentId);
    return {
      masthead: describe(nodes.find((n) => n.backendDOMNodeId === masthead)),
      titleLandmark: node && {
        ...describe(node),
        isMasthead: node.backendDOMNodeId === masthead,
      },
    };
  } finally {
    await client.detach();
  }
}

// Runs axe-core over the whole document: the nodes its `region` rule flags
// inside the Masthead, from the collapsible around the element its ref gets
// down, and every other rule it finds violated and where
async function axe(page) {
  if (!(await page.evaluate(() => "axe" in window)))
    await page.addScriptTag({ content: axeSource });
  return page.evaluate(async () => {
    const { violations } = await window.axe.run(document);
    const root = window.masthead.parentElement;
    const region = violations.find(({ id }) => id === "region");
    return {
      version: window.axe.version,
      inMasthead: (region?.nodes ?? [])
        .map(({ target }) => target.join(" "))
        .filter((target) => root.contains(document.querySelector(target))),
      others: violations
        .filter(({ id }) => id !== "region")
        .map(
          ({ id, nodes }) =>
            `${id} (${nodes.map(({ target }) => target.join(" ")).join(", ")})`,
        ),
    };
  });
}

// What the test checks in each state
async function read(page, t, where) {
  const { version, inMasthead, others } = await axe(page);
  assert.equal(version, "4.10.2");
  if (others.length)
    t.diagnostic(`${where}: other axe violations: ${others.join("; ")}`);
  return { ...(await tree(page)), regionNodesInMasthead: inMasthead };
}

for (const lang of ["en", "ms"]) {
  for (const width of [375, 1280]) {
    test(`in ${lang === "en" ? "English" : "Malay"} at ${width}px, closed and open, the Masthead is a region named by its title, which sits in it, and axe flags no region node inside it`, (t) =>
      withPage(width, lang, async (page) => {
        const closed = await read(page, t, "closed");
        await page.click("[data-test=trigger]");
        await page.waitForSelector('[data-test=trigger][aria-expanded="true"]');
        const open = await read(page, t, "open");
        const expected = {
          masthead: { role: "region", name: titles[lang] },
          titleLandmark: {
            role: "region",
            name: titles[lang],
            isMasthead: true,
          },
          regionNodesInMasthead: [],
        };
        assert.deepEqual(
          { closed, open },
          { closed: expected, open: expected },
        );
      }));
  }
}
