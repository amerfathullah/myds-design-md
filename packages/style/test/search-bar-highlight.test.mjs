// SearchBar's highlight in Chromium (#205), with trusted keys and the
// library's stylesheet. In a displayed list of three people, A, B and C, in a
// bar with no `value` or `defaultValue` and cmdk's vim bindings on, the keys
// never highlight the hidden `--` option. Nothing is highlighted at rest, or
// after a query change: cmdk's selection is on the hidden `--`. ArrowDown
// highlights A. ArrowUp from A stays on A, and with `loop` goes to C. ArrowUp,
// Ctrl+P, Ctrl+K and Alt+ArrowUp highlight nothing from rest, and C with
// `loop`; from A they stay on A, and go to C with `loop`. ArrowDown, Ctrl+N,
// Ctrl+J and Alt+ArrowDown from C stay on C, and go to A with `loop`. Each
// row runs with a controlled input and an uncontrolled one, with `loop` and
// without. After it, the highlighted result is visible, by
// `checkVisibility`, with the background `bg-bg-washed` gives, no other
// result has that background, and Enter chooses that result, or nothing
// while nothing is highlighted. Each step waits a frame before the next.
//
// With a controlled input, keys pressed straight after typing, with no
// pause, as Playwright sends them, act on the query typed. React 18.3 used
// to undo them (#205). React 19 never did, so on the components' React 19
// these checks pass with or without #205's fix; run them on React 18.3 by
// hand until CI has a React 18 runtime (#402). In search-bar-names.page.jsx's composition, typing
// "tu" then ArrowDown highlights the first result, and two ArrowDowns the
// second. In the docs' controlled example, "siti" then ArrowDown highlights
// the first, and "iza" then two ArrowDowns the second: "iz" and "iza" match
// the same two people. Moving to a result, then typing so it stays shown,
// all back to back, leaves nothing highlighted and Enter chooses nothing,
// with Enter pressed after a frame or back to back too. Each of these checks
// runs 10 times, on a fresh page each time, and every run must pass.
//
// After every step, straight away and once a frame has passed, the input's
// and the listbox's `aria-activedescendant` name an element in the page
// that's an option, is selected, isn't the hidden `--`, and is inside a
// displayed list, or nothing. The listbox's is the input's, and the input's
// is the highlighted result, or none while nothing is highlighted.
//
// The page is search-bar-highlight.page.jsx: the React components
// themselves, bundled with esbuild, with React and React DOM from the
// components' node_modules, on the stylesheet the Tailwind import compiles
// for full.css's sources. It runs React's development build, and nothing
// logs an error or a warning.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";

import { build } from "esbuild";
import { chromium } from "playwright";

import { registryDefine } from "../../react/registry-define.mjs";
import { compile, fullCssSources } from "./compile.mjs";

