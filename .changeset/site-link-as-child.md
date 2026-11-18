---
"@amerfathullah/myds-react": patch
"@govtechmy/myds-docs": patch
---

SiteLink with `asChild` now renders your element through Link, as a SiteLink without `asChild` does. Before, the element got none of Link's classes, so on hover it only changed colour, at once, and didn't underline like the other footer links. In a `SiteLinkGroup`, `<SiteLink asChild><a href="#s2">Two</a></SiteLink>` rendered `<a href="#s2" class="hover:text-txt-black-900 line-clamp-1 lg:col-span-full text-txt-black-700">`.

The same link now renders `<a href="#s2" class="transition-colors box-decoration-clone focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-fr-primary no-underline hover:underline text-inherit decoration-inherit hover:text-txt-black-900 line-clamp-1 lg:col-span-full text-txt-black-700" target="_self">`, the same element a SiteLink without `asChild` renders.

- **Link's classes.** Your element now gets the same classes as a SiteLink without `asChild`, followed by any classes of its own. It underlines on hover and its colour transitions, like the other footer links.
- **`target="_self"`.** Your element gets `target="_self"`, unless it sets its own `target`. Next.js `Link` keeps client-side navigation, because Next.js handles a `_self` link as a plain click.
- **SiteLink's props work with `asChild`.** Your element takes SiteLink's `href` unless it has its own. Before, SiteLink dropped its `href`, so an element with none wasn't a link. `newTab` now gives `target="_blank"`, `primary` the primary text colour, and `underline` Link's underline style. Before, they reached your element: `underline` rendered as an attribute HTML doesn't define, `newTab` and `primary` did nothing, and React warned about `newTab` and `primary`. It no longer does.
- **Your element's own props still win.** Its own `href` and `target` beat SiteLink's.

**If you set a colour on the element outside a `SiteLinkGroup`:** it now carries `text-inherit`, as it already does under `<Link asChild>`. A colour class on it, such as `text-gray-400` or an arbitrary colour, may now lose to `text-inherit`, since Link doesn't merge classes and the stylesheet's order decides. Put the colour on a `<span>` inside the element instead. Inside a `SiteLinkGroup` the colour doesn't change, because the group's `text-txt-black-700` already applies.

**If you put MYDS `<Link asChild underline="hover">` between SiteLink and your router link,** as a workaround, you no longer need it: SiteLink now does what the workaround did. Left in, it looks the same.

The props types don't change, and a SiteLink without `asChild` renders as before.

The docs (EN/MS) now document `asChild` in the `SiteLink` props table, and show `SiteLink` with `asChild` around a Next.js `Link`.
