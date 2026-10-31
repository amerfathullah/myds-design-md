import {
  createContext,
  FunctionComponent,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { defaultThemes, restoreTheme } from "../utils/theme";

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  defaultTheme: string;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => {},
  defaultTheme: "light",
});

interface ThemeProviderProps {
  children: ReactNode;
  /** The theme used on load when nothing valid is saved. Default `"light"`. */
  defaultTheme?: string;
  /** The localStorage key the chosen theme is saved under. Default `"theme"`. */
  storageKey?: string;
  /** The theme names restored on load, each a class on `<html>`; `defaultTheme` always counts as one. Default `["light", "dark"]`. */
  themes?: string[];
}

// Restores the theme before the browser paints. Layout effects don't run on
// the server, and React 18 warns there, so the server gets useEffect.
const useBeforePaint =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const ThemeProvider: FunctionComponent<ThemeProviderProps> = ({
  children,
  defaultTheme = "light",
  storageKey = "theme",
  themes = defaultThemes,
}) => {
  // Render reads neither storage nor the DOM, so the server HTML and the
  // first client render match
  const [theme, setThemeState] = useState<string>(defaultTheme);

  // The known names: `themes` plus `defaultTheme`. They depend on the names,
  // not the array, so a parent passing a new array of the same names
  // restores nothing and keeps `setTheme`
  const names = JSON.stringify(themes);
  const known = useMemo<string[]>(() => {
    const list: string[] = JSON.parse(names);
    return list.indexOf(defaultTheme) === -1 ? list.concat(defaultTheme) : list;
  }, [names, defaultTheme]);

  // The last theme this provider put on <html>, known name or not
  const applied = useRef<string | null>(null);
  // The names outside the known ones that `setTheme` has warned about
  const [warned] = useState(() => new Set<string>());

  useBeforePaint(() => {
    if (applied.current !== null)
      document.documentElement.classList.remove(applied.current);
    const restored = restoreTheme(storageKey, defaultTheme, known);
    applied.current = restored;
    setThemeState(restored);
  }, [storageKey, defaultTheme, known]);

  const setTheme = useCallback(
    (name: string) => {
      const classList = document.documentElement.classList;
      known.forEach((knownName) => classList.remove(knownName));
      if (applied.current !== null) classList.remove(applied.current);
      classList.add(name);
      applied.current = name;
      setThemeState(name);
      if (known.indexOf(name) === -1 && !warned.has(name)) {
        warned.add(name);
        console.warn(
          `ThemeProvider: "${name}" isn't in ThemeProvider's \`themes\`, so it applies but isn't restored on load. Add it to ThemeProvider's \`themes\`.`,
        );
      }
      try {
        window.localStorage.setItem(storageKey, name);
      } catch {
        // Storage is blocked, as in a sandboxed iframe: the theme lasts as
        // long as the page
      }
    },
    [known, storageKey, warned],
  );

  const value = useMemo(
    () => ({ theme, setTheme, defaultTheme }),
    [theme, setTheme, defaultTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};

export { ThemeProvider, ThemeContext, useTheme };
