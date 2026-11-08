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

// Colour tokens that deliberately no longer resolve as they did in v1, each
// with the issue that changed it and its colour in each theme, as `measure`
// reads it. The v1 fixture stays as captured: it records what v1 resolved
// to, and its capture script can only measure v1 again.
const departures = {
  // Opaque, at 3:1 or more against the page (WCAG SC 1.4.11)
  "fr-primary": {
    issue: "#157",
    light: "rgba(29, 78, 216, 255)",
    dark: "rgba(150, 183, 255, 255)",
  },
  "fr-danger": {
    issue: "#157",
    light: "rgba(185, 28, 28, 255)",
    dark: "rgba(252, 165, 165, 255)",
  },
};

// Each departure's colour utilities, as tokenUtilities() writes them, such
// as `bg-fr-primary`, with the departure it takes its colour from
const departed = new Map(
  Object.entries(departures).flatMap(([token, departure]) =>
    ["bg", "text", "border"].map((utility) => [
      `${utility}-${token}`,
      departure,
    ]),
  ),
);

test("every token utility DESIGN.md documents resolves as it did in v1, or to its listed departure, in both themes", async () => {
  const v1 = JSON.parse(
    fs.readFileSync(new URL("fixtures/v1-tokens.json", import.meta.url)),
  );
  const utilities = tokenUtilities();
  const classes = utilities.flatMap(({ utility }) => utility.split(" "));
  const css = await compile(`@source inline("${classes.join(" ")}");`);
  const measured = await measure(css, utilities);

  // Every departure is a token DESIGN.md documents, so the list can't go stale
  const documented = new Set(utilities.map(({ utility }) => utility));
  assert.deepEqual(
    [...departed.keys()].filter((utility) => !documented.has(utility)),
    [],
  );

  const differences = [];
  for (const { utility } of utilities) {
    assert.ok(
      v1[utility],
      `${utility} is missing from the v1 fixture; recapture it`,
    );
    const departure = departed.get(utility);
    for (const theme of ["light", "dark"]) {
      for (const [prop, v1Value] of Object.entries(v1[utility][theme])) {
        const [source, expected] = departure
          ? [departure.issue, departure[theme]]
          : ["v1", v1Value];
        const actual = measured[utility][theme][prop];
        if (!sameValue(expected, actual)) {
          differences.push(
            `${utility} (${theme}) ${prop}: ${source} ${expected}, now ${actual}`,
          );
        }
      }
    }
  }
  assert.deepEqual(differences, []);
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

test("Tailwind's default palette generates no CSS", async () => {
  const offPalette = [
    "bg-blue-500",
    "text-red-600",
    "border-slate-200",
    "ring-emerald-400",
    "fill-black",
  ];
  assert.deepEqual(await generated(offPalette), []);
});

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
