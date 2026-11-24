// The page search-bar-highlight.test.mjs renders in Chromium: one SearchBar
// to a composition, its input named by its `aria-label`. The compositions
// are:
// - "keys": an open panel holding a list of three people, always shown, in a
//   bar with no `value` or `defaultValue` and cmdk's vim bindings on. Its
//   options say whether the bar has `loop`, and whether its input is
//   controlled;
// - "names": the composition search-bar-names.page.jsx renders: a controlled
//   input, the panel open and the list of the same three people mounted only
//   while there's a query;
// - "docs": the docs' Controlled Component example, as
//   search-bar-wiring.page.jsx renders it, with its 16 people: the panel open
//   while the input has focus and a query, the list mounted while the query
//   matches.
// A hidden element has the `bg-bg-washed` class a highlighted result takes,
// so the test can read that background. Each result chosen is pushed to
// `window.chosen`. `render` renders a composition, and pushes its name to
// `window.ready` once React has committed it. The test bundles this file
// with esbuild, for the browser as `searchBarHighlight`.
import { useEffect, useState, version } from "react";
import { createRoot } from "react-dom/client";

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
import { ChevronRightIcon, UserIcon } from "../../react/src/icons";

export { version };

// search-bar-names.page.jsx's three people
const three = ["Tunku Abdul Rahman", "Tun Abdul Razak", "Tun Hussein Onn"];

// The first of the docs' notable Malaysians, as search-bar-wiring.page.jsx
// lists them
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

// A plain result, which pushes its name to `window.chosen` when chosen
const Item = ({ name }) => (
  <SearchBarResultsItem value={name} onSelect={() => window.chosen.push(name)}>
    {name}
  </SearchBarResultsItem>
);

// A result as the docs' examples render one, which pushes its name to
// `window.chosen` when chosen
const Result = ({ name, note }) => (
  <SearchBarResultsItem value={name} onSelect={() => window.chosen.push(name)}>
    <span className="bg-primary-50 text-txt-primary rounded-full p-px">
      <UserIcon className="size-4" />
    </span>
    <p className="line-clamp-1 flex-1">
      {name} <span className="text-txt-black-500 text-xs">{note}</span>
    </p>
    <ChevronRightIcon />
  </SearchBarResultsItem>
);

// The three people, always shown, in a bar with `loop` or without, and a
// controlled input or an uncontrolled one
function Keys({ loop = false, controlled = false }) {
  const [query, setQuery] = useState("");
  return (
    <SearchBar {...(loop ? { loop } : {})}>
      <SearchBarInputContainer>
        <SearchBarInput
          aria-label="Search by name"
          placeholder="Search by name"
          {...(controlled ? { value: query, onValueChange: setQuery } : {})}
        />
      </SearchBarInputContainer>
      <SearchBarResults open>
        <SearchBarResultsList>
          {three.map((name) => (
            <Item key={name} name={name} />
          ))}
        </SearchBarResultsList>
      </SearchBarResults>
    </SearchBar>
  );
}

// search-bar-names.page.jsx's composition
function Names() {
  const [query, setQuery] = useState("");
  const hasQuery = query.length > 0;
  return (
    <SearchBar>
      <SearchBarInputContainer>
        <SearchBarInput
          aria-label="Search by name"
          placeholder="Search by name"
          value={query}
          onValueChange={setQuery}
        />
      </SearchBarInputContainer>
      <SearchBarResults open={hasQuery}>
        {hasQuery && (
          <SearchBarResultsList>
            {three.map((name) => (
              <Item key={name} name={name} />
            ))}
          </SearchBarResultsList>
        )}
      </SearchBarResults>
    </SearchBar>
  );
}

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
      <SearchBarResults open={hasQuery && hasFocus}>
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

const compositions = { keys: Keys, names: Names, docs: Docs };

// The composition `name` with `options`, which says once React has
// committed it
function Page({ name, options }) {
  const Composition = compositions[name];
  useEffect(() => void window.ready.push(name), [name]);
  return (
    <div className="p-4">
      <div data-probe="highlight" className="bg-bg-washed hidden" />
      <Composition {...options} />
    </div>
  );
}

/**
 * Renders the composition `name` with `options` in `#root`
 * @param {string} name
 * @param {object} [options]
 */
