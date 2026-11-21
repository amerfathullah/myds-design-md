# DataTable truncates only widenable columns, at every width

DataTable came from upstream deciding once, at mount, which columns truncate: those whose top-level entry in `columns` has an `id` (#192). A column is widenable when it's a leaf column with `meta.expandable`, which gives it a widen button, but that played no part.
- So a column with an `id` but no widen button hid its text behind an ellipsis that nothing could reveal.
- A widenable column defined without an `id`, inside a grouped header or added after mount showed all its text. It changed nothing on its first widen press and truncated on its second.

The design guideline mentions hidden text only for its "Expand column button" (the widen button), which "expands the column horizontally, revealing longer descriptions". So truncation follows widenability. DataTable works out which columns are widenable on every render, however they're defined. Only a widenable column truncates, and only until it's widened. Every other column wraps, at every width.

- **Every width.** A collapsed widenable column truncates on phones too. #193 made the widen button show and work at every width and by touch, so a tap reveals the text. W3C's Understanding document for WCAG 2.2 SC 1.4.10 (Reflow) accepts truncation where "a mechanism is provided on the web page to reveal the truncated content".
- **230px caps the text, not the column.** The 230px stays a `max-width` on the cell. On a `<td>` that caps only the content. So a collapsed column is at least 230px wide while its text is longer, or as wide as its text if that's shorter, and takes its share of spare width like any column.
- **Widened.** A widened column stays on one line from `md:` up and wraps below `md:`. So on a phone, widening a collapsed column narrows it and wraps its text. The docs' grouped Name column goes from 230px, clipped, to 79.6px on 6 lines at 390px. That's a Divergence from the guideline's "expands the column horizontally", which DESIGN.md's Known Gaps is to record.

Figures are from Chromium 153, on `main` (`718464e`) and on prototypes of this change; #192's triage has the setups.

## Considered Options

- **Columns that can't be widened stay on one line from `md:` up**, as DataTable's `md:whitespace-nowrap` had them: rejected. Truncating every column with an `id` had hidden what that does to long text in those columns.
  - Without the truncation, a long column becomes one 2,316px line.
  - A pinned table with one renders 2,688px wide against its 480px inline width (the `width` DataTable sets from TanStack's `getTotalSize()`), and a column's `size` can't change that.
- **Every column wraps, widened ones too**: rejected. Widening would narrow a column wherever the table is short of room: 230px to 150px in the docs' Pinned Columns preview at 768 and 1280px.
- **Truncate only from `md:` up**: rejected. On a phone the widen button #193 shows would change nothing while its `aria-pressed` says it did. That's the symptom #192 reported, and #193's touch test fails.
- **Truncate only from `md:` up, and hide the widen button below `md:`**: rejected. That undoes #193, failing 6 of its 11 Chromium tests. It also contradicts the guideline's "Always shown in a column that can expand, so keyboard and touch users can reach it too".
- **A hard 230px cap**, truncating an element inside the cell so the column is exactly 230px: rejected.
  - It hides text there's room for. At 1280px it cuts the docs' "Bob 'With A Very Long Middle Name' Smith" while a column of "Success" tags gets 315px.
  - It pushes short widenable columns up to 230px, and does nothing for phones.
  - It adds an element to every collapsed cell. The form that sizes the column to that element instead clips a focused button's ring on three sides rather than one (#284).
- **Widened columns on one line at every width**: rejected. On a phone a widened cell would be as wide as its text: 1,134px for a 152-character remark in a 358px scroll wrapper. Reading one cell would take sideways scrolling, which DataTable's own `whitespace-normal` below `md:` avoids.

## Consequences

- A column with an `id` and no `meta.expandable` no longer truncates. An author who wants it truncated sets `meta.expandable: true`, which also gives it a widen button.
- Widenable columns defined without an `id`, inside a grouped header or added after mount now start truncated. A phone table with long text in them scrolls sideways at rest: the docs' grouped example goes from 358px to 545px wide at 390px.
- A long column that can't be widened makes its rows taller rather than the table wider. In a pinned table, one with no `size` can be squeezed to its longest word, so give it a `size`.
- Group and placeholder header cells, and their footer cells, never truncate and never copy a leaf column's state. A group column isn't widenable, so its `meta.expandable` gives it no widen button.
- The change ships as a minor release of `@amerfathullah/myds-react`, as CookieBanner's and Callout's did (ADR-0009, ADR-0010). DataTable's props and types don't change, and the old behaviour was a Defect (#192). Its changeset's "If you upgrade:" note covers the first two consequences.
- Prose says **widen** for a column (see `CONTEXT.md`) and keeps "expand" for nested rows. `meta.expandable` keeps its name.
