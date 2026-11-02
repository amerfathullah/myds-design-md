---
"@amerfathullah/myds-react": minor
"@govtechmy/myds-docs": patch
---

DataTable's built-in controls now have English default names that tell rows apart, and you can rename each one in your site's language. Screen readers announced every row's selection control as just "checkbox" or "radio".

- **Row selection controls:** each row's checkbox or radio is named "Select row N", where N numbers the rows the table shows from 1, top to bottom in the current sort, counting expanded sub-rows. The new `selection.rowLabel` renames them: a function is called with each row and returns its name, for example `` rowLabel: (row) => `Pilih ${row.original.name}` ``. A string also works, but gives every row's control the same name again.
- **More `selection` options:** `selectAllLabel` names the select-all checkbox in `checkbox` mode (default "Select all rows"). `clearLabel` names the radio column's reset button, which had no name (default "Clear selection"). `columnLabel` sets the selection column's visually hidden header, which read "selection-column" (default "Select").
- **Nested-row toggle:** `Cell.Expand`'s button is named "expand row", and the new `nest.expandLabel` renames it, as a string or a function of the row. The button now has `aria-expanded`, so screen readers say whether the row is expanded. The chevron icon no longer has a name of its own. `Cell.Expand` keeps its call signature.
- **Header tooltips:** a column's new `meta.tooltipLabel` names its tooltip's trigger (default "Tooltip"). `TableTooltip` now declares `aria-label` and sends it to its trigger, so `<TableTooltip aria-label="Maklumat">` renames it; its other props still go to the tooltip root.

These options never reach the DOM. Nothing changes visually: the same elements, classes and icons render.

The docs (EN/MS) document the new options, their defaults and `TableTooltip`'s `aria-label`, with Malay examples.
