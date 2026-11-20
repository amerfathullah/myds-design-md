// @vitest-environment happy-dom
import {
  act,
  createElement,
  useState,
  type ComponentProps,
  type ReactElement,
} from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { computeAccessibleName } from "dom-accessibility-api";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { Label } from "./label";
import {
  SearchBar,
  SearchBarInput,
  SearchBarInputContainer,
  SearchBarResults,
  SearchBarResultsItem,
  SearchBarResultsList,
} from "./search-bar";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const unmounts: (() => Promise<void>)[] = [];

// Mounts `element` in a container on the page, as an app would, and returns
// the container and a function that renders another element in its place
async function mount(element: ReactElement) {
  const container = document.body.appendChild(document.createElement("div"));
  const root = createRoot(container);
  unmounts.push(async () => {
    await act(async () => root.unmount());
    container.remove();
  });
  await act(async () => root.render(element));
  return {
    container,
    rerender: (next: ReactElement) => act(async () => root.render(next)),
  };
}

// Puts `tree`'s server-rendered HTML in a container on the page, as a server
// sends it, and returns the container
function serverRender(tree: ReactElement) {
  const container = document.body.appendChild(document.createElement("div"));
  container.innerHTML = renderToString(tree);
  unmounts.push(async () => container.remove());
  return container;
}

// Hydrates the server HTML in `container` with `tree`, as the browser does,
// and returns the errors React recovered from, such as a hydration mismatch
async function hydrate(container: HTMLElement, tree: ReactElement) {
  const recoverable: unknown[] = [];
  let root: ReturnType<typeof hydrateRoot> | undefined;
  await act(async () => {
    root = hydrateRoot(container, tree, {
      onRecoverableError: (error) => void recoverable.push(error),
    });
  });
  unmounts.push(async () => {
    await act(async () => root?.unmount());
  });
  return recoverable;
}

const consoleMethods = ["error", "warn", "log", "info"] as const;

beforeEach(() => {
  for (const method of consoleMethods)
    vi.spyOn(console, method).mockImplementation(() => {});
});

// No test logs anything, React's warnings and errors included, and nothing
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

type InputProps = Parameters<typeof SearchBarInput>[0];
type ResultsProps = Partial<Parameters<typeof SearchBarResults>[0]>;

// A SearchBar named `name`, with an input and an open results panel listing
// one result. It leaves out the search and clear buttons: their icons repeat
// ids of their own, which this file doesn't test.
const searchBar = (
  name: string,
  {
    input = {},
    results = {},
  }: { input?: InputProps; results?: ResultsProps } = {},
): ReactElement =>
  createElement(
    SearchBar,
    { "data-bar": name } as ComponentProps<typeof SearchBar>,
    createElement(
      SearchBarInputContainer,
      null,
      createElement(SearchBarInput, {
        placeholder: `Search ${name}`,
        value: name,
        onValueChange: () => {},
        ...input,
      }),
    ),
    createElement(
      SearchBarResults,
      { open: true, ...results },
      createElement(
        SearchBarResultsList,
        null,
        createElement(SearchBarResultsItem, { value: name }, name),
      ),
    ),
  );

// Two SearchBars on one page, as a header search beside a page search
const page = (
  header: Parameters<typeof searchBar>[1] = {},
  main: Parameters<typeof searchBar>[1] = {},
) =>
  createElement(
    "div",
    null,
    searchBar("header", header),
    searchBar("main", main),
  );

// The bar named `name` in `within`: its <input>, and its results panel, the
// SearchBarResults wrapper that holds cmdk's listbox
function parts(within: ParentNode, name: string) {
  const bar = within.querySelector<HTMLElement>(`[data-bar="${name}"]`);
  expect(bar).not.toBeNull();
  const inputs = bar!.querySelectorAll("input");
  expect(inputs).toHaveLength(1);
  const listbox = bar!.querySelector<HTMLElement>('[role="listbox"]');
  expect(listbox).not.toBeNull();
  const panel = listbox!.parentElement!;
  expect(panel.parentElement).toBe(bar);
  return { input: inputs[0]!, panel, listbox: listbox! };
}

