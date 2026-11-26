---
"@govtechmy/myds-docs": patch
"@govtechmy/myds-storybook": patch
---

The docs' Radio pages (EN/MS) now say that a disabled `<fieldset>` around the Radio disables its items too, with their labels and hints dimmed, and that `disabled` on a RadioButton disables just that option, as on its RadioItem. They also say that RadioHintText is marked `aria-disabled` when its RadioButton is disabled, but not in a disabled fieldset. Radio gains two Storybook stories in a disabled fieldset, one light and one dark.
