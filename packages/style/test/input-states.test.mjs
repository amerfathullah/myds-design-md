// Input and TextArea show one of four looks on their editable field, the
// <input> or <textarea>. A valid field has its resting border, transparent on
// Input and `otl-gray-200` on TextArea, and focus turns it `otl-primary-300`
// with a 3px `fr-primary` ring. An invalid field has an `otl-danger-300`
// border, which focus keeps, adding a 3px `fr-danger` ring. Neither shows any
// other shadow. The look follows the field's `aria-invalid`, which the
// `invalid` prop sets and an `aria-invalid` prop overrides, so it matches
// what assistive technology announces. On Input only the editable field turns
// red: the wrapper keeps its `otl-gray-200` border, and the addons and icons
// keep their colours.
import assert from "node:assert/strict";
import { test } from "node:test";

import { chromium } from "playwright";

import { compileComponents, cvaClasses, jsxClasses } from "./components.mjs";
import { colours } from "./field-colours.mjs";

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

// Each look's border and 3px ring on the editable field. `rest` is the
// field's own resting border.
const looks = {
  valid: { border: "rest" },
  "valid, focused": { border: "otl-primary-300", ring: "fr-primary" },
  invalid: { border: "otl-danger-300" },
  "invalid, focused": { border: "otl-danger-300", ring: "fr-danger" },
};

// The colour an addon's text and an icon inherit, which they never change
const inherited = "rgb(1, 2, 3)";

// The attributes Input or TextArea gives its field for `props`: `disabled`,
// and `aria-invalid` from `invalid` unless an `aria-invalid` prop overrides it
function attributes(props) {
  const ariaInvalid =
    "aria-invalid" in props
      ? props["aria-invalid"]
      : (props.invalid ?? undefined);
  return `${props.disabled ? " disabled" : ""}${
    ariaInvalid == null ? "" : ` aria-invalid="${ariaInvalid}"`
  }`;
}

const fields = [
  {
    name: "Input",
    file: "input.tsx",
    rest: "transparent",
    // Plain, and with a prepend and an append InputAddon and a left and a
    // right InputIcon
    shapes: [
      { name: "plain" },
      { name: "with addons and icons", decorated: true },
    ],
    // The markup Input renders: its wrapper, a row holding the addons, and a
    // box holding the <input> and its icons
    render(id, size, { decorated }, props) {
      const [wrapper, row, box, ...rest] = jsxClasses("input.tsx");
      assert.ok(wrapper && row && box && !rest.length, "input.tsx's markup");
      const classes = (cva, variants) => cvaClasses("input.tsx", cva, variants);
      const addon = (text) =>
        decorated
          ? `<div class="${classes("input_addon_cva", { size })}">${text}</div>`
          : "";
      const icon = (position) =>
        decorated
          ? `<svg class="${classes("input_icon_cva", { position, size })}" viewBox="0 0 20 20"><path d="M2 10h16" stroke="currentColor"/></svg>`
          : "";
      const data = ["prepend", "append", "left-icon", "right-icon"]
        .map((name) => ` data-has-${name}="${!!decorated}"`)
        .join("");
      const input = `<input id="${id}" class="${classes("input_cva", { size })}"${data}${attributes(props)}>`;
      return `<div class="${wrapper}"><div class="${row}">${addon("RM")}<div class="${box}">${input}${icon("left")}${icon("right")}</div>${addon("Copy")}</div></div>`;
    },
  },
  {
    name: "TextArea",
    file: "textarea.tsx",
    rest: "otl-gray-200",
    shapes: [{ name: "plain" }],
    render(id, size, _, props) {
      return `<textarea id="${id}" class="${cvaClasses("textarea.tsx", "text_area_cva", { size })}"${attributes(props)}></textarea>`;
    },
  },
];

