---
"@govtechmy/myds-react": major
---

Components are now styled for Tailwind 4 and need the Tailwind 4 `@govtechmy/myds-style` 2.x. The React peer range is unchanged: `^18.0.0 || ^19.0.0`.

- **Tailwind 4 class names.** Components use `outline-hidden` instead of `outline-none` and `ring-3` instead of a bare `ring`. Stacked variants are written in Tailwind 4's left-to-right order: the calendar's range days, table header borders, tab underlines and toggle thumbs. Search bar and skeleton gradients use `bg-linear-to-*/srgb`, and Spinner's ring uses `bg-conic/srgb`: Tailwind 4's gradient stops don't work in a hand-written `conic-gradient()`, so the ring would disappear. DateField and TimeField put back the 1px padding inside the native field that Tailwind 4's base styles remove, so they keep their height. Dialog's open and close animation no longer adds `slide-in-from-left-1/2 slide-in-from-top-[48%]` to its centring translate. They render as they did on Tailwind 3; compiled with Tailwind 3, they wouldn't.
- **`clx` uses tailwind-merge 3**, which knows Tailwind 4's class groups. It's configured for the MYDS theme, so a text size and a text colour don't cancel each other (`clx("text-txt-danger", "text-body-sm")` keeps both), and MYDS shadows and named animations now override each other and `shadow-none` / `animate-none`.

### Migrating from 1.x

1. Move to `@govtechmy/myds-style` 2.x and Tailwind 4 as described in its changelog.
2. Replace the `content` entry for the library with `@source` in your stylesheet, pointing from the stylesheet to the package's `dist`:

   ```css
   @import "tailwindcss";
   @import "@govtechmy/myds-style";

   @source "../node_modules/@govtechmy/myds-react/dist";
   ```

3. If you pass `className` to components, check it for the Tailwind 4 renames listed in the `@govtechmy/myds-style` changelog (`outline-none`, bare `ring`, stacked variants).
