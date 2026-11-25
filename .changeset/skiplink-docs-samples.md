---
"@govtechmy/myds-docs": patch
---

The develop docs' Skiplink pages (EN/MS) now have an Anatomy block and a Code tab that compile, and say where `Skiplink` goes in the page. The Anatomy block and the Code tab each wrap the `Skiplink` and its `<main id="main-content" tabIndex={-1}>` target in one fragment. Before, each listed two sibling elements with no parent, so neither compiled. A new Placement section (Kedudukan on the Malay page) says to render `Skiplink` first in `<body>`, right after the `CookieBanner` if the page shows one, outside any `<header>` and `<nav>`, and to give the `<main>` it points at `tabIndex={-1}`. It shows the page frame and links to the design guideline's Skip link page. On the Malay page, the skip link reads "Langkau ke kandungan utama" in the preview, the code and the new section.

The Malay Accessibility page now calls a skip link "pautan langkau", as the design guideline's Malay page does, in place of "pautan lompat". Its page layout example's link text is "Langkau ke kandungan utama".

Every skip-link example in the docs now gives its `<main id="main-content">` target `tabIndex={-1}`, as the design guideline asks: the Accessibility page's page layout example and the CookieBanner page's Placement example (EN/MS) gained it.
