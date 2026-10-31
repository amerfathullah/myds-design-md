// DateField and TimeField show one of four looks. A valid field has an
// `otl-gray-200` border, and focus turns it `otl-primary-300` with a 3px
// `fr-primary` ring. An invalid field has an `otl-danger-300` border, which
// focus keeps, adding a 3px `fr-danger` ring. The look follows the <input>'s
// `aria-invalid`, which the `invalid` prop sets and an `aria-invalid` prop
// overrides, so it matches what assistive technology announces.
import assert from "node:assert/strict";
import { test } from "node:test";

import { chromium } from "playwright";

import { compileComponents, cvaCall, cvaClasses } from "./components.mjs";

const fields = [
  {
    name: "date",
    file: "date-field.tsx",
    container: "datefield_container_cva",
    input: "datefield_cva",
    attributes: 'type="date" value="2026-09-26"',
  },
  {
    name: "time",
    file: "time-field.tsx",
    container: "timefield_container_cva",
    input: "timefield_cva",
    attributes: 'type="time" value="09:30" step="60"',
  },
];

// The props a consumer passes, and the look they give at rest. A disabled
// field can't take focus, so it keeps that look.
const cases = [
  { name: "invalid omitted", props: {}, look: "valid" },
  { name: "invalid={null}", props: { invalid: null }, look: "valid" },
  { name: "invalid={false}", props: { invalid: false }, look: "valid" },
  { name: "invalid", props: { invalid: true }, look: "invalid" },
  { name: "aria-invalid", props: { "aria-invalid": true }, look: "invalid" },
  {
    name: "invalid aria-invalid={false}",
    props: { invalid: true, "aria-invalid": false },
    look: "valid",
  },
  { name: "disabled", props: { disabled: true }, look: "valid" },
  {
    name: "disabled invalid",
    props: { disabled: true, invalid: true },
    look: "invalid",
  },
];

// The tokens the looks use, in each theme
const colours = {
  light: {
    "otl-gray-200": "rgb(228, 228, 231)",
    "otl-primary-300": "rgb(150, 183, 255)",
    "otl-danger-300": "rgb(252, 165, 165)",
    "fr-primary": "rgba(150, 183, 255, 0.4)",
    "fr-danger": "rgba(252, 165, 165, 0.4)",
  },
  dark: {
    "otl-gray-200": "rgb(39, 39, 42)",
    "otl-primary-300": "rgb(29, 78, 216)",
    "otl-danger-300": "rgb(185, 28, 28)",
    "fr-primary": "rgba(29, 78, 216, 0.4)",
    "fr-danger": "rgba(185, 28, 28, 0.4)",
  },
};

// Each look's border and 3px ring
const looks = {
  valid: { border: "otl-gray-200" },
  "valid, focused": { border: "otl-primary-300", ring: "fr-primary" },
  invalid: { border: "otl-danger-300" },
  "invalid, focused": { border: "otl-danger-300", ring: "fr-danger" },
};

// `shadow-button`, under any ring
const shadowButton = "rgba(0, 0, 0, 0.07) 0px 1px 3px 0px";

// The markup DateField or TimeField renders for `props`: a wrapper with the
// classes its cva returns for them, defaults applied, around an <input> that
// takes `disabled`, and `aria-invalid` from `invalid` unless an
// `aria-invalid` prop overrides it
function render({ file, container, input, attributes }, id, props) {
  const ariaInvalid =
    "aria-invalid" in props
      ? props["aria-invalid"]
      : (props.invalid ?? undefined);
  return `<div class="${cvaCall(file, container, props)}"><input id="${id}" ${attributes}${
    props.disabled ? " disabled" : ""
  }${ariaInvalid == null ? "" : ` aria-invalid="${ariaInvalid}"`} class="${cvaClasses(file, input)}"></div>`;
}

// Runs in the page: each wrapper's border colour and box shadow at rest, then
// with its <input> focused
function readLooks(ids) {
  // Drop the empty layers Tailwind composes box-shadow from
  const shadow = (value) =>
    value
      .split(/,(?![^(]*\))/)
      .map((layer) => layer.trim())
      .filter((layer) => !/^rgba\(0, 0, 0, 0\)( 0px)+$/.test(layer))
      .join(", ");
  const look = (wrapper) => {
    const style = getComputedStyle(wrapper);
    return { border: style.borderTopColor, shadow: shadow(style.boxShadow) };
  };
  return Object.fromEntries(
    ids.map((id) => {
      const input = document.getElementById(id);
      const atRest = look(input.parentElement);
      input.focus();
      const focused = look(input.parentElement);
      input.blur();
      return [id, { atRest, focused }];
    }),
  );
}

test("each DateField and TimeField state has its border and ring, in both themes", async () => {
  const samples = fields.flatMap((field) =>
    ["small", "medium", "large"].map((size) => ({
      field,
      size,
      cases: cases.map((sample, i) => ({
        ...sample,
        id: `${field.name}-${size}-${i}`,
        key: `${field.name} ${size}, ${sample.name}`,
      })),
    })),
  );
  const css = await compileComponents(fields.map(({ file }) => file));
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    // Each field and size's samples share a `group`, as DESIGN.md suggests
    // wrapping fields in `<fieldset className="group">`, so every valid
    // field sits beside invalid ones in a group
    await page.setContent(
      `<!doctype html><html><head><style>${css}</style></head><body>${samples
        .map(
          ({ field, size, cases }) =>
            `<div class="group">${cases
              .map(({ id, props }) => render(field, id, { size, ...props }))
              .join("")}</div>`,
        )
        .join("")}</body></html>`,
    );
    const ids = samples.flatMap(({ cases }) => cases.map(({ id }) => id));

    const actual = {};
    const expected = {};
    for (const theme of ["light", "dark"]) {
      await page.evaluate(
        (dark) => document.documentElement.classList.toggle("dark", dark),
        theme === "dark",
      );
      const read = await page.evaluate(readLooks, ids);
      const want = (name) => {
        const { border, ring } = looks[name];
        return {
          border: colours[theme][border],
          shadow: ring
            ? `${colours[theme][ring]} 0px 0px 0px 3px, ${shadowButton}`
            : shadowButton,
        };
      };
      for (const { cases } of samples)
        for (const { id, key, props, look } of cases) {
          actual[`${key} (${theme})`] = read[id].atRest;
          expected[`${key} (${theme})`] = want(look);
          actual[`${key} (${theme}), focused`] = read[id].focused;
          expected[`${key} (${theme}), focused`] = want(
            props.disabled ? look : `${look}, focused`,
          );
        }
    }
    assert.deepEqual(actual, expected);
  } finally {
    await browser.close();
  }
});
