---
"@govtechmy/myds-docs": patch
"@govtechmy/myds-storybook": patch
---

The Toast develop pages (EN/MS) show code you can copy as it is. The first Code tab shows what its Preview does: a button that publishes a toast with `useToast().toast()`, and an `AutoToast` that shows it. Advanced Usage is a complete toaster composed from the toast's parts, `ToastIcon` and `ToastProgress` among them, that shows each toast `toast()` publishes. Both, and the Anatomy block, open with `"use client"` and import everything they use. Before, they used `ToastClose`, `toasts`, `props`, `toast()` and `useEffect` without importing or defining them, and imported `ToastIcon` and `ToastProgress`, which weren't exported. The Malay page has one Anatomi block, which now parses, where the English page has its Anatomy block. The props section documents `ToastIcon` and `ToastProgress`.

The Toast story's Usage block in Storybook shows the same two samples.
