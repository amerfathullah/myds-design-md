import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { ThemeProvider } from "../hooks/use-theme";
import { ThemeSwitch } from "./theme-switch";

type ProviderProps = Omit<ComponentProps<typeof ThemeProvider>, "children">;

// The theme a ThemeSwitch shows in server HTML: the toggle's accessible name
// and the select trigger's text, with the icon either one shows
function shown(as: "toggle" | "select", props: ProviderProps) {
  const html = renderToStaticMarkup(
    createElement(ThemeProvider, {
      ...props,
      children: createElement(ThemeSwitch, { as }),
    }),
  );
  return {
    label:
      as === "toggle"
        ? html.match(/^<button\s[^>]*\saria-label="([^"]*)"/)?.[1]
        : html.match(/<span>([^<]*)<\/span>/)?.[1],
    icon: html.match(/\sid="Icon\/(sun|moon)"/)?.[1],
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
});
