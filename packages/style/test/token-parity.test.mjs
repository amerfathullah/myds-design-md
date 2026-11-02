import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";

import postcss from "postcss";

import { compile } from "./compile.mjs";
import { tokenUtilities } from "./token-utilities.mjs";
import { measure } from "./measure.mjs";

// Colours are compared premultiplied, so 8-bit rounding at low alpha doesn't count
function sameValue(expected, actual) {
  const rgba = /^rgba\((\d+), (\d+), (\d+), (\d+)\)$/;
  const [e, a] = [rgba.exec(expected), rgba.exec(actual)];
  if (!e || !a) return expected === actual;
  const premultiplied = ([, r, g, b, alpha]) =>
    [r, g, b]
      .map((c) => (Number(c) * Number(alpha)) / 255)
      .concat(Number(alpha));
  const [pe, pa] = [premultiplied(e), premultiplied(a)];
  return pe.every((c, i) => Math.abs(c - pa[i]) <= 1);
}

test("every token utility DESIGN.md documents resolves as it did in v1, in both themes", async () => {
  const v1 = JSON.parse(
    fs.readFileSync(new URL("fixtures/v1-tokens.json", import.meta.url)),
  );
  const utilities = tokenUtilities();
  const classes = utilities.flatMap(({ utility }) => utility.split(" "));
  const css = await compile(`@source inline("${classes.join(" ")}");`);
  const measured = await measure(css, utilities);

  const differences = [];
  for (const { utility } of utilities) {
    assert.ok(
      v1[utility],
      `${utility} is missing from the v1 fixture; recapture it`,
    );
    for (const theme of ["light", "dark"]) {
      for (const [prop, expected] of Object.entries(v1[utility][theme])) {
        const actual = measured[utility][theme][prop];
        if (!sameValue(expected, actual)) {
          differences.push(
            `${utility} (${theme}) ${prop}: v1 ${expected}, now ${actual}`,
          );
        }
      }
    }
  }
  assert.deepEqual(differences, []);
});

test("Tailwind's default palette generates no CSS", async () => {
  const offPalette = [
    "bg-blue-500",
    "text-red-600",
    "border-slate-200",
    "ring-emerald-400",
    "fill-black",
  ];
  const css = await compile(`@source inline("${offPalette.join(" ")}");`);
  for (const utility of offPalette) {
    assert.ok(!css.includes(`.${utility}`), `${utility} generated CSS`);
  }
});

// The utilities among `utilities` that a rule's selector names exactly, so
// bare `drop-shadow` isn't mistaken for `drop-shadow-lg`
async function generated(utilities) {
  const css = await compile(`@source inline("${utilities.join(" ")}");`);
  const selectors = new Set();
  postcss.parse(css).walkRules((rule) => {
    for (const selector of rule.selectors) selectors.add(selector);
  });
  return utilities.filter((utility) =>
    selectors.has(`.${utility.replace(/[^\w-]/g, "\\$&")}`),
  );
}

test("Tailwind's own shadow scales generate no CSS", async () => {
  // Every step Tailwind's theme defines, deprecated bare steps included
  const tailwindSteps = [
    "shadow-2xs",
    "shadow-xs",
    "shadow-sm",
    "shadow",
    "shadow-md",
    "shadow-lg",
    "shadow-xl",
    "shadow-2xl",
    "shadow-inner",
    "inset-shadow-2xs",
    "inset-shadow-xs",
    "inset-shadow-sm",
    "drop-shadow",
    "drop-shadow-xs",
    "drop-shadow-sm",
    "drop-shadow-md",
    "drop-shadow-lg",
    "drop-shadow-xl",
    "drop-shadow-2xl",
    "text-shadow-2xs",
    "text-shadow-xs",
    "text-shadow-sm",
    "text-shadow-md",
    "text-shadow-lg",
  ];
  assert.deepEqual(await generated(tailwindSteps), []);
});

test("the shadow utilities that take no step still generate CSS", async () => {
  const stepless = [
    "shadow-none",
    "drop-shadow-none",
    "text-shadow-none",
    "drop-shadow-primary-600",
    "text-shadow-primary-600",
    "shadow-[0_1px_2px_black]",
    "drop-shadow-[0_1px_2px_black]",
    "text-shadow-[0_1px_2px_black]",
  ];
  assert.deepEqual(await generated(stepless), stepless);
});
