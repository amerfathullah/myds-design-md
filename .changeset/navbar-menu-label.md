---
"@amerfathullah/myds-react": minor
"@govtechmy/myds-docs": patch
---

You can now rename the Navbar menu's `<nav>` landmark in your site's language. Screen readers announced it as "Main", in English, and no prop changed it.

- **New `aria-label` and `aria-labelledby` props** on `NavbarMenu`. They name its `<nav>`, for example `<NavbarMenu aria-label="Utama">`. Without them it is still named "Main", which is now NavbarMenu's own documented default. Before, NavbarMenu dropped both props. It passes only these two to its `<nav>`, and an `aria-label` on `Navbar` still goes to its `<header>`.

Nothing changes visually: the same elements, classes and icons render.

The docs (EN/MS) give the default names of the Navbar menu's `<nav>` ("Main"), the Navbar menu toggle ("Open navigation menu" / "Close navigation menu"), the Masthead trigger ("Toggle masthead") and the Breadcrumb's `<nav>` ("breadcrumb"), and show how to rename each one with an `aria-label`. The Masthead examples pass an `aria-label` that matches the trigger's visible text.
