---
"@govtechmy/myds-docs": patch
"@govtechmy/kd-standard": patch
---

Move the docs and standard sites to Next.js 16, React 19, Fumadocs 16 (fumadocs-mdx 15) and Tailwind 4, with every other dependency on its latest stable release. Locale routing runs in `proxy.ts`, route `params` are awaited, search is per locale, and the standard site now lints with ESLint. Each site's `app/global.css` is the Tailwind 4 entry point: it loads the `@govtechmy/myds-style` v1 preset through `@config`, maps the former `preset_fumadocs` colours onto Fumadocs 16's theme variables, and scans `@govtechmy/myds-react` with `@source`. Google Fonts load from `<link>` tags, since Turbopack drops remote CSS imports. Fumadocs `<Tabs items>` in MDX no longer pass `defaultValue`: Fumadocs 13 ignored it, and Fumadocs 16 would select no tab.
