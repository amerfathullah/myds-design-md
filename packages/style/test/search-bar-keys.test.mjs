// SearchBar's keys in Chromium (#398), with trusted keys. While no list is
// displayed, the browser acts on the keys cmdk would take: Enter in the
// input submits a surrounding form, and Home and End move the caret as in a
// plain <input>, with no panel, a closed panel with a list, and an open panel
// with no list. With a list displayed, Enter doesn't submit the form: it
// chooses the highlighted result, or nothing at rest. A panel closed after
// moving to a result keeps cmdk's selection through the arrow keys, Enter
// and Ctrl+N/J/P/K, names nothing, and Enter chooses nothing. Enter and
// Space on the clear and search buttons press them and choose no result,
// with a list displayed and without one. After the list unmounts and mounts
// again, the input names a displayed result or nothing, and ArrowDown is
// named. Typing or Backspace after moving into the results, so the result
// stays shown, leaves nothing highlighted, and Enter chooses nothing, with a
// controlled input and an uncontrolled one. With a list displayed, the arrow
// keys, Enter, Ctrl+N/J/P/K and Alt+arrows still act on the results.
//
// After every step of every keyboard check, straight away and once a frame
// has passed, the input's and the listbox's `aria-activedescendant` name an
// option in the page that's selected, isn't the hidden `--`, and is inside a
// displayed list, or nothing, and the listbox's is the input's. Each step
// waits a frame before the next, so no check presses keys back to back.
//
// The page is search-bar-keys.page.jsx: the React components themselves,
// bundled with esbuild, with React and React DOM from the components'
// node_modules, on the stylesheet the Tailwind import compiles for
// full.css's sources. It runs React's development build, and nothing logs
// an error or a warning.
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
  new URL("./search-bar-keys.page.jsx", import.meta.url),
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
      globalName: "searchBarKeys",
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

// Opens a page with the composition `name`, and runs `use` on it once React
// has rendered it. Nothing logs an error or a warning.
async function withPage(name, use) {
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
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>SearchBar</title><style>${css}</style></head><body class="bg-bg-white"><main><div id="root"></div></main><script>${script}</script><script>searchBarKeys.render(${JSON.stringify(name)})</script></body></html>`,
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
const plain = "[data-test=plain]";

// The bar's state, as the page's `state` reads it
const read = (page) => page.evaluate(() => window.searchBarKeys.state());

// Waits until the browser has rendered a frame, and a task after it
const settle = (page) =>
  page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => setTimeout(resolve)),
      ),
  );

// Does `action`, the step `what`, and checks the bar's
// `aria-activedescendant` straight away and once a frame has passed.
// Returns the bar's state then.
async function step(page, what, action) {
  await action();
  assert.deepEqual((await read(page)).problems, [], `straight after ${what}`);
  await settle(page);
  const state = await read(page);
  assert.deepEqual(state.problems, [], `after ${what}`);
  return state;
}

// Presses `key` on whatever has focus
const press = (page, key) => step(page, key, () => page.keyboard.press(key));

// Types `text` a character at a time, as a person does
async function type(page, text) {
  let state;
  for (const character of text)
    state = await step(page, `typing "${character}"`, () =>
      page.keyboard.type(character),
    );
  return state;
}

// Clicks the element `selector` finds
const click = (page, selector) =>
  step(page, `clicking ${selector}`, () => page.click(selector));

// What the page has recorded: the results chosen, the buttons pressed, and
// the number of submits
const recorded = (page) =>
  page.evaluate(() => ({
    chosen: window.chosen,
    pressed: window.pressed,
    submitted: window.submitted,
  }));

// Where the caret is in the field that has focus, as [start, end]
const caret = (page) =>
  page.evaluate(() => [
    document.activeElement.selectionStart,
    document.activeElement.selectionEnd,
  ]);

// The compositions in a form with no list displayed
const undisplayed = ["form, no panel", "form, closed list", "form, no list"];

test(`the page runs React ${reactVersion}, from the components' node_modules, and bundles no other copy`, async () => {
  assert.deepEqual(strays, []);
  assert.equal(
    await withPage("form, no panel", (page) =>
      page.evaluate(() => window.searchBarKeys.version),
    ),
    reactVersion,
  );
});