// Every id in `within` that more than one element has
function duplicateIds(within: ParentNode) {
  const ids = [...within.querySelectorAll("[id]")].map(({ id }) => id);
  return [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
}

// The element an input's `aria-controls` names, as assistive technology
// finds it: by id, anywhere in the document
const controlled = (input: HTMLInputElement) =>
  document.getElementById(input.getAttribute("aria-controls") ?? "");

describe("two SearchBars on one page", () => {
  test("render no duplicate ids", async () => {
    const { container } = await mount(page());
    expect(duplicateIds(container)).toEqual([]);
  });

  test("each input controls its own SearchBar's results panel", async () => {
    const { container } = await mount(page());
    for (const name of ["header", "main"]) {
      const { input, panel } = parts(container, name);
      expect(input.getAttribute("aria-controls")).toBeTruthy();
      expect(controlled(input)).toBe(panel);
    }
  });

  test("each input controls its panel while the panel is closed", async () => {
    const { container } = await mount(
      page({ results: { open: false } }, { results: { open: false } }),
    );
    for (const name of ["header", "main"]) {
      const { input, panel } = parts(container, name);
      expect(panel.classList.contains("hidden")).toBe(true);
      expect(controlled(input)).toBe(panel);
    }
  });
});

describe("an id on SearchBarResults", () => {
  test("is rendered, and that bar's input controls it", async () => {
    const { container } = await mount(page({ results: { id: "x" } }));
    const header = parts(container, "header");
    expect(header.panel.id).toBe("x");
    expect(header.input.getAttribute("aria-controls")).toBe("x");
    // The other bar keeps its own wiring
    const main = parts(container, "main");
    expect(main.panel.id).not.toBe("x");
    expect(controlled(main.input)).toBe(main.panel);
    expect(duplicateIds(container)).toEqual([]);
  });

  test("can be added, changed and removed across renders", async () => {
    const { container, rerender } = await mount(page());
    const generated = parts(container, "header").panel.id;
    expect(generated).toBeTruthy();

    for (const id of ["x", "y", undefined, "x", undefined]) {
      await rerender(page({ results: { id } }));
      const { input, panel } = parts(container, "header");
      expect(panel.id).toBe(id ?? generated);
      expect(input.getAttribute("aria-controls")).toBe(id ?? generated);
      expect(controlled(input)).toBe(panel);
      const main = parts(container, "main");
      expect(controlled(main.input)).toBe(main.panel);
    }
  });

  test("is let go when the results panel unmounts", async () => {
    const withoutResults = createElement(
      SearchBar,
      { "data-bar": "header" } as ComponentProps<typeof SearchBar>,
      createElement(SearchBarInput, { value: "", onValueChange: () => {} }),
    );
    const { container, rerender } = await mount(
      createElement("div", null, searchBar("header", { results: { id: "x" } })),
    );
    expect(
      container.querySelector("input")!.getAttribute("aria-controls"),
    ).toBe("x");
    await rerender(createElement("div", null, withoutResults));
    expect(
      container.querySelector("input")!.getAttribute("aria-controls"),
    ).not.toBe("x");
  });
});

describe("an aria-controls on SearchBarInput", () => {
  test("is rendered on the <input>", async () => {
    const { container } = await mount(
      page({ input: { "aria-controls": "y" } }),
    );
    expect(parts(container, "header").input.getAttribute("aria-controls")).toBe(
      "y",
    );
  });

  test("wins over an id on SearchBarResults", async () => {
    const { container } = await mount(
      page({ input: { "aria-controls": "y" }, results: { id: "x" } }),
    );
    const { input, panel } = parts(container, "header");
    expect(input.getAttribute("aria-controls")).toBe("y");
    expect(panel.id).toBe("x");
  });
});

describe("the input", () => {
  test("controls the results panel, not cmdk's listbox", async () => {
    const { container } = await mount(page());
    const { input, panel, listbox } = parts(container, "header");
    expect(input.getAttribute("role")).toBe("combobox");
    expect(controlled(input)).toBe(panel);
    expect(controlled(input)).not.toBe(listbox);
  });
});

describe("server rendering", () => {
  test("wires each input to its own panel in the server HTML", () => {
    const container = serverRender(page());
    expect(duplicateIds(container)).toEqual([]);
    for (const name of ["header", "main"]) {
      const { input, panel } = parts(container, name);
      expect(controlled(input)).toBe(panel);
    }
  });

  test("server HTML hydrates without a warning, and keeps its wiring", async () => {
    const tree = page();
    const container = serverRender(tree);
    // Each bar's wiring as the server rendered it. cmdk selects an item after
    // mounting, so the rest of the markup changes.
    const wiring = () =>
      ["header", "main"].map((name) => {
        const { input, panel } = parts(container, name);
        return [input.getAttribute("aria-controls"), panel.id];
      });
    const serverWiring = wiring();
    expect(await hydrate(container, tree)).toEqual([]);
    expect(wiring()).toEqual(serverWiring);
    for (const name of ["header", "main"]) {
      const { input, panel } = parts(container, name);
      expect(controlled(input)).toBe(panel);
    }
  });

  test("an id on SearchBarResults hydrates without a warning, and the input follows it", async () => {
    const tree = page({ results: { id: "x" } });
    const container = serverRender(tree);
    expect(await hydrate(container, tree)).toEqual([]);
    const { input, panel } = parts(container, "header");
    expect(panel.id).toBe("x");
    expect(input.getAttribute("aria-controls")).toBe("x");
  });
});

// The people the docs' search lists. "tu" matches every one.
const people = ["Tunku Abdul Rahman", "Tun Abdul Razak", "Tun Hussein Onn"];

// A SearchBar composed as the docs compose it: its results list is mounted
// only while there's a query. Its input takes `input`, and choosing a result
// calls `onSelect` with that result's name.
function DocsSearch({
  input = {},
  onSelect = () => {},
}: {
  input?: InputProps;
  onSelect?: (name: string) => void;
}) {
  const [query, setQuery] = useState("");
  const hasQuery = query.length > 0;
  return createElement(
    SearchBar,
    null,
    createElement(
      SearchBarInputContainer,
      null,
      createElement(SearchBarInput, {
        placeholder: "Search by name",
        value: query,
        onValueChange: setQuery,
        ...input,
      }),
    ),
    createElement(
      SearchBarResults,
      { open: hasQuery },
      hasQuery &&
        createElement(
          SearchBarResultsList,
          null,
          people.map((name) =>
            createElement(
              SearchBarResultsItem,
              { key: name, value: name, onSelect: () => onSelect(name) },
              name,
            ),
          ),
        ),
    ),
  );
}

// Types `text` into `input` a character at a time, as a user does
async function type(input: HTMLInputElement, text: string) {
  const setValue = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )!.set!;
  for (const character of text)
    await act(async () => {
      setValue.call(input, input.value + character);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
}

// Presses `key` on whatever has focus
const press = (key: string) =>
  act(async () => {
    document.activeElement!.dispatchEvent(
      new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
    );
  });

// The text of the result cmdk has selected, if any
const selected = (within: ParentNode) =>
  within.querySelector('[cmdk-item][aria-selected="true"]')?.textContent;

// cmdk finds its <input> by the id it generates, so an author's `id` never
// reaches it: with one there, cmdk would move focus to the listbox whenever
// its selection changed, and typing would stop reaching the input (#178)
describe("an id on SearchBarInput", () => {
  test("doesn't reach the <input>, which keeps cmdk's, the `for` of cmdk's hidden label", async () => {
    const { container } = await mount(
      createElement(DocsSearch, { input: { id: "q" } }),
    );
    const input = container.querySelector("input")!;
    const label = container.querySelector("label[cmdk-label]")!;
    expect(input.id).not.toBe("q");
    expect(input.id).toBeTruthy();
    expect(label.getAttribute("for")).toBe(input.id);
  });

  test("leaves focus on the <input> while typing mounts the results", async () => {
    const { container } = await mount(
      createElement(DocsSearch, { input: { id: "q" } }),
    );
    const input = container.querySelector("input")!;
    await act(async () => input.focus());
    await type(input, "tu");
    expect(document.activeElement).toBe(input);
    expect(input.value).toBe("tu");
  });

  test("leaves ArrowDown, ArrowUp and Enter choosing results", async () => {
    const chosen: string[] = [];
    const { container } = await mount(
      createElement(DocsSearch, {
        input: { id: "q" },
        onSelect: (name) => void chosen.push(name),
      }),
    );
    const input = container.querySelector("input")!;
    await act(async () => input.focus());
    await type(input, "tu");
    const walk: (string | null | undefined)[] = [];
    for (const key of ["ArrowDown", "ArrowDown", "ArrowUp"]) {
      await press(key);
      walk.push(selected(container));
    }
    expect(walk).toEqual([people[0], people[1], people[0]]);
    expect(document.activeElement).toBe(input);
    await press("Enter");
    expect(chosen).toEqual([people[0]]);
  });
});

// SearchBarInput always renders its own <input> through cmdk's `asChild`,
// which is how its `aria-controls` and name beat cmdk's (#206)
describe("an untyped asChild={false} on SearchBarInput", () => {
  test("still renders the one <input>, named by its `aria-label`", async () => {
    const { container } = await mount(
      createElement(
        SearchBar,
        null,
        createElement(SearchBarInput, {
          "aria-label": "Cari nama",
          asChild: false,
        } as InputProps),
      ),
    );
    const inputs = container.querySelectorAll("input[cmdk-input]");
    expect(inputs).toHaveLength(1);
    expect(computeAccessibleName(inputs[0]!)).toBe("Cari nama");
  });
});

describe("server rendering an input's name", () => {
  // Each way the docs name the input: its `aria-label`, a Label's `id` its
  // `aria-labelledby` points at, and SearchBar's `label`
  const named = (bar: { label?: string }, input: InputProps) =>
    createElement(
      "div",
      null,
      createElement(Label, { id: "nama" }, "Cari nama"),
      createElement(
        SearchBar,
        bar,
        createElement(SearchBarInput, {
          placeholder: "Search by name",
          ...input,
        }),
      ),
    );
  const ways: [string, ReactElement][] = [
    ["its `aria-label`", named({}, { "aria-label": "Cari nama" })],
    ["a Label's `id`", named({}, { "aria-labelledby": "nama" })],
    ["SearchBar's `label`", named({ label: "Cari nama" }, {})],
  ];

  test.each(ways)("names it by %s in the server HTML", (_, tree) => {
    const container = serverRender(tree);
    const input = container.querySelector("input")!;
    expect(computeAccessibleName(input)).toBe("Cari nama");
  });

  test.each(ways)(
    "hydrates without a warning when it's named by %s",
    async (_, tree) => {
      const container = serverRender(tree);
      expect(await hydrate(container, tree)).toEqual([]);
      const input = container.querySelector("input")!;
      expect(computeAccessibleName(input)).toBe("Cari nama");
    },
  );
});
