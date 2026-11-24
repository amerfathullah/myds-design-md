---
"@amerfathullah/myds-react": patch
"@amerfathullah/myds-style": patch
---

`SummaryListTerm` and `SummaryListAction` lay out as table cells again, so `colSpan` and `rowSpan` work on them, and a row without a detail lays out as a table. Both were `display: flex`, so the browser wrapped each in an anonymous cell that ignored their spans:

- **An action with `colSpan={2}`** filled only its own column, and left the next one empty. It now spans both.
- **A term with `rowSpan={2}`** spanned one row. The next row's detail moved into the term column, which grew to most of the list's width. The term now spans both rows, and the detail stays in its column.
- **A term with `colSpan={2}`** spanned one column, and its row's action rendered under it. The term now spans both columns, with the action beside it.
- **A row with a term and an action but no detail** rendered the action under the term. The action now takes the next column, beside the term.

Lists built as the docs build them look as before, in both themes. Each term's text starts at its cell's left edge, on the row's baseline, and an action's buttons end 12px in from its cell's right edge. In a right-to-left page, terms still start at the right and actions sit at the left. The term is still a `<th scope="row">`, and the accessibility tree doesn't change. No props or types change.

**One look changes in ordinary lists:** a term that wraps now starts each line at its cell's left edge. Its lines used to be centred, because a `<th>` centres its text by default. The detail takes the rest of the list's width, so the term column stays at its 190px minimum and any term wider than that wraps, at any width of list.

**If you pass flex classes to `SummaryListAction`:** its `className` still goes on the `<td>`, but its children now sit in a wrapper inside it, so flex classes such as `gap-2` or `justify-start` no longer reach them. Put them on your own wrapper, e.g. `<SummaryListAction><div className="flex gap-2">…</div></SummaryListAction>`. To move the buttons off the right edge, give your wrapper `flex-1` too, e.g. `<div className="flex flex-1 justify-start">`.

`full.css` in `@amerfathullah/myds-style` gains `align-baseline` and `text-start`.
