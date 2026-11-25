// Select and Dropdown with a disabled trigger, in Chromium (#223, #224). A
// SelectTrigger or DropdownTrigger whose own button is `:disabled` stays shut
// to a mouse press and a touch tap, and nothing calls `onOpenChange`,
// `onValueChange` or an item's `onSelect`, whatever disabled the button:
// `disabled` on Select, SelectTrigger or DropdownTrigger, a `<fieldset
// disabled>` around it (plain, `group`, nested or disabled after mount, even
// with `disabled={false}` on the component), or `disabled` on the Button
// inside `DropdownTrigger asChild`. Radix opens Dropdown on `pointerdown`, and
// Select on a mouse's `pointerdown`, and Chromium still sends a disabled
// button `pointerdown`. happy-dom ignores a disabled fieldset, so this needs a
// real browser. Select's shown value, and
// what its form holds once the fieldset is enabled again, stay as they were,
// and the press leaves focus where it was. A trigger the browser leaves
// enabled opens by mouse, touch and keyboard, and takes a pick: an enabled
// one, one in the first `<legend>` of a disabled fieldset, and one beside a
// disabled Button in a consumer's `group`. A consumer's `onPointerDown`, on
// SelectTrigger, on DropdownTrigger or on the asChild Button, is still called
// on every press.
//
// SelectLabel, the prefix a SelectValue `label` draws, is `txt-black-disabled`
// whenever the trigger it sits in is `:disabled`, in both themes, with a
// string, element, consumer-wrapped or recoloured label. An enabled Select's
// label keeps its resting colour at rest, under a disabled AccordionItem,
// under any `group` with `data-disabled`, and in the first `<legend>` of a
// disabled fieldset. Apart from that label, every trigger looks as it did,
// and Chromium's accessibility tree reports it as it did: disabled exactly
// when the button is `:disabled`.
//
// The page is select-dropdown-disabled.page.jsx: the React components
// themselves, bundled with esbuild, on the stylesheet the Tailwind import
// compiles for full.css's sources. select-dropdown-disabled.cases.mjs lists
// its fixtures.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";
import { chromium } from "playwright";

import { registryDefine } from "../../react/registry-define.mjs";
import { compile, fullCssSources } from "./compile.mjs";
import { colours } from "./field-looks.mjs";
import { fixtures, selectKinds } from "./select-dropdown-disabled.cases.mjs";

const pageSource = fileURLToPath(
  new URL("./select-dropdown-disabled.page.jsx", import.meta.url),
);
// The page imports React and the components' dependencies from where the
// components resolve them, so the bundle has one copy of React
const reactModules = fileURLToPath(
  new URL("../../react/node_modules", import.meta.url),
);

let browser;
let html;
before(async () => {
  const [bundle, css] = await Promise.all([
    build({
      entryPoints: [pageSource],
      bundle: true,
      write: false,
      format: "iife",
      jsx: "automatic",
      nodePaths: [reactModules],
      define: { ...registryDefine, "process.env.NODE_ENV": '"production"' },
      logLevel: "silent",
    }),
    compile(`${fullCssSources()}\n@source "${pageSource}";`),
  ]);
  const script = bundle.outputFiles[0].text.replaceAll(
    "</script",
    "<\\/script",
  );
  // Transitions and animations off, so each state reads as it ends
  html = `<!doctype html><html><head><style>${css}</style><style>*,::before,::after{transition:none!important;animation:none!important}</style></head><body class="bg-bg-white"><div id="root"></div><script>${script}</script></body></html>`;
  browser = await chromium.launch();
});
after(() => browser?.close());

const isSelect = (fixture) => selectKinds.includes(fixture.kind);
// Whether the fixture's trigger is `:disabled`: every one that doesn't open
const isDisabled = (fixture) => fixture.state !== "open";
const byState = (state) =>
  fixtures.filter((fixture) => fixture.state === state);

