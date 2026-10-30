---
"@amerfathullah/myds-react": patch
"@amerfathullah/myds-style": patch
---

In Chromium, DateField and TimeField now fill the focused segment of their native input (day, month or year; hour, minute, second or AM/PM) with primitive `primary-600` and `white` text, the same in both themes. Their classes matched the segment with `:focus`, which Chromium never matches on a `::-webkit-datetime-edit-*-field` pseudo-element, so the browser's own highlight showed instead; they now match it with `:focus-within`. The fill they asked for, `primary-500` with `txt-white`, is replaced: it fell short of the 4.5:1 contrast WCAG AA asks of text, and `txt-white` turns dark in the dark theme. Firefox still shows its own highlight, because it gives page CSS no way to style a segment. `full.css` in `@amerfathullah/myds-style` carries the new classes.