export function render(name, options = {}) {
  window.ready = [];
  window.chosen = [];
  createRoot(document.getElementById("root")).render(
    <Page name={name} options={options} />,
  );
}

// The marker on SearchBarResultsList's hidden `--` option
const NOTHING = "data-nothing-highlighted";

/**
 * The bar's state:
 * - `selected`: the value of each option cmdk marks selected, "--" for the
 *   hidden `--`;
 * - `highlighted`: the value of the highlighted result: the option cmdk
 *   marks selected, other than the hidden `--`, in a displayed list. Null
 *   for none;
 * - `visible`: whether the highlighted result is visible, by
 *   `checkVisibility`. Null with none;
 * - `washed`: the value of each displayed result whose background is the
 *   one `bg-bg-washed` gives;
 * - `input` and `listbox`: the value of the option the input's and the
 *   listbox's `aria-activedescendant` name. Null for none, or with no
 *   listbox;
 * - `problems`: what's wrong with those `aria-activedescendant`s. Each must
 *   name an element in the page that's an option, is selected, isn't the
 *   hidden `--`, and is inside a displayed list in the bar. The listbox's
 *   must be the input's, and the input's must be the highlighted result,
 *   or none while nothing is highlighted.
 */
export function state() {
  const bar = document.querySelector("[cmdk-root]");
  const input = bar.querySelector("[cmdk-input]");
  const listbox = bar.querySelector("[cmdk-list]");
  const value = (option) =>
    option.hasAttribute(NOTHING) ? "--" : option.getAttribute("data-value");
  const displayed = (option) => {
    const list = option.closest("[cmdk-list]");
    return !!list && bar.contains(list) && list.checkVisibility();
  };
  const selected = [
    ...bar.querySelectorAll('[cmdk-item][aria-selected="true"]'),
  ];
  const highlight = selected.find(
    (option) => !option.hasAttribute(NOTHING) && displayed(option),
  );
  const washed = getComputedStyle(
    document.querySelector("[data-probe=highlight]"),
  ).backgroundColor;

  const problems = [];
  // The value of the option `element` names, checking it
  const named = (element, what) => {
    const id = element?.getAttribute("aria-activedescendant");
    if (id == null) return null;
    const option = document.getElementById(id);
    const problem = (why) => {
      problems.push(`${what} names #${id}, which ${why}`);
      return `#${id}`;
    };
    if (!option) return problem("isn't in the page");
    if (option.getAttribute("role") !== "option")
      return problem("isn't an option");
    if (option.getAttribute("aria-selected") !== "true")
      return problem("isn't selected");
    if (option.hasAttribute(NOTHING)) return problem("is the hidden `--`");
    if (!displayed(option))
      return problem("isn't inside a displayed list in the bar");
    return value(option);
  };
  const fromInput = named(input, "the input");
  const fromListbox = named(listbox, "the listbox");
  const inputId = input.getAttribute("aria-activedescendant");
  const describe = (id) => (id === null ? "nothing" : `#${id}`);
  if (listbox && listbox.getAttribute("aria-activedescendant") !== inputId)
    problems.push(
      `the listbox names ${describe(listbox.getAttribute("aria-activedescendant"))}, the input ${describe(inputId)}`,
    );
  const highlighted = highlight ? value(highlight) : null;
  if (inputId !== (highlight?.id ?? null))
    problems.push(
      `the input names ${describe(inputId)}, but ${highlighted ?? "nothing"} is highlighted`,
    );

  return {
    selected: selected.map(value),
    highlighted,
    visible: highlight ? highlight.checkVisibility() : null,
    washed: [...bar.querySelectorAll(`[cmdk-item]:not([${NOTHING}])`)]
      .filter(
        (option) =>
          option.checkVisibility() &&
          getComputedStyle(option).backgroundColor === washed,
      )
      .map(value),
    input: fromInput,
    listbox: fromListbox,
    problems,
  };
}

/**
 * The background `bg-bg-washed` gives, and the open panel's
 */
export function backgrounds() {
  const panel = document.querySelector("[cmdk-list]").parentElement;
  return {
    washed: getComputedStyle(document.querySelector("[data-probe=highlight]"))
      .backgroundColor,
    panel: getComputedStyle(panel).backgroundColor,
  };
}