test("in a form, Enter in the input submits it while no list is displayed: with no panel, a closed panel with a list, and an open panel with no list", async () => {
  const results = {};
  for (const name of undisplayed)
    results[name] = await withPage(name, async (page) => {
      await click(page, input);
      const typed = await type(page, "abc");
      assert.equal(typed.expanded, "false", name);
      const entered = await press(page, "Enter");
      return {
        ...(await recorded(page)),
        selected: entered.selected,
        active: entered.active,
      };
    });
  assert.deepEqual(results, {
    "form, no panel": {
      chosen: [],
      pressed: ["search"],
      submitted: 1,
      selected: null,
      active: null,
    },
    "form, closed list": {
      chosen: [],
      pressed: ["search"],
      submitted: 1,
      selected: "--",
      active: null,
    },
    "form, no list": {
      chosen: [],
      pressed: ["search"],
      submitted: 1,
      selected: null,
      active: null,
    },
  });
});

test("in a form, Enter with a list displayed doesn't submit it: at rest it chooses nothing, and on a result it chooses that result", () =>
  withPage("form, open list", async (page) => {
    await click(page, input);
    const typed = await type(page, "abc");
    assert.deepEqual(
      { expanded: typed.expanded, selected: typed.selected },
      { expanded: "true", selected: "--" },
    );
    await press(page, "Enter");
    assert.deepEqual(await recorded(page), {
      chosen: [],
      pressed: [],
      submitted: 0,
    });
    const moved = await press(page, "ArrowDown");
    assert.deepEqual(
      { selected: moved.selected, active: moved.active },
      { selected: "Michelle Yeoh", active: "Michelle Yeoh" },
    );
    await press(page, "Enter");
    assert.deepEqual(await recorded(page), {
      chosen: ["Michelle Yeoh"],
      pressed: [],
      submitted: 0,
    });
  }));

test('Home and End move the caret while no list is displayed, from 3 in "abcdef" to 0 and 6, as in a plain input: with no panel, a closed panel with a list, and an open panel with no list', async () => {
  // Types "abcdef" in the field `selector` finds, moves the caret to 3,
  // presses Home, moves it back to 3, and presses End, reading the caret
  // after each move
  const walk = async (page, selector) => {
    await click(page, selector);
    await type(page, "abcdef");
    const carets = [];
    for (const keys of [
      ["ArrowLeft", "ArrowLeft", "ArrowLeft"],
      ["Home"],
      ["ArrowRight", "ArrowRight", "ArrowRight"],
      ["End"],
    ]) {
      for (const key of keys) await press(page, key);
      carets.push(await caret(page));
    }
    return carets;
  };
  const expected = [
    [3, 3],
    [0, 0],
    [3, 3],
    [6, 6],
  ];
  const results = {};
  for (const name of undisplayed)
    results[name] = await withPage(name, async (page) => ({
      plain: await walk(page, plain),
      bar: await walk(page, input),
      expanded: (await read(page)).expanded,
    }));
  assert.deepEqual(
    results,
    Object.fromEntries(
      undisplayed.map((name) => [
        name,
        { plain: expected, bar: expected, expanded: "false" },
      ]),
    ),
  );
});

test("with the panel closed after moving to a result, the arrow keys, Enter and Ctrl+N/J/P/K leave cmdk's selection where it was, name nothing, and Enter chooses nothing", () =>
  withPage("escape closes", async (page) => {
    await click(page, input);
    await press(page, "ArrowDown");
    const moved = await press(page, "ArrowDown");
    assert.deepEqual(
      [moved.expanded, moved.selected, moved.active, moved.listbox],
      ["true", "P. Ramlee", "P. Ramlee", "P. Ramlee"],
    );
    const closed = await press(page, "Escape");
    const at = ({ expanded, selected, active, listbox, value }) => ({
      expanded,
      selected,
      active,
      listbox,
      value,
    });
    const still = {
      expanded: "false",
      selected: "P. Ramlee",
      active: null,
      listbox: null,
      value: "",
    };
    assert.deepEqual(at(closed), still);
    const keys = [
      "ArrowDown",
      "ArrowUp",
      "Enter",
      "Control+n",
      "Control+j",
      "Control+p",
      "Control+k",
    ];
    const after = [];
    for (const key of keys) after.push([key, at(await press(page, key))]);
    assert.deepEqual(
      after,
      keys.map((key) => [key, still]),
    );
    assert.deepEqual((await recorded(page)).chosen, []);
  }));

