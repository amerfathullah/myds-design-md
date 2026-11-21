---
"@amerfathullah/myds-react": patch
"@govtechmy/myds-docs": patch
---

`PaginationPrevious` and `PaginationNext` with `asChild` now change the page, and are disabled on the first and last page, as they are without `asChild`. Before, your element got neither. A button child did nothing when clicked and stayed enabled on every page. A link child followed its own `href`, with no disabled state on the first or last page.

- **The page change.** A click on your element calls `onPageChange` with `page - 1` or `page + 1`. Your element's own `onClick` runs first, and calling `event.preventDefault()` in it keeps the page. On the other pages, a link both calls `onPageChange` and follows its `href`.
- **The disabled state.** On the first page for `PaginationPrevious`, or the last for `PaginationNext`, a `<button>`, or a MYDS `Button` that isn't itself `asChild`, gets `disabled`. Any other element, such as a link or a router's `Link`, gets `aria-disabled="true"`, and its click is prevented, so it doesn't navigate. A `disabled` or `aria-disabled` you pass the part, or set on your element, wins.
- **No name or classes.** `asChild` still adds no name, and adds no classes.

With or without `asChild`:

- **Your `onClick` runs, then the page changes.** An `onClick` you pass `PaginationPrevious` or `PaginationNext` now runs before the page change, instead of replacing it. Call `event.preventDefault()` in it to stay on the page.
- **No pages.** `PaginationNext` is now disabled when there are no pages, such as with `count={0}`. Before, it was enabled and did nothing.

The props types don't change.

**If you upgrade:**

- An `onClick` on `PaginationPrevious` or `PaginationNext` that calls `onPageChange` itself now runs alongside the built-in page change, so `onPageChange` is called twice, and a functional updater such as `(p) => p - 1` moves two pages. Remove that `onClick`, or call `event.preventDefault()` in it to keep only your own.
- A disabled link is only `aria-disabled`, with its click prevented. Middle-click, "open in new tab" and "copy link" still use its `href`, so on the first and last page, point the `href` somewhere sensible, such as the current page, or leave it out.

The docs (EN/MS) say what `asChild` keeps and that it adds no name or classes, and show an `asChild` example. Their manual-assembly example no longer passes `PaginationPrevious` and `PaginationNext` an `onClick`, which would now change the page twice.
