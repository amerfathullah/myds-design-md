// @vitest-environment happy-dom
/**
 * `useTheme().setTheme` outside every ThemeProvider and ThemeContext.Provider,
 * on a page where it's the first call (#245). In a file of its own, so
 * nothing has warned before it. theme-switch-outside-provider.test.ts clicks
 * a ThemeSwitch first.
 */
import { act, createElement, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { ThemeSwitch } from "../components/theme-switch";
import { useTheme } from "./use-theme";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

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

beforeEach(() => {
  document.documentElement.className = "";
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

// No test logs a React warning, and nothing is left on the page
afterEach(async () => {
  while (unmounts.length) await unmounts.pop()!();
  const errors = [...vi.mocked(console.error).mock.calls];
  vi.restoreAllMocks();
  expect(errors).toEqual([]);
});

test("on a fresh page, useTheme().setTheme outside a provider warns once, and a later click on an unwrapped toggle logs nothing more", async () => {
  let setTheme: ((theme: string) => void) | undefined;
  const Probe = () => {
    setTheme = useTheme().setTheme;
    return null;
  };
  await mount(createElement(Probe));
  expect(console.warn).not.toHaveBeenCalled();

  await act(async () => setTheme!("dark"));

  expect(vi.mocked(console.warn).mock.calls).toEqual([
    [
      expect.stringMatching(
        /setTheme\("dark"\).*ThemeProvider.*@amerfathullah\/myds-react\/hooks/,
      ),
    ],
  ]);
  expect(classes()).toEqual([]);

  const onChange = vi.fn();
  const container = await mount(createElement(ThemeSwitch, { onChange }));
  await act(async () => container.querySelector("button")!.click());

  expect(console.warn).toHaveBeenCalledTimes(1);
  expect(classes()).toEqual([]);
  expect(onChange.mock.calls).toEqual([["dark"]]);
});
