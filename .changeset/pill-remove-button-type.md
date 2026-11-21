---
"@amerfathullah/myds-react": patch
---

Pill's remove button is now `type="button"`. It was a submit button, so inside a `<form>`, as in a tags field, removing a pill could submit the form, and Enter in a field could remove a pill.

- **Click.** Clicking the remove button calls `onDismiss` and no longer submits a form around the pill. It did whenever `onDismiss` left the pill rendered.
- **Enter.** Enter in a field no longer activates a pill's remove button. When the pills came before the form's own submit button, or the form had none, the first pill's remove button was the form's default button, so Enter called that pill's `onDismiss`, and a tags field lost its first tag. Enter now submits the form as it would without the pills: through the form's own submit button, or, in a form with no submit button and one text field, with no submitter.
- **Workaround.** A `preventDefault()` in `onDismiss`, used as a workaround, can stay but is no longer needed.

`Button` doesn't change: it still renders no `type` unless you pass one, so an untyped `Button` inside a form still submits it. Pill's props and look don't change.