// Clicks the input, types "si", moves to Siti Nurhaliza if `highlight`,
// Tabs to Clear and presses `key`. Then does the same, Tabbing on to Search.
// Returns what each pass leaves: the results "si" shows, the one named
// after moving, where the Tabs land, whether the list is displayed there,
// what cmdk has selected and the query once `key` is pressed, and what the
// page has recorded.
async function pressButtons(page, key, highlight) {
  const passes = [];
  for (const button of ["clear", "search"]) {
    await click(page, input);
    const typed = await type(page, "si");
    const moved = highlight ? await press(page, "ArrowDown") : typed;
    let on = await press(page, "Tab");
    if (button === "search") on = await press(page, "Tab");
    const pressed = await press(page, key);
    passes.push({
      shown: typed.shown,
      named: moved.active,
      focus: on.focus,
      expanded: on.expanded,
      // Pressing Clear empties the query, which unmounts the list
      selected: button === "search" ? pressed.selected : on.selected,
      value: pressed.value,
      ...(await recorded(page)),
    });
  }
  return passes;
}

// What `pressButtons` should leave in a bar whose list is displayed or not
// while a button has focus
const pressedButtons = (expanded, highlight) => {
  const pass = {
    shown: ["Siti Nurhaliza", "M. Nasir"],
    named: highlight ? "Siti Nurhaliza" : null,
    expanded,
    selected: highlight ? "Siti Nurhaliza" : "--",
    chosen: [],
    submitted: 0,
  };
  return [
    { ...pass, focus: "clear", value: "", pressed: ["clear"] },
    { ...pass, focus: "search", value: "si", pressed: ["clear", "search"] },
  ];
};

test("Enter and Space on the clear and search buttons press them and choose no result, in the docs' example, whose list is closed while a button has focus", async () => {
  const results = {};
  for (const key of ["Enter", "Space"])
    for (const highlight of [false, true])
      results[`${key}, ${highlight ? "on a result" : "at rest"}`] =
        await withPage("docs", (page) => pressButtons(page, key, highlight));
  assert.deepEqual(results, {
    "Enter, at rest": pressedButtons("false", false),
    "Enter, on a result": pressedButtons("false", true),
    "Space, at rest": pressedButtons("false", false),
    "Space, on a result": pressedButtons("false", true),
  });
});

test("Enter and Space on the clear and search buttons press them and choose no result, with the list displayed while a button has focus", async () => {
  const results = {};
  for (const key of ["Enter", "Space"])
    for (const highlight of [false, true])
      results[`${key}, ${highlight ? "on a result" : "at rest"}`] =
        await withPage("open only", (page) =>
          pressButtons(page, key, highlight),
        );
  assert.deepEqual(results, {
    "Enter, at rest": pressedButtons("true", false),
    "Enter, on a result": pressedButtons("true", true),
    "Space, at rest": pressedButtons("true", false),
    "Space, on a result": pressedButtons("true", true),
  });
});

test("after the list unmounts and mounts again, the input and the listbox name a displayed result or nothing, and ArrowDown is named: leaving by a click outside or Shift+Tab, and coming back by a click or Tab", async (t) => {
  const ways = {
    click: [
      (page) => click(page, "[data-test=outside]"),
      (page) => click(page, input),
    ],
    Tab: [(page) => press(page, "Shift+Tab"), (page) => press(page, "Tab")],
  };
  const results = {};
  for (const name of ["open only", "open only, uncontrolled"])
    for (const [way, [leave, back]] of Object.entries(ways))
      results[`${name}, ${way}`] = await withPage(name, async (page) => {
        await click(page, input);
        await type(page, "si");
        const moved = await press(page, "ArrowDown");
        assert.deepEqual(
          [moved.selected, moved.active, moved.listbox],
          ["Siti Nurhaliza", "Siti Nurhaliza", "Siti Nurhaliza"],
        );
        const left = await leave(page);
        const listed = await page.evaluate(
          () => !!document.querySelector("[cmdk-list]"),
        );
        // `step` checks that a result named on return is selected and
        // displayed, and that the listbox names it too
        const returned = await back(page);
        t.diagnostic(
          `${name}, ${way}: on return the input names ${returned.active ?? "nothing"}`,
        );
        const again = await press(page, "ArrowDown");
        // ArrowDown moves on from the result highlighted on return, or to the
        // first from nothing
        const next =
          returned.shown[returned.shown.indexOf(returned.selected) + 1];
        return {
          left: {
            focus: left.focus,
            expanded: left.expanded,
            active: left.active,
            listed,
          },
          returned: {
            focus: returned.focus,
            expanded: returned.expanded,
            shown: returned.shown,
          },
          again: {
            moved: next !== undefined && again.selected === next,
            named: [again.active, again.listbox].every(
              (named) => named === again.selected,
            ),
          },
        };
      });
  const expected = (focus) => ({
    left: { focus, expanded: "false", active: null, listed: false },
    returned: {
      focus: "input",
      expanded: "true",
      shown: ["Siti Nurhaliza", "M. Nasir"],
    },
    again: { moved: true, named: true },
  });
  assert.deepEqual(results, {
    "open only, click": expected("body"),
    "open only, Tab": expected("plain"),
    "open only, uncontrolled, click": expected("body"),
    "open only, uncontrolled, Tab": expected("plain"),
  });
});

