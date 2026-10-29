---
"@amerfathullah/myds-style": major
---

The MYDS preset is now native to Tailwind 4: a CSS import in place of the Tailwind 3 JS preset. Every MYDS token keeps its value and its utility name (`bg-bg-white`, `text-txt-black-900`, `rounded-md`, `shadow-card`, …) in both themes, and Tailwind's default colour palette is still unavailable.

**Removed:** the JS exports `preset` and `preset_fumadocs`, `tailwind.config.js` and the `index.d.ts` types. `tailwindcss` 3 and `tailwindcss-animate` are no longer dependencies. **Added:** the main entry `@amerfathullah/myds-style` (CSS) and `@amerfathullah/myds-style/fumadocs.css`. **Unchanged:** `full.css`, `color.css`, `light.css` and `dark.css`; `full.css` is now built with Tailwind 4.

### Migrating from 1.x

1. **Switch to the new package names.** 2.0.0 continues `@govtechmy/myds-*` 1.x as `@amerfathullah/myds-*`. Swap each `@govtechmy/myds-*` dependency for its `@amerfathullah/myds-*` successor, then replace `@govtechmy/myds-` with `@amerfathullah/myds-` in every import, CSS `@import` and `@source` path. If you use both packages:

   ```sh
   npm install @amerfathullah/myds-react @amerfathullah/myds-style
   ```

2. **Install Tailwind 4** with the integration for your build tool, such as `@tailwindcss/vite` or `@tailwindcss/postcss`. `tailwindcss` ^4 is an optional peer dependency: you need it only to use the CSS import, not for `full.css`. Tailwind 4 needs Safari 16.4, Chrome 111 or Firefox 128 or newer, and that applies to `full.css` too. See Tailwind's [upgrade guide](https://tailwindcss.com/docs/upgrade-guide).

3. **Replace `presets: [preset]` with the CSS import.** Import MYDS once, after Tailwind, and point `@source` at the component library in place of the `content` glob:

   ```css
   @import "tailwindcss";
   @import "@amerfathullah/myds-style";

   @source "../node_modules/@amerfathullah/myds-react/dist";
   ```

   The import includes `color.css`, `light.css` and `dark.css`, so drop separate imports of them. Delete `tailwind.config.*` if it only loaded the preset. Move your own extensions into `@theme` (for example `--color-brand: #123456;`), because Tailwind 4 reads JS configs only through its legacy `@config`. The fonts aren't part of the import, so keep loading Inter and Poppins yourself, or use `full.css`.

4. **Fumadocs: replace `preset_fumadocs`.** Import the Fumadocs entry after the Fumadocs theme, and import MYDS before Fumadocs so the MYDS colour reset doesn't remove Fumadocs' own colours:

   ```css
   @import "tailwindcss";
   @import "@amerfathullah/myds-style";
   @import "fumadocs-ui/css/neutral.css";
   @import "fumadocs-ui/css/preset.css";
   @import "@amerfathullah/myds-style/fumadocs.css";
   ```

5. **Class names.** No MYDS class changes. Some Tailwind core utilities changed in Tailwind 4, so check classes in your own markup:
   - `outline-none` is now `outline-hidden`.
   - A bare `ring` is 1px; write `ring-3` for the old 3px.
   - Stacked Tailwind variants (`hover:`, `before:`, `*:` …) apply left to right, so `*:hover:x` becomes `hover:*:x` and `before:data-[state=open]:x` becomes `data-[state=open]:before:x`.
   - `bg-gradient-to-*` now interpolates in oklab; use `bg-linear-to-*/srgb` to keep the same colours.
   - Gradient stops now begin with the gradient's position, so an arbitrary `bg-[conic-gradient(var(--tw-gradient-stops))]` renders nothing; use `bg-conic/srgb`.
   - Tailwind 4's preflight also removes the browser's 1px padding from table cells and from inside native date and time inputs.
   - `hover:` styles now apply only on devices that can hover, so a tap on a touch screen no longer leaves them on.
   - Tailwind 4's default `font-sans` stack starts with `-apple-system` instead of `ui-sans-serif, system-ui`. `font-body` and `font-heading` keep Tailwind 3's stack after Inter and Poppins, so put `font-body` on your page's root, as before, rather than relying on the default font.
   - `blur-sm` is now `blur-xs`, and a bare `blur` is now `blur-sm`.
   - Don't apply Tailwind's renames to `rounded-*` or `shadow-*` classes. MYDS defines both scales itself, and their names and values haven't changed: `rounded-sm` is still 6px, and only `shadow-button`, `shadow-card` and `shadow-context-menu` exist.

   The import keeps three Tailwind 3 defaults the MYDS look depends on: borders default to `gray-200`, input and textarea placeholders are `gray-400`, and buttons have a pointer cursor.

6. **React.** `@amerfathullah/myds-react` 2.x needs this release. Its React peer range is unchanged: `^18.0.0 || ^19.0.0`.
