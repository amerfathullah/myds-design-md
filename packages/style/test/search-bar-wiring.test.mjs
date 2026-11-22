// SearchBarInput's `aria-expanded` and `aria-controls` in Chromium, after
// hydration (#204, #369). Server HTML renders each input collapsed, naming
// nothing, and hydration matches it: no recoverable error, nothing logged,
// and the server's inputs, panels and listboxes kept. Then each input is
// expanded only while a listbox is displayed, and its `aria-controls` names
// its own bar's listbox while one is mounted, else its panel, else nothing.
// axe-core 4.10.2 then finds no `aria-valid-attr-value`, `aria-required-attr`
// or `scrollable-region-focusable` violation, with no panel, a closed panel
// with a list, an open panel whose list scrolls, an open panel showing only
// "No results found", and two bars. Other rules' violations are reported as
// diagnostics, not failures. In the docs' controlled composition, typing,
// ArrowDown and ArrowUp keep `aria-activedescendant` inside the element
// `aria-controls` names, and a query with no matches leaves the input
// collapsed with none.
//
// The page is search-bar-wiring.page.jsx: the React components themselves,
// rendered to HTML in Node by search-bar-wiring.server.jsx, then bundled
// with esbuild and hydrated in Chromium, on the stylesheet the Tailwind
// import compiles for full.css's sources. Both halves run React's
// development build, so the test sees its warnings, from one copy of React:
// the components' own, or the one whose `react` and `react-dom` packages are
// in the directory MYDS_REACT_MODULES names, e.g. React 18.3.1's:
//   MYDS_REACT_MODULES=/path/to/node_modules node --test test/search-bar-wiring.test.mjs
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { format } from "node:util";

import { build } from "esbuild";
import { chromium } from "playwright";

import { registryDefine } from "../../react/registry-define.mjs";
import { compile, fullCssSources } from "./compile.mjs";

const pageSource = fileURLToPath(
  new URL("./search-bar-wiring.page.jsx", import.meta.url),
);
const serverSource = fileURLToPath(
  new URL("./search-bar-wiring.server.jsx", import.meta.url),
);
// The directory React and React DOM come from
const reactModules = process.env.MYDS_REACT_MODULES
  ? path.resolve(process.env.MYDS_REACT_MODULES)
  : fileURLToPath(new URL("../../react/node_modules", import.meta.url));
const reactVersion = JSON.parse(
  fs.readFileSync(path.join(reactModules, "react/package.json"), "utf8"),
).version;

const axeSource = fs.readFileSync(
  createRequire(import.meta.url).resolve("axe-core/axe.min.js"),
  "utf8",
);
// The rules the brief holds the wiring to (#204)
const rules = [
  "aria-valid-attr-value",
  "aria-required-attr",
  "scrollable-region-focusable",
];

// Resolves React and React DOM to `reactModules` wherever they're imported,
// so the page, the components, cmdk and Radix share one copy
const oneReact = {
  name: "one-react",
  setup(build) {
    build.onResolve(
      { filter: /^react(-dom)?(\/|$)/ },
      async ({ path: request, kind, pluginData }) => {
        if (pluginData?.oneReact) return undefined;
        const { path: resolved, errors } = await build.resolve(request, {
          kind,
          resolveDir: reactModules,
          pluginData: { oneReact: true },
        });
        return errors.length ? { errors } : { path: resolved };
      },
    );
  },
};

const bundling = {
  bundle: true,
  write: false,
  metafile: true,
  jsx: "automatic",
  // React's development build, so the test sees its warnings
  define: { ...registryDefine, "process.env.NODE_ENV": '"development"' },
  plugins: [oneReact],
  logLevel: "silent",
};

// The files of React and React DOM a bundle holds from any other copy
const copies = ["react", "react-dom"].map(
  (name) => fs.realpathSync(path.join(reactModules, name)) + path.sep,
);
const otherReacts = ({ metafile }) =>
  Object.keys(metafile.inputs)
    .map((input) => path.resolve(input))
    .filter(
      (file) =>
        /[\\/]node_modules[\\/]react(-dom)?[\\/]/.test(file) &&
        !copies.some((copy) => file.startsWith(copy)),
    );

