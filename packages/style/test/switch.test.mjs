// The Switch (Toggle and ToggleThumb) by keyboard, by mouse and in a disabled
// fieldset, in Chromium. Its native checkbox is the switch and its one tab
// stop. Space toggles it once, natively. Enter toggles it once too, and
// doesn't submit the form around it. Inside a `<fieldset disabled>`, a Switch
// without its own `disabled` is disabled as it looks: Tab skips it, and no
// key, click on its track or click on its Label changes it, whether the
// fieldset was disabled before it mounted or after it had focus. Each holds
// in a Switch rendered on the client and in one hydrated from server HTML.
// Apart from focus, the track looks as it did before the checkbox became the
// switch.
//
// The page is switch.page.jsx: the React components themselves, bundled with
// esbuild, on the stylesheet the Tailwind import compiles for full.css's
// sources.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";
import { chromium } from "playwright";

import { compile, fullCssSources } from "./compile.mjs";

const pageSource = fileURLToPath(new URL("./switch.page.jsx", import.meta.url));
// The page imports React and the components' dependencies from where the
// components resolve them, so the bundle has one copy of React
const reactModules = fileURLToPath(
  new URL("../../react/node_modules", import.meta.url),
);

// An empty part of the page, where the pointer rests
const away = { x: 700, y: 1100 };

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
      define: { "process.env.NODE_ENV": '"production"' },
      logLevel: "silent",
    }),
    compile(`${fullCssSources()}\n@source "${pageSource}";`),
  ]);
  const script = bundle.outputFiles[0].text.replaceAll(
    "</script",
    "<\\/script",
  );
  // Transitions and animations off, so each state reads as it ends
  html = `<!doctype html><html><head><style>${css}</style><style>*,::before,::after{transition:none!important;animation:none!important}</style></head><body class="bg-bg-white"><div id="csr"></div><div id="ssr"></div><div id="looks"></div><script>${script}</script></body></html>`;
  browser = await chromium.launch();
});
after(() => browser?.close());

const modes = ["csr", "ssr"];

