---
"@amerfathullah/myds-react": minor
---

In SearchBarInput, Home and End now edit the text in every state, as in a plain text field, and so do Meta+ArrowUp and Meta+ArrowDown (#399). Before, cmdk cancelled them and moved to the first or last result instead, even with no results shown, so the caret never moved, and Shift+Home and Shift+End selected nothing. While results were shown, Home could move to the hidden `--` option, so the highlight disappeared (#205).

- **Which keys.** Home and End, with any modifiers or none, and Meta+ArrowUp and Meta+ArrowDown, with any other modifiers or none. They move the caret, or with Shift select to the start or end of the query, as the browser does in an `<input type="text">`.
- **In every state:** with a list displayed, a result highlighted or not, a list in a closed `SearchBarResults`, an open panel with no list, and no panel at all.
- **The highlight stays where it is.** These keys don't change which result is highlighted, or the input's and the listbox's `aria-activedescendant`, so Enter afterwards still chooses the highlighted result. That's what ArrowLeft and ArrowRight already did.
- **Reaching the first and last result.** ArrowDown from rest highlights the first result. With `loop`, ArrowUp from rest highlights the last. cmdk's Ctrl+Meta+N/J/P/K, with `vimBindings`, still jump.
- **Your `onKeyDown` on SearchBar** runs first, once per key, with SearchBar's root as its `currentTarget`, and its `preventDefault` stops the caret moving. SearchBar keeps these keys from cmdk the way it keeps the others (#398): React `onKeyDown` handlers above SearchBar read them as cancelled, as before, and listeners added with `addEventListener` see them uncancelled.

**If you upgrade:** tests or scripts that press Home or End in a SearchBar to reach the first or last result now move the caret instead. Press ArrowDown from rest for the first result.
