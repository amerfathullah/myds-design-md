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
import { Command, useCommandState } from "cmdk";
import { computeAccessibleName } from "dom-accessibility-api";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { sharedContext } from "../utils/registry";
import { Label } from "./label";
import {
  SearchBar,
  SearchBarClearButton,
  SearchBarInput,
  SearchBarInputContainer,
  SearchBarResults,
  SearchBarResultsGroup,
  SearchBarResultsItem,
  SearchBarResultsList,
  SearchBarSearchButton,
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

type Modifiers = Pick<
  KeyboardEventInit,
  "altKey" | "ctrlKey" | "metaKey" | "shiftKey"
>;

// Presses `key`, with `modifiers`, on whatever has focus, and returns
// whether the browser would still act on it: false once a handler cancels it
async function press(key: string, modifiers: Modifiers = {}) {
  let uncancelled = true;
  await act(async () => {
    uncancelled = document.activeElement!.dispatchEvent(
      new KeyboardEvent("keydown", {
        key,
        bubbles: true,
        cancelable: true,
        ...modifiers,
      }),
    );
  });
  return uncancelled;
}

// The text of the result cmdk has selected, if any. While nothing is
// highlighted, that's the hidden `--` option's.
const selected = (within: ParentNode) =>
  within.querySelector('[cmdk-item][aria-selected="true"]')?.textContent;

// The marker on SearchBarResultsList's hidden `--` option (#398)
const NOTHING = "data-nothing-highlighted";

// The option the input and the listbox of the bar named `name` each name in
// `aria-activedescendant`, by its text, or null where there's none. A name
// must be an option in the page that's selected and isn't the hidden `--`.
function active(within: ParentNode, name: string) {
  const { input, listbox } = parts(within, name);
  const named = (element: HTMLElement | null) => {
    const id = element?.getAttribute("aria-activedescendant");
    if (id == null) return null;
    const option = document.getElementById(id);
    expect(option, `#${id} is in the page`).not.toBeNull();
    expect(option!.getAttribute("role")).toBe("option");
    expect(option!.getAttribute("aria-selected")).toBe("true");
    expect(option!.hasAttribute(NOTHING), `#${id} isn't the hidden --`).toBe(
      false,
    );
    return option!.textContent;
  };
  return { input: named(input), listbox: named(listbox) };
}

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
      expect(active(container, "docs"), key).toEqual({
        input: selected(container),
        listbox: selected(container),
      });
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

// The results the key tests' bars hold
const abc = ["A", "B", "C"];

type KeysBar = Holding & {
  input?: InputProps;
  bar?: Partial<ComponentProps<typeof SearchBar>>;
  onSelect?: (name: string) => void;
  grouped?: boolean;
};

// A SearchBar named "keys" holding the results parts `results` and `list`
// ask for, as `searchBar` does, with a clear and a search button after its
// input. Its list holds A, B and C, each calling `onSelect` with its name;
// `grouped` puts A and B in one SearchBarResultsGroup and C in another.
// `bar` is SearchBar's props, and `input` SearchBarInput's, which is
// uncontrolled unless they say otherwise.
function keysBar({
  results = {},
  list = true,
  input = {},
  bar = {},
  onSelect = () => {},
  grouped = false,
}: KeysBar = {}) {
  const items = abc.map((name) =>
    createElement(
      SearchBarResultsItem,
      { key: name, value: name, onSelect: () => onSelect(name) },
      name,
    ),
  );
  const resultsList =
    list &&
    createElement(
      SearchBarResultsList,
      null,
      grouped
        ? [
            createElement(
              SearchBarResultsGroup,
              { key: "AB", heading: "A and B" },
              items.slice(0, 2),
            ),
            createElement(
              SearchBarResultsGroup,
              { key: "C", heading: "C" },
              items.slice(2),
            ),
          ]
        : items,
    );
  return createElement(
    SearchBar,
    { "data-bar": "keys", ...bar } as ComponentProps<typeof SearchBar>,
    createElement(
      SearchBarInputContainer,
      null,
      createElement(SearchBarInput, { "aria-label": "Search", ...input }),
      createElement(SearchBarClearButton, {
        "data-button": "clear",
      } as ComponentProps<typeof SearchBarClearButton>),
      createElement(SearchBarSearchButton, {
        "data-button": "search",
      } as ComponentProps<typeof SearchBarSearchButton>),
    ),
    results === null
      ? resultsList
      : createElement(
          SearchBarResults,
          panel({ open: true, ...results }),
          resultsList,
        ),
  );
}

// Mounts `bar` and focuses its input
async function focused(bar: ReactElement) {
  const mounted = await mount(bar);
  const input = mounted.container.querySelector("input")!;
  await act(async () => input.focus());
  return { ...mounted, input };
}

// The keys cmdk acts on, as `[key, modifiers]`: ArrowDown, ArrowUp, Home,
// End, Enter, and with `vimBindings` (on by default) Ctrl+N, J, P and K
const cmdkKeys: [string, Modifiers][] = [
  ["ArrowDown", {}],
  ["ArrowUp", {}],
  ["Home", {}],
  ["End", {}],
  ["Enter", {}],
  ["n", { ctrlKey: true }],
  ["j", { ctrlKey: true }],
  ["p", { ctrlKey: true }],
  ["k", { ctrlKey: true }],
];
const keyName = ([key, { ctrlKey }]: [string, Modifiers]) =>
  ctrlKey ? `Ctrl+${key.toUpperCase()}` : key;

// The states #204 counts as no list displayed
const undisplayed = states.filter(({ wired }) => wired.expanded === "false");
// The states with a list displayed
const displayed = states.filter(({ wired }) => wired.expanded === "true");

describe("while no list is displayed (#398)", () => {
  test.each(undisplayed)(
    "with $state, cmdk's keys aren't cancelled, and choose nothing",
    async ({ results, list }) => {
      const chosen: string[] = [];
      const { container } = await focused(
        keysBar({ results, list, onSelect: (name) => void chosen.push(name) }),
      );
      for (const key of cmdkKeys) {
        expect(await press(...key), keyName(key)).toBe(true);
        expect(active(container, "keys")).toEqual({
          input: null,
          listbox: null,
        });
      }
      expect(chosen).toEqual([]);
      if (list) expect(selected(container)).toBe("--");
    },
  );

  test("a closed panel keeps cmdk's selection where it was, names nothing, and Enter chooses nothing", async () => {
    const chosen: string[] = [];
    const bar = (open: boolean) =>
      keysBar({
        results: { open },
        onSelect: (name) => void chosen.push(name),
      });
    const { container, rerender } = await focused(bar(true));
    await press("ArrowDown");
    await press("ArrowDown");
    expect(selected(container)).toBe("B");
    expect(active(container, "keys")).toEqual({ input: "B", listbox: "B" });
    await rerender(bar(false));
    expect(active(container, "keys")).toEqual({ input: null, listbox: null });
    for (const key of cmdkKeys) {
      expect(await press(...key), keyName(key)).toBe(true);
      expect(selected(container), keyName(key)).toBe("B");
      expect(active(container, "keys")).toEqual({
        input: null,
        listbox: null,
      });
    }
    expect(chosen).toEqual([]);
    // Reopening names the highlighted result again, and the keys work
    await rerender(bar(true));
    expect(active(container, "keys")).toEqual({ input: "B", listbox: "B" });
    expect(await press("ArrowDown")).toBe(false);
    expect(active(container, "keys")).toEqual({ input: "C", listbox: "C" });
    expect(await press("Enter")).toBe(false);
    expect(chosen).toEqual(["C"]);
  });
});

describe("while a list is displayed (#398)", () => {
  // Each key, and the result it highlights after the one before
  const walk: [[string, Modifiers], string][] = [
    [["ArrowDown", {}], "A"],
    [["ArrowDown", {}], "B"],
    [["ArrowUp", {}], "A"],
    [["n", { ctrlKey: true }], "B"],
    [["p", { ctrlKey: true }], "A"],
    [["j", { ctrlKey: true }], "B"],
    [["k", { ctrlKey: true }], "A"],
    [["ArrowDown", { altKey: true }], "B"],
    [["ArrowUp", { altKey: true }], "A"],
  ];

  test.each(displayed)(
    "with $state, the arrow keys, Ctrl+N/J/P/K and Alt+arrows move the highlight, Enter chooses it, and the input and listbox name it",
    async ({ results, list }) => {
      const chosen: string[] = [];
      const { container } = await focused(
        keysBar({ results, list, onSelect: (name) => void chosen.push(name) }),
      );
      expect(selected(container)).toBe("--");
      expect(active(container, "keys")).toEqual({
        input: null,
        listbox: null,
      });
      for (const [key, highlighted] of walk) {
        expect(await press(...key), keyName(key)).toBe(false);
        expect(selected(container), keyName(key)).toBe(highlighted);
        expect(active(container, "keys")).toEqual({
          input: highlighted,
          listbox: highlighted,
        });
      }
      expect(await press("Enter")).toBe(false);
      expect(chosen).toEqual(["A"]);
    },
  );

  test("without vimBindings, Ctrl+N/J/P/K aren't cmdk's, and aren't cancelled", async () => {
    const { container } = await focused(
      keysBar({ bar: { vimBindings: false } }),
    );
    await press("ArrowDown");
    for (const key of ["n", "j", "p", "k"]) {
      expect(await press(key, { ctrlKey: true }), key).toBe(true);
      expect(selected(container)).toBe("A");
    }
  });

  test("an author's `value` on SearchBar that selects a result is named", async () => {
    const bar = (value: string) => keysBar({ bar: { value } });
    const { container, rerender } = await focused(bar("B"));
    expect(selected(container)).toBe("B");
    expect(active(container, "keys")).toEqual({ input: "B", listbox: "B" });
    await rerender(bar("C"));
    expect(selected(container)).toBe("C");
    expect(active(container, "keys")).toEqual({ input: "C", listbox: "C" });
  });
});

describe("on the clear and search buttons (#398)", () => {
  test.each(states)(
    "with $state, cmdk's keys aren't cancelled, and choose nothing",
    async ({ results, list }) => {
      const chosen: string[] = [];
      const { container } = await focused(
        keysBar({ results, list, onSelect: (name) => void chosen.push(name) }),
      );
      if (list && results?.open !== false) await press("ArrowDown");
      const before = selected(container);
      for (const button of ["clear", "search"]) {
        await act(async () =>
          container
            .querySelector<HTMLElement>(`[data-button="${button}"]`)!
            .focus(),
        );
        for (const key of cmdkKeys)
          expect(await press(...key), `${button}: ${keyName(key)}`).toBe(true);
      }
      expect(selected(container)).toBe(before);
      expect(chosen).toEqual([]);
    },
  );
});

describe("the hidden `--` option (#398)", () => {
  test("carries a marker, in server HTML and in the browser, and hydrates without a warning", async () => {
    const tree = keysBar();
    const container = serverRender(tree);
    const marked = () =>
      [...container.querySelectorAll(`[cmdk-item][${NOTHING}]`)].map(
        (option) => option.textContent,
      );
    expect(marked()).toEqual(["--"]);
    expect(await hydrate(container, tree)).toEqual([]);
    expect(marked()).toEqual(["--"]);
    expect(container.querySelector(`[${NOTHING}]`)).toBe(
      container.querySelector("[cmdk-item]"),
    );
  });

  test("is never named in server HTML, at rest, or after a query change", async () => {
    const container = serverRender(keysBar());
    expect(container.querySelector("[aria-activedescendant]")).toBeNull();
    const { container: page } = await mount(createElement(DocsSearch));
    const input = page.querySelector("input")!;
    await act(async () => input.focus());
    await type(input, "tu");
    expect(selected(page)).toBe("--");
    expect(active(page, "docs")).toEqual({ input: null, listbox: null });
  });
});

// A SearchBar composed as the docs' controlled example, except that its list
// is mounted only while its panel is open
function OpenOnlySearch({ controlled = true }: { controlled?: boolean }) {
  const [query, setQuery] = useState("");
  const [hasFocus, setHasFocus] = useState(false);
  const open = query.length > 0 && hasFocus;
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
        "aria-label": "Search by name",
        ...(controlled
          ? { value: query, onValueChange: setQuery }
          : { onValueChange: setQuery }),
        onFocus: () => setHasFocus(true),
        onBlur: () => setHasFocus(false),
      }),
    ),
    createElement(
      SearchBarResults,
      panel({ open }),
      open &&
        results.length > 0 &&
        createElement(
          SearchBarResultsList,
          null,
          results.map((name) =>
            createElement(
              SearchBarResultsItem,
              { key: name, value: name },
              name,
            ),
          ),
        ),
    ),
  );
}

