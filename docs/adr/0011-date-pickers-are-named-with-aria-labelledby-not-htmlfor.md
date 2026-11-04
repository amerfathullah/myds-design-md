# Date pickers are named with aria-labelledby, not a Label's htmlFor

Nothing can name DatePicker's and DateRangePicker's triggers (#85). A trigger's accessible name is only what it shows: the date or the placeholder "dd / mm / yyyy", after "From:" / "To:" on DateRangePicker. DateField and TimeField are named the usual way, by a Label whose `htmlFor` matches the field's `id`. The pickers can't follow that pattern, for two reasons:

- **Each picker renders its triggers twice.** There is a Dialog trigger shown below `lg:` and a Popover trigger from `lg:` up, and only CSS hides one of them. One `id` would be duplicated, and `<label for>` would bind to the first trigger, the mobile one, which is `display: none` on desktop.
- **A trigger is a plain button that shows its value.** A `<label for>` replaces a button's text in its name, so the date would no longer be announced.

So both pickers take `aria-labelledby`, `aria-label` and `aria-describedby`, and pass them to every trigger they render. A trigger's name is the author's label followed by its own visible text, such as "Date of birth 12 Mar 2024" or "Travel dates From: 12 Mar 2024". The pickers take no `id`. Authors write `<Label id="dob">Date of birth</Label>` and `<DatePicker aria-labelledby="dob" />`.

## Considered Options

- **A single trigger, so `<Label htmlFor>` and `id` work as they do for DateField**: rejected for #85.
  - The picker would choose between Dialog and Popover by viewport in JavaScript, and the library has no media-query hook. The server can't know the viewport, so the trigger would be remounted after hydration, and lose focus if it had it.
  - A JavaScript breakpoint would duplicate `lg`, so a consumer who overrides the breakpoint would get two that disagree.
  - It would rewrite the trigger code that other open issues are written against.
  - `htmlFor` alone would still drop the date from the name.
  - It can be reopened as its own issue if `htmlFor` parity is wanted.
- **`aria-labelledby` that points at the trigger itself** ("label-id trigger-id"), as #85 first suggested: rejected. When a `<label for>` also points at the trigger, Chrome and dom-accessibility-api, which the library's tests use, compute different names. Instead, a trigger's `aria-labelledby` points at the author's ids and at elements inside the trigger that hold its visible text. Both compute that the same way.
- **The date in `aria-describedby`, with a Label's `htmlFor` naming the trigger**: rejected. Each trigger would still need a unique `id`, so this doesn't fix the duplicate. Without a Label, the date would be both the name and the description.
- **A `label` prop that renders a Label**: rejected. No form control in the library renders its own label, and the author places the Label.
- **An English default name, such as "Choose date"**: rejected by ADR-0008's Scope. A default would override the author's label.

## Consequences

- **The authoring pattern differs from DateField's.** The author pairs `<Label id>` with `aria-labelledby` on the picker, not `htmlFor` with `id`, and clicking the Label doesn't open the picker. The docs (EN, MS) and DESIGN.md say so. An author who copies DateField's pattern gets no name and no warning: `htmlFor` finds no matching `id`, and the pickers' props don't accept one.
- **With none of the three props, the triggers render as before**, with the same names and text and no `aria-labelledby`. A picker has no name of its own, as ADR-0008's Scope sets for form controls.
- **`aria-label` names a picker that has no visible label, and the trigger's text still follows it,** e.g. "Tarikh lahir 12 Mac 2024". An `aria-label` on a button would replace its text, so the picker renders the given text in a hidden element that each trigger's `aria-labelledby` points at. If both props are passed, `aria-labelledby` wins, as it does on any element.
- **The props name the field, so they reach every trigger.**
  - DateRangePicker's From and To triggers start with the same label; their prefixes ("From:" / "To:", `fromLabel` / `toLabel`, "Dari:" / "Hingga:") tell them apart.
  - The pickers generate the ids they reference with `useId`, so several pickers on a page share no ids.
  - The dialogs and popovers the pickers open are named separately (#169).
- **`aria-label` and `aria-labelledby` from plain JavaScript change target.** TypeScript doesn't check hyphenated attributes, so authors could pass them before. They reached the calendar's root `<div>`, and only while it was open; `aria-describedby` was dropped. They now name the trigger.
- **The change ships as a minor release.** ADR-0008 makes a new naming prop a minor change. The changeset notes the change of target.
- **A single trigger stays open as a later change.** If the pickers ever render one, `id` and `htmlFor` could be added alongside these props without breaking them.
