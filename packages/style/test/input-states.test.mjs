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
//
// Input also pads its field 40px on the side of each InputIcon after it, and
// keeps its size's own padding elsewhere. The padding follows the side mark
// InputIcon puts on the element it renders, so an InputIcon gets its room
// however it's composed, even in server-rendered HTML.
import assert from "node:assert/strict";
import { test } from "node:test";

import { chromium } from "playwright";

import { compileFull } from "./compile.mjs";
import { compileComponents, cvaClasses, jsxClasses } from "./components.mjs";
import { cases, colours, stateAttributes } from "./field-looks.mjs";

// The markup Input renders at `size`: its wrapper, a row holding `prepend`
// and `append`, and a box holding the <input>, with `attributes` (each with a
// leading space), and what follows it, its icons
function renderInput({
  size,
  attributes,
  prepend = "",
  after = "",
  append = "",
}) {
  const file = "input.tsx";
  const [wrapper, row, box, ...others] = jsxClasses(file);
  assert.ok(wrapper && row && box && !others.length, `${file}'s markup`);
  const input = `<input class="${cvaClasses(file, "input_cva", { size })}"${attributes}>`;
  return `<div class="${wrapper}"><div class="${row}">${prepend}<div class="${box}">${input}${after}</div>${append}</div></div>`;
}

// The element an InputIcon renders at `size`, an icon, drawn on `position`
// and, unless `marked` is false, marked with that side
function renderIcon(size, position, { marked = true } = {}) {
  const classes = cvaClasses("input.tsx", "input_icon_cva", { position, size });
  const mark = marked ? ` data-input-icon="${position}"` : "";
  return `<svg class="${classes}"${mark} viewBox="0 0 20 20"><path d="M2 10h16" stroke="currentColor"/></svg>`;
}

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
    // The markup Input renders, with or without the addons and icons
    render({ id, props, decorated }, size) {
      const addon = (text) =>
        decorated
          ? `<div class="${cvaClasses(this.file, "input_addon_cva", { size })}">${text}</div>`
          : "";
      const data = ["prepend", "append", "left-icon", "right-icon"]
        .map((name) => ` data-has-${name}="${!!decorated}"`)
        .join("");
      return renderInput({
        size,
        attributes: ` id="${id}"${data}${stateAttributes(props)}`,
        prepend: addon("RM"),
        after: decorated
          ? `${renderIcon(size, "left")}${renderIcon(size, "right")}`
          : "",
        append: addon("Copy"),
      });
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
    // Each group's samples share a `<fieldset class="group">`, which dims
    // their Labels when disabled, so every valid field sits beside invalid
    // ones
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

// Each size's own padding on either side of the field, and the room it makes
// beside an icon
const ownPadding = { small: "12px", medium: "12px", large: "14px" };
const iconPadding = "40px";

// What follows the <input> in its box, and the sides the field is padded on.
// The <input> reports no icon in `data-has-left-icon` or `data-has-right-icon`,
// as for an InputIcon in a Fragment or an app's own component, so only the
// side marks can pad it.
const iconCases = [
  {
    name: "a left icon",
    after: (size) => renderIcon(size, "left"),
    padded: ["left"],
  },
  {
    name: "a right icon",
    after: (size) => renderIcon(size, "right"),
    padded: ["right"],
  },
  {
    name: "a left and a right icon",
    after: (size) => `${renderIcon(size, "left")}${renderIcon(size, "right")}`,
    padded: ["left", "right"],
  },
  { name: "no icon", after: () => "", padded: [] },
  { name: "a plain <span>", after: () => "<span>kg</span>", padded: [] },
  {
    name: "an icon without the side mark",
    after: (size) => renderIcon(size, "left", { marked: false }),
    padded: [],
  },
];

// Runs in the page: each field's left and right padding
function readPadding(ids) {
  return Object.fromEntries(
    ids.map((id) => {
      const { paddingLeft, paddingRight } = getComputedStyle(
        document.getElementById(id),
      );
      return [id, { left: paddingLeft, right: paddingRight }];
    }),
  );
}

test("Input makes room beside each marked icon after its field, and keeps its own padding elsewhere, at each size", async () => {
  const samples = ["small", "medium", "large"].flatMap((size) =>
    iconCases.map(({ name, after, padded }, i) => ({
      id: `padding-${size}-${i}`,
      key: `${size}, ${name}`,
      size,
      padded,
      html: renderInput({
        size,
        attributes: ` id="padding-${size}-${i}" data-has-prepend="false" data-has-append="false" data-has-left-icon="false" data-has-right-icon="false" placeholder="Cari"`,
        after: after(size),
      }),
    })),
  );
  // The stylesheet a Tailwind consumer compiles for Input, and full.css
  const stylesheets = {
    "the Tailwind import": await compileComponents(["input.tsx"]),
    "full.css": await compileFull(),
  };
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const actual = {};
    const expected = {};
    for (const [entry, css] of Object.entries(stylesheets)) {
      await page.setContent(
        `<!doctype html><html><head><style>${css}</style></head><body>${samples
          .map(({ html }) => html)
          .join("")}</body></html>`,
      );
      const padding = await page.evaluate(
        readPadding,
        samples.map(({ id }) => id),
      );
      for (const { id, key, size, padded } of samples) {
        const side = (name) =>
          padded.includes(name) ? iconPadding : ownPadding[size];
        actual[`${entry}: ${key}`] = padding[id];
        expected[`${entry}: ${key}`] = {
          left: side("left"),
          right: side("right"),
        };
      }
    }
    assert.deepEqual(actual, expected);
  } finally {
    await browser.close();
  }
});
