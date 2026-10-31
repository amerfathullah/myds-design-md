/// <reference types="node" />
/**
 * A fake page for the theme tests: the `window`, `document` and
 * `localStorage` that ThemeProvider's theme rule and `getThemeScript`'s
 * script read, with what storage holds and the classes on `<html>` before
 * load. Shared by the source tests and the built-package test, which run the
 * same cases.
 */
import vm from "node:vm";

export interface ThemeOptions {
  storageKey?: string;
  defaultTheme?: string;
  themes?: string[];
}

export interface Page {
  /** What localStorage holds before load, by key */
  saved?: Record<string, string>;
  /** Storage blocked, as in a sandboxed iframe: `getItem` and `setItem` throw, or reading `localStorage` itself does */
  storage?: "getItem throws" | "localStorage throws";
  /** The classes on `<html>` before load */
  classes?: string[];
}

export interface Loaded {
  /** `<html>`'s classes after load, sorted */
  classes: string[];
  /** The keys read from storage */
  reads: string[];
  /** The keys written to storage */
  writes: string[];
}

function fakePage(page: Page) {
  const classes = new Set(page.classes ?? []);
  const saved = new Map(Object.entries(page.saved ?? {}));
  const reads: string[] = [];
  const writes: string[] = [];
  const blocked = () => {
    throw new Error("SecurityError: storage is blocked");
  };
  const storage = {
    getItem(key: string) {
      reads.push(key);
      if (page.storage === "getItem throws") blocked();
      return saved.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      writes.push(key);
      if (page.storage === "getItem throws") blocked();
      saved.set(key, String(value));
    },
  };
  const classList = {
    add: (...tokens: string[]) => tokens.forEach((token) => classes.add(token)),
    remove: (...tokens: string[]) =>
      tokens.forEach((token) => classes.delete(token)),
    contains: (token: string) => classes.has(token),
  };
  const document = { documentElement: { classList } };
  const localStorage: PropertyDescriptor =
    page.storage === "localStorage throws"
      ? { get: blocked, configurable: true, enumerable: true }
      : { value: storage, configurable: true, enumerable: true };
  const window = Object.defineProperties(
    {},
    { localStorage, document: { value: document, enumerable: true } },
  );
  return {
    globals: {
      window: { value: window, configurable: true, enumerable: true },
      document: { value: document, configurable: true, enumerable: true },
      localStorage,
    } satisfies PropertyDescriptorMap,
    loaded: (): Loaded => ({ classes: [...classes].sort(), reads, writes }),
  };
}

/**
 * Runs a theme script in a fresh global context whose only globals, besides
 * the language's built-ins, are the fake page's `window`, `document` and
 * `localStorage`, so it can't lean on the test module's names. The context
 * can't evaluate strings as code, as under a Content Security Policy without
 * `'unsafe-eval'`.
 */
export function runScript(source: string, page: Page): Loaded {
  const fake = fakePage(page);
  const context = vm.createContext(Object.defineProperties({}, fake.globals), {
    codeGeneration: { strings: false, wasm: false },
  });
  vm.runInContext(source, context);
  return fake.loaded();
}

/** Calls `load` with `globalThis`'s `window`, `document` and `localStorage` set to the fake page's */
export function onPage(page: Page, load: () => void): Loaded {
  const fake = fakePage(page);
  const names = Object.keys(fake.globals) as (keyof typeof fake.globals)[];
  const before = names.map((name) =>
    Object.getOwnPropertyDescriptor(globalThis, name),
  );
  Object.defineProperties(globalThis, fake.globals);
  try {
    load();
  } finally {
    names.forEach((name, i) => {
      const descriptor = before[i];
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete (globalThis as Record<string, unknown>)[name];
    });
  }
  return fake.loaded();
}

/** ThemeProvider's and `getThemeScript`'s defaults */
export const defaults = {
  storageKey: "theme",
  defaultTheme: "light",
  themes: ["light", "dark"],
} satisfies Required<ThemeOptions>;

export interface Case {
  name: string;
  options: ThemeOptions;
  page: Page;
  /** `<html>`'s classes after load, sorted */
  classes: string[];
}

const custom = {
  storageKey: "myds-theme",
  themes: ["light", "dark", "system"],
} satisfies ThemeOptions;
const brand = {
  storageKey: "brand",
  defaultTheme: "sepia",
  themes: ["sepia", "contrast"],
} satisfies ThemeOptions;

