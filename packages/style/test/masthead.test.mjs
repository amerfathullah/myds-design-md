// MastheadTrigger in Chromium, on the compiled stylesheet (#177). The text
// it shows names it, at every width, as WCAG 2.5.3 (Label in Name) asks.
// Below `sm:` (640px) that text is visually hidden but stays in the
// accessibility tree, so the trigger still shows only its chevron, 24×24,
// and the page doesn't scroll sideways. From `sm:` up the text shows on one
// line, even when a long MastheadTitle leaves it little room: the title
// truncates, and the trigger and the strip keep their heights, 28px and
// 36px. An `aria-label` renames the trigger, and opening the masthead
// changes its `aria-expanded`, not its name.
//
// The page is masthead.page.jsx: the React components themselves, bundled
// with esbuild, on the stylesheet the Tailwind import compiles for full.css's
// sources.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";
import { chromium } from "playwright";

import { registryDefine } from "../../react/registry-define.mjs";
import { compile, fullCssSources } from "./compile.mjs";

const pageSource = fileURLToPath(
  new URL("./masthead.page.jsx", import.meta.url),
);
// The page imports React and the components' dependencies from where the
// components resolve them, so the bundle has one copy of React
const reactModules = fileURLToPath(
  new URL("../../react/node_modules", import.meta.url),
);

const pageUrl = "http://masthead.test/";
const text = "Kenal pasti begini";
// A title too long for the strip at 640px and 700px, beside the trigger's
// text
const longTitle =
  "Portal Rasmi Kerajaan Malaysia, Kementerian Digital dan Jabatan Digital Negara";

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

// Opens the page `width` pixels wide, with `title` as MastheadTitle's text
// and `label` as the trigger's `aria-label` when they're given, and runs
// `use` on it once React has rendered it. Nothing logs an error or a
// warning.
async function withPage(width, use, { title, label } = {}) {
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
        body: `<!doctype html><html><head><style>${css}</style><style>${still}</style></head><body class="bg-bg-white"><div id="root"></div><script>${script}</script></body></html>`,
      }),
    );
    const query = new URLSearchParams();
    if (title !== undefined) query.set("title", title);
    if (label !== undefined) query.set("label", label);
    await page.goto(`${pageUrl}?${query}`);
    await page.waitForFunction(() => window.ready.length === 1);
    const result = await use(page);
    assert.deepEqual(errors, []);
    return result;
  } finally {
    await context.close();
  }
}

const trigger = "[data-test=trigger]";

// The role and name Chromium's accessibility tree gives the trigger
async function treeNode(page) {
  const client = await page.context().newCDPSession(page);
  try {
    const {
      result: { objectId },
    } = await client.send("Runtime.evaluate", {
      expression: `document.querySelector(${JSON.stringify(trigger)})`,
    });
    const {
      nodes: [node],
    } = await client.send("Accessibility.getPartialAXTree", {
      objectId,
      fetchRelatives: false,
    });
    return { role: node.role?.value, name: node.name?.value };
  } finally {
    await client.detach();
  }
}

// Runs in the page: the trigger's size; whether its text shows, and on how
// many lines; the strip's height; whether the title is cut short; and
// whether the page scrolls sideways
function readMasthead() {
  const button = document.querySelector("[data-test=trigger]");
  const label = button.querySelector("span");
  const title = document.querySelector("[data-test=title]");
  const strip = title.parentElement.parentElement;
  const box = (element) => {
    const { width, height } = element.getBoundingClientRect();
    return { width: Math.round(width), height: Math.round(height) };
  };
  const labelBox = label.getBoundingClientRect();
  const labelStyle = getComputedStyle(label);
  // The text's line boxes, by where each starts
  const range = document.createRange();
  range.selectNodeContents(label);
  const lines = new Set(
    [...range.getClientRects()].map(({ top }) => Math.round(top)),
  ).size;
  return {
    trigger: box(button),
    // Laid out bigger than a pixel, and not clipped away
    textShows:
      labelStyle.display !== "none" &&
      labelBox.width > 1 &&
      labelBox.height > 1 &&
      labelStyle.clipPath === "none" &&
      labelStyle.clip === "auto",
    lines,
    strip: box(strip).height,
    titleTruncates:
      title.scrollWidth > title.clientWidth &&
      getComputedStyle(title).textOverflow === "ellipsis",
    scrollsSideways: document.documentElement.scrollWidth > window.innerWidth,
  };
}
const read = (page) => page.evaluate(readMasthead);

for (const width of [375, 390]) {
  test(`at ${width}px, the trigger shows only its chevron, 24×24, and its hidden text names it`, () =>
    withPage(width, async (page) => {
      assert.deepEqual(await treeNode(page), { role: "button", name: text });
      const { trigger, textShows, scrollsSideways } = await read(page);
      assert.deepEqual(
        { trigger, textShows, scrollsSideways },
        {
          trigger: { width: 24, height: 24 },
          textShows: false,
          scrollsSideways: false,
        },
      );
    }));
}

test('an `aria-label` renames the trigger, "Tunjuk cara" here, below `sm:` and from `sm:` up', async () => {
  for (const width of [390, 1280]) {
    assert.deepEqual(
      await withPage(width, treeNode, { label: "Tunjuk cara" }),
      { role: "button", name: "Tunjuk cara" },
      `at ${width}px`,
    );
  }
});

test("opening and closing the masthead changes the trigger's `aria-expanded`, not its name", () =>
  withPage(390, async (page) => {
    const state = async () => ({
      ...(await treeNode(page)),
      expanded: await page.getAttribute(trigger, "aria-expanded"),
    });
    const closed = await state();
    await page.click(trigger);
    const open = await state();
    await page.click(trigger);
    assert.deepEqual(
      [closed, open, await state()],
      [
        { role: "button", name: text, expanded: "false" },
        { role: "button", name: text, expanded: "true" },
        { role: "button", name: text, expanded: "false" },
      ],
    );
  }));

for (const width of [640, 700]) {
  test(`at ${width}px, with a long title, the trigger's text shows on one line, the trigger and the strip keep their heights, and the title truncates`, () =>
    withPage(
      width,
      async (page) => {
        assert.deepEqual(await treeNode(page), { role: "button", name: text });
        const { trigger, textShows, lines, strip, titleTruncates } =
          await read(page);
        assert.deepEqual(
          {
            triggerHeight: trigger.height,
            textShows,
            lines,
            strip,
            titleTruncates,
          },
          {
            triggerHeight: 28,
            textShows: true,
            lines: 1,
            strip: 36,
            titleTruncates: true,
          },
        );
      },
      { title: longTitle },
    ));
}

test("at 1280px, the trigger's text shows on one line and names it, in a 28px trigger on a 36px strip", () =>
  withPage(1280, async (page) => {
    assert.deepEqual(await treeNode(page), { role: "button", name: text });
    const { trigger, textShows, lines, strip, titleTruncates } =
      await read(page);
    assert.deepEqual(
      {
        triggerHeight: trigger.height,
        textShows,
        lines,
        strip,
        titleTruncates,
      },
      {
        triggerHeight: 28,
        textShows: true,
        lines: 1,
        strip: 36,
        titleTruncates: false,
      },
    );
  }));
