// SearchBar's input container shows one of three looks. At rest it has an
// `otl-gray-200` border. Hovered, the border turns `otl-gray-300`. Focused,
// when the <input> inside it has focus, the border turns `otl-primary-300`
// with a 3px `otl-primary-200` ring, and focus wins over hover. Every look
// keeps the `bg-white` fill and the `shadow-button` shadow, in each size.
import assert from "node:assert/strict";
import { test } from "node:test";

import { chromium } from "playwright";

import { compileComponents, cvaClasses, jsxClasses } from "./components.mjs";
import { colours } from "./field-looks.mjs";

const file = "search-bar.tsx";

// `shadow-button`, which every look keeps under its ring
const buttonShadow = "rgba(0, 0, 0, 0.07) 0px 1px 3px 0px";

// Each look's border, and 3px ring
const looks = {
  rest: { border: "otl-gray-200" },
  hovered: { border: "otl-gray-300" },
  focused: { border: "otl-primary-300", ring: "otl-primary-200" },
  "focused and hovered": {
    border: "otl-primary-300",
    ring: "otl-primary-200",
  },
};

// The markup SearchBarInputContainer renders around SearchBarInput's <input>
function render(id, size) {
  const input = jsxClasses(file).find((classes) =>
    classes.includes("placeholder:"),
  );
  assert.ok(input, `${file}'s SearchBarInput`);
  return `<div id="${id}" style="margin:16px" class="${cvaClasses(file, "search_bar_input_container_cva", { size })}"><input class="${input}" placeholder="Search"></div>`;
}

// Runs in the page: the container's border, shadow and fill
function readLook(id) {
  // Drop the empty layers Tailwind composes box-shadow from
  const shadow = (value) =>
    value
      .split(/,(?![^(]*\))/)
      .map((layer) => layer.trim())
      .filter((layer) => !/^rgba\(0, 0, 0, 0\)( 0px)+$/.test(layer))
      .join(", ");
  const style = getComputedStyle(document.getElementById(id));
  return {
    border: style.borderColor,
    shadow: shadow(style.boxShadow),
    background: style.backgroundColor,
  };
}

// The look `name` gives, in `theme`
function want(theme, name) {
  const colour = (token) => colours[theme][token];
  const { border, ring } = looks[name];
  return {
    border: colour(border),
    shadow: ring
      ? `${colour(ring)} 0px 0px 0px 3px, ${buttonShadow}`
      : buttonShadow,
    background: colour("bg-white"),
  };
}

test("SearchBar's input container has its border in each state, in both themes", async () => {
  const sizes = ["small", "medium", "large"];
  const css = await compileComponents([file]);
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(
      `<!doctype html><html><head><style>${css}</style><style>*,::before,::after{transition:none!important}</style></head><body style="margin:0;padding-top:64px">${sizes
        .map((size) => render(size, size))
        .join("")}</body></html>`,
    );
    // The pointer rests on the empty strip above the bars
    const away = () => page.mouse.move(4, 4);

    const actual = {};
    const expected = {};
    for (const theme of ["light", "dark"]) {
      await page.evaluate(
        (dark) => document.documentElement.classList.toggle("dark", dark),
        theme === "dark",
      );
      for (const size of sizes) {
        const container = page.locator(`#${size}`);
        const input = container.locator("input");
        const read = async (name) => {
          actual[`${size}, ${name} (${theme})`] = await page.evaluate(
            readLook,
            size,
          );
          expected[`${size}, ${name} (${theme})`] = want(theme, name);
        };

        await away();
        await read("rest");
        // Over the container's padding, not the <input>
        await container.hover({ position: { x: 4, y: 4 } });
        await read("hovered");
        await away();
        await input.focus();
        await read("focused");
        await container.hover({ position: { x: 4, y: 4 } });
        await read("focused and hovered");
        await input.blur();
        await away();
      }
    }
    assert.deepEqual(actual, expected);
  } finally {
    await browser.close();
  }
});
