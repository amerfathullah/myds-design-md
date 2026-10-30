---
"@amerfathullah/myds-react": patch
"@amerfathullah/myds-style": patch
---

In Chromium, a DateField or TimeField whose input is narrower than its text (a fixed `width`, or a `min-width` inside a narrow parent) now scrolls the focused segment fully into view, fill included, whenever keyboard focus moves to it. Chromium's focus scroll used to bring a segment into view only when it was entirely hidden, so a partly hidden one stayed cut off. The fields wrapper inside the edit area now has scroll padding of half its width on each side, which leaves only its centre line, and Chromium centres any focused segment that doesn't cross it. Typing that widens the focused segment, as when an empty AM/PM becomes PM, doesn't scroll it, and neither does a click. A segment wider than half the field, such as milliseconds when `step` is under 1, can stay partly cut. A field at its natural width keeps its layout and never scrolls, in left-to-right and right-to-left locales. `full.css` in `@amerfathullah/myds-style` carries the new classes.
