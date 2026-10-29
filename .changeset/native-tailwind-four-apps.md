---
"@govtechmy/myds-docs": patch
"@govtechmy/kd-standard": patch
"@govtechmy/myds-storybook": patch
---

Load MYDS through the Tailwind 4 `@govtechmy/myds-style` import. The docs and standard sites drop `@config`, their `tailwind.config.ts` and their own Fumadocs colour mapping for `@govtechmy/myds-style/fumadocs.css`, and the placeholder and button-cursor defaults now come from the package. Storybook moves from Tailwind 3 to Tailwind 4 through `@tailwindcss/vite`. The docs' Style Configuration page (EN/MS) shows the Tailwind 4 setup.
