---
"@amerfathullah/myds-react": patch
"@govtechmy/myds-docs": patch
---

`setTheme` outside a ThemeProvider, from a ThemeSwitch with no provider above it or from an app's own `useTheme()`, now logs one console warning per page, where it used to fail silently. The theme still doesn't change. Rendering a ThemeSwitch logs nothing: only a click, a choice or a call to `setTheme` does. The warning says `setTheme("dark")` (with the theme it was given) was called outside a ThemeProvider. To fix it, wrap the app in one ThemeProvider from `@amerfathullah/myds-react/hooks`, above every ThemeSwitch and `useTheme` call, or feed `ThemeContext.Provider` from your own theme state or another theme library. Test suites that fail on console output, and click a ThemeSwitch with no provider above it, will see the warning.

The ThemeSwitch and useTheme develop pages (EN/MS) say so in the callouts that tell you to wrap the app in ThemeProvider.
