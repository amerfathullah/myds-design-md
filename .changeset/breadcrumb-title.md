---
"@amerfathullah/myds-react": patch
"@govtechmy/myds-docs": patch
---

BreadcrumbLink and BreadcrumbPage now render a `title` you pass, whatever their children. Before, a passed `title` was replaced by the crumb's children: `<BreadcrumbLink title="Go to the home page">Home</BreadcrumbLink>` rendered `title="Home"`, and with any other children, such as a `<span>`, an icon or `asChild` around a router link, it rendered `title="[object Object]"`, which screen readers read as the link's description. An icon-only crumb named only by its `title` was announced as "[object Object]".

- **Your `title` wins.** A `title` you pass renders as given, with plain text, an element, an icon, an icon plus text, `Page {n}` or no children at all.
- **The default is unchanged.** With no `title`, or a `title` of `undefined` or `null`, plain-text children still become the `title`, so a truncated crumb shows its full text on hover. Any other children still give no `title`.
- **`title=""` now turns the hover text off.** It renders an empty `title`. Before, it fell back to the crumb's text.
- **`asChild`.** A `title` on BreadcrumbLink now reaches the child it renders. A `title` on the child itself still wins over it.

The props types don't change. A workaround that put `title` on the child of an `asChild` BreadcrumbLink, rather than on BreadcrumbLink, can stay.

The docs (EN/MS) say that only a plain-text crumb shows its full text on hover, that any other crumb should be given its full text in `title`, and that an icon-only crumb is named with `aria-label`, not `title`.
