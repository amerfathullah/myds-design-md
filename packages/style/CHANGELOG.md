# @amerfathullah/myds-style

## 2.1.0

### Minor Changes

- 737eea1: Input and TextArea now take an `invalid` prop, as DateField and TimeField do, so a field that fails validation can show it. `invalid` sets the native element's `aria-invalid`, and the error styling follows `aria-invalid="true"`, so an `aria-invalid` you pass yourself, as form libraries do, overrides `invalid`: `<Input aria-invalid />` looks invalid, and `<Input invalid aria-invalid={false} />` looks valid. An invalid field has an `otl-danger-300` border, which it keeps while focused, and shows its 3px `fr-danger` ring only then. On Input only the editable field turns red: the wrapper keeps its `otl-gray-200` border, and `InputAddon` and `InputIcon` keep their colours. `invalid` takes `boolean | null`; omitted, `false` or `null`, the field looks as before. A border class you added to show an error, such as `border-danger-600` on Input, which lands on the wrapper, doesn't re-theme and sets no `aria-invalid`, can go. `full.css` in `@amerfathullah/myds-style` carries the new classes.
- 73321a8: Label now takes a `disabled` prop, so a Label beside a disabled field can show it. Label used to dim only after a disabled sibling marked `peer`, or inside a disabled ancestor marked `group`, and no library field is either, so a Label beside a disabled Input, TextArea, DateField, TimeField, Select or Checkbox kept its `txt-black-700` colour. `disabled` sets the rendered element's `data-disabled`, and the disabled styling, `txt-black-disabled` text with a `not-allowed` cursor, follows `data-disabled="true"`, so it doesn't depend on where the field sits: before it, after it or in another wrapper. A `data-disabled` you pass yourself overrides `disabled`. Label disables nothing, so pass `disabled` to the Label and to the field: `<Label htmlFor="name" disabled>` beside `<Input id="name" disabled />`. `disabled` takes `boolean | null`; omitted, `false` or `null`, the Label looks as before. It never reaches the element as a native `disabled`, with or without `asChild`. Label still dims inside a `<fieldset disabled className="group">`. Once the Label takes `disabled`, a `text-txt-black-disabled` class or a `peer` class added as a workaround can go. `full.css` in `@amerfathullah/myds-style` carries the new classes.
- f73a96d: SearchBar now has a hover state, as the design guideline asks. Pointing at the bar's input container turns its border from `otl-gray-200` to `otl-gray-300`, in every size and in both themes, so pointer users get feedback before they click. It's a semantic token, so it re-themes in the dark theme. Focus still wins: a bar whose input has focus keeps its `otl-primary-300` border and ring while hovered. Nothing else changes on hover, and SearchBar's props are the same. A `hover:` border class you added to the bar yourself can go. `full.css` in `@amerfathullah/myds-style` carries the new class.

### Patch Changes

