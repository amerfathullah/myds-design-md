---
"@govtechmy/myds-docs": patch
"@govtechmy/myds-storybook": patch
---

The docs site and Storybook load nothing from upstream's CloudFront bucket any more (ADR-0006).

- **Develop docs.** The Navbar and Login pages (EN/MS) show the logo from `/common/logo.svg`, which the docs site serves, in their live previews; the Login page's preview renders `templates/login.tsx`. Their Code tabs use the same path, as a placeholder for your own logo.
- **No custom image loader.** `next/image` no longer goes through one: image optimisation is off, so it still serves each image from `public/` exactly as committed, and the config no longer names the bucket as a remote image host.
- **No `s3()`.** Every file it pointed at is in `public/`, so the guideline's demo videos name their `/design/` file directly, and Markdown images keep the path they're written with.
- **Storybook.** The Navbar story's logo and the Article and Landing Page stories' illustration come from Storybook's own static files, under `/common/`.

A new `upstream bucket` workflow fails any push in which a file outside the ADRs and CHANGELOGs names the bucket's host.
