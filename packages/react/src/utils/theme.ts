/**
 * The theme rule ThemeProvider and `getThemeScript` share. This module
 * creates no React context, so `getThemeScript` can be imported from a React
 * Server Component.
 */

/** ThemeProvider's and `getThemeScript`'s default theme names */
export const defaultThemes = ["light", "dark"];

/**
 * Puts the theme on `<html>` and returns it: the value saved under
 * `storageKey` if it's a known name, one of `themes` or `defaultTheme`, and
 * `defaultTheme` otherwise. Every other known name leaves `<html>`, and its
 * other classes stay. It reads storage but never writes it, and with storage
 * blocked it uses `defaultTheme`.
 *
 * ThemeProvider calls it on mount, and `getThemeScript` carries its source
 * into a script for `<head>`, so it must stay self-contained. It may use only
 * its arguments and built-ins: no module-level helpers or constants, and no
 * syntax the package build compiles into helpers, such as object spread or
 * rest.
 */
export function restoreTheme(
  storageKey: string,
  defaultTheme: string,
  themes: string[],
): string {
  const known =
    themes.indexOf(defaultTheme) === -1
      ? themes.concat([defaultTheme])
      : themes;
  let theme = defaultTheme;
  try {
    // Reading `localStorage` itself throws when storage is blocked
    const saved = window.localStorage.getItem(storageKey);
    if (saved !== null && known.indexOf(saved) !== -1) theme = saved;
  } catch {
    // Storage is blocked, as in a sandboxed iframe, so `defaultTheme` it is
  }
  const classList = document.documentElement.classList;
  for (let i = 0; i !== known.length; i++) classList.remove(known[i]!);
  classList.add(theme);
  return theme;
}

export interface ThemeScriptOptions {
  /** The localStorage key the theme is saved under. Default `"theme"`. */
  storageKey?: string;
  /** The theme used on load when nothing valid is saved. Default `"light"`. */
  defaultTheme?: string;
  /** The theme names, each a class on `<html>`; `defaultTheme` always counts as one. Default `["light", "dark"]`. */
  themes?: string[];
}

/**
 * The source of a self-contained script that puts on `<html>` the theme
 * ThemeProvider would pick on mount, given the same options. Run it in
 * `<head>`, before the page renders, so the page never shows the wrong theme
 * first. It never throws, and a copied script must be regenerated whenever
 * ThemeProvider's options change.
 */
export function getThemeScript(options: ThemeScriptOptions = {}): string {
  const args = JSON.stringify([
    options.storageKey ?? "theme",
    options.defaultTheme ?? "light",
    options.themes ?? defaultThemes,
  ])
    // JSON is a JavaScript expression. With every `<` escaped, no value can
    // end a surrounding <script> element or stop it from closing
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
  return `(${restoreTheme.toString()})(${args.slice(1, -1)})`;
}