- 75f291e: In Chromium, DateField and TimeField now fill the focused segment of their native input (day, month or year; hour, minute, second or AM/PM) with primitive `primary-600` and `white` text, the same in both themes. Their classes matched the segment with `:focus`, which Chromium never matches on a `::-webkit-datetime-edit-*-field` pseudo-element, so the browser's own highlight showed instead; they now match it with `:focus-within`. The fill they asked for, `primary-500` with `txt-white`, is replaced: it fell short of the 4.5:1 contrast WCAG AA asks of text, and `txt-white` turns dark in the dark theme. Firefox still shows its own highlight, because it gives page CSS no way to style a segment. `full.css` in `@amerfathullah/myds-style` carries the new classes.
- 6d0d3b0: DateField and TimeField now have an `otl-gray-200` border whether `invalid` is omitted, `null` or `false`. With `invalid` omitted, the border fell back to the preset's primitive `gray-200`, which doesn't re-theme, so in the dark theme the field had a light edge. An invalid field now keeps its `otl-danger-300` border while focused and shows its 3px `fr-danger` ring only then, as the design guideline asks; focus used to replace both with the `otl-primary-300` border and `fr-primary` ring. At rest it shows no ring. The error styling now follows the input's `aria-invalid="true"`, which `invalid` sets, so an `aria-invalid` you pass yourself, as form libraries do, overrides `invalid`: `<DateField aria-invalid />` looks invalid, and `<DateField invalid aria-invalid={false} />` looks valid. `invalid` keeps its type, `boolean | null`. An `invalid={false}` added as a workaround is no longer needed. `full.css` in `@amerfathullah/myds-style` carries the new classes.
- 75be647: In Chromium, a DateField or TimeField whose input is narrower than its text (a fixed `width`, or a `min-width` inside a narrow parent) now scrolls the focused segment fully into view, fill included, whenever keyboard focus moves to it. Chromium's focus scroll used to bring a segment into view only when it was entirely hidden, so a partly hidden one stayed cut off. The fields wrapper inside the edit area now has scroll padding of half its width on each side, which leaves only its centre line, and Chromium centres any focused segment that doesn't cross it. Typing that widens the focused segment, as when an empty AM/PM becomes PM, doesn't scroll it, and neither does a click. A segment wider than half the field, such as milliseconds when `step` is under 1, can stay partly cut. A field at its natural width keeps its layout and never scrolls, in left-to-right and right-to-left locales. `full.css` in `@amerfathullah/myds-style` carries the new classes.
- 0868970: In Chromium, TimeField no longer cuts off the end of its last segment ("09:30 AM" read "09:30 AN"). Chromium overrides the width of a date or time input's edit area with an estimate built from its segments' text, which leaves out the 2px margins the components put around each separator, and cuts off whatever doesn't fit. It cut TimeField at every size and `step`, and at every pixel density and zoom level tested. DateField and TimeField now give the edit area no box (`display: contents` on `::-webkit-datetime-edit`), so the fields wrapper inside it sizes to the segments, and a field widens only by what its segments need, if anything. DateField, which wasn't cut, keeps its width. Remove any `style={{ minWidth: "5.5rem" }}` workaround: it is no longer needed. `full.css` in `@amerfathullah/myds-style` carries the new class.

## 2.0.1

### Patch Changes

- e8bc6e6: Patch release with no change to the public API. `@amerfathullah/myds-react` is rebuilt after an internal lint cleanup: component prop types that were empty interfaces are now type aliases, and the Select multiple-value handler drops an unused assignment. `@amerfathullah/myds-style` is republished unchanged so both packages stay on the same version.

## 2.0.0

### Major Changes

- 56b9af8: The MYDS preset is now native to Tailwind 4: a CSS import in place of the Tailwind 3 JS preset. Every MYDS token keeps its value and its utility name (`bg-bg-white`, `text-txt-black-900`, `rounded-md`, `shadow-card`, …) in both themes, and Tailwind's default colour palette is still unavailable.

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

- 839fbb4: MYDS is now published as `@amerfathullah/myds-react` and `@amerfathullah/myds-style`, continuing `@govtechmy/myds-*` 1.x under names this repository can publish. The migration guide's first step covers the switch. The docs, standard site and Storybook import the new names, and the docs installation pages install them.

## 1.0.0

### Major Changes

- :q
- Fix patch tailwind

## 0.0.10

### Patch Changes

- c6a904f: Fix Tabs vertical padding

## 0.0.9

### Patch Changes

- 2558fb8: Fix alert dialog spacing

## 0.0.8

### Patch Changes

- 1ae118c: Fix Tooltip trigger animation
- 263f775: Refactor CookieBanner component

## 0.0.7

### Patch Changes

- 07e9ffb: Refactored Masthead component

## 0.0.6

### Patch Changes

- 9d51bae: Refactor Navbar component

## 0.0.5

### Patch Changes

- 7964da7: Style update

## 0.0.4

### Patch Changes

- 6ddcc13: Fix --danger color to comply WCAG contrast
- 6ddcc13: CSS output rebuild

## 0.0.3

### Patch Changes

- 97ed561: export tailwind config

## 0.0.2

### Patch Changes

- 23aa39e: adding readme
- 23aa39e: rename myds-css to myds-style

## 0.0.1

### Patch Changes

- eeb6bd4: trial publish
