---
"@govtechmy/myds-docs": patch
---

Replace the "Work In Progress" Contact Us template page (EN/MS) with the full template from [upstream PR #346](https://redirect.github.com/govtechmy/myds/pull/346): a live `ContactUsTemplate` preview, copyable code importing only from `@amerfathullah/myds-react/*`, anatomy and customisation notes. The template's styling now uses MYDS tokens (`otl-*` outlines, `bg-*` surfaces, `txt-*` text, `text-body-*` and `font-heading` with `text-heading-*`, `shadow-card`) in place of class names Tailwind never generated. The Malay Login page is titled "Log Masuk", and the Malay Forgot Password page says "lupa kata laluan" throughout. The docs Tailwind config now scans `templates/`.