// Opens the page and runs `use` on it, once React has rendered it and the
// fixtures' `late` fieldsets are disabled. `hasTouch` lets the test tap.
// Nothing logs an error.
async function withPage({ hasTouch = false } = {}, use) {
  const context = await browser.newContext({
    viewport: { width: 1200, height: 900 },
    hasTouch,
  });
  try {
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (["error", "warning"].includes(message.type()))
        errors.push(message.text());
    });
    await page.setContent(html);
    await page.waitForFunction(() => window.ready);
    await page.evaluate(() => {
      for (const fieldset of document.querySelectorAll("[data-late]"))
        fieldset.disabled = true;
    });
    const result = await use(page);
    assert.deepEqual(errors, []);
    return result;
  } finally {
    await context.close();
  }
}

// Waits for React and the browser to render what the last input did
const settle = (page) =>
  page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );

const trigger = (page, id) => page.locator(`[data-test="${id}-trigger"]`);

// Presses the middle of the fixture `id`'s trigger with `input`, "mouse" or
// "touch". A plain click() would wait for a disabled trigger to be enabled.
async function press(page, id, input) {
  const button = trigger(page, id);
  await button.scrollIntoViewIfNeeded();
  const box = await button.boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  if (input === "touch") await page.touchscreen.tap(x, y);
  else {
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.up();
  }
  await settle(page);
}

// Whether the fixture `id` shows its list or menu: its trigger's
// `aria-expanded`, and how many lists and menus the page holds
const openState = (page, id) =>
  page.evaluate(
    (id) => ({
      expanded: document
        .querySelector(`[data-test="${id}-trigger"]`)
        .getAttribute("aria-expanded"),
      lists: document.querySelectorAll('[role="listbox"], [role="menu"]')
        .length,
    }),
    id,
  );

// Picks Banana in an open Select or Delete in an open Dropdown, the second
// option or item, with `input`
async function pick(page, fixture, input) {
  if (input === "keyboard") {
    await page.keyboard.press("ArrowDown");
    // Radix Select moves focus on ArrowDown inside a timeout, and an Enter
    // before it would pick the option that had focus
    await page.waitForTimeout(100);
    await page.keyboard.press("Enter");
  } else {
    const item = isSelect(fixture)
      ? page.getByRole("option", { name: "Banana" })
      : page.getByRole("menuitem", { name: "Delete" });
    await (input === "touch" ? item.tap() : item.click());
  }
  await settle(page);
}

// Closes any open list or menu with Escape, and waits until the page takes
// pointer input again
async function close(page) {
  for (let presses = 0; presses < 3; presses++) {
    const open = await page.evaluate(
      () => !!document.querySelector('[role="listbox"], [role="menu"]'),
    );
    if (!open) break;
    await page.keyboard.press("Escape");
    await settle(page);
  }
  await page.waitForFunction(
    () =>
      !document.querySelector('[role="listbox"], [role="menu"]') &&
      document.body.style.pointerEvents !== "none",
  );
}

// What the fixture `id` reported: `onOpenChange`, `onValueChange` and its
// items' `onSelect`, or only its consumer's `onPointerDown` presses
const reported = (page, id, { presses = false } = {}) =>
  page.evaluate(
    ({ id, presses }) =>
      window.calls
        .filter(
          (call) => call.id === id && (call.kind === "pointerdown") === presses,
        )
        .map(({ kind, value }) => (presses ? value : { kind, value })),
    { id, presses },
  );

// What the fixture `id`'s Select shows in its trigger, and the values its
// form holds once the fieldset around it, if any, is enabled again. The
// fieldset is then left as it was.
const formState = (page, id) =>
  page.evaluate((id) => {
    const box = document.querySelector(`[data-test="${id}"]`);
    const fieldset = box.querySelector("fieldset");
    const disabled = fieldset?.disabled;
    if (fieldset) fieldset.disabled = false;
    const values = new FormData(box.querySelector("form")).getAll("fruit");
    if (fieldset) fieldset.disabled = disabled;
    return {
      shown: box.querySelector(`[data-test="${id}-trigger"]`).textContent,
      values,
    };
  }, id);

// Puts focus on `#start`, outside every fixture
const focusStart = (page) =>
  page.evaluate(() => document.getElementById("start").focus());
const startFocused = (page) =>
  page.evaluate(() => document.activeElement?.id === "start");

