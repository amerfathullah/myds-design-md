import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Window } from "happy-dom";
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import { ThemeProvider } from "../hooks/use-theme";
import { ThemeSwitch } from "./theme-switch";
import { selectShows, shows, toggleShows } from "./theme-switch-shown";

type ProviderProps = Omit<ComponentProps<typeof ThemeProvider>, "children">;
type SwitchProps = ComponentProps<typeof ThemeSwitch>;

// A page to read server HTML on as elements. Server HTML runs no script.
const page = new Window();
afterAll(() => page.happyDOM.close());

// The server HTML of a ThemeSwitch under a ThemeProvider, as a string and on
// that page
function server(provider: ProviderProps, props: SwitchProps) {
  const html = renderToStaticMarkup(
    createElement(ThemeProvider, {
      ...provider,
      children: createElement(ThemeSwitch, props),
    }),
  );
  const container = page.document.createElement("div");
  container.innerHTML = html;
  // happy-dom's elements have the DOM's shape, though not its types
  return { html, container: container as unknown as HTMLElement };
}

// The theme a ThemeSwitch shows in server HTML: the toggle's accessible name
// and the select trigger's text, with the icon either one shows
function shown(as: "toggle" | "select", props: ProviderProps) {
  const { name, text, icons } = shows(as, server(props, { as }).container);
  return {
    label: as === "toggle" ? name : text,
    icon: icons.map(({ icon }) => icon).join(),
  };
}

// Server HTML that disagrees with the first client render makes React warn
// on hydration, so every test here also fails on any React warning. Nothing
// here logs a warning of its own either.
beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  const warnings = [
    ...vi.mocked(console.error).mock.calls,
    ...vi.mocked(console.warn).mock.calls,
  ];
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

// A theme the switch doesn't list. "system" isn't one of the default
// `themes`, and ThemeProvider counts its `defaultTheme` as one of its own, so
// it applies "system" without a warning.
const unlisted: [string, ProviderProps, SwitchProps][] = [
  ['`defaultTheme="system"`', { defaultTheme: "system" }, {}],
  [
    '`defaultTheme="system"` and `themes` listing it',
    { defaultTheme: "system", themes: ["light", "dark", "system"] },
    {},
  ],
  [
    '`defaultTheme="system"`, with `themes={[]}` on the switch',
    { defaultTheme: "system" },
    { themes: [] },
  ],
];

// The classes on the sun a ThemeSwitch shows under a listed "light", which
// its fallback icon carries too
function sunClasses(as: "toggle" | "select") {
  const { container } = server({}, { as });
  const { icons } = shows(as, container);
  expect(icons).toEqual([{ icon: "sun", classes: expect.any(String) }]);
  return icons[0]!.classes;
}

describe("ThemeSwitch as toggle, under a theme it doesn't list", () => {
  test.each(unlisted)(
    'under %s, is named "Theme" in server HTML and shows only the desktop icon',
    (_, provider, props) => {
      expect(toggleShows(server(provider, props).container)).toEqual({
        name: "Theme",
        text: "",
        icons: [{ icon: "desktop", classes: sunClasses("toggle") }],
      });
    },
  );

  test("is named by `toggleLabel`, which reaches no attribute", () => {
    const { html, container } = server(
      { defaultTheme: "system" },
      { toggleLabel: "Tema" },
    );
    expect(toggleShows(container)).toMatchObject({
      name: "Tema",
      text: "",
      icons: [{ icon: "desktop" }],
    });
    expect(html).not.toMatch(/togglelabel/i);
  });
});

describe("ThemeSwitch as select, under a theme it doesn't list", () => {
  test.each<{ given: string; props: SwitchProps; name: string }>([
    { given: "no names", props: {}, name: "Theme" },
    {
      given: '`selectLabel="Tema"`',
      props: { selectLabel: "Tema" },
      name: "Tema",
    },
    {
      given: '`toggleLabel="Tema"`',
      props: { toggleLabel: "Tema" },
      name: "Theme",
    },
  ])(
    'with $given, is named "$name" in server HTML, and its value shows only the desktop icon',
    ({ props, name }) => {
      const { html, container } = server(
        { defaultTheme: "system" },
        { as: "select", ...props },
      );
      expect(selectShows(container)).toEqual({
        name,
        text: "",
        icons: [{ icon: "desktop", classes: sunClasses("select") }],
      });
      expect(html).not.toMatch(/togglelabel/i);
    },
  );
});

// `toggleLabel` names the toggle only while its theme is unlisted, and never
// the select
describe.each(["toggle", "select"] as const)(
  "ThemeSwitch as %s, under a theme it lists, with `toggleLabel`",
  (as) => {
    test('is named as before under `defaultTheme="dark"`', () => {
      const { html, container } = server(
        { defaultTheme: "dark" },
        { as, toggleLabel: "Tema" },
      );
      expect(shows(as, container)).toMatchObject({
        name: as === "toggle" ? "Dark" : "Theme",
        text: as === "toggle" ? "" : "Dark",
        icons: [{ icon: "moon" }],
      });
      expect(html).not.toMatch(/togglelabel/i);
    });
  },
);
