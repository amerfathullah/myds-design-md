// A SelectItem shows one of two looks. At rest it has no fill and
// `txt-black-700` text. Highlighted, it looks like a focused default
// DropdownItem: a `bg-washed-active` fill and `txt-black-900` text. The
// highlighted option is the one the arrow keys or a mouse pointer move to,
// which holds focus, and Radix marks it `data-highlighted`, whether it's
// selected or not, in a single select and a `multiple` one. So, in both
// themes, its fill differs from the `bg-dialog` panel's and its text from a
// resting option's (#158). Every colour comes from the compiled stylesheet:
// the reference is a focused DropdownItem, and the resting look is read from
// the token utilities. Contrast isn't measured.
import assert from "node:assert/strict";
import { test } from "node:test";

import { chromium } from "playwright";

import { compile, compileFull, fullCssSources } from "./compile.mjs";
import { cvaCall, cvaClasses } from "./components.mjs";

const select = "select.tsx";
const dropdown = "dropdown.tsx";

// The utilities that draw a resting option, each on an element of its own
const probes = {
  "txt-black-700": "text-txt-black-700",
  transparent: "bg-transparent",
};
const probeSources = `@source inline("${Object.values(probes).join(" ")}");`;

// The stylesheet a Tailwind consumer compiles from the library's sources, and
// full.css
const stylesheets = {
  "the Tailwind import": () => compile(`${fullCssSources()}\n${probeSources}`),
  "full.css": () => compileFull(probeSources),
};

// A single select's list and a `multiple` one's
const kinds = [
  ["single", false],
  ["multiple", true],
];

// The options in each list: one at rest, and two highlighted, one of them
// selected. Select marks a selected option `data-state="checked"`.
const options = {
  resting: 'data-state="unchecked"',
  highlighted: 'data-state="unchecked" data-highlighted=""',
  "selected and highlighted": 'data-state="checked" data-highlighted=""',
};
const highlighted = Object.keys(options).filter((state) => state !== "resting");

// The id of a list's panel or option, with no spaces
const id = (kind, part) => `${kind}-${part.replaceAll(" ", "_")}`;

// The open list Select renders at the small size: its panel, holding each of
// the options, with ids from `kind`
function list(kind, multiple) {
  const item = cvaClasses(select, "select_item_cva", {
    size: "small",
    multiple,
    disabled: false,
  });
  return `<div id="${id(kind, "panel")}" class="${cvaClasses(select, "select_content_cva", { size: "small" })}">${Object.entries(
    options,
  )
    .map(
      ([state, attributes]) =>
        `<div id="${id(kind, state)}" role="option" ${attributes} class="${item}">Option</div>`,
    )
    .join("")}</div>`;
}

// An open Dropdown's panel, holding a default item that takes focus
const dropdownList = `<div class="${cvaCall(dropdown, "dropdown_content_cva")}"><div id="dropdown-item" role="menuitem" tabindex="-1" class="${cvaCall(dropdown, "dropdown_item_cva")}">Option</div></div>`;

// Transitions off, to read the colours they end on
const html = (css) =>
  `<!doctype html><html><head><style>${css}</style><style>*,::before,::after{transition:none!important;animation:none!important}</style></head><body>${kinds
    .map(([kind, multiple]) => list(kind, multiple))
    .join("")}${dropdownList}${Object.entries(probes)
    .map(([token, utility]) => `<span id="${token}" class="${utility}"></span>`)
    .join("")}</body></html>`;

// Runs in the page: the fill and text colour of each element with an id
function readColours() {
  return Object.fromEntries(
    [...document.querySelectorAll("[id]")].map((element) => {
      const style = getComputedStyle(element);
      return [
        element.id,
        { background: style.backgroundColor, colour: style.color },
      ];
    }),
  );
}

test("a highlighted SelectItem looks like a focused DropdownItem, set apart from its panel and from resting options, in both themes", async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const actual = {};
    const expected = {};
    for (const [entry, stylesheet] of Object.entries(stylesheets)) {
      await page.setContent(html(await stylesheet()));
      await page.focus("#dropdown-item");
      assert.equal(
        await page.evaluate(() => document.activeElement?.id),
        "dropdown-item",
      );
      for (const theme of ["light", "dark"]) {
        await page.evaluate(
          (dark) => document.documentElement.classList.toggle("dark", dark),
          theme === "dark",
        );
        const colours = await page.evaluate(readColours);
        for (const [kind] of kinds) {
          const panel = colours[id(kind, "panel")];
          const resting = colours[id(kind, "resting")];
          const key = (state) => `${entry}: ${kind}, ${state} (${theme})`;

          actual[key("resting")] = resting;
          expected[key("resting")] = {
            background: colours.transparent.background,
            colour: colours["txt-black-700"].colour,
          };
          for (const state of highlighted) {
            const { background, colour } = colours[id(kind, state)];
            actual[key(state)] = {
              background,
              colour,
              "fill differs from the panel's": background !== panel.background,
              "text differs from a resting option's": colour !== resting.colour,
            };
            expected[key(state)] = {
              ...colours["dropdown-item"],
              "fill differs from the panel's": true,
              "text differs from a resting option's": true,
            };
          }
        }
      }
    }
    assert.deepEqual(actual, expected);
  } finally {
    await browser.close();
  }
});