// Opens the page and runs `use` on it, once React has rendered and hydrated
// it. Nothing logs an error, and hydration keeps the server's inputs.
async function withPage(use) {
  const context = await browser.newContext({
    viewport: { width: 800, height: 1200 },
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
    await page.waitForFunction(() => window.ready.length === 3);
    assert.deepEqual(
      await page.evaluate(() => ({
        recoverable: window.recoverableErrors,
        kept: window.serverInputs.every((input) => input.isConnected),
      })),
      { recoverable: [], kept: true },
    );
    await page.mouse.move(away.x, away.y);
    const result = await use(page);
    assert.deepEqual(errors, []);
    return result;
  } finally {
    await context.close();
  }
}

// Presses Tab until the element `selector` picks has focus
async function tabTo(page, selector) {
  for (let presses = 0; presses < 50; presses++) {
    if (
      await page.evaluate((s) => !!document.activeElement?.matches(s), selector)
    )
      return;
    await page.keyboard.press("Tab");
  }
  throw new Error(`Tab never reaches ${selector}`);
}

// What has focus: an element's id, or its `data-test`, its tag name, and its
// type and role if it has them
const focusedElement = (page) =>
  page.evaluate(() => {
    const element = document.activeElement;
    return [
      element.tagName,
      element.type,
      element.getAttribute("role"),
      element.id ? `#${element.id}` : element.dataset.test,
    ]
      .filter(Boolean)
      .join(" ");
  });

// What the page shows of the switch `id`: its role, whether it's checked and
// focused, the track's state, the changes it reported, and the times its
// form was submitted
const stateOf = (page, id) =>
  page.evaluate((id) => {
    const input = document.getElementById(id);
    return {
      role: input.getAttribute("role"),
      checked: input.checked,
      focused: document.activeElement === input,
      track: input.nextElementSibling.dataset.state,
      changes: window.changes
        .filter((change) => change.id === id)
        .map(({ checked }) => checked),
      submits: window.submits.filter((form) => form === input.form?.id).length,
    };
  }, id);

// The state of a focused switch after one toggle, then after another
const toggledTwice = [
  {
    role: "switch",
    checked: true,
    focused: true,
    track: "checked",
    changes: [true],
    submits: 0,
  },
  {
    role: "switch",
    checked: false,
    focused: true,
    track: "unchecked",
    changes: [true, false],
    submits: 0,
  },
];

// Clicks the middle of the element `selector` picks with the mouse. Unlike
// page.click(), it doesn't wait for a label of a disabled control to be
// enabled.
async function clickMiddle(page, selector) {
  const { x, y, width, height } = await page.locator(selector).boundingBox();
  await page.mouse.click(x + width / 2, y + height / 2);
}

test("Tab reaches the switch, the native checkbox, in one press from the field before it, and the next press leaves it", () =>
  withPage(async (page) => {
    const actual = {};
    for (const mode of modes) {
      await page.focus(`#${mode}-text`);
      await page.keyboard.press("Tab");
      const first = await focusedElement(page);
      await page.keyboard.press("Tab");
      actual[mode] = [first, await focusedElement(page)];
    }
    assert.deepEqual(actual, {
      csr: ["INPUT checkbox switch #csr-switch", "BUTTON submit csr-submit"],
      ssr: ["INPUT checkbox switch #ssr-switch", "BUTTON submit ssr-submit"],
    });
  }));

test("Space toggles the switch once", () =>
  withPage(async (page) => {
    const actual = {};
    for (const mode of modes) {
      const id = `${mode}-switch`;
      await tabTo(page, `#${id}`);
      await page.keyboard.press(" ");
      const once = await stateOf(page, id);
      await page.keyboard.press(" ");
      actual[mode] = [once, await stateOf(page, id)];
    }
    assert.deepEqual(actual, { csr: toggledTwice, ssr: toggledTwice });
  }));

test("Enter toggles the switch once and doesn't submit its form, which Enter in a text field does", () =>
  withPage(async (page) => {
    const actual = {};
    for (const mode of modes) {
      const id = `${mode}-switch`;
      await tabTo(page, `#${id}`);
      await page.keyboard.press("Enter");
      const once = await stateOf(page, id);
      await page.keyboard.press("Enter");
      const twice = await stateOf(page, id);
      // The form does submit on Enter, from its text field
      await page.focus(`#${mode}-text`);
      await page.keyboard.press("Enter");
      actual[mode] = [once, twice, (await stateOf(page, id)).submits];
    }
    const expected = [...toggledTwice, 1];
    assert.deepEqual(actual, { csr: expected, ssr: expected });
  }));

test("a click on the track or on the Label toggles the switch once and focuses it", () =>
  withPage(async (page) => {
    const actual = {};
    for (const mode of modes) {
      const id = `${mode}-switch`;
      await clickMiddle(page, `#${id} + span`);
      const byTrack = await stateOf(page, id);
      await clickMiddle(page, `[data-test=${id}-label]`);
      actual[mode] = [byTrack, await stateOf(page, id)];
    }
    assert.deepEqual(actual, { csr: toggledTwice, ssr: toggledTwice });
  }));

// Tries to use the switch `id`, in a disabled fieldset, and returns what the
// page shows of it: whether it matches `:disabled`, its accessibility
// snapshot, where Tab goes from the button before it, whether script can
// focus it, and its state after Space and Enter, an Enter keydown dispatched
// on it, and clicks on its track and its Label
async function useDisabled(page, id) {
  const disabled = await page.$eval(`#${id}`, (input) =>
    input.matches(":disabled"),
  );
  const snapshot = await page.locator(`#${id}`).ariaSnapshot();
  // Tab goes from the button before the fieldset to the one after it, where
  // Space and Enter do nothing
  await page.focus(`[data-test=${id}-before]`);
  await page.keyboard.press("Tab");
  const tabbedTo = await focusedElement(page);
  await page.keyboard.press(" ");
  await page.keyboard.press("Enter");
  // Script can't focus it either, so Space and Enter reach the page
  await page.focus(`#${id}`);
  const focusedByScript = (await stateOf(page, id)).focused;
  await page.keyboard.press(" ");
  await page.keyboard.press("Enter");
  // A keydown reaches it only when dispatched on it
  await page.$eval(`#${id}`, (input) =>
    input.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
        cancelable: true,
      }),
    ),
  );
  await clickMiddle(page, `#${id} + span`);
  await clickMiddle(page, `[data-test=${id}-label]`);
  return {
    disabled,
    snapshot,
    tabbedTo,
    focusedByScript,
    ...(await stateOf(page, id)),
  };
}

