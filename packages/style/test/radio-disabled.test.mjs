// Radio's label and hint with a disabled radio button, in Chromium (#225). An
// option's RadioLabel is `txt-black-disabled` and its RadioHintText
// `otl-gray-300`, in both themes, exactly when its own radio button is
// `:disabled`, whatever disabled it: `disabled` on Radio, RadioItem or
// RadioButton, #357's `<Radio disabled>` with `<RadioItem disabled={false}>`,
// or a `<fieldset disabled>` (plain, `group`, nested in or around another,
// or disabled after mount, and the text comes back when it's enabled again),
// with the label and hint in RadioItem or in one wrapper, and over a colour
// class of their own. They never dim beside an enabled radio: with
// `disabled={false}` or `{undefined}` on RadioButton in a disabled RadioItem,
// beside disabled controls in a consumer's `group`, beside a disabled library
// Button, in the first `<legend>` of a disabled fieldset, around or inside a
// nested Radio whose own radios are disabled or enabled. happy-dom ignores a
// disabled fieldset and applies no CSS, so this needs a real browser.
//
// The hint is marked `aria-disabled` exactly when props disable its radio,
// unless its author passes `true` or `false`, and it dims only where axe-core
// exempts it from contrast: marked, or in a disabled fieldset. axe-core
// 4.10.2's color-contrast rule finds no violation in any fixture, in either
// theme, nor in the server HTML of a radio disabled by RadioButton alone,
// before and after hydration, which logs nothing and recovers from nothing.
// Every radio is `:disabled`, and reads in Chromium's accessibility tree, as
// on main. Nothing logs an error or a warning, even with two RadioButtons in
// one RadioItem.
//
// Each test checks either only cases #225 changes, and fails on main, or only
// cases it leaves as they were, and passes on main too.
//
// The page is radio-disabled.page.jsx: the React components themselves,
// bundled with esbuild, on the stylesheet the Tailwind import compiles for
// full.css's sources, and server-rendered in Node by radio-disabled.server.jsx.
// radio-disabled.cases.mjs lists its fixtures.
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { format } from "node:util";

import { build } from "esbuild";
import { chromium } from "playwright";

import { registryDefine } from "../../react/registry-define.mjs";
import { compile, fullCssSources } from "./compile.mjs";
import { colours } from "./field-looks.mjs";
import { fixtures, serverFixtures } from "./radio-disabled.cases.mjs";

const pageSource = fileURLToPath(
  new URL("./radio-disabled.page.jsx", import.meta.url),
);
const serverSource = fileURLToPath(
  new URL("./radio-disabled.server.jsx", import.meta.url),
);
// The page imports React, Radix and the components' other dependencies from
// where the components resolve them, so the bundle has one copy of each
const reactModules = fileURLToPath(
  new URL("../../react/node_modules", import.meta.url),
);

const axeSource = fs.readFileSync(
  createRequire(import.meta.url).resolve("axe-core/axe.min.js"),
  "utf8",
);

const bundling = {
  bundle: true,
  write: false,
  jsx: "automatic",
  nodePaths: [reactModules],
  // React's development build, so the test sees its warnings
  define: { ...registryDefine, "process.env.NODE_ENV": '"development"' },
  logLevel: "silent",
};

let browser;
let css;
let script;
let server;
before(async () => {
  const [page, serverBundle, compiled] = await Promise.all([
    build({
      ...bundling,
      entryPoints: [pageSource],
      format: "iife",
      globalName: "radioDisabled",
    }),
    build({
      ...bundling,
      entryPoints: [serverSource],
      platform: "node",
      format: "esm",
      // React DOM's server build requires Node's own modules
      banner: {
        js: `import { createRequire } from "node:module";\nconst require = createRequire(${JSON.stringify(import.meta.url)});`,
      },
    }),
    compile(`${fullCssSources()}\n@source "${pageSource}";`),
  ]);
  css = compiled;
  script = page.outputFiles[0].text.replaceAll("</script", "<\\/script");
  server = await import(
    `data:text/javascript;base64,${Buffer.from(serverBundle.outputFiles[0].text).toString("base64")}`
  );
  browser = await chromium.launch();
});
after(() => browser?.close());

