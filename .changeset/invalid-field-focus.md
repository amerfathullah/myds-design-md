---
"@amerfathullah/myds-react": patch
"@amerfathullah/myds-style": patch
---

DateField and TimeField now have an `otl-gray-200` border whether `invalid` is omitted, `null` or `false`. With `invalid` omitted, the border fell back to the preset's primitive `gray-200`, which doesn't re-theme, so in the dark theme the field had a light edge. An invalid field now keeps its `otl-danger-300` border while focused and shows its 3px `fr-danger` ring only then, as the design guideline asks; focus used to replace both with the `otl-primary-300` border and `fr-primary` ring. At rest it shows no ring. The error styling now follows the input's `aria-invalid="true"`, which `invalid` sets, so an `aria-invalid` you pass yourself, as form libraries do, overrides `invalid`: `<DateField aria-invalid />` looks invalid, and `<DateField invalid aria-invalid={false} />` looks valid. `invalid` keeps its type, `boolean | null`. An `invalid={false}` added as a workaround is no longer needed. `full.css` in `@amerfathullah/myds-style` carries the new classes.
