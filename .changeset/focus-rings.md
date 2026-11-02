---
"@amerfathullah/myds-react": patch
"@amerfathullah/myds-style": patch
---

The controls below now show MYDS's focus ring on keyboard focus: a 3px `fr-primary` ring, or `fr-danger` on an invalid Input OTP. They show it only on keyboard focus, so a mouse click shows none, except on SearchBar and Input OTP, which ring while their input has focus.

- **Links.** Link, and SiteLink, NavbarMenuItem and NavbarLogo, which render it, showed only the browser's outline. They now show the ring, with or without `asChild`, and a link that wraps onto two lines has a closed ring on each line. A NavbarMenuItem's link now fills its item, so the ring outlines the rounded area its hover background fills. NavbarLogo's link no longer fills the header's height, so its ring isn't cut off at the top of the window; you click its image and name. The NavbarMenuDropdown trigger shows the ring too.
- **BreadcrumbLink** shows the ring. The one-line truncation moved from BreadcrumbItem onto the link, so the item no longer clips the ring. A long link still truncates to one line within the item's 200px.
- **Accordion.** Its trigger showed only an underline, which hover shows too. Now its item shows the ring while the trigger has keyboard focus, and the underline stays. A focused link inside the content doesn't ring the item.
- **Toast.** The close button and the toast card, which Tab reaches, showed no focus indicator at all. Both now show the ring. The viewport, which F8 focuses, shows it inset.
- **TooltipTrigger**, the table's tooltip trigger included, and the **Tabs** panel show the ring. With `asChild`, TooltipTrigger adds no classes, so its child keeps its own ring.
- **Rings in other colours.** TableCell's 3px outline in primitive `primary-600` @ 20%, which didn't re-theme, is now an inset `fr-primary` ring. SearchBar's and the active Input OTP slot's opaque `otl-primary-200` ring is now `fr-primary`, and an invalid slot's `otl-danger-200` ring is `fr-danger`, as on Input.
- **Radio** showed an opaque 4px ring in its text colour, black or white: `clx` read its `ring-opacity-40`, a Tailwind 3 utility that Tailwind 4 doesn't generate, as a ring colour and dropped `ring-fr-primary`. It now shows the 3px `fr-primary` ring. So does DataTable's radio-selection column, which no longer rings after a click. That column's cells are now 32px wide with 4px before the radio, as the checkbox column's are.
- **Forced colours.** Where rings don't render, as in Windows High Contrast, these controls show an outline on keyboard focus instead.

**If you set focus styles on these yourself:** a ring class you pass to Link or SiteLink can't reliably replace the 3px ring. Link doesn't merge `className` with its own classes, so the stylesheet's order decides which ring shows. A padding class you pass to NavbarMenuItem still lands on the item, so it now adds to its link's padding.

`full.css` in `@amerfathullah/myds-style` carries the new classes.
