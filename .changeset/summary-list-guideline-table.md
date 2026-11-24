---
"@govtechmy/myds-docs": patch
---

The design guideline's Summary list page (EN/MS) now describes the table markup the library uses. It said the summary list used `<dt>` and `<dd>` elements, but the library renders a `<table>`, one row per key-value pair. The key is now the row's header (`<th scope="row">`), and the value and the optional actions are cells (`<td>`). Each part's purpose, the mention of the Table component's style and the three numbered parts, which match the anatomy image, are unchanged.