describe("aria-activedescendant on the input and the listbox (#398)", () => {
  test("after the list unmounts and mounts again, names a displayed result or nothing", async () => {
    const { container } = await mount(createElement(OpenOnlySearch));
    const input = container.querySelector("input")!;
    await act(async () => input.focus());
    await type(input, "tu");
    await press("ArrowDown");
    await press("ArrowDown");
    expect(active(container, "docs")).toEqual({
      input: people[1],
      listbox: people[1],
    });
    await act(async () => input.blur());
    expect(parts(container, "docs").listbox).toBeNull();
    expect(active(container, "docs")).toEqual({ input: null, listbox: null });
    await act(async () => input.focus());
    const named = active(container, "docs");
    expect(named.input).toBe(named.listbox);
    if (named.input !== null) expect(named.input).toBe(selected(container));
    expect(await press("ArrowDown")).toBe(false);
    expect(active(container, "docs")).toEqual({
      input: selected(container),
      listbox: selected(container),
    });
  });

  test.each([
    ["a controlled", true],
    ["an uncontrolled", false],
  ])(
    "with %s input, editing the query so the highlighted result stays shown names nothing",
    async (_, controlled) => {
      const { container } = await mount(
        controlled
          ? createElement(DocsSearch)
          : createElement(OpenOnlySearch, { controlled: false }),
      );
      const input = container.querySelector("input")!;
      await act(async () => input.focus());
      await type(input, "tu");
      await press("ArrowDown");
      expect(active(container, "docs")).toEqual({
        input: people[0],
        listbox: people[0],
      });
      // Typing "n" leaves every result shown
      await type(input, "n");
      expect(selected(container)).toBe("--");
      expect(active(container, "docs")).toEqual({ input: null, listbox: null });
      expect(await press("Enter")).toBe(false);
      // So does Backspace
      await press("ArrowDown");
      expect(active(container, "docs")).toEqual({
        input: people[0],
        listbox: people[0],
      });
      await act(async () => {
        Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          "value",
        )!.set!.call(input, "tu");
        input.dispatchEvent(new Event("input", { bubbles: true }));
      });
      expect(selected(container)).toBe("--");
      expect(active(container, "docs")).toEqual({ input: null, listbox: null });
    },
  );
});

