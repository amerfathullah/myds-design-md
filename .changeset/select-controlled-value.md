---
"@amerfathullah/myds-react": patch
---

Select's `value` now controls it, as its docs say. A pick calls `onValueChange` with the next value, but what the trigger shows, which items are checked, what SelectValue's `children` function receives and, in a single select, what a form submits change only once you pass the new `value`. Before, Select copied `value` into state of its own, so a pick showed even when the parent kept `value` as it was.

- **`value=""` clears a single select.** It shows the placeholder, puts `data-placeholder` on the trigger, checks no item and submits an empty value. Before, the select kept showing its last value, so a form library's reset didn't clear it. `value=""` also wins over `defaultValue`.
- **A `multiple` select's `onValueChange` builds on the current `value`.** With `value={["apple"]}`, picking Banana and then Cherry calls it with `["apple", "banana"]`, then `["apple", "cherry"]`. Before, it built on its own copy, so the second call passed `["apple", "banana", "cherry"]`, a selection the parent never held.
- **Uncontrolled selects are unchanged.** Without `value`, the selection starts from `defaultValue`, or from nothing, and each pick shows and calls `onValueChange`.

**If you upgrade:** code that passes `value` only as an initial value, and never updates it, now gets a select that doesn't change on a pick. Pass `defaultValue` instead.
