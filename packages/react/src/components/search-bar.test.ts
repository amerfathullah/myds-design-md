// @vitest-environment happy-dom
import { act, createElement, type ReactElement } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

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
    { "data-bar": name } as object,
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
      { "data-bar": "header" } as object,
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
    const container = document.createElement("div");
    container.innerHTML = renderToString(page());
    document.body.append(container);
    try {
      expect(duplicateIds(container)).toEqual([]);
      for (const name of ["header", "main"]) {
        const { input, panel } = parts(container, name);
        expect(controlled(input)).toBe(panel);
      }
    } finally {
      container.remove();
    }
  });

  test("server HTML hydrates without a warning, and keeps its wiring", async () => {
    const tree = page();
    const container = document.createElement("div");
    container.innerHTML = renderToString(tree);
    document.body.append(container);
    // Each bar's wiring as the server rendered it. cmdk selects an item after
    // mounting, so the rest of the markup changes.
    const wiring = () =>
      ["header", "main"].map((name) => {
        const { input, panel } = parts(container, name);
        return [input.getAttribute("aria-controls"), panel.id];
      });
    const serverWiring = wiring();
    const recoverable: unknown[] = [];
    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(container, tree, {
        onRecoverableError: (error) => void recoverable.push(error),
      });
    });
    unmounts.push(async () => {
      await act(async () => root?.unmount());
      container.remove();
    });
    expect(recoverable).toEqual([]);
    expect(wiring()).toEqual(serverWiring);
    for (const name of ["header", "main"]) {
      const { input, panel } = parts(container, name);
      expect(controlled(input)).toBe(panel);
    }
  });

  test("an id on SearchBarResults hydrates without a warning, and the input follows it", async () => {
    const tree = page({ results: { id: "x" } });
    const container = document.createElement("div");
    container.innerHTML = renderToString(tree);
    document.body.append(container);
    const recoverable: unknown[] = [];
    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(container, tree, {
        onRecoverableError: (error) => void recoverable.push(error),
      });
    });
    unmounts.push(async () => {
      await act(async () => root?.unmount());
      container.remove();
    });
    expect(recoverable).toEqual([]);
    const { input, panel } = parts(container, "header");
    expect(panel.id).toBe("x");
    expect(input.getAttribute("aria-controls")).toBe("x");
  });
});
