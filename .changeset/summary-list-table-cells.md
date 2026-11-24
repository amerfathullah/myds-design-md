---
"@amerfathullah/myds-react": patch
"@amerfathullah/myds-style": patch
---

`SummaryListTerm` and `SummaryListAction` now lay out as table cells, so `colSpan` and `rowSpan` work on them, and a row without a detail lays out as a table. Both were `display: flex`, so the browser wrapped each in an anonymous cell that ignored their spans:

- **An action with `colSpan={2}`** filled only its own column, and left the next one empty. It now spans both.
- **A term with `rowSpan={2}`** spanned one row. The next row's detail moved into the term column, which grew to most of the list's width. The term now spans both rows, and the detail stays in its column.
- **A term with `colSpan={2}`** spanned one column, and its row's action rendered under it. The term now spans both columns, with the action beside it.
- **A row with a term and an action but no detail** rendered the action under the term. The action now takes the next column, beside the term. That's the detail's column, so give the action `colSpan={2}` to line its buttons up with other rows' actions.
- **A row with two actions, or two terms,** stacked them in one column. Each now takes a column of its own. To stack buttons as before, put them in one action, in your own `<div className="flex flex-col items-end gap-3">`. To stack terms, put them in one term, in your own `<div className="flex flex-col items-start gap-6">`.

Each part now lays its children out in a flex row inside its cell, as the cell itself used to, so lists look as before, in both themes and in right-to-left pages. That includes terms holding icons or several elements, and terms that wrap. The term is still a `<th scope="row">`, and the accessibility tree doesn't change. No props or types change.

**If you style the children through `SummaryListTerm` or `SummaryListAction`:** `className` and the other props still go on the `<th>` or `<td>`, but the children now sit in a `<div>` inside it. So these no longer reach them:

- flex classes such as `gap-2`, `items-center` or `justify-start`;
- classes and page styles that select the cell's direct children, such as `space-x-2`, `*:mr-2`, `[&>svg]:size-5` or `td > button`.

Put them on your own wrapper, e.g. `<SummaryListAction><div className="flex gap-2">…</div></SummaryListAction>`. To move an action's buttons off the right edge, give your wrapper `flex-1` too, e.g. `<div className="flex flex-1 justify-start">`.

The `<div>` changes a few other things:

- Content you add with `before:` or `after:`, such as a required field's `after:content-['*']`, now sits outside the `<div>`, on a line of its own. Put it on your own element inside, e.g. `<SummaryListTerm><span className="flex after:content-['*']">Full name</span></SummaryListTerm>`.
- A term always holds the `<div>`, so `:empty` and `empty:` classes no longer match an empty term. An action with no children, or only `null`, `undefined`, booleans or `""`, as in `{canEdit && <EditButton />}`, is still an empty cell. But an action whose children render nothing, such as an empty fragment or a component that returns `null`, now holds the `<div>`, so they no longer match it either: put the condition in the action, as above.
- A class or page style that selects the `div`s in a list, such as `[&_div]:py-0.5` on `SummaryListBody`, now selects these too. Select your own elements by class instead.

**Don't change the term's or the action's own `display`**, e.g. with `flex`, `block` or `line-clamp-2`. A cell that isn't `table-cell` loses its spans again, and the class lays out the cell around the `<div>`, not the children, so `line-clamp-2` no longer clamps a term. Put such classes on your own element inside. To hide an action on small screens, use `hidden sm:table-cell`. `hidden sm:flex` still looks as it did, but costs the action its spans. An action you already made a table cell, with `table-cell` or `hidden sm:table-cell`, now lays its buttons out like any other action: in a row, against its end edge, on the row's first line. Before, each button sat on a line of its own, against the start edge, in the row's middle.

**If you set a width or a height on `SummaryListTerm` or `SummaryListAction`:** it now sizes a table cell, not a box inside one. The detail takes all the width the other columns' minimums leave, so a fixed width such as `w-64` or `style={{ width: 250 }}` no longer widens a column, and `w-0` no longer squeezes an action's buttons. Use a minimum width instead, e.g. `min-w-[250px]`, which works before and after this change. A percentage width such as `w-1/3`, which did nothing before, now sizes the term's column. A height such as `h-12` now sets its row's minimum height, and `min-h-*` and `max-h-*` do nothing: to size a box, put the height on your own element inside, less the cell's padding, e.g. `h-6` in a term or `<div className="flex h-9">` around an action's buttons for the old `h-12`. An empty term or action with `h-12` or `min-h-12` no longer pushes the rest of its row down.

**Classes and page styles that act on a table cell now act on the term and the action as cells**, as they already did on the detail:

- A background, a border or a click handler covers the cell's full height, and borders join the table's. They used to cover only a box the height of the content.
- `align-top` and `align-middle` now place the cell's content in its row.
- A rule such as `td { vertical-align: middle }` now reaches the action, and `th { vertical-align: middle }` the term, whenever it beats their own `align-baseline` class: with `!important`, outside a cascade layer, in a layer declared after Tailwind's, or in Tailwind's utilities layer with a stronger selector, as `[&_td]:align-middle` on `SummaryListBody` has, or with an equal one that Tailwind puts later, as `*:align-middle` on a row has. It moves the action's buttons, or the term's text, from the row's first line to its middle: leave them out of it, e.g. `:is(th, td):not(.align-baseline)`.
- An empty term or action with tall vertical padding, e.g. `py-4` or a page rule `td { padding: 16px }`, no longer pushes its row's text down as far. An empty action, like any empty table cell, takes no part in its row's baseline, so its padding can only make the row taller. An empty term holds the `<div>`, so its top padding still counts toward the row's baseline, but its bottom padding no longer does.

Text read with `innerText`, or copied from the same selection, changes in its whitespace only. It gains tabs between some cells, but a line break still separates the term, the detail and an action with children, so unlike a plain table's, a row doesn't read or copy as one tab-separated line. An empty action, like any empty cell, adds no line break of its own, so a `SummaryListAddition` after one can join the line before it. Each cell's own text doesn't change.

`full.css` in `@amerfathullah/myds-style` gains `align-baseline`.