describe("an author's onKeyDown on SearchBar (#398)", () => {
  test.each(states)(
    "with $state, runs once per key, before cmdk, with SearchBar's root as currentTarget, and its preventDefault stops cmdk",
    async ({ results, list }) => {
      const seen: [string, string | null, boolean][] = [];
      let cancel = false;
      const { container } = await focused(
        keysBar({
          results,
          list,
          bar: {
            onKeyDown: (event) => {
              seen.push([
                event.key,
                event.currentTarget.getAttribute("cmdk-root"),
                event.defaultPrevented,
              ]);
              if (cancel) event.preventDefault();
            },
          },
        }),
      );
      for (const key of cmdkKeys) await press(...key);
      expect(seen).toEqual(cmdkKeys.map(([key]) => [key, "", false]));
      const before = selected(container);
      cancel = true;
      for (const key of cmdkKeys) {
        expect(await press(...key), keyName(key)).toBe(false);
        expect(selected(container), keyName(key)).toBe(before);
      }
    },
  );

  test("other keys reach cmdk's root and bubble on uncancelled, and the keys kept from cmdk reach the document uncancelled", async () => {
    const reached: [string, boolean][] = [];
    const listener = (event: KeyboardEvent) =>
      void reached.push([event.key, event.defaultPrevented]);
    document.addEventListener("keydown", listener);
    try {
      await focused(keysBar({ results: { open: false } }));
      for (const key of ["Escape", "Tab", "a", "Enter", "Home"])
        await press(key);
    } finally {
      document.removeEventListener("keydown", listener);
    }
    expect(reached).toEqual([
      ["Escape", false],
      ["Tab", false],
      ["a", false],
      ["Enter", false],
      ["Home", false],
    ]);
  });
});

