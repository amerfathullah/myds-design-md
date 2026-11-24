// The page search-bar-keys.test.mjs renders in Chromium: SearchBars composed
// as the docs compose them, each input named by its `aria-label`, one bar to
// a composition. Above the bar are a paragraph, to click outside it, and a
// plain <input>, to compare the caret with and to Shift+Tab to. The
// compositions are:
// - "form, no panel": a bar in a <form>, with an input and a search button
//   that submits;
// - "form, closed list": the same, with a closed panel holding a list;
// - "form, no list": the same, with an open panel showing only "No results
//   found";
// - "form, open list": the same, with an open panel holding a list;
// - "escape closes": an open panel holding a list, which Escape in the input
//   closes;
// - "docs": the docs' Controlled Component example, the panel open while the
//   input has focus and a query, the list mounted while the query matches;
// - "open only" and "open only, uncontrolled": the docs' example with a
//   controlled and an uncontrolled input, the panel open while focus is in
//   the bar and there's a query, and the list mounted only while it's open.
//   Only the controlled one has a clear button.
// Each result chosen is pushed to `window.chosen`, each clear or search
// button pressed to `window.pressed`, and each submit counted in
// `window.submitted`. In a form, the search button is the submit button, so
// Enter's implicit submission presses it. `render` renders a composition, and pushes its name
// to `window.ready` once React has committed it. The test bundles this file
// with esbuild, for the browser as `searchBarKeys`.
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

// The people whose name holds `query`, as the docs match them
const matching = (query) =>
  people.filter((person) =>
    person.name.toLowerCase().includes(query.toLocaleLowerCase()),
  );

// A result as the docs' examples render one. Choosing it pushes its name to
// `window.chosen`.
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

// A list of the first three people
const ShortList = () => (
  <SearchBarResultsList>
    {people.slice(0, 3).map((person) => (
      <Result key={person.name} {...person} />
    ))}
  </SearchBarResultsList>
);

// An uncontrolled bar in a <form> whose submits are counted, with a search
// button that submits it, and `children` after the input
const FormBar = ({ children }) => (
  <form
    onSubmit={(event) => {
      event.preventDefault();
      window.submitted += 1;
    }}
  >
    <SearchBar size="large">
      <SearchBarInputContainer>
        <SearchBarInput
          aria-label="Search by name"
          placeholder="Search by name"
        />
        <SearchBarSearchButton
          type="submit"
          data-button="search"
          onClick={() => window.pressed.push("search")}
        />
      </SearchBarInputContainer>
      {children}
    </SearchBar>
  </form>
);

// An open panel holding a list, which Escape in the input closes
function EscapeCloses() {
  const [open, setOpen] = useState(true);
  return (
    <SearchBar size="large">
      <SearchBarInputContainer>
        <SearchBarInput
          aria-label="Search by name"
          placeholder="Search by name"
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
        />
      </SearchBarInputContainer>
      <SearchBarResults open={open}>
        <ShortList />
      </SearchBarResults>
    </SearchBar>
  );
}

