// @vitest-environment happy-dom
/**
 * ThemeSwitch and `useTheme().setTheme` outside every ThemeProvider and
 * ThemeContext.Provider, where a click on the switch comes first (#245).
 * There, `setTheme` is ThemeContext's default: it changes nothing, and its
 * first call on a page logs one warning. The tests share one page and run in
 * order. Each check that nothing warns runs before anything has, so the
 * once-per-page warning can't hide one, and the page's warnings are kept in
 * a log of their own, across the tests. use-theme-outside-provider.test.ts
 * calls `setTheme` first.
 */
import {
  act,
  createElement,
  Fragment,
  type ContextType,
  type ReactElement,
} from "react";
import { createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { ThemeContext, ThemeProvider, useTheme } from "../hooks/use-theme";
import { ThemeSwitch } from "./theme-switch";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Every warning logged on this page, by any test, each as its arguments
const warnings: unknown[][] = [];

// `<html>`'s classes, sorted
const classes = () => [...document.documentElement.classList].sort();

const unmounts: (() => Promise<void>)[] = [];

// Mounts `element` in a container on the page, and returns the container
async function mount(element: ReactElement) {
  const container = document.body.appendChild(document.createElement("div"));
  const root = createRoot(container);
  unmounts.push(async () => {
    await act(async () => root.unmount());
    container.remove();
  });
  await act(async () => root.render(element));
  return container;
}

async function click(element: Element | null | undefined) {
  if (!element) throw new Error("There is nothing to click");
  await act(async () => (element as HTMLElement).click());
}

beforeEach(() => {
  document.documentElement.className = "";
  localStorage.clear();
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation((...args: unknown[]) => {
    warnings.push(args);
  });
});

// No test logs a React warning, and nothing is left on the page
afterEach(async () => {
  while (unmounts.length) await unmounts.pop()!();
  const errors = [...vi.mocked(console.error).mock.calls];
  vi.restoreAllMocks();
  expect(errors).toEqual([]);
});

describe("before anything on the page has warned", () => {
  test("a server render of an unwrapped toggle and select logs no warning", () => {
    const html = renderToString(
      createElement(
        Fragment,
        null,
        createElement(ThemeSwitch, { as: "toggle" }),
        createElement(ThemeSwitch, { as: "select" }),
      ),
    );
    expect(html).toMatch(/aria-label="Light"/);
    expect(html).toMatch(/role="combobox"/);
    expect(warnings).toEqual([]);
  });

  test("a click on a toggle inside a ThemeProvider logs no warning", async () => {
    const container = await mount(
      createElement(ThemeProvider, null, createElement(ThemeSwitch)),
    );
    await click(container.querySelector("button"));
    expect(classes()).toEqual(["dark"]);
    expect(warnings).toEqual([]);
  });

  test("a click on a toggle inside a ThemeContext.Provider fed a full value logs no warning", async () => {
    const setTheme = vi.fn();
    const value: ContextType<typeof ThemeContext> = {
      theme: "light",
      setTheme,
      defaultTheme: "light",
    };
    const container = await mount(
      createElement(
        ThemeContext.Provider,
        { value },
        createElement(ThemeSwitch),
      ),
    );
    await click(container.querySelector("button"));
    expect(setTheme.mock.calls).toEqual([["dark"]]);
    expect(warnings).toEqual([]);
  });
});

describe("outside every provider", () => {
  test("an unwrapped toggle and select render without a warning, the toggle's first click warns once, and a second click logs nothing more", async () => {
    const onChange = vi.fn();
    const container = await mount(
      createElement(
        Fragment,
        null,
        createElement(ThemeSwitch, { as: "toggle", onChange }),
        createElement(ThemeSwitch, { as: "select" }),
      ),
    );
    expect(warnings).toEqual([]);

    await click(container.querySelector("button"));

    expect(warnings).toHaveLength(1);
    const [message, ...rest] = warnings[0]!;
    expect(rest).toEqual([]);
    expect(message).toEqual(expect.any(String));
    expect(message).toContain('setTheme("dark")');
    expect(message).toContain("ThemeProvider");
    expect(message).toContain("@amerfathullah/myds-react/hooks");
    expect(message).toContain("ThemeContext.Provider");
    expect(classes()).toEqual([]);
    expect(onChange.mock.calls).toEqual([["dark"]]);

    await click(container.querySelector("button"));

    expect(warnings).toHaveLength(1);
    expect(classes()).toEqual([]);
    expect(onChange.mock.calls).toEqual([["dark"], ["dark"]]);
  });

  test("after that, useTheme().setTheme outside a provider logs nothing more, so the page has one warning in all", async () => {
    let setTheme: ((theme: string) => void) | undefined;
    const Probe = () => {
      setTheme = useTheme().setTheme;
      return null;
    };
    await mount(createElement(Probe));

    await act(async () => setTheme!("light"));

    expect(warnings).toHaveLength(1);
    expect(classes()).toEqual([]);
  });
});