describe("in an older copy's SearchBar (#398)", () => {
  test("a list in a closed panel counts as displayed: the input and the listbox name the highlighted result, or nothing", async () => {
    const { container } = await mount(
      createElement(
        OlderSearchBar,
        { "data-bar": "older" },
        createElement(SearchBarInput, { "aria-label": "Search" }),
        createElement(
          SearchBarResults,
          panel({ open: false }),
          createElement(
            SearchBarResultsList,
            null,
            abc.map((name) =>
              createElement(
                SearchBarResultsItem,
                { key: name, value: name },
                name,
              ),
            ),
          ),
        ),
      ),
    );
    const input = container.querySelector("input")!;
    await act(async () => input.focus());
    expect(selected(container)).toBe("--");
    expect(active(container, "older")).toEqual({ input: null, listbox: null });
    await press("ArrowDown");
    expect(active(container, "older")).toEqual({ input: "A", listbox: "A" });
    await press("ArrowDown");
    expect(active(container, "older")).toEqual({ input: "B", listbox: "B" });
    // Home and End keep cmdk's behaviour there (#399): it cancels them
    expect(await press("Home")).toBe(false);
    expect(await press("End")).toBe(false);
  });
});

// Home and End with any modifiers or none, and Meta+ArrowUp and
// Meta+ArrowDown with any other modifiers or none: the keys #399 leaves to
// the browser in every state, as `[key, modifiers]`
const caretKeys: [string, Modifiers][] = [
  ...["Home", "End"].flatMap((key): [string, Modifiers][] => [
    [key, {}],
    [key, { shiftKey: true }],
    [key, { ctrlKey: true }],
    [key, { altKey: true }],
    [key, { metaKey: true }],
    [key, { ctrlKey: true, shiftKey: true }],
  ]),
  ...["ArrowUp", "ArrowDown"].flatMap((key): [string, Modifiers][] => [
    [key, { metaKey: true }],
    [key, { metaKey: true, shiftKey: true }],
    [key, { metaKey: true, ctrlKey: true }],
    [key, { metaKey: true, altKey: true }],
  ]),
];
const withModifiers = ([key, modifiers]: [string, Modifiers]) =>
  [
    modifiers.metaKey && "Meta",
    modifiers.ctrlKey && "Ctrl",
    modifiers.altKey && "Alt",
    modifiers.shiftKey && "Shift",
    key,
  ]
    .filter(Boolean)
    .join("+");

