---
"@amerfathullah/myds-style": patch
"@govtechmy/myds-docs": patch
---

The theme files now set the browser's `color-scheme`, `light` on `:root` and `dark` on `.dark`, so the browser draws its own parts to match the theme. Nothing set it before, so in the dark theme the browser drew them as it does for a light page. Both entries carry the change, the Tailwind import and `full.css`, and so do the standalone `light.css` and `dark.css`.

- **Inside `.dark`, on `<html>` or on a subtree, the browser draws its own parts dark:** scrollbars, number spinners, the pickers of native date and time inputs, and native form controls in your own markup, such as checkboxes and range sliders. MYDS's Checkbox, Radio and Select draw no native control, so they look the same.
- **The browser's focus ring is drawn for a dark page** on your own links and buttons that have no focus style of their own. It was drawn for a light page, so its dark inner line almost vanished in the dark theme.
- **On a dark root,** with `.dark` on `<html>`, three things change. `bg-bg-white text-txt-black-900` on `<body>` avoids the first two:
  - Where nothing colours `<html>` or `<body>`, the page shows the browser's dark canvas, which isn't MYDS's dark background.
  - Text with no colour of its own turns white instead of black.
  - An iframe whose document doesn't declare dark shows an opaque light canvas instead of a transparent one.
- **In the light theme, an app's `<meta name="color-scheme">` no longer decides the scheme:** the root computes `light`. With `<meta name="color-scheme" content="light dark">` on a dark OS, scrollbars and form controls were dark and default text was white. They're now light, and default text is black.
- **To override it,** put a Tailwind `scheme-*` utility, such as `scheme-light`, on `<html>` or on a `.dark` element, or set `color-scheme` in an inline style or in a rule of your own outside any layer. MYDS sets it in `@layer base`, so each of these wins.

Only `.dark` sets `dark`. Under a custom theme class, such as `system`, the root keeps `light` unless you set `color-scheme` for that class. `.dark` wins on `<html>` only because `dark.css` comes after `light.css`, as both entries already import them, so keep that order if you import the standalone files. ThemeProvider and `getThemeScript` don't change.

The docs (EN/MS) say, in Style Configuration's Theme section, that the theme files set `color-scheme`, that `light.css` comes before `dark.css`, and to put `.dark` on `<html>` and colour `<body>` with the theme's tokens. In ThemeSwitch's Custom Themes, they say that a custom theme class keeps `light`.
