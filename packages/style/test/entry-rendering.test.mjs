// Both entries, rendered in Chromium. An in-page link, such as the SkipLink,
// lands its target 65px from the top, clear of a sticky 64px header. The page
// scrolls there smoothly, unless the user asks for reduced motion. Focus that
// isn't `:focus-visible`, as after a mouse click, shows no outline, even one
// an outline-width utility such as TableCell's `focus:outline-[3px]` draws,
// while keyboard focus shows it. And an underlined link keeps the
// `decoration-*` utilities on it, the `decoration-inherit` Link uses included.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { chromium } from "playwright";

import { compile, compileFull } from "./compile.mjs";

const tableCellOutline =
  "focus:outline-primary-600/20 focus:outline-[3px] focus:outline-offset-0";
const classes = `@source inline("${tableCellOutline} underline decoration-inherit decoration-wavy decoration-3");`;
const entries = {
  "the Tailwind import": () => compile(classes),
  "full.css": () => compileFull(classes),
};

const page = (css) => `<!doctype html>
<html>
  <head><style>${css}</style></head>
  <body style="margin: 0">
    <header style="position: sticky; top: 0; height: 64px; background: white">
      <a href="#main">Skip to main content</a>
    </header>
    <div style="height: 1500px"></div>
    <main id="main" tabindex="-1" style="height: 3000px">
      <p style="text-decoration: underline wavy 3px rgb(220, 38, 38)">
        Parent <a id="inherit" href="#" class="underline decoration-inherit">link</a>
      </p>
      <a id="own" href="#" class="underline decoration-wavy decoration-3">link</a>
      <button id="table-cell" class="${tableCellOutline}">Cell</button>
    </main>
  </body>
</html>`;

let browser;
const stylesheets = {};
before(async () => {
  browser = await chromium.launch();
  for (const [entry, css] of Object.entries(entries)) {
    stylesheets[entry] = await css();
  }
});
after(() => browser?.close());

// Opens the page on an entry in a context of its own, closed afterwards
async function withTab(entry, reducedMotion, use) {
  const context = await browser.newContext({ reducedMotion });
  try {
    const tab = await context.newPage();
    await tab.setContent(page(stylesheets[entry]));
    return await use(tab);
  } finally {
    await context.close();
  }
}

// Waits until the page has scrolled and then stopped for 10 frames, and
// fails if it hasn't within 5 seconds
function settled() {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    let last = window.scrollY;
    let still = 0;
    const frame = () => {
      still = window.scrollY > 0 && window.scrollY === last ? still + 1 : 0;
      last = window.scrollY;
      if (still >= 10) resolve();
      else if (performance.now() - start > 5000) {
        reject(new Error(`no settled scroll within 5s (at ${window.scrollY})`));
      } else requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
}

for (const entry of Object.keys(entries)) {
  for (const reducedMotion of ["no-preference", "reduce"]) {
    test(`${entry}, ${reducedMotion} motion: following #main lands it 65px from the top, clear of a sticky 64px header`, () =>
      withTab(entry, reducedMotion, async (tab) => {
        await tab.keyboard.press("Tab");
        await tab.keyboard.press("Enter");
        await tab.evaluate(settled);
        const top = await tab.$eval("#main", (main) =>
          Math.round(main.getBoundingClientRect().top),
        );
        assert.equal(top, 65);
      }));
  }

  test(`${entry}: html scrolls smoothly, and not under reduced motion`, async () => {
    const behaviour = {};
    for (const reducedMotion of ["no-preference", "reduce"]) {
      behaviour[reducedMotion] = await withTab(entry, reducedMotion, (tab) =>
        tab.evaluate(
          () => getComputedStyle(document.documentElement).scrollBehavior,
        ),
      );
    }
    assert.deepEqual(behaviour, { "no-preference": "smooth", reduce: "auto" });
  });

  test(`${entry}: a mouse click shows no outline, and keyboard focus shows the author's`, () =>
    withTab(entry, "no-preference", async (tab) => {
      const focused = () => tab.evaluate(() => document.activeElement.id);
      const outline = () =>
        tab.$eval("#table-cell", (cell) => {
          const { outlineStyle, outlineWidth } = getComputedStyle(cell);
          return `${outlineStyle} ${outlineWidth}`;
        });
      await tab.click("#table-cell");
      assert.equal(await focused(), "table-cell");
      assert.match(await outline(), /^none /);
      await tab.keyboard.press("Shift+Tab");
      await tab.keyboard.press("Tab");
      assert.equal(await focused(), "table-cell");
      assert.equal(await outline(), "solid 3px");
    }));

  test(`${entry}: an underlined link keeps its decoration-* utilities and sets its line from the font`, () =>
    withTab(entry, "no-preference", async (tab) => {
      const decoration = (id) =>
        tab.$eval(`#${id}`, (link) => {
          const style = getComputedStyle(link);
          return {
            line: style.textDecorationLine,
            style: style.textDecorationStyle,
            thickness: style.textDecorationThickness,
            color: style.textDecorationColor,
            position: style.textUnderlinePosition,
          };
        });
      // Preflight gives links `text-decoration: inherit`, so the link takes
      // the parent's wavy 3px decoration, and `decoration-inherit` its colour
      assert.deepEqual(await decoration("inherit"), {
        line: "underline",
        style: "wavy",
        thickness: "3px",
        color: "rgb(220, 38, 38)",
        position: "from-font",
      });
      const { line, style, thickness, position } = await decoration("own");
      assert.deepEqual(
        { line, style, thickness, position },
        {
          line: "underline",
          style: "wavy",
          thickness: "3px",
          position: "from-font",
        },
      );
    }));
}
