---
"@govtechmy/myds-docs": patch
---

The design guideline's images and videos are now served from the docs site itself, not from upstream's CloudFront bucket (ADR-0006). Its 444 files under `/design/` (the Markdown images and the `-dark` copy of each, the `<Image>` files and the demo videos) are copied unchanged into `public/design`, at the paths the pages already use, so no page changes. The locale redirect leaves `/design/` alone, as it does `/assets/`, and the build reads each Markdown image's size from `public/`. Any other path, such as the site's own `/common/` assets, still loads from the bucket. A new `docs` workflow runs `check-design-files`, which fails when a guideline page references a file under `/design/` that the repository doesn't hold.
