---
"@govtechmy/myds-docs": patch
---

The design guideline's Skip link page (EN/MS) now puts skip links first, outside any `<header>`. It told authors to wrap skip links inside the page's `<header>`, but MYDS's Navbar renders that header after the Masthead, so a skip link inside it can't come first. Skip links still come right after `<body>`, or after the cookie banner if one is used, and never inside `<nav>`.

The page's example link now points at its target. The example's attribute values use straight quotes instead of curly ones, and its target is `id="main-content"` instead of `id="#main-content"`, so the link's `href="#main-content"` matches it. The English note writes `tabindex="0"` in straight quotes, as the Malay note does.
