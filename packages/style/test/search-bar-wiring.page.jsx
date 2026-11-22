// The page search-bar-wiring.test.mjs renders: SearchBars composed as the
// docs compose them, each input named by its `aria-label`. Each bar has a
// `data-bar`, and its SearchBarResults, if it has one, a `data-panel`. The
// compositions are:
// - "no panel": an input and a search button, as in the Size, Clear Button
//   and Hint examples;
// - "closed list": a closed panel with a list, as in the splask story;
// - "scrolling list": an open panel with a list of more results than fit in
//   the docs' 400px;
// - "no results": an open panel showing only "No results found";
// - "two bars": a header search beside a page search, each with an open
//   panel and a list;
// - "list, no panel": a list with no SearchBarResults around it;
// - "given id": an open panel given an `id`, with no list;
// - "author values": an open panel given an `id`, with a list, and an input
//   whose own `aria-controls` names the panel and whose `aria-expanded` is
//   false;
// - "suspense" and "suspense, given id": a closed panel, without and with an
//   `id`, and three <Suspense> boundaries: one around an icon in the input
//   container, one around the list in the panel, and one in the panel that
//   suspends in the browser and never resolves, so it stays server HTML;
// - "docs": the docs' Controlled Component example, the panel open while the
//   input has focus and a query, the list mounted while the query matches.
// search-bar-wiring.server.jsx renders a composition to HTML in Node, and
// `hydrate` hydrates that HTML here, keeping what it read before in
// `window.serverWiring` and `window.serverNodes`. React's recoverable errors
// go to `window.recoverableErrors`, any fallback React inserts to
// `window.fallbacks`, the wiring as it stood before the browser could paint
// to `window.painted`, each boundary that hydrates to `window.hydrated`, and
// the composition's name to `window.ready` once React has committed it. The
// test bundles this file with esbuild, for the browser as `searchBarWiring`.
import { Suspense, useEffect, useLayoutEffect, useState, version } from "react";
import { hydrateRoot } from "react-dom/client";

import { Pill } from "../../react/src/components/pill";
import {
  SearchBar,
  SearchBarClearButton,
  SearchBarHint,
  SearchBarInput,
  SearchBarInputContainer,
  SearchBarResults,
  SearchBarResultsItem,
  SearchBarResultsList,
  SearchBarSearchButton,
} from "../../react/src/components/search-bar";
import { ChevronRightIcon, SearchIcon, UserIcon } from "../../react/src/icons";

export { version };

const inBrowser = typeof window !== "undefined";
// Layout effects run only in the browser, and React 18 warns of one on the
// server, so the server gets useEffect, as the components do
const useBeforePaint = inBrowser ? useLayoutEffect : useEffect;

// The first of the docs' notable Malaysians: more than the docs' 400px show
const people = [
  ["Michelle Yeoh", "Internationally acclaimed actress"],
  ["P. Ramlee", "Iconic actor, director, and musician"],
  ["Siti Nurhaliza", "Award-winning singer and songwriter"],
  ["Yuna", "Internationally recognized singer-songwriter"],
  ["Namewee", "Controversial filmmaker and musician"],
  ["Sheila Majid", "Jazz queen of Malaysia"],
  ["M. Nasir", "Musician, composer, and actor"],
  ["Afdlin Shauki", "Actor, director, and comedian"],
  ["Adibah Noor", "Singer and actress"],
  ["Zang Toi", "World-renowned fashion designer"],
  ["Harith Iskander", "Comedian and actor"],
  ["Lisa Surihani", "Award-winning actress and TV host"],
  ["Bront Palarae", "Critically acclaimed actor and filmmaker"],
  ["Erra Fazira", "Actress and singer"],
  ["Faizal Tahir", "Singer and performer"],
  ["Hannah Tan", "Singer-songwriter and actress"],
].map(([name, note]) => ({ name, note }));

// A result as the docs' examples render one
const Result = ({ name, note }) => (
  <SearchBarResultsItem value={name}>
    <span className="bg-primary-50 text-txt-primary rounded-full p-px">
      <UserIcon className="size-4" />
    </span>
    <p className="line-clamp-1 flex-1">
      {name} <span className="text-txt-black-500 text-xs">{note}</span>
    </p>
    <ChevronRightIcon />
  </SearchBarResultsItem>
);

