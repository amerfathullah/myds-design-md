---
"@amerfathullah/myds-react": patch
"@govtechmy/myds-docs": patch
---

NavbarMenuItem with `asChild` now renders your element through Link, as `<Link asChild>` does. Before, the element got a stray `underline` attribute and none of Link's classes. `<NavbarMenuItem asChild href="#x"><a href="#x">About</a></NavbarMenuItem>` rendered `<a href="#x" underline="none" class="w-full">`. HTML doesn't define an `underline` attribute, and React logged no warning. A router link, such as Next.js `Link`, received an `underline` prop it doesn't know and passed it on to its `<a>`.

The same item now renders `<a href="#x" class="transition-colors box-decoration-clone focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-fr-primary no-underline text-inherit decoration-inherit w-full truncate px-2.5 py-1.5 rounded-md" target="_self">`, the same element an item without `asChild` renders.

- **No `underline`.** Your element gets no `underline` attribute, and a router link gets no `underline` prop.
- **Link's classes.** Your element now gets the same classes as an item without `asChild`, followed by any classes of its own, so it looks and focuses like the other items.
- **`target="_self"`.** Your element gets `target="_self"`, unless it sets its own `target`. Next.js `Link` keeps client-side navigation, because Next.js handles a `_self` link as a plain click.
- **Your element's own props still win.** Its own `href` and `target` beat the item's, and an element with no `href` takes the item's.

**If you set a colour on the element:** it now carries `text-inherit`, as it already does under `<Link asChild>`. A colour class on it, such as `text-gray-700` or an arbitrary colour, may now lose to `text-inherit`, since Link doesn't merge classes and the stylesheet's order decides. Put the colour on a `<span>` inside the element instead. The element also carries `transition-colors`, as the other items do, including under reduced motion.

**If you put MYDS `<Link asChild>` between the item and your router link,** as a workaround, remove it. The item now does what the workaround did. Left in, it underlines the link: Link underlines by default, and the item no longer passes it `underline="none"`. To keep it, pass it `underline="none"` yourself.

The props types don't change, and an item without `asChild` renders as before.

The docs (EN/MS) now document `asChild` in the `NavbarMenuItem` props table.
