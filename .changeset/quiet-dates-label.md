---
"@amerfathullah/myds-react": patch
"@govtechmy/myds-docs": patch
---

`DateField` no longer renders a hardcoded `id="date-field"`; its calendar icon is now decorative (`aria-hidden`) and no longer adds an English-only "Select date" to the input's accessible name. Name the field with a `Label` (`htmlFor`) and pass the matching `id`. If you targeted `#date-field` (e.g. `<label htmlFor="date-field">`), pass `id="date-field"` explicitly.