describe("Home, End and the Meta arrows (#399)", () => {
  test.each(states)(
    "with $state, aren't cancelled, and leave the highlight and aria-activedescendant where they were",
    async ({ results, list }) => {
      const { container } = await focused(keysBar({ results, list }));
      const steps = list && results?.open !== false ? ["", "ArrowDown"] : [""];
      for (const step of steps) {
        // From rest, then from a highlighted result
        if (step) expect(await press(step)).toBe(false);
        const before = {
          selected: selected(container) ?? null,
          active: active(container, "keys"),
        };
        if (step) expect(before.active.input).toBe("A");
        for (const key of caretKeys) {
          expect(await press(...key), withModifiers(key)).toBe(true);
          expect(
            {
              selected: selected(container) ?? null,
              active: active(container, "keys"),
            },
            withModifiers(key),
          ).toEqual(before);
        }
      }
    },
  );

  test("Enter after Home chooses the highlighted result, and at rest chooses nothing", async () => {
    const chosen: string[] = [];
    const { container } = await focused(
      keysBar({ onSelect: (name) => void chosen.push(name) }),
    );
    await press("Home");
    expect(await press("Enter")).toBe(false);
    expect(chosen).toEqual([]);
    await press("ArrowDown");
    await press("ArrowDown");
    await press("Home");
    await press("End");
    expect(selected(container)).toBe("B");
    await press("Enter");
    expect(chosen).toEqual(["B"]);
  });

  test.each(states)(
    "with $state, an author's onKeyDown on SearchBar runs once for each, with SearchBar's root as currentTarget, and its preventDefault cancels it",
    async ({ results, list }) => {
      const seen: string[] = [];
      let cancel = false;
      const { container } = await focused(
        keysBar({
          results,
          list,
          bar: {
            onKeyDown: (event) => {
              expect(event.currentTarget.hasAttribute("cmdk-root")).toBe(true);
              seen.push(event.key);
              if (cancel) event.preventDefault();
            },
          },
        }),
      );
      for (const key of caretKeys) expect(await press(...key)).toBe(true);
      cancel = true;
      const before = selected(container);
      for (const key of caretKeys) expect(await press(...key)).toBe(false);
      expect(selected(container)).toBe(before);
      expect(seen).toEqual([...caretKeys, ...caretKeys].map(([key]) => key));
    },
  );

  test.each([
    ["on", true],
    ["off", false],
  ])(
    "with vimBindings %s, the other keys still move the highlight while a list is displayed",
    async (_, vimBindings) => {
      const { container } = await focused(keysBar({ bar: { vimBindings } }));
      const walk: [string, Modifiers][] = [
        ["ArrowDown", {}],
        ["ArrowDown", {}],
        ["ArrowUp", {}],
        ["ArrowDown", { altKey: true }],
        ["ArrowUp", { altKey: true }],
        ["n", { ctrlKey: true }],
        ["j", { ctrlKey: true }],
        ["p", { ctrlKey: true }],
        ["k", { ctrlKey: true }],
      ];
      const highlights: (string | null | undefined)[] = [];
      for (const key of walk) {
        await press(...key);
        highlights.push(selected(container));
      }
      expect(highlights).toEqual(
        vimBindings
          ? ["A", "B", "A", "B", "A", "B", "C", "B", "A"]
          : ["A", "B", "A", "B", "A", "A", "A", "A", "A"],
      );
    },
  );
});

