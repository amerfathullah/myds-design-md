// Both entries, rendered in Chromium. An in-page link, such as the SkipLink,
// lands its target 65px from the top, clear of a sticky 64px header. The page
// scrolls there smoothly, unless the user asks for reduced motion. Focus that
// isn't `:focus-visible`, as after a mouse click, shows no outline, even one
// an outline-width utility such as `focus:outline-[3px]` draws, while
// keyboard focus shows it. An underlined link keeps the `decoration-*`
// utilities on it, the `decoration-inherit` Link uses included. And the theme
// files set the browser's `color-scheme`, so it draws scrollbars and form
// controls to match: the page computes `light`, and `.dark`, on <html> or on
// a subtree, computes `dark`. They set it in `@layer base`, so a `scheme-*`
// utility, an inline style or an app's own unlayered rule wins over it.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { chromium } from "playwright";

import { compile, compileFull } from "./compile.mjs";

const outlineClasses =
  "focus:outline-primary-600/20 focus:outline-[3px] focus:outline-offset-0";
const classes = `@source inline("${outlineClasses} underline decoration-inherit decoration-wavy decoration-3 scheme-light scheme-light-dark");`;
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
      <button id="outlined" class="${outlineClasses}">Outlined</button>
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

// A page whose <html> has the `html` attributes and holds `body`, with an
// app's own unlayered `rule` in a stylesheet after the entry's
const schemePage = (
  css,
  { html = "", body = "", rule = "" },
) => `<!doctype html>
<html ${html}>
  <head><style>${css}</style><style>${rule}</style></head>
  <body>${body}</body>
</html>`;

// The `color-scheme` that <html>, and #subtree where the page has one,
// compute on each page: `cases` is a list of [name, page, expected]
async function colorSchemes(entry, cases) {
  const context = await browser.newContext();
  try {
    const tab = await context.newPage();
    const found = {};
    for (const [name, markup] of cases) {
      await tab.setContent(schemePage(stylesheets[entry], markup));
      found[name] = await tab.evaluate(() => {
        const scheme = (element) => getComputedStyle(element).colorScheme;
        const subtree = document.getElementById("subtree");
        return {
          html: scheme(document.documentElement),
          ...(subtree && { subtree: scheme(subtree) }),
        };
      });
    }
    return found;
  } finally {
    await context.close();
  }
}

const expected = (cases) =>
  Object.fromEntries(cases.map(([name, , schemes]) => [name, schemes]));

const themeSchemes = [
  ["a light page", {}, { html: "light" }],
  ['<html class="dark">', { html: 'class="dark"' }, { html: "dark" }],
  [
    "a .dark subtree on a light page",
    { body: '<div id="subtree" class="dark"></div>' },
    { html: "light", subtree: "dark" },
  ],
];

const overrides = [
  [
    '<html class="scheme-light-dark">',
    { html: 'class="scheme-light-dark"' },
    { html: "light dark" },
  ],
  [
    '<html class="dark scheme-light">',
    { html: 'class="dark scheme-light"' },
    { html: "light" },
  ],
  [
    "a .dark scheme-light subtree on a light page",
    { body: '<div id="subtree" class="dark scheme-light"></div>' },
    { html: "light", subtree: "light" },
  ],
  [
    '<html class="dark" style="color-scheme: light">',
    { html: 'class="dark" style="color-scheme: light"' },
    { html: "light" },
  ],
  [
    '<html class="dark">, with an app\'s unlayered html rule after MYDS',
    { html: 'class="dark"', rule: "html { color-scheme: light dark }" },
    { html: "light dark" },
  ],
];

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
        tab.$eval("#outlined", (button) => {
          const { outlineStyle, outlineWidth } = getComputedStyle(button);
          return `${outlineStyle} ${outlineWidth}`;
        });
      await tab.click("#outlined");
      assert.equal(await focused(), "outlined");
      assert.match(await outline(), /^none /);
      await tab.keyboard.press("Shift+Tab");
      await tab.keyboard.press("Tab");
      assert.equal(await focused(), "outlined");
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

  test(`${entry}: a light page computes color-scheme light, and .dark, on <html> or a subtree, computes dark`, async () => {
    assert.deepEqual(
      await colorSchemes(entry, themeSchemes),
      expected(themeSchemes),
    );
  });

  test(`${entry}: a scheme-* utility, an inline style or an app's own unlayered rule wins over the theme's color-scheme`, async () => {
    assert.deepEqual(await colorSchemes(entry, overrides), expected(overrides));
  });
}
