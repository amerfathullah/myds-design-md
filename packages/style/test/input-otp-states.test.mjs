// InputOTP's slots show its own state, and only its own. A slot has an
// `otl-gray-200` border, a `bg-white` fill and `txt-black-900` text. It has
// an `otl-danger-300` border exactly when its own InputOTP's <input> has
// `aria-invalid="true"`, which the `invalid` prop sets and an `aria-invalid`
// prop overrides. It has a `bg-washed` fill and `txt-black-500` text exactly
// when that <input> is `:disabled`, by the `disabled` prop or a disabled
// `<fieldset>`, with or without `className="group"`. While the input has
// focus, the active slot has an `otl-primary-300` border and a 3px
// `fr-primary` ring, or keeps its `otl-danger-300` border and rings
// `fr-danger` when invalid.
//
// No other control switches either look on: not an invalid or disabled
// control beside the InputOTP inside an element marked `group`, or
// `group/input-otp`, or the library's own `group`s, such as an open
// AccordionItem; not one among the InputOTP's children; and not another
// InputOTP beside it or among its children. An InputOTP placed among the
// children of another still takes the outer one's look, which this suite
// doesn't check.
//
// The page is input-otp-states.page.jsx: the React components themselves,
// bundled with esbuild, on the stylesheet the Tailwind import compiles for
// full.css's sources.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual } from "node:util";

import { build } from "esbuild";
import { chromium } from "playwright";

import { registryDefine } from "../../react/registry-define.mjs";
import { compile, fullCssSources } from "./compile.mjs";
import { colours } from "./field-looks.mjs";

const pageSource = fileURLToPath(
  new URL("./input-otp-states.page.jsx", import.meta.url),
);
// The page imports React and the components' dependencies from where the
// components resolve them, so the bundle has one copy of React
const reactModules = fileURLToPath(
  new URL("../../react/node_modules", import.meta.url),
);

// Each InputOTP on the page, by its input's `data-test`: where it sits or
// what it's given, and the state of its own <input>, which its slots' look
// follows. `active` is the slot the focused input makes active: the first
// empty one. A disabled input can't take focus.
const otps = {
  valid: { name: "valid" },
  "valid-filled": { name: "valid, two digits filled", active: 2 },
  invalid: { name: "invalid", invalid: true },
  "invalid-filled": {
    name: "invalid, two digits filled",
    invalid: true,
    active: 2,
  },
  "aria-invalid": { name: "aria-invalid", invalid: true },
  "invalid-aria-invalid-false": { name: "invalid aria-invalid={false}" },
  "invalid-container-group": {
    name: 'invalid containerClassName="group"',
    invalid: true,
  },
  disabled: { name: "disabled", disabled: true },
  "disabled-invalid": {
    name: "disabled invalid",
    disabled: true,
    invalid: true,
  },
  "fieldset-disabled": { name: "in <fieldset disabled>", disabled: true },
  "fieldset-disabled-group": {
    name: 'in <fieldset disabled className="group">',
    disabled: true,
  },
  "fieldset-disabled-group-beside-invalid": {
    name: 'in <fieldset disabled className="group">, beside an invalid Input',
    disabled: true,
  },
  "fieldset-disabled-group-legend": {
    name: 'in the first <legend> of a <fieldset disabled className="group">',
  },
  "group-beside-invalid-input": {
    name: 'in a <div className="group">, beside an invalid Input',
  },
  "group-beside-disabled-button": {
    name: 'in a <div className="group">, beside a disabled Button',
  },
  "group-beside-select": {
    name: 'in a <div className="group">, beside a <select> with a disabled placeholder <option>',
  },
  "accordion-beside-invalid-input": {
    name: "in an open AccordionItem, beside an invalid Input",
  },
  "named-group-beside-invalid-input": {
    name: 'in a <div className="group/input-otp">, beside an invalid Input',
  },
  "named-group-beside-disabled-button": {
    name: 'in a <div className="group/input-otp">, beside a disabled Button',
  },
  "child-disabled-button": {
    name: "with a disabled Button among its children",
  },
  "child-invalid-input": { name: "with an invalid Input among its children" },
  "child-invalid-otp": {
    name: "with an invalid InputOTP among its children",
  },
  "child-invalid-otp-inner": {
    name: "invalid, among a valid InputOTP's children",
    invalid: true,
  },
  "child-disabled-otp": {
    name: "with a disabled InputOTP among its children",
  },
  "child-disabled-otp-inner": {
    name: "disabled, among an enabled InputOTP's children",
    disabled: true,
  },
  "pair-invalid": {
    name: 'invalid, in a <div className="group"> with a disabled InputOTP',
    invalid: true,
  },
  "pair-disabled": {
    name: 'disabled, in a <div className="group"> with an invalid InputOTP',
    disabled: true,
  },
  "named-pair-invalid": {
    name: 'invalid, in a <div className="group/input-otp"> with a disabled InputOTP',
    invalid: true,
  },
  "named-pair-disabled": {
    name: 'disabled, in a <div className="group/input-otp"> with an invalid InputOTP',
    disabled: true,
  },
};

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

