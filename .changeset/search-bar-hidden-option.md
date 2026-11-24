---
"@amerfathullah/myds-react": patch
---

SearchBar's keys no longer move the highlight onto the hidden `--` option, so it never disappears while the person moves through the results (#205). `SearchBarResultsList` renders a hidden `--` option first, so that nothing is highlighted until the person moves into the results. cmdk's keys treated it as an ordinary option, so ArrowUp from the first result, Ctrl+P, Ctrl+K or Alt+ArrowUp from there, and with `loop` a wrap from the last result, highlighted nothing, Enter then chose nothing, and with `loop` it took an extra key to wrap.

- **No key takes the highlight back to nothing.** ArrowDown, ArrowUp, Alt+ArrowDown, Alt+ArrowUp and, with `vimBindings`, Ctrl+N/J/P/K move only through the shown results. Without `loop`, ArrowUp from the first result stays on it, and ArrowDown from the last stays on that. With `loop`, they wrap from the last result to the first and back.
- **Nothing is highlighted at rest, or after a query change,** as before. Only a query change, or the highlighted result unmounting, takes the highlight back to nothing. `useCommandState` and SearchBar's `onValueChange` still report `--` then.
- **A key pressed straight after typing into a controlled `SearchBarInput` now acts on the query just typed.** On React 18.3, cmdk took a controlled query in an effect that React rendered after the keystroke, and an ArrowDown pressed in between was undone: nothing was highlighted, and the input named the first result. A controlled value now reaches cmdk only when you set it yourself, such as from a clear button, so typing hands cmdk the query inside the keystroke, as an uncontrolled `SearchBarInput` always did. `value` and `onValueChange` mean what they did: the input shows your `value`, and `onValueChange` fires once per edit with the input's new value.
- **Your `onKeyDown` on SearchBar** still runs first, once per key, and its `preventDefault` stops cmdk.

**Known limits:**

- **On React 18.3, a query you set yourself,** such as from a clear button, still reaches cmdk after the render, so a key pressed within a few milliseconds of it can still be undone.
- **A keystroke your `onValueChange` rejects or rewrites** still reaches cmdk's query for a moment, as cmdk takes the typed text before it calls `onValueChange`. SearchBar then hands cmdk your `value`. Each of those is a query change, so a highlighted result goes back to nothing, and `useCommandState((state) => state.search)` briefly reports the text you refused. Before, cmdk's query only ever held your `value`.
