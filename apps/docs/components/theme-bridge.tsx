"use client";

import { ThemeContext } from "@amerfathullah/myds-react/hooks";
import { useTheme } from "fumadocs-ui/provider/base";
import { useMemo, useSyncExternalStore, type ReactNode } from "react";

const subscribe = () => () => {};

/**
 * Feeds MYDS's ThemeContext from Fumadocs' theme, next-themes, which keeps
 * the site theme on `<html>` under the same `theme` key. So every live
 * ThemeSwitch on the docs site reads and sets the site theme, instead of a
 * MYDS ThemeProvider fighting next-themes for `<html>`. It must sit under
 * Fumadocs' RootProvider.
 *
 * By default it passes the theme next-themes resolved to, `light` or `dark`.
 * `raw` passes the theme chosen instead, which can be `system`, for a switch
 * that offers System.
 */
export function ThemeBridge({
  children,
  raw = false,
}: {
  children: ReactNode;
  raw?: boolean;
}) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  // next-themes knows the theme only in the browser, so the server HTML and
  // hydration show light, as a MYDS ThemeProvider's would
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const current = (mounted && (raw ? theme : resolvedTheme)) || "light";
  const value = useMemo(
    () => ({ theme: current, setTheme, defaultTheme: "light" }),
    [current, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
