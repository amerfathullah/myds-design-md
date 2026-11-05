// DateField and TimeField show one of four looks. A valid field has an
// `otl-gray-200` border, and focus turns it `otl-primary-300` with a 3px
// `fr-primary` ring. An invalid field has an `otl-danger-300` border, which
// focus keeps, adding a 3px `fr-danger` ring. The look follows the <input>'s
// `aria-invalid`, which the `invalid` prop sets and an `aria-invalid` prop
// overrides, so it matches what assistive technology announces.
//
// A disabled field also has a `bg-washed` frame in `txt-black-500` with a
// `not-allowed` cursor, a `txt-black-500` icon, and a `bg-washed` input in
// `txt-black-500` with a `not-allowed` cursor. That look follows the
// <input>'s `:disabled`, so a disabled `<fieldset>` gives it as the
// `disabled` prop does, and no class on an ancestor gives it to a field
// whose input is enabled.
import assert from "node:assert/strict";
import { test } from "node:test";

import { chromium } from "playwright";

import { compileComponents, cvaCall, cvaClasses } from "./components.mjs";
import {
  cases,
  colours,
  shadowButton,
  stateAttributes,
} from "./field-looks.mjs";

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

// Each look's border and 3px ring
const looks = {
  valid: { border: "otl-gray-200" },
  "valid, focused": { border: "otl-primary-300", ring: "fr-primary" },
  invalid: { border: "otl-danger-300" },
  "invalid, focused": { border: "otl-danger-300", ring: "fr-danger" },
};

