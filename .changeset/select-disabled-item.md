---
"@amerfathullah/myds-react": patch
---

SelectItem's `disabled` now disables the option, as Select's docs say, instead of only styling it. Before, SelectItem never passed `disabled` on to Radix's item, so a disabled option behaved like an enabled one.

- **It's marked unavailable.** A disabled option carries `aria-disabled="true"` and `data-disabled`, and in a select inside a `<form>`, its hidden native `<option>` is `disabled`.
- **Focus skips it.** Opening the list focuses the first enabled item. In the open list, the arrow keys, Home, End and typeahead skip a disabled option, and so does typeahead on the closed trigger. Hovering doesn't highlight it, so it keeps its disabled fill.
- **Nothing picks it.** Enter, Space, a click or a tap on a disabled option doesn't call `onValueChange` or close the list. In a `multiple` select, it can't be added to the selection, and its Checkbox shows as disabled, in Checkbox's existing disabled look.

Enabled items, `disabled={false}` and Select's own `disabled` work as before, and a disabled item keeps its classes.
