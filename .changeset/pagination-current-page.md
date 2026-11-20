---
"@amerfathullah/myds-react": patch
"@govtechmy/myds-docs": patch
---

Pagination's current page button now carries `aria-current="page"`, so screen readers announce which page is current. Before, it differed from the other page buttons only by its `bg-washed-active` fill, which in light barely stands out from its surface, and was announced like every other page.

- **AutoPagination** marks its current page with `type="default"`, with no new prop. `type="simple"` and `type="full"` render no page buttons and are unchanged.
- **PaginationNumber.** The one whose `number` is the `Pagination`'s `page` renders `aria-current="page"`. The others render no `aria-current` attribute.
- **Your `aria-current` wins.** An `aria-current` you pass `PaginationNumber`, such as `"step"` or `false`, replaces the default, and `aria-current={undefined}` removes it. The fill still follows the current page, whatever `aria-current` says.
- **Nothing else changes.** Nothing changes visually, the current page's button stays enabled, and the accessible names are unchanged: "page N", your `pageLabel`, or your `aria-label`.

**If you upgrade:** if you added "current" to `pageLabel`, or to a `PaginationNumber`'s `aria-label`, so screen readers would announce the current page, remove it. Screen readers now announce it from `aria-current`, so they would say it twice.

The docs (EN/MS) say the current page's button carries `aria-current="page"` and that an `aria-current` on `PaginationNumber` replaces it.
