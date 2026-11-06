/**
 * The Node programs registry.dist.test.ts runs, as strings. Each one loads
 * the built package by its own name, from the package root, and prints one
 * JSON object. A case that throws reports `{ threw }`, with what it logged,
 * instead of its result, so the other cases still report theirs.
 */
export type Condition = "import" | "require";

/** The ways the registry's key can be unusable before any entry loads */
export const fallbacks = [
  "globalThis frozen",
  "globalThis not extensible",
  "a plain object under the registry's key",
  "a WeakMap holding no Map under the registry's key",
] as const;
export type Fallback = (typeof fallbacks)[number];

/**
 * The parents whose Button holds ButtonIcon and ButtonCounter children, with
 * the variant and size their source gives that Button
 */
export const buttonParents = {
  PaginationPrevious: { variant: "default-outline", size: "medium" },
  PaginationNext: { variant: "default-outline", size: "medium" },
  CookieBannerPreferencesTrigger: {
    variant: "primary-outline",
    size: "medium",
  },
  Skiplink: { variant: "primary-outline", size: "small" },
} as const;
export type ButtonParent = keyof typeof buttonParents;

/** The entries the cases render from, by the name the programs give them */
export const caseEntries = {
  hooks: "hooks",
  themeSwitch: "theme-switch",
  toast: "toast",
  dialog: "dialog",
  alertDialog: "alert-dialog",
  button: "button",
  pagination: "pagination",
  cookieBanner: "cookie-banner",
  skiplink: "skiplink",
} as const;

/** A toast's title and description, which AutoToast shows as its text */
export const toastText = (title: string) => ({
  title,
  description: `About ${title}`,
});

// The start of a program for a condition: `load` and `where` load and resolve
// a module through it
const header = (condition: Condition) =>
  condition === "import"
    ? `import { createRequire } from "node:module";
       const require = createRequire(process.cwd() + "/package.json");
       const load = (name) => import(name);
       const where = (name) => import.meta.resolve(name);`
    : `const load = (name) => require(name);
       const where = (name) => require.resolve(name);`;

// Runs a program's body and prints its result. A crash prints what it
// logged too.
const main = (body: string) => `
  const print = (result) =>
    process.stdout.write(JSON.stringify(result), () => process.exit(0));
  (async () => {
    ${body}
  })().then(print, (error) => {
    process.stderr.write(failure(error));
    process.exit(1);
  });`;

// What the programs share: every entry's name, console output kept rather
// than printed, and running a case
const common = (pkgName: string, subpaths: string[]) => `
  const pkgName = ${JSON.stringify(pkgName)};
  const subpaths = ${JSON.stringify(subpaths)};
  const entry = (subpath) => pkgName + subpath.replace(/^\\./, "");
  const { format } = require("node:util");
  const logs = [];
  for (const level of ["error", "warn", "info", "log", "debug"])
    console[level] = (...args) => logs.push(level + ": " + format(...args));
  const failure = (error) =>
    String((error && error.stack) || error) +
    (logs.length ? "\\n\\nLogged:\\n" + logs.join("\\n") : "");
  const attempt = async (run) => {
    try {
      return await run();
    } catch (error) {
      return { threw: failure(error) };
    }
  };`;

// Registers a happy-dom Window's globals onto globalThis as Vitest's
// happy-dom environment does: every name Node lacks, and the DOM's own
// classes and objects that Node defines too. Functions are bound to the
// window, and `window`, `self`, `top`, `parent` and the document's
// `defaultView` are globalThis.
const dom = `
  const { Window } = await load("happy-dom");
  const win = new Window({
    url: "http://localhost/",
    settings: { disableErrorCapturing: true },
  });
  const shadowed = new Set([
    "Event", "CustomEvent", "MessageEvent", "EventTarget", "DOMException",
    "Navigator", "navigator", "localStorage", "sessionStorage", "Storage",
    "Blob", "File", "FormData", "AbortController", "AbortSignal", "Headers",
    "Request", "Response", "fetch", "URL", "URLSearchParams", "MessagePort",
    "WebSocket",
  ]);
  for (const key of Object.getOwnPropertyNames(win)) {
    if (["window", "self", "top", "parent"].includes(key)) continue;
    if (key in globalThis && !shadowed.has(key)) continue;
    const value = win[key];
    const bound =
      typeof value === "function" && key[0] !== key[0].toUpperCase()
        ? value.bind(win)
        : undefined;
    Object.defineProperty(globalThis, key, {
      configurable: true,
      get: () => bound ?? win[key],
      set: (next) =>
        Object.defineProperty(globalThis, key, {
          configurable: true, writable: true, value: next,
        }),
    });
  }
  for (const key of ["window", "self", "top", "parent"]) globalThis[key] = globalThis;
  Object.defineProperty(win.document, "defaultView", {
    configurable: true, enumerable: true, get: () => globalThis,
  });
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;`;

