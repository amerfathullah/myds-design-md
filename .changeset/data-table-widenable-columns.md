---
"@amerfathullah/myds-react": minor
"@amerfathullah/myds-style": patch
"@govtechmy/myds-docs": patch
"@govtechmy/myds-storybook": patch
---

DataTable now truncates exactly its widenable columns, so a column that can't be widened shows all its text, and every widen press on clipped text reveals it (#192). DataTable used to decide once, when it mounted, from the `id` of each top-level entry in `columns`. `meta.expandable`, which adds the widen button, played no part.

- **Widenable columns.** A column is widenable when it's a leaf column with `meta.expandable: true`, however it's defined: with an `id`, with `accessorKey` alone, inside a grouped header, or added after mount. DataTable works this out on every render. Its header, body and footer cells carry `data-expanded="false"` until the column is widened, and `"true"` once it is.
- **Truncation.** A collapsed widenable column truncates its text at every width: one line, with an ellipsis where its content is text. Its cells keep `max-width: 230px`, which caps the text, not the column: the column is at least 230px wide while its text is longer, and takes its share of spare width.
- **Wrapping.** Every other column wraps, at every width, `md:` and up included, so its text shows in full and makes its rows taller rather than the table wider. A widened column stays on one line from `md:` up and wraps below `md:`.
- **Each widen press shows its result.** A widenable column defined without an `id`, inside a grouped header or added after mount showed all its text at rest, changed nothing on its first widen press and truncated on its second. It now starts truncated, and its first press reveals its text.
- **Groups.** Group and placeholder header cells, and their footer cells, never carry `data-expanded`, even where a group shares an id with one of its leaves. A group column isn't widenable, so its `meta.expandable` no longer gives it a widen button.
- **Focus rings.** A focused button that starts a cell of a column that can't be widened, such as an Edit button in an Action column, no longer loses the left side of its ring to the cell's `overflow: hidden`.

Pinned columns' offsets and widths, and the table's width, don't change.

**If you upgrade:**

- A column with an `id` and no `meta.expandable` no longer truncates. Set `meta.expandable: true` to keep it truncated, which also gives it a widen button. In a table with pinned columns, give a long column that can't be widened a `size`, or it can be squeezed to its longest word.
- Widenable columns defined without an `id`, inside a grouped header or added after mount now start truncated.

`full.css` in `@amerfathullah/myds-style` drops `md:whitespace-nowrap` and gains `md:data-[expanded=true]:whitespace-nowrap`.

The docs (EN/MS) rename "Expanding Columns" to "Widening Columns" ("Melebarkan Lajur"), say which columns truncate, how wide a collapsed column is, that other columns wrap and that a widened one wraps below `md:`, and advise giving a long column a `size` in a pinned table. They say "widen" for a column, keeping "expand" for nested rows. Storybook's PinnedColumns story gives its Action columns unique ids, so no React key repeats.