const pageSource = fileURLToPath(
  new URL("./search-bar-highlight.page.jsx", import.meta.url),
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

let browser;
let css;
let script;
let strays;
before(async () => {
  const [bundle, compiled] = await Promise.all([
    build({
      entryPoints: [pageSource],
      bundle: true,
      write: false,
      metafile: true,
      format: "iife",
      globalName: "searchBarHighlight",
      jsx: "automatic",
      nodePaths: [reactModules],
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

// Opens a page with the composition `name` and its `options`, and runs `use`
// on it once React has rendered it. Nothing logs an error or a warning.
async function withPage(name, options, use) {
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
    await page.setContent(
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>SearchBar</title><style>${css}</style></head><body class="bg-bg-white"><main><div id="root"></div></main><script>${script}</script><script>searchBarHighlight.render(${JSON.stringify(name)}, ${JSON.stringify(options)})</script></body></html>`,
    );
    await page.waitForFunction(() => window.ready.length === 1);
    const result = await use(page);
    assert.deepEqual(errors, []);
    return result;
  } finally {
    await context.close();
  }
}

const input = "[cmdk-input]";

// The bar's state, as the page's `state` reads it
const read = (page) => page.evaluate(() => window.searchBarHighlight.state());

// What the results chosen so far are
const chosen = (page) => page.evaluate(() => window.chosen);

// Waits until the browser has rendered a frame, and a task after it
const settle = (page) =>
  page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => setTimeout(resolve)),
      ),
  );

// Does `action`, the step `what`, and reads the bar's state straight away
// and once a frame has passed. Returns the state then, and what was wrong
// with the `aria-activedescendant`s each time.
async function checked(page, what, action) {
  await action();
  const straight = await read(page);
  await settle(page);
  const state = await read(page);
  return {
    state,
    problems: [
      ...straight.problems.map(
        (problem) => `straight after ${what}: ${problem}`,
      ),
      ...state.problems.map((problem) => `after ${what}: ${problem}`),
    ],
  };
}

// Does `action`, the step `what`, and checks the bar's
// `aria-activedescendant` straight away and once a frame has passed.
// Returns the bar's state then.
async function step(page, what, action) {
  const { state, problems } = await checked(page, what, action);
  assert.deepEqual(problems, []);
  return state;
}

// Presses `key`, which `label` names in messages
const press = (page, key, label = key) =>
  step(page, label, () => page.keyboard.press(key));

// Focuses the input
const focus = (page) =>
  step(page, "focusing the input", () => page.focus(input));

// search-bar-names.page.jsx's three people
const [A, B, C] = ["Tunku Abdul Rahman", "Tun Abdul Razak", "Tun Hussein Onn"];

test(`the page runs React ${reactVersion}, the components' own, and bundles no other copy`, async () => {
  assert.deepEqual(strays, []);
  assert.equal(
    await withPage("keys", {}, (page) =>
      page.evaluate(() => window.searchBarHighlight.version),
    ),
    reactVersion,
  );
});

test("the highlight's background, `bg-bg-washed` in the library's stylesheet, differs from the open panel's", () =>
  withPage("keys", {}, async (page) => {
    const { washed, panel } = await page.evaluate(() =>
      window.searchBarHighlight.backgrounds(),
    );
    assert.notEqual(washed, "rgba(0, 0, 0, 0)");
    assert.notEqual(washed, panel);
  }));

// Each key, as Playwright presses it and as the rows name it
const keys = {
  ArrowDown: "ArrowDown",
  ArrowUp: "ArrowUp",
  "Ctrl+N": "Control+n",
  "Ctrl+J": "Control+j",
  "Ctrl+P": "Control+p",
  "Ctrl+K": "Control+k",
  "Alt+ArrowDown": "Alt+ArrowDown",
  "Alt+ArrowUp": "Alt+ArrowUp",
};
const upKeys = ["ArrowUp", "Ctrl+P", "Ctrl+K", "Alt+ArrowUp"];
const downKeys = ["ArrowDown", "Ctrl+N", "Ctrl+J", "Alt+ArrowDown"];

// Each row of #205's table: whether to move into the results and type a
// character first, the keys, and what's highlighted after them without
// `loop` and with it. null is nothing.
const rows = [
  { row: "At rest", keys: [], plain: null, looped: null },
  {
    row: "After ArrowDown and a query change",
    typeFirst: true,
    keys: [],
    plain: null,
    looped: null,
  },
  { row: "ArrowDown", keys: ["ArrowDown"], plain: A, looped: A },
  {
    row: "ArrowDown, then ArrowUp",
    keys: ["ArrowDown", "ArrowUp"],
    plain: A,
    looped: C,
  },
  ...upKeys.map((key) => ({
    row: `${key} from rest`,
    keys: [key],
    plain: null,
    looped: C,
  })),
  ...upKeys.slice(1).map((key) => ({
    row: `${key} from ${A}`,
    keys: ["ArrowDown", key],
    plain: A,
    looped: C,
  })),
  ...downKeys.map((key) => ({
    row: `ArrowDown three times, then ${key}`,
    keys: ["ArrowDown", "ArrowDown", "ArrowDown", key],
    plain: C,
    looped: A,
  })),
];

// The "keys" composition with each set of options: a controlled input or an
// uncontrolled one, with `loop` or without
const compositions = [false, true].flatMap((controlled) =>
  [false, true].map((loop) => ({
    composition: `${controlled ? "a controlled" : "an uncontrolled"} input${loop ? ", with loop" : ""}`,
    options: { controlled, loop },
  })),
);

// What the bar shows with `highlighted` highlighted, or nothing for null,
// and what Enter then chooses. With nothing highlighted, cmdk's selection is
// on the hidden `--`.
const showing = (highlighted) => ({
  selected: [highlighted ?? "--"],
  highlighted,
  visible: highlighted ? true : null,
  washed: highlighted ? [highlighted] : [],
  input: highlighted,
  listbox: highlighted,
  chosen: highlighted ? [highlighted] : [],
});

for (const { row, typeFirst, keys: pressed, plain, looped } of rows)
  test(`${row}: ${plain ?? "nothing"} is highlighted without loop, ${looped ?? "nothing"} with it, and Enter chooses what's highlighted`, async () => {
    // Each composition in its own page, side by side. Each step waits a
    // frame before the next, so the pages don't race.
    const seen = await Promise.all(
      compositions.map(async ({ composition, options }) => [
        composition,
        await withPage("keys", options, async (page) => {
          await focus(page);
          if (typeFirst) {
            await press(page, "ArrowDown");
            await step(page, 'typing "x"', () => page.keyboard.type("x"));
          }
          for (const key of pressed) await press(page, keys[key], key);
          const { problems, ...state } = await read(page);
          await press(page, "Enter");
          return { ...state, chosen: await chosen(page) };
        }),
      ]),
    );
    assert.deepEqual(
      Object.fromEntries(seen),
      Object.fromEntries(
        compositions.map(({ composition, options }) => [
          composition,
          showing(options.loop ? looped : plain),
        ]),
      ),
    );
  });

// How many times each check of keys pressed back to back runs
const runs = 10;

// Runs `sequence` in a fresh page of the composition `name`, `runs` times:
// each step types its text or presses its key straight after the one
// before, with no pause, as Playwright sends keys. Each run records the
// bar's state once a frame has passed, what was wrong with its
// `aria-activedescendant`s after focusing the input, after the sequence and
// after Enter, each straight away and once a frame has passed, and the
// results Enter chooses. Every run must be `expected`.
async function backToBack(t, name, sequence, expected) {
  const what = sequence
    .map(([action, text]) => (action === "type" ? `typing "${text}"` : text))
    .join(", ");
  const seen = [];
  for (let run = 0; run < runs; run += 1)
    seen.push(
      await withPage(name, {}, async (page) => {
        const focusing = await checked(page, "focusing the input", () =>
          page.focus(input),
        );
        const keyed = await checked(page, what, async () => {
          for (const [action, text] of sequence)
            await page.keyboard[action](text);
        });
        const entering = await checked(page, "Enter", () =>
          page.keyboard.press("Enter"),
        );
        return {
          ...keyed.state,
          problems: [
            ...focusing.problems,
            ...keyed.problems,
            ...entering.problems,
          ],
          chosen: await chosen(page),
        };
      }),
    );
  const count = (check) => seen.filter(check).length;
  t.diagnostic(
    `${count((state) => isDeepStrictEqual(state, expected))} of ${runs} runs passed. cmdk's selection was on ${expected.selected[0]} in ${count((state) => isDeepStrictEqual(state.selected, expected.selected))}, and the input named ${expected.input ?? "nothing"} in ${count((state) => state.input === expected.input)}.`,
  );
  assert.deepEqual(seen, Array(runs).fill(expected));
}

// What a run records with `highlighted` highlighted, or nothing for null
const highlighting = (highlighted) => ({
  ...showing(highlighted),
  problems: [],
});

const typing = (text) => ["type", text];
const pressing = (key) => ["press", key];

test(`in search-bar-names.page.jsx's composition, typing "tu" then ArrowDown straight after highlights ${A}, in ${runs} of ${runs} runs`, (t) =>
  backToBack(
    t,
    "names",
    [typing("tu"), pressing("ArrowDown")],
    highlighting(A),
  ));

test(`in search-bar-names.page.jsx's composition, typing "tu" then ArrowDown twice straight after highlights ${B}, in ${runs} of ${runs} runs`, (t) =>
  backToBack(
    t,
    "names",
    [typing("tu"), pressing("ArrowDown"), pressing("ArrowDown")],
    highlighting(B),
  ));

test(`in the docs' controlled example, typing "siti" then ArrowDown straight after highlights Siti Nurhaliza, in ${runs} of ${runs} runs`, (t) =>
  backToBack(
    t,
    "docs",
    [typing("siti"), pressing("ArrowDown")],
    highlighting("Siti Nurhaliza"),
  ));

// "iz" and "iza" both match Siti Nurhaliza and Faizal Tahir
test(`in the docs' controlled example, typing "iza" then ArrowDown twice straight after highlights Faizal Tahir, in ${runs} of ${runs} runs`, (t) =>
  backToBack(
    t,
    "docs",
    [typing("iza"), pressing("ArrowDown"), pressing("ArrowDown")],
    highlighting("Faizal Tahir"),
  ));

test(`in search-bar-names.page.jsx's composition, typing "tu", ArrowDown, then "n", back to back, leaves nothing highlighted, and Enter chooses nothing, in ${runs} of ${runs} runs`, (t) =>
  backToBack(
    t,
    "names",
    [typing("tu"), pressing("ArrowDown"), typing("n")],
    highlighting(null),
  ));

test(`in search-bar-names.page.jsx's composition, typing "tu", ArrowDown, "n", then Enter, back to back, chooses nothing, in ${runs} of ${runs} runs`, (t) =>
  backToBack(
    t,
    "names",
    [typing("tu"), pressing("ArrowDown"), typing("n"), pressing("Enter")],
    highlighting(null),
  ));

test(`in the docs' controlled example, typing "sit", ArrowDown, then "i", back to back, leaves nothing highlighted, and Enter chooses nothing, in ${runs} of ${runs} runs`, (t) =>
  backToBack(
    t,
    "docs",
    [typing("sit"), pressing("ArrowDown"), typing("i")],
    highlighting(null),
  ));

test(`in the docs' controlled example, typing "sit", ArrowDown, "i", then Enter, back to back, chooses nothing, in ${runs} of ${runs} runs`, (t) =>
  backToBack(
    t,
    "docs",
    [typing("sit"), pressing("ArrowDown"), typing("i"), pressing("Enter")],
    highlighting(null),
  ));