// Compares only the entries that differ, so a failure lists just those
function assertEntries(actual, expected) {
  const differ = Object.keys({ ...actual, ...expected }).filter(
    (key) => !isDeepStrictEqual(actual[key], expected[key]),
  );
  const pick = (entries) =>
    Object.fromEntries(differ.map((key) => [key, entries[key]]));
  assert.deepEqual(pick(actual), pick(expected));
}

// Runs in the page: the InputOTP whose input is `data-test={id}`, as the
// state of its <input>, whether it has focus, and each slot's border, fill,
// text colour and ring layers: the spread-only box-shadow layers that aren't
// Tailwind's empty, transparent ones
function readOtp(id) {
  const input = document.querySelector(`input[data-test="${id}"]`);
  const slots = input
    .closest("[data-input-otp-container]")
    .querySelectorAll(":scope > [data-otp-slot]");
  return {
    input: {
      invalid: input.getAttribute("aria-invalid") === "true",
      disabled: input.matches(":disabled"),
      focused: document.activeElement === input,
    },
    slots: [...slots].map((slot) => {
      const style = getComputedStyle(slot);
      return {
        border: style.borderTopColor,
        background: style.backgroundColor,
        colour: style.color,
        ring: style.boxShadow
          .split(/,(?![^(]*\))/)
          .map((layer) => layer.trim())
          .filter(
            (layer) =>
              /^rgba?\([^)]*\) 0px 0px 0px [\d.]+px$/.test(layer) &&
              !layer.startsWith("rgba(0, 0, 0, 0)"),
          ),
      };
    }),
  };
}

// What the InputOTP `otp` shows in `theme`, at rest or with its input
// focused
function expectedOtp(otp, theme, focused) {
  const { invalid = false, disabled = false, active = 0 } = otp;
  const colour = (token) => colours[theme][token];
  const isActive = (index) => focused && !disabled && index === active;
  return {
    input: { invalid, disabled, focused: focused && !disabled },
    slots: [0, 1, 2].map((index) => ({
      border: colour(
        invalid
          ? "otl-danger-300"
          : isActive(index)
            ? "otl-primary-300"
            : "otl-gray-200",
      ),
      background: colour(disabled ? "bg-washed" : "bg-white"),
      colour: colour(disabled ? "txt-black-500" : "txt-black-900"),
      ring: isActive(index)
        ? [`${colour(invalid ? "fr-danger" : "fr-primary")} 0px 0px 0px 3px`]
        : [],
    })),
  };
}

test("each InputOTP's slots show its own input's state, and no other control's, at rest and focused, in both themes", async () => {
  const context = await browser.newContext({
    viewport: { width: 800, height: 2400 },
  });
  try {
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setContent(html);
    await page.waitForSelector("input[data-test=pair-disabled]");

    // The page holds the InputOTPs the test checks, and no others
    assert.deepEqual(
      (
        await page.$$eval("input[data-input-otp]", (inputs) =>
          inputs.map((input) => input.dataset.test),
        )
      ).sort(),
      Object.keys(otps).sort(),
    );

    const actual = {};
    const expected = {};
    for (const theme of ["light", "dark"]) {
      await page.evaluate(
        (dark) => document.documentElement.classList.toggle("dark", dark),
        theme === "dark",
      );
      for (const [id, otp] of Object.entries(otps)) {
        const key = `${otp.name} (${theme})`;
        actual[key] = await page.evaluate(readOtp, id);
        expected[key] = expectedOtp(otp, theme, false);

        // A disabled input doesn't take focus. Two frames let input-otp
        // mark the slot at the caret active.
        await page.evaluate(
          (id) => document.querySelector(`input[data-test="${id}"]`).focus(),
          id,
        );
        await page.evaluate(
          () =>
            new Promise((resolve) =>
              requestAnimationFrame(() => requestAnimationFrame(resolve)),
            ),
        );
        actual[`${key}, focused`] = await page.evaluate(readOtp, id);
        expected[`${key}, focused`] = expectedOtp(otp, theme, true);
        await page.evaluate(() => document.activeElement?.blur());
      }
    }
    assertEntries(actual, expected);
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }
});
