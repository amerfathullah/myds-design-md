// @vitest-environment happy-dom
/**
 * ThemeSwitch in the browser: what a click or a choice does, and what it
 * shows after hydration and once ThemeProvider restores a theme. Its server
 * HTML is checked in theme-switch.test.ts.
 */
import {
  act,
  createElement,
  Fragment,
  type ComponentProps,
  type ReactElement,
} from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { ThemeProvider } from "../hooks/use-theme";
import { MoonIcon } from "../icons";
import { fakeStorage as fakeStorageOf } from "../utils/theme-test-page";
import { ThemeSwitch } from "./theme-switch";
import { selectShows, toggleShows } from "./theme-switch-shown";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

type ProviderProps = Omit<ComponentProps<typeof ThemeProvider>, "children">;
type SwitchProps = ComponentProps<typeof ThemeSwitch>;

// A provider whose theme, "system", no default ThemeSwitch lists.
// ThemeProvider counts its `defaultTheme` as one of its own, so it applies
// "system" without a warning.
const UNLISTED: ProviderProps = { defaultTheme: "system" };

// A provider that restores "system" too, as the docs' Custom Themes example
// has it
const WITH_SYSTEM: ProviderProps = { themes: ["light", "dark", "system"] };

// A switch that lists Dark alone
const ONLY_DARK = [
  { label: "Dark", value: "dark", icon: createElement(MoonIcon) },
];

// The docs' custom themes, which list System
const CUSTOM_THEMES = [
  { label: "Light", value: "light", icon: "🌞" },
  { label: "Dark", value: "dark", icon: "🌚" },
  { label: "System", value: "system", icon: "🌐" },
];

// What the toggle and the select show: the name, the text and the icons, by
// name
const named = (shows: ReturnType<typeof toggleShows>) => ({
  ...shows,
  icons: shows.icons.map(({ icon }) => icon),
});
const toggle = (container: ParentNode) => named(toggleShows(container));
const select = (container: ParentNode) => named(selectShows(container));

// What each form shows while its theme is unlisted
const FALLBACK = { name: "Theme", text: "", icons: ["desktop"] };

// A fresh localStorage on the page, holding `saved`, which records every write
function fakeStorage(saved?: Record<string, string>) {
  const fake = fakeStorageOf(saved);
  vi.spyOn(window, "localStorage", "get").mockImplementation(
    () => fake.storage as Storage,
  );
  return fake;
}

// `<html>`'s classes, sorted
const classes = () => [...document.documentElement.classList].sort();

const unmounts: (() => Promise<void>)[] = [];

// Mounts `children` under a ThemeProvider in a container on the page, and
// returns the container
async function mount(provider: ProviderProps, ...children: ReactElement[]) {
  const container = document.body.appendChild(document.createElement("div"));
  const root = createRoot(container);
  unmounts.push(async () => {
    await act(async () => root.unmount());
    container.remove();
  });
  await act(async () =>
    root.render(
      createElement(ThemeProvider, {
        ...provider,
        children: createElement(Fragment, null, ...children),
      }),
    ),
  );
  return container;
}

// Puts the server HTML of `children` under a ThemeProvider in a container on
// the page, and hydrates it when `hydrate` is called
function serverHtml(provider: ProviderProps, ...children: ReactElement[]) {
  const tree = createElement(ThemeProvider, {
    ...provider,
    children: createElement(Fragment, null, ...children),
  });
  const container = document.body.appendChild(document.createElement("div"));
  container.innerHTML = renderToString(tree);
  let root: ReturnType<typeof hydrateRoot> | undefined;
  unmounts.push(async () => {
    await act(async () => root?.unmount());
    container.remove();
  });
  return {
    container,
    hydrate: () =>
      act(async () => {
        root = hydrateRoot(container, tree);
      }),
  };
}

const themeSwitch = (props: SwitchProps = {}) =>
  createElement(ThemeSwitch, props);

async function click(element: Element | null | undefined) {
  if (!element) throw new Error("There is nothing to click");
  await act(async () => (element as HTMLElement).click());
}

// The list's options, while it's open. The list portals into `<body>`,
// outside the container.
const options = () => [
  ...document.querySelectorAll<HTMLElement>('[role="option"]'),
];

// Opens the list of the select in `container`
const open = (container: ParentNode) =>
  click(container.querySelector('[role="combobox"]'));

// Chooses the option labelled `label` in the select in `container`, opening
// its list first
async function choose(container: ParentNode, label: string) {
  await open(container);
  await click(options().find((option) => option.textContent === label));
}

let writes: [string, string][];

