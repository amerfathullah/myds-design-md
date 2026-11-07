---
"@amerfathullah/myds-react": patch
---

SelectContent now calls your `onPointerDownOutside` with Radix's event before it closes the list, as its types say. Before, SelectContent replaced it with its own close handler, so your handler was silently dropped and never ran.

- **It runs once per press outside the open list,** in single and `multiple` selects. It gets the event Radix's `Select.Content` passes: a cancelable event whose `detail.originalEvent` is the `pointerdown`.
- **Calling `event.preventDefault()` in it keeps the list open,** and `onOpenChange` isn't called with `false`, as on Radix's `Select.Content`.

Without a handler, or with one that doesn't call `preventDefault()`, a press outside closes the list as before, with the same `onOpenChange` calls. `onEscapeKeyDown`, `onCloseAutoFocus` and every other prop pass through as before, and the props types don't change.
