import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { DataTable } from "./data-table";
import { Radio, RadioButton, RadioItem } from "./radio";

// The class attribute of every element in `html` that `match` picks
function classesOf(html: string, match: RegExp) {
  return [...html.matchAll(/<[a-z]+\s[^>]*>/g)]
    .map(([tag]) => tag)
    .filter((tag) => match.test(tag))
    .map((tag) => tag.match(/\sclass="([^"]*)"/)?.[1] ?? "");
}

// A DataTable with radio selection renders its native radio inputs with
// `checked` and an `onClick` but no `onChange`, so React warns about each one
// on the server. That warning is allowed here; any other fails the test.
const checkedWithoutOnChange =
  /You provided a `checked` prop to a form field without an `onChange` handler/;

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  const warnings = vi
    .mocked(console.error)
    .mock.calls.filter(([message]) => !checkedWithoutOnChange.test(message));
  vi.restoreAllMocks();
  expect(warnings).toEqual([]);
});

// A Tailwind 3 colour-opacity utility such as `ring-opacity-40` next to a
// ring colour makes tailwind-merge, inside `clx`, drop the colour, so these
// render the components as consumers get them, rather than reading the source
describe("the radio focus ring keeps its fr-primary colour", () => {
  test.each(["small", "medium", "large"] as const)(
    "RadioButton, size %s",
    (size) => {
      const html = renderToStaticMarkup(
        createElement(
          Radio,
          { size, defaultValue: "a" },
          createElement(
            RadioItem,
            null,
            createElement(RadioButton, { value: "a", id: "a" }),
          ),
        ),
      );
      const [button, ...others] = classesOf(html, /\srole="radio"/);
      expect(others).toEqual([]);
      expect(button?.split(" ")).toEqual(
        expect.arrayContaining([
          "focus-visible:ring-3",
          "focus-visible:ring-fr-primary",
        ]),
      );
    },
  );

  test("DataTable's radio-selection column", () => {
    const html = renderToStaticMarkup(
      createElement(DataTable<{ id: string; name: string }>, {
        columns: [{ id: "name", accessorKey: "name", header: "Name" }],
        data: [
          { id: "1", name: "Ali" },
          { id: "2", name: "Mei" },
        ],
        selection: { id_by: "id", mode: "radio" },
      }),
    );
    // The ring is on the wrapper around each row's radio input
    const wrappers = [
      ...html.matchAll(/<div\s[^>]*class="([^"]*)"[^>]*><input type="radio"/g),
    ].map(([, classes]) => classes);
    expect(wrappers).toHaveLength(2);
    for (const wrapper of wrappers)
      expect(wrapper?.split(" ")).toEqual(
        expect.arrayContaining([
          "has-[:focus-visible]:ring-3",
          "has-[:focus-visible]:ring-fr-primary",
        ]),
      );
  });
});

// Each component's source, without its comments, some of which keep code
// that no longer renders
const sources = readdirSync(__dirname)
  .filter((file) => file.endsWith(".tsx"))
  .map((file) => ({
    file,
    source: readFileSync(resolve(__dirname, file), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, ""),
  }));

// The classes in each source's strings, which match `pattern`, as
// "<file>: <class>"
function classesMatching(pattern: RegExp) {
  return sources.flatMap(({ file, source }) =>
    [...source.matchAll(/"([^"\n]*)"|`([^`]*)`/g)]
      .flatMap(([, string, template]) =>
        (string ?? template ?? "").split(/\s+/),
      )
      .filter((name) => pattern.test(name))
      .map((name) => `${file}: ${name}`),
  );
}

describe("the component sources", () => {
  test("use no Tailwind 3 colour-opacity utility", () => {
    expect(
      classesMatching(
        /(?:^|:)(?:bg|text|border|divide|ring|placeholder)-opacity-/,
      ),
    ).toEqual([]);
  });

  // A ring or outline is focus, so it takes an `fr-*` token
  test("colour every ring and outline with an fr-* token", () => {
    expect(
      classesMatching(
        /(?:^|:)(?:ring|outline)-(?!fr-|\d|\[|inset$|offset-|hidden$|none$|solid$|dashed$|dotted$|double$)/,
      ),
    ).toEqual([]);
  });
});