// The fixture's reports after a pick of the second option or item, once the
// list or menu has closed again
const pickReports = (fixture) => [
  { kind: "open", value: true },
  fixture.kind === "single"
    ? { kind: "value", value: "banana" }
    : fixture.kind === "multiple"
      ? { kind: "value", value: ["apple", "banana"] }
      : { kind: "select", value: "delete" },
  { kind: "open", value: false },
];

for (const input of ["mouse", "touch"]) {
  test(`a ${input} press on a trigger a fieldset or an asChild Button disables opens nothing, reports nothing, keeps Select's value and form data, and leaves focus where it was`, () =>
    withPage({ hasTouch: input === "touch" }, async (page) => {
      const actual = {};
      const want = {};
      for (const fixture of byState("blocked")) {
        const before = await formState(page, fixture.id);
        await focusStart(page);
        await press(page, fixture.id, input);
        const opened = await openState(page, fixture.id);
        const focusKept = await startFocused(page);
        // What a list or menu that opened would let a user do
        if (opened.expanded === "true" || opened.lists)
          await pick(page, fixture, input);
        await close(page);
        actual[fixture.id] = {
          ...opened,
          focusKept,
          reports: await reported(page, fixture.id),
          ...(await formState(page, fixture.id)),
        };
        want[fixture.id] = {
          expanded: "false",
          lists: 0,
          focusKept: true,
          reports: [],
          ...before,
        };
      }
      assert.deepEqual(actual, want);
    }));

  test(`a ${input} press on a trigger with \`disabled\` on Select, SelectTrigger or DropdownTrigger opens nothing and reports nothing`, () =>
    withPage({ hasTouch: input === "touch" }, async (page) => {
      const actual = {};
      const want = {};
      for (const fixture of byState("prop")) {
        await press(page, fixture.id, input);
        actual[fixture.id] = {
          ...(await openState(page, fixture.id)),
          reports: await reported(page, fixture.id),
        };
        await close(page);
        want[fixture.id] = { expanded: "false", lists: 0, reports: [] };
      }
      assert.deepEqual(actual, want);
    }));
}

// The triggers with `disabled` on Select, SelectTrigger or DropdownTrigger,
// by input, split by whether a press already left focus where it was on
// main: Radix Select stops a mouse press itself, but not a touch tap, and
// Radix DropdownMenu stops neither
for (const [input, name, filter] of [
  ["mouse", "a Select's trigger", isSelect],
  ["mouse", "a DropdownTrigger", (fixture) => !isSelect(fixture)],
  ["touch", "a Select's trigger or a DropdownTrigger", () => true],
]) {
  test(`a ${input} press on ${name} with \`disabled\` leaves focus where it was`, () =>
    withPage({ hasTouch: input === "touch" }, async (page) => {
      const pressed = byState("prop").filter(filter);
      const actual = {};
      for (const fixture of pressed) {
        await focusStart(page);
        await press(page, fixture.id, input);
        actual[fixture.id] = await startFocused(page);
        await close(page);
      }
      assert.deepEqual(
        actual,
        Object.fromEntries(pressed.map(({ id }) => [id, true])),
      );
    }));
}

for (const input of ["mouse", "touch", "keyboard"]) {
  test(`an enabled trigger, one in the first legend of a disabled fieldset and one beside a disabled Button in a group open to the ${input}, and a pick reports`, () =>
    withPage({ hasTouch: input === "touch" }, async (page) => {
      const actual = {};
      const want = {};
      for (const fixture of byState("open")) {
        if (input === "keyboard") {
          await trigger(page, fixture.id).focus();
          await page.keyboard.press("Enter");
          await settle(page);
        } else await press(page, fixture.id, input);
        const opened = await openState(page, fixture.id);
        await pick(page, fixture, input);
        await close(page);
        actual[fixture.id] = {
          expanded: opened.expanded,
          listed: opened.lists > 0,
          reports: await reported(page, fixture.id),
        };
        want[fixture.id] = {
          expanded: "true",
          listed: true,
          reports: pickReports(fixture),
        };
      }
      assert.deepEqual(actual, want);
    }));
}

const pointerDownFixtures = fixtures.filter(
  (fixture) => fixture.consumerPointerDown,
);

