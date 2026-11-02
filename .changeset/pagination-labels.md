---
"@amerfathullah/myds-react": minor
"@govtechmy/myds-docs": patch
---

Pagination's built-in accessible names keep their English defaults, and you can now rename each one in your site's language.

- **New label props on `AutoPagination`:** `previousLabel`, `nextLabel`, `pageLabel` and `ellipsisLabel` name the previous, next and page buttons and the ellipses it renders. With `type="default"`, `previousLabel` and `nextLabel` name the icon-only buttons and default to "previous page" and "next page". With `type="simple"` or `type="full"`, they are the buttons' visible text and default to "Previous" and "Next". `pageLabel` takes a page number and defaults to `` (page) => `page ${page}` ``, and `ellipsisLabel` defaults to "More pages". For example, `previousLabel="Halaman sebelumnya"` and ``pageLabel={(n) => `Halaman ${n}`}``. None of them reaches the DOM, and every other prop still goes to the `<nav>`. A node you pass as `previous` or `next` renders as before.
- **`aria-label` now renames the parts you render:** `PaginationPrevious`, `PaginationNext` and `PaginationNumber` overwrote an `aria-label` you passed with "previous page", "next page" and "page N". Now yours replaces the default, for example `aria-label="Halaman 3"`.
- **Children now name `PaginationPrevious` and `PaginationNext`:** with children, they get no default name, so a button showing "Sebelumnya" is named "Sebelumnya". Children with no text, such as an icon alone, need an `aria-label`. So AutoPagination's `simple` and `full` buttons are now named "Previous" and "Next", their visible text, not "previous page" and "next page".
- **The ellipsis is now announced:** `PaginationEllipsis`'s "More pages" sat inside `aria-hidden`, so screen readers skipped it. Now only its icon is hidden, and its children replace the text, for example `<PaginationEllipsis>Lebih banyak halaman</PaginationEllipsis>`.

Nothing changes visually: the same elements, classes and icons render.

The docs (EN/MS) document the default names, the new props and how to replace each name.
