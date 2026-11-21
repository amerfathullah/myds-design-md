# DataTable truncates only widenable columns, at every width

DataTable came from upstream deciding which columns truncate once, when it mounts, from the `id` of each top-level entry in `columns` (#192). `meta.expandable`, which gives a column its widen button, played no part. So a column with an `id` but no widen button hid its text behind an ellipsis that nothing could reveal. A widenable column defined without an `id`, inside a grouped header or added after mount showed all its text, changed nothing on its first widen press and truncated on its second. The design guideline hides text only behind the expand column button, which "expands the column horizontally, revealing longer descriptions". So truncation follows widenability. A column is widenable when it's a leaf column with `meta.expandable`, however it's defined, and DataTable works out which columns those are on every render. Only a widenable column truncates, and only until it's widened. Every other column wraps, at every width.

- **Every width.** A collapsed widenable column truncates on phones too. #193 made the widen button show and work at every width and by touch, so a tap reveals the text. WCAG 1.4.10 accepts truncation where "a mechanism is provided on the web page to reveal the truncated content".
- **A soft cap.** The 230px is a `max-width` on the cell, as before. On a `<td>` that caps only the content, so a collapsed column is at least 230px wide while its text is longer, or as wide as its text if that's shorter, and takes its share of spare width like any column.
- **Widened.** A widened column stays on one line from `md:` up and wraps below `md:`. So on a phone, widening a collapsed column narrows it and wraps its text: the docs' grouped Name goes from 230px, clipped, to 79.6px on 6 lines at 390px. That's a Divergence from the guideline's "expands the column horizontally", and DESIGN.md's Known Gaps records it.

## Considered Options

- **Columns that can't be widened stay on one line from `md:` up**, as DataTable's `md:whitespace-nowrap` had them: rejected. Truncation had hidden what that did to long text. Without it, a long column becomes one 2,316px line, and a pinned table with one renders 2,688px wide against its 480px inline width, which a column's `size` can't change.
- **Every column wraps, widened ones too**: rejected. Widening would narrow a column at every width: 230px to 150px in the docs' Pinned Columns preview at 1280px.
- **Truncate only from `md:` up**: rejected. On a phone the widen button #193 shows would change nothing while its `aria-pressed` says it did, the symptom #192 reported, and #193's touch test fails. Hiding the button below `md:` as well undoes #193, failing 6 of its 11 Chromium tests, and contradicts the guideline's "Always shown in a column that can expand, so keyboard and touch users can reach it too".
- **A hard 230px cap**, truncating an element inside the cell so the column is exactly 230px: rejected. It hides text there's room for: at 1280px it cuts the docs' long name while a column of "Success" tags gets 315px. It pushes short widenable columns up to 230px, does nothing for phones, and adds an element to every collapsed cell. A focused button at the start of such a cell loses its focus ring on three sides instead of one (#284).
- **Widened columns on one line at every width**: rejected. On a phone a widened cell would be as wide as its text, 1,134px for a 152-character remark in a 358px box, so reading one cell takes sideways scrolling, which is what DataTable's own `whitespace-normal` below `md:` avoids.

## Consequences

- A column with an `id` and no `meta.expandable` no longer truncates. An author who wants it truncated sets `meta.expandable: true`, which also gives it a widen button.
- Widenable columns defined without an `id`, inside a grouped header or added after mount now start truncated. A phone table with long text in them scrolls sideways at rest: the docs' grouped example goes from 358px to 545px wide at 390px.
- A long column that can't be widened makes its rows taller rather than the table wider. In a pinned table, one with no `size` can be squeezed to its longest word, so give it a `size`.
- Group and placeholder header cells, and their footer cells, never truncate and never copy a leaf column's state.
- The change ships as a minor release of `@amerfathullah/myds-react`, as ADR-0009 and ADR-0010 set for a behaviour change whose props and types don't change. Its changeset's "If you upgrade:" note covers the first two consequences.
- Prose says **widen** for a column (see `CONTEXT.md`) and keeps "expand" for nested rows. `meta.expandable` keeps its name.