for (const input of ["mouse", "touch"]) {
  test(`a consumer's onPointerDown on SelectTrigger, DropdownTrigger or an asChild Button is called on a ${input} press of an enabled trigger, which opens`, () =>
    withPage({ hasTouch: input === "touch" }, async (page) => {
      const actual = {};
      const want = {};
      for (const fixture of pointerDownFixtures.filter(
        ({ state }) => state === "open",
      )) {
        await press(page, fixture.id, input);
        actual[fixture.id] = {
          pressed: await reported(page, fixture.id, { presses: true }),
          expanded: (await openState(page, fixture.id)).expanded,
        };
        await close(page);
        want[fixture.id] = { pressed: [input], expanded: "true" };
      }
      assert.deepEqual(actual, want);
    }));

  test(`a consumer's onPointerDown on SelectTrigger, DropdownTrigger or an asChild Button is called on a ${input} press in a disabled fieldset, and the trigger stays shut`, () =>
    withPage({ hasTouch: input === "touch" }, async (page) => {
      const actual = {};
      const want = {};
      for (const fixture of pointerDownFixtures.filter(
        ({ state }) => state === "blocked",
      )) {
        await press(page, fixture.id, input);
        actual[fixture.id] = {
          pressed: await reported(page, fixture.id, { presses: true }),
          ...(await openState(page, fixture.id)),
          reports: await reported(page, fixture.id),
        };
        await close(page);
        want[fixture.id] = {
          pressed: [input],
          expanded: "false",
          lists: 0,
          reports: [],
        };
      }
      assert.deepEqual(actual, want);
    }));
}

// The colour of the fixture `id`'s SelectLabel: the element in its trigger
// whose only content is the text "Fruit"
const labelColour = (page, id) =>
  trigger(page, id).evaluate(
    (button) =>
      getComputedStyle(
        [...button.querySelectorAll("span")].find(
          (span) =>
            span.childNodes.length === 1 &&
            span.firstChild.nodeType === Node.TEXT_NODE &&
            span.textContent === "Fruit",
        ),
      ).color,
  );

const setTheme = (page, theme) =>
  page.evaluate(
    (dark) => document.documentElement.classList.toggle("dark", dark),
    theme === "dark",
  );

// The SelectLabel colours of the Select fixtures `filter` picks, in each
// theme: `txt-black-disabled` on a disabled trigger, and the resting colour
// on an enabled one
async function labelColours(page, filter) {
  const actual = {};
  const want = {};
  for (const theme of ["light", "dark"]) {
    await setTheme(page, theme);
    for (const fixture of fixtures.filter(
      (fixture) => isSelect(fixture) && filter(fixture),
    )) {
      const key = `${theme} ${fixture.id}`;
      actual[key] = await labelColour(page, fixture.id);
      want[key] =
        colours[theme][
          isDisabled(fixture)
            ? "txt-black-disabled"
            : fixture.kind === "multiple"
              ? "txt-black-900"
              : "txt-black-500"
        ];
    }
  }
  return [actual, want];
}

// The fixtures whose label sits under a `group` with `data-disabled`
const inDisabledGroup = (fixture) =>
  ["accordion", "data-disabled-group"].includes(fixture.wrap);

test("SelectLabel is txt-black-disabled, in both themes, with `disabled` on Select or SelectTrigger, with a string, element, wrapped or recoloured label", () =>
  withPage({}, async (page) =>
    assert.deepEqual(
      ...(await labelColours(page, (fixture) => fixture.state === "prop")),
    ),
  ));

test("SelectLabel is txt-black-disabled, in both themes, in a plain, group or nested disabled fieldset, with a string, element, wrapped or recoloured label", () =>
  withPage({}, async (page) =>
    assert.deepEqual(
      ...(await labelColours(page, (fixture) => fixture.state === "blocked")),
    ),
  ));

test("an enabled Select's SelectLabel keeps its resting colour, in both themes, at rest and in the first legend of a disabled fieldset", () =>
  withPage({}, async (page) =>
    assert.deepEqual(
      ...(await labelColours(
        page,
        (fixture) => fixture.state === "open" && !inDisabledGroup(fixture),
      )),
    ),
  ));

