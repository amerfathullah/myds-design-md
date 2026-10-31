// @vitest-environment happy-dom
import {
  act,
  createElement,
  StrictMode,
  type ComponentProps,
  type ContextType,
} from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { ThemeSwitch } from "../components/theme-switch";
import {
  blockedStorage,
  fakeStorage as fakeStorageOf,
  type Blocked,
} from "../utils/theme-test-page";
import { ThemeContext, ThemeProvider, useTheme } from "./use-theme";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

type ProviderProps = Omit<ComponentProps<typeof ThemeProvider>, "children">;
type Theme = ContextType<typeof ThemeContext>;

// Puts a fake localStorage on the page: one holding `saved`, or one that's
// blocked, as in a sandboxed iframe
function fakeStorage(saved?: Record<string, string>, blocked?: Blocked) {
  const fake = fakeStorageOf(saved, blocked);
  vi.spyOn(window, "localStorage", "get").mockImplementation(() =>
    blocked === "localStorage throws"
      ? blockedStorage()
      : (fake.storage as Storage),
  );
  return fake;
}

// `<html>`'s classes, sorted
const classes = () => [...document.documentElement.classList].sort();

// Mounts a ThemeProvider around a component that records what `useTheme()`
// returns on every render, and re-renders it with new props
async function mount(props: ProviderProps = {}, strict = false) {
  const seen: Theme[] = [];
  const Probe = () => {
    seen.push(useTheme());
    return null;
  };
  const root = createRoot(document.createElement("div"));
  const render = (next: ProviderProps) => {
    const provider = createElement(ThemeProvider, {
      ...next,
      children: createElement(Probe),
    });
    return act(async () =>
      root.render(
        strict ? createElement(StrictMode, null, provider) : provider,
      ),
    );
  };
  await render(props);
  return {
    seen,
    get current() {
      return seen[seen.length - 1]!;
    },
    rerender: render,
    setTheme: (theme: string) =>
      act(async () => seen[seen.length - 1]!.setTheme(theme)),
    unmount: () => act(async () => root.unmount()),
  };
}

let unmount: (() => Promise<void>) | undefined;

