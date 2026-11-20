// The page search-bar-names.test.mjs renders in Chromium: a SearchBar
// composed as the docs compose it, whose results list is mounted only while
// there's a query. Query parameters pick how the input is named: `label` is
// SearchBar's `label`, `aria-label` is SearchBarInput's, and `labelledby`
// renders a Label with that text, which SearchBarInput's `aria-labelledby`
// points at. `id` is SearchBarInput's `id`. Each result chosen is pushed to
// `window.chosen`. The test bundles this file with esbuild.
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import { Label } from "../../react/src/components/label";
import {
  SearchBar,
  SearchBarInput,
  SearchBarInputContainer,
  SearchBarResults,
  SearchBarResultsItem,
  SearchBarResultsList,
} from "../../react/src/components/search-bar";

window.ready = [];
window.chosen = [];

const people = ["Tunku Abdul Rahman", "Tun Abdul Razak", "Tun Hussein Onn"];

// The props a query parameter gives, or none when it isn't in the URL
const param = (params, name, prop = name) =>
  params.has(name) ? { [prop]: params.get(name) } : {};

function Page() {
  const params = new URLSearchParams(location.search);
  const labelledBy = params.get("labelledby");
  const [query, setQuery] = useState("");
  const hasQuery = query.length > 0;
  useEffect(() => void window.ready.push("page"), []);
  return (
    <div className="p-4">
      {labelledBy !== null && <Label id="nama">{labelledBy}</Label>}
      <SearchBar {...param(params, "label")}>
        <SearchBarInputContainer>
          <SearchBarInput
            data-test="input"
            placeholder="Search by name"
            value={query}
            onValueChange={setQuery}
            {...param(params, "aria-label")}
            {...param(params, "id")}
            {...(labelledBy === null ? {} : { "aria-labelledby": "nama" })}
          />
        </SearchBarInputContainer>
        <SearchBarResults open={hasQuery}>
          {hasQuery && (
            <SearchBarResultsList>
              {people.map((name) => (
                <SearchBarResultsItem
                  key={name}
                  value={name}
                  onSelect={() => window.chosen.push(name)}
                >
                  {name}
                </SearchBarResultsItem>
              ))}
            </SearchBarResultsList>
          )}
        </SearchBarResults>
      </SearchBar>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<Page />);
