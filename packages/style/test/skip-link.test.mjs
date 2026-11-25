// SkipLink in Chromium, in the page frame, with real keyboard and mouse input,
// on the compiled stylesheet and with the page's own transitions (#220). The
// design guideline shows the skip link "in a fixed position at the top left of
// the screen", appearing "(instantly)". So SkipLink is fixed to the window,
// 16px from its left and 44px from its top: on a scrolled page, Tab shows it
// without scrolling back to the top, above the sticky Navbar. Its opacity is 1
// in the first frame it has focus and 0 in the first frame after it loses it,
// with or without reduced motion, and hovering it still fades its background
// colour. When a CookieBanner closes on a scrolled page, it moves focus to the
// skip link without scrolling, and the link shows inside the window. A focused
// skip link isn't printed.
//
// The page is skip-link.page.jsx: the React components themselves, bundled
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
  new URL("./skip-link.page.jsx", import.meta.url),
);
// The page imports React and the components' dependencies from where the
// components resolve them, so the bundle has one copy of React
const reactModules = fileURLToPath(
  new URL("../../react/node_modules", import.meta.url),
);

const desktop = { width: 1280, height: 800 };
const phone = { width: 375, height: 667 };
const viewports = [
  ["1280×800", desktop],
  ["375×667", phone],
];

const pageUrl = "http://skip-link.test/";

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

// Opens the page at `viewport` and runs `use` on it once React has rendered
// it, with the page's own transitions and animations. With `banner`, a
// CookieBanner comes first, and `use` runs once it's open. `reducedMotion` is
// Playwright's option. Nothing logs an error or a warning.
async function withPage(
  viewport,
  use,
  { banner = false, reducedMotion = "no-preference" } = {},
) {
  const context = await browser.newContext({ viewport, reducedMotion });
  try {
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (["error", "warning"].includes(message.type()))
        errors.push(message.text());
    });
    const url = banner ? `${pageUrl}?banner` : pageUrl;
    await page.route(url, (route) =>
      route.fulfill({
        contentType: "text/html; charset=utf-8",
        body: `<!doctype html><html lang="en"><head><title>Skip link</title><style>${css}</style></head><body class="bg-bg-white"><div id="root"></div><script>${script}</script></body></html>`,
      }),
    );
    await page.goto(url);
    await page.waitForFunction(
      (banner) =>
        window.ready.length === 1 &&
        (!banner ||
          document.querySelector("section")?.dataset.state === "open"),
      banner,
    );
    const result = await use(page);
    assert.deepEqual(errors, []);
    return result;
  } finally {
    await context.close();
  }
}

// Waits for two frames, so whatever a key press starts has had a frame to run
const frames = (page) =>
  page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );

// Scrolls the page to `top` at once, not smoothly as the page's
// `scroll-behavior` would
const scrollTo = (page, top) =>
  page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), top);

// Runs in the page: the page's scroll position, whether the skip link has
// focus, its box's offsets from the window's left and top edges, whether the
// whole box is inside the window, and whether the element at its centre is
// the link itself
function readLink() {
  const link = document.querySelector("[data-test=skip]");
  const box = link.getBoundingClientRect();
  const round = (value) => Math.round(value * 100) / 100;
  return {
    scrollY: window.scrollY,
    focused: document.activeElement === link,
    left: round(box.left),
    top: round(box.top),
    inWindow:
      box.left >= 0 &&
      box.top >= 0 &&
      box.right <= document.documentElement.clientWidth &&
      box.bottom <= window.innerHeight,
    atCentre:
      document.elementFromPoint(
        box.left + box.width / 2,
        box.top + box.height / 2,
      ) === link,
  };
}