test("typing or Backspace after moving into the results, so the result stays shown, leaves nothing highlighted and nothing named, and Enter chooses nothing: with a controlled input and an uncontrolled one", async () => {
  const results = {};
  for (const name of ["docs", "open only, uncontrolled"])
    results[name] = await withPage(name, async (page) => {
      const steps = [];
      // What a step leaves: the query, whether Siti Nurhaliza is shown,
      // and what's highlighted and named
      const left = (what, { value, shown, selected, active, listbox }) =>
        steps.push({
          what,
          value,
          shown: shown.includes("Siti Nurhaliza"),
          selected,
          active,
          listbox,
        });
      await click(page, input);
      await type(page, "si");
      left("ArrowDown", await press(page, "ArrowDown"));
      left('"t"', await type(page, "t"));
      left("Enter", await press(page, "Enter"));
      left("ArrowDown", await press(page, "ArrowDown"));
      left("Backspace", await press(page, "Backspace"));
      left("Enter", await press(page, "Enter"));
      return { steps, chosen: (await recorded(page)).chosen };
    });
  const on = (what, value) => ({
    what,
    value,
    shown: true,
    selected: "Siti Nurhaliza",
    active: "Siti Nurhaliza",
    listbox: "Siti Nurhaliza",
  });
  const rest = (what, value) => ({
    what,
    value,
    shown: true,
    selected: "--",
    active: null,
    listbox: null,
  });
  const expected = {
    steps: [
      on("ArrowDown", "si"),
      rest('"t"', "sit"),
      rest("Enter", "sit"),
      on("ArrowDown", "sit"),
      rest("Backspace", "si"),
      rest("Enter", "si"),
    ],
    chosen: [],
  };
  assert.deepEqual(results, {
    docs: expected,
    "open only, uncontrolled": expected,
  });
});

test("with a list displayed, the arrow keys, Enter, Ctrl+N/J/P/K and Alt+arrows pressed in the input still act on the results", () =>
  withPage("escape closes", async (page) => {
    await click(page, input);
    // Each key, and the result it highlights after the one before
    const walk = [
      ["ArrowDown", "Michelle Yeoh"],
      ["ArrowDown", "P. Ramlee"],
      ["ArrowUp", "Michelle Yeoh"],
      ["Control+n", "P. Ramlee"],
      ["Control+p", "Michelle Yeoh"],
      ["Control+j", "P. Ramlee"],
      ["Control+k", "Michelle Yeoh"],
      ["Alt+ArrowDown", "P. Ramlee"],
      ["Alt+ArrowUp", "Michelle Yeoh"],
    ];
    const walked = [];
    for (const [key] of walk) {
      const { expanded, selected, active, listbox } = await press(page, key);
      walked.push([key, { expanded, selected, active, listbox }]);
    }
    assert.deepEqual(
      walked,
      walk.map(([key, name]) => [
        key,
        { expanded: "true", selected: name, active: name, listbox: name },
      ]),
    );
    await press(page, "Enter");
    assert.deepEqual((await recorded(page)).chosen, ["Michelle Yeoh"]);
  }));
