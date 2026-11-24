// Home, End and the Meta arrows in SearchBarInput, in Chromium (#399). Home
// and End with any modifiers or none, and Meta+ArrowUp and Meta+ArrowDown
// with any other modifiers or none, do what the browser does in a plain
// <input type="text">, and leave the highlight where it was, in six states:
// (a) a displayed list with nothing highlighted;
// (b) a displayed list with a result highlighted;
// (c) a list directly in SearchBar, outside any SearchBarResults;
// (d) a closed SearchBarResults holding a list;
// (e) an open SearchBarResults with no list;
// (f) no SearchBarResults and no list.
//
// From 3 in "abcdef", Home, End, Shift+Home, Shift+End, Ctrl+Home, Ctrl+End,
// Ctrl+Shift+Home and Ctrl+Shift+End move the caret as they do in a plain
// input on the same page. Chromium on Linux doesn't move the caret for the
// Meta keys, and Alt+Home can open the browser's home page, so for Alt+Home,
// Alt+End, Meta+Home, Meta+End and the Meta arrows the test checks only that
// SearchBar doesn't cancel them. A keydown listener on window reads that,
// then cancels Alt+Home. After each key, the option cmdk marks selected, and
// the input's and the listbox's `aria-activedescendant`, are what they were.
// Enter afterwards chooses the highlighted result, or nothing at rest.
// SearchBar's onKeyDown runs once for each key, before the browser acts, with
// SearchBar's root <div cmdk-root> as currentTarget and the input as target,
// and its preventDefault keeps the caret and the highlight. ArrowDown,
// ArrowUp, Alt+ArrowDown, Alt+ArrowUp, Ctrl+N/J/P/K and Enter still move
// through and choose the results while a list is displayed, with vimBindings
// on and off. Whenever the input or the listbox has an
// `aria-activedescendant`, it names an option in the page that's selected,
// isn't the hidden `--`, and is in a displayed list, and the two name the
// same. Nothing logs an error or a warning. The keys are Playwright's, which
// Chromium reads as trusted.
//
// The page is search-bar-caret.page.jsx: the React components themselves,
// bundled with esbuild with one copy of React, the components' own, on the
// stylesheet the Tailwind import compiles for full.css's sources.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";
import { chromium } from "playwright";

import { registryDefine } from "../../react/registry-define.mjs";
import { compile, fullCssSources } from "./compile.mjs";

const pageSource = fileURLToPath(
  new URL("./search-bar-caret.page.jsx", import.meta.url),
);
// The directory React and React DOM come from: the components' own
const reactModules = fileURLToPath(
  new URL("../../react/node_modules", import.meta.url),
);
const reactVersion = JSON.parse(
  fs.readFileSync(path.join(reactModules, "react/package.json"), "utf8"),
).version;

// Resolves React and React DOM to `reactModules` wherever they're imported,
// so the page, the components, cmdk and Radix share one copy
const oneReact = {
  name: "one-react",
  setup(build) {
    build.onResolve(
      { filter: /^react(-dom)?(\/|$)/ },
      async ({ path: request, kind, pluginData }) => {
        if (pluginData?.oneReact) return undefined;
        const { path: resolved, errors } = await build.resolve(request, {
          kind,
          resolveDir: reactModules,
          pluginData: { oneReact: true },
        });
        return errors.length ? { errors } : { path: resolved };
      },
    );
  },
};

// The files of React and React DOM the bundle holds from any other copy
const copies = ["react", "react-dom"].map(
  (name) => fs.realpathSync(path.join(reactModules, name)) + path.sep,
);
const otherReacts = ({ metafile }) =>
  Object.keys(metafile.inputs)
    .map((input) => path.resolve(input))
    .filter(
      (file) =>
        /[\\/]node_modules[\\/]react(-dom)?[\\/]/.test(file) &&
        !copies.some((copy) => file.startsWith(copy)),
    );

