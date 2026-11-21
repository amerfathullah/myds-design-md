---
"@amerfathullah/myds-react": patch
"@govtechmy/myds-docs": patch
---

DataTable's header and body cells no longer render an `id`. Two DataTables on one page now repeat no id, and a table no longer takes an id such as `name` or `email` from the page around it.

- **Which ids.** Each header cell rendered TanStack's header id, which is the column id for most headers, such as `name`, `_radio` or `_checkbox`. Each body cell rendered its cell id, `<row id>_<column id>`, such as `0_name`, `a__radio` or `0.0_email`. These were unique only within one table, so two tables with the same column ids repeated them, in every selection mode and with `nest`. A row id with a space, such as an `id_by` value of "Aminah binti Yusof", also gave an id that isn't valid HTML.
- **They took an app's ids.** The first element with an id wins, so after a table with `name` and `email` columns, `<input id="email">` lost its `<label for="email">` and had no accessible name, and a section with `aria-labelledby="name"` was named "Name", by the table's header.
- **Nothing read them.** Each header is still named by its own label, whose id comes from `useId()`, and radio selection keeps its `useId()` group name. `TableHead` and `TableCell` still render an `id` you pass them when you use Table directly. Nothing changes visually.
- **Several React roots.** The ids DataTable still renders come from `useId()`. A page that server-renders and hydrates several separate React roots, such as islands, should give each root its own `identifierPrefix` (in `hydrateRoot` and the matching server render), or tables in different roots can still share ids.

**If you upgrade:** selectors such as `#name`, `[id="0_name"]` and `[id="a__radio"]` no longer match. Select cells by position, role or text instead.

The docs' naming example (EN/MS) no longer says each table on a page needs column ids of its own.
