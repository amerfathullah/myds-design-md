---
"@amerfathullah/myds-react": patch
"@amerfathullah/myds-style": patch
"@govtechmy/myds-docs": patch
---

MastheadTrigger is now named by the text it shows, such as "Kenal pasti begini". Before, screen readers announced every trigger as "Toggle masthead", in English, whatever it showed, and speech-input users couldn't activate it by saying its text (WCAG 2.5.3, Label in Name).

- **Children name the trigger, at every width.** Below `sm:` the trigger still shows only its chevron. Its text is now visually hidden there (`max-sm:sr-only`) instead of `display: none`, so it names the trigger below `sm:` too.
- **"Toggle masthead" is the default only with no children.** A trigger with no children, or with `null`, `false` or `""`, is still named "Toggle masthead". An `aria-label` still replaces the name, with or without children, for example `<MastheadTrigger aria-label="Kenal pasti begini" />`.
- **Nothing else changes.** Opening the masthead still sets `aria-expanded`, and the name stays the same. Nothing changes visually: the trigger keeps its size at every width, and its text stays on one line beside a long title.

**If you upgrade:**

- **Tests that find the trigger by "Toggle masthead"** must find it by its text, for example `getByRole("button", { name: "Kenal pasti begini" })`.
- **An `aria-label` that only repeats the trigger's text** can be removed.
- **Children with no text,** such as an icon alone, need an `aria-label`.

`full.css` in `@amerfathullah/myds-style` gains `max-sm:sr-only` and no longer carries `sm:block`, which nothing else in the library used.

The docs (EN/MS) no longer pass an `aria-label` that repeats the trigger's text. They say the trigger's text names it below `sm:` too, that "Toggle masthead" applies only with no children, and how to rename it, with a Malay example.
