// Both entries, rendered in Chromium. An in-page link, such as the SkipLink,
// lands its target 65px from the top, clear of a sticky 64px header. The page
// scrolls there smoothly, unless the user asks for reduced motion. A mouse
// click shows no outline, even one the author sets with `focus:outline-*`,
// while keyboard focus does. And an underlined link keeps the `decoration-*`
// utilities on it, the `decoration-inherit` Link uses included.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { chromium } from "playwright";

import { compile, compileFull } from "./compile.mjs";

// TableCell's outline, and the underlines
const cell =
  "focus:outline-primary-600/20 focus:outline-[3px] focus:outline-offset-0";
const classes = `@source inline("${cell} underline decoration-inherit decoration-wavy decoration-3");`;
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
      <button id="cell" class="${cell}">Cell</button>
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

async function open(entry, reducedMotion) {
  const context = await browser.newContext({ reducedMotion });
  const tab = await context.newPage();
  await tab.setContent(page(stylesheets[entry]));
  return tab;
}

// Waits until the page has scrolled and then stopped for 10 frames
function settled() {
  return new Promise((resolve) => {
    let last = window.scrollY;
    let still = 0;
    const frame = () => {
      still = window.scrollY > 0 && window.scrollY === last ? still + 1 : 0;
      last = window.scrollY;
      if (still >= 10) resolve();
      else requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });
}

for (const entry of Object.keys(entries)) {
  for (const reducedMotion of ["no-preference", "reduce"]) {
    test(`${entry}, ${reducedMotion} motion: following #main lands it 65px from the top, clear of a sticky 64px header`, async () => {
      const tab = await open(entry, reducedMotion);
      try {
        await tab.keyboard.press("Tab");
        await tab.keyboard.press("Enter");
        await tab.evaluate(settled);
        const top = await tab.$eval("#main", (main) =>
          Math.round(main.getBoundingClientRect().top),
        );
        assert.equal(top, 65);
      } finally {
        await tab.context().close();
      }
    });
  }

  test(`${entry}: html scrolls smoothly, and not under reduced motion`, async () => {
    const behaviour = {};
    for (const reducedMotion of ["no-preference", "reduce"]) {
      const tab = await open(entry, reducedMotion);
      behaviour[reducedMotion] = await tab.evaluate(
        () => getComputedStyle(document.documentElement).scrollBehavior,
      );
      await tab.context().close();
    }
    assert.deepEqual(behaviour, { "no-preference": "smooth", reduce: "auto" });
  });

  test(`${entry}: a mouse click shows no outline, and keyboard focus shows the author's`, async () => {
    const tab = await open(entry, "no-preference");
    try {
      const outline = () =>
        tab.$eval("#cell", (cell) => {
          const { outlineStyle, outlineWidth } = getComputedStyle(cell);
          return `${outlineStyle} ${outlineWidth}`;
        });
      await tab.click("#cell");
      assert.equal(await tab.evaluate(() => document.activeElement.id), "cell");
      assert.match(await outline(), /^none /);
      await tab.keyboard.press("Shift+Tab");
      await tab.keyboard.press("Tab");
      assert.equal(await tab.evaluate(() => document.activeElement.id), "cell");
      assert.equal(await outline(), "solid 3px");
    } finally {
      await tab.context().close();
    }
  });

  test(`${entry}: an underlined link keeps its decoration-* utilities and sets its line from the font`, async () => {
    const tab = await open(entry, "no-preference");
    try {
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
    } finally {
      await tab.context().close();
    }
  });
}
