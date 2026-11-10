---
"@amerfathullah/myds-react": patch
"@amerfathullah/myds-style": patch
---

Under forced colours, as in Windows High Contrast, Button and the other controls below now show when they have focus. Forced colours drop box-shadows, which draw every MYDS focus ring, so a focused control shows a 2px outline instead. These controls drew that outline all the time, at rest too, so keyboard focus changed nothing a user could see, which fails WCAG's SC 2.4.7 (Focus Visible). Now they draw it only while they have focus, from the keyboard or the mouse.

- **Controls.** Button, and everything that renders it or reuses its classes, such as Pagination, the calendar's buttons and the DatePicker and DateRangePicker triggers; Input; Checkbox; SelectTrigger; TabsTrigger; and the CookieBanner's close cross. A disabled Button drew the outline too, and now draws none.
- **Items in an open list.** Every SelectItem and DropdownItem in an open list drew an outline, disabled ones included. Now only the focused item does. Forced colours remove its highlight fill, so the outline is what shows which item has focus.
- **Panels.** PopoverContent, such as the DatePicker's panel, and the CookieBanner draw the outline only while they hold focus themselves. The DatePicker's panel no longer shows a double border while a control inside it has focus, and the CookieBanner no longer has a box around it whenever it shows.
- **Stray boxes.** These never take focus but drew an outline all the time, and now draw none: Input's bordered wrapper and InputAddon's default `<div>`, the Masthead's inner grid and MastheadHeader, the Navbar's mobile menu, and DataTable's pinned-column edge, which drew two bars down every row, over the next column's first letter.

Nothing changes in normal colours: no element gains or loses an outline or a ring. The one exception is a focusable element you render through `InputAddon asChild`, such as a `<button>`, which now shows the browser's outline on keyboard focus, where it showed none.

`full.css` in `@amerfathullah/myds-style` no longer carries `before:outline-hidden`, which only DataTable's pinned-column edge used.

**If you set focus styles yourself:**

- An outline-width class you pass to these components, such as `outline-2`, is no longer hidden at rest, so it now draws an outline at rest. Put it behind the Tailwind focus variant you want, such as `focus-visible:outline-2`.
- Your own bare `outline-hidden` brings the permanent outline back under forced colours. Put it behind the Tailwind variant your ring is on: `focus-visible:outline-hidden`, or `focus:outline-hidden`.