// Loads React, React DOM and every case's entry, as `modules`
const loadCases = `
  const React = await load("react");
  const { createRoot } = await load("react-dom/client");
  const { renderToStaticMarkup } = await load("react-dom/server");
  const names = ${JSON.stringify(caseEntries)};
  const files = {};
  const modules = {};
  for (const [name, subpath] of Object.entries(names)) {
    files[subpath] = where(entry("./" + subpath));
    modules[name] = await load(entry("./" + subpath));
  }`;

// The cases. Each takes the modules a provider comes from, `p`, and those
// its consumer comes from, `c`.
const cases = `
  const h = React.createElement;
  const act = React.act;

  const reset = () => {
    document.documentElement.className = "";
    localStorage.clear();
  };
  const mount = async (element) => {
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    await act(async () => root.render(element));
    return {
      container,
      unmount: async () => {
        await act(async () => root.unmount());
        container.remove();
      },
    };
  };
  const click = async (node) => {
    if (!node) throw new Error("There is nothing to click");
    await act(async () => node.click());
  };
  const htmlClasses = () => [...document.documentElement.classList];
  // What a ThemeSwitch as="select" shows in server HTML
  const shownIn = (html) => html.match(/<span>([^<]*)<\\/span>/)?.[1] ?? html;

  const themeProviderServer = (p, c) =>
    shownIn(renderToStaticMarkup(
      h(p.hooks.ThemeProvider, { defaultTheme: "dark" },
        h(c.themeSwitch.ThemeSwitch, { as: "select" })),
    ));

  const themeProviderClient = async (p, c) => {
    reset();
    const view = await mount(
      h(p.hooks.ThemeProvider, { defaultTheme: "dark" },
        h(c.themeSwitch.ThemeSwitch, { as: "select" })),
    );
    const result = {
      html: htmlClasses(),
      shows: view.container.querySelector('[role="combobox"]')?.textContent ?? null,
    };
    await view.unmount();
    return result;
  };

  const bridgeValue = (setTheme) => ({ theme: "dark", setTheme, defaultTheme: "light" });

  const themeContextServer = (p, c) =>
    shownIn(renderToStaticMarkup(
      h(p.hooks.ThemeContext.Provider, { value: bridgeValue(() => {}) },
        h(c.themeSwitch.ThemeSwitch, { as: "select" })),
    ));

  const themeContextToggle = async (p, c) => {
    const calls = [];
    const view = await mount(
      h(p.hooks.ThemeContext.Provider, { value: bridgeValue((...args) => calls.push(args)) },
        h(c.themeSwitch.ThemeSwitch, { as: "toggle" })),
    );
    await click(view.container.querySelector("button"));
    await view.unmount();
    return calls;
  };

  const themeToggle = async (p, c) => {
    reset();
    const view = await mount(
      h(p.hooks.ThemeProvider, null, h(c.themeSwitch.ThemeSwitch, { as: "toggle" })),
    );
    const state = () => ({
      html: htmlClasses(),
      saved: localStorage.getItem("theme"),
      label: view.container.querySelector("button")?.getAttribute("aria-label") ?? null,
    });
    const before = state();
    await click(view.container.querySelector("button"));
    const after = state();
    await view.unmount();
    return { before, after };
  };

  // The text of each toast an AutoToast from \`c\` shows after toast() from
  // \`p\`'s useToast
  const toastShown = async (p, c, text) => {
    let send;
    const Sender = () => {
      send = p.hooks.useToast().toast;
      return null;
    };
    const view = await mount(h(React.Fragment, null, h(c.toast.AutoToast), h(Sender)));
    await act(async () => send({ variant: "success", ...text }));
    const shown = [...view.container.querySelectorAll("li")].map((li) => li.textContent);
    await view.unmount();
    return shown;
  };

  // Whether a dialog is open before and after its close button is clicked,
  // and how many times it called onDismiss
  const closed = async (element, onDismiss) => {
    const open = () => document.querySelector('[role="dialog"]') !== null;
    const view = await mount(element);
    const before = open();
    await click(document.getElementById("probe-close"));
    const result = { before, after: open(), dismissed: onDismiss.calls };
    await view.unmount();
    return result;
  };
  const counter = () => {
    const count = () => { count.calls++; };
    count.calls = 0;
    return count;
  };
  const closeButton = () => h("button", { type: "button", id: "probe-close" }, "Cancel");

  const alertDialogByDialogClose = (p, c) => {
    const onDismiss = counter();
    return closed(
      h(p.alertDialog.AlertDialog, { defaultOpen: true },
        h(p.alertDialog.AlertDialogContent, { onDismiss },
          h(p.alertDialog.AlertDialogTitle, null, "Delete the file?"),
          h(p.alertDialog.AlertDialogDescription, null, "You can't undo this."),
          h(c.dialog.DialogClose, null, closeButton()))),
      onDismiss,
    );
  };

  const dialogByAlertDialogClose = (p, c) => {
    const onDismiss = counter();
    return closed(
      h(p.dialog.Dialog, { defaultOpen: true },
        h(p.dialog.DialogBody, { onDismiss },
          h(p.dialog.DialogTitle, null, "Edit the file"),
          h(p.dialog.DialogDescription, null, "Change its name."),
          h(c.alertDialog.AlertDialogClose, null, closeButton()))),
      onDismiss,
    );
  };

  // The classes of a ButtonIcon's icon and a ButtonCounter's span from \`c\`,
  // rendered as children of \`parent\`
  const probeClasses = (c, parent, props) => {
    const { ButtonIcon, ButtonCounter } = c.button;
    const div = document.createElement("div");
    div.innerHTML = renderToStaticMarkup(
      h(parent, props,
        h(ButtonIcon, { key: "icon" }, h("svg", { "data-probe": "icon" })),
        h(ButtonCounter, { key: "counter" }, h("b", { "data-probe": "counter" }, "3"))),
    );
    return {
      icon: div.querySelector('[data-probe="icon"]')?.getAttribute("class") ?? null,
      counter:
        div.querySelector('[data-probe="counter"]')?.parentElement?.getAttribute("class") ?? null,
    };
  };

  const buttonChildren = (p, c) => {
    const parents = {
      PaginationPrevious: [p.pagination.PaginationPrevious, {}],
      PaginationNext: [p.pagination.PaginationNext, {}],
      CookieBannerPreferencesTrigger: [p.cookieBanner.CookieBannerPreferencesTrigger, {}],
      Skiplink: [p.skiplink.Skiplink, { href: "#main" }],
    };
    const buttons = ${JSON.stringify(buttonParents)};
    return {
      outside: probeClasses(c, React.Fragment, null),
      parents: Object.fromEntries(
        Object.entries(parents).map(([name, [parent, props]]) => [name, {
          inside: probeClasses(c, parent, props),
          // The same children of c's own Button, with the parent's variant and size
          expected: probeClasses(c, c.button.Button, buttons[name]),
        }]),
      ),
    };
  };`;

