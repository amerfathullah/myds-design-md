---
"@amerfathullah/myds-react": minor
"@govtechmy/myds-docs": patch
---

Icon-only controls that screen readers announced as just "button" now have accessible names, in English by default, and you can rename each one in your site's language.

- **New `closeLabel` prop** on `Callout`, `AutoToast` and `CookieBanner`, defaulting to "Close". It names a close button you don't render yourself: Callout's `dismissible` cross, each AutoToast toast's close button, and CookieBanner's close cross. For example, `closeLabel="Tutup"`. It never reaches the DOM. Every other prop still goes where it went before: Callout's to its `role="alert"` container, AutoToast's to each toast, CookieBanner's to its dialog.
- **Default names on icon-only parts you render:** `ToastClose` is named "Close", `SearchBarSearchButton` "Search" in every size, and `SearchBarClearButton` "Clear". An `aria-label` you pass replaces the default, for example `aria-label="Cari"`.
- **Hidden decoration:** AutoToast's status icon and countdown bar are now hidden from assistive technology (`aria-hidden="true"`). They were a `role="img"` and a `role="progressbar"` with no name or value, so they told screen readers nothing. The toast's title carries its meaning.

Nothing changes visually: the same elements, classes and icons render.

The docs (EN/MS) document `closeLabel` and the default names, and the docs site names these controls in the page's language.
