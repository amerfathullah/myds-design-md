import { describe, expect, test } from "vitest";

import { getThemeScript } from "./index";
import { restoreTheme } from "./theme";
import {
  cases,
  defaults,
  keysRead,
  onPage,
  runScript,
  type Loaded,
  type Page,
  type ThemeOptions,
} from "./theme-test-page";

// ThemeProvider's rule, called with the options ThemeProvider passes it
function byRule(options: ThemeOptions, page: Page): Loaded {
  return onPage(page, () => {
    restoreTheme(
      options.storageKey ?? defaults.storageKey,
      options.defaultTheme ?? defaults.defaultTheme,
      options.themes ?? defaults.themes,
    );
  });
}

// `getThemeScript`'s script, run in a fresh global context
function byScript(options: ThemeOptions, page: Page): Loaded {
  return runScript(
    Object.keys(options).length ? getThemeScript(options) : getThemeScript(),
    page,
  );
}

// ThemeProvider and the script share one rule, so they pick the same theme:
// the saved value if it's a known name (`themes` plus `defaultTheme`), else
// `defaultTheme`. Every known name leaves `<html>` but the chosen one, and
// its other classes stay.
describe.each([
  ["ThemeProvider's rule", byRule],
  ["getThemeScript's script", byScript],
] as const)("%s", (_, load) => {
  test.each(cases)("$name", (theCase) => {
    const { classes, reads, writes } = load(theCase.options, theCase.page);
    expect(classes).toEqual(theCase.classes);
    expect([...new Set(reads)]).toEqual(keysRead(theCase));
    expect(writes).toEqual([]);
  });
});

describe("ThemeProvider's rule", () => {
  // ThemeProvider sets its state to the theme the rule applied
  test("returns the theme it applied", () => {
    let theme: string | undefined;
    onPage({ saved: { theme: "dark" } }, () => {
      theme = restoreTheme("theme", "light", ["light", "dark"]);
    });
    expect(theme).toBe("dark");
    onPage({ saved: { theme: "blue" } }, () => {
      theme = restoreTheme("theme", "solarized", ["light", "dark"]);
    });
    expect(theme).toBe("solarized");
  });
});

describe("getThemeScript", () => {
  test("defaults to the `theme` key, `light` and the light and dark themes", () => {
    expect(getThemeScript()).toBe(
      getThemeScript({ storageKey: "theme", defaultTheme: "light" }),
    );
    expect(getThemeScript({})).toBe(
      getThemeScript({ themes: ["light", "dark"] }),
    );
  });

  // A value can't end the script's string or a surrounding <script> element,
  // or stop the element from closing
  describe.each([
    "</SCRIPT><script>alert(1)</script>",
    "<!--<script>",
    '"',
    "\\",
  ])("with %s", (value) => {
    const safe = (source: string) => {
      expect(source).not.toMatch(/<\/script/i);
      expect(source).not.toMatch(/<!--/);
    };

    test("as `storageKey`, it reads exactly that key", () => {
      const source = getThemeScript({ storageKey: value });
      safe(source);
      expect(runScript(source, { saved: { [value]: "dark" } })).toEqual({
        classes: ["dark"],
        reads: [value],
        writes: [],
      });
    });

    test("as `defaultTheme`, with nothing saved, it applies exactly that theme", () => {
      const source = getThemeScript({ defaultTheme: value });
      safe(source);
      expect(runScript(source, {}).classes).toEqual([value]);
    });

    test("as a `themes` entry, with it saved, it applies exactly that entry", () => {
      const source = getThemeScript({ themes: ["light", value, "dark"] });
      safe(source);
      expect(runScript(source, { saved: { theme: value } }).classes).toEqual([
        value,
      ]);
    });
  });
});
