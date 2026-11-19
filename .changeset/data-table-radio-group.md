---
"@amerfathullah/myds-react": minor
"@amerfathullah/myds-style": patch
"@govtechmy/myds-docs": patch
---

DataTable's radio selection is now one radio group per table, so it's one Tab stop, keeps the arrow keys inside the table and submits its selected row with a form. A new `selection.name` names the form field. Disabled radios now look as the library's Radio does.

- **One Tab stop per table.** The row radios share one `name`, so Tab stops on the selected row, or on the first row that can be selected while none is selected, instead of on every row. That includes a selected row that has since been made unselectable, in React 18 as well as 19. "Clear selection" stays a Tab stop of its own while a row is selected.
- **The arrow keys stay in the table.** They move between the table's selectable rows and select each one, wrapping at the ends. In Chromium, they used to move into, and select a row in, the next radio DataTable or any other unnamed radio on the page. `onSelectionChange` is still called with `[]` on mount, and now once for each actual change, never again with unchanged ids, for example when the selected row is clicked again.
- **New `selection.name`.** Inside a `<form>`, the table submits its selected row as `<name>=<row id>`, e.g. `pegawai=b` with `selection={{ id_by: "id", mode: "radio", name: "pegawai" }}`. Without `name`, or with an empty one, each table gets a name of its own from `useId()`. Make it unique within its form. Nothing is submitted while no row is selected, or once the selected row can no longer be selected, because a disabled radio isn't submitted. `checkbox` mode ignores `name`. Before, a radio DataTable submitted nothing.
- **"Clear selection" is `type="button"`.** Inside a form, it clears the selection without submitting. Before, it submitted the form, and when it was the form's first submit button, Enter in a text field submitted through it, clearing the selection first.
- **Disabled looks match Radio.** A selected row that can no longer be selected keeps `primary-600` at 30%, round, with its dot. Before, it painted almost the page's colour, so you couldn't tell which row was selected. A row that can't be selected is `bg-washed` at full opacity in its `otl-gray-200` border, instead of fading to 30%. An unselected radio no longer draws its dot in the page's colour.
- **No warning.** The radios select on their change event, so React no longer logs "You provided a `checked` prop to a form field without an `onChange` handler" for each row, in the browser or on the server.
- **No radio `id`.** The row radios no longer render the bare row id as their `id`, which repeated across tables. Their `value` is still the row id.

`full.css` gains `checked:before:bg-bg-white`, `disabled:not-checked:bg-bg-washed` and `has-[:disabled]:has-[:checked]:opacity-30`, and loses `has-[:disabled]:opacity-30`, which nothing else used. DataTable also drops `has-[:disabled]:has-[:checked]::bg-primary-600` and `before:contents-['']`, which generated no CSS; the pinned columns' edge shadows are unchanged.

The docs (EN/MS) describe the radio column's single Tab stop and arrow keys, `selection.name` and what a form submits.
