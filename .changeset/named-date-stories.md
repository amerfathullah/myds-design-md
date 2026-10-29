---
"@govtechmy/myds-storybook": patch
---

The DateField stories name the field with an `aria-label` arg, as the TimeField stories do, so they pass the accessibility check. The DateField docs page's usage example pairs the field with a `Label` (`htmlFor` and a matching `id`), imports `DateField` by name and reads the date from the change event.
