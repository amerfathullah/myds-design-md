---
"@amerfathullah/myds-react": patch
"@govtechmy/myds-docs": patch
---

Several SearchBars can now share a page. Each SearchBar generates its own id for its results panel, `SearchBarResults`, so its input's `aria-controls` names only its own bar's results. Before, every SearchBar rendered `id="search-input"` on its panel and `aria-controls="search-input"` on its input. Two SearchBars on one page, such as a header search beside a page search, duplicated the id, and both inputs pointed at the first bar's panel.

- **Your `id` wins.** An `id` you pass `SearchBarResults` is now rendered, and that bar's input points at it while no `SearchBarResultsList` is mounted. SearchBar used to overwrite it.
- **Your `aria-controls` wins.** An `aria-controls` you pass `SearchBarInput` now reaches the `<input>`. SearchBar used to overwrite it with `search-input`.
- **What the input names.** Its `aria-controls` names cmdk's listbox while a `SearchBarResultsList` is mounted, else the panel, else nothing, as the entry for #204 and #369 describes.
- **Server rendering.** Server-rendered HTML has the input collapsed, with no generated `aria-controls`, until the page hydrates, and it hydrates without a warning (#204, #369).

The generated id comes from React's `useId()`, so don't rely on its format; it differs between React 18 and 19. Nothing changes visually: the same elements and classes render.

**If you upgrade:** update tests, CSS or scripts that select `#search-input`. Pass your own `id` to `SearchBarResults` and select that instead.

The docs (EN/MS) list `id` on `SearchBarResults`.
