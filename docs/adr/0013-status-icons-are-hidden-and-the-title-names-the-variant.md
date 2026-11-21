# Status icons are hidden, and the title names the Variant

Callout, AlertDialog and Toast each draw a status icon chosen by their Variant: a tick in a circle for success, an exclamation mark in a circle for warning, an "i" for information, and a triangle (Callout, Toast) or a diamond (AlertDialog) for an error. The icon and the colour are the only places the Variant shows. Neither reaches a screen reader: an `<svg>` with no name is an image that says nothing, so a screen-reader user isn't told whether a callout is an error or a success (#197). ToastIcon already hides its icon, because the toast's title carries its meaning (#79). So every status icon the component library draws by Variant is hidden from assistive technology (`aria-hidden="true"`) and never named, and the author's title says which Variant it is, in the site's language. It can do that by its wording, such as "Permohonan anda tidak dihantar", or by starting with the Variant's name, such as "Ralat: Borang tidak dihantar". The docs (EN, MS), DESIGN.md and the examples ask for this, and no example is titled with a placeholder such as "Title". Callout follows this rule in #197 and AlertDialog in #SIB.

## Considered Options

- **A Variant label prop with English defaults** ("Success", "Warning", "Information", "Error"), rendered as visually hidden text before the title or as the icon's name: rejected. ADR-0008 gives English defaults to controls with no text of their own, because an English name is better than none. A callout or an alert dialog always has the author's title, so a default would only put an English word in front of it:
  - "Error Permohonan anda tidak dihantar" on a Malay page, read in the Malay voice;
  - "Information" before every callout that leaves `variant` out;
  - the Variant said twice for every author whose title already says it, unless each one knew to switch the default off.

  Malay words would need the `locale` prop that ADR-0008 rejects as the general rule, or the labels context it defers.
- **Naming the icon** (`role="img"` with an `aria-label`), even with words the author sets: rejected. No component in the library names an icon. A screen reader announces it as a separate image before the title. And the word reaches only screen-reader users, while a word in the title also reaches sighted users who can't tell the icons or colours apart.
- **Leaving the icon exposed with no name**: rejected. An image that is neither named nor hidden fails WCAG 1.1.1, and it tells a user nothing.
- **An opt-in label the author sets, with no default**: not needed while the title does the job. It can be added later without breaking anything: as visually hidden text at the start of the title, with its words from the labels context ADR-0008 defers, for Callout, AlertDialog and Toast at once.

## Consequences

- Nothing checks that a title says the Variant. A callout titled "Notis" still doesn't tell a screen-reader user whether it is an error or a success.
- Where a design can't show the Variant's name, the author can put it in visually hidden text at the start of the title, such as `<span className="sr-only">Ralat: </span>`. That replaces a visible name; it is never added on top of one.
- Each component passes `aria-hidden` to the icons it draws. The shared icon components don't change, so an icon an author imports renders as before.
- Hiding an icon adds no prop and changes nothing visible, so it ships as a patch release of `@amerfathullah/myds-react`, as DateField's hidden calendar icon did. Its changeset tells authors to make each title say its Variant, and to update tests that look for an image inside the component.
