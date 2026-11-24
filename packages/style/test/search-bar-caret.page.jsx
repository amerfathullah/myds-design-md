// The page search-bar-caret.test.mjs renders in Chromium: a SearchBar
// composed as the docs' Controlled Component example composes it, beside a
// plain <input type="text">. Query parameters, not focus and the query, pick
// what the bar holds: `results` is "open" or "closed" for a SearchBarResults,
// or "none" for no panel, and `list` is "1" for a SearchBarResultsList of the
// docs' first three people, shown whatever the query, in the panel if there
// is one, else directly in SearchBar. An open panel with no list says "No
// results found". `vim=off` turns cmdk's vimBindings off.
//
// SearchBar's onKeyDown pushes each key it gets to `window.authorKeys`, with
// its currentTarget and target, whether the browser marks it trusted, whether
// it reads as cancelled, and the input's selection as it ran. It cancels the key while `window.cancelKeys` is
// true. A keydown listener on window, in the bubble phase, pushes each key,
// and whether it got there cancelled, to `window.keydowns`, then cancels
// Alt+Home, which can open the browser's home page. Neither pushes a modifier
// key pressed on its own. Each result chosen is pushed to `window.chosen`.
// The test bundles this file with esbuild, for the browser as
// `searchBarCaret`.
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

window.ready = [];
window.chosen = [];
window.authorKeys = [];
window.keydowns = [];
window.cancelKeys = false;

// The first three of the docs' notable Malaysians
const people = [
  ["Michelle Yeoh", "Internationally acclaimed actress"],
  ["P. Ramlee", "Iconic actor, director, and musician"],
  ["Siti Nurhaliza", "Award-winning singer and songwriter"],
].map(([name, note]) => ({ name, note }));

const modifiers = ["Control", "Alt", "Shift", "Meta"];

// A key as Playwright names it: its modifiers in this order, then the key,
// such as "Control+Shift+Home"
const keyName = (event) =>
  [
    event.ctrlKey && "Control",
    event.altKey && "Alt",
    event.shiftKey && "Shift",
    event.metaKey && "Meta",
    event.key,
  ]
    .filter(Boolean)
    .join("+");

// "root" for the bar's cmdk root <div>, "input" for its input, else the tag
const which = (element) =>
  element.matches('div[cmdk-root][data-bar="caret"]')
    ? "root"
    : element.matches('input[data-test="input"]')
      ? "input"
      : element.tagName.toLowerCase();

window.addEventListener("keydown", (event) => {
  if (modifiers.includes(event.key)) return;
  window.keydowns.push({
    key: keyName(event),
    cancelled: event.defaultPrevented,
  });
  if (event.altKey && event.key === "Home") event.preventDefault();
});

// A result as the docs' example renders one
const Result = ({ name, note }) => (
  <SearchBarResultsItem
    value={name}
    onSelect={() => void window.chosen.push(name)}
  >
    <span className="bg-primary-50 text-txt-primary rounded-full p-px">
      <UserIcon className="size-4" />
    </span>
    <p className="line-clamp-1 flex-1">
      {name} <span className="text-txt-black-500 text-xs">{note}</span>
    </p>
    <ChevronRightIcon />
  </SearchBarResultsItem>
);

function Page() {
  const params = new URLSearchParams(location.search);
  const results = params.get("results") ?? "none";
  const [hasFocus, setHasFocus] = useState(false);
  const [query, setQuery] = useState("");
  useEffect(() => void window.ready.push("page"), []);
  const list = params.get("list") === "1" && (
    <SearchBarResultsList className="max-h-[400px] overflow-y-scroll">
      {people.map((person) => (
        <Result key={person.name} {...person} />
      ))}
    </SearchBarResultsList>
  );
  return (
    <div className="flex flex-col gap-4 p-4">
      <input
        type="text"
        data-test="plain"
        aria-label="Plain text"
        className="border-otl-gray-200 rounded-md border px-3 py-2"
      />
      <SearchBar
        data-bar="caret"
        size="large"
        {...(params.get("vim") === "off" ? { vimBindings: false } : {})}
        onKeyDown={(event) => {
          if (modifiers.includes(event.key)) return;
          const field = document.querySelector('[data-test="input"]');
          window.authorKeys.push({
            key: keyName(event),
            currentTarget: which(event.currentTarget),
            target: which(event.target),
            trusted: event.nativeEvent.isTrusted,
            prevented: event.defaultPrevented,
            caret: [field.selectionStart, field.selectionEnd],
          });
          if (window.cancelKeys) event.preventDefault();
        }}
        onBlur={(e) => {
          const blurredByChild = e.currentTarget.contains(e.relatedTarget);
          if (blurredByChild) return;
          setHasFocus(false);
        }}
      >
        <SearchBarInputContainer>
          <SearchBarInput
            data-test="input"
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
        {results === "none" ? (
          list
        ) : (
          <SearchBarResults data-panel="" open={results === "open"}>
            {list || (
              <p className="text-txt-black-900 text-center">No results found</p>
            )}
          </SearchBarResults>
        )}
      </SearchBar>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<Page />);