// What `useDisabled` finds for the switch `id`, named `name`
const disabledSwitch = (id, name) => ({
  disabled: true,
  snapshot: `- switch "${name}" [disabled]`,
  tabbedTo: `BUTTON button ${id}-after`,
  focusedByScript: false,
  role: "switch",
  checked: false,
  focused: false,
  track: "unchecked",
  changes: [],
  submits: 0,
});

test("in a disabled fieldset, a switch without `disabled` is disabled: Tab skips it, and no key or click changes it", () =>
  withPage(async (page) => {
    const actual = {};
    const expected = {};
    for (const mode of modes) {
      const id = `${mode}-in-fieldset`;
      actual[mode] = await useDisabled(page, id);
      expected[mode] = disabledSwitch(id, "Share my data");
    }
    assert.deepEqual(actual, expected);
  }));

test("a switch whose fieldset is disabled after it mounted and had focus is disabled the same way", () =>
  withPage(async (page) => {
    const actual = {};
    const expected = {};
    for (const mode of modes) {
      const id = `${mode}-late`;
      await page.focus(`[data-test=${id}-before]`);
      await page.keyboard.press("Tab");
      const hadFocus = (await stateOf(page, id)).focused;
      // As React does when the fieldset's `disabled` prop changes
      await page.$eval(`#${id}-fieldset`, (fieldset) => {
        fieldset.disabled = true;
      });
      await page.keyboard.press(" ");
      await page.keyboard.press("Enter");
      actual[mode] = { hadFocus, ...(await useDisabled(page, id)) };
      expected[mode] = {
        hadFocus: true,
        ...disabledSwitch(id, "Pemberitahuan e-mel"),
      };
    }
    assert.deepEqual(actual, expected);
  }));

test("in a disabled fieldset, a switch's track looks like one with `disabled`", () =>
  withPage(async (page) => {
    const look = (id) =>
      page.$eval(`#${id} + span`, (track) => {
        const { backgroundColor, cursor } = getComputedStyle(track);
        return { backgroundColor, cursor };
      });
    for (const mode of modes) {
      const inFieldset = await look(`${mode}-in-fieldset`);
      assert.deepEqual(inFieldset, await look(`${mode}-disabled`));
      assert.equal(inFieldset.cursor, "not-allowed");
      // Unlike an enabled one
      assert.notDeepEqual(inFieldset, await look(`${mode}-switch`));
    }
  }));

// main's Toggle (4757821), before the checkbox became the switch, measured
// in this harness: each size's track, its thumb, and how far the thumb
// slides when checked. The thumb sits 3px in from the track's left and
// bottom.
const mainSizes = {
  small: { track: "24x16", thumb: "10x10", slide: "8px" },
  medium: { track: "30x20", thumb: "14x14", slide: "10px" },
  large: { track: "36x24", thumb: "18x18", slide: "12px" },
};