/**
 * Every case under one condition: every case's entry, React and React DOM
 * loaded through it, in happy-dom
 */
export const casesProgram = (
  condition: Condition,
  pkgName: string,
  subpaths: string[],
) =>
  header(condition) +
  common(pkgName, subpaths) +
  main(`
    ${dom}
    ${loadCases}
    ${cases}
    const m = modules;
    const result = {
      files,
      themeProviderServer: await attempt(() => themeProviderServer(m, m)),
      themeProviderClient: await attempt(() => themeProviderClient(m, m)),
      themeContextServer: await attempt(() => themeContextServer(m, m)),
      themeContextToggle: await attempt(() => themeContextToggle(m, m)),
      themeToggle: await attempt(() => themeToggle(m, m)),
      toast: await attempt(() => toastShown(m, m, ${JSON.stringify(toastText("Saved"))})),
      alertDialogByDialogClose: await attempt(() => alertDialogByDialogClose(m, m)),
      dialogByAlertDialogClose: await attempt(() => dialogByAlertDialogClose(m, m)),
      buttonChildren: await attempt(() => buttonChildren(m, m)),
    };
    await win.happyDOM.close();
    return result;`);

/** The four directions of a provider's condition and its consumer's */
export const directions = [
  ["import", "import"],
  ["import", "require"],
  ["require", "import"],
  ["require", "require"],
] as const;

