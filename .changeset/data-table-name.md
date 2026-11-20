---
"@amerfathullah/myds-react": minor
"@govtechmy/myds-docs": patch
"@govtechmy/myds-storybook": patch
---

DataTable's `<table>` can now be named. DataTable takes `aria-label` and `aria-labelledby`. Before, both type-checked in JSX, but DataTable dropped them without a warning, so no DataTable could be named, and screen reader users couldn't tell two tables on a page apart.

- **They name the `<table>`.** Point `aria-labelledby` at a visible heading above the table, for example `<h2 id="pemohon">Senarai pemohon</h2>` with `aria-labelledby="pemohon"`. Where the page shows no title for the table, use `aria-label`, for example `aria-label="Senarai pemohon"`. If you pass both, `aria-labelledby` wins, as usual. The name holds while `loading` and with no rows, and server-rendered HTML carries it.
- **There is no default name.** ADR-0008's English defaults are for controls with no text of their own, and a table's name describes your data. Without either prop, the table has no name, as before, and DataTable logs no warning.
- **Only the `<table>` gets them.** Neither reaches the scroll wrapper or any other element. `className` still styles the scroll wrapper, as on Table. DataTable still takes no `caption`, `id`, `title` or children, so name a table with a heading and `aria-labelledby` rather than a `TableCaption`.
- **Nothing changes visually.**

**If you upgrade:** a non-string `aria-label` or `aria-labelledby` on DataTable, which TypeScript used to accept, is now a type error.

The docs (EN/MS) add a section on naming the table, with a live example whose heading names it through `aria-labelledby`, and `aria-label` and `aria-labelledby` rows in DataTable's props. The page's main example names its table. Every DataTable story in Storybook names its table.