// main's Toggle (4757821), measured in this harness: in each theme and
// state, the track's colour at rest and hovered, the thumb's colour, and the
// cursor. They're the same in each size.
const mainColours = {
  light: {
    unchecked: {
      track: "rgb(228, 228, 231)",
      hovered: "rgb(212, 212, 216)",
      thumb: "rgb(255, 255, 255)",
      cursor: "pointer",
    },
    checked: {
      track: "rgb(37, 99, 235)",
      hovered: "rgb(37, 99, 235)",
      thumb: "rgb(255, 255, 255)",
      cursor: "pointer",
    },
    disabled: {
      track: "rgb(244, 244, 245)",
      hovered: "rgb(244, 244, 245)",
      thumb: "rgb(255, 255, 255)",
      cursor: "not-allowed",
    },
    "disabled-checked": {
      track: "rgb(194, 213, 255)",
      hovered: "rgb(194, 213, 255)",
      thumb: "rgb(255, 255, 255)",
      cursor: "not-allowed",
    },
  },
  dark: {
    unchecked: {
      track: "rgb(39, 39, 42)",
      hovered: "rgb(63, 63, 70)",
      thumb: "rgb(255, 255, 255)",
      cursor: "pointer",
    },
    checked: {
      track: "rgb(99, 148, 255)",
      hovered: "rgb(99, 148, 255)",
      thumb: "rgb(255, 255, 255)",
      cursor: "pointer",
    },
    disabled: {
      track: "rgb(29, 29, 33)",
      hovered: "rgb(29, 29, 33)",
      thumb: "rgb(24, 24, 27)",
      cursor: "not-allowed",
    },
    "disabled-checked": {
      track: "rgb(23, 37, 84)",
      hovered: "rgb(23, 37, 84)",
      thumb: "rgb(24, 24, 27)",
      cursor: "not-allowed",
    },
  },
};

// Runs in the page: the look of the track after the checkbox `id`, and of
// its thumb, the track's `::before`
function readLook(id) {
  const track = document.getElementById(id).nextElementSibling;
  const { width, height } = track.getBoundingClientRect();
  const { backgroundColor, cursor } = getComputedStyle(track);
  const thumb = getComputedStyle(track, "::before");
  const px = (value) => parseFloat(value);
  return {
    track: `${width}x${height}`,
    colour: backgroundColor,
    cursor,
    thumb: `${px(thumb.width)}x${px(thumb.height)}`,
    thumbAt: `${thumb.left} ${thumb.bottom}`,
    slide: thumb.translate,
    thumbColour: thumb.backgroundColor,
  };
}

test("apart from focus, each size's track looks as on main: at rest, hovered, checked, and with `disabled`", () =>
  withPage(async (page) => {
    const actual = {};
    const expected = {};
    for (const theme of ["light", "dark"]) {
      await page.evaluate(
        (dark) => document.documentElement.classList.toggle("dark", dark),
        theme === "dark",
      );
      for (const [size, { track, thumb, slide }] of Object.entries(mainSizes))
        for (const [state, colours] of Object.entries(mainColours[theme])) {
          const id = `look-${size}-${state}`;
          const checked = state === "checked" || state === "disabled-checked";
          await page.mouse.move(away.x, away.y);
          const atRest = await page.evaluate(readLook, id);
          const { x, y, width, height } = await page
            .locator(`#${id} + span`)
            .boundingBox();
          await page.mouse.move(x + width / 2, y + height / 2);
          const hovered = await page.evaluate(readLook, id);
          const look = (colour) => ({
            track,
            colour,
            cursor: colours.cursor,
            thumb,
            thumbAt: "3px 3px",
            slide: checked ? slide : "none",
            thumbColour: colours.thumb,
          });
          actual[`${size}, ${state}, at rest (${theme})`] = atRest;
          expected[`${size}, ${state}, at rest (${theme})`] = look(
            colours.track,
          );
          actual[`${size}, ${state}, hovered (${theme})`] = hovered;
          expected[`${size}, ${state}, hovered (${theme})`] = look(
            colours.hovered,
          );
        }
    }
    assert.deepEqual(actual, expected);
  }));
