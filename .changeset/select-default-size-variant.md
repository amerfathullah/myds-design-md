---
"@amerfathullah/myds-react": patch
---

Select's `size` and `variant` are now optional and default to `small` and `outline`, as its docs say. A bare `<Select>`, as in the docs' Anatomy, now type-checks, as do `<Select size="medium">`, `<Select variant="ghost">` and `<Select multiple>`. TypeScript still accepts `null` and rejects any other name.

An omitted `size`, which plain JavaScript or a cast could already pass, now sizes the trigger's chevron and a selected item's check icon like `small`, at 16px. Before, both rendered at 20px, and an `icon` passed to SelectValue at its own size. Every other part, and every part without `variant`, already rendered like `small` and `outline`. Explicit values, `null` included, render as before.
