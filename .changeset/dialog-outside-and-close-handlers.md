---
"@amerfathullah/myds-react": patch
---

DialogBody and AlertDialogContent now call your `onInteractOutside` with Radix's event before their own handling of a press outside, instead of being replaced by it. Before, passing any `onInteractOutside`, even one that did nothing, or `onInteractOutside={undefined}`, silently switched off `dismissible={false}` and `onDismiss`.

- **`dismissible={false}` still keeps the dialog open** on a press outside, whatever your handler does.
- **`onDismiss` still runs when a press outside closes the dialog,** once, after your handler.
- **`onDismiss` no longer runs when the dialog stays open:** on a right-click outside, or when your `onInteractOutside` or `onPointerDownOutside` called `preventDefault()`. Calling `preventDefault()` in your `onInteractOutside` still keeps a dismissible dialog open.

DialogClose and AlertDialogClose now call your `onClick`, which they used to drop, before `onDismiss`. Calling `preventDefault()` in it, or in the `onClick` of the element inside it, keeps the dialog open without calling `onDismiss`. Before, `preventDefault()` in that element's `onClick` kept the dialog open but still called `onDismiss`.

Escape, the built-in close cross, `onPointerDownOutside`, `onEscapeKeyDown` and every other prop work as before, and the props types don't change.
