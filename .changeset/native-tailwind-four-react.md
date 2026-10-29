---
"@amerfathullah/myds-react": major
---

Components are now styled for Tailwind 4 and need the Tailwind 4 `@amerfathullah/myds-style` 2.x. The React peer range is unchanged: `^18.0.0 || ^19.0.0`.

- **Tailwind 4 class names.** Components use `outline-hidden` instead of `outline-none` and `ring-3` instead of a bare `ring`. Stacked Tailwind variants (`hover:*:`, `data-[state=checked]:before:` …) are written in Tailwind 4's left-to-right order: the calendar's range days, table header borders, tab underlines and toggle thumbs. Search bar and skeleton gradients use `bg-linear-to-*/srgb`, and Spinner's ring uses `bg-conic/srgb`: Tailwind 4's gradient stops don't work in a hand-written `conic-gradient()`, so the ring would disappear. DateField and TimeField put back the 1px padding inside the native field that Tailwind 4's preflight removes, so they keep their height. Dialog's open and close animation no longer adds `slide-in-from-left-1/2 slide-in-from-top-[48%]` to its centring translate. They render as they did on Tailwind 3; compiled with Tailwind 3, they wouldn't.
- **`clx` uses tailwind-merge 3**, which knows Tailwind 4's class groups. It's configured for the MYDS theme, so a text size and a text colour don't cancel each other (`clx("text-txt-danger", "text-body-sm")` keeps both), and MYDS shadows and named animations now override each other and `shadow-none` / `animate-none`.

### Migrating from 1.x

1. **Switch to the new package names.** 2.0.0 continues `@govtechmy/myds-*` 1.x as `@amerfathullah/myds-*`. Uninstall the `@govtechmy/myds-*` packages and install their `@amerfathullah/myds-*` successors, then replace `@govtechmy/myds-` with `@amerfathullah/myds-` in every import, CSS `@import` and `@source` path:

   ```sh
   npm install @amerfathullah/myds-react @amerfathullah/myds-style
   ```

2. Move to `@amerfathullah/myds-style` 2.x and Tailwind 4 as described in its changelog.
3. Replace the `content` entry for the library with `@source` in your stylesheet, pointing from the stylesheet to the package's `dist`:

   ```css
   @import "tailwindcss";
   @import "@amerfathullah/myds-style";

   @source "../node_modules/@amerfathullah/myds-react/dist";
   ```

4. If you pass `className` to components, check it for the Tailwind 4 renames listed in the `@amerfathullah/myds-style` changelog (`outline-none`, bare `ring`, stacked Tailwind variants).
