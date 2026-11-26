// @vitest-environment happy-dom
//
// The Radio examples compose RadioHintText as the library wires it (#173).
// None passes the hint `htmlFor`, which made it a second label of its radio,
// so its text was read as part of the radio's name. And none repeats an id
// within what one page renders. Each Radio develop page (EN/MS) shows six
// groups, and the Radio stories share one autodocs page: with the same ids
// in each, every label pointed at the first group's radio, which took all
// their names, and left the other groups' radios with none. This reads the
// pages and the story statically, as `toast.dist.test.ts` does, and renders
// what each page shows against the library's source.
/// <reference types="node" />
import { readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { runInThisContext } from "node:vm";
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { act, createElement, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import {
  computeAccessibleDescription,
  computeAccessibleName,
} from "dom-accessibility-api";
import ts from "typescript";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { codeBlocks, commentText, metaComment } from "./docs-samples";
import * as radio from "./radio";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const repo = resolve(__dirname, "../../../..");
const pagesDir = resolve(repo, "apps/docs/content/docs/develop/(components)");
const pages = {
  en: resolve(pagesDir, "radio.mdx"),
  ms: resolve(pagesDir, "radio.ms.mdx"),
} as const;
const previewsFile = resolve(pagesDir, "radio.client.tsx");
const storyFile = resolve(repo, "apps/storybook/stories/radio.stories.tsx");
const storyUtilsFile = resolve(repo, "apps/storybook/utils/index.ts");

const read = (file: string) => readFileSync(file, "utf8");
const label = (file: string) => relative(repo, file);

/*========================================================================================================================*/
// Reading the files

// The Radio story's doc comment, the JSDoc on `meta`, as the reader sees it
const storyComment = () => commentText(metaComment(read(storyFile)));

// Every code sample a reader copies, by where it is
function samples() {
  const named: Record<string, string> = {};
  for (const [page, file] of Object.entries(pages))
    for (const block of codeBlocks(read(file)))
      named[`${page} line ${block.line}`] = block.code;
  codeBlocks(storyComment()).forEach((block, index) => {
    named[`story block ${index + 1}`] = block.code;
  });
  return named;
}

// The value of each `name="…"` attribute in `code`
const attributes = (code: string, name: string) =>
  [...code.matchAll(new RegExp(`\\b${name}="([^"]*)"`, "g"))].map(
    ([, value]) => value!,
  );

// The values that appear more than once in `values`
const repeated = (values: readonly string[]) => [
  ...new Set(values.filter((value, index) => values.indexOf(value) !== index)),
];

/*========================================================================================================================*/
// Rendering the files

// Compiles `file`, a TSX module, and runs it as CommonJS, with each module it
// imports taken from `modules`. The docs app and Storybook resolve their
// imports with aliases this package's tests don't have, so they're given the
// library's source here instead.
function load(
  file: string,
  modules: Record<string, unknown>,
): Record<string, unknown> {
  const { outputText } = ts.transpileModule(read(file), {
    fileName: file,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  });
  const module = { exports: {} as Record<string, unknown> };
  const require = (specifier: string) => {
    if (!(specifier in modules))
      throw new Error(`${label(file)} imports ${specifier}, not given here`);
    return modules[specifier];
  };
  const run = runInThisContext(
    `(function (require, module, exports) {${outputText}\n})`,
    { filename: file },
  ) as (...args: unknown[]) => void;
  run(require, module, module.exports);
  return module.exports;
}

const react = { react: React, "react/jsx-runtime": jsxRuntime };

const previews = () =>
  load(previewsFile, { ...react, "@/components/myds": radio });

type Meta = {
  args?: Record<string, unknown>;
  render: (args: Record<string, unknown>, context: unknown) => ReactElement;
};
type Story = { args?: Record<string, unknown>; render?: Meta["render"] };

const stories = () => {
  const loaded = load(storyFile, {
    ...react,
    "@amerfathullah/myds-react/radio": radio,
    "../utils": load(storyUtilsFile, {}),
  });
  const { default: meta, ...named } = loaded as { default: Meta } & Record<
    string,
    Story
  >;
  return { meta, named };
};

// What a page's Preview tabs render, in order: each element in each tab, as
// [component, props], `<hr />` aside
function previewsOn(page: keyof typeof pages) {
  const tabs = [
    ...read(pages[page]).matchAll(
      /<Tab value="Preview"[^>]*>([\s\S]*?)<\/Tab>/g,
    ),
  ];
  expect(tabs.length, `${page} has no Preview tab`).toBeGreaterThan(0);
  return tabs.flatMap(([, content]) => {
    const elements = [...content!.matchAll(/<(\w+)((?:\s+[^/>]+)*)\s*\/>/g)]
      .filter(([, tag]) => tag !== "hr")
      .map(([, tag, rest]) => {
        const props: Record<string, string | boolean> = {};
        for (const [, prop, value] of rest!.matchAll(/(\w+)(?:="([^"]*)")?/g))
          props[prop!] = value ?? true;
        return [tag!, props] as const;
      });
    // Every element is one this test reads, so nothing it can't render is
    // passed over
    expect(content!.replace(/<(\w+)[^>]*\/>/g, "").trim()).toBe("");
    expect(elements.length).toBeGreaterThan(0);
    return elements;
  });
}

const unmounts: (() => Promise<void>)[] = [];

// Mounts `element` in a container on the page and returns the container
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

const consoleMethods = ["error", "warn", "log", "info"] as const;

beforeEach(() => {
  for (const method of consoleMethods)
    vi.spyOn(console, method).mockImplementation(() => {});
});

// Nothing logs anything, React's warnings and errors included, and nothing
// is left on the page
afterEach(async () => {
  while (unmounts.length) await unmounts.pop()!();
  const logged = consoleMethods.flatMap((method) =>
    vi.mocked(console[method]).mock.calls.map((call) => [method, ...call]),
  );
  vi.restoreAllMocks();
  expect(logged).toEqual([]);
  expect(document.body.innerHTML).toBe("");
});

// What one page renders repeats no id. Each label points at the radio in its
// own RadioItem, which its text alone names. Each radio is described by the
// other text in its item, its hints, or by nothing when it has none.
function expectWired(container: HTMLElement) {
  const ids = [...container.querySelectorAll("[id]")].map(({ id }) => id);
  expect(repeated(ids)).toEqual([]);

  const radios = [
    ...container.querySelectorAll<HTMLButtonElement>('[role="radio"]'),
  ];
  expect(radios.length).toBeGreaterThan(0);
  for (const radio of radios) {
    const item = radio.parentElement!;
    const labels = [...item.querySelectorAll("label")];
    expect(labels).toHaveLength(1);
    const [label] = labels;
    expect(document.getElementById(label!.htmlFor)).toBe(radio);
    expect(computeAccessibleName(radio)).toBe(label!.textContent);
    const others = item.cloneNode(true) as HTMLElement;
    others.querySelector("label")!.remove();
    const hint = others.textContent!.replace(/\s+/g, " ").trim();
    expect(computeAccessibleDescription(radio)).toBe(hint);
    if (!hint) expect(radio.hasAttribute("aria-describedby")).toBe(false);
  }
}

/*========================================================================================================================*/

describe.each([
  ["the English develop page", pages.en],
  ["the Malay develop page", pages.ms],
  ["the previews", previewsFile],
  ["the story", storyFile],
])("%s", (_, file) => {
  test("passes RadioHintText no `htmlFor`", () => {
    const text = read(file);
    expect(text).toMatch(/<RadioHintText\b/);
    expect(text.match(/<RadioHintText\b[^>]*\bhtmlFor\b[^>]*>/g)).toBeNull();
  });

  test("names no RadioHelpText, which doesn't exist", () => {
    expect(read(file)).not.toMatch(/RadioHelpText/);
  });
});

describe("each code sample", () => {
  test("is there: seven on each page and one in the story", () => {
    const named = Object.keys(samples());
    expect(named.filter((name) => name.startsWith("en"))).toHaveLength(7);
    expect(named.filter((name) => name.startsWith("ms"))).toHaveLength(7);
    expect(named.filter((name) => name.startsWith("story"))).toHaveLength(1);
  });

  test("repeats no id, and points each `htmlFor` at an id it renders", () => {
    for (const [name, code] of Object.entries(samples())) {
      const ids = attributes(code, "id");
      expect(repeated(ids), name).toEqual([]);
      for (const htmlFor of attributes(code, "htmlFor"))
        expect(ids, `${name}: htmlFor="${htmlFor}"`).toContain(htmlFor);
    }
  });
});

describe.each(["en", "ms"] as const)("the %s develop page", (page) => {
  test("renders six groups, as many as its Preview tabs show", () => {
    expect(previewsOn(page)).toEqual([
      ["RadioExample", {}],
      ["RadioSimpleExample", { size: "small" }],
      ["RadioSimpleExample", { size: "medium" }],
      ["RadioSimpleExample", { size: "large" }],
      ["RadioExample", { disabled: true }],
      ["RadioExample", {}],
    ]);
  });

  test("repeats no id, and names and describes each radio by its own item", async () => {
    const exports = previews();
    const elements = previewsOn(page).map(([tag, props], index) => {
      const component = exports[tag];
      expect(typeof component, `radio.client.tsx exports no ${tag}`).toBe(
        "function",
      );
      return createElement(component as () => ReactElement, {
        key: index,
        ...props,
      });
    });
    const container = await mount(createElement("div", null, ...elements));
    expect(container.querySelectorAll('[role="radiogroup"]')).toHaveLength(6);
    expectWired(container);
  });
});

describe("the Radio stories", () => {
  test("repeat no id on their autodocs page, and name and describe each radio by its own item", async () => {
    const { meta, named } = stories();
    const entries = Object.entries(named);
    expect(entries.map(([name]) => name)).toEqual([
      "Light",
      "Disabled",
      "Dark",
      "DisabledDark",
      "DisabledFieldset",
      "DisabledFieldsetDark",
    ]);
    // Each story as autodocs renders it, all on one page
    const elements = entries.map(([name, story]) => {
      const render = story.render ?? meta.render;
      const args = { ...meta.args, ...story.args };
      return createElement(
        function Story() {
          return render(args, { name });
        },
        { key: name },
      );
    });
    const container = await mount(createElement("div", null, ...elements));
    expect(container.querySelectorAll('[role="radiogroup"]')).toHaveLength(6);
    expectWired(container);
  });
});
