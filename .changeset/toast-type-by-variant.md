---
"@amerfathullah/myds-react": minor
"@govtechmy/myds-docs": patch
"@govtechmy/myds-storybook": patch
---

Only error toasts now interrupt the screen reader. Toasts of every other Variant are announced politely, at the next pause, and `toast()` takes `type`. Before, neither ToastRoot nor AutoToast set `type`, and `toast()` couldn't, so unless you passed `type` to ToastRoot or AutoToast yourself, every toast got Radix's default, `"foreground"`, and was announced assertively. A `success` toast interrupted what the screen reader was reading just as an `error` did, and the second of two toasts could cut off the first.

- **The default follows the Variant.** ToastRoot sets `type` to `"foreground"` for an `error` toast, so it is announced assertively. It sets `"background"`, which is announced politely, for `message`, `success`, `info` and `warning`, and for a toast whose `variant` is unset or `null`, which is a `message`. A `type` of `undefined` gets the Variant default, never Radix's `"foreground"`.
- **`toast()` takes `type`.** `ToastEvent` gains an optional `type?: "foreground" | "background"`. Pass `type: "foreground"` for a toast of another Variant that must be heard at once, for example `toast({ variant: "warning", title: "Warning: Your session is about to end", type: "foreground" })`, and `type: "background"` for an error that can wait.
- **A toast's own `type` wins.** A `type` in `toast()` wins over AutoToast's `type`, which wins over the Variant default. On a hand-composed ToastRoot, the `type` you pass wins over the Variant default.
- **`type` isn't the design guideline's Type**, which is `variant`. It sets only how urgently screen readers announce a toast.
- **Nothing else changes.** Nothing changes visually: the same elements, classes and sizes render. Each toast is still announced in a visually hidden `role="status"` span, with "Notification", or your `announceLabel`, before its text. The props and ref types, and ToastContext's value, are the same; only `ToastEvent` gains a field.

**If you upgrade:**

- `<AutoToast type="foreground" />` brings back the old behaviour for every toast. `type: "foreground"` in `toast()` brings it back for one toast, and `type="foreground"` on a hand-composed ToastRoot for that toast.
- In a toaster you compose by hand, pass each event's `type` to its ToastRoot, as the docs' Advanced Usage toaster now does: `<ToastRoot variant={event.variant || "message"} type={event.type}>`. Without it, a toast ignores the `type` passed to `toast()` and gets its Variant's default.
- Update tests that expect `aria-live="assertive"` on a toast that isn't an error.

The docs (EN/MS) say this in a new Screen readers section on the Toast page, and document `type` in ToastRoot's and AutoToast's props and in `ToastEvent` on the useToast page. The docs' Advanced Usage toaster, and the Toast story's Usage block in Storybook, pass each event's `type` to its ToastRoot. The docs site's own toasts follow the Variant default.
