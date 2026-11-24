---
"@amerfathullah/myds-react": minor
"@govtechmy/myds-docs": patch
---

SearchBarInput's `aria-expanded` and `aria-controls` now follow the results parts mounted in its SearchBar, so the input says it's expanded only while a list of results is displayed, and its `aria-controls` never names a missing id (#204, #369). Before, cmdk set `aria-expanded="true"` on the input in every state, over an `aria-expanded` you passed. Its `aria-controls` named the results panel, `SearchBarResults`, whether or not one was mounted, and never the listbox. A SearchBar with no SearchBarResults, as in the docs' Size, Clear Button and Hint examples, pointed its input at an id that doesn't exist, which axe reports as `aria-valid-attr-value`. And since `aria-controls` never named the listbox, axe didn't treat it as the input's popup, so the docs' scrolling list failed `scrollable-region-focusable`.

- **`aria-controls` names the listbox while a `SearchBarResultsList` is mounted,** even in a closed panel, else the `SearchBarResults` panel, else nothing. ARIA requires a combobox's `aria-controls` to name its popup, and the listbox holds the options the input's `aria-activedescendant` names.
- **`aria-expanded` is `"true"` only while a list is displayed.** A list is displayed unless the `SearchBarResults` around it is closed, so a `SearchBarResultsList` with no `SearchBarResults` counts as displayed. With no `aria-controls` or `aria-expanded` of your own, the input:
  - with nothing mounted, is collapsed and has no `aria-controls`;
  - with a panel and no list, open or closed, is collapsed and names the panel, so an open panel showing only "No results found" leaves it collapsed;
  - with a list in a closed panel, is collapsed and names the listbox;
  - with a list in an open panel, or a list with no panel, is expanded and names the listbox.
- **An `id` you pass `SearchBarResults`** still renders on the panel. The input names it while no list is mounted, the listbox once one mounts, and your `id` again after the list unmounts.
- **Your values win.** An `aria-controls` or `aria-expanded` you pass `SearchBarInput` reaches the `<input>` unchanged in every state; cmdk used to replace your `aria-expanded` with `"true"`. Pass an `aria-controls` with an `aria-expanded`, since an expanded combobox must name its popup.
- **Server rendering.** Server-rendered HTML has the input collapsed, with no generated `aria-controls`, until the page hydrates; an `aria-controls` or `aria-expanded` you pass still renders. Hydration matches it without a warning, and the input then takes the values above before the browser paints.
- **Re-renders.** The input follows each panel or list mounting, unmounting, opening and closing before the browser paints, at the cost of at most one extra React commit. Typing that doesn't mount or unmount the list costs none.

Nothing changes visually: the same elements and classes render. The props and ref types are the same, and typing, ArrowDown, ArrowUp and Enter calling a result's `onSelect` work as before while a list is displayed. The keys change while no list is displayed in the entry for #398, Home and End in the entry for #399, and the keys that reached the hidden `--` option in the entry for #205.

**If you upgrade:**

- **Tests, CSS or scripts that expect `aria-expanded="true"` on the input** now see `"false"` while no list is displayed: with no panel or list, with a closed panel, with an open panel that has no list, and in server-rendered HTML.
- **Tests or scripts that find the panel through the input's `aria-controls`** now find cmdk's listbox while a `SearchBarResultsList` is mounted, and nothing while neither a panel nor a list is. Pass your own `id` to `SearchBarResults` and select the panel by it.
- **Several copies of the library.** A SearchBar doesn't count the `SearchBarResults` or `SearchBarResultsList` of an older copy of the library, such as a second bundled copy in module federation, so with only those, its input reports collapsed. Render a SearchBar's parts from one copy.

The docs (EN/MS) say that the input points `aria-controls` at `SearchBarResults`' `id` only while no `SearchBarResultsList` is mounted.
