---
"@amerfathullah/myds-react": patch
---

Select's `open` now controls it, as its types say. Each request to open or close the list calls `onOpenChange` with the state it asks for, and the list changes only once you pass the new `open`. Before, Select kept its own copy of the open state, so the list opened and closed whatever `open` said.

- **The requests that call `onOpenChange`.** To open: a click or press on the trigger, and Enter, Space, ArrowDown or ArrowUp on the focused trigger. To close: Escape, a press outside the list, the window's blur or resize, releasing outside the list a press that started on the trigger, and, in a single select, a pick.
- **`defaultOpen` now applies from the first render, server render included.** Before, the server HTML and the first render showed the list closed, and it opened only after mount.
- **A `multiple` select now closes with Escape, and on the window's blur or resize, and calls `onOpenChange(false)` whenever it closes.** Escape returns focus to the trigger, so a keyboard user can leave the list. Before, only a press outside closed it, and that didn't call `onOpenChange`. It still stays open after a pick, which calls no `onOpenChange`.
- **Select no longer logs Radix's warnings** "Select is changing from controlled to uncontrolled" and "Select is changing from uncontrolled to controlled", which every Select without `open` logged in development.

A single select without `open` or `defaultOpen` works as before: each request shows at once and calls `onOpenChange`. The props types don't change.

**If you upgrade:** code that passes `open` only as an initial value, and never updates it from `onOpenChange`, now gets a list that doesn't open or close. Pass `defaultOpen` instead.