/** The theme rule's cases: the classes on `<html>` after load, for each set of options and page */
// prettier-ignore
export const cases: Case[] = [
  // The default options
  { name: "dark saved", options: {}, page: { saved: { theme: "dark" } }, classes: ["dark"] },
  { name: "light saved", options: {}, page: { saved: { theme: "light" } }, classes: ["light"] },
  { name: "an unknown name saved", options: {}, page: { saved: { theme: "blue" } }, classes: ["light"] },
  { name: "`system` saved, which the default themes don't list", options: {}, page: { saved: { theme: "system" } }, classes: ["light"] },
  { name: "an empty string saved", options: {}, page: { saved: { theme: "" } }, classes: ["light"] },
  { name: "nothing saved", options: {}, page: {}, classes: ["light"] },
  { name: "a known name saved under another key", options: {}, page: { saved: { "myds-theme": "dark" } }, classes: ["light"] },
  { name: "getItem throwing", options: {}, page: { saved: { theme: "dark" }, storage: "getItem throws" }, classes: ["light"] },
  { name: "reading localStorage throwing", options: {}, page: { saved: { theme: "dark" }, storage: "localStorage throws" }, classes: ["light"] },
  { name: "<html> carrying dark, light saved", options: {}, page: { saved: { theme: "light" }, classes: ["dark"] }, classes: ["light"] },
  { name: "<html> carrying light and dark, nothing saved", options: {}, page: { classes: ["light", "dark"] }, classes: ["light"] },
  { name: "<html> carrying other classes, dark saved", options: {}, page: { saved: { theme: "dark" }, classes: ["font-body", "light", "js"] }, classes: ["dark", "font-body", "js"] },
  { name: "<html> carrying an unknown name, dark saved", options: {}, page: { saved: { theme: "dark" }, classes: ["system"] }, classes: ["dark", "system"] },
  // `defaultTheme` in the default themes
  { name: "defaultTheme dark, nothing saved", options: { defaultTheme: "dark" }, page: {}, classes: ["dark"] },
  { name: "defaultTheme dark, light saved", options: { defaultTheme: "dark" }, page: { saved: { theme: "light" } }, classes: ["light"] },
  { name: "defaultTheme dark, an unknown name saved", options: { defaultTheme: "dark" }, page: { saved: { theme: "blue" } }, classes: ["dark"] },
  { name: "defaultTheme dark, getItem throwing", options: { defaultTheme: "dark" }, page: { storage: "getItem throws" }, classes: ["dark"] },
  // `defaultTheme` not in `themes` counts as one of them
  { name: "defaultTheme solarized, nothing saved", options: { defaultTheme: "solarized" }, page: {}, classes: ["solarized"] },
  { name: "defaultTheme solarized, solarized saved", options: { defaultTheme: "solarized" }, page: { saved: { theme: "solarized" } }, classes: ["solarized"] },
  { name: "defaultTheme solarized, dark saved, <html> carrying solarized", options: { defaultTheme: "solarized" }, page: { saved: { theme: "dark" }, classes: ["solarized"] }, classes: ["dark"] },
  { name: "defaultTheme solarized, an unknown name saved", options: { defaultTheme: "solarized" }, page: { saved: { theme: "blue" } }, classes: ["solarized"] },
  { name: "defaultTheme solarized, reading localStorage throwing, <html> carrying dark", options: { defaultTheme: "solarized" }, page: { storage: "localStorage throws", classes: ["dark"] }, classes: ["solarized"] },
  // A custom `storageKey` and `themes`
  { name: "custom key and themes, system saved", options: custom, page: { saved: { "myds-theme": "system" } }, classes: ["system"] },
  { name: "custom key and themes, dark saved", options: custom, page: { saved: { "myds-theme": "dark" } }, classes: ["dark"] },
  { name: "custom key and themes, an unknown name saved", options: custom, page: { saved: { "myds-theme": "blue" } }, classes: ["light"] },
  { name: "custom key and themes, nothing saved", options: custom, page: {}, classes: ["light"] },
  { name: "custom key and themes, dark saved under the default key only", options: custom, page: { saved: { theme: "dark" } }, classes: ["light"] },
  { name: "custom key and themes, getItem throwing", options: custom, page: { saved: { "myds-theme": "dark" }, storage: "getItem throws" }, classes: ["light"] },
  { name: "custom key and themes, <html> carrying dark and system, light saved", options: custom, page: { saved: { "myds-theme": "light" }, classes: ["dark", "system"] }, classes: ["light"] },
  // Themes that don't include light or dark
  { name: "brand themes, contrast saved", options: brand, page: { saved: { brand: "contrast" } }, classes: ["contrast"] },
  { name: "brand themes, dark saved", options: brand, page: { saved: { brand: "dark" } }, classes: ["sepia"] },
  { name: "brand themes, nothing saved, <html> carrying dark", options: brand, page: { classes: ["dark"] }, classes: ["dark", "sepia"] },
];

/** The storage keys a load may read: the options' key, or none when reading localStorage throws */
export function keysRead({ options, page }: Case): string[] {
  return page.storage === "localStorage throws"
    ? []
    : [options.storageKey ?? defaults.storageKey];
}
