---
"@amerfathullah/myds-react": minor
"@govtechmy/myds-docs": patch
---

The Navbar's mobile menu, below `xl:` (1280px), now manages focus as the library's Dialog does, and its toggle says whether the menu is open. Keyboard and screen-reader users could start partway down the menu, never reach the toggle while the menu was open, and lose their place when it closed.

- **The toggle is named "Menu", open or closed.** NavbarAction's toggle was named "Open navigation menu" while the menu was closed and "Close navigation menu" while it was open, and that name was its only sign of the menu's state. It now has `aria-expanded`, `"false"` or `"true"`, and, while the menu is open, `aria-controls` naming the menu. An `aria-label` on NavbarAction still renames it, for example `aria-label="Navigasi"`, and screen readers now still hear whether the menu is open.
- **Opening the menu focuses its first item.** Enter, Space, a click or a tap on the toggle focuses the menu's first item, whatever kind of control it is. Before, focus skipped the menu's links and landed on its first other control, such as a NavbarMenuDropdown's trigger. In a menu of links only, it landed on the menu's panel, which has no width, so no focus showed.
- **Tab and Shift+Tab cycle through the menu's items and the toggle.** Before, they looped through the items and never reached the toggle. An open dropdown's links are in the cycle: with a dropdown open last in the menu, Tab skipped its last link. The header's other controls and the page stay out of the cycle while the menu is open, as before.
- **Closing the menu leaves focus on the toggle.** Escape, a press on the overlay and the toggle each close the menu and leave focus on the toggle. Before, focus fell to `<body>`, so the next Tab started again at the top of the page. With a dropdown open, the first Escape still closes only the dropdown. A press on a control elsewhere on the page still closes the menu and leaves focus on that control.
- **A press in the menu's padding leaves focus where it was.** Before, it moved focus to the menu's panel.

**If you upgrade:** update tests that select the toggle by its old names, such as `getByRole("button", { name: "Open navigation menu" })`. Select it by the name "Menu", and read whether the menu is open from `aria-expanded`.

NavbarAction's props don't change. Its `onClick` is still called, with no arguments, on every press of the toggle, and not when the menu closes in another way. The server-rendered HTML changes only in the toggle's `aria-label` and its new `aria-expanded="false"`. From `xl:` up, nothing changes.

The docs (EN/MS) give the toggle's new name, say that screen readers hear whether the menu is open even after an `aria-label` renames it, and describe the menu's keyboard use.
