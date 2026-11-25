---
"@govtechmy/myds-docs": patch
"@govtechmy/myds-storybook": patch
---

The docs' Select and Dropdown pages (EN/MS) now say that a disabled `<fieldset>` around the component disables it too, with `disabled` passed to a Select's Label as well so the label dims. The Dropdown pages also say that `disabled` on `DropdownTrigger` disables the menu, warn that with `asChild` a `disabled` on the child overrides it, even `false` or `undefined`, and list `disabled` in DropdownTrigger's props. Select and Dropdown each gain a Storybook story in a disabled fieldset.
