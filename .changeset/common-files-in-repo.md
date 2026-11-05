---
"@govtechmy/myds-docs": patch
---

The docs site's own images are now served from the docs site itself, not from upstream's CloudFront bucket (ADR-0006). Its 22 files under `/common/` (the hero, the home page's preview illustrations and "about" icons, the `-dark` copy of each, the logo and the Jata Negara) are copied unchanged into `public/common`, at the paths the pages and components already use, so none of them changes. The locale redirect leaves `/common/` alone, and the image loader serves it from `public/`, as they do `/design/`. `check-design-files` now also fails when a docs page or component references a file under `/common/` that the repository doesn't hold, counting the `-dark` copy that `darkify()` requests for each preview illustration and "about" icon.
