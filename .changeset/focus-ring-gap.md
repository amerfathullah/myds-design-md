---
"@amerfathullah/myds-react": patch
"@amerfathullah/myds-style": minor
---

A focused filled control now draws its focus ring 2px wide, outside a 2px band in a new token, `fr-gap`, so the ring no longer merges into the fill. The opaque `fr-primary` ring sat close to a fill's colour: 1.30:1 against a `primary-fill` button's `primary-600` in light and 2.59:1 in dark, and 1.00:1 against its hover fill, `primary-700`, in light, so a focused, hovered button just looked 3px bigger.

- **`fr-gap`** is `white` (`#FFFFFF`) in light and `black` (`#000000`) in dark. It contrasts at least 3:1 with every fill it touches, at rest and hovered: 4.83:1 or more in light and 3.13:1 or more in dark. The ring is 6.70:1 against it in light and 10.51:1 in dark.
- **Which controls.** `primary-fill` and `danger-fill` Buttons, and everything that renders one, such as the large SearchBar's search button; checked and indeterminate Checkboxes, DataTable's included; checked Radios and DataTable's checked radio; the checked Switch; and the Calendar's selected day, range start and end, and selected month and year, in DatePicker and DateRangePicker too. The band shows only while the control is focused and filled, and `danger-fill`'s ring stays `fr-primary`. Every other ring is unchanged: 3px, with no band.
- **Size.** The band and ring reach 4px out, 1px more than the 3px ring, which still fits DataTable's selection cells, a Select's footer and the SearchBar's padding.
- **Around the control.** In light the band is the page's white. In dark it is 1.19:1 against the page and 1.25:1 on a dialog, so it shows as a faint halo on surfaces other than the page.
- **Forced colours** are unchanged. The band is a box-shadow, like the ring, so a focused control still shows a 2px outline instead.
- **The Calendar's previous and next buttons** now render as `default-outline` Buttons, where they took that look from their class names over Button's default `primary-fill`. They look the same, and keep the 3px ring with no band.

**If you set focus styles yourself:**

- A ring width you pass to a filled Button, such as `focus:ring-3`, now sits outside the 2px band. Add `focus:ring-offset-0` to drop the band.
- On a control of your own that fills, draw the ring the same way, behind its focus variant, and behind the state that fills it where a state does, such as `focus:ring-2 focus:ring-offset-2 focus:ring-offset-fr-gap`. Don't leave a `ring-offset-*` width bare, because `shadow-button` then draws the band at rest, and don't leave out `ring-offset-fr-gap`, because Tailwind colours an offset white, which in dark is a white band.

`full.css` in `@amerfathullah/myds-style` carries the new classes, and the preset's `fr-gap` utilities, such as `ring-offset-fr-gap`, `bg-fr-gap` and `border-fr-gap`, are new.
