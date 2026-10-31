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
import {
  restoreTheme,
  themeDefaults,
  type ThemeScriptOptions,
} from "../utils/theme";

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

// `storageKey`, `defaultTheme` and `themes`, which `getThemeScript` takes too
interface ThemeProviderProps extends ThemeScriptOptions {
  children: ReactNode;
}

// Restores the theme before the browser paints. Layout effects don't run on
// the server, and React 18 warns there, so the server gets useEffect.
const useBeforePaint =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const ThemeProvider: FunctionComponent<ThemeProviderProps> = ({
  children,
  defaultTheme = themeDefaults.defaultTheme,
  storageKey = themeDefaults.storageKey,
  themes = themeDefaults.themes,
}) => {
  // Render reads neither storage nor the DOM, so the server HTML and the
  // first client render match
  const [theme, setThemeState] = useState<string>(defaultTheme);

  // The known names: `themes` plus `defaultTheme`. They depend on the names,
  // not the array, so a parent passing a new array of the same names
  // restores nothing and keeps `setTheme`
  const themesKey = JSON.stringify(themes);
  const known = useMemo<string[]>(() => {
    const list: string[] = JSON.parse(themesKey);
    return list.indexOf(defaultTheme) === -1 ? list.concat(defaultTheme) : list;
  }, [themesKey, defaultTheme]);

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