beforeEach(() => {
  document.documentElement.className = "";
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

// No test logs a React warning, and only the unknown-name test warns
afterEach(async () => {
  await unmount?.();
  unmount = undefined;
  const errors = [...vi.mocked(console.error).mock.calls];
  vi.restoreAllMocks();
  expect(errors).toEqual([]);
});

async function mounted(props?: ProviderProps, strict?: boolean) {
  const provider = await mount(props, strict);
  unmount = provider.unmount;
  return provider;
}

describe("ThemeProvider on mount", () => {
  test("restores a saved theme", async () => {
    fakeStorage({ theme: "dark" });
    const provider = await mounted();
    expect(classes()).toEqual(["dark"]);
    expect(provider.current.theme).toBe("dark");
  });

  test("applies `defaultTheme` when nothing is saved, and writes nothing", async () => {
    const { items, writes } = fakeStorage();
    const provider = await mounted({ defaultTheme: "dark" });
    expect(classes()).toEqual(["dark"]);
    expect(provider.current.theme).toBe("dark");
    expect(writes).toEqual([]);
    expect([...items]).toEqual([]);
  });

  test("applies `defaultTheme` when the saved value isn't a known name, and leaves it saved", async () => {
    const { items, writes } = fakeStorage({ theme: "blue" });
    const provider = await mounted();
    expect(classes()).toEqual(["light"]);
    expect(provider.current.theme).toBe("light");
    expect(writes).toEqual([]);
    expect([...items]).toEqual([["theme", "blue"]]);
  });

  test("replaces a theme class already on <html>, and keeps its other classes", async () => {
    fakeStorage({ theme: "light" });
    document.documentElement.className = "font-body dark";
    const provider = await mounted();
    expect(classes()).toEqual(["font-body", "light"]);
    expect(provider.current.theme).toBe("light");
  });

  test("reads its own `storageKey` and `themes`", async () => {
    fakeStorage({ theme: "dark", "myds-theme": "system" });
    const provider = await mounted({
      storageKey: "myds-theme",
      themes: ["light", "dark", "system"],
    });
    expect(classes()).toEqual(["system"]);
    expect(provider.current.theme).toBe("system");
  });

  test.each(["methods throw", "localStorage throws"] as const)(
    "with storage blocked (%s), applies `defaultTheme`, and `setTheme` still changes the class and state",
    async (blocked) => {
      fakeStorage({ theme: "light" }, blocked);
      const provider = await mounted({ defaultTheme: "dark" });
      expect(classes()).toEqual(["dark"]);
      expect(provider.current.theme).toBe("dark");
      await provider.setTheme("light");
      expect(classes()).toEqual(["light"]);
      expect(provider.current.theme).toBe("light");
    },
  );

  test("under StrictMode, leaves exactly one theme class and writes nothing", async () => {
    const { writes } = fakeStorage({ theme: "dark" });
    const provider = await mounted({}, true);
    expect(classes()).toEqual(["dark"]);
    expect(provider.current.theme).toBe("dark");
    expect(writes).toEqual([]);
  });
});

describe("ThemeProvider's setTheme", () => {
  test("replaces the class, updates the theme and saves it", async () => {
    const { writes } = fakeStorage();
    const provider = await mounted();
    await provider.setTheme("dark");
    expect(classes()).toEqual(["dark"]);
    expect(provider.current.theme).toBe("dark");
    expect(writes).toEqual([["theme", "dark"]]);
  });

  test("a `defaultTheme` the themes don't list counts as one of them", async () => {
    const { writes } = fakeStorage();
    const provider = await mounted({ defaultTheme: "solarized" });
    expect(classes()).toEqual(["solarized"]);
    expect(provider.current.theme).toBe("solarized");
    await provider.setTheme("dark");
    expect(classes()).toEqual(["dark"]);
    expect(provider.current.theme).toBe("dark");
    await provider.setTheme("solarized");
    expect(classes()).toEqual(["solarized"]);
    expect(provider.current.theme).toBe("solarized");
    expect(writes).toEqual([
      ["theme", "dark"],
      ["theme", "solarized"],
    ]);
    expect(console.warn).not.toHaveBeenCalled();
  });

  test("two calls before a re-render leave only the last class", async () => {
    fakeStorage();
    const provider = await mounted();
    const { setTheme } = provider.current;
    await act(async () => {
      setTheme("dark");
      setTheme("light");
    });
    expect(classes()).toEqual(["light"]);
    expect(provider.current.theme).toBe("light");
  });

  test("applies a name that isn't a known name, and warns once per name", async () => {
    const { items } = fakeStorage();
    const provider = await mounted();
    await provider.setTheme("system");
    expect(classes()).toEqual(["system"]);
    expect(provider.current.theme).toBe("system");
    expect(items.get("theme")).toBe("system");
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(String(vi.mocked(console.warn).mock.calls[0]?.[0])).toMatch(
      /"system".*`themes`/,
    );
    await provider.setTheme("dark");
    expect(classes()).toEqual(["dark"]);
    expect(provider.current.theme).toBe("dark");
    await provider.setTheme("system");
    expect(classes()).toEqual(["system"]);
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  test("keeps its identity, and the context value too, when the parent re-renders with the same theme names", async () => {
    fakeStorage({}, "methods throw");
    const provider = await mounted({ themes: ["light", "dark"] });
    const { setTheme } = provider.current;
    await provider.setTheme("dark");
    const value = provider.current;
    const renders = provider.seen.length;
    for (let i = 0; i < 3; i++)
      await provider.rerender({ themes: ["light", "dark"] });
    expect(provider.seen.length).toBe(renders + 3);
    expect(provider.seen.slice(renders).every((v) => v === value)).toBe(true);
    expect(provider.seen.every((v) => v.setTheme === setTheme)).toBe(true);
    expect(classes()).toEqual(["dark"]);
    expect(provider.current.theme).toBe("dark");
  });
});

// The server HTML shows `defaultTheme`, and hydrates without a warning
// before the provider restores the saved theme
test("hydrates server HTML without a warning, then restores the saved theme", async () => {
  fakeStorage({ theme: "light" });
  const tree = createElement(ThemeProvider, {
    defaultTheme: "dark",
    children: [
      createElement(ThemeSwitch, { key: "toggle", as: "toggle" }),
      createElement(ThemeSwitch, { key: "select", as: "select" }),
    ],
  });
  const container = document.createElement("div");
  container.innerHTML = renderToString(tree);
  document.body.append(container);
  expect(container.querySelector("button")?.getAttribute("aria-label")).toBe(
    "Dark",
  );
  let root: ReturnType<typeof hydrateRoot> | undefined;
  await act(async () => {
    root = hydrateRoot(container, tree);
  });
  unmount = async () => {
    await act(async () => root?.unmount());
    container.remove();
  };
  expect(classes()).toEqual(["light"]);
  expect(container.querySelector("button")?.getAttribute("aria-label")).toBe(
    "Light",
  );
});
