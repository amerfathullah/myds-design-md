---
"@amerfathullah/myds-react": minor
"@govtechmy/myds-docs": patch
"@govtechmy/myds-storybook": patch
---

SearchBarInput is now named by its own `aria-labelledby`, then its own `aria-label`, then SearchBar's `label`. Before, SearchBar's `label` beat an `aria-label` on SearchBarInput, and cmdk replaced an `aria-labelledby` on SearchBarInput with its own. An `aria-label` named the input in Chromium, but not under dom-accessibility-api, which Testing Library uses.

- **The first name given wins.** That's SearchBarInput's `aria-labelledby`, then its `aria-label`, then SearchBar's `label`, which cmdk renders in a visually hidden `<label>`. An `undefined`, empty or blank value counts as not passed, so a wrapper that forwards `aria-label={undefined}` leaves SearchBar's `label` naming the input.
- **There is no default name.** ADR-0008's Scope gives a form control the author names no default. With none of the three, the input has no accessible name, and its placeholder doesn't name it either, so name every search input, for example `aria-label="Cari nama"`.
- **A visible Label takes an `id`, not `htmlFor`.** cmdk owns the input's `id` and finds the input by it, so an `id` you pass SearchBarInput doesn't reach the `<input>`, and a Label's `htmlFor` names nothing. Give the Label an `id` and pass it to SearchBarInput's `aria-labelledby`, as for the date pickers: `<Label id="search-by-name">Search by name</Label>` with `<SearchBarInput aria-labelledby="search-by-name" />`. Clicking the Label doesn't focus the input.
- **SearchBarInput takes no `asChild` (#206).** It always renders its own `<input>` through cmdk's `asChild`, so `asChild` is no longer in its props type. An untyped `asChild={false}` used to crash the render, and is now ignored.
- **Nothing else changes.** Typing, ArrowDown, ArrowUp, Enter calling a result's `onSelect`, `aria-controls`, `aria-describedby` and refs work as before, and server-rendered HTML carries the name before the page hydrates. Nothing changes visually.

**If you upgrade:**

- **Passing both SearchBar's `label` and SearchBarInput's `aria-label`** now names the input by the `aria-label`, not the `label`.
- **An `aria-labelledby` on SearchBarInput** now reaches the input, instead of being replaced by cmdk's.
- **SearchBarInput's `aria-label` now names the input under Testing Library too,** so tests can find it with, for example, `getByRole("combobox", { name: "Cari nama" })`.
- **`asChild` is no longer in SearchBarInput's type.** Remove it where you pass it.

The docs (EN/MS), Storybook and the docs site's icon search now name every search input. The docs add an example with a visible Label, and document SearchBar's `label`, for example `label="Cari nama"`.