/**
 * One process that loads every case's entry through both conditions, and
 * runs ThemeProvider, ThemeContext.Provider and toast() with the provider
 * from one condition and the consumer from the other
 */
export const mixedProgram = (pkgName: string, subpaths: string[]) =>
  header("import") +
  common(pkgName, subpaths) +
  main(`
    ${dom}
    const React = require("react");
    const { createRoot } = require("react-dom/client");
    const { renderToStaticMarkup } = require("react-dom/server");
    const imported = await import("react");
    const names = ${JSON.stringify(caseEntries)};
    const files = { import: {}, require: {} };
    const via = { import: {}, require: {} };
    for (const [name, subpath] of Object.entries(names)) {
      files.import[subpath] = import.meta.resolve(entry("./" + subpath));
      via.import[name] = await import(entry("./" + subpath));
      files.require[subpath] = require.resolve(entry("./" + subpath));
      via.require[name] = require(entry("./" + subpath));
    }
    ${cases}
    const texts = ${JSON.stringify(Object.fromEntries(directions.map((direction) => [direction.join(" to "), toastText(direction.join(" to "))])))};
    const results = {};
    for (const [direction, text] of Object.entries(texts)) {
      const [p, c] = direction.split(" to ").map((condition) => via[condition]);
      results[direction] = {
        themeProvider: await attempt(() => themeProviderServer(p, c)),
        themeContext: await attempt(() => themeContextServer(p, c)),
        toast: await attempt(() => toastShown(p, c, text)),
      };
    }
    await win.happyDOM.close();
    return {
      oneReact: imported.createContext === React.createContext,
      files,
      directions: results,
    };`);

/**
 * Loads every exported entry through a condition, and records each React
 * context and mitt emitter made where a frame in `<root>/src/` comes before
 * any module-loading frame on the call's source-mapped stack. It names each
 * by its place in src: the last such frame. Run it under
 * `--enable-source-maps`.
 */
export const censusProgram = (
  condition: Condition,
  pkgName: string,
  subpaths: string[],
) =>
  (condition === "import"
    ? `import { registerHooks } from "node:module";`
    : "") +
  header(condition) +
  common(pkgName, subpaths) +
  main(`
    const { pathToFileURL } = require("node:url");
    Error.stackTraceLimit = Infinity;
    const srcPath = process.cwd() + "/src/";
    const srcURL = pathToFileURL(srcPath).href;
    // The place in src that made the call: its last src frame before any
    // module-loading frame, or nothing if a module-loading frame comes first
    const madeIn = (stack) => {
      let place = null;
      for (const line of stack.split("\\n").slice(1)) {
        if (line.includes("node:internal/modules/")) break;
        const [prefix] = [srcURL, srcPath].filter((prefix) => line.includes(prefix));
        if (!prefix) continue;
        const rest = line.slice(line.indexOf(prefix) + prefix.length);
        place = "src/" + rest.replace(/\\)$/, "").replace(/:\\d+$/, "");
      }
      return place;
    };

    const React = require("react");
    const createContext = React.createContext;
    const contexts = [];
    const recordingCreateContext = function (...args) {
      const place = madeIn(new Error().stack);
      if (place) contexts.push(place);
      return createContext.apply(this, args);
    };
    React.createContext = recordingCreateContext;

    const emitters = [];
    globalThis.__censusMitt = (stack) => {
      const place = madeIn(stack);
      if (place) emitters.push(place);
    };
    const mittFiles = [];
    ${
      condition === "require"
        ? `const mittPath = require.resolve("mitt");
           const mitt = require(mittPath);
           const recordingMitt = function (...args) {
             globalThis.__censusMitt(new Error().stack);
             return mitt.apply(this, args);
           };
           require.cache[mittPath].exports = recordingMitt;`
        : `// mitt's ESM file, served as a module that records each call
           registerHooks({
             load(url, context, nextLoad) {
               if (!/\\/mitt\\/dist\\/mitt\\.mjs$/.test(url)) return nextLoad(url, context);
               mittFiles.push({ file: url, wrapped: true });
               return {
                 format: "module",
                 shortCircuit: true,
                 source: "import mitt from " + JSON.stringify(url + "?census") + ";" +
                   "export default function () {" +
                   "  globalThis.__censusMitt(new Error().stack);" +
                   "  return mitt.apply(this, arguments);" +
                   "}",
               };
             },
           });`
    }

    const failed = {};
    for (const subpath of subpaths) {
      try {
        await load(entry(subpath));
      } catch (error) {
        failed[subpath] = String((error && error.stack) || error);
      }
    }
    const seen = await load("react");
    ${
      condition === "require"
        ? `for (const file of Object.keys(require.cache))
             if (/[\\\\/]mitt[\\\\/]dist[\\\\/]mitt\\.js$/.test(file))
               mittFiles.push({ file, wrapped: require.cache[file].exports === recordingMitt });`
        : `for (const file of Object.keys(require.cache))
             if (/[\\\\/]mitt[\\\\/]dist[\\\\/]/.test(file))
               mittFiles.push({ file, wrapped: false });`
    }
    return {
      // Whether the entries' React, as this condition loads it, has the
      // recording createContext
      recording:
        seen.createContext === recordingCreateContext &&
        (seen.default ?? seen).createContext === recordingCreateContext,
      mittFiles: mittFiles.map(({ file, wrapped }) => ({
        file: file.slice(file.lastIndexOf("/mitt/") + 1),
        wrapped,
      })),
      failed,
      contexts,
      emitters,
    };`);

