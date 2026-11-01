// @vitest-environment happy-dom
// The legacy icons, full-size and Mini, draw in the text colour, so a `txt-*`
// class colours them and they change with the theme. The icon generator paints
// a source's fill or stroke of #18181B in `currentColor` and leaves every other
// colour fixed (CONTRIBUTING.md, "Icons"), so a legacy source paints only in
// #18181B. The exceptions paint nothing: `none`, and the white that shapes a
// mask or clip-path. This sits outside the icon directory, which the generator
// rewrites.
/// <reference types="node" />
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const sourceDirectory = resolve(__dirname, "icons");
const legacySources = readdirSync(sourceDirectory).filter(
  (file) => file.startsWith("legacy-") && file.endsWith(".svg"),
);

/** Each fill and stroke the source sets, and whether a mask or clip-path holds it */
function paints(file: string) {
  const svg = new DOMParser().parseFromString(
    readFileSync(resolve(sourceDirectory, file), "utf8"),
    "image/svg+xml",
  );
  return [...svg.querySelectorAll("[fill], [stroke]")].flatMap((element) =>
    (["fill", "stroke"] as const).flatMap((property) => {
      const value = element.getAttribute(property);
      return value === null
        ? []
        : [
            {
              property,
              value,
              inMaskOrClipPath: !!element.closest("mask, clipPath"),
            },
          ];
    }),
  );
}

const isIconColour = (value: string) => value.toUpperCase() === "#18181B";

test("there are legacy sources to check", () => {
  expect(legacySources.length).toBeGreaterThan(0);
});

describe.each(legacySources)("%s", (file) => {
  test("draws in the icon colour, #18181B", () => {
    expect(paints(file).some(({ value }) => isIconColour(value))).toBe(true);
  });

  test("paints no other colour, apart from a mask's or clip-path's white", () => {
    const fixed = paints(file).filter(
      ({ value, inMaskOrClipPath }) =>
        !isIconColour(value) &&
        value !== "none" &&
        !(inMaskOrClipPath && value === "white"),
    );
    expect(fixed).toEqual([]);
  });
});