// The docs' Controlled Component example. Its clear and search buttons say
// when they're pressed, and its clear button empties the query.
function Docs() {
  const [hasFocus, setHasFocus] = useState(false);
  const [query, setQuery] = useState("");
  const hasQuery = query.length > 0;
  const results = matching(query);
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
        {query && (
          <SearchBarClearButton
            data-button="clear"
            onClick={() => {
              window.pressed.push("clear");
              setQuery("");
            }}
          />
        )}
        <SearchBarSearchButton
          data-button="search"
          onClick={() => window.pressed.push("search")}
        />
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

// The docs' example, its panel open while focus is in the bar and there's a
// query, and its list mounted only while the panel is open. A controlled one
// has a clear button.
function OpenOnly({ controlled }) {
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState("");
  const open = focused && query.length > 0;
  const results = matching(query);
  return (
    <SearchBar
      size="large"
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
    >
      <SearchBarInputContainer>
        <SearchBarInput
          aria-label="Search by name"
          placeholder="Search by name"
          {...(controlled ? { value: query } : {})}
          onValueChange={setQuery}
        />
        {controlled && query && (
          <SearchBarClearButton
            data-button="clear"
            onClick={() => {
              window.pressed.push("clear");
              setQuery("");
            }}
          />
        )}
        <SearchBarSearchButton
          data-button="search"
          onClick={() => window.pressed.push("search")}
        />
      </SearchBarInputContainer>
      <SearchBarResults open={open}>
        {open && !results.length && (
          <p className="text-txt-black-900 text-center">No results found</p>
        )}
        {open && results.length > 0 && (
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
  "form, no panel": () => <FormBar />,
  "form, closed list": () => (
    <FormBar>
      <SearchBarResults open={false}>
        <ShortList />
      </SearchBarResults>
    </FormBar>
  ),
  "form, no list": () => (
    <FormBar>
      <SearchBarResults open>
        <p className="text-txt-black-900 text-center">No results found</p>
      </SearchBarResults>
    </FormBar>
  ),
  "form, open list": () => (
    <FormBar>
      <SearchBarResults open>
        <ShortList />
      </SearchBarResults>
    </FormBar>
  ),
  "escape closes": EscapeCloses,
  docs: Docs,
  "open only": () => <OpenOnly controlled />,
  "open only, uncontrolled": () => <OpenOnly controlled={false} />,
};

// The composition `name`, below a paragraph and a plain <input>, which says
// once React has committed it
function Page({ name }) {
  const Composition = compositions[name];
  useEffect(() => void window.ready.push(name), [name]);
  return (
    <div className="flex flex-col gap-4 p-4">
      <p data-test="outside">Outside the bar</p>
      <input
        data-test="plain"
        aria-label="Plain text field"
        className="border-otl-gray-200 rounded-md border px-3 py-2"
      />
      <Composition />
    </div>
  );
}

/**
 * Renders the composition `name` in `#root`
 * @param {string} name
 */
export function render(name) {
  window.ready = [];
  window.chosen = [];
  window.pressed = [];
  window.submitted = 0;
  createRoot(document.getElementById("root")).render(<Page name={name} />);
}

// The marker on SearchBarResultsList's hidden `--` option
const NOTHING = "data-nothing-highlighted";

/**
 * The bar's state:
 * - `active` and `listbox`: the value of the option its input's and its
 *   listbox's `aria-activedescendant` name, or null for none;
 * - `selected`: the value of the option cmdk has selected, "--" while
 *   nothing is highlighted, or null with no list;
 * - `expanded`: its input's `aria-expanded`;
 * - `shown`: the results its list shows while it's displayed;
 * - `value`: its input's text, and `focus`, what has focus;
 * - `problems`: what's wrong with the `aria-activedescendant`s. Each must
 *   name an option in the page that's selected, isn't the hidden `--`, and
 *   is inside a displayed list in the bar, and the listbox's must be the
 *   input's.
 */
export function state() {
  const bar = document.querySelector("[cmdk-root]");
  const input = bar.querySelector("[cmdk-input]");
  const listbox = bar.querySelector("[cmdk-list]");
  const displayed = !!listbox?.checkVisibility();
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
    if (option.hasAttribute(NOTHING)) return problem("is the hidden --");
    const list = option.closest("[cmdk-list]");
    if (!list || !bar.contains(list) || !list.checkVisibility())
      return problem("isn't in a displayed list in the bar");
    return option.getAttribute("data-value");
  };
  const active = named(input, "the input");
  const fromListbox = named(listbox, "the listbox");
  if (
    listbox &&
    listbox.getAttribute("aria-activedescendant") !==
      input.getAttribute("aria-activedescendant")
  )
    problems.push(
      `the listbox names ${listbox.getAttribute("aria-activedescendant")}, the input ${input.getAttribute("aria-activedescendant")}`,
    );
  const focused = document.activeElement;
  return {
    active,
    listbox: fromListbox,
    selected:
      listbox
        ?.querySelector('[cmdk-item][aria-selected="true"]')
        ?.getAttribute("data-value") ?? null,
    expanded: input.getAttribute("aria-expanded"),
    shown: displayed
      ? [...listbox.querySelectorAll(`[cmdk-item]:not([${NOTHING}])`)].map(
          (option) => option.getAttribute("data-value"),
        )
      : [],
    value: input.value,
    focus:
      focused === input
        ? "input"
        : (focused?.dataset.button ??
          focused?.dataset.test ??
          focused?.tagName.toLowerCase()),
    problems,
  };
}