test("an enabled Select's SelectLabel keeps its resting colour, in both themes, under a disabled AccordionItem and under a group with data-disabled", () =>
  withPage({}, async (page) =>
    assert.deepEqual(...(await labelColours(page, inDisabledGroup))),
  ));

// The colours the looks below use that field-looks.mjs doesn't hold, the same
// in each theme: primitive `primary-600`, and the border colour Tailwind's
// preflight gives an unstyled button
const primary600 = "rgb(37, 99, 235)";
const white = "rgb(255, 255, 255)";
const preflightBorder = "rgb(228, 228, 231)";

// How a trigger of `kind` looks in `theme`, enabled or `:disabled`, as on
// main: the button's colours and cursor, its chevron's colour and a
// `multiple` Select's counter. `pointer` is the cursor index.css gives every
// enabled button. A plain DropdownTrigger is an unstyled button in the page's
// text colour.
function look(kind, theme, disabled) {
  const c = colours[theme];
  if (kind === "plain")
    return {
      colour: theme === "dark" ? white : "rgb(0, 0, 0)",
      background: c.transparent,
      border: preflightBorder,
      cursor: disabled ? "default" : "pointer",
    };
  const button = disabled
    ? {
        colour: c["txt-black-disabled"],
        background: c["bg-white-disabled"],
        border: c.transparent,
        cursor: "not-allowed",
      }
    : {
        colour: c[kind === "asChild" ? "txt-black-700" : "txt-black-900"],
        background: c["bg-white"],
        border: c["otl-gray-200"],
        cursor: "pointer",
      };
  if (kind === "asChild") return button;
  return {
    ...button,
    chevron: c["txt-black-900"],
    ...(kind === "multiple" && {
      counter: disabled
        ? [c["bg-white-disabled"], c["txt-black-disabled"]]
        : [primary600, white],
    }),
  };
}

test("apart from SelectLabel, each trigger looks as on main in both themes: disabled exactly when its button is", () =>
  withPage({}, async (page) => {
    const actual = {};
    const want = {};
    for (const theme of ["light", "dark"]) {
      await setTheme(page, theme);
      for (const fixture of fixtures) {
        const key = `${theme} ${fixture.id}`;
        actual[key] = await trigger(page, fixture.id).evaluate(
          (button, kind) => {
            const style = getComputedStyle(button);
            const counter = button.querySelector(".rounded-full");
            return {
              colour: style.color,
              background: style.backgroundColor,
              border: style.borderColor,
              cursor: style.cursor,
              ...(button.querySelector("svg") && {
                chevron: getComputedStyle(button.querySelector("svg")).color,
              }),
              ...(kind === "multiple" && {
                counter: [
                  getComputedStyle(counter).backgroundColor,
                  getComputedStyle(counter).color,
                ],
              }),
            };
          },
          fixture.kind,
        );
        want[key] = look(fixture.kind, theme, isDisabled(fixture));
      }
    }
    // The counter's unnamed `group-disabled:` matches a disabled fieldset
    // marked `group` whose first legend holds the Select, as on main. That
    // leak is known, and out of #223's and #224's scope.
    want["light multiple-legend-group"].counter = [
      colours.light["bg-white-disabled"],
      colours.light["txt-black-900"],
    ];
    want["dark multiple-legend-group"].counter = [
      colours.dark["bg-white-disabled"],
      colours.dark["txt-black-900"],
    ];
    assert.deepEqual(actual, want);
  }));

test("Chromium's accessibility tree reports each trigger as on main: disabled exactly when its button is", () =>
  withPage({}, async (page) => {
    const actual = {};
    const want = {};
    for (const fixture of fixtures) {
      actual[fixture.id] = await trigger(page, fixture.id).ariaSnapshot();
      const disabled = isDisabled(fixture) ? " [disabled]" : "";
      // A string label names a Select's trigger. An element label names
      // nothing, and reads as part of the value.
      const value = fixture.kind === "single" ? "Apple" : "1";
      want[fixture.id] = !isSelect(fixture)
        ? `- button "Menu"${disabled}`
        : fixture.label
          ? `- combobox${disabled}: Fruit ${value}`
          : `- combobox "Fruit"${disabled}: ${fixture.kind === "single" ? value : `"${value}"`}`;
    }
    assert.deepEqual(actual, want);
  }));
