---
"@amerfathullah/myds-react": minor
"@govtechmy/myds-docs": patch
---

More built-in accessible names that were fixed in English can now be renamed in your site's language. Each keeps its English default.

- **New `closeLabel` prop** on `DialogBody` and `AlertDialogContent`, defaulting to "Close". It names the close button in the top-right corner, for example `closeLabel="Tutup"`. `hideClose` still removes the button, and an `aria-label` still goes to the dialog.
- **New `closeLabel` prop** on `Pill`, defaulting to "Close". It names the remove button that `onDismiss` adds. Pills often sit side by side, so give each its own name, for example ``closeLabel={`Buang ${name}`}``. Pill's other props still go to its container.
- **Pill's remove button is now named "Close" instead of "close button".** The name now sits on the `<button>` itself, and the cross icon inside it is hidden from assistive technology (`aria-hidden="true"`).
- **New `viewportLabel` and `announceLabel` props** on `AutoToast`. `viewportLabel`, default "Notifications ({hotkey})", names the region that holds the toasts; Radix replaces `{hotkey}` with F8, so `viewportLabel="Pemberitahuan ({hotkey})"` gives "Pemberitahuan (F8)". `announceLabel`, default "Notification", is what screen readers announce before each toast's text, for example `announceLabel="Pemberitahuan"`. Don't pass an empty `announceLabel`: Radix logs an error.
- **An `aria-label` on `SearchBarResultsList` now names the listbox.** cmdk used to overwrite it with its own "Suggestions". The default is still "Suggestions", and cmdk's `label` still works; when you pass both, `aria-label` wins.

None of the new props reaches the DOM. Nothing changes visually: the same elements, classes and icons render.

The docs (EN/MS) document the new props and default names. The Toast docs also explain the `label` on `ToastViewport` and `ToastProvider` for toasts composed by hand.
