---
"@govtechmy/myds-docs": patch
"@govtechmy/myds-storybook": patch
---

The docs' DatePicker and DateRangePicker pages (EN/MS) now say that `true` disables the whole picker, and any other Matcher, or an array of Matchers, only the days it matches, and that a disabled `<fieldset>` around the picker disables it too, with `disabled` passed to its Label as well so the label dims. Both pickers' `disabled` descriptions in Storybook say the same.