// The page around `body`, with the bundle loaded and `run` run after it.
// Transitions and animations are off, so each state reads as it ends.
const pageHtml = (body, run) =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Radio</title><style>${css}</style><style>*,::before,::after{transition:none!important;animation:none!important}</style></head><body class="bg-bg-white"><div id="root">${body}</div><script>${script}</script><script>${run}</script></body></html>`;

// Opens a page with `html`, runs `start` on it, and then `use`, with what the
// page has logged as errors or warnings, or thrown, pushed to `logged`
async function open(html, logged, start, use) {
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1200 },
  });
  try {
    const page = await context.newPage();
    page.on("pageerror", (error) => logged.push(error.message));
    page.on("console", (message) => {
      if (["error", "warning"].includes(message.type()))
        logged.push(message.text());
    });
    await page.setContent(html);
    await start(page);
    return await use(page);
  } finally {
    await context.close();
  }
}

// Waits for React and the browser to render what the page last did
const settle = (page) =>
  page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );

// Opens the page of fixtures and runs `use` on it, once React has rendered
// it and the `late` fieldsets are disabled. Nothing logs an error or warning.
async function withPage(use) {
  const logged = [];
  const result = await open(
    pageHtml("", "radioDisabled.mount()"),
    logged,
    async (page) => {
      await page.waitForFunction(() => window.ready);
      await page.evaluate(() => {
        for (const fieldset of document.querySelectorAll("[data-late]"))
          fieldset.disabled = true;
      });
      await settle(page);
    },
    use,
  );
  assert.deepEqual(logged, []);
  return result;
}

// Opens the server fixtures' HTML, rendered in Node, and runs `use` on it
// with what Node and the page have logged so far, and a function that
// hydrates the page and waits until React has committed it
async function withServerPage(use) {
  const logged = [];
  const { error, warn } = console;
  console.error = console.warn = (...args) => logged.push(format(...args));
  let html;
  try {
    html = server.render();
  } finally {
    Object.assign(console, { error, warn });
  }
  return open(
    pageHtml(html, ""),
    logged,
    () => {},
    (page) =>
      use(page, logged, async () => {
        await page.evaluate(() => window.radioDisabled.hydrate());
        await page.waitForFunction(() => window.ready);
        await settle(page);
      }),
  );
}

const setTheme = (page, theme) =>
  page.evaluate(
    (dark) => document.documentElement.classList.toggle("dark", dark),
    theme === "dark",
  );
const themes = ["light", "dark"];

// The computed colour of each token, in each theme: field-looks.mjs's, and
// `txt-primary`'s
const tokens = {
  light: { ...colours.light, "txt-primary": "rgb(37, 99, 235)" },
  dark: { ...colours.dark, "txt-primary": "rgb(99, 148, 255)" },
};

// The `data-test` an option's parts are marked with, but for the suffix
const optionName = (fixture, { at }) =>
  at ? `${fixture.id}-${at}` : fixture.id;

// What the option `name` shows: its label's and hint's colours, and the
// hint's `aria-disabled`, `null` for none
const readOption = (page, name) =>
  page.evaluate((name) => {
    const part = (suffix) =>
      document.querySelector(`[data-test="${name}-${suffix}"]`);
    const hint = part("hint");
    return {
      label: getComputedStyle(part("label")).color,
      hint: hint && getComputedStyle(hint).color,
      aria: hint && hint.getAttribute("aria-disabled"),
    };
  }, name);

// The options `pick` takes from `list`, each with its fixture
const optionsOf = (list, pick) =>
  list.flatMap((fixture) =>
    fixture.options
      .filter((option) => pick(option, fixture))
      .map((option) => ({ fixture, option })),
  );

// The label and hint colours of `options`, in each theme, as read and as
// expected
async function looks(page, options) {
  assert.ok(options.length);
  const actual = {};
  const want = {};
  for (const theme of themes) {
    await setTheme(page, theme);
    for (const { fixture, option } of options) {
      const name = optionName(fixture, option);
      const { label, hint } = await readOption(page, name);
      actual[`${theme} ${name}`] = { label, hint };
      want[`${theme} ${name}`] = {
        label: tokens[theme][option.label],
        hint: option.hint && tokens[theme][option.hint],
      };
    }
  }
  return [actual, want];
}

const changes = (what) => (option) => option.changes.includes(what);
const keeps = (what) => (option) => !option.changes.includes(what);

// The tests of the looks, by topic: one of the options whose looks #225
// changes, and one of those it keeps, if any
const topics = {
  prop: [
    "the label and hint dim, in both themes, with `disabled` on RadioButton, and in #357's case: a disabled Radio with RadioItem `disabled={false}`",
    "the label and hint dim, in both themes, with `disabled` on Radio or RadioItem, as on main",
  ],
  fieldset: [
    "the label and hint dim, in both themes, in a disabled fieldset: plain, group, nested in or around another, around a small Radio with the text flat in RadioItem, and disabled after mount",
  ],
  classed: [
    "the label and hint dim, in both themes, over their own colour class, by a prop and in a disabled fieldset",
    "the label's and hint's own colour class applies, in both themes, in an enabled option, as on main",
  ],
  never: [
    "the label and hint don't dim, in both themes, with RadioButton `disabled={false}` or `{undefined}` in a disabled RadioItem, which leave the radio enabled",
    "the label and hint don't dim, in both themes, in an enabled option: at rest, beside disabled controls in a group or group/radio-item with data-disabled, beside a disabled library Button, and in the first legend of a disabled fieldset, as on main",
  ],
  nested: [
    "the label and hint of a nested Radio's option dim, in both themes, with `disabled` on its RadioButton or in a disabled fieldset, and the enabled option around it doesn't dim",
    "the label and hint of a nested Radio's option dim, in both themes, with `disabled` on its Radio or RadioItem, and neither the enabled option around it nor around bare RadioButtons dims; a disabled option dims, and an enabled Radio of RadioItems in it doesn't, as on main",
  ],
  hint: [
    "the label and hint dim, in both themes, with the author's `aria-disabled` on the hint: `false` and RadioButton's `disabled`, `false` in a disabled fieldset, which leaves the hint undimmed, and `undefined` with RadioButton's `disabled`",
    "the label and hint dim, in both themes, with the author's `aria-disabled` on the hint, as on main: `true` in an enabled option, which doesn't dim, and `false` or `undefined` with RadioItem's `disabled`",
  ],
  raw: [
    "with a radio button that never reports its state, the label dims, in both themes, in a disabled fieldset and by the button's own `disabled`, and the hint only in the fieldset, unless the author passes it `aria-disabled={false}`",
    "with a radio button that never reports its state, the label and hint dim, in both themes, by its RadioItem's `disabled`, as on main",
  ],
};

for (const [topic, names] of Object.entries(topics)) {
  const inTopic = fixtures.filter((fixture) => fixture.topic === topic);
  const picks = [changes("look"), keeps("look")];
  names.forEach((name, index) =>
    test(name, () =>
      withPage(async (page) =>
        assert.deepEqual(
          ...(await looks(page, optionsOf(inTopic, picks[index]))),
        ),
      ),
    ),
  );
}

test("the text a disabled-after-mount fieldset dims comes back when it's enabled again, and dims when it's disabled again", () =>
  withPage(async (page) => {
    const [late] = fixtures.filter(({ wrap }) => wrap === "late");
    const name = optionName(late, late.options[0]);
    const setLate = (disabled) =>
      page.evaluate(
        ({ id, disabled }) =>
          (document.querySelector(`[data-test="${id}"] fieldset`).disabled =
            disabled),
        { id: late.id, disabled },
      );
    const actual = [];
    const want = [];
    for (const theme of themes) {
      await setTheme(page, theme);
      const c = tokens[theme];
      const dim = { label: c["txt-black-disabled"], hint: c["otl-gray-300"] };
      const rest = { label: c["txt-black-700"], hint: c["txt-black-500"] };
      for (const disabled of [true, false, true]) {
        await setLate(disabled);
        await settle(page);
        const { label, hint } = await readOption(page, name);
        actual.push({ theme, disabled, label, hint });
        want.push({ theme, disabled, ...(disabled ? dim : rest) });
      }
    }
    assert.deepEqual(actual, want);
  }));

// The hints' `aria-disabled` for the options `pick` takes, as read and as
// expected
async function marks(page, pick) {
  const options = optionsOf(fixtures, pick).filter(({ option }) => option.hint);
  assert.ok(options.length);
  const actual = {};
  const want = {};
  for (const { fixture, option } of options) {
    const name = optionName(fixture, option);
    actual[name] = (await readOption(page, name)).aria;
    want[name] = option.aria;
  }
  return [actual, want];
}

test("the hint is marked `aria-disabled` with RadioButton's `disabled` and in #357's case, keeps it with the author's `undefined`, and isn't marked with RadioButton `disabled={false}` or `{undefined}` in a disabled RadioItem", () =>
  withPage(async (page) =>
    assert.deepEqual(...(await marks(page, changes("aria")))),
  ));

test("the hint's `aria-disabled` is as on main elsewhere: marked with Radio's or RadioItem's `disabled`, not in a disabled fieldset or an enabled option, and the author's `true` or `false` wins", () =>
  withPage(async (page) =>
    assert.deepEqual(...(await marks(page, keeps("aria")))),
  ));

// The colour-contrast violations axe-core finds in each fixture of `list`,
// in each theme, as found and as expected: none
async function contrast(page, list) {
  assert.ok(list.length);
  if (!(await page.evaluate(() => "axe" in window)))
    await page.addScriptTag({ content: axeSource });
  const actual = {};
  for (const theme of themes) {
    await setTheme(page, theme);
    for (const { id } of list)
      actual[`${theme} ${id}`] = await page.evaluate(async (id) => {
        const { violations } = await window.axe.run(
          { include: [[`[data-test="${id}"]`]] },
          { runOnly: ["color-contrast"] },
        );
        return violations.flatMap(({ nodes }) =>
          nodes.map(({ target, any }) => ({
            target: target.join(" "),
            ratio: any[0]?.data?.contrastRatio,
          })),
        );
      }, id);
  }
  const version = await page.evaluate(() => window.axe.version);
  return [
    { version, ...actual },
    {
      version: "4.10.2",
      ...Object.fromEntries(Object.keys(actual).map((key) => [key, []])),
    },
  ];
}

test("axe-core's color-contrast rule finds no violation, in both themes, in the fixtures where it finds none on main", () =>
  withPage(async (page) =>
    assert.deepEqual(
      ...(await contrast(
        page,
        fixtures.filter(({ axe }) => axe === "same"),
      )),
    ),
  ));

test("axe-core's color-contrast rule finds no violation, in both themes, with RadioButton `disabled={false}` or `{undefined}` in a disabled RadioItem, or the author's `aria-disabled={undefined}` on the hint of one", () =>
  withPage(async (page) =>
    assert.deepEqual(
      ...(await contrast(
        page,
        fixtures.filter(({ axe }) => axe === "new"),
      )),
    ),
  ));

// Every radio: its `data-test`, its label's text, and whether it's disabled
const radios = fixtures.flatMap(
  (fixture) =>
    fixture.radios ??
    fixture.options.map((option) => ({
      test: `${optionName(fixture, option)}-radio`,
      name: option.at === "inner" ? "Banana" : "Apple",
      disabled: option.disabled,
    })),
);

test("every radio is :disabled, and reads in Chromium's accessibility tree, as on main, and two RadioButtons in one RadioItem render with nothing logged", () =>
  withPage(async (page) => {
    const actual = {};
    const want = {};
    for (const radio of radios) {
      const button = page.locator(`[data-test="${radio.test}"]`);
      actual[radio.test] = {
        disabled: await button.evaluate((button) =>
          button.matches(":disabled"),
        ),
        snapshot: await button.ariaSnapshot(),
      };
      want[radio.test] = {
        disabled: radio.disabled,
        snapshot: `- radio "${radio.name}"${radio.disabled ? " [disabled]" : ""}`,
      };
    }
    assert.deepEqual(actual, want);
  }));

// The server fixtures' looks and marks, in each theme, as read and as
// expected `when` ("before" or "after" hydration)
async function serverLooks(page, list, when) {
  const actual = {};
  const want = {};
  for (const theme of themes) {
    await setTheme(page, theme);
    for (const fixture of list) {
      const key = `${when} ${theme} ${fixture.id}`;
      actual[key] = await readOption(page, fixture.id);
      const { label, hint, aria } = fixture[when];
      want[key] = {
        label: tokens[theme][label],
        hint: tokens[theme][hint],
        aria,
      };
    }
  }
  return [actual, want];
}

for (const [name, changed] of [
  [
    "RadioButton's `disabled` dims the label at once and the hint once hydration marks it, and #357's case dims and marks both in the server HTML",
    true,
  ],
  ["RadioItem's `disabled` dims and marks the server HTML, as on main", false],
])
  test(`in server-rendered HTML, before and after hydration, in both themes, ${name}`, () =>
    withServerPage(async (page, logged, hydrate) => {
      const list = serverFixtures.filter(
        (fixture) => fixture.changed === changed,
      );
      const [beforeActual, beforeWant] = await serverLooks(
        page,
        list,
        "before",
      );
      await hydrate();
      const [afterActual, afterWant] = await serverLooks(page, list, "after");
      assert.deepEqual(
        { ...beforeActual, ...afterActual },
        { ...beforeWant, ...afterWant },
      );
      assert.deepEqual(logged, []);
    }));

test("server-rendered HTML hydrates, on the React that rendered it, with nothing logged and no recoverable error, its radios are :disabled and read as on main, and axe-core's color-contrast rule finds no violation, in both themes, before and after hydration", () =>
  withServerPage(async (page, logged, hydrate) => {
    const radio = (id) => page.locator(`[data-test="${id}-radio"]`);
    // What the page shows, as read and as expected
    const read = async () => {
      const actual = {};
      const want = {};
      for (const { id } of serverFixtures) {
        actual[id] = {
          disabled: await radio(id).evaluate((button) =>
            button.matches(":disabled"),
          ),
          snapshot: await radio(id).ariaSnapshot(),
        };
        want[id] = { disabled: true, snapshot: '- radio "Apple" [disabled]' };
      }
      const [found, none] = await contrast(page, serverFixtures);
      return [
        { ...actual, contrast: found },
        { ...want, contrast: none },
      ];
    };
    const [beforeActual, beforeWant] = await read();
    await hydrate();
    const [afterActual, afterWant] = await read();
    assert.deepEqual(
      {
        before: beforeActual,
        after: afterActual,
        logged,
        recoverable: await page.evaluate(() => window.recoverableErrors),
        react: await page.evaluate(() => window.radioDisabled.version),
      },
      {
        before: beforeWant,
        after: afterWant,
        logged: [],
        recoverable: [],
        react: server.version,
      },
    );
  }));