const pageUrl = "http://search-bar-caret.test/";
// The results on the page: the docs' first three people
const people = ["Michelle Yeoh", "P. Ramlee", "Siti Nurhaliza"];

let browser;
let css;
let script;
// What the bundle holds of other copies of React
let strays;
before(async () => {
  const [bundle, compiled] = await Promise.all([
    build({
      entryPoints: [pageSource],
      bundle: true,
      write: false,
      metafile: true,
      format: "iife",
      globalName: "searchBarCaret",
      jsx: "automatic",
      // React's development build, so the test sees its warnings
      define: { ...registryDefine, "process.env.NODE_ENV": '"development"' },
      plugins: [oneReact],
      logLevel: "silent",
    }),
    compile(`${fullCssSources()}\n@source "${pageSource}";`),
  ]);
  css = compiled;
  strays = otherReacts(bundle);
  script = bundle.outputFiles[0].text.replaceAll("</script", "<\\/script");
  browser = await chromium.launch();
});
after(() => browser?.close());

// Opens the page with `params` as its query, and runs `use` on it once
// React has rendered it. Nothing logs an error or a warning.
async function withPage(params, use) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
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
        body: `<!doctype html><html lang="en"><head><style>${css}</style></head><body class="bg-bg-white"><div id="root"></div><script>${script}</script></body></html>`,
      }),
    );
    await page.goto(`${pageUrl}?${new URLSearchParams(params)}`);
    await page.waitForFunction(() => window.ready.length === 1);
    const result = await use(page);
    assert.deepEqual(errors, []);
    return result;
  } finally {
    await context.close();
  }
}

const input = '[data-test="input"]';
const plain = '[data-test="plain"]';

// Waits for a frame and a task, so whatever a key set off has rendered
const settle = (page) =>
  page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => setTimeout(resolve)),
      ),
  );

/**
 * The bar's highlight: the value of the option cmdk marks selected ("--" for
 * the hidden one, null with no options), the result the input's
 * `aria-activedescendant` names (null for none), and the ids the input and
 * the listbox name. Fails unless any id the input names is of an element in
 * the page with role="option" and aria-selected="true", other than the
 * hidden `--`, inside a displayed list, and the listbox names the same.
 */
async function highlight(page) {
  const { problems, ...read } = await page.evaluate(() => {
    const bar = document.querySelector('[data-bar="caret"]');
    const field = bar.querySelector('[data-test="input"]');
    const listbox = bar.querySelector('[role="listbox"]');
    const value = (option) =>
      option.hasAttribute("data-nothing-highlighted")
        ? "--"
        : option.getAttribute("data-value");
    const problems = [];
    const selected = [
      ...bar.querySelectorAll('[cmdk-item][aria-selected="true"]'),
    ];
    if (selected.length > 1)
      problems.push(`${selected.length} options are selected`);
    const ids = {
      input: field.getAttribute("aria-activedescendant"),
      listbox: listbox?.getAttribute("aria-activedescendant") ?? null,
    };
    let active = null;
    if (ids.input !== null) {
      const option = document.getElementById(ids.input);
      if (!option) problems.push(`#${ids.input} isn't in the page`);
      else {
        if (option.getAttribute("role") !== "option")
          problems.push(`#${ids.input} isn't an option`);
        if (option.getAttribute("aria-selected") !== "true")
          problems.push(`#${ids.input} isn't selected`);
        if (option.hasAttribute("data-nothing-highlighted"))
          problems.push(`#${ids.input} is the hidden --`);
        if (!option.closest('[role="listbox"]')?.checkVisibility())
          problems.push(`#${ids.input} isn't in a displayed list`);
        active = value(option);
      }
    }
    if (listbox && ids.listbox !== ids.input)
      problems.push(`the listbox names ${ids.listbox}, the input ${ids.input}`);
    return {
      problems,
      selected: selected[0] ? value(selected[0]) : null,
      active,
      ids,
    };
  });
  assert.deepEqual(problems, [], "aria-activedescendant");
  return read;
}

