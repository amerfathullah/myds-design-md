---
"@amerfathullah/myds-react": patch
---

SelectHeader and SelectFooter now pass every prop and their ref to their `div`, as their types say. Before, they kept only `className` and `children`, so anything else you gave them never reached the page, and nothing was logged.

- **Attributes land on the `div`.** `id`, `role`, `aria-*`, `data-*`, `title`, `tabIndex` and `style` now render on the header's or footer's `div`, so you can give the region a role, a name or a description, or point `aria-labelledby` or `aria-describedby` at it by `id`. `className` still merges after the part's own classes.
- **Event handlers run.** `onClick`, `onKeyDown` and the other handlers now run when the `div` gets the event. Before, only SelectContent's handlers saw it, by bubbling.
- **The ref gets the `div`.** An object or callback ref now receives the header's or footer's `div`, under React 18 and 19, so you can measure it. Before, an object ref stayed `null` and a callback ref was never called.

Without extra props, the header, the footer and every other part of Select render the same markup as before, and the props types don't change.