// `keysBar`, with an input that's controlled when `controlled` says so. Its
// list always holds A, B and C, whatever the query.
function KeysSearch({
  controlled,
  onValueChange = () => {},
  ...props
}: KeysBar & {
  controlled: boolean;
  onValueChange?: (value: string) => void;
}) {
  const [query, setQuery] = useState("");
  const change = (value: string) => {
    onValueChange(value);
    setQuery(value);
  };
  return keysBar({
    ...props,
    input: controlled
      ? { value: query, onValueChange: change }
      : { onValueChange: change },
  });
}

// Moves the highlight in `within` to `target` with ArrowDown and ArrowUp
async function goTo(within: ParentNode, target: string) {
  for (let i = 0; i < 2 * abc.length && selected(within) !== target; i++)
    await press(
      abc.indexOf(selected(within) ?? "") < abc.indexOf(target)
        ? "ArrowDown"
        : "ArrowUp",
    );
  expect(selected(within)).toBe(target);
}

describe("the keys never highlight the hidden `--` option (#205)", () => {
  const down: [string, Modifiers] = ["ArrowDown", {}];
  const up: [string, Modifiers] = ["ArrowUp", {}];
  const upKeys: [string, Modifiers][] = [
    up,
    ["p", { ctrlKey: true }],
    ["k", { ctrlKey: true }],
    ["ArrowUp", { altKey: true }],
  ];
  const downKeys: [string, Modifiers][] = [
    down,
    ["n", { ctrlKey: true }],
    ["j", { ctrlKey: true }],
    ["ArrowDown", { altKey: true }],
  ];

  // Each row of #205's table: whether to type a character first, the keys,
  // and what's highlighted after them without `loop` and with it. null is
  // nothing.
  type Row = {
    row: string;
    typeFirst?: boolean;
    keys: [string, Modifiers][];
    plain: string | null;
    looped: string | null;
  };
  const rows: Row[] = [
    { row: "at rest", keys: [], plain: null, looped: null },
    {
      row: "after a query change",
      typeFirst: true,
      keys: [],
      plain: null,
      looped: null,
    },
    { row: "ArrowDown", keys: [down], plain: "A", looped: "A" },
    {
      row: "ArrowDown, then ArrowUp",
      keys: [down, up],
      plain: "A",
      looped: "C",
    },
    ...upKeys.map((key) => ({
      row: `${withModifiers(key)} from rest`,
      keys: [key],
      plain: null,
      looped: "C",
    })),
    ...upKeys.slice(1).map((key) => ({
      row: `${withModifiers(key)} from A`,
      keys: [down, key],
      plain: "A",
      looped: "C",
    })),
    // Without `loop`, a key down from the last result stays on it
    ...downKeys.map((key) => ({
      row: `ArrowDown ×3, then ${withModifiers(key)}`,
      keys: [down, down, down, key],
      plain: "C",
      looped: "A",
    })),
  ];

  // Each way to compose the bar: a controlled or an uncontrolled input, with
  // or without `loop`, and the list directly in SearchBar or in an open
  // SearchBarResults
  const compositions = [true, false].flatMap((controlled) =>
    [false, true].flatMap((loop) =>
      [null, {}].map((results) => ({
        composition: `${controlled ? "a controlled" : "an uncontrolled"} input${loop ? ", with loop" : ""}, ${results ? "in a panel" : "with no panel"}`,
        controlled,
        loop,
        results,
      })),
    ),
  );

  describe.each(compositions)(
    "with $composition",
    ({ controlled, loop, results }) => {
      test.each(rows)(
        "$row highlights what the table says, and Enter chooses it",
        async ({ typeFirst, keys, plain, looped }) => {
          const chosen: string[] = [];
          const { container, input } = await focused(
            createElement(KeysSearch, {
              controlled,
              results,
              bar: { loop },
              onSelect: (name) => void chosen.push(name),
            }),
          );
          if (typeFirst) {
            // Into the results, then a query change
            await press("ArrowDown");
            await type(input, "x");
          }
          for (const key of keys) await press(...key);
          const highlighted = loop ? looped : plain;
          expect(selected(container)).toBe(highlighted ?? "--");
          expect(active(container, "keys")).toEqual({
            input: highlighted,
            listbox: highlighted,
          });
          expect(await press("Enter")).toBe(false);
          expect(chosen).toEqual(highlighted ? [highlighted] : []);
        },
      );
    },
  );

  // Every arrow key and Ctrl+N/J/P/K, with each set of other modifiers
  const subsets = (modifiers: (keyof Modifiers)[]): Modifiers[] =>
    modifiers.reduce<Modifiers[]>(
      (sets, modifier) => [
        ...sets,
        ...sets.map((set) => ({ ...set, [modifier]: true })),
      ],
      [{}],
    );
  const everyMove: [string, Modifiers][] = [
    ...["ArrowUp", "ArrowDown"].flatMap((key) =>
      subsets(["altKey", "ctrlKey", "metaKey", "shiftKey"]).map(
        (modifiers): [string, Modifiers] => [key, modifiers],
      ),
    ),
    ...["n", "j", "p", "k"].flatMap((key) =>
      subsets(["altKey", "metaKey", "shiftKey"]).map(
        (modifiers): [string, Modifiers] => [
          key,
          { ...modifiers, ctrlKey: true },
        ],
      ),
    ),
  ];

  test.each([
    { bar: "with no options", props: {} },
    { bar: "with loop", props: { bar: { loop: true } } },
    { bar: "grouped", props: { grouped: true } },
    {
      bar: "grouped, with loop",
      props: { grouped: true, bar: { loop: true } },
    },
    { bar: "without vimBindings", props: { bar: { vimBindings: false } } },
  ])(
    "$bar, no key moves the highlight from a result back to nothing",
    async ({ props }) => {
      const { container } = await focused(keysBar(props));
      for (const key of everyMove)
        for (const start of abc) {
          await goTo(container, start);
          await press(...key);
          expect(
            selected(container),
            `${withModifiers(key)} from ${start}`,
          ).not.toBe("--");
          expect(active(container, "keys").input).toBe(selected(container));
        }
    },
  );

  test("the hidden `--` option stays the first option, and isn't left disabled", async () => {
    const { container } = await focused(keysBar());
    for (const key of everyMove) await press(...key);
    await new Promise((done) => setTimeout(done, 0));
    const options = container.querySelectorAll("[cmdk-item]");
    expect(options[0]!.hasAttribute(NOTHING)).toBe(true);
    expect(options[0]!.getAttribute("aria-disabled")).toBe("false");
  });
});

