---
"@amerfathullah/myds-react": patch
---

AlertDialog's `variant` is now optional and defaults to `default`, as its docs say. A missing, `null` or unknown `variant`, which plain JavaScript or a cast can pass, now renders as `default` instead of throwing a TypeError. The throw stopped the whole dialog from rendering, its trigger too, whether open, closed or server-rendered. TypeScript still rejects `null` and any name but `default`, `info`, `success`, `warning` and `danger`. Opening a `default` dialog no longer logs React's warning about an invalid `className` prop on `React.Fragment`. It still shows no status icon, and its layout is unchanged.
