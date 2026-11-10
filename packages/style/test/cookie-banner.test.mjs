// CookieBanner in Chromium, with real mouse and keyboard input, on the
// compiled stylesheet. It's a page region, not a dialog (ADR-0009): the
// first click outside it reaches its target and leaves it open, and Tab and
// Shift+Tab leave it in DOM order. While it's shown, it pads the page's
// scroll area by its height and bottom offset, so tabbing through a phone's
// page never leaves a focused control entirely covered, even after Customise
// makes it taller. In landscape on a phone it fits the viewport and scrolls
// inside. Closing it doesn't scroll the page, and it slides out before it
// leaves the document. Its section takes focus when the keyboard opens it.
// Under forced colours the section draws an outline only while it holds
// focus (#159), and in normal colours it draws none, not even the browser's.
//
// The page is cookie-banner.page.jsx: the React components themselves,
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
  new URL("./cookie-banner.page.jsx", import.meta.url),
);
// The page imports React and the components' dependencies from where the
// components resolve them, so the bundle has one copy of React
const reactModules = fileURLToPath(
  new URL("../../react/node_modules", import.meta.url),
);

const phone = { width: 375, height: 667 };
const landscape = { width: 667, height: 375 };
const desktop = { width: 1024, height: 768 };

// Where the page is served, so it opens as a visitor's browser opens it.
// `setContent` writes the page during a user gesture, which the banner takes
// for a visitor action, so it takes focus as it opens on the page's load.
const pageUrl = "http://cookie-banner.test/";

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

// Opens the page at `viewport` and runs `use` on it, once React has rendered
// it and the banner is open. With `animate`, the banner's animations run.
// `forcedColors` is Playwright's option, "active" for forced colours.
// Nothing logs an error or a warning.
async function withPage(
  viewport,
  use,
  { animate = false, forcedColors = "none" } = {},
) {
  // Reduced motion, so the page's smooth scrolling doesn't delay a scroll
  const context = await browser.newContext({
    viewport,
    reducedMotion: "reduce",
    forcedColors,
  });
  try {
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (["error", "warning"].includes(message.type()))
        errors.push(message.text());
    });
    await page.route(pageUrl, (route) =>
      route.fulfill({
        contentType: "text/html; charset=utf-8",
        body: `<!doctype html><html><head><style>${css}</style>${animate ? "" : `<style>${still}</style>`}</head><body class="bg-bg-white"><div id="root"></div><script>${script}</script></body></html>`,
      }),
    );
    await page.goto(pageUrl);
    await page.waitForFunction(
      () =>
        window.ready.length === 1 &&
        document.querySelector("section")?.dataset.state === "open",
    );
    const result = await use(page);
    assert.deepEqual(errors, []);
    return result;
  } finally {
    await context.close();
  }
}

// Waits for two frames, so a ResizeObserver has called back
const frames = (page) =>
  page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );

// What has focus: its id, or the text of a button without one
const focused = (page) =>
  page.evaluate(() => {
    const element = document.activeElement;
    return element.id || element.textContent.trim() || element.tagName;
  });

// The banner's state: whether it's in the document, its `data-state`, and
// the open changes it reported
const bannerState = (page) =>
  page.evaluate(() => ({
    inDocument: !!document.querySelector("section"),
    state: document.querySelector("section")?.dataset.state,
    openChanges: window.openChanges,
  }));

// Runs in the page: the banner's rendered height plus its bottom offset, and
// the padding it set on `<html>`'s scroll area and on `<body>`
function readPadding() {
  const banner = document.querySelector("section").getBoundingClientRect();
  return {
    needed: banner.height + (window.innerHeight - banner.bottom),
    scrollPadding: parseFloat(
      getComputedStyle(document.documentElement).scrollPaddingBottom,
    ),
    bodyPadding: parseFloat(getComputedStyle(document.body).paddingBottom),
  };
}

// Whether the padding covers the banner
const covers = ({ needed, scrollPadding, bodyPadding }) =>
  scrollPadding >= needed && bodyPadding >= needed && needed > 0;

test("the first click outside the banner reaches its target, and the banner stays open", () =>
  withPage(desktop, async (page) => {
    await page.click("#control-0");
    assert.deepEqual(await page.evaluate(() => window.clicks), ["control-0"]);
    assert.deepEqual(await bannerState(page), {
      inDocument: true,
      state: "open",
      openChanges: [],
    });
  }));

test("Tab from the banner's last control moves to the next element on the page, and Shift+Tab from its first to the element before it", () =>
  withPage(desktop, async (page) => {
    // The default view's last control is Customise; the Customise view's
    // row is hidden
    await page.getByRole("button", { name: "Customise" }).focus();
    await page.keyboard.press("Tab");
    const afterLast = await focused(page);
    // Its first is the close cross
    await page.getByRole("button", { name: "Close" }).focus();
    await page.keyboard.press("Shift+Tab");
    const beforeFirst = await focused(page);
    // And Tab from the element before it enters it at the cross
    await page.keyboard.press("Tab");
    const entering = await page.evaluate(() =>
      document.activeElement.getAttribute("aria-label"),
    );
    assert.deepEqual(
      { afterLast, beforeFirst, entering },
      { afterLast: "skip", beforeFirst: "before", entering: "Close" },
    );
  }));

