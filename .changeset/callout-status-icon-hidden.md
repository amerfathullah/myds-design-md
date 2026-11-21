---
"@amerfathullah/myds-react": patch
"@govtechmy/myds-docs": patch
"@govtechmy/myds-storybook": patch
---

Callout's status icon (the `<svg>` it picks by Variant) and the cross in a `dismissible` callout's close button are now hidden from assistive technology (`aria-hidden="true"`). Before, each was an image with no name: screen readers met an image that said nothing, and nothing told them the Variant. Nothing changes visually: the same elements, classes, icons and sizes render.

- **The close button.** It's still named "Close", or by `closeLabel`. Its cross is hidden as Pill's remove cross is.
- **Roles.** Hiding the icons changes no role: Callout is a note (`role="note"`), or the `role` you pass. CalloutTitle keeps `role="term"` and CalloutContent `role="definition"`.
- **Nothing else changes.** Callout's props and ref types, and CalloutContext's value, are the same. An icon you import on its own, such as `InfoIcon` or `CrossIcon`, renders as before, with no `aria-hidden`.
- **The title says the Variant.** Callout adds no text, prop or attribute for it. The icon and the colour don't reach screen readers, so the title must say it.

**If you upgrade:**

- Make each callout's title say its Variant, in your site's language. Its wording can say it, such as "Permohonan anda tidak dihantar", or it can start with the Variant's name, such as `<CalloutTitle>Ralat: Borang tidak dihantar</CalloutTitle>`. Where the design can't show that word, start the title with visually hidden text, `<span className="sr-only">Ralat: </span>`, instead of a visible name, never as well as one.
- Update tests that look for an image inside a callout.

The docs (EN/MS) say the title must say the Variant and show how. Every Callout title that was "Title" or "Tajuk" in the docs and stories now starts with its Variant's name, such as "Error: Form not sent", and so do the Dismissible previews' titles. The Storybook demo's title follows its `variant` control. The `variant` prop's descriptions in the docs and Storybook say it sets the colour and the icon, and that the title must say the Variant.
