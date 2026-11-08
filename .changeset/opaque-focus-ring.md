---
"@amerfathullah/myds-style": minor
---

The focus ring tokens, `fr-primary` and `fr-danger`, are now opaque, so a focus ring contrasts at least 3:1 with the surface around it, as WCAG's SC 1.4.11 (Non-text Contrast) asks of a focus indicator. At 40% alpha they were 1.28:1 to 1.37:1 against the page, so keyboard users with low vision could hardly see where focus was.

- **`fr-primary`** is `primary-700` (`#1D4ED8`) in light, where it was `primary-300` @ 40%, and `primary-300` (`#96B7FF`) in dark, where it was `primary-700` @ 40%.
- **`fr-danger`** is `danger-700` (`#B91C1C`) in light, where it was `danger-300` @ 40%, and `danger-300` (`#FCA5A5`) in dark, where it was `danger-700` @ 40%.

These are the primitives the `bg-primary-700` and `bg-danger-700` tokens (`bg-bg-primary-700`, `bg-bg-danger-700`) use in each theme. Against the page (`bg-white`), `fr-primary` is now 6.70:1 in light and 8.87:1 in dark, and `fr-danger` 6.47:1 and 9.33:1. Against the other surfaces a ring sits on, such as dialogs, callouts, the calendar's range cells and the Masthead trigger's fill, both stay at 5.10:1 or more.

Every MYDS focus ring changes colour. Which controls draw it, how wide it is, and when they draw it don't change.

**Your own `fr-*` utilities change too.** Anything you write with an `fr-*` token takes the new colour with no code change: `ring-fr-primary`, `bg-fr-primary`, `text-fr-danger`, `border-fr-danger`, `outline-fr-primary` and so on. An opacity modifier now takes its share of an opaque colour, not of a 40% one: `ring-fr-primary/50` in light is `primary-700` @ 50%, where it was `primary-300` @ 20%.

**On a filled control, the ring now sits close to the fill's colour.** A `primary-fill` button's `primary-600` is 1.30:1 against the ring in light and 2.59:1 in dark, so the ring is hard to tell apart from the fill where they touch. Button rings on `focus:`, so after a click it can be focused and hovered at once, and its hover fill, `primary-700`, is the light ring's own colour. The ring still contrasts with the surface around the control, which is what SC 1.4.11 asks of a ring drawn outside it.

`full.css` carries the new values.
