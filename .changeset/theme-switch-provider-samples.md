---
"@govtechmy/myds-docs": patch
"@govtechmy/myds-storybook": patch
---

The Navbar develop page's first Code tab and the Login develop page's "Render Page" block (EN/MS) now wrap `ThemeSwitch` in one `ThemeProvider` from `@amerfathullah/myds-react/hooks`, so copying them gives a switch that changes the theme. Before, neither had a provider, and a `ThemeSwitch` with no `ThemeProvider` above it never changes the theme. "Render Page" says in a comment to leave its provider out if the app already has one at its root. The Navbar Action sample and `LoginTemplate` say in a comment that `ThemeSwitch` needs one `ThemeProvider` at the app's root. They get no provider of their own, so an app with one at its root doesn't get a second. The Login page no longer lists dark/light mode toggling as logic the template lacks, and its Customization section no longer names the toggle among the components to wire up.

The Navbar stories in Storybook render under one `ThemeProvider`, so their toggle changes the theme.