// Puts the caret at 3 in `field`, presses `key` there, and reads the field's
// value and selection, and what the page's keydown listeners heard
async function press(page, field, key) {
  await page.evaluate((field) => {
    const element = document.querySelector(field);
    element.focus();
    element.setSelectionRange(3, 3);
    window.keydowns = [];
    window.authorKeys = [];
  }, field);
  await page.keyboard.press(key);
  await settle(page);
  return page.evaluate((field) => {
    const element = document.querySelector(field);
    return {
      value: element.value,
      caret: [
        element.selectionStart,
        element.selectionEnd,
        element.selectionDirection,
      ],
      keydowns: window.keydowns,
      authorKeys: window.authorKeys,
    };
  }, field);
}

// The keys #399 leaves to the browser that move Chromium's caret on Linux,
// and where each puts it from 3 in "abcdef", as [start, end]
const caretKeys = {
  Home: [0, 0],
  End: [6, 6],
  "Shift+Home": [0, 3],
  "Shift+End": [3, 6],
  "Control+Home": [0, 0],
  "Control+End": [6, 6],
  "Control+Shift+Home": [0, 3],
  "Control+Shift+End": [3, 6],
};
// The other keys #399 leaves to the browser, checked without the caret
const otherKeys = [
  "Alt+Home",
  "Alt+End",
  "Meta+Home",
  "Meta+End",
  ...["ArrowUp", "ArrowDown"].flatMap((key) => [
    `Meta+${key}`,
    `Shift+Meta+${key}`,
    `Control+Meta+${key}`,
    `Alt+Meta+${key}`,
  ]),
];
const label = (key) => key.replaceAll("Control", "Ctrl");

// The six states: the query that composes each, the key that brings it
// about after typing, if any, and what the bar shows then: the input's
// `aria-expanded`, the option cmdk marks selected, and the result the input
// names
const states = [
  {
    state: "a displayed list with nothing highlighted (a)",
    params: { results: "open", list: "1" },
    shows: { expanded: "true", selected: "--", active: null },
  },
  {
    state: "a displayed list with a result highlighted (b)",
    params: { results: "open", list: "1" },
    moveTo: "ArrowDown",
    shows: { expanded: "true", selected: people[0], active: people[0] },
  },
  {
    state: "a list directly in SearchBar (c)",
    params: { results: "none", list: "1" },
    shows: { expanded: "true", selected: "--", active: null },
  },
  {
    state: "a closed SearchBarResults holding a list (d)",
    params: { results: "closed", list: "1" },
    shows: { expanded: "false", selected: "--", active: null },
  },
  {
    state: "an open SearchBarResults with no list (e)",
    params: { results: "open", list: "0" },
    shows: { expanded: "false", selected: null, active: null },
  },
  {
    state: "no SearchBarResults and no list (f)",
    params: { results: "none", list: "0" },
    shows: { expanded: "false", selected: null, active: null },
  },
];
// The compositions with a list displayed at rest
const displayed = [states[0], states[2]];

// Types "abcdef" in the plain input, then in the bar's input, presses the
// state's key straight after, and checks what the bar shows. Returns the
// bar's highlight.
async function enter(page, { moveTo, shows }) {
  await page.focus(plain);
  await page.keyboard.type("abcdef");
  await page.focus(input);
  await page.keyboard.type("abcdef");
  if (moveTo) await page.keyboard.press(moveTo);
  await settle(page);
  assert.equal(await page.inputValue(plain), "abcdef");
  assert.equal(await page.inputValue(input), "abcdef");
  const shown = await highlight(page);
  assert.deepEqual(
    {
      expanded: await page.getAttribute(input, "aria-expanded"),
      selected: shown.selected,
      active: shown.active,
    },
    shows,
  );
  return shown;
}

// `keys` mapped to what `each` gives for each
const byKey = (keys, each) =>
  Object.fromEntries(keys.map((key) => [label(key), each(key)]));

