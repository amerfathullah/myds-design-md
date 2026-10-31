// Label shows one of two looks: `txt-black-700` text with the default cursor,
// or, disabled, `txt-black-disabled` text with a `not-allowed` cursor. The
// look follows the label's own `data-disabled`, which the `disabled` prop sets
// and a `data-disabled` prop overrides, so it doesn't depend on where the
// field sits. Label disables nothing: the author passes `disabled` to the
// Label and to the field. Label's `group-disabled:` classes still dim it
// inside a `<fieldset disabled class="group">`.
import assert from "node:assert/strict";
import { test } from "node:test";

import { chromium } from "playwright";

import {
  compileComponents,
  cvaCall,
  cvaClasses,
  jsxClasses,
} from "./components.mjs";
import { colours, propAttribute } from "./field-looks.mjs";

// The props a consumer passes the Label, and the look they give
const cases = [
  { name: "disabled omitted", props: {}, look: "enabled" },
  { name: "disabled={null}", props: { disabled: null }, look: "enabled" },
  { name: "disabled={false}", props: { disabled: false }, look: "enabled" },
  { name: "disabled", props: { disabled: true }, look: "disabled" },
  {
    name: "data-disabled",
    props: { "data-disabled": true },
    look: "disabled",
  },
  {
    name: "disabled data-disabled={false}",
    props: { disabled: true, "data-disabled": false },
    look: "enabled",
  },
];

// Each look's text colour and cursor
const looks = {
  enabled: { colour: "txt-black-700", cursor: "default" },
  disabled: { colour: "txt-black-disabled", cursor: "not-allowed" },
};

// The markup each library field renders when disabled, around a native
// element with `id`
const fields = [
  {
    name: "Input",
    file: "input.tsx",
    // Input's wrapper, a row holding the addons, and a box holding the
    // <input> and its icons
    render(id) {
      const [wrapper, row, box, ...others] = jsxClasses(this.file);
      assert.ok(
        wrapper && row && box && !others.length,
        `${this.file}'s markup`,
      );
      return `<div class="${wrapper}"><div class="${row}"><div class="${box}"><input id="${id}" class="${cvaCall(this.file, "input_cva")}" data-has-prepend="false" data-has-append="false" data-has-left-icon="false" data-has-right-icon="false" disabled></div></div></div>`;
    },
  },
  {
    name: "TextArea",
    file: "textarea.tsx",
    render(id) {
      return `<textarea id="${id}" class="${cvaCall(this.file, "text_area_cva")}" disabled></textarea>`;
    },
  },
  {
    name: "DateField",
    file: "date-field.tsx",
    render(id) {
      return `<div class="${cvaCall(this.file, "datefield_container_cva", { disabled: true })}"><input id="${id}" type="date" value="2026-09-26" class="${cvaClasses(this.file, "datefield_cva")}" disabled></div>`;
    },
  },
  {
    name: "TimeField",
    file: "time-field.tsx",
    render(id) {
      return `<div class="${cvaCall(this.file, "timefield_container_cva", { disabled: true })}"><input id="${id}" type="time" value="09:30" class="${cvaClasses(this.file, "timefield_cva")}" disabled></div>`;
    },
  },
  {
    // SelectTrigger, the Radix trigger a disabled Select renders
    name: "Select",
    file: "select.tsx",
    render(id) {
      return `<button id="${id}" type="button" role="combobox" aria-expanded="false" class="${cvaCall(this.file, "select_trigger_cva")}" disabled data-disabled="" data-state="closed"><span>Negeri</span></button>`;
    },
  },
  {
    // The Radix checkbox button a disabled Checkbox renders
    name: "Checkbox",
    file: "checkbox.tsx",
    render(id) {
      return `<button id="${id}" type="button" role="checkbox" aria-checked="false" class="${cvaCall(this.file, "checkbox_cva")}" disabled data-disabled="" data-state="unchecked"></button>`;
    },
  },
];

// Where the Label sits beside the field: before it, after it, or in a grid
// cell of its own
const placements = {
  before: (label, field) => `<div>${label}${field}</div>`,
  after: (label, field) => `<div>${field}${label}</div>`,
  "in its own cell": (label, field) =>
    `<div style="display:grid;grid-template-columns:auto auto"><div>${label}</div><div>${field}</div></div>`,
};

// The <label> Label renders for `props`: its classes, defaults applied, and
// `data-disabled` from `disabled` unless a `data-disabled` prop overrides it
function renderLabel(id, props) {
  return `<label id="label-${id}" for="${id}" class="${cvaCall("label.tsx", "label_cva")}"${propAttribute(
    props,
    "disabled",
    "data-disabled",
  )}>Name</label>`;
}

// Runs in the page: each label's text colour and cursor
function readLooks(ids) {
  return Object.fromEntries(
    ids.map((id) => {
      const { color, cursor } = getComputedStyle(
        document.getElementById(`label-${id}`),
      );
      return [id, { colour: color, cursor }];
    }),
  );
}

test("Label is dimmed only when disabled, wherever it sits beside a disabled field, in both themes", async () => {
  const samples = fields.flatMap((field) => [
    ...Object.entries(placements).flatMap(([placement, place]) =>
      cases.map(({ name, props, look }, i) => {
        const id = `${field.name}-${placement}-${i}`.replaceAll(" ", "_");
        return {
          id,
          key: `${field.name}, Label ${placement}, ${name}`,
          look,
          html: place(renderLabel(id, props), field.render(id)),
        };
      }),
    ),
    // `group-disabled:` dims a Label inside a disabled fieldset marked
    // `group`, with `disabled` or without
    ...cases
      .filter(({ name }) => ["disabled omitted", "disabled"].includes(name))
      .map(({ name, props }, i) => {
        const id = `${field.name}-fieldset-${i}`;
        return {
          id,
          key: `${field.name}, Label in <fieldset disabled class="group">, ${name}`,
          look: "disabled",
          html: `<fieldset disabled class="group">${renderLabel(id, props)}${field.render(id)}</fieldset>`,
        };
      }),
  ]);
  const css = await compileComponents([
    "label.tsx",
    ...fields.map(({ file }) => file),
  ]);
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(
      `<!doctype html><html><head><style>${css}</style></head><body>${samples
        .map(({ html }) => html)
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
      const read = await page.evaluate(readLooks, ids);
      for (const { id, key, look } of samples) {
        const { colour, cursor } = looks[look];
        actual[`${key} (${theme})`] = read[id];
        expected[`${key} (${theme})`] = {
          colour: colours[theme][colour],
          cursor,
        };
      }
    }
    assert.deepEqual(actual, expected);
  } finally {
    await browser.close();
  }
});
