---
"@amerfathullah/myds-react": minor
"@govtechmy/myds-docs": patch
"@govtechmy/myds-storybook": patch
---

ThemeSwitch now shows and names a theme it doesn't list. Before, when ThemeProvider's theme wasn't one of a ThemeSwitch's `themes`, the toggle was an empty, unnamed button that screen readers announced as just "button", and the select's value was blank. That happens with `<ThemeProvider defaultTheme="system">` and a default ThemeSwitch, or when System is chosen in another switch.

- **New `toggleLabel` prop,** defaulting to "Theme". It names the toggle while the provider's theme isn't one of its `themes`, and the toggle shows a monitor icon (`DesktopIcon`), styled like the theme icons. Set it in your site's language, for example `toggleLabel="Tema"`. It never reaches the DOM, and it never names the select, which keeps `selectLabel`.
- **The select shows the monitor icon alone** while its value isn't one of its `themes`. It shows no text, which screen readers would read after its name as "Theme, Theme". None of its options is marked selected.
- **A one-theme switch now switches to its theme.** From a theme it doesn't list, a click on the toggle goes to the first of its `themes`, as a switch with two or more already did. A switch with only one theme ignored every click and choice; now a click or a choice switches to that theme and calls `onChange` with it. Once it's on that theme, a click does nothing.

Nothing changes for a theme the switch lists: the toggle is named by its `label` and shows its icon, and the select shows both.

The docs (EN/MS) and Storybook's controls document `toggleLabel`.
