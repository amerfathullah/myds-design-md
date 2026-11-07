---
"@amerfathullah/myds-react": patch
"@amerfathullah/myds-style": patch
---

An InputIcon inside a Fragment, including one in an array, or inside your own component now gets room on the side it draws on. Input pads the field 40px on that side, as it does for an InputIcon passed directly, so the placeholder and typed text no longer run under the icon. The room is already there in server-rendered HTML, before the page hydrates. InputIcon's rendered element now carries the side it draws on in a new `data-input-icon` attribute, `"left"` or `"right"`, and the field is padded from that attribute on an element after it. `data-has-left-icon` and `data-has-right-icon` are unchanged: they still describe Input's direct children only. Input's and InputIcon's props are the same. `full.css` in `@amerfathullah/myds-style` carries the new classes.
