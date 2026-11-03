---
"@amerfathullah/myds-react": minor
"@govtechmy/myds-docs": patch
---

Callout is now a note (`role="note"`) for every Variant, including when `variant` is left out, instead of an assertive alert. A note isn't a live region, so screen readers read a callout in reading order with the rest of the page and don't announce it when it appears. As an alert, a callout interrupted the user when it was inserted: one that appeared after the user acted, or every callout on a page reached by client-side navigation, even an Information callout.

- **Your role wins.** A `role` you pass still replaces the default, whatever the Variant.
- **Names.** An `aria-label` or `aria-labelledby` you pass names the note, for example `aria-label="Notis"`.
- **Nothing else changes.** Nothing changes visually: the same elements, classes and icons render. Callout's props and ref types are the same, and its ref is still the root `<div>`. CalloutTitle keeps `role="term"` and CalloutContent `role="definition"`.

**If you upgrade:**

- Pass `role="alert"` to a callout that appears after the user acts and must be announced, such as an error after a failed submit.
- Update tests or CSS that select Callout by `[role="alert"]`.

The docs (EN/MS) say when to pass `role="alert"`, and list `role` in Callout's props.
