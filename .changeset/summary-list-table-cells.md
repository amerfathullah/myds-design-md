---
"@amerfathullah/myds-react": patch
"@amerfathullah/myds-style": patch
---

`SummaryListTerm` and `SummaryListAction` lay out as table cells again, so `colSpan` and `rowSpan` work on them, and a row without a detail lays out as a table. Both were `display: flex`, so the browser wrapped each in an anonymous cell that ignored their spans:

- **An action with `colSpan={2}`** filled only its own column, and left the next one empty. It now spans both.
- **A term with `rowSpan={2}`** spanned one row. The next row's detail moved into the term column, which grew to most of the list's width. The term now spans both rows, and the detail stays in its column.
- **A term with `colSpan={2}`** spanned one column, and its row's action rendered under it. The term now spans both columns, with the action beside it.
- **A row with a term and an action but no detail** rendered the action under the term. The action now takes the next column, beside the term.

Each part now lays its children out in a flex row inside its cell, as the cell itself used to, so lists look as before, in both themes and in right-to-left pages. That includes terms holding icons or several elements, and terms that wrap. The term is still a `<th scope="row">`, and the accessibility tree doesn't change. No props or types change.

**If you pass flex classes to `SummaryListTerm` or `SummaryListAction`:** `className` and the other props still go on the `<th>` or `<td>`, but the children now sit in a wrapper inside it, so flex classes such as `gap-2`, `items-center` or `justify-start` no longer reach them. Put them on your own wrapper, e.g. `<SummaryListAction><div className="flex gap-2">…</div></SummaryListAction>`. To move an action's buttons off the right edge, give your wrapper `flex-1` too, e.g. `<div className="flex flex-1 justify-start">`. Don't change the cell's own `display` (e.g. with `flex` or `block`): a cell that isn't `table-cell` loses its spans again.

**If you set a width on `SummaryListTerm` or `SummaryListAction`:** it now sizes a table cell, not a box inside one. The detail takes all the width the other columns' minimums leave, so a fixed width such as `w-64` or `style={{ width: 250 }}` no longer widens a column, and `w-0` no longer squeezes an action's buttons. Use a minimum width instead, e.g. `min-w-[250px]`, which works before and after this change. A percentage width such as `w-1/3`, which did nothing before, now sizes the term's column.

**Other classes and page styles that act on a table cell now reach the term and the action too**, as they already reach the detail. A background or border fills the cell's full height and joins the table's borders; it used to cover only a box the height of the content. `align-top` and `align-middle` now place the cell's content in its row. A page rule such as `td { vertical-align: middle }` now reaches the action when it has `!important` or sits outside a cascade layer, and moves its buttons from the row's first line to its middle: leave the action out of it, e.g. `td:not(.align-baseline)`.

`full.css` in `@amerfathullah/myds-style` gains `align-baseline`.
