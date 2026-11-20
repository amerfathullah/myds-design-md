---
"@amerfathullah/myds-react": minor
---

`ToastIcon` and `ToastProgress` are now exported from `@amerfathullah/myds-react/toast`, so a toast you compose from `ToastRoot` can show the status icon and the countdown bar that `AutoToast` shows. Before, only AutoToast could render them, and the docs' samples that imported them didn't compile.

- **`ToastIcon`** draws the toast's 20px status icon in the variant's colour: a tick for `success`, an "i" for `info`, an exclamation mark in a circle for `warning` and in a triangle for `error`. It draws nothing for `message`.
- **`ToastProgress`** draws the 4px countdown bar along the toast's bottom edge, filled in the variant's colour. It shrinks to nothing over `ToastRoot`'s `duration` (default 5000ms) and pauses while the pointer is over the toast.
- **Render both inside a `ToastRoot`**, which gives them their variant and the bar its duration. Outside one, ToastIcon renders nothing and ToastProgress draws the `message` bar over 5000ms.
- **Both are hidden from assistive technology** (`aria-hidden="true"`), because the toast's title carries its meaning. Each takes a `<div>`'s props, apart from `children`, and its ref is that `<div>`.
- **`className` and `style`.** On ToastIcon, a `className` goes on the `<div>` around the icon, once; the icon keeps its size and colour. On ToastProgress, a `className` adds to the classes that place and animate the bar, and a conflicting utility, such as `bottom-1`, replaces only the one it conflicts with. A `style` adds to the bar's animation duration, which it can also set.

AutoToast's toasts render as before, for every variant.