// An uncontrolled SearchBar named `bar`, its input labelled `label` and
// taking `input`, with `icon` before the input
const Bar = ({
  bar,
  label = "Search by name",
  input = {},
  icon = null,
  children,
}) => (
  <SearchBar data-bar={bar} size="large">
    <SearchBarInputContainer>
      {icon}
      <SearchBarInput aria-label={label} placeholder={label} {...input} />
      <SearchBarSearchButton />
    </SearchBarInputContainer>
    {children}
  </SearchBar>
);

// A list of the first three people
const ShortList = () => (
  <SearchBarResultsList>
    {people.slice(0, 3).map((person) => (
      <Result key={person.name} {...person} />
    ))}
  </SearchBarResultsList>
);

// Says once its <Suspense> boundary has hydrated
function Hydrated({ name }) {
  useBeforePaint(() => void window.hydrated.push(name), [name]);
  return null;
}

// Renders on the server, and suspends in the browser for good, so its
// boundary stays server HTML
const never = new Promise(() => {});
function Pending() {
  if (inBrowser) throw never;
  return <p data-suspense="pending">Recent searches</p>;
}

// A closed panel given `id`, if any, holding a <Suspense> boundary around
// its list and one that stays pending, in a bar with one around an icon
const Suspended = ({ id }) => (
  <Bar
    bar="search"
    icon={
      <Suspense fallback={<span data-fallback="icon">…</span>}>
        <span data-suspense="icon">
          <SearchIcon />
        </span>
        <Hydrated name="icon" />
      </Suspense>
    }
  >
    <SearchBarResults data-panel="" open={false} id={id}>
      <Suspense fallback={<p data-fallback="list">Loading…</p>}>
        <ShortList />
        <Hydrated name="list" />
      </Suspense>
      <Suspense fallback={<p data-fallback="pending">Loading…</p>}>
        <Pending />
      </Suspense>
    </SearchBarResults>
  </Bar>
);

// The boundaries each composition holds that hydrate in the browser
export const boundaries = {
  suspense: ["icon", "list"],
  "suspense, given id": ["icon", "list"],
};

// The docs' Controlled Component example
function Docs() {
  const [hasFocus, setHasFocus] = useState(false);
  const [query, setQuery] = useState("");
  const hasQuery = query.length > 0;
  const results = people.filter((person) =>
    person.name.toLowerCase().includes(query.toLocaleLowerCase()),
  );
  return (
    <SearchBar
      data-bar="docs"
      size="large"
      onBlur={(e) => {
        const blurredByChild = e.currentTarget.contains(e.relatedTarget);
        if (blurredByChild) return;
        setHasFocus(false);
      }}
    >
      <SearchBarInputContainer>
        <SearchBarInput
          aria-label="Search by name"
          placeholder="Search by name"
          value={query}
          onValueChange={setQuery}
          onFocus={() => setHasFocus(true)}
          onBlur={() => setHasFocus(false)}
        />
        {query && <SearchBarClearButton onClick={() => setQuery("")} />}
        <SearchBarSearchButton />
        {!hasFocus && (
          <SearchBarHint className="hidden lg:flex">
            Press <Pill size="small">/</Pill> to search
          </SearchBarHint>
        )}
      </SearchBarInputContainer>
      <SearchBarResults data-panel="" open={hasQuery && hasFocus}>
        {hasQuery && !results.length && (
          <p className="text-txt-black-900 text-center">No results found</p>
        )}
        {hasQuery && results.length > 0 && (
          <SearchBarResultsList className="max-h-[400px] overflow-y-scroll">
            {results.map((item) => (
              <Result key={item.name} {...item} />
            ))}
          </SearchBarResultsList>
        )}
      </SearchBarResults>
    </SearchBar>
  );
}

export const compositions = {
  "no panel": () => <Bar bar="search" />,
  "closed list": () => (
    <Bar bar="search">
      <SearchBarResults data-panel="" open={false}>
        <ShortList />
      </SearchBarResults>
    </Bar>
  ),
  "scrolling list": () => (
    <Bar bar="search">
      <SearchBarResults data-panel="" open>
        <SearchBarResultsList className="max-h-[400px] overflow-y-scroll">
          {people.map((person) => (
            <Result key={person.name} {...person} />
          ))}
        </SearchBarResultsList>
      </SearchBarResults>
    </Bar>
  ),
  "no results": () => (
    <Bar bar="search">
      <SearchBarResults data-panel="" open>
        <p className="text-txt-black-900 text-center">No results found</p>
      </SearchBarResults>
    </Bar>
  ),
  "two bars": () => (
    <div className="flex gap-8">
      {[
        ["header", "Search the site"],
        ["main", "Search by name"],
      ].map(([bar, label]) => (
        <div key={bar} className="flex-1">
          <Bar bar={bar} label={label}>
            <SearchBarResults data-panel="" open>
              <ShortList />
            </SearchBarResults>
          </Bar>
        </div>
      ))}
    </div>
  ),
  "list, no panel": () => (
    <Bar bar="search">
      <ShortList />
    </Bar>
  ),
  "given id": () => (
    <Bar bar="search">
      <SearchBarResults data-panel="" open id="search-results">
        <p className="text-txt-black-900 text-center">No results found</p>
      </SearchBarResults>
    </Bar>
  ),
  "author values": () => (
    <Bar
      bar="search"
      input={{ "aria-controls": "search-results", "aria-expanded": false }}
    >
      <SearchBarResults data-panel="" open id="search-results">
        <ShortList />
      </SearchBarResults>
    </Bar>
  ),
  suspense: () => <Suspended />,
  "suspense, given id": () => <Suspended id="search-results" />,
  docs: Docs,
};