// The markup DateField or TimeField renders for `props`: a wrapper with the
// classes its cva returns for them, defaults applied, then `className`,
// around the icon and an <input> that takes `disabled` and `aria-invalid`
function render({ file, container, input, attributes }, id, props) {
  const classes = [cvaCall(file, container, props), props.className]
    .filter(Boolean)
    .join(" ");
  return `<div class="${classes}"><svg class="${cvaCall(
    file,
    "icon_cva",
    props,
  )}" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M2 10h16" stroke="currentColor"/></svg><input id="${id}" ${attributes}${stateAttributes(
    props,
  )} class="${cvaClasses(file, input)}"></div>`;
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
    // Each field and size's samples share a `group`, as fields do inside a
    // `<fieldset className="group">`, which dims their Labels when disabled,
    // so every valid field sits beside invalid ones in a group
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

// A disabled `<fieldset>` around the field `html`. It disables every control
// in it but those in its first `<legend>`.
const inDisabledFieldset = (html, classes = "") =>
  `<fieldset disabled${classes ? ` class="${classes}"` : ""}>${html}</fieldset>`;

// The props a consumer passes and where the field sits, and whether that
// disables its <input>. A field beside a disabled <input> shares a parent
// with it: a consumer's `group` or `group/field`, or the fieldset whose
// first `<legend>` holds the field.
const disabledCases = [
  { name: "enabled", props: {}, disabled: false },
  { name: "disabled", props: { disabled: true }, disabled: true },
  {
    name: "disabled invalid",
    props: { disabled: true, invalid: true },
    disabled: true,
  },
  // A background passed in `className` gives way to the disabled one
  {
    name: 'disabled className="bg-transparent"',
    props: { disabled: true, className: "bg-transparent" },
    disabled: true,
  },
  {
    name: "in <fieldset disabled>",
    props: {},
    place: (html) => inDisabledFieldset(html),
    disabled: true,
  },
  {
    name: 'in <fieldset disabled class="group">',
    props: {},
    place: (html) => inDisabledFieldset(html, "group"),
    disabled: true,
  },
  {
    name: "disabled={false} in <fieldset disabled>",
    props: { disabled: false },
    place: (html) => inDisabledFieldset(html),
    disabled: true,
  },
  {
    name: "invalid in <fieldset disabled>",
    props: { invalid: true },
    place: (html) => inDisabledFieldset(html),
    disabled: true,
  },
  {
    name: "in a <fieldset>",
    props: {},
    place: (html) => `<fieldset>${html}</fieldset>`,
    disabled: false,
  },
  {
    name: 'beside a disabled <input> in a "group"',
    props: {},
    place: (html) =>
      `<div class="group">${html}<input aria-label="Other" disabled></div>`,
    disabled: false,
  },
  {
    name: 'beside a disabled <input> in a "group/field"',
    props: {},
    place: (html) =>
      `<div class="group/field">${html}<input aria-label="Other" disabled></div>`,
    disabled: false,
  },
  {
    name: "in the first <legend> of a <fieldset disabled>",
    props: {},
    place: (html) =>
      inDisabledFieldset(`<legend>${html}</legend><input aria-label="Other">`),
    disabled: false,
  },
  {
    name: 'in the first <legend> of a <fieldset disabled class="group">',
    props: {},
    place: (html) =>
      inDisabledFieldset(
        `<legend>${html}</legend><input aria-label="Other">`,
        "group",
      ),
    disabled: false,
  },
];

// The frame's, the icon's and the input's colours and cursors in each look.
// `auto` and `default` are what Chromium computes when nothing sets a cursor
// on the frame and on a date or time input.
const disabledLooks = {
  enabled: {
    frame: { background: "bg-white", colour: "txt-black-900", cursor: "auto" },
    icon: "txt-black-700",
    input: {
      background: "transparent",
      colour: "txt-black-900",
      cursor: "default",
    },
  },
  disabled: {
    frame: {
      background: "bg-washed",
      colour: "txt-black-500",
      cursor: "not-allowed",
    },
    icon: "txt-black-500",
    input: {
      background: "bg-washed",
      colour: "txt-black-500",
      cursor: "not-allowed",
    },
  },
};

// Runs in the page: whether each <input> is disabled, and its frame's, its
// icon's and its own colours and cursor, and the frame's border colour
function readDisabledLooks(ids) {
  const look = (element) => {
    const { backgroundColor, color, cursor } = getComputedStyle(element);
    return { background: backgroundColor, colour: color, cursor };
  };
  return Object.fromEntries(
    ids.map((id) => {
      const input = document.getElementById(id);
      const frame = input.parentElement;
      return [
        id,
        {
          disabled: input.matches(":disabled"),
          border: getComputedStyle(frame).borderTopColor,
          frame: look(frame),
          icon: getComputedStyle(frame.querySelector("svg")).color,
          input: look(input),
        },
      ];
    }),
  );
}

test("a DateField or TimeField whose input is disabled, by `disabled` or a disabled fieldset, has the disabled look, in both themes", async () => {
  const samples = fields.flatMap((field) =>
    ["small", "medium", "large"].flatMap((size) =>
      disabledCases.map((sample, i) => {
        const id = `${field.name}-${size}-disabled-${i}`;
        const html = render(field, id, { size, ...sample.props });
        return {
          ...sample,
          id,
          key: `${field.name} ${size}, ${sample.name}`,
          html: sample.place ? sample.place(html) : html,
        };
      }),
    ),
  );
  const css = await compileComponents(fields.map(({ file }) => file));
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(
      `<!doctype html><html><head><style>${css}</style></head><body>${samples
        .map(({ html }) => `<div>${html}</div>`)
        .join("")}</body></html>`,
    );
    const ids = samples.map(({ id }) => id);

    const actual = {};
    const expected = {};
    for (const theme of ["light", "dark"]) {
      await page.evaluate(
        (dark) => document.documentElement.classList.toggle("dark", dark),
        theme === "dark",
      );
      const read = await page.evaluate(readDisabledLooks, ids);
      const colour = (token) => colours[theme][token];
      // An element's look, its tokens resolved in `theme`
      const resolve = ({ background, colour: text, cursor }) => ({
        background: colour(background),
        colour: colour(text),
        cursor,
      });
      for (const { id, key, props, disabled } of samples) {
        const { frame, icon, input } =
          disabledLooks[disabled ? "disabled" : "enabled"];
        actual[`${key} (${theme})`] = read[id];
        expected[`${key} (${theme})`] = {
          disabled,
          border: colour(props.invalid ? "otl-danger-300" : "otl-gray-200"),
          frame: resolve(frame),
          icon: colour(icon),
          input: resolve(input),
        };
      }
    }
    assert.deepEqual(actual, expected);
  } finally {
    await browser.close();
  }
});
