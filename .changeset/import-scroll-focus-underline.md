---
"@amerfathullah/myds-style": minor
---

The Tailwind import now sets the scroll, focus and underline rules that only `full.css` had, so both entries render the same. `full.css`, which imports it, has each of these rules once and adds only the fonts and its box-sizing pair (`border-box` on `html`, `inherit` on every element), which stays out of the import.

**With the Tailwind import, you now get:**

- `scroll-padding-top: 65px` on `html`, so an in-page link's target, the SkipLink's included, lands below the 64px sticky Navbar instead of under it. The value doesn't change with the breakpoint: below `md:` the Navbar is 56px, so targets land 9px lower than they need to.
- Smooth scrolling (`scroll-behavior: smooth` on `html`), unless the user prefers reduced motion. Under `prefers-reduced-motion: reduce`, in-page links jump.
- No outline when focus isn't `:focus-visible`, as after a mouse click on a button or link. That hides an outline-width utility's outline too, so a clicked TableCell no longer shows its 3px `focus:outline-[3px]` outline; keyboard focus still shows it. An outline whose style a utility sets, such as `focus:outline-solid`, still shows on a click. The rule doesn't use `@apply`, so the import still compiles under `@import "tailwindcss" prefix(…)`.
- `text-underline-position: from-font` on `underline` and its Tailwind variants, such as `hover:underline` and `focus-visible:underline`. Nothing is generated when your sources don't use `underline`.

**`full.css` changes too:**

- Smooth scrolling now respects reduced motion.
- `hover:underline` and `focus-visible:underline` now get `from-font`, as `underline` already did.
- `underline` no longer resets the decoration's style, thickness or colour, because it no longer sets the `text-decoration` shorthand. `decoration-*` utilities on an underlined element now apply, and a Link that isn't `primary` takes its parent's decoration, through `decoration-inherit` and the `text-decoration: inherit` that preflight gives links.

**Opting out of the scroll padding.** In an app without the MYDS Navbar, or whose headings carry their own scroll margin (Fumadocs headings have `scroll-m-28`), the 65px adds to that margin. Set `html { scroll-padding-top: 0 }` in your stylesheet, or, with the Tailwind import, put `scroll-pt-0` on `<html>`.

**Next.js App Router.** Put `data-scroll-behavior="smooth"` on `<html>`, so that moving to another page jumps to its top instead of scrolling there smoothly.

**Remove the rule you added by hand.** If you followed the old advice and added `html { scroll-behavior: smooth; scroll-padding-top: 65px; }` to your own stylesheet, delete it. MYDS now sets both, and your copy would keep smooth scrolling on under reduced motion.
