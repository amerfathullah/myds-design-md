---
"@amerfathullah/myds-react": patch
"@amerfathullah/myds-style": patch
---

A Select's highlighted option, the one the arrow keys move to and Enter picks, can now be seen in the dark theme. It had only a `bg-washed` fill, which in dark is `gray-850`, the same colour as the list's `bg-dialog` panel, and its text didn't change. So a keyboard user couldn't see which option had focus. Now they can, as WCAG's SC 2.4.7 (Focus Visible) asks.

- **It now looks like a highlighted Dropdown item.** The option takes a `bg-washed-active` fill with `txt-black-900` text, as a focused default `DropdownItem` does and as the design guideline's Menu list state draws it. In dark that's a `gray-800` fill with white text.
- **In light, only the text darkens,** from `txt-black-700` to `txt-black-900`, because `bg-washed-active` equals `bg-washed` there.
- **Every highlighted option gets it:** one a mouse pointer moves onto, a selected one, which still shows its check, and the options of a `multiple` select. Resting and disabled options don't change.
- **ThemeSwitch's select mode is fixed too,** as its options are SelectItems.

**A text colour you pass in `className` gives way while the option is highlighted.** A plain class such as `text-txt-primary` on `SelectItem` now yields to `txt-black-900` on the highlighted option, as it does on `DropdownItem`. A `data-[highlighted]:` class you pass still wins.

`full.css` in `@amerfathullah/myds-style` carries the new classes.
