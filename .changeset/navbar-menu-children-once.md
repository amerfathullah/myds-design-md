---
"@amerfathullah/myds-react": patch
"@govtechmy/myds-docs": patch
---

NavbarMenu now renders its children once: in the menu bar's list while the Navbar's mobile menu is closed, and in the mobile menu while it's open. Before, it rendered them twice while the mobile menu was open: once in the menu bar's list, which is hidden below `xl:` (1280px), and again in the mobile menu.

- **Ids no longer repeat.** An `id` you give a menu child is on one element. Before, it was on two while the mobile menu was open, and `document.getElementById` found the hidden copy.
- **A ref holds the mounted element.** A ref on a menu child holds the element in the menu bar's list at load and after the mobile menu closes, and the element in the mobile menu while it's open. Before, it was `null` once the mobile menu closed, although the menu bar's element was still on the page.
- **The mobile menu closes when the window widens to `xl:`.** From `xl:` up the menu bar's list shows and the toggle hides, so a mobile menu left open as the window widened stayed open where nobody could see it, and its scroll lock stopped the page scrolling until a click on the page closed it. Now it closes, the page scrolls, and the toggle's `aria-expanded` is `"false"` again.

**If you upgrade:** below `xl:`, the menu's children now mount again each time the mobile menu opens or closes, so their effects run, and their state resets, each time. Before, they mounted again only when it opened. Keep state that must last above `NavbarMenu`. From `xl:` up the toggle is hidden by default, so the mobile menu doesn't open and nothing mounts again. If your own classes show the toggle from `xl:` up, it no longer opens the mobile menu there: the menu closes as soon as it opens.

The props, types, classes and server-rendered HTML don't change.

The docs (EN/MS) say that NavbarMenu renders its children once, and that they mount again each time the mobile menu opens or closes.
