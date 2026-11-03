# Built-in accessible names are props with English defaults

Some components render a control the author never writes, such as Callout's `dismissible` cross or AutoToast's close button. Others export icon-only parts, such as `SearchBarSearchButton`. Each of these needs an accessible name in the site's language, and an official service may run in Malay, English or both. So each one has an English default that the author can replace on any instance. A part the author renders takes its name from its own `aria-label`: the default goes before `{...props}`, so the author's `aria-label` wins. A control the author doesn't render gets a label prop on the component that renders it, as ThemeSwitch's `selectLabel` (#61) already does. DateRangePicker's `fromLabel` / `toLabel` do the same for the "From:" / "To:" its triggers show. A close or dismiss control's prop is `closeLabel`, defaulting to "Close". This sets the mechanism for #79 (controls with no name) and #80 (names fixed in English).

## Scope

The English defaults are for controls with no text of their own, such as a close cross or an icon-only button. A form control that the author names with a visible label, such as Input, Checkbox, Radio or Switch, gets no default. Its name comes from that label (`<Label htmlFor>`), or from an `aria-label` or `aria-labelledby` the author passes. A default `aria-label` would override the label, so the control would be announced by the default and not by the text shown next to it. That fails WCAG 2.5.3, as MastheadTrigger's default does (#177). Switch was the only form control with a default, a fixed "Toggle", and #81 removes it rather than making it a prop. Leaving the name out doesn't make a name prop required, so the rejection of required names below still stands.

## Considered Options

- **One shared labels or locale context**, a provider that supplies every built-in name: rejected for now. It would let a Malay-language service set every name once instead of on each instance. But the library has no such context, so it would be a new provider and set of keys to keep stable, and until #119 is fixed, a provider from one entry doesn't reach components from another in the CommonJS build. Names that differ per instance, such as which pill a remove button removes, would still need props. A context can be added later as a source of defaults for these same props without breaking them.
- **A `locale` prop with built-in Malay names**, as DateRangePicker's `locale="ms"` picks `Dari:` / `Hingga:`: rejected as the general rule. The library would have to own a Malay translation of every name, for two languages only, and authors would still need props to reword one, as `fromLabel` / `toLabel` show. DatePicker and DateRangePicker keep their `locale`, which also formats their dates. Their calendar can take most of its names from it too, because react-day-picker's own `ms` locale already translates them.
- **Required names with no default**: rejected. It would stop a Malay-language service shipping English names unnoticed, but making a name prop required breaks existing uses, and an English name is better than none.

## Consequences

- Adding a label prop is a minor change. Moving a fixed name before `{...props}` changes only what an author's `aria-label` does: it now renames the control instead of being overwritten.
- Each new prop is documented in the English and Malay docs and in DESIGN.md, with a Malay example (e.g. `closeLabel="Tutup"`), as ThemeSwitch's docs give `selectLabel="Tema"`.
