// SearchBar's input container shows one of three looks. At rest it has an
// `otl-gray-200` border. Hovered, the border turns `otl-gray-300`. Focused,
// when the <input> inside it has focus, the border turns `otl-primary-300`
// with a 3px `otl-primary-200` ring, and focus wins over hover. Every look
// keeps the `bg-white` fill, the `shadow-button` shadow, and the radius,
// padding and text of its size.
import assert from "node:assert/strict";
import { test } from "node:test";

import { chromium } from "playwright";

import { compileComponents, cvaClasses, jsxClasses } from "./components.mjs";
import { colours, shadowButton } from "./field-looks.mjs";

const file = "search-bar.tsx";

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

// The markup SearchBarInputContainer renders around SearchBarInput's <input>,
// with the size as its id
function render(size) {
  const input = jsxClasses(file).find((classes) =>
    classes.includes("placeholder:"),
  );
  assert.ok(input, `${file}'s SearchBarInput`);
  return `<div id="${size}" style="margin:16px" class="${cvaClasses(file, "search_bar_input_container_cva", { size })}"><input class="${input}" placeholder="Search"></div>`;
}

// Runs in the page: the container's border, shadow and fill, and what its
// size sets, which no look changes
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
    size: {
      radius: style.borderRadius,
      padding: style.padding,
      fontSize: style.fontSize,
      colour: style.color,
    },
  };
}

// The look `name` gives, in `theme`, to a container whose size sets `size`
function want(theme, name, size) {
  const colour = (token) => colours[theme][token];
  const { border, ring } = looks[name];
  return {
    border: colour(border),
    shadow: ring
      ? `${colour(ring)} 0px 0px 0px 3px, ${shadowButton}`
      : shadowButton,
    background: colour("bg-white"),
    size,
  };
}

test("SearchBar's input container has its border in each state, in both themes", async () => {
  const sizes = ["small", "medium", "large"];
  const css = await compileComponents([file]);
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(
      `<!doctype html><html><head><style>${css}</style></head><body style="margin:0;padding-top:64px">${sizes
        .map(render)
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
        // Over the container's left padding, not the <input>, and halfway
        // down, clear of the large size's rounded ends
        const { height } = await container.boundingBox();
        const hover = () =>
          container.hover({ position: { x: 4, y: height / 2 } });

        await away();
        const rest = await page.evaluate(readLook, size);
        const read = async (name) => {
          const key = `${size}, ${name} (${theme})`;
          actual[key] = await page.evaluate(readLook, size);
          expected[key] = want(theme, name, rest.size);
        };

        await read("rest");
        await hover();
        await read("hovered");
        await away();
        await input.focus();
        await read("focused");
        await hover();
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
