---
"@amerfathullah/myds-react": minor
"@amerfathullah/myds-style": patch
---

Switch (`Toggle` + `ToggleThumb`) can now be named in your site's language, keyboard users meet it once, and a disabled fieldset disables it.

- **The checkbox is the switch.** ToggleThumb's visually hidden `<input type="checkbox">` now has `role="switch"` and is the switch's one tab stop. The track beside it is hidden from assistive technology (`aria-hidden="true"`) and no longer takes focus or keys. Keyboard users met two tab stops per switch, and the first showed no focus indicator.
- **No more "Toggle".** Every switch was announced as "Toggle", whatever it controlled. It now has no default name, so name each one: a `<Label htmlFor>` with Toggle's `id` now names the switch itself, or pass the new `aria-label` or `aria-labelledby` prop to ToggleThumb, for example `<ToggleThumb aria-label="Tetapan awam" />`. ToggleThumb also takes `aria-describedby`. They go to the checkbox. The `ToggleThumbProps` type is exported.
- **Keys.** Space toggles the switch, as on any checkbox, and Enter still toggles it. Each reports to `onCheckedChange` once. Enter no longer submits a form around the switch.
- **Disabled fieldsets.** Inside a `<fieldset disabled>`, a switch without its own `disabled` looked disabled but still toggled with Space and Enter. Now it is disabled: Tab skips it, and no key or click changes it.
- **Focus ring.** The track shows the 3px `fr-primary` ring while the switch has focus, after a click on it too, and an outline under forced colours.
- **Hooks.** Toggle now calls `useId()` on every render, so adding or removing `id` no longer breaks React's order of hooks.

**If you render a switch without a label:** it's now announced with no name, and accessibility checkers such as axe flag it. Give it a `<Label htmlFor>` or an `aria-label`. Tests that found the switch by `role="switch"` now find the `<input type="checkbox">`, which has no `aria-checked`; read its `checked` instead. A `className` on ToggleThumb still styles the track.

`full.css` in `@amerfathullah/myds-style` carries the new classes.
