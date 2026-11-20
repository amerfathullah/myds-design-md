---
"@amerfathullah/myds-react": minor
"@govtechmy/myds-docs": patch
"@govtechmy/myds-storybook": patch
---

`RadioHintText` now describes its radio instead of being part of its name. It renders a `<div>`, and the `RadioButton` in the same `RadioItem` points `aria-describedby` at it by itself, so you pass nothing to wire it. Before, the hint was a `<label>`, and every documented example gave it the same `htmlFor` as the item's `RadioLabel`, which made it a second label of the radio: screen readers announced an option as "Email We will send notifications to your registered email address." with no description, and the longer the hints, the slower the options were to tell apart.

- **Name and description.** A radio is now named by its `RadioLabel` alone, and described by the text of the `RadioHintText`s in its `RadioItem`, in document order, which screen readers read after the name.
- **`htmlFor` and `form` are deprecated.** They still compile, but do nothing and never reach the DOM. Leave them out; they're removed at the next major.
- **Clicking the hint no longer selects the radio.** Clicking the `RadioLabel` still does.
- **Your ids.** An `aria-describedby` you pass `RadioButton` follows the hints' ids, each id once, and `aria-describedby={undefined}` doesn't drop them. A radio with no hint gets no `aria-describedby`. An `id` you pass `RadioHintText` is rendered and referenced, or it generates one. Code that wired the hint by hand, with an `id` on the hint and the same id in the button's `aria-describedby`, still reads the hint once.
- **Server rendering.** Server-rendered HTML doesn't carry the description; it arrives when the page hydrates, as the radios themselves work only after hydration.

The generated ids come from React's `useId()`, so don't rely on their format; it differs between React 18 and 19. The hint keeps its classes at every size and when disabled.

**If you upgrade:**

- Retarget CSS or tests that select the hint as a `label`, or that expect its text in the radio's name.
- The hint is now a block. Inside the documented `grid` wrapper it looks the same; where it sat inline beside its label, it now starts on its own line.
- A ref typed `HTMLLabelElement` still compiles, but now receives the `<div>`.
- Mixing a `RadioButton` from an older 2.x copy of the library with a newer `RadioHintText` loses the description.

The docs (EN/MS) and the Radio story no longer pass `htmlFor` to `RadioHintText`. The previews on each develop page, and the stories on the Radio autodocs page, now generate their ids, so none repeats an id: before, every label on a page pointed at the first group's radio, and the radios in the other groups had no name. The Size sample's three groups get ids of their own, such as `email-small`. The Props sections describe `RadioItem` under `RadioItem`, and say `RadioHintText` takes a `div`'s props, describes its radio, doesn't select it when clicked and ignores the deprecated `htmlFor`. The story's usage comment names `RadioHintText`, not `RadioHelpText`, which doesn't exist.
