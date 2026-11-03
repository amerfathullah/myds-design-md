---
"@amerfathullah/myds-react": minor
"@govtechmy/myds-docs": patch
---

DataTable's sort and widen buttons now always show, so keyboard, screen reader and touch users can sort and widen columns, and they have names. They didn't render below 1024px, and from 1024px up they stayed invisible, and out of the tab order, until the pointer hovered their header or the column was sorted or widened.

- **Always shown.** In a `sortable` column the sort button shows, and in an `expandable` column the widen button shows. They show at rest, at every screen width, on touch screens too, whether or not the column is sorted or widened. Tab stops on each one, and focus stays on it after every press, including the one that clears a sort or collapses a column. They look as they did when their header was hovered.
- **Names.** The sort button is named "Sort by {header}" and the widen button "Widen {header}", where {header} is the text the column's header renders, whether `header` is a string, a function or left out. A header that renders no text gives "Sort column" and "Widen column". The names stay the same whether the column is sorted or widened. The column's new `meta.sortLabel` and `meta.widenLabel` replace the whole name in your site's language, for example `sortLabel: "Isih mengikut Jawatan"` and `widenLabel: "Lebarkan Nama"`. These options never reach the DOM. The icons inside the buttons are hidden from assistive technology.
- **State.** The primary sort column's header, the first in the sort, has `aria-sort="ascending"` or `aria-sort="descending"`. The other columns in a Shift+click multi-sort have none. The widen button has `aria-pressed`, `"true"` while its column is widened.
- **`type="button"`.** Both buttons are `type="button"`, so a sort or widen press no longer submits a form around the table.
- **Column header names.** Each column header is named by its text alone, not by the buttons and tooltip trigger inside it. Screen readers announced a header with a tooltip as "Age Tooltip", and the checkbox selection column's as "Select Select all rows"; they now announce "Age" and "Select". The ids these names use come from `useId`, so they don't repeat across tables.
- **No dead sort button.** A `sortable` column without an accessor, which can't sort, no longer renders a sort button that did nothing.

Sorting itself doesn't change: a text column sorts ascending first and a number column descending first, and a third press clears the sort.

The docs (EN/MS) say the buttons always show, give their default names, document `meta.sortLabel` and `meta.widenLabel` with Malay examples, and say a sorted header sets `aria-sort`. The design guideline's Table page says the expand and sort column buttons are always shown.
