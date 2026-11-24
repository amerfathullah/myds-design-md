---
"@amerfathullah/myds-react": minor
---

SearchBar's keys act on the results only while a list of results is displayed, and only when pressed in the input (#398). Before, cmdk handled ArrowDown, ArrowUp, Home, End, Enter and Ctrl+N/J/P/K for every key pressed anywhere in the bar, whether or not any results were shown. A closed `SearchBarResults` hid its results, but the arrow keys still moved through them and Enter chose one. cmdk also cancelled Enter every time, so a SearchBar inside a `<form>` never submitted it, and Enter on the clear and search buttons didn't press them.

- **While no list is displayed,** the input works as a plain text field. That's with no `SearchBarResultsList`, or with one in a closed `SearchBarResults`: the same state in which the input reports `aria-expanded="false"`. The arrow keys, Home, End, Enter and Ctrl+N/J/P/K leave cmdk's selection where it was, Enter chooses no result and submits a surrounding form, and Home and End move the caret.
- **On the clear and search buttons,** and anywhere else in the bar outside the input, cmdk's keys reach the button. Enter presses it, and never chooses a result.
- **While a list is displayed,** the keys pressed in the input work as before: ArrowDown, ArrowUp, Alt+ArrowDown, Alt+ArrowUp and Ctrl+N/J/P/K move the highlight, and Enter chooses the highlighted result. The entry for #205 stops them moving it onto the hidden `--` option, and the entry for #399 makes Home and End edit the text.
- **`aria-activedescendant` names the highlighted result, or nothing.** On the input and on the listbox, it names the result that's highlighted in a displayed list, and nothing while no result is highlighted or no list is displayed. Before, cmdk worked it out before the results re-rendered, and never again when the list mounted again, so it could name a result that was no longer highlighted, the hidden `--` option, or an option that no longer existed. Server-rendered HTML has none.
- **Your `onKeyDown` on SearchBar** still runs first, once per key, with SearchBar's root as its `currentTarget`, and its `preventDefault` stops cmdk.
- **SearchBarResultsList's hidden `--` option** now carries `data-nothing-highlighted`. It's how nothing is highlighted until the person moves into the results.
- **cmdk is pinned to exactly `1.1.1`.** SearchBar now relies on how cmdk 1.1.1 handles keys and selection, which cmdk doesn't document (ADR-0015). A cmdk release reaches SearchBar only once this library moves the pin.

**If you upgrade:**

- **A key SearchBar keeps from cmdk** reads as cancelled to React `onKeyDown` handlers above SearchBar, as it did when cmdk cancelled it, but its `isDefaultPrevented()` is `false`. Listeners added with `addEventListener`, on `document` or `window` for example, now see it uncancelled, since the browser acts on it.
- **A SearchBar inside a `<form>`** now submits it on Enter while no list is displayed. If you called `form.requestSubmit()` from an `onKeyDown` that cancelled Enter, you can drop it.
- **An older copy's `SearchBarResultsList`** inside this copy's SearchBar doesn't count as displayed, so cmdk's keys don't reach its results. Render a SearchBar's parts from one copy.
- **A cmdk of your own** that isn't 1.1.1 is a second copy. Raw cmdk parts and `useCommandState` from your copy don't see SearchBar's state.
