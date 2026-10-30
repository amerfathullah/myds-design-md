---
"@amerfathullah/myds-react": patch
"@amerfathullah/myds-style": patch
---

In Chromium, a DateField or TimeField whose input is narrower than its text (a fixed `width`, or a `min-width` inside a narrow parent) now scrolls the focused segment fully into view, fill included, wherever the keyboard or a click moves focus. Chromium used to scroll a segment into view only when it was entirely hidden, so a partly hidden one stayed cut off. The fields wrapper inside the edit area is now a scroll-snap container, and the focused segment is its only snap area, so each focus move snaps to it. A field at its natural width keeps its layout and never scrolls. `full.css` in `@amerfathullah/myds-style` carries the new classes.
