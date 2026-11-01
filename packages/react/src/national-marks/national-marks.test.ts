// The national marks: the Malaysia flag, which the Masthead shows, and the
// Jata Negara. They aren't icons (ADR-0007), so they stay out of the icon
// generator's directories: its convert step clears the icon directory and
// rebuilds it from the SVG sources, and its barrel step re-exports every
// component it finds there. A mark in either would come back from a
// regeneration as a plain icon, or not at all. Until the next major,
// `@amerfathullah/myds-react/icon` still exports both, deprecated, as these
// same components.
/// <reference types="node" />
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { MastheadHeader } from "../components/masthead";
import * as icons from "../icons";
import { MalaysiaFlag } from "./malaysia-flag";
import { marks, mastheadFlagClass } from "./national-marks-test-cases";

const src = resolve(__dirname, "..");

describe("the icon generator's directories hold no national mark", () => {
  test("its SVG sources", () => {
    const sources = readdirSync(resolve(src, "svg/icons"));
    for (const { file } of marks) expect(sources).not.toContain(`${file}.svg`);
  });

  test("its icon directory", () => {
    const directory = resolve(src, "icons");
    const components = readdirSync(directory).filter((file) =>
      file.endsWith(".tsx"),
    );
    for (const { file, iconExport } of marks) {
      expect(components).not.toContain(`${file}.tsx`);
      for (const component of components) {
        expect(
          readFileSync(resolve(directory, component), "utf8"),
          component,
        ).not.toMatch(new RegExp(`\\b${iconExport}\\b`));
      }
    }
  });

  test("the marks' SVGs sit beside the sources, not among them", () => {
    expect(readdirSync(resolve(src, "svg/national-marks")).sort()).toEqual(
      marks.map(({ file }) => `${file}.svg`).sort(),
    );
  });
});

test.each(marks)(
  "`/icon` still exports $iconExport, as the mark's own component",
  ({ component, iconExport }) => {
    expect((icons as Record<string, unknown>)[iconExport]).toBe(component);
  },
);

test("the Masthead's header shows the flag", () => {
  expect(
    renderToStaticMarkup(
      createElement(MastheadHeader, null, "An official website"),
    ),
  ).toContain(
    renderToStaticMarkup(
      createElement(MalaysiaFlag, { className: mastheadFlagClass }),
    ),
  );
});
