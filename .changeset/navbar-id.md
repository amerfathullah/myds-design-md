---
"@amerfathullah/myds-react": patch
"@govtechmy/myds-docs": patch
---

An `id` you pass `Navbar` now reaches its `<header>` without breaking the mobile menu (#216). The mobile menu finds the header by its id, to open below it. Navbar gave the header a generated id, and yours replaced it, so the menu found no header. Below `xl:` (1280px), it then opened in the top-left corner, only as wide as its content and with no overlay, and the sticky header covered its first item: a tap there landed on the header, and keyboard focus there was hidden behind it.

- **Your `id` wins.** A non-empty `id` you pass `Navbar` is rendered on the `<header>`, and the mobile menu finds the header by it. The menu opens below the header, at its full width, over its overlay, as it does with no `id`. Adding or removing the `id` on a mounted Navbar keeps the menu there.
- **An empty or undefined `id` counts as none.** With `id={undefined}` or `id=""`, the `<header>` now gets the generated id. Before, it had no id, or an empty one.

The generated id comes from React's `useId()`, so don't rely on its format. Server-rendered HTML doesn't change with no `id` or with a non-empty one. The props, types and classes don't change.

The docs (EN/MS) list `id` on `Navbar`.