// Renders cmdk's query, as SearchBar's parts see it, in `data-search`
function QueryProbe() {
  const search = useCommandState((state) => state.search);
  return createElement("output", { "data-search": search });
}

describe("a controlled SearchBarInput (#205)", () => {
  // A bar whose input is controlled, which its clear button empties, and
  // which records each `onValueChange`
  function Cleared({ changes }: { changes: string[] }) {
    const [query, setQuery] = useState("");
    return createElement(
      SearchBar,
      { "data-bar": "keys" } as ComponentProps<typeof SearchBar>,
      createElement(
        SearchBarInputContainer,
        null,
        createElement(SearchBarInput, {
          "aria-label": "Search",
          value: query,
          onValueChange: (value: string) => {
            changes.push(value);
            setQuery(value);
          },
        }),
        createElement(SearchBarClearButton, {
          "data-button": "clear",
          onClick: () => setQuery(""),
        } as ComponentProps<typeof SearchBarClearButton>),
      ),
      createElement(QueryProbe),
      createElement(
        SearchBarResultsList,
        null,
        abc.map((name) =>
          createElement(SearchBarResultsItem, { key: name, value: name }, name),
        ),
      ),
    );
  }

  test("hands cmdk each query typed, calls onValueChange once per keystroke, and a query set from outside still reaches cmdk", async () => {
    const changes: string[] = [];
    const { container, input } = await focused(
      createElement(Cleared, { changes }),
    );
    const search = () =>
      container.querySelector("[data-search]")!.getAttribute("data-search");
    await type(input, "tu");
    expect(changes).toEqual(["t", "tu"]);
    expect(search()).toBe("tu");
    expect(input.value).toBe("tu");
    await press("ArrowDown");
    expect(active(container, "keys")).toEqual({ input: "A", listbox: "A" });
    await act(async () =>
      container.querySelector<HTMLElement>('[data-button="clear"]')!.click(),
    );
    await act(settle);
    expect(input.value).toBe("");
    expect(search()).toBe("");
    expect(selected(container)).toBe("--");
    expect(active(container, "keys")).toEqual({ input: null, listbox: null });
    expect(changes).toEqual(["t", "tu"]);
    await type(input, "a");
    expect(changes).toEqual(["t", "tu", "a"]);
    expect(search()).toBe("a");
  });

  test("whose author keeps the old query, keeps cmdk's query too", async () => {
    function Stubborn() {
      return createElement(
        SearchBar,
        { "data-bar": "keys" } as ComponentProps<typeof SearchBar>,
        createElement(SearchBarInput, {
          "aria-label": "Search",
          value: "tu",
          onValueChange: () => {},
        }),
        createElement(QueryProbe),
      );
    }
    const { container, input } = await focused(createElement(Stubborn));
    await type(input, "n");
    await act(settle);
    expect(input.value).toBe("tu");
    expect(
      container.querySelector("[data-search]")!.getAttribute("data-search"),
    ).toBe("tu");
  });
});

