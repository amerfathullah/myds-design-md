---
"@govtechmy/myds-docs": patch
"@govtechmy/myds-storybook": patch
---

The docs and Storybook now name each summary list's table from its header, and show authors how to do the same. `SummaryListBody`'s `<table>` has no accessible name of its own, and the `SummaryListHeader` before it doesn't name it, so a screen reader user moving between a page's tables, or listing them, reached a table with no name.

- **The docs (EN/MS).** The main example gives the header an `id` and passes it to `SummaryListBody`'s `aria-labelledby`, in its code and its preview, and the `asChild` example's code does the same with its `<h3>`. A note under `SummaryListBody` says how to name the table: point `aria-labelledby` at the header's `id`, which goes on your own heading with `asChild`; use `aria-label` only when no visible title names the table; make each id with `useId()` where a list renders more than once; and don't put a `<caption>` in the body. Its example passes an `aria-label`, and its props list `aria-labelledby` and `aria-label`.
- **Storybook.** Every SummaryList story names its table from its header, with an id from `useId()`, so no id repeats on the docs page.

`@amerfathullah/myds-react` doesn't change: `SummaryListHeader` already passes `id` to its heading, and `SummaryListBody` passes `aria-label` and `aria-labelledby` to its `<table>`.
