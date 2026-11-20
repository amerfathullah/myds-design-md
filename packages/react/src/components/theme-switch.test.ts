import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { ThemeProvider } from "../hooks/use-theme";
import { MoonIcon, SunIcon } from "../icons";
import { containsIcon } from "../svg/icon-test-markup";
import { ThemeSwitch } from "./theme-switch";

// The theme icons, by the name each test expects
const themeIcons = { sun: SunIcon, moon: MoonIcon };

type ProviderProps = Omit<ComponentProps<typeof ThemeProvider>, "children">;

// The theme a ThemeSwitch shows in server HTML: the toggle's accessible name
// and the select trigger's text, with the icon either one shows
function shown(
  as: "toggle" | "select",
  props: ProviderProps,
  switchProps: Record<string, unknown> = {},
) {
  const html = renderToStaticMarkup(
    createElement(ThemeProvider, {
      ...props,
      children: createElement(ThemeSwitch, { as, ...switchProps }),
    }),
  );
  return {
    label:
      as === "toggle"
        ? html.match(/^<button\s[^>]*\saria-label="([^"]*)"/)?.[1]
        : html.match(/<span>([^<]*)<\/span>/)?.[1],
    // The one theme icon whose drawing the HTML holds
    icon: Object.entries(themeIcons)
      .filter(([, icon]) => containsIcon(html, icon))
      .map(([name]) => name)
      .join(),
  };
}

// Server HTML that disagrees with the first client render makes React warn
// on hydration, so every test here also fails on any React warning
beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  const warnings = [...vi.mocked(console.error).mock.calls];
  vi.restoreAllMocks();
  expect(warnings).toEqual([]);
});

// Both forms show the provider's theme from the first render, so the server
// HTML for `defaultTheme="dark"` already shows Dark
describe.each(["toggle", "select"] as const)("ThemeSwitch as %s", (as) => {
  test('shows Dark in server HTML under `defaultTheme="dark"`', () => {
    expect(shown(as, { defaultTheme: "dark" })).toEqual({
      label: "Dark",
      icon: "moon",
    });
  });

  test("shows Light in server HTML under a ThemeProvider with no props", () => {
    expect(shown(as, {})).toEqual({ label: "Light", icon: "sun" });
  });

  // The provider counts `defaultTheme` among its themes even when the switch
  // doesn't list it, as with "system", so the toggle must not go empty and
  // unnamed (#175)
  test('shows the fallback name "Theme" in server HTML under `defaultTheme="system"`', () => {
    expect(shown(as, { defaultTheme: "system" })).toEqual({
      label: as === "toggle" ? "Theme" : "",
      icon: "",
    });
  });
});

// The toggle's fallback name, which `toggleLabel` replaces; the select always
// keeps its `selectLabel` name
test('names the unlisted-theme toggle with `toggleLabel` instead of "Theme"', () => {
  expect(
    shown("toggle", { defaultTheme: "system" }, { toggleLabel: "Appearance" }),
  ).toEqual({ label: "Appearance", icon: "" });
});
