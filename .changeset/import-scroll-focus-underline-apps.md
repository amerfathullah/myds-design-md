---
"@govtechmy/myds-docs": patch
"@govtechmy/kd-standard": patch
"@govtechmy/myds-storybook": patch
---

The docs and standard sites and Storybook now take the scroll, focus and underline rules from `@amerfathullah/myds-style`. Storybook drops its own copies of them, the box-sizing pair included, so stories render as an app on the Tailwind import does. The docs and standard sites set `html { scroll-padding-top: 0 }`, so a Fumadocs heading still lands 112px from the top (its `scroll-m-28`) rather than 177px. They also drop their own unconditional smooth scrolling, so they scroll smoothly only when the user hasn't asked for reduced motion.
