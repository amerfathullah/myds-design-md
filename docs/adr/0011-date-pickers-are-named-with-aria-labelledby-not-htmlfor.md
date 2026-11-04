# Date pickers are named with aria-labelledby, not a Label's htmlFor

Until #85, the author had no way to label DatePicker's and DateRangePicker's triggers. A trigger's accessible name was only its own text: the date or the placeholder "dd / mm / yyyy", which on DateRangePicker follows a "From:" or "To:" prefix. DESIGN.md's Known Gaps recorded this as a Defect, since the library names DateField and TimeField with a Label whose `htmlFor` matches the field's `id`. The pickers can't follow that pattern, for two reasons:

- **Each picker renders its triggers twice.** Dialog triggers show below `lg:` and Popover triggers from `lg:` up, and CSS alone hides one set: two triggers on DatePicker, four on DateRangePicker. One `id` would be duplicated, and `<label for>` would bind to the first trigger, the mobile one, which is `display: none` on desktop. A Label wrapped around the picker binds to the same mobile trigger.
- **A trigger is a plain button that shows its value.** A `<label for>` replaces a button's text in its name, so the date would no longer be announced.

So both pickers take `aria-labelledby`, `aria-label` and `aria-describedby`, and apply them to every trigger they render. Each trigger's name is the author's label followed by its own visible text, such as "Date of birth 12 Mar 2024" or "Travel dates From: 12 Mar 2024". `aria-describedby` reaches each trigger unchanged: with no `id`, it is the author's only way to attach a hint, such as the earliest date allowed. The pickers take no `id`. Authors write `<Label id="dob">Date of birth</Label>` and `<DatePicker aria-labelledby="dob" />`.

## Considered Options

- **A single trigger, so a Label's `htmlFor` and an `id` work as they do for DateField**: rejected for #85.
  - The picker would choose between Dialog and Popover by viewport in JavaScript, and the library has no media-query hook.
  - The server can't know the viewport, so the first render would have to guess.
  - Crossing `lg` after hydration, or on resize, rotation or zoom, would swap the trigger's Dialog or Popover wrapper, and keeping focus on the trigger would need extra work.
  - A JavaScript breakpoint would also duplicate `lg`, so a consumer who overrides the breakpoint would get two that disagree.
  - It would rewrite the triggers and dialogs that #115 and #169 are written against.
  - A `<label for>` alone would still drop the date from the name, as above.
- **`aria-labelledby` that points at the trigger itself** (the label's id, then the trigger's own), which #85's suggested `id` for the trigger implies: rejected. When a `<label>` also labels the trigger, Chrome and dom-accessibility-api, which the library's tests use, compute different names. That happens with a Label wrapped around the picker, or a Label's `htmlFor` if the pickers ever take an `id`. Chrome keeps the date, and dom-accessibility-api drops it. Instead, a trigger's `aria-labelledby` points at the author's ids and at elements inside the trigger that hold its visible text, and the two engines compute that the same way.
- **The date in `aria-describedby`, with a Label's `htmlFor` naming the trigger**: rejected. A Label's `htmlFor` can name only one of the doubled triggers, so this doesn't solve the doubling. And without a Label, the date would be both the name and the description.
- **A `label` prop that renders a Label**: rejected. No form control in the library renders a Label of its own; the author places it, as for DateField. SelectValue's `label` and DateRangePicker's `fromLabel` / `toLabel` are text inside the trigger, not a Label.
- **An English default name, such as "Choose date"**: rejected by ADR-0008's Scope.
  - The triggers already show text of their own, and a form control the author names gets no default.
  - A default `aria-label` would also replace the date in the trigger's name, and it would hide a picker the author forgot to label.

## Consequences

- The authoring pattern differs from DateField's. The author pairs a Label's `id` with `aria-labelledby` on the picker, not `htmlFor` with an `id`. Clicking the Label doesn't open the picker. The docs (EN, MS) and DESIGN.md must say so.
- Copying DateField's pattern doesn't work. An author who does gets a trigger named only by its date. TypeScript rejects `id` on the pickers, but a Label whose `htmlFor` matches nothing fails silently. In plain JavaScript, an `id` reaches only the open calendar.
- With none of the three props, the triggers render as before, with the same names and text and no `aria-labelledby` or `aria-describedby`. The pickers add no default label, as ADR-0008's Scope sets for form controls.
- `aria-label` names a picker with no visible label, and the trigger's text still follows it, e.g. "Tarikh lahir 12 Mac 2024". An `aria-label` on a button would replace its text, so the picker renders the given text in a hidden element that each trigger's `aria-labelledby` points at. If both props are passed, `aria-labelledby` wins, as it does on any element.
- The props name the whole picker, so they reach every trigger it renders.
  - DateRangePicker's From and To triggers start with the same label. Their prefixes ("From:" / "To:", `fromLabel` / `toLabel`, "Dari:" / "Hingga:") tell them apart.
  - The ids the pickers generate are unique per trigger and per picker, so several pickers on one page never collide.
  - The props don't reach the dialogs and popovers the pickers open; naming those is #169.
- An `aria-label` or `aria-labelledby` passed before this change moves to the trigger. TypeScript doesn't check hyphenated attributes, so authors in TypeScript or plain JavaScript could already pass them. They reached the calendar's root `<div>`, and only while it was open; `aria-describedby` was dropped.
- The change ships as a minor release, since ADR-0008 makes a new naming prop a minor change. The changeset notes that these props now go to the trigger.
- A single trigger remains possible later. If the pickers ever render one, they could also take an `id`, so a Label's `htmlFor` works, without breaking these props. The picker would still have to keep the date in the trigger's name, since a `<label for>` alone replaces it.