test("on a phone, tabbing through the page never leaves a focused control entirely covered by the banner", () =>
  withPage(phone, async (page) => {
    await page.focus("#settings");
    const covered = [];
    const visited = [];
    for (let presses = 0; presses < 40; presses++) {
      await page.keyboard.press("Tab");
      const { id, hidden } = await page.evaluate(() => {
        const element = document.activeElement;
        const banner = document.querySelector("section");
        const box = element.getBoundingClientRect();
        const over = banner.getBoundingClientRect();
        return {
          id: element.id,
          hidden:
            !banner.contains(element) &&
            box.top >= over.top &&
            box.bottom <= over.bottom &&
            box.left >= over.left &&
            box.right <= over.right,
        };
      });
      if (!id.startsWith("control-")) break;
      visited.push(id);
      if (hidden) covered.push(id);
    }
    assert.equal(visited.length, 24);
    assert.deepEqual(covered, []);
  }));

test("on a phone, the page's scroll padding and `<body>`'s padding are at least the banner's height plus its bottom offset, before and after Customise makes it taller", () =>
  withPage(phone, async (page) => {
    const before = await page.evaluate(readPadding);
    await page.getByRole("button", { name: "Customise" }).click();
    await frames(page);
    const afterCustomise = await page.evaluate(readPadding);
    assert.ok(afterCustomise.needed > before.needed, "Customise is taller");
    assert.ok(covers(before), JSON.stringify(before));
    assert.ok(covers(afterCustomise), JSON.stringify(afterCustomise));
  }));

test("in landscape on a phone, the banner fits the viewport and its content scrolls inside it", () =>
  withPage(landscape, async (page) => {
    await page.getByRole("button", { name: "Customise" }).click();
    await frames(page);
    const banner = await page.evaluate(() => {
      const section = document.querySelector("section");
      const { top, bottom } = section.getBoundingClientRect();
      section.scrollTop = 100;
      return {
        fits: top >= 0 && bottom <= window.innerHeight,
        overflows: section.scrollHeight > section.clientHeight,
        scrolled: section.scrollTop > 0,
      };
    });
    assert.deepEqual(banner, { fits: true, overflows: true, scrolled: true });
  }));

test("after the page is scrolled down, clicking Accept all closes the banner without scrolling the page", () =>
  withPage(desktop, async (page) => {
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.getByRole("button", { name: "Accept all" }).click();
    await page.waitForFunction(() => !document.querySelector("section"));
    assert.deepEqual(
      await page.evaluate(() => ({
        scrollY: window.scrollY,
        // With nothing to return to, focus goes to SkipLink, after it
        focused: document.activeElement.id,
        openChanges: window.openChanges,
      })),
      { scrollY: 400, focused: "skip", openChanges: [false] },
    );
  }));

test("a close control leaves the banner in the document with `data-state=\"closed\"` until its exit animation ends", () =>
  withPage(
    desktop,
    async (page) => {
      // Once it has slid in
      await page.waitForFunction(() =>
        document
          .querySelector("section")
          .getAnimations()
          .every((animation) => animation.playState === "finished"),
      );
      await page.getByRole("button", { name: "Reject all" }).click();
      const closing = await page.evaluate(() => {
        const section = document.querySelector("section");
        return {
          state: section?.dataset.state,
          animating: section
            ?.getAnimations()
            .some((animation) => animation.playState === "running"),
        };
      });
      await page.waitForFunction(() => !document.querySelector("section"), {
        timeout: 2000,
      });
      assert.deepEqual(closing, { state: "closed", animating: true });
    },
    { animate: true },
  ));

// Runs in the page: whether the banner's section has focus, and the outline
// it draws, as "<style> <width>", or "none" when it draws none: when its
// computed outline-style is `none` or its outline-width 0
function readSection() {
  const section = document.querySelector("section");
  const { outlineStyle, outlineWidth } = getComputedStyle(section);
  return {
    focused: document.activeElement === section,
    outline:
      outlineStyle === "none" || parseFloat(outlineWidth) === 0
        ? "none"
        : `${outlineStyle} ${outlineWidth}`,
  };
}

// The banner's section as it opens on the page's load, which doesn't move
// focus; as it opens again from the keyboard, Enter on the page's Cookie
// settings button after Enter on Accept all closed it, which moves focus to
// it; and after Tab moves focus on to its close cross
async function readSectionStates(page) {
  const states = { "opened on load": await page.evaluate(readSection) };
  await page.getByRole("button", { name: "Accept all" }).press("Enter");
  await page.waitForFunction(() => !document.querySelector("section"));
  await page.focus("#settings");
  await page.keyboard.press("Enter");
  await page.waitForSelector("section[data-state=open]");
  states["opened by keyboard"] = await page.evaluate(readSection);
  await page.keyboard.press("Tab");
  states["after Tab"] = await page.evaluate(readSection);
  return states;
}

test("under forced colours, the banner's section draws no outline while focus is elsewhere, and a 2px one while it holds focus after the keyboard opened the banner", () =>
  withPage(
    desktop,
    async (page) => {
      assert.deepEqual(await readSectionStates(page), {
        "opened on load": { focused: false, outline: "none" },
        "opened by keyboard": { focused: true, outline: "solid 2px" },
        "after Tab": { focused: false, outline: "none" },
      });
    },
    { forcedColors: "active" },
  ));

test("in normal colours, the banner's section draws no outline, even while it holds focus after the keyboard opened the banner", () =>
  withPage(desktop, async (page) => {
    assert.deepEqual(await readSectionStates(page), {
      "opened on load": { focused: false, outline: "none" },
      "opened by keyboard": { focused: true, outline: "none" },
      "after Tab": { focused: false, outline: "none" },
    });
  }));
