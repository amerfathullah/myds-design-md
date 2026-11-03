// The Switch (Toggle and ToggleThumb) by keyboard, by mouse and in a disabled
// fieldset, in Chromium. Its native checkbox is the switch and its one tab
// stop. Space toggles it once, natively. Enter toggles it once too, and
// doesn't submit the form around it. Inside a `<fieldset disabled>`, a Switch
// without its own `disabled` is disabled as it looks: Tab skips it, and no
// key, click on its track or click on its Label changes it. Each holds in a
// Switch rendered on the client and in one hydrated from server HTML.
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
  html = `<!doctype html><html><head><style>${css}</style><style>*,::before,::after{transition:none!important;animation:none!important}</style></head><body class="bg-bg-white"><div id="csr"></div><div id="ssr"></div><script>${script}</script></body></html>`;
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
    await page.waitForFunction(() => window.ready.length === 2);
    assert.deepEqual(
      await page.evaluate(() => ({
        recoverable: window.recoverableErrors,
        kept: window.serverInputs.every((input) => input.isConnected),
      })),
      { recoverable: [], kept: true },
    );
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

// What the page shows of the switch `id`: whether it's checked and focused,
// the track's state, the changes it reported, and the times its mode's form
// was submitted
const stateOf = (page, id) =>
  page.evaluate((id) => {
    const input = document.getElementById(id);
    return {
      checked: input.checked,
      focused: document.activeElement === input,
      track: input.nextElementSibling.dataset.state,
      changes: window.changes
        .filter((change) => change.id === id)
        .map(({ checked }) => checked),
      submits: window.submits.filter((mode) => id.startsWith(`${mode}-`))
        .length,
    };
  }, id);

// Clicks the middle of the element `selector` picks with the mouse. Unlike
// page.click(), it doesn't wait for a label of a disabled control to be
// enabled.
async function clickMiddle(page, selector) {
  const { x, y, width, height } = await page.locator(selector).boundingBox();
  await page.mouse.click(x + width / 2, y + height / 2);
}

test("Tab reaches the switch, the native checkbox, in one press from the field before it", () =>
  withPage(async (page) => {
    const actual = {};
    for (const mode of modes) {
      await page.focus(`#${mode}-text`);
      await page.keyboard.press("Tab");
      actual[mode] = await page.evaluate(() => {
        const element = document.activeElement;
        return `${element.tagName} ${element.type} ${element.getAttribute("role")} #${element.id}`;
      });
    }
    assert.deepEqual(actual, {
      csr: "INPUT checkbox switch #csr-switch",
      ssr: "INPUT checkbox switch #ssr-switch",
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
    for (const mode of modes)
      assert.deepEqual(actual[mode], [
        {
          checked: true,
          focused: true,
          track: "checked",
          changes: [true],
          submits: 0,
        },
        {
          checked: false,
          focused: true,
          track: "unchecked",
          changes: [true, false],
          submits: 0,
        },
      ]);
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
    for (const mode of modes)
      assert.deepEqual(actual[mode], [
        {
          checked: true,
          focused: true,
          track: "checked",
          changes: [true],
          submits: 0,
        },
        {
          checked: false,
          focused: true,
          track: "unchecked",
          changes: [true, false],
          submits: 0,
        },
        1,
      ]);
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
    for (const mode of modes)
      assert.deepEqual(actual[mode], [
        {
          checked: true,
          focused: true,
          track: "checked",
          changes: [true],
          submits: 0,
        },
        {
          checked: false,
          focused: true,
          track: "unchecked",
          changes: [true, false],
          submits: 0,
        },
      ]);
  }));

test("in a disabled fieldset, a switch without `disabled` is disabled: Tab skips it, and no key or click changes it", () =>
  withPage(async (page) => {
    const actual = {};
    const expected = {};
    for (const mode of modes) {
      const id = `${mode}-fieldset-switch`;
      const disabled = await page.$eval(`#${id}`, (input) =>
        input.matches(":disabled"),
      );
      // Tab goes from the button before the fieldset to the one after it
      await page.focus(`[data-test=${mode}-before]`);
      await page.keyboard.press("Tab");
      const tabbedTo = await page.evaluate(() =>
        document.activeElement.getAttribute("data-test"),
      );
      // Script can't focus it either, so Space and Enter reach the page
      await page.focus(`#${id}`);
      const focused = (await stateOf(page, id)).focused;
      await page.keyboard.press(" ");
      await page.keyboard.press("Enter");
      await clickMiddle(page, `#${id} + span`);
      await clickMiddle(page, `[data-test=${id}-label]`);
      actual[mode] = {
        disabled,
        tabbedTo,
        focused,
        ...(await stateOf(page, id)),
      };
      expected[mode] = {
        disabled: true,
        tabbedTo: `${mode}-after`,
        focused: false,
        checked: false,
        track: "unchecked",
        changes: [],
        submits: 0,
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
      const inFieldset = await look(`${mode}-fieldset-switch`);
      assert.deepEqual(inFieldset, await look(`${mode}-disabled-switch`));
      assert.equal(inFieldset.cursor, "not-allowed");
      // Unlike an enabled one
      assert.notDeepEqual(inFieldset, await look(`${mode}-switch`));
    }
  }));

test("a focused switch whose fieldset is then disabled doesn't toggle on Space or Enter", () =>
  withPage(async (page) => {
    const actual = {};
    for (const mode of modes) {
      const id = `${mode}-fieldset-switch`;
      await page.$eval(`#${mode}-fieldset`, (fieldset) => {
        fieldset.disabled = false;
      });
      await page.focus(`#${id}`);
      await page.$eval(`#${mode}-fieldset`, (fieldset) => {
        fieldset.disabled = true;
      });
      await page.keyboard.press(" ");
      await page.keyboard.press("Enter");
      const { checked, track, changes } = await stateOf(page, id);
      actual[mode] = { checked, track, changes };
    }
    for (const mode of modes)
      assert.deepEqual(actual[mode], {
        checked: false,
        track: "unchecked",
        changes: [],
      });
  }));