beforeEach(() => {
  document.documentElement.className = "";
  writes = fakeStorage().writes;
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

// No test logs a React warning, a hydration warning included, or a warning
// of its own, and nothing is left on the page
afterEach(async () => {
  while (unmounts.length) await unmounts.pop()!();
  const logged = [
    ...vi.mocked(console.error).mock.calls,
    ...vi.mocked(console.warn).mock.calls,
  ];
  vi.restoreAllMocks();
  expect(logged).toEqual([]);
});

describe("ThemeSwitch as toggle, under a theme it doesn't list", () => {
  test("a click switches to the first of its `themes`, which then names it", async () => {
    const onChange = vi.fn();
    const container = await mount(UNLISTED, themeSwitch({ onChange }));
    expect(toggle(container)).toEqual(FALLBACK);

    await click(container.querySelector("button"));

    expect(classes()).toEqual(["light"]);
    expect(onChange.mock.calls).toEqual([["light"]]);
    expect(toggle(container)).toEqual({
      name: "Light",
      text: "",
      icons: ["sun"],
    });
  });

  test("with one theme, a click switches to it, and a second click does nothing", async () => {
    const onChange = vi.fn();
    const container = await mount(
      UNLISTED,
      themeSwitch({ themes: ONLY_DARK, onChange }),
    );
    expect(toggle(container)).toEqual(FALLBACK);

    await click(container.querySelector("button"));

    expect(classes()).toEqual(["dark"]);
    expect(onChange.mock.calls).toEqual([["dark"]]);
    expect(writes).toEqual([["theme", "dark"]]);
    expect(toggle(container)).toEqual({
      name: "Dark",
      text: "",
      icons: ["moon"],
    });

    await click(container.querySelector("button"));

    expect(classes()).toEqual(["dark"]);
    expect(onChange.mock.calls).toEqual([["dark"]]);
    expect(writes).toEqual([["theme", "dark"]]);
  });

  test("with no `themes`, shows the fallback, and a click does nothing", async () => {
    const onChange = vi.fn();
    const container = await mount(
      UNLISTED,
      themeSwitch({ themes: [], onChange }),
    );
    expect(toggle(container)).toEqual(FALLBACK);

    await click(container.querySelector("button"));

    expect(classes()).toEqual(["system"]);
    expect(onChange).not.toHaveBeenCalled();
    expect(writes).toEqual([]);
    expect(toggle(container)).toEqual(FALLBACK);
  });
});

describe("ThemeSwitch as select, under a theme it doesn't list", () => {
  // Under "dark", the list marks Dark selected, so the check can see a mark
  test.each([
    ["system", []],
    ["dark", ["Dark"]],
  ])(
    'under `defaultTheme="%s"`, the open list marks %j selected',
    async (defaultTheme, selected) => {
      await open(await mount({ defaultTheme }, themeSwitch({ as: "select" })));

      expect(options().map((option) => option.textContent)).toEqual([
        "Light",
        "Dark",
      ]);
      expect(
        options()
          .filter(
            (option) =>
              option.getAttribute("data-state") === "checked" ||
              option.getAttribute("aria-selected") === "true",
          )
          .map((option) => option.textContent),
      ).toEqual(selected);
    },
  );

  test.each([
    ["the default themes", undefined],
    ["Dark alone", ONLY_DARK],
  ])(
    "with %s, choosing Dark switches to it and calls `onChange` once",
    async (_, themes) => {
      const onChange = vi.fn();
      const container = await mount(
        UNLISTED,
        themeSwitch({ as: "select", themes, onChange }),
      );
      expect(select(container)).toEqual(FALLBACK);

      await choose(container, "Dark");

      expect(classes()).toEqual(["dark"]);
      expect(onChange.mock.calls).toEqual([["dark"]]);
      expect(writes).toEqual([["theme", "dark"]]);
      expect(select(container)).toEqual({
        name: "Theme",
        text: "Dark",
        icons: ["moon"],
      });
    },
  );
});

// A switch that lists one theme, already the provider's, has nothing to
// switch to
describe.each(["toggle", "select"] as const)(
  "ThemeSwitch as %s, listing only the provider's theme",
  (as) => {
    test("does nothing when clicked or chosen", async () => {
      const onChange = vi.fn();
      const container = await mount(
        { defaultTheme: "dark" },
        themeSwitch({ as, themes: ONLY_DARK, onChange }),
      );

      if (as === "toggle") await click(container.querySelector("button"));
      else await choose(container, "Dark");

      expect(classes()).toEqual(["dark"]);
      expect(onChange).not.toHaveBeenCalled();
      expect(writes).toEqual([]);
    });
  },
);

describe("ThemeSwitch, hydrated", () => {
  test('hydrates its server HTML under `defaultTheme="system"` without a warning, and still shows the fallback', async () => {
    const page = serverHtml(
      UNLISTED,
      themeSwitch({ as: "toggle" }),
      themeSwitch({ as: "select" }),
    );
    expect(toggle(page.container)).toEqual(FALLBACK);
    expect(select(page.container)).toEqual(FALLBACK);

    await page.hydrate();

    expect(classes()).toEqual(["system"]);
    expect(toggle(page.container)).toEqual(FALLBACK);
    expect(select(page.container)).toEqual(FALLBACK);
  });

  test("shows the fallback once ThemeProvider restores a saved theme it doesn't list", async () => {
    fakeStorage({ theme: "system" });
    const page = serverHtml(WITH_SYSTEM, themeSwitch());
    expect(toggle(page.container)).toEqual({
      name: "Light",
      text: "",
      icons: ["sun"],
    });

    await page.hydrate();

    expect(classes()).toEqual(["system"]);
    expect(toggle(page.container)).toEqual(FALLBACK);
  });
});

test("choosing System in another ThemeSwitch makes a default one show the fallback", async () => {
  const container = await mount(
    WITH_SYSTEM,
    themeSwitch({ as: "select", themes: CUSTOM_THEMES }),
    themeSwitch(),
  );
  expect(toggle(container)).toEqual({
    name: "Light",
    text: "",
    icons: ["sun"],
  });

  await choose(container, "System");

  expect(classes()).toEqual(["system"]);
  expect(toggle(container)).toEqual(FALLBACK);
});