let browser;
let css;
let script;
let server;
// What each bundle holds of other copies of React
let strays;
before(async () => {
  const [page, serverBundle, compiled] = await Promise.all([
    build({
      ...bundling,
      entryPoints: [pageSource],
      format: "iife",
      globalName: "searchBarWiring",
    }),
    build({
      ...bundling,
      entryPoints: [serverSource],
      platform: "node",
      format: "esm",
      // React DOM's server build requires Node's own modules
      banner: {
        js: `import { createRequire } from "node:module";\nconst require = createRequire(${JSON.stringify(import.meta.url)});`,
      },
    }),
    compile(`${fullCssSources()}\n@source "${pageSource}";`),
  ]);
  css = compiled;
  strays = { page: otherReacts(page), server: otherReacts(serverBundle) };
  script = page.outputFiles[0].text.replaceAll("</script", "<\\/script");
  server = await import(
    `data:text/javascript;base64,${Buffer.from(serverBundle.outputFiles[0].text).toString("base64")}`
  );
  browser = await chromium.launch();
});
after(() => browser?.close());

// Renders the composition `name` to HTML in Node, as a server does, pushing
// anything React logs to `logged`
function serverHtml(name, logged) {
  const { error, warn } = console;
  console.error = console.warn = (...args) => logged.push(format(...args));
  try {
    return server.render(name);
  } finally {
    Object.assign(console, { error, warn });
  }
}

