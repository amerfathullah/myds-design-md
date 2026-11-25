---
"@amerfathullah/myds-react": minor
"@govtechmy/myds-docs": patch
---

SkipLink is now fixed to the window, appears at once, and isn't printed, as the design guideline's Skip link page shows it (#220). It was positioned against the page and faded in over 500ms. On a scrolled page, Tab scrolled the page back to the top to show it. When a CookieBanner closed on a scrolled page, it moved focus to the skip link without scrolling, so the link was drawn above the window, and nothing on screen showed where focus was.

- **Fixed to the window.** When it has focus, the link appears 16px from the window's left edge and 44px from its top, above the sticky Navbar, however far the page is scrolled. Tab no longer scrolls the page to show it, and after a CookieBanner closes, the link shows inside the window.
- **No fade.** It shows in the first frame it has focus and hides in the first frame after it loses focus, with or without reduced motion. Its `transition-all duration-500 ease-in-out` is replaced by `transition-colors`, so only its colours transition: hovering it still fades its background.
- **Not printed.** It's hidden when the page prints (`print:hidden`), as the Masthead, Navbar and Footer are.
- **Unchanged.** It still shows on any focus, from Tab or from script, which CookieBanner's close relies on. Its props, types and exports don't change.

**If you upgrade:**

- A wrapper with `position: relative` no longer contains the link, which now appears at the top left of the window. To keep it inside a wrapper, such as a preview box, give the wrapper `contain: layout` (`contain-layout`) or a transform.
- Tests or CSS that read the link's position or opacity see it fixed, and at full opacity in the first frame it has focus.

`full.css` in `@amerfathullah/myds-style` already has the classes SkipLink now uses, so it doesn't change.

In `DESIGN.md`, the SkipLink entry says the link is fixed to the window, what its 16px and 44px are measured from, that it appears at once, and that it hides when printed. Motion no longer lists it under `ease-in-out`. The preview pages' skip link is fixed and appears at once, and the page frame specimen's stays inside its card.

The design guideline's Skip link page (EN/MS) now describes what the page frame and SkipLink do:

- **The example** is HTML, fenced as `html`. The cookie banner, the Masthead and the Navbar are comments, so the main content no longer parses as inside a `<nav>`. The target is `<main id="main-content" tabindex="-1">`, the `<input>` has no `tabindex`, and the two `myds-` classes, which exist nowhere else, are gone. A sentence after it says it shows placement only, and links to the develop docs' Skiplink page. On the Malay page, the link text and the comments are Malay.
- **Note 2** tells authors to give the target `tabindex="-1"`, so the skip link can move focus to it without adding a Tab stop, and not to add `tabindex="0"` to content that isn't interactive. It used to tell them to add `tabindex="0"` anywhere.
- **How it works** says the link is hidden until it has focus, what the first TAB does while a cookie banner is shown, and that closing the banner moves focus to the link. ENTER moves focus to the main content section, and the next TAB reaches the first focusable element in it. The page used to say ENTER focused that element.
- **The TAB section** names the Masthead's trigger, then the Navbar's logo, as the stops after the skip link, where it named the nav buttons. A note before the demos says the images and videos are design mockups, and how a MYDS page differs from them.
- **Wording.** Both pages write TAB, ENTER, "Tab stop" and "Tab order" the same way, call the skip link a link, not a button, and say "`<body>` tag". The Malay page translates its "Where to use?" heading, and adds "sejurus", "serta-merta" and the shadow's name, Shadow/context-menu. The English page's grammar is fixed.

On the develop docs' Skiplink page (EN/MS), the Code and Anatomy snippets' `<main id="main-content">` has `tabIndex={-1}`, as the Preview's does. The Preview's box keeps the link inside it with `contain-layout`, so Tab still shows it there.