describe("in an older copy's SearchBar (#205)", () => {
  // A list from this copy, whose hidden `--` is marked, and one built from
  // cmdk's parts, as an older copy's, whose hidden `--` isn't
  const lists: [string, () => ReactElement][] = [
    [
      "this copy's list",
      () =>
        createElement(
          SearchBarResultsList,
          null,
          abc.map((name) =>
            createElement(
              SearchBarResultsItem,
              { key: name, value: name },
              name,
            ),
          ),
        ),
    ],
    [
      "an unmarked list",
      () =>
        createElement(
          Command.List,
          null,
          createElement(Command.Item, { className: "hidden" }, "--"),
          abc.map((name) =>
            createElement(Command.Item, { key: name, value: name }, name),
          ),
        ),
    ],
  ];

  test.each(lists)(
    "with %s, nothing is highlighted at rest, and each row gives today's result or the table's",
    async (_, list) => {
      const { container, input } = await focused(
        createElement(
          OlderSearchBar,
          { "data-bar": "older" },
          createElement(SearchBarInput, { "aria-label": "Search" }),
          list(),
        ),
      );
      expect(selected(container)).toBe("--");
      await press("ArrowDown");
      expect(selected(container)).toBe("A");
      await press("ArrowUp");
      expect(["A", "--"]).toContain(selected(container));
      await press("ArrowDown");
      await press("ArrowDown");
      await press("ArrowDown");
      expect(selected(container)).toBe("C");
      await type(input, "x");
      expect(selected(container)).toBe("--");
    },
  );
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
