---
"@amerfathullah/myds-react": patch
"@govtechmy/myds-docs": patch
---

`SummaryList`, `SummaryListBody`, `SummaryListRow`, `SummaryListTerm`, `SummaryListDetail`, `SummaryListAction` and `SummaryListAddition` now forward their refs, so a ref on them works on React 18. Before, React 18 dropped it: an object ref stayed `null` and a callback ref was never called. In development React warned "Function components cannot be given refs"; in production it said nothing. React 19 already passed the ref on, and still does.

Each ref is the element the part renders: the list's `<div>`, the body's `<table>` (not the `<tbody>` inside it), the row's `<tr>`, the term's `<th>`, and the detail's, the action's and the addition's `<td>`. `SummaryListHeader` already forwarded its ref.

Nothing else changes. The parts render the same markup, and their props types are the same. Each export's type is now a `ForwardRefExoticComponent` over those props, as Table's parts are, and code that assigns one to its old `FunctionComponent` type still compiles.

The docs (EN/MS) say each part forwards its `ref`, and that `SummaryListBody`'s is its `<table>`.