for (const [label, viewport] of viewports) {
  test(`at ${label}, on a page scrolled to 1500px, Tab focuses the skip link without scrolling the page, 16px from the window's left and 44px from its top, with nothing over it`, () =>
    withPage(viewport, async (page) => {
      await scrollTo(page, 1500);
      await page.keyboard.press("Tab");
      await frames(page);
      assert.deepEqual(await page.evaluate(readLink), {
        scrollY: 1500,
        focused: true,
        left: 16,
        top: 44,
        inWindow: true,
        atCentre: true,
      });
    }));
}

for (const reducedMotion of ["no-preference", "reduce"]) {
  test(`with reduced motion ${reducedMotion === "reduce" ? "on" : "off"}, the skip link's opacity is 1 in the first frame after Tab focuses it, and 0 in the first frame after Tab moves focus on`, () =>
    withPage(
      desktop,
      async (page) => {
        // Each focus change reads the link's opacity in the next frame
        await page.evaluate(() => {
          const link = document.querySelector("[data-test=skip]");
          window.opacities = [];
          for (const type of ["focus", "blur"])
            link.addEventListener(type, () =>
              requestAnimationFrame(() =>
                window.opacities.push([type, getComputedStyle(link).opacity]),
              ),
            );
        });
        await page.keyboard.press("Tab");
        // Once anything the focus started has ended, so a fade in would have
        // reached 1 before the link loses focus
        await page.waitForFunction(() =>
          document
            .querySelector("[data-test=skip]")
            .getAnimations()
            .every(({ playState }) => playState === "finished"),
        );
        await page.keyboard.press("Tab");
        await frames(page);
        assert.deepEqual(await page.evaluate(() => window.opacities), [
          ["focus", "1"],
          ["blur", "0"],
        ]);
      },
      { reducedMotion },
    ));
}

test("hovering the focused skip link fades its background colour to its hover colour", () =>
  withPage(desktop, async (page) => {
    await page.keyboard.press("Tab");
    await frames(page);
    // The link's background colour before the hover, in the first frame
    // after the pointer moves over it, and once its transition ends
    const colours = page.evaluate(
      () =>
        new Promise((resolve, reject) => {
          const link = document.querySelector("[data-test=skip]");
          const colour = () => getComputedStyle(link).backgroundColor;
          const before = colour();
          let firstFrame;
          link.addEventListener("pointerover", () =>
            requestAnimationFrame(() => (firstFrame = colour())),
          );
          link.addEventListener("transitionend", ({ propertyName }) => {
            if (propertyName === "background-color")
              resolve({ before, firstFrame, end: colour() });
          });
          setTimeout(() => reject(new Error("No transition ended")), 2000);
        }),
    );
    await page.hover("[data-test=skip]");
    const { before, firstFrame, end } = await colours;
    assert.deepEqual(
      { changes: end !== before, fades: firstFrame !== end },
      { changes: true, fades: true },
    );
  }));

for (const [label, viewport] of viewports) {
  for (const [how, close] of [
    ["Enter on", (button) => button.press("Enter")],
    ["a click on", (button) => button.click()],
  ]) {
    test(`at ${label}, with a CookieBanner shown and the page scrolled to 400px, ${how} Accept all closes it and leaves focus on the skip link, inside the window`, () =>
      withPage(
        viewport,
        async (page) => {
          await scrollTo(page, 400);
          await close(page.getByRole("button", { name: "Accept all" }));
          await page.waitForFunction(() => !document.querySelector("section"));
          const { scrollY, focused, inWindow } = await page.evaluate(readLink);
          assert.deepEqual(
            { scrollY, focused, inWindow },
            { scrollY: 400, focused: true, inWindow: true },
          );
        },
        { banner: true },
      ));
  }
}

test("in print media, a focused skip link isn't displayed", () =>
  withPage(desktop, async (page) => {
    await page.keyboard.press("Tab");
    await page.emulateMedia({ media: "print" });
    assert.deepEqual(
      await page.evaluate(() => {
        const link = document.querySelector("[data-test=skip]");
        return {
          focused: document.activeElement === link,
          display: getComputedStyle(link).display,
        };
      }),
      { focused: true, display: "none" },
    );
  }));