/**
 * Loads every exported entry through a condition with the registry's key
 * unusable, then server-renders ThemeProvider from `./hooks` around a
 * consumer of useTheme from `./hooks`. It reports what the key holds after.
 */
export const fallbackProgram = (
  condition: Condition,
  fallback: Fallback,
  pkgName: string,
  subpaths: string[],
  registryKey: string,
) =>
  header(condition) +
  common(pkgName, subpaths) +
  main(`
    const React = await load("react");
    const { renderToStaticMarkup } = await load("react-dom/server");
    const key = Symbol.for(${JSON.stringify(registryKey)});
    const fallback = ${JSON.stringify(fallback)};
    const held = { schema: "another" };
    let foreign;
    if (fallback === "globalThis frozen") Object.freeze(globalThis);
    if (fallback === "globalThis not extensible") Object.preventExtensions(globalThis);
    if (fallback === "a plain object under the registry's key") foreign = held;
    if (fallback === "a WeakMap holding no Map under the registry's key")
      foreign = new WeakMap([[React.createContext, held]]);
    if (foreign) globalThis[key] = foreign;

    const failed = {};
    for (const subpath of subpaths) {
      try {
        await load(entry(subpath));
      } catch (error) {
        failed[subpath] = String((error && error.stack) || error);
      }
    }
    const hooks = await attempt(() => load(entry("./hooks")));
    const shows = await attempt(() => {
      const Consumer = () => React.createElement("span", null, hooks.useTheme().theme);
      return renderToStaticMarkup(
        React.createElement(hooks.ThemeProvider, { defaultTheme: "dark" },
          React.createElement(Consumer)),
      );
    });
    const after = globalThis[key];
    // Object.isFrozen would make Node define its lazy globals, and throw
    const { writable, configurable } = Object.getOwnPropertyDescriptor(globalThis, "Object");
    return {
      failed,
      shows,
      frozen: !writable && !configurable,
      extensible: Object.isExtensible(globalThis),
      // Whether globalThis has the key, and whether what it held before
      // any entry loaded is still there, as it was
      onGlobal: Object.getOwnPropertySymbols(globalThis).includes(key),
      untouched:
        after === foreign &&
        Reflect.ownKeys(held).length === 1 &&
        held.schema === "another" &&
        (!(foreign instanceof WeakMap) || foreign.get(React.createContext) === held),
    };`);

/**
 * Loads every exported entry in turn through a condition, under React's
 * `react-server` build (run with `--conditions=react-server`), and reports
 * whether each loads or the name of what it throws
 */
export const reactServerProgram = (
  condition: Condition,
  pkgName: string,
  subpaths: string[],
) =>
  header(condition) +
  common(pkgName, subpaths) +
  main(`
    const React = require("react");
    const results = {};
    for (const subpath of subpaths) {
      try {
        await load(entry(subpath));
        results[subpath] = "loads";
      } catch (error) {
        results[subpath] = error?.constructor?.name ?? typeof error;
      }
    }
    return { createContext: typeof React.createContext, results };`);
