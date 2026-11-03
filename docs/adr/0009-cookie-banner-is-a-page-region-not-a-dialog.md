# CookieBanner is a page region, not a dialog

CookieBanner came from upstream as a Radix modal dialog with no overlay (#83). While it was open, it hid the rest of the page from screen readers, kept Tab inside itself, and caught the first click outside it, closing without passing that click on. Escape closed it too. The design guideline instead describes a banner that doesn't block the page, and "remains visible until the user interacts with it by either accepting all or rejecting cookies, customize their preferences, or closing the cookie banner". So CookieBanner is a named page region: a `<section>` named by its title. It renders where the author places it, first in `<body>` and before SkipLink, as the skip-link guideline shows. Only its own controls close it: Accept, Reject, Save and the close cross. Pressing or focusing outside it doesn't, and neither does Escape.

## Considered Options

- **A non-modal Radix dialog** (`modal={false}`, with presses and focus outside it ignored): rejected. Radix's dialog content always loops Tab, and no prop turns that off, so keyboard users still couldn't leave the banner. Its Escape listener also covers the whole page. The banner would be non-modal for pointer users and modal for keyboard users.
- **Keep the modal dialog, add an overlay, and stop outside presses closing it**: rejected. WCAG 2.2 SC 2.4.11 accepts a modal cookie banner. But a banner that blocks the page until the visitor chooses contradicts the guideline's banner, which doesn't block the page.
- **Close it on Escape, like the close cross**: rejected. A region isn't a dialog, and keyboard users can Tab past it, so Escape would only add a hidden way to dismiss it without choosing. GOV.UK's and the French government's (DSFR) cookie banners don't define Escape either.

## Consequences

- The page frame starts with CookieBanner while it's shown (CONTEXT.md, DESIGN.md). Coming first in the page is how keyboard and screen-reader users reach it on page load, so opening on load doesn't move focus. When a visitor reopens it from a control in the page, focus moves to the banner.
- Every opening starts in the default view, never the preferences view.
- The banner no longer blocks the page, so on a small screen it could hide a control that takes focus (WCAG 2.2 SC 2.4.11). While it's shown, the library pads the page's scroll area by the banner's height, so a focused control scrolls into view above it.
- The `modal` prop does nothing. It's deprecated in 2.x and removed at the next major. Radix's dialog-only props, such as `onInteractOutside` and `onEscapeKeyDown`, used to reach the banner without being typed. They stop working.
- Tests and CSS that select CookieBanner by `role="dialog"` must select the region instead.