test(`the page runs React ${reactVersion}, from ${reactModules}, and bundles no other copy`, () =>
  withPage(states[0].params, async (page) => {
    assert.deepEqual(strays, []);
    assert.equal(
      await page.evaluate(() => window.searchBarCaret.version),
      reactVersion,
    );
  }));

for (const state of states)
  test(`with ${state.state}, Home, End, Shift+Home, Shift+End, Ctrl+Home, Ctrl+End, Ctrl+Shift+Home and Ctrl+Shift+End move the caret from 3 as in a plain input, and leave the highlight where it was`, () =>
    withPage(state.params, async (page) => {
      const shown = await enter(page, state);
      const keys = Object.keys(caretKeys);
      const plainCarets = {};
      for (const key of keys)
        plainCarets[key] = (await press(page, plain, key)).caret;
      assert.deepEqual(
        byKey(keys, (key) => plainCarets[key].slice(0, 2)),
        byKey(keys, (key) => caretKeys[key]),
        "the plain input",
      );
      const seen = {};
      for (const key of keys) {
        const { value, caret, keydowns } = await press(page, input, key);
        seen[label(key)] = {
          value,
          caret,
          keydowns,
          highlight: await highlight(page),
        };
      }
      assert.deepEqual(
        seen,
        byKey(keys, (key) => ({
          value: "abcdef",
          caret: plainCarets[key],
          keydowns: [{ key, cancelled: false }],
          highlight: shown,
        })),
      );
    }));

for (const state of states)
  test(`with ${state.state}, SearchBar doesn't cancel Alt+Home, Alt+End, Meta+Home, Meta+End, or Meta+ArrowUp and Meta+ArrowDown alone or with Shift, Ctrl or Alt, and they leave the highlight where it was`, () =>
    withPage(state.params, async (page) => {
      const url = page.url();
      const shown = await enter(page, state);
      const seen = {};
      for (const key of otherKeys) {
        const { value, keydowns } = await press(page, input, key);
        seen[label(key)] = {
          value,
          keydowns,
          highlight: await highlight(page),
        };
      }
      assert.deepEqual(
        seen,
        byKey(otherKeys, (key) => ({
          value: "abcdef",
          keydowns: [{ key, cancelled: false }],
          highlight: shown,
        })),
      );
      // Alt+Home didn't take the page anywhere
      assert.equal(page.url(), url);
    }));

for (const { state, params } of displayed)
  test(`with ${state}, Enter after Home, End or a Meta arrow chooses the highlighted result, and at rest chooses nothing`, () =>
    withPage(params, async (page) => {
      const chosen = () => page.evaluate(() => window.chosen);
      // Presses `keys` in turn, then reads the highlight
      const keys = async (...keys) => {
        for (const key of keys) await page.keyboard.press(key);
        await settle(page);
        const { selected, active } = await highlight(page);
        return { selected, active };
      };
      await page.focus(input);
      for (const key of ["Home", "End", "Meta+ArrowUp", "Meta+ArrowDown"])
        assert.deepEqual(
          await keys(key, "Enter"),
          { selected: "--", active: null },
          label(key),
        );
      assert.deepEqual(await chosen(), []);

      // Each step: the keys, and the result each highlights and Enter chooses
      const steps = [
        [["ArrowDown", "Home"], people[0]],
        [["ArrowDown", "End"], people[1]],
        [["ArrowDown", "Meta+ArrowUp"], people[2]],
        [["ArrowUp", "Meta+ArrowDown"], people[1]],
      ];
      for (const [presses, result] of steps)
        assert.deepEqual(
          await keys(...presses, "Enter"),
          { selected: result, active: result },
          presses.map(label).join(", "),
        );
      assert.deepEqual(
        await chosen(),
        steps.map(([, result]) => result),
      );
    }));

