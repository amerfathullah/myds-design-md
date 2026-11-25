---
"@amerfathullah/myds-react": patch
"@govtechmy/myds-docs": patch
---

An `id` on the heading you pass `CookieBannerTitle` with `asChild` now names the banner (#213). The title registered its own id, or a generated one, while the heading rendered with yours, so the banner's `aria-labelledby` named an id that wasn't in the page. The banner then had no name, and Chromium no longer exposed it as a region. A heading with `id={undefined}` rendered with no id at all, and left the banner unnamed the same way.

- **Your heading's `id` wins.** With `asChild`, a heading with its own `id` keeps it, and that id names the banner, even when you also pass `id` to `CookieBannerTitle`. A heading with no `id`, or `id={undefined}`, gets the title's `id`, else a generated one. If your heading's `id` changes, the banner follows it.
- **Unchanged.** Without `asChild`, the `<h2>` still gets the title's `id`, else a generated one. Only one heading renders, with both the title's classes and yours, and both refs. An `aria-label` or `aria-labelledby` you pass `CookieBanner` still names it instead.

Only a single element child is read. Nothing changes visually: the same elements and classes render.

The docs (EN/MS) list `asChild` on `CookieBannerTitle`, and say that with it, your own heading's `id` names the banner.