// Opens a page with the server HTML of the composition `name`, and runs `use`
// on it once React has hydrated it, with what the server and the page have
// logged so far as errors or warnings
async function withPage(name, use) {
  const logged = [];
  const html = serverHtml(name, logged);
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  try {
    const page = await context.newPage();
    page.on("pageerror", (error) => logged.push(error.message));
    page.on("console", (message) => {
      if (["error", "warning"].includes(message.type()))
        logged.push(message.text());
    });
    await page.setContent(
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>SearchBar</title><style>${css}</style></head><body class="bg-bg-white"><main><h1>SearchBar</h1><div id="root">${html}</div></main><script>${script}</script><script>searchBarWiring.hydrate(${JSON.stringify(name)})</script></body></html>`,
    );
    await page.waitForFunction(() => window.ready.length === 1);
    return await use(page, logged);
  } finally {
    await context.close();
  }
}

// Runs axe-core on the page: its version, and the rules it found violated
// and where
async function axe(page) {
  if (!(await page.evaluate(() => "axe" in window)))
    await page.addScriptTag({ content: axeSource });
  return page.evaluate(async () => {
    const { violations } = await window.axe.run(document);
    return {
      version: window.axe.version,
      violations: violations.map(({ id, nodes }) => ({
        id,
        targets: nodes.map(({ target }) => target.join(" ")),
      })),
    };
  });
}

// Runs in the page: whether each displayed listbox scrolls by more than the
// 13px axe allows before scrollable-region-focusable looks at it. That rule
// passes over a listbox only while a combobox's `aria-controls` names it.
const scrolling = () =>
  [...document.querySelectorAll('[role="listbox"]')]
    .filter((listbox) => listbox.checkVisibility())
    .map((listbox) => listbox.scrollHeight - listbox.clientHeight > 13);

// The violations of `rules` in `result`, and a diagnostic for any others
function violated({ violations }, t, where) {
  const others = violations.filter(({ id }) => !rules.includes(id));
  if (others.length)
    t.diagnostic(
      `${where}: other axe violations: ${others.map(({ id, targets }) => `${id} (${targets.join(", ")})`).join("; ")}`,
    );
  return violations.filter(({ id }) => rules.includes(id));
}

// Each composition's bars, and how each wires its input once hydrated
const wired = {
  "no panel": { search: { expanded: "false", controls: "nothing" } },
  "closed list": { search: { expanded: "false", controls: "listbox" } },
  "scrolling list": { search: { expanded: "true", controls: "listbox" } },
  "no results": { search: { expanded: "false", controls: "panel" } },
  "two bars": {
    header: { expanded: "true", controls: "listbox" },
    main: { expanded: "true", controls: "listbox" },
  },
  docs: { docs: { expanded: "false", controls: "panel" } },
};
const names = Object.keys(wired);

// `wired` with each bar's wiring replaced by `each`
const eachBar = (each) =>
  Object.fromEntries(
    names.map((name) => [
      name,
      Object.fromEntries(Object.keys(wired[name]).map((bar) => [bar, each])),
    ]),
  );

const loads = new Map();
// What the page shows for the composition `name`, read once: the React it
// runs, the wiring the server HTML had, how hydration went, the wiring and
// ids after it, whether each listbox scrolls, and axe's results
function load(name) {
  if (!loads.has(name))
    loads.set(
      name,
      withPage(name, async (page, logged) => {
        const read = await page.evaluate(() => ({
          version: window.searchBarWiring.version,
          server: window.serverWiring,
          recoverable: window.recoverableErrors,
          kept: window.serverNodes.every((node) => node.isConnected),
          wiring: window.searchBarWiring.wiring(),
          duplicates: window.searchBarWiring.duplicateIds(),
        }));
        return {
          ...read,
          scrolls: await page.evaluate(scrolling),
          axe: await axe(page),
          logged: [...logged],
        };
      }),
    );
  return loads.get(name);
}

// `read` for every composition, by name
const loadAll = async (read) =>
  Object.fromEntries(
    await Promise.all(
      names.map(async (name) => [name, read(await load(name))]),
    ),
  );

test(`the server and the browser run React ${reactVersion}, from ${reactModules}, and bundle no other copy`, async () => {
  assert.deepEqual(strays, { page: [], server: [] });
  assert.equal(server.version, reactVersion);
  assert.deepEqual(
    await loadAll(({ version }) => version),
    Object.fromEntries(names.map((name) => [name, reactVersion])),
  );
});

test("server HTML renders each input collapsed, naming nothing", async () => {
  assert.deepEqual(
    await loadAll(({ server }) => server),
    eachBar({ expanded: "false", controls: "nothing" }),
  );
});

test("hydration raises no recoverable error, logs nothing, and keeps the server's inputs, panels and listboxes", async () => {
  const clean = { recoverable: [], logged: [], kept: true };
  assert.deepEqual(
    await loadAll(({ recoverable, logged, kept }) => ({
      recoverable,
      logged,
      kept,
    })),
    Object.fromEntries(names.map((name) => [name, clean])),
  );
});

test("once hydrated, each input is expanded only while a listbox is displayed, and names its own bar's listbox, else its panel, else nothing", async () => {
  assert.deepEqual(await loadAll(({ wiring }) => wiring), wired);
});

test("no composition renders a duplicate id", async () => {
  assert.deepEqual(
    await loadAll(({ duplicates }) => duplicates),
    Object.fromEntries(names.map((name) => [name, []])),
  );
});

test(`axe-core 4.10.2 finds no ${rules.join(", ")} violation once hydrated`, async (t) => {
  const results = await loadAll(({ axe }) => axe);
  for (const result of Object.values(results))
    assert.equal(result.version, "4.10.2");
  assert.deepEqual(
    Object.fromEntries(
      names.map((name) => [name, violated(results[name], t, name)]),
    ),
    Object.fromEntries(names.map((name) => [name, []])),
  );
});

test("the open list scrolls in the docs' 400px, so scrollable-region-focusable would flag it if the input didn't name it", async () => {
  assert.deepEqual((await load("scrolling list")).scrolls, [true]);
});

test("in the docs' controlled composition, typing, ArrowDown and ArrowUp keep aria-activedescendant inside the element aria-controls names, and a query with no matches leaves the input collapsed with none", (t) =>
  withPage("docs", async (page, logged) => {
    // The docs bar's wiring, and where its `aria-activedescendant` points
    const state = () =>
      page.evaluate(() => ({
        ...window.searchBarWiring.wiring().docs,
        active: window.searchBarWiring.activeDescendant("docs"),
      }));
    await page.focus('[data-bar="docs"] input');

    // cmdk sets `aria-activedescendant` once its selection moves, so after
    // typing the input may have none
    await page.keyboard.type("a");
    const typed = await state();
    assert.deepEqual(
      { ...typed, active: typed.active === "none" ? "option" : typed.active },
      { expanded: "true", controls: "listbox", active: "option" },
      `after typing "a": ${JSON.stringify(typed)}`,
    );
    const walk = [];
    for (const key of ["ArrowDown", "ArrowDown", "ArrowDown", "ArrowUp"]) {
      await page.keyboard.press(key);
      walk.push([key, await state()]);
    }
    assert.deepEqual(
      walk,
      walk.map(([key]) => [
        key,
        { expanded: "true", controls: "listbox", active: "option" },
      ]),
    );
    assert.deepEqual(await page.evaluate(scrolling), [true]);
    const open = await axe(page);
    assert.equal(open.version, "4.10.2");
    assert.deepEqual(violated(open, t, 'after "a" and the arrow keys'), []);

    await page.keyboard.type("zz");
    assert.equal(
      await page.evaluate(
        () =>
          document.querySelector('[data-bar="docs"] [data-panel]').innerText,
      ),
      "No results found",
    );
    assert.deepEqual(await state(), {
      expanded: "false",
      controls: "panel",
      active: "none",
    });
    assert.deepEqual(violated(await axe(page), t, 'after "azz"'), []);
    assert.deepEqual(logged, []);
  }));
