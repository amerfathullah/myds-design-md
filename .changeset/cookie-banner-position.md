---
"@amerfathullah/myds-react": minor
"@amerfathullah/myds-style": patch
"@govtechmy/myds-docs": patch
---

CookieBanner now sits where the design guideline's "Cookie banner location" puts it: across the bottom of the window below `md:` (768px), and in the bottom-left corner from `md:` up. It used to sit bottom-right, touching the window's edges on a phone. From `md:` up a toast sat over it there, and took the clicks meant for its "Reject all" and "Customise" buttons. Toasts stay bottom-right, so from `md:` up the two no longer overlap.

- **Below `md:`.** The banner stretches across the window, 18px from its left, right and bottom edges, with 18px padding. Nothing caps its width here: it's the window's width less 36px.
- **From `md:` up.** It's 500px wide, border and padding included, 24px from the window's left and bottom edges, with 24px padding. Its padding used to widen at `sm:` (640px); it now widens at `md:`.
- **Height cap.** It's never taller than the window less its bottom gap: 18px below `md:` and 24px from `md:` up. Its content scrolls inside it beyond that.
- **Page padding.** While it's shown, the inline `scroll-padding-bottom` on `<html>` and `padding-bottom` on `<body>` are its height plus its new bottom gap.
- **Unchanged.** The action row still stacks below `sm:`, and `CookieBannerPreferencesTrigger` is still full width below `sm:`. The slide-in, the close cross, the z-index and the focus behaviour are as before. No props, types or exports change.

**If you upgrade:**

- From 768px up, the banner now covers the bottom-left corner of the window, so check what you place there, such as chat or feedback widgets and back-to-top buttons.
- On a phone it has 18px margins, so it no longer touches the window's edges.
- A `className` that sets the banner's position must now also override its `md:` classes, such as `md:right-auto` and `md:ml-6`, which win from `md:` up. Its gaps are margins on a box fixed at `bottom-0`, so an unprefixed `bottom-auto` or `top-*` still moves it at every width.

`full.css` in `@amerfathullah/myds-style` gains `mx-4.5`, `mb-4.5`, `md:right-auto`, `md:ml-6`, `md:mb-6`, `md:w-[500px]` and `md:p-6`, and loses `max-w-[500px]`, `sm:mr-4` and `sm:mb-4`.

In `DESIGN.md`, the Page frame and the CookieBanner entry describe where the banner sits, and Known Gaps no longer lists its position as a Divergence. The docs (EN/MS) describe where it sits.