for (const state of states)
  test(`with ${state.state}, SearchBar's onKeyDown runs once for Home, End and the Meta arrows with each set of modifiers, before the browser acts, with SearchBar's root as currentTarget and the input as target, and its preventDefault keeps the caret and the highlight`, () =>
    withPage(state.params, async (page) => {
      const shown = await enter(page, state);
      const keys = [...Object.keys(caretKeys), ...otherKeys];
      // What SearchBar's onKeyDown should get for `key`: the key not yet
      // cancelled, as it runs before SearchBar keeps the key from cmdk, and
      // the caret where the test put it, as the browser hasn't acted yet
      const heard = (key) => [
        {
          key,
          currentTarget: "root",
          target: "input",
          trusted: true,
          prevented: false,
          caret: [3, 3],
        },
      ];
      // What the test reads after `key`: the caret only for the keys that
      // move it
      const read = async (key) => {
        const { value, caret, keydowns, authorKeys } = await press(
          page,
          input,
          key,
        );
        return {
          authorKeys,
          keydowns,
          value,
          ...(key in caretKeys ? { caret: caret.slice(0, 2) } : {}),
          highlight: await highlight(page),
        };
      };

      await page.evaluate(() => (window.cancelKeys = true));
      const cancelled = {};
      for (const key of keys) cancelled[label(key)] = await read(key);
      assert.deepEqual(
        cancelled,
        byKey(keys, (key) => ({
          authorKeys: heard(key),
          keydowns: [{ key, cancelled: true }],
          value: "abcdef",
          ...(key in caretKeys ? { caret: [3, 3] } : {}),
          highlight: shown,
        })),
        "cancelled",
      );

      // The same keys on the same page, not cancelled, move the caret
      await page.evaluate(() => (window.cancelKeys = false));
      const uncancelled = {};
      for (const key of keys) uncancelled[label(key)] = await read(key);
      assert.deepEqual(
        uncancelled,
        byKey(keys, (key) => ({
          authorKeys: heard(key),
          keydowns: [{ key, cancelled: false }],
          value: "abcdef",
          ...(key in caretKeys ? { caret: caretKeys[key] } : {}),
          highlight: shown,
        })),
        "not cancelled",
      );
    }));

// Each key, and the result highlighted after it with vimBindings on. No key
// moves up from the first result, and none wraps.
const walk = [
  ["ArrowDown", people[0]],
  ["ArrowDown", people[1]],
  ["ArrowUp", people[0]],
  ["Alt+ArrowDown", people[1]],
  ["Alt+ArrowUp", people[0]],
  ["ArrowDown", people[1]],
  ["Control+n", people[2]],
  ["Control+p", people[1]],
  ["Control+j", people[2]],
  ["Control+k", people[1]],
  ["Enter", people[1]],
];

for (const [vim, on] of [
  ["on", true],
  ["off", false],
])
  for (const { state, params } of displayed)
    test(`with vimBindings ${vim} and ${state}, ArrowDown, ArrowUp, Alt+ArrowDown, Alt+ArrowUp, Ctrl+N/J/P/K and Enter move through and choose the results as before`, () =>
      withPage({ ...params, ...(on ? {} : { vim: "off" }) }, async (page) => {
        await page.focus(input);
        const seen = [];
        for (const [key] of walk) {
          await page.evaluate(() => (window.keydowns = []));
          await page.keyboard.press(key);
          await settle(page);
          const { selected, active } = await highlight(page);
          seen.push([
            label(key),
            selected,
            active,
            await page.evaluate(() => window.keydowns),
          ]);
        }
        // cmdk cancels each key it acts on. With vimBindings off, it leaves
        // Ctrl+N/J/P/K alone: they don't move the highlight.
        let highlighted = null;
        assert.deepEqual(
          seen,
          walk.map(([key, result]) => {
            const cmdks = on || !key.startsWith("Control+");
            if (cmdks) highlighted = result;
            return [
              label(key),
              highlighted,
              highlighted,
              [{ key, cancelled: cmdks }],
            ];
          }),
        );
        assert.deepEqual(await page.evaluate(() => window.chosen), [people[1]]);
      }));
