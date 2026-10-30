---
"@amerfathullah/myds-react": patch
"@amerfathullah/myds-style": patch
---

In Chromium, TimeField no longer cuts off the end of its last segment ("09:30 AM" read "09:30 AN"), at any size, `step`, locale, pixel density or zoom. Chromium sizes a date or time input's edit area to an estimate of its segments' text that leaves out the 2px margins the components put around each separator, and cuts off whatever doesn't fit. DateField and TimeField now let the edit area grow to its content (`min-width: max-content` on `::-webkit-datetime-edit`), so a cut field widens by just what its segments need, and a field that fit keeps its width. The `style={{ minWidth: "5.5rem" }}` workaround is no longer needed. `full.css` in `@amerfathullah/myds-style` carries the new class.
