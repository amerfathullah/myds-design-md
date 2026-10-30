import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";

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
