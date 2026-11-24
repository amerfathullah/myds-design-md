---
"@amerfathullah/myds-react": patch
"@govtechmy/myds-docs": patch
---

The 26 parts of Masthead, Navbar, DateField, TimeField, Spinner, Breadcrumb, Pagination, Radio and SearchBar that didn't forward their refs now do, so a ref on them works on React 18. That includes a ref a library attaches: react-hook-form's `register()` on a `DateField` now moves focus to it after a failed submit, and a `SearchBarSearchButton` inside a Radix trigger with `asChild`, such as `DialogTrigger` or `TooltipTrigger`, gets focus back when the dialog closes and anchors its tooltip. Before, React 18 dropped the ref: an object ref stayed `null` and a callback ref was never called. In development React warned "Function components cannot be given refs"; in production it said nothing. React 19 already passed the ref on, and still does.

Each ref is the element the part renders, the one its props go on:

- **Masthead:** `Masthead`'s is its `<div id="masthead">`, not the collapsible around it. `MastheadHeader`'s and `MastheadSection`'s are their `<div>`, `MastheadTitle`'s its `<p>`, `MastheadTrigger`'s its `<button>`, and `MastheadContent`'s its `<div>`.
- **Navbar:** `Navbar`'s is its `<header>`, `NavbarLogo`'s its `<a>`, `NavbarMenuItem`'s its `<li>`, and `NavbarAction`'s the menu toggle's `<button>`, not the `<div>` around it.
- **DateField and TimeField:** the `<input>`, not the frame around it, which `className` styles.
- **Spinner:** its outer `<div>`. With `show={false}` it renders nothing, so the ref gets no element.
- **BreadcrumbSeparator** and **PaginationEllipsis:** their `<li>` and `<span>`.
- **Radio:** `RadioItem`'s is its `<div>`, `RadioLabel`'s its `<label>`, and `RadioHintText`'s its `<div>`.
- **SearchBar:** `SearchBarInputContainer`'s, `SearchBarHint`'s and `SearchBarResults`' are their `<div>`, and `SearchBarSearchButton`'s and `SearchBarClearButton`'s their `<button>`. `SearchBarResultsList`'s, `SearchBarResultsGroup`'s and `SearchBarResultsItem`'s are cmdk's `role="listbox"`, `role="presentation"` and `role="option"` elements.

Nothing else changes. The parts render the same markup, and their props types are the same. Each export's type is now a `ForwardRefExoticComponent` over those props, and code that assigns one to its old `FunctionComponent` type still compiles. `SearchBar` and `SearchBarInput`, which already forwarded their refs, are typed the same way now. Every SearchBar part has a `displayName`, so React's developer tools show its name.

The docs (EN/MS) say each part forwards its `ref`, and which element it is where that isn't the obvious one.
