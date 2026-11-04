---
"@amerfathullah/myds-react": patch
"@govtechmy/myds-docs": patch
---

Several SearchBars can now share a page. Each SearchBar generates its own id for its results panel, `SearchBarResults`, and points its input's `aria-controls` at it. Before, every SearchBar rendered `id="search-input"` on its panel and `aria-controls="search-input"` on its input. Two SearchBars on one page, such as a header search beside a page search, duplicated the id, and both inputs pointed at the first bar's panel.

- **Your `id` wins.** An `id` you pass `SearchBarResults` is now rendered, and that bar's input points at it. SearchBar used to overwrite it.
- **Your `aria-controls` wins.** An `aria-controls` you pass `SearchBarInput` now reaches the `<input>`. SearchBar used to overwrite it with `search-input`.
- **Same target.** The input still points at the results panel, which stays mounted, not at cmdk's listbox, which the documented composition mounts only when there are results.
- **Server rendering.** Server-rendered HTML wires each input to its own panel, and hydrates without a warning. When you pass `SearchBarResults` an `id`, the server HTML still points the input at the generated id, and the input follows yours once the page hydrates.

The generated id comes from React's `useId()`, so don't rely on its format; it differs between React 18 and 19. Nothing changes visually: the same elements and classes render.

**If you upgrade:** update tests, CSS or scripts that select `#search-input`. Pass your own `id` to `SearchBarResults` and select that instead.

The docs (EN/MS) list `id` on `SearchBarResults`.
