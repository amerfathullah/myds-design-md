---
"@amerfathullah/myds-react": patch
---

A `multiple` Select now works in a form. Before, it handed its array of values to the hidden native `<select>` that Radix renders for a form, which takes a single value. Now it renders a visually hidden `<select multiple>` of its own instead, with a selected option for each value. That control carries Select's `name`, `form`, `required`, `disabled` and `autoComplete`.

- **No warning.** A `multiple` select no longer logs React's "The `defaultValue` prop supplied to `<select>` must be a scalar value if `multiple` is false", inside or outside a form, rendered on the server or hydrated.
- **Picks stay.** Inside a `<form>`, or with `form`, each pick calls `onValueChange` once with the whole selection, as outside a form. Before, the hidden `<select>` reported each pick back as a second one, so a pick made from nothing was undone, and other picks added or removed a stray `""`.
- **It submits each selected value under `name`**, as a native `<select multiple>` does, and nothing while nothing is selected. That holds for `defaultValue`, for a controlled `value` and after picks. Before, it submitted one value until the first pick, the first item unless exactly one was selected, and nothing after it.
- **`required` holds.** The form is invalid while nothing is selected. Before, it passed validation.
- **A form's reset restores the starting selection**, `defaultValue` or nothing, and calls `onValueChange` once with that array. A controlled select shows it once you pass the new `value`. Before, the reset added the starting array to the selection as one more item.

A disabled `multiple` select still submits nothing. Single selects work as before, and so does a `multiple` select outside a form.