// Rendered after the composition, so its layout effect runs after the bars'
// in the commit that hydrates them. It reads their wiring in a microtask
// queued from there: after the updates their layout effects schedule, which
// React renders before it gives the browser back, so before any paint.
function Probe() {
  useBeforePaint(() => {
    queueMicrotask(() => (window.painted = wiring()));
  }, []);
  return null;
}

// The composition `name`, which says once React has committed it
export function Page({ name }) {
  const Composition = compositions[name];
  useEffect(() => void window.ready.push(name), [name]);
  return (
    <div className="p-4">
      <Composition />
      <Probe />
    </div>
  );
}

/**
 * How each bar on the page wires its input: its `aria-expanded`, and what its
 * `aria-controls` names. That's "nothing" when it has none, "panel" or
 * "listbox" when it names that bar's panel or listbox, else `#` and the id.
 * @returns {Record<string, { expanded: string | null, controls: string }>}
 */
export function wiring() {
  const bars = {};
  for (const bar of document.querySelectorAll("[data-bar]")) {
    const input = bar.querySelector("input");
    const id = input.getAttribute("aria-controls");
    const named = id === null ? null : document.getElementById(id);
    bars[bar.dataset.bar] = {
      expanded: input.getAttribute("aria-expanded"),
      controls:
        id === null
          ? "nothing"
          : named && named === bar.querySelector("[data-panel]")
            ? "panel"
            : named && named === bar.querySelector('[role="listbox"]')
              ? "listbox"
              : `#${id}`,
    };
  }
  return bars;
}

/**
 * Where the input of the bar `name` points `aria-activedescendant`: "none"
 * when it has none, "option" when it names an option inside the element its
 * `aria-controls` names, else `#` and the id
 * @param {string} name
 */
export function activeDescendant(name) {
  const input = document.querySelector(`[data-bar="${name}"] input`);
  const id = input.getAttribute("aria-activedescendant");
  if (id === null) return "none";
  const active = document.getElementById(id);
  const controlled = document.getElementById(
    input.getAttribute("aria-controls") ?? "",
  );
  return active?.getAttribute("role") === "option" &&
    controlled?.contains(active)
    ? "option"
    : `#${id}`;
}

/** Every id on the page that more than one element has */
export function duplicateIds() {
  const ids = [...document.querySelectorAll("[id]")].map(({ id }) => id);
  return [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
}

/**
 * Hydrates the server HTML of the composition `name` in `#root`
 * @param {string} name
 */
export function hydrate(name) {
  window.ready = [];
  window.hydrated = [];
  window.recoverableErrors = [];
  window.fallbacks = [];
  const root = document.getElementById("root");
  window.serverWiring = wiring();
  // The server's inputs, panels, listboxes and what its <Suspense> boundaries
  // hold, so the test can tell that hydration kept them
  window.serverNodes = [
    ...root.querySelectorAll(
      'input, [data-panel], [role="listbox"], [data-suspense]',
    ),
  ];
  // Any fallback React shows, however briefly
  new MutationObserver((records) => {
    for (const { addedNodes } of records)
      for (const node of addedNodes)
        if (node.nodeType === Node.ELEMENT_NODE)
          for (const fallback of [node, ...node.querySelectorAll("*")])
            if (fallback.matches("[data-fallback]"))
              window.fallbacks.push(fallback.dataset.fallback);
  }).observe(root, { childList: true, subtree: true });
  hydrateRoot(root, <Page name={name} />, {
    onRecoverableError: (error) => window.recoverableErrors.push(String(error)),
  });
}
