# Built-in accessible names are props with English defaults

Some components render a control the author never writes, such as Callout's dismiss cross or AutoToast's close button. Others export icon-only parts, such as `SearchBarSearchButton`. Each of these needs an accessible name in the site's language, and an official service may be in Malay or English. So each one has an English default that the author can replace on any instance. A part the author renders takes its name from its own `aria-label`: the default goes before the props, so the author's `aria-label` wins. A control the author doesn't render gets a label prop on the component that renders it, as ThemeSwitch's `selectLabel` (#61) and DateRangePicker's `fromLabel` / `toLabel` already do. A close or dismiss control's prop is `closeLabel`, defaulting to "Close". This sets the mechanism for #79 and #80.

## Considered Options

- **One shared labels or locale context**, a provider that supplies every built-in name: rejected for now. The library has no such context, so every consumer would have to mount a new provider. Names that differ per instance, such as which pill a remove button removes, would still need props. A context can be added later as a source of defaults for these same props without breaking them.
- **A `locale` prop with built-in Malay names**, as DatePicker and DateRangePicker choose `Dari:` / `Hingga:`: rejected as the general rule. The library would have to own a translation of every name, for two languages only, and an author still couldn't reword one. DatePicker and DateRangePicker keep their `locale`.
- **Required names with no default**: rejected. Making a name prop required breaks every existing use, and an English name is better than none.

## Consequences

- Adding a label prop is a minor change. Moving a fixed name before `{...props}` changes only what an author's `aria-label` does: it now renames the control instead of being overwritten.
- Each new prop is documented in the English and Malay docs and in DESIGN.md, with an example in the page's language (e.g. `closeLabel="Tutup"`).