// Runs in the page: each field's look at rest, then focused. Around an
// <input> it also reads Input's wrapper, addons and icons.
function readLooks(ids) {
  // Drop the empty layers Tailwind composes box-shadow from
  const shadow = (value) =>
    value
      .split(/,(?![^(]*\))/)
      .map((layer) => layer.trim())
      .filter((layer) => !/^rgba\(0, 0, 0, 0\)( 0px)+$/.test(layer))
      .join(", ");
  const look = (field) => {
    const style = getComputedStyle(field);
    const own = {
      border: style.borderColor,
      shadow: shadow(style.boxShadow),
      background: style.backgroundColor,
    };
    if (field.localName !== "input") return own;
    const box = field.parentElement;
    const row = box.parentElement;
    const wrapper = getComputedStyle(row.parentElement);
    return {
      ...own,
      wrapper: {
        border: wrapper.borderColor,
        shadow: shadow(wrapper.boxShadow),
      },
      addons: [...row.children]
        .filter((child) => child !== box)
        .map((addon) => {
          const { borderColor, color } = getComputedStyle(addon);
          return { border: borderColor, colour: color };
        }),
      icons: [...box.querySelectorAll("svg")].map(
        (icon) => getComputedStyle(icon).color,
      ),
    };
  };
  return Object.fromEntries(
    ids.map((id) => {
      const field = document.getElementById(id);
      const atRest = look(field);
      field.focus();
      const focused = look(field);
      field.blur();
      return [id, { atRest, focused }];
    }),
  );
}

// The look `name` gives a sample, in `theme`
function want(field, sample, theme, name) {
  const colour = (token) =>
    colours[theme][token === "rest" ? field.rest : token];
  const { border, ring } = looks[name];
  const { disabled } = sample.props;
  const own = {
    border: colour(border),
    shadow: ring ? `${colour(ring)} 0px 0px 0px 3px` : "none",
    background: colour(disabled ? "bg-washed" : "bg-white"),
  };
  if (field.name !== "Input") return own;
  const [none, grey] = [colour("transparent"), colour("otl-gray-200")];
  // Border colours run top, right, bottom, left
  return {
    ...own,
    wrapper: { border: grey, shadow: "none" },
    addons: sample.decorated
      ? [
          { border: `${none} ${grey} ${none} ${none}`, colour: inherited },
          { border: `${none} ${none} ${none} ${grey}`, colour: inherited },
        ]
      : [],
    icons: sample.decorated ? [inherited, inherited] : [],
  };
}

test("Input and TextArea keep their colour transitions", () => {
  // So the page below turns transitions off to read the colours they end on
  for (const [file, cva] of [
    ["input.tsx", "input_cva"],
    ["textarea.tsx", "text_area_cva"],
  ])
    assert.ok(cvaClasses(file, cva).split(" ").includes("transition-colors"));
});

test("each Input and TextArea state has its border and ring, in both themes", async () => {
  const groups = fields.flatMap((field) =>
    ["small", "medium", "large"].flatMap((size) =>
      field.shapes.map((shape) => ({
        field,
        size,
        samples: cases.map((sample, i) => ({
          ...sample,
          ...shape,
          id: `${field.name}-${size}-${shape.name}-${i}`.replaceAll(" ", "_"),
          key: `${field.name} ${size}${
            shape.decorated ? ` ${shape.name}` : ""
          }, ${sample.name}`,
        })),
      })),
    ),
  );
  const css = await compileComponents(fields.map(({ file }) => file));
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    // Each group's samples share a `<fieldset class="group">`, as DESIGN.md
    // suggests wrapping fields, so every valid field sits beside invalid ones
    await page.setContent(
      `<!doctype html><html><head><style>${css}</style><style>*,::before,::after{transition:none!important}</style></head><body style="color:${inherited}">${groups
        .map(
          ({ field, size, samples }) =>
            `<fieldset class="group">${samples
              .map((sample) =>
                field.render(sample.id, size, sample, sample.props),
              )
              .join("")}</fieldset>`,
        )
        .join("")}</body></html>`,
    );
    const ids = groups.flatMap(({ samples }) => samples.map(({ id }) => id));

    const actual = {};
    const expected = {};
    for (const theme of ["light", "dark"]) {
      await page.evaluate(
        (dark) => document.documentElement.classList.toggle("dark", dark),
        theme === "dark",
      );
      const read = await page.evaluate(readLooks, ids);
      for (const { field, samples } of groups)
        for (const sample of samples) {
          const { id, key, props, look } = sample;
          actual[`${key} (${theme})`] = read[id].atRest;
          expected[`${key} (${theme})`] = want(field, sample, theme, look);
          actual[`${key} (${theme}), focused`] = read[id].focused;
          expected[`${key} (${theme}), focused`] = want(
            field,
            sample,
            theme,
            props.disabled ? look : `${look}, focused`,
          );
        }
    }
    assert.deepEqual(actual, expected);
  } finally {
    await browser.close();
  }
});
