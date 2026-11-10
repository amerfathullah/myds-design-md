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
    [...source.matchAll(/"([^"\n]*)"|'([^'\n]*)'|`([^`]*)`/g)]
      .flatMap(([, double, single, template]) =>
        (double ?? single ?? template ?? "").split(/\s+/),
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

  // A ring or outline is focus, so it takes an `fr-*` token. Anything else
  // after `ring-` or `outline-` is a colour, an offset's included, except a
  // width, a pixel width in brackets, an offset, `inset` and the outline
  // styles.
  test("colour every ring and outline with an fr-* token", () => {
    expect(
      classesMatching(
        /(?:^|:)(?:ring|outline)-(?!fr-|\d|\[\d+(?:\.\d+)?px\]|offset-\d|inset$|hidden$|none$|solid$|dashed$|dotted$|double$)/,
      ),
    ).toEqual([]);
  });

  // `outline-hidden` hides the browser's outline, and under forced colours,
  // which drop every ring, draws a 2px outline instead. So it goes only on an
  // element that can take focus, behind the variant its ring is on: a bare
  // one draws that outline at rest too, and on an element that never takes
  // focus it draws a stray box (#159). Tailwind 4's `outline-none` draws
  // nothing under forced colours, so it's never bare either. The one bare
  // class allowed is the active InputOTP slot's, in its active state,
  // which holds only while the input has focus.
  test("tie every outline-hidden and outline-none to focus", () => {
    expect(
      classesMatching(/(?:^|:)!?outline-(?:hidden|none)!?$/).filter(
        (entry) =>
          !variantsOf(entry.slice(entry.indexOf(": ") + 2)).some(isFocus),
      ),
    ).toEqual(["input-otp.tsx: outline-hidden"]);
  });
});

// A class's variants: the parts before its last `:` outside brackets, so
// `has-[>h3>button:focus-visible]:outline-hidden` has one
function variantsOf(name: string) {
  const variants = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < name.length; i++) {
    if ("[(".includes(name[i]!)) depth++;
    else if ("])".includes(name[i]!)) depth--;
    else if (name[i] === ":" && depth === 0) {
      variants.push(name.slice(start, i));
      start = i + 1;
    }
  }
  return variants;
}

// Whether a variant applies only while an element has focus: the element's
// own (`focus:`, `focus-visible:`), a peer's whose outline it draws
// (`peer-focus:`, `peer-focus-visible:`), or a descendant's that a `has-[…]`
// selector matches with `:focus` or `:focus-visible`
const isFocus = (variant: string) =>
  /^(?:peer-)?focus(?:-visible)?$/.test(variant) ||
  /^has-\[.*:focus(?:-visible)?(?![\w-]).*\]$/.test(variant);
