---
"@amerfathullah/myds-react": patch
---

A `multiple` Select now tells assistive technology which options are selected. Before, it drew each pick as checked but marked every option not selected, because Radix's Select, which it's built on, holds a single value.

- **Each option carries `aria-selected` matching the selection**, from `defaultValue` or `value` and after every pick, whichever option has focus. It always agrees with the option's `data-state`.
- **The list carries `aria-multiselectable="true"`**, so it's announced as a list where more than one option can be picked.
- **The Checkbox in each item is decorative.** It's no longer a separate unnamed, focusable checkbox inside the option, so each option is announced once, by its text and whether it's selected. A press on the Checkbox still picks or unpicks the item, and now leaves focus on the option, so the arrow keys carry on from there.

The Checkbox looks the same, checked, unchecked and disabled. Only the square itself changes: a pointer over it no longer shows Checkbox's own hover colour or pointer cursor, and a press on it no longer leaves Checkbox's focus ring on it. Keyboard and pointer picks work as before, and single selects are unchanged.
