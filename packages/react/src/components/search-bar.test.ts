// @vitest-environment happy-dom
import {
  act,
  createElement,
  Fragment,
  Profiler,
  StrictMode,
  Suspense,
  useId,
  useLayoutEffect,
  useMemo,
  useState,
  type ComponentProps,
  type Dispatch,
  type ReactElement,
  type ReactNode,
  type SetStateAction,
} from "react";
import { createRoot, hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { Command } from "cmdk";
import { computeAccessibleName } from "dom-accessibility-api";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { sharedContext } from "../utils/registry";
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

// Lets the tasks React's scheduler queued outside act() run: renders,
// passive effects, and the updates those schedule
const settle = async () => {
  for (let i = 0; i < 5; i++) await new Promise((done) => setTimeout(done, 0));
};

// Calls `onCommit` from a layout effect each time it's rendered
function Probe({ onCommit }: { onCommit: () => void }) {
  useLayoutEffect(onCommit);
  return null;
}

// Where the server renders the probe, so ids from useId() match
const ServerProbe = () => null;

// `element`, followed by `probe`
const probed = (element: ReactElement, probe: ReactElement) =>
  createElement(Fragment, null, element, probe);

// Renders outside act(), as the browser runs React, and reads the page
// before the browser could paint. `paint(element, read)` renders `element`
// and returns what `read` reads in a microtask queued from the commit's
// layout effects. That's after the updates layout effects schedule, which
// React renders before it gives the browser back, and before passive effects
// run. Given `server`, the container starts with its server HTML, and the
// first `paint` hydrates it.
async function painted({ server }: { server?: ReactElement } = {}) {
  const container = document.body.appendChild(document.createElement("div"));
  if (server)
    container.innerHTML = renderToString(
      probed(server, createElement(ServerProbe)),
    );
  globalThis.IS_REACT_ACT_ENVIRONMENT = false;
  let root: Root | undefined;
  const recoverable: unknown[] = [];
  let onCommit = () => {};
  const tree = (element: ReactElement) =>
    probed(element, createElement(Probe, { onCommit: () => onCommit() }));
  unmounts.push(async () => {
    root?.unmount();
    await settle();
    container.remove();
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  });
  const paint = <T>(element: ReactElement, read: () => T) =>
    new Promise<T>((resolve) => {
      onCommit = () => {
        onCommit = () => {};
        queueMicrotask(() => resolve(read()));
      };
      if (root) root.render(tree(element));
      else if (server)
        root = hydrateRoot(container, tree(element), {
          onRecoverableError: (error) => void recoverable.push(error),
        });
      else (root = createRoot(container)).render(tree(element));
    }).then(async (read) => {
      await settle();
      return read;
    });
  return { container, recoverable, paint };
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

// The results parts a SearchBar holds. `results` is SearchBarResults' props,
// open unless they say otherwise, or null for no SearchBarResults. `list`
// mounts a SearchBarResultsList: in the panel, or in its place when there's
// none.
type Holding = { results?: ResultsProps | null; list?: boolean };

// SearchBarResults' props, with the `data-panel` that `parts` finds it by
const panel = (props: ResultsProps & { open: boolean }) =>
  ({ "data-panel": "", ...props }) as ResultsProps & { open: boolean };

// A SearchBar named `name`, with an input taking `input`, and the results
// parts `parts` asks for. The list holds one result. It leaves out the
// search and clear buttons: their icons repeat ids of their own, which this
// file doesn't test.
const searchBar = (
  name: string,
  {
    input = {},
    results = {},
    list = true,
    withInput = true,
  }: Holding & { input?: InputProps; withInput?: boolean } = {},
): ReactElement => {
  const resultsList =
    list &&
    createElement(
      SearchBarResultsList,
      null,
      createElement(SearchBarResultsItem, { value: name }, name),
    );
  return createElement(
    SearchBar,
    { "data-bar": name } as ComponentProps<typeof SearchBar>,
    createElement(
      SearchBarInputContainer,
      null,
      withInput &&
        createElement(SearchBarInput, {
          placeholder: `Search ${name}`,
          value: name,
          onValueChange: () => {},
          ...input,
        }),
    ),
    results === null
      ? resultsList
      : createElement(
          SearchBarResults,
          panel({ open: true, ...results }),
          resultsList,
        ),
  );
};

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

// The bar named `name` in `within`: its <input>, its results panel if it has
// one, and cmdk's listbox if it has one
function parts(within: ParentNode, name: string) {
  const bar = within.querySelector<HTMLElement>(`[data-bar="${name}"]`);
  expect(bar).not.toBeNull();
  const inputs = bar!.querySelectorAll("input");
  expect(inputs).toHaveLength(1);
  const panel = bar!.querySelector<HTMLElement>("[data-panel]");
  if (panel) expect(panel.parentElement).toBe(bar);
  const listbox = bar!.querySelector<HTMLElement>('[role="listbox"]');
  return { bar: bar!, input: inputs[0]!, panel, listbox };
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

// How the bar named `name` wires its input: its `aria-expanded`, and what
// its `aria-controls` names. That's "nothing" when it has none, "panel" or
// "listbox" when it names that bar's panel or listbox, else `#` and the id.
function wiring(within: ParentNode, name: string) {
  const { input, panel, listbox } = parts(within, name);
  const id = input.getAttribute("aria-controls");
  const target = controlled(input);
  return {
    expanded: input.getAttribute("aria-expanded"),
    controls:
      id === null
        ? "nothing"
        : target && target === panel
          ? "panel"
          : target && target === listbox
            ? "listbox"
            : `#${id}`,
  };
}

type Wiring = ReturnType<typeof wiring>;

// Each state in #204's table: the results parts a SearchBar holds, and how
// its input is wired when the author passes no `aria-controls` or
// `aria-expanded`
const states: (Holding & { state: string; wired: Wiring })[] = [
  {
    state: "nothing",
    results: null,
    list: false,
    wired: { expanded: "false", controls: "nothing" },
  },
  {
    state: "a closed panel",
    results: { open: false },
    list: false,
    wired: { expanded: "false", controls: "panel" },
  },
  {
    state: "an open panel",
    results: { open: true },
    list: false,
    wired: { expanded: "false", controls: "panel" },
  },
  {
    state: "a closed panel with a list",
    results: { open: false },
    list: true,
    wired: { expanded: "false", controls: "listbox" },
  },
  {
    state: "an open panel with a list",
    results: { open: true },
    list: true,
    wired: { expanded: "true", controls: "listbox" },
  },
  {
    state: "a list with no panel",
    results: null,
    list: true,
    wired: { expanded: "true", controls: "listbox" },
  },
];

// What an author passes SearchBarInput, and how that changes the wiring
const authors: [string, InputProps, (wired: Wiring) => Wiring][] = [
  ["nothing", {}, (wired) => wired],
  [
    "an `aria-controls`",
    { "aria-controls": "elsewhere" },
    (wired) => ({ ...wired, controls: "#elsewhere" }),
  ],
  [
    "`aria-expanded={true}`",
    { "aria-expanded": true },
    (wired) => ({ ...wired, expanded: "true" }),
  ],
  [
    "`aria-expanded={false}`",
    { "aria-expanded": false },
    (wired) => ({ ...wired, expanded: "false" }),
  ],
];

describe.each(authors)("with %s on SearchBarInput", (_, input, expected) => {
  test.each(states)(
    "the input holding $state is wired before paint",
    async ({ results, list, wired }) => {
      const { container, paint } = await painted();
      const read = () => wiring(container, "bar");
      expect(
        await paint(searchBar("bar", { input, results, list }), read),
      ).toEqual(expected(wired));
      // and stays so
      expect(read()).toEqual(expected(wired));
    },
  );

  test.each(states)(
    "the server HTML holding $state is collapsed, with no generated aria-controls",
    ({ results, list }) => {
      const container = serverRender(
        searchBar("bar", { input, results, list }),
      );
      expect(wiring(container, "bar")).toEqual(
        expected({ expanded: "false", controls: "nothing" }),
      );
    },
  );

  test.each(states)(
    "the server HTML holding $state hydrates without a warning, and is wired before paint",
    async ({ results, list, wired }) => {
      const tree = searchBar("bar", { input, results, list });
      const { container, recoverable, paint } = await painted({
        server: tree,
      });
      const read = () => wiring(container, "bar");
      expect(await paint(tree, read)).toEqual(expected(wired));
      expect(read()).toEqual(expected(wired));
      expect(recoverable).toEqual([]);
    },
  );
});

describe("moving between states", () => {
  const pairs = states.flatMap((from) =>
    states
      .filter((to) => to !== from)
      .map((to) => ({ from: from.state, to: to.state, start: from, end: to })),
  );

  test.each(pairs)(
    "from $from to $to rewires the input before paint",
    async ({ start, end }) => {
      const { container, paint } = await painted();
      const read = () => wiring(container, "bar");
      expect(await paint(searchBar("bar", start), read)).toEqual(start.wired);
      expect(await paint(searchBar("bar", end), read)).toEqual(end.wired);
      expect(read()).toEqual(end.wired);
    },
  );

  // StrictMode mounts each part's effects twice, so a part counted twice
  // would leave the input wired to it once it's gone
  test.each(pairs)(
    "from $from to $to under StrictMode counts each part once",
    async ({ start, end }) => {
      const { container, paint } = await painted();
      const read = () => wiring(container, "bar");
      const strict = (element: ReactElement) =>
        createElement(StrictMode, null, element);
      expect(await paint(strict(searchBar("bar", start)), read)).toEqual(
        start.wired,
      );
      expect(read()).toEqual(start.wired);
      expect(await paint(strict(searchBar("bar", end)), read)).toEqual(
        end.wired,
      );
      expect(read()).toEqual(end.wired);
    },
  );

  test.each(states)(
    "an input mounted after the bar holds $state is wired before paint",
    async ({ results, list, wired }) => {
      const { container, paint } = await painted();
      const read = () => wiring(container, "bar");
      await paint(
        searchBar("bar", { results, list, withInput: false }),
        () => {},
      );
      expect(await paint(searchBar("bar", { results, list }), read)).toEqual(
        wired,
      );
    },
  );

  test("each step of a list mounting and unmounting in an opening panel", async () => {
    const { container, paint } = await painted();
    const read = () => wiring(container, "bar");
    const steps: [Holding, Wiring][] = [
      [
        { results: null, list: false },
        { expanded: "false", controls: "nothing" },
      ],
      [
        { results: { open: false }, list: false },
        { expanded: "false", controls: "panel" },
      ],
      [
        { results: { open: false }, list: true },
        { expanded: "false", controls: "listbox" },
      ],
      [
        { results: { open: true }, list: true },
        { expanded: "true", controls: "listbox" },
      ],
      [
        { results: { open: true }, list: false },
        { expanded: "false", controls: "panel" },
      ],
      [
        { results: { open: true }, list: true },
        { expanded: "true", controls: "listbox" },
      ],
      [
        { results: null, list: true },
        { expanded: "true", controls: "listbox" },
      ],
      [
        { results: { open: false }, list: true },
        { expanded: "false", controls: "listbox" },
      ],
      [
        { results: null, list: false },
        { expanded: "false", controls: "nothing" },
      ],
    ];
    for (const [step, wired] of steps)
      expect(await paint(searchBar("bar", step), read)).toEqual(wired);
  });
});

describe("an id on SearchBarResults", () => {
  test("is rendered, and the input follows it before paint while no list is mounted", async () => {
    const { container, paint } = await painted();
    const read = () => {
      const { input, panel } = parts(container, "bar");
      return [panel!.id, input.getAttribute("aria-controls")];
    };
    expect(
      await paint(
        searchBar("bar", { results: { id: "x" }, list: false }),
        read,
      ),
    ).toEqual(["x", "x"]);
  });

  test("gives way to the listbox while a list is mounted, and comes back after it unmounts", async () => {
    const { container, paint } = await painted();
    const read = () => wiring(container, "bar");
    const bar = (list: boolean) =>
      searchBar("bar", { results: { id: "x", open: false }, list });
    expect(await paint(bar(false), read)).toEqual({
      expanded: "false",
      controls: "panel",
    });
    expect(await paint(bar(true), read)).toEqual({
      expanded: "false",
      controls: "listbox",
    });
    expect(await paint(bar(false), read)).toEqual({
      expanded: "false",
      controls: "panel",
    });
    expect(parts(container, "bar").input.getAttribute("aria-controls")).toBe(
      "x",
    );
  });

  test("can be added, changed and removed across renders, before paint", async () => {
    const { container, paint } = await painted();
    const read = () => {
      const { input, panel } = parts(container, "header");
      const main = parts(container, "main");
      return {
        id: panel!.id,
        controls: input.getAttribute("aria-controls"),
        named: controlled(input) === panel,
        main: controlled(main.input) === main.panel,
      };
    };
    const withId = (id?: string) =>
      page({ results: { id }, list: false }, { list: false });
    const generated = (await paint(withId(), read)).id;
    expect(generated).toBeTruthy();
    for (const id of ["x", "y", undefined, "x", undefined])
      expect(await paint(withId(id), read)).toEqual({
        id: id ?? generated,
        controls: id ?? generated,
        named: true,
        main: true,
      });
  });

  test("is let go when the results panel unmounts", async () => {
    const { container, rerender } = await mount(
      createElement(
        "div",
        null,
        searchBar("header", { results: { id: "x" }, list: false }),
      ),
    );
    expect(wiring(container, "header").controls).toBe("panel");
    await rerender(
      createElement(
        "div",
        null,
        searchBar("header", { results: null, list: false }),
      ),
    );
    expect(wiring(container, "header")).toEqual({
      expanded: "false",
      controls: "nothing",
    });
  });

  test("an aria-controls on SearchBarInput wins over it", async () => {
    const { container } = await mount(
      page({
        input: { "aria-controls": "y" },
        results: { id: "x" },
        list: false,
      }),
    );
    const { input, panel } = parts(container, "header");
    expect(input.getAttribute("aria-controls")).toBe("y");
    expect(panel!.id).toBe("x");
  });

  test("server HTML hydrates without a warning, and the input follows it", async () => {
    const tree = page({ results: { id: "x" }, list: false });
    const container = serverRender(tree);
    expect(await hydrate(container, tree)).toEqual([]);
    const { input, panel } = parts(container, "header");
    expect(panel!.id).toBe("x");
    expect(input.getAttribute("aria-controls")).toBe("x");
  });
});

describe("two SearchBars on one page", () => {
  test("render no duplicate ids", async () => {
    const { container } = await mount(page());
    expect(duplicateIds(container)).toEqual([]);
  });

  // Each state in one bar beside each state in the other
  const sideBySide = states.flatMap((header) =>
    states.map((main) => ({ header, main })),
  );

  test.each(sideBySide)(
    "a header holding $header.state beside a main holding $main.state name only their own parts",
    async ({ header, main }) => {
      const { container } = await mount(page(header, main));
      expect(duplicateIds(container)).toEqual([]);
      for (const [name, state] of [
        ["header", header],
        ["main", main],
      ] as const) {
        expect(wiring(container, name)).toEqual(state.wired);
        const { bar, input } = parts(container, name);
        const target = controlled(input);
        if (target) expect(bar.contains(target)).toBe(true);
      }
    },
  );

  test("each bar changes on its own", async () => {
    const { container, paint } = await painted();
    const read = () => [wiring(container, "header"), wiring(container, "main")];
    const state = (name: string) => states.find(({ state }) => state === name)!;
    const nothing = state("nothing");
    const closedWithList = state("a closed panel with a list");
    const openWithList = state("an open panel with a list");
    expect(await paint(page(nothing, openWithList), read)).toEqual([
      nothing.wired,
      openWithList.wired,
    ]);
    expect(await paint(page(openWithList, openWithList), read)).toEqual([
      openWithList.wired,
      openWithList.wired,
    ]);
    expect(await paint(page(openWithList, closedWithList), read)).toEqual([
      openWithList.wired,
      closedWithList.wired,
    ]);
    expect(await paint(page(nothing, closedWithList), read)).toEqual([
      nothing.wired,
      closedWithList.wired,
    ]);
  });
});

// A SearchBar as a copy of the library from before #204 makes it, sharing
// SearchBarContext through the registry: its context has no parts, and it
// registers an id given to SearchBarResults by setting its own state
type OlderContext = {
  size: "small" | "medium" | "large";
  generatedResultsId?: string;
  resultsId?: string;
  setGivenResultsId: Dispatch<SetStateAction<string | undefined>>;
};
const SearchBarContext = sharedContext<OlderContext>("SearchBarContext", {
  size: "medium",
  setGivenResultsId: () => {},
});
function OlderSearchBar({
  children,
  ...props
}: { children?: ReactNode } & Record<`data-${string}`, string>) {
  const generatedResultsId = useId();
  const [givenResultsId, setGivenResultsId] = useState<string>();
  const context = useMemo(
    () => ({
      size: "medium" as const,
      generatedResultsId,
      resultsId: givenResultsId ?? generatedResultsId,
      setGivenResultsId,
    }),
    [generatedResultsId, givenResultsId],
  );
  return createElement(
    SearchBarContext.Provider,
    { value: context },
    createElement(Command, { shouldFilter: false, ...props }, children),
  );
}

describe("in an older copy's SearchBar", () => {
  const olderBar = ({
    input = {},
    results = {},
  }: {
    input?: InputProps;
    results?: ResultsProps;
  }) =>
    createElement(
      OlderSearchBar,
      { "data-bar": "older" },
      createElement(SearchBarInput, {
        value: "",
        onValueChange: () => {},
        ...input,
      }),
      createElement(
        SearchBarResults,
        panel({ open: false, ...results }),
        createElement(
          SearchBarResultsList,
          null,
          createElement(SearchBarResultsItem, { value: "a" }, "a"),
        ),
      ),
    );

  test("the input keeps today's wiring: the panel, and cmdk's aria-expanded", async () => {
    const { container } = await mount(olderBar({}));
    expect(wiring(container, "older")).toEqual({
      expanded: "true",
      controls: "panel",
    });
  });

  test("the input follows an id given to SearchBarResults", async () => {
    const { container } = await mount(olderBar({ results: { id: "x" } }));
    expect(wiring(container, "older")).toEqual({
      expanded: "true",
      controls: "panel",
    });
    expect(parts(container, "older").input.getAttribute("aria-controls")).toBe(
      "x",
    );
  });

  test("an author's aria-controls and aria-expanded still win", async () => {
    const { container } = await mount(
      olderBar({
        input: { "aria-controls": "elsewhere", "aria-expanded": false },
      }),
    );
    expect(wiring(container, "older")).toEqual({
      expanded: "false",
      controls: "#elsewhere",
    });
  });
});

// The people the docs' search lists. "tu" matches every one.
const people = ["Tunku Abdul Rahman", "Tun Abdul Razak", "Tun Hussein Onn"];

// A SearchBar composed as the docs' controlled example composes it: its
// results open while there's a query and the input has focus, and its list
// is mounted only while the query matches someone; otherwise the panel says
// "No results found". Its input takes `input`, and choosing a result calls
// `onSelect` with that result's name.
function DocsSearch({
  input = {},
  onSelect = () => {},
}: {
  input?: InputProps;
  onSelect?: (name: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [hasFocus, setHasFocus] = useState(false);
  const hasQuery = query.length > 0;
  const results = people.filter((name) =>
    name.toLowerCase().includes(query.toLowerCase()),
  );
  return createElement(
    SearchBar,
    { "data-bar": "docs" } as ComponentProps<typeof SearchBar>,
    createElement(
      SearchBarInputContainer,
      null,
      createElement(SearchBarInput, {
        placeholder: "Search by name",
        value: query,
        onValueChange: setQuery,
        onFocus: () => setHasFocus(true),
        onBlur: () => setHasFocus(false),
        ...input,
      }),
    ),
    createElement(
      SearchBarResults,
      panel({ open: hasQuery && hasFocus }),
      hasQuery &&
        !results.length &&
        createElement("p", null, "No results found"),
      hasQuery &&
        results.length > 0 &&
        createElement(
          SearchBarResultsList,
          null,
          results.map((name) =>
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

// Empties `input`, as a user selecting its text and deleting it does
const clear = (input: HTMLInputElement) =>
  act(async () => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!.call(input, "");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });

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

describe("the keyboard, in the docs' controlled composition", () => {
  // The option the input's `aria-activedescendant` names, if it's inside
  // the element its `aria-controls` names
  const activeOption = (input: HTMLInputElement) => {
    const active = document.getElementById(
      input.getAttribute("aria-activedescendant") ?? "",
    );
    const target = controlled(input);
    return active?.getAttribute("role") === "option" && target?.contains(active)
      ? active
      : null;
  };

  // cmdk sets `aria-activedescendant` once its selection moves, so after
  // typing the input may have none
  const noneOrInside = (input: HTMLInputElement) =>
    !input.hasAttribute("aria-activedescendant") || !!activeOption(input);

  test("leaves aria-activedescendant inside the element aria-controls names", async () => {
    const { container } = await mount(createElement(DocsSearch));
    const input = container.querySelector("input")!;
    expect(wiring(container, "docs")).toEqual({
      expanded: "false",
      controls: "panel",
    });
    await act(async () => input.focus());
    await type(input, "tu");
    expect(wiring(container, "docs")).toEqual({
      expanded: "true",
      controls: "listbox",
    });
    expect(noneOrInside(input)).toBe(true);
    for (const key of ["ArrowDown", "ArrowDown", "ArrowUp", "ArrowUp"]) {
      await press(key);
      expect(activeOption(input), key).not.toBeNull();
    }
    expect(activeOption(input)!.textContent).toBe(selected(container));
  });

  test("a query with no matches leaves the input collapsed, with no aria-activedescendant", async () => {
    const { container } = await mount(createElement(DocsSearch));
    const input = container.querySelector("input")!;
    await act(async () => input.focus());
    await type(input, "tu");
    await press("ArrowDown");
    await type(input, "zz");
    expect(container.textContent).toContain("No results found");
    expect(wiring(container, "docs")).toEqual({
      expanded: "false",
      controls: "panel",
    });
    expect(input.hasAttribute("aria-activedescendant")).toBe(false);
    await clear(input);
    await type(input, "tun");
    expect(wiring(container, "docs")).toEqual({
      expanded: "true",
      controls: "listbox",
    });
    expect(noneOrInside(input)).toBe(true);
    await press("ArrowDown");
    expect(activeOption(input)).not.toBeNull();
  });

  test("blurring the input closes the panel and collapses the input", async () => {
    const { container } = await mount(createElement(DocsSearch));
    const input = container.querySelector("input")!;
    await act(async () => input.focus());
    await type(input, "tu");
    await act(async () => input.blur());
    expect(wiring(container, "docs")).toEqual({
      expanded: "false",
      controls: "listbox",
    });
  });
});

// A server-rendered SearchBar with <Suspense> boundaries inside it. React
// 18.3 client-renders a boundary that gets an update before it hydrates, as
// when SearchBar's context value changes, and so drops its server DOM or
// shows its fallback (#204). React 19 doesn't. Run these on React 18.3 too.
describe("Suspense boundaries in a server-rendered SearchBar", () => {
  // Suspends in the browser until the test ends, so its boundary stays
  // server HTML. It renders its text on the server.
  let inBrowser = false;
  const never = new Promise<never>(() => {});
  function Pending() {
    if (inBrowser) throw never;
    return createElement(
      "span",
      { "data-pending": "" },
      "Loaded on the server",
    );
  }

  const tree = (results: ResultsProps) =>
    createElement(
      SearchBar,
      { "data-bar": "bar" } as ComponentProps<typeof SearchBar>,
      createElement(
        SearchBarInputContainer,
        null,
        createElement(SearchBarInput, {
          "aria-label": "Search",
          value: "",
          onValueChange: () => {},
        }),
        createElement(
          Suspense,
          { fallback: createElement("i", null, "icon fallback") },
          createElement("b", { "data-icon": "" }, "icon"),
        ),
        createElement(
          Suspense,
          { fallback: createElement("i", null, "pending fallback") },
          createElement(Pending),
        ),
      ),
      createElement(
        SearchBarResults,
        panel({ open: false, ...results }),
        createElement(
          Suspense,
          { fallback: createElement("i", null, "list fallback") },
          createElement(
            SearchBarResultsList,
            null,
            createElement(SearchBarResultsItem, { value: "a" }, "a"),
          ),
        ),
      ),
    );

  test.each([
    ["with no id", {}],
    ["with an id", { id: "x" }],
  ])(
    "hydrate their server DOM and keep it, with SearchBarResults %s",
    async (_, results) => {
      inBrowser = false;
      const container = serverRender(tree(results));
      const server = {
        icon: container.querySelector("[data-icon]"),
        pending: container.querySelector("[data-pending]"),
        listbox: container.querySelector('[role="listbox"]'),
      };
      expect(Object.values(server)).not.toContain(null);
      inBrowser = true;
      try {
        expect(await hydrate(container, tree(results))).toEqual([]);
        expect(container.querySelector("[data-icon]")).toBe(server.icon);
        expect(container.querySelector('[role="listbox"]')).toBe(
          server.listbox,
        );
        expect(container.querySelector("[data-pending]")).toBe(server.pending);
        expect(container.textContent).not.toContain("fallback");
        expect(wiring(container, "bar")).toEqual({
          expanded: "false",
          controls: "listbox",
        });
      } finally {
        inBrowser = false;
      }
    },
  );
});

// The commits React makes for a SearchBar, beside the commits for the same
// composition built from cmdk's own parts, which is what SearchBar rendered
// before #204 apart from #89's given-id registration
describe("commits", () => {
  type Step = Holding & { value?: string };

  const ours = ({ results = {}, list = true, value = "a" }: Step) =>
    searchBar("bar", { results, list, input: { value } });

  const cmdkList = () =>
    createElement(
      Command.List,
      null,
      createElement(Command.Item, { className: "hidden" }, "--"),
      createElement(Command.Item, { value: "bar" }, "bar"),
    );
  const cmdks = ({ results = {}, list = true, value = "a" }: Step) =>
    createElement(
      Command,
      { shouldFilter: false },
      createElement(
        "div",
        null,
        createElement(Command.Input, { value, onValueChange: () => {} }),
      ),
      results === null
        ? list && cmdkList()
        : createElement(
            "div",
            {
              id: results.id,
              className: results.open === false ? "hidden" : undefined,
            },
            list && cmdkList(),
          ),
    );

  // The commits each step of `steps` takes, rendered by `render`
  async function commits(render: (step: Step) => ReactElement, steps: Step[]) {
    let count = 0;
    const { rerender } = await mount(createElement("div"));
    const counts: number[] = [];
    for (const step of steps) {
      count = 0;
      await rerender(
        createElement(
          Profiler,
          { id: "bar", onRender: () => void count++ },
          render(step),
        ),
      );
      counts.push(count);
    }
    return counts;
  }

  const scenarios: [string, Step[]][] = [
    ["mounting with a panel and a list", [{}]],
    ["mounting with a panel with an id and a list", [{ results: { id: "x" } }]],
    ["mounting with nothing", [{ results: null, list: false }]],
    ["mounting with a panel", [{ list: false }]],
    ["mounting with a list", [{ results: null }]],
    ["closing and opening the panel", [{}, { results: { open: false } }, {}]],
    ["unmounting and mounting the list", [{}, { list: false }, {}]],
    [
      "unmounting and mounting the panel",
      [{}, { results: null, list: false }, {}],
    ],
    [
      "giving the panel an id and taking it away",
      [{}, { results: { id: "x" } }, {}],
    ],
    [
      "opening a panel, then mounting its list",
      [
        { results: { open: false }, list: false },
        { results: { open: true }, list: false },
        {},
      ],
    ],
  ];

  test.each(scenarios)(
    "%s takes at most one more commit per step than cmdk's parts",
    async (_, steps) => {
      const control = await commits(cmdks, steps);
      const counts = await commits(ours, steps);
      counts.forEach((count, step) =>
        expect(count, `step ${step}`).toBeLessThanOrEqual(control[step]! + 1),
      );
    },
  );

  test("typing that mounts or unmounts nothing takes no more commits than cmdk's parts", async () => {
    const steps = [{ value: "a" }, { value: "ab" }, { value: "abc" }];
    const control = await commits(cmdks, steps);
    const counts = await commits(ours, steps);
    expect(counts.slice(1)).toEqual(control.slice(1));
  });
});

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
