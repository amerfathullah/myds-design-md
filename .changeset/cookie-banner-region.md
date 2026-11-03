---
"@amerfathullah/myds-react": minor
"@amerfathullah/myds-style": patch
"@govtechmy/myds-docs": patch
---

CookieBanner is now a named page region instead of a modal dialog, so it no longer blocks the page, and only its own controls close it. As a dialog with no overlay, it hid the rest of the page from screen readers and kept Tab inside itself while open. It also caught the first click outside it, which closed it without reaching its target. Escape closed it too, so a visitor could dismiss it without choosing.

- **A `<section>` named by its title.** CookieBanner renders a `<section>` that `CookieBannerTitle` names, so always include a title. An `aria-label` or `aria-labelledby` you pass takes precedence. It has no `role="dialog"`, `aria-modal` or `aria-describedby`, and it leaves the rest of the page alone: no `aria-hidden`, no `pointer-events: none`, no scroll lock. Its description is read in reading order.
- **Rendered in place.** It renders where you put it, with no portal, and only in the browser, so a `defaultOpen` read from browser storage doesn't cause a hydration mismatch. It looks as before, fixed bottom-right. It's now capped at the viewport's height, less its 16px bottom margin from `sm:` up, and its content scrolls inside it beyond that.
- **What closes it.** Only a `CookieBannerClose` (Accept, Reject or Save) and the close cross. A press outside it, focus moving outside it and Escape no longer close it. It calls `preventDefault()` on none of them, so a click outside reaches its target. `onOpenChange(false)` is called once per close. Every opening starts in the default view, and nothing resets the Customise view while the banner is open.
- **Focus.** Opening it right after a visitor action, such as a click on "Cookie settings", moves focus to the banner. Opening it on page load or from an effect doesn't move focus. Closing it with focus inside moves focus back to what opened it, else to the next focusable element after it (SkipLink in the page frame), else to `<body>`, without scrolling the page. Tab and Shift+Tab move into and out of it in DOM order. Customise moves focus to the first preference, and a trigger that goes back, such as "Back", to Customise.
- **Page padding.** While it's shown, it sets an inline `scroll-padding-bottom` on `<html>` and `padding-bottom` on `<body>` to its height plus its bottom offset, and keeps them up to date as it resizes. A control that takes focus then scrolls into view above it (WCAG 2.2 SC 2.4.11). When it closes or unmounts, it puts back the inline values that were there before.
- **Handlers.** A `CookieBannerClose` or `CookieBannerPreferencesTrigger` runs your `onClick` first. If your handler calls `preventDefault()`, the banner stays open or the view stays. A trigger's `onClick` used to replace its toggle.
- **Props.** CookieBanner takes every `<section>` attribute, such as `id`, `aria-label` and `style`, and forwards its ref to the `<section>`. `open`, `defaultOpen`, `onOpenChange`, `modal` and `closeLabel` never reach the DOM, so React no longer warns about them. `modal` is deprecated and does nothing; it's removed at the next major. `CookieBannerPreferences` is now a `<div>`, so block content inside it no longer nests in a `<p>`.

**To migrate:**

- Render CookieBanner first in `<body>`, before SkipLink.
- Update tests and CSS that select it by `role="dialog"`. Select its region instead, for example by its title's name.
- Drop `modal`, and any `onInteractOutside` or `onEscapeKeyDown` handlers. They're no longer accepted, and the banner already stays open until the visitor chooses.

`full.css` in `@amerfathullah/myds-style` gains `max-h-dvh` and `sm:max-h-[calc(100dvh-1rem)]`, for the banner's height cap.

The docs (EN/MS) say to render the banner first in `<body>`, describe what closes it, its focus and its page padding, and document its section attributes, its ref and the deprecated `modal`. Their previews render it in place.
