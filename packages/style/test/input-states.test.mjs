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
import { cases, colours, stateAttributes } from "./field-looks.mjs";

// Each look's border and 3px ring on the editable field. `resting` is the
// field's own resting border.
const looks = {
  valid: { border: "resting" },
  "valid, focused": { border: "otl-primary-300", ring: "fr-primary" },
  invalid: { border: "otl-danger-300" },
  "invalid, focused": { border: "otl-danger-300", ring: "fr-danger" },
};

// The colour an addon's text and an icon inherit, which they never change
const inherited = "rgb(1, 2, 3)";

const fields = [
  {
    name: "Input",
    file: "input.tsx",
    resting: "transparent",
    // Plain, and with a prepend and an append InputAddon and a left and a
    // right InputIcon
    shapes: [
      { name: "plain" },
      { name: "with addons and icons", decorated: true },
    ],
    // The markup Input renders: its wrapper, a row holding the addons, and a
    // box holding the <input> and its icons
    render({ id, props, decorated }, size) {
      const [wrapper, row, box, ...others] = jsxClasses(this.file);
      assert.ok(
        wrapper && row && box && !others.length,
        `${this.file}'s markup`,
      );
      const classes = (cva, variants) => cvaClasses(this.file, cva, variants);
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
      const input = `<input id="${id}" class="${classes("input_cva", { size })}"${data}${stateAttributes(props)}>`;
      return `<div class="${wrapper}"><div class="${row}">${addon("RM")}<div class="${box}">${input}${icon("left")}${icon("right")}</div>${addon("Copy")}</div></div>`;
    },
    // What every look keeps around the <input>: the wrapper's `otl-gray-200`
    // border and no shadow, each addon's divider against the field, and the
    // addons' and icons' inherited colour
    around({ decorated }, colour) {
      const [none, grey] = [colour("transparent"), colour("otl-gray-200")];
      // Border colours run top, right, bottom, left
      return {
        wrapper: { border: grey, shadow: "none" },
        addons: decorated
          ? [
              { border: `${none} ${grey} ${none} ${none}`, colour: inherited },
              { border: `${none} ${none} ${none} ${grey}`, colour: inherited },
            ]
          : [],
        icons: decorated ? [inherited, inherited] : [],
      };
    },
  },
  {
    name: "TextArea",
    file: "textarea.tsx",
    resting: "otl-gray-200",
    shapes: [{ name: "plain" }],
    render({ id, props }, size) {
      return `<textarea id="${id}" class="${cvaClasses(this.file, "text_area_cva", { size })}"${stateAttributes(props)}></textarea>`;
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
    colours[theme][token === "resting" ? field.resting : token];
  const { border, ring } = looks[name];
  return {
    border: colour(border),
    shadow: ring ? `${colour(ring)} 0px 0px 0px 3px` : "none",
    background: colour(sample.props.disabled ? "bg-washed" : "bg-white"),
    ...field.around?.(sample, colour),
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
              .map((sample) => field.render(sample, size))
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
