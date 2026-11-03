---
"@amerfathullah/myds-react": minor
"@amerfathullah/myds-style": patch
"@govtechmy/myds-docs": patch
"@govtechmy/myds-storybook": patch
---

Switch (`Toggle` + `ToggleThumb`) can now be named in your site's language, keyboard users meet it once, and a disabled fieldset disables it.

- **The checkbox is the switch.** ToggleThumb's visually hidden `<input type="checkbox">` now has `role="switch"` and is the switch's one tab stop. The track beside it is hidden from assistive technology (`aria-hidden="true"`) and no longer takes focus or keys. Keyboard users met two tab stops per switch, and the first showed no focus indicator.
- **No more "Toggle".** Every switch was announced as "Toggle", whatever it controlled. It now has no default name, so name each one:
  - a `<Label htmlFor>` with Toggle's `id` now names the switch itself;
  - or pass the new `aria-label` or `aria-labelledby` prop to ToggleThumb, for example `<ToggleThumb aria-label="Pemberitahuan e-mel" />`. ToggleThumb also takes `aria-describedby`. These go to the checkbox.
  - The `ToggleThumbProps` type is exported.
- **Keys.** Space toggles the switch, as on any checkbox, and Enter still toggles it. Each calls `onCheckedChange` once. Enter now clicks the checkbox, so it fires the same native `change` event as Space, and it no longer submits a form around the switch.
- **Disabled fieldsets.** Inside a `<fieldset disabled>`, a switch without its own `disabled` looked disabled but still toggled with Space and Enter. Now it is disabled: Tab skips it, and no key or click changes it.
- **Focus ring.** The track shows the 3px `fr-primary` ring while the switch has focus, after a click on it too. Under forced colours it shows an outline only while the switch has focus; before, the outline showed at rest too.
- **Hooks.** Toggle now calls `useId()` on every render, so adding or removing `id` no longer breaks React's order of hooks.

Apart from focus, nothing changes visually: the track has the same sizes, colours, thumb and cursor.

**If you upgrade:**

- **A switch without a label** is now announced with no name, and accessibility checkers such as axe flag it. Give it a `<Label htmlFor>` or an `aria-label`.
- **Don't wrap a Toggle in a Label.** That nests ToggleThumb's own `<label>` inside the Label's, which HTML doesn't allow, and axe's `label` rule now flags it. Use `htmlFor` with Toggle's `id`.
- **`className` on ToggleThumb** still styles the track. The track never takes focus itself, so style its focus with `peer-focus:`, not `focus:`.
- **Tests that found the switch by `role="switch"`** now find the `<input type="checkbox">`, which has no `aria-checked`; read its `checked` instead.

`full.css` in `@amerfathullah/myds-style` carries the new classes.

The docs (EN/MS) name every switch with a Label, document `id` and ToggleThumb's props, and say how to name a switch, which keys toggle it and that a disabled fieldset disables it. Every Toggle story in Storybook names its switch, and new stories show an `aria-label` and a disabled fieldset.
