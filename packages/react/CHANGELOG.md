# @amerfathullah/myds-react

## 2.1.0

### Minor Changes

- 737eea1: Input and TextArea now take an `invalid` prop, as DateField and TimeField do, so a field that fails validation can show it. `invalid` sets the native element's `aria-invalid`, and the error styling follows `aria-invalid="true"`, so an `aria-invalid` you pass yourself, as form libraries do, overrides `invalid`: `<Input aria-invalid />` looks invalid, and `<Input invalid aria-invalid={false} />` looks valid. An invalid field has an `otl-danger-300` border, which it keeps while focused, and shows its 3px `fr-danger` ring only then. On Input only the editable field turns red: the wrapper keeps its `otl-gray-200` border, and `InputAddon` and `InputIcon` keep their colours. `invalid` takes `boolean | null`; omitted, `false` or `null`, the field looks as before. A border class you added to show an error, such as `border-danger-600` on Input, which lands on the wrapper, doesn't re-theme and sets no `aria-invalid`, can go. `full.css` in `@amerfathullah/myds-style` carries the new classes.
- 73321a8: Label now takes a `disabled` prop, so a Label beside a disabled field can show it. Label used to dim only after a disabled sibling marked `peer`, or inside a disabled ancestor marked `group`, and no library field is either, so a Label beside a disabled Input, TextArea, DateField, TimeField, Select or Checkbox kept its `txt-black-700` colour. `disabled` sets the rendered element's `data-disabled`, and the disabled styling, `txt-black-disabled` text with a `not-allowed` cursor, follows `data-disabled="true"`, so it doesn't depend on where the field sits: before it, after it or in another wrapper. A `data-disabled` you pass yourself overrides `disabled`. Label disables nothing, so pass `disabled` to the Label and to the field: `<Label htmlFor="name" disabled>` beside `<Input id="name" disabled />`. `disabled` takes `boolean | null`; omitted, `false` or `null`, the Label looks as before. It never reaches the element as a native `disabled`, with or without `asChild`. Label still dims inside a `<fieldset disabled className="group">`. Once the Label takes `disabled`, a `text-txt-black-disabled` class or a `peer` class added as a workaround can go. `full.css` in `@amerfathullah/myds-style` carries the new classes.
- f73a96d: SearchBar now has a hover state, as the design guideline asks. Pointing at the bar's input container turns its border from `otl-gray-200` to `otl-gray-300`, in every size and in both themes, so pointer users get feedback before they click. It's a semantic token, so it re-themes in the dark theme. Focus still wins: a bar whose input has focus keeps its `otl-primary-300` border and ring while hovered. Nothing else changes on hover, and SearchBar's props are the same. A `hover:` border class you added to the bar yourself can go. `full.css` in `@amerfathullah/myds-style` carries the new class.
- ed151c9: ThemeProvider now applies `defaultTheme` and restores the saved theme on load. It used to save each choice to `localStorage` but never read it back, and never put `defaultTheme` on `<html>`, so a reload returned to light, and `defaultTheme="dark"` rendered light while ThemeSwitch showed Dark. When it mounts, it puts on `<html>` the theme saved under `storageKey` (default `theme`), or `defaultTheme` (default `light`) when nothing valid is saved. It removes the other theme names, leaves other classes alone and saves nothing. A new `themes` prop lists the names it restores (default `["light", "dark"]`; `defaultTheme` always counts), each a single class name. `setTheme` still applies and saves any name. It now keeps its identity while `storageKey`, `defaultTheme` and the names in `themes` stay the same, even when `themes` is a new array. With storage blocked, as in a sandboxed iframe, it used to throw after changing the class, leaving `<html>` and the provider's `theme` out of step; the theme now lasts for the page's lifetime. A theme name other than `light` and `dark`, such as `system` in the ThemeSwitch docs' old Custom Themes sample, is now restored on load only if it is listed in ThemeProvider's `themes`, as in `<ThemeProvider themes={["light", "dark", "system"]}>`; otherwise choosing it still applies it, but it isn't restored, and it logs a warning once per name. `@amerfathullah/myds-react/utils`, which a Server Component can import, now exports `getThemeScript()`. It returns a script for `<head>` that applies the same theme before the page renders, so a user who chose Dark sees no flash of light. Pass it ThemeProvider's `storageKey`, `defaultTheme` and `themes`, and regenerate a copied script whenever they change. Code you added to read the saved theme, put its class on `<html>` and pass it as `defaultTheme` can go; if it ran before the page rendered, use `getThemeScript` in its place. The ThemeSwitch toggle now shows the provider's theme in its server HTML. A toggle rendered without a ThemeProvider now stays on Light when clicked, where before it flipped its icon and label without changing the theme; to fix it, wrap the app in ThemeProvider.

### Patch Changes

- 248a593: AlertDialog's `variant` is now optional and defaults to `default`, as its docs say. A missing, `null` or unknown `variant`, which plain JavaScript or a cast can pass, now renders as `default` instead of throwing a TypeError. The throw stopped the whole dialog from rendering, its trigger too, whether open, closed or server-rendered. TypeScript still rejects `null` and any name but `default`, `info`, `success`, `warning` and `danger`. Opening a `default` dialog no longer logs React's warning about an invalid `className` prop on `React.Fragment`. It still shows no status icon, and its layout is unchanged.
- 75f291e: In Chromium, DateField and TimeField now fill the focused segment of their native input (day, month or year; hour, minute, second or AM/PM) with primitive `primary-600` and `white` text, the same in both themes. Their classes matched the segment with `:focus`, which Chromium never matches on a `::-webkit-datetime-edit-*-field` pseudo-element, so the browser's own highlight showed instead; they now match it with `:focus-within`. The fill they asked for, `primary-500` with `txt-white`, is replaced: it fell short of the 4.5:1 contrast WCAG AA asks of text, and `txt-white` turns dark in the dark theme. Firefox still shows its own highlight, because it gives page CSS no way to style a segment. `full.css` in `@amerfathullah/myds-style` carries the new classes.
- 6d0d3b0: DateField and TimeField now have an `otl-gray-200` border whether `invalid` is omitted, `null` or `false`. With `invalid` omitted, the border fell back to the preset's primitive `gray-200`, which doesn't re-theme, so in the dark theme the field had a light edge. An invalid field now keeps its `otl-danger-300` border while focused and shows its 3px `fr-danger` ring only then, as the design guideline asks; focus used to replace both with the `otl-primary-300` border and `fr-primary` ring. At rest it shows no ring. The error styling now follows the input's `aria-invalid="true"`, which `invalid` sets, so an `aria-invalid` you pass yourself, as form libraries do, overrides `invalid`: `<DateField aria-invalid />` looks invalid, and `<DateField invalid aria-invalid={false} />` looks valid. `invalid` keeps its type, `boolean | null`. An `invalid={false}` added as a workaround is no longer needed. `full.css` in `@amerfathullah/myds-style` carries the new classes.
- 75be647: In Chromium, a DateField or TimeField whose input is narrower than its text (a fixed `width`, or a `min-width` inside a narrow parent) now scrolls the focused segment fully into view, fill included, whenever keyboard focus moves to it. Chromium's focus scroll used to bring a segment into view only when it was entirely hidden, so a partly hidden one stayed cut off. The fields wrapper inside the edit area now has scroll padding of half its width on each side, which leaves only its centre line, and Chromium centres any focused segment that doesn't cross it. Typing that widens the focused segment, as when an empty AM/PM becomes PM, doesn't scroll it, and neither does a click. A segment wider than half the field, such as milliseconds when `step` is under 1, can stay partly cut. A field at its natural width keeps its layout and never scrolls, in left-to-right and right-to-left locales. `full.css` in `@amerfathullah/myds-style` carries the new classes.
- 0868970: In Chromium, TimeField no longer cuts off the end of its last segment ("09:30 AM" read "09:30 AN"). Chromium overrides the width of a date or time input's edit area with an estimate built from its segments' text, which leaves out the 2px margins the components put around each separator, and cuts off whatever doesn't fit. It cut TimeField at every size and `step`, and at every pixel density and zoom level tested. DateField and TimeField now give the edit area no box (`display: contents` on `::-webkit-datetime-edit`), so the fields wrapper inside it sizes to the segments, and a field widens only by what its segments need, if anything. DateField, which wasn't cut, keeps its width. Remove any `style={{ minWidth: "5.5rem" }}` workaround: it is no longer needed. `full.css` in `@amerfathullah/myds-style` carries the new class.

## 2.0.1

### Patch Changes

- e8bc6e6: Patch release with no change to the public API. `@amerfathullah/myds-react` is rebuilt after an internal lint cleanup: component prop types that were empty interfaces are now type aliases, and the Select multiple-value handler drops an unused assignment. `@amerfathullah/myds-style` is republished unchanged so both packages stay on the same version.

## 2.0.0

### Major Changes

- 382b4a5: `Footer` no longer breaks landmark and heading rules: it nests no complementary landmark, each link group is a navigation landmark named after its title, and a string group title is no longer a heading. The footer looks the same. `SiteInfo` and `SiteLinkGroup` render different elements, and their prop types change with them:

  - `SiteInfo` renders a `<div>` in place of an `<aside>`. Its props are `div` props, so its ref is an `HTMLDivElement`: a `RefObject<HTMLElement>` no longer type-checks. Update CSS or tests that select the `aside`.
  - `SiteLinkGroup` renders one `<nav>` holding the title and the links, in place of a `<div>` wrapping the title and a `<nav>`. Its props are `nav` props, so its ref is an `HTMLElement`. Props, `className` and `ref` apply to the `<nav>` only; they used to land on both elements, which duplicated an `id` or `aria-label`. `className` no longer reaches the grid that lays out the links.
  - A string `groupTitle` renders as text (a `<div>`) in place of an `<h6>`, and names the group's `<nav>` through `aria-labelledby`, unless you pass an `aria-label`. Give each group a distinct title, so each navigation landmark has a unique name. To keep a heading, pass your own element as `groupTitle` and name the navigation yourself, e.g. `groupTitle={<h2 id="services-title">Services</h2>}` with `aria-labelledby="services-title"`.

  The docs Footer page (EN/MS) describes the new elements and gives each example link group its own title.

- 56b9af8: Components are now styled for Tailwind 4 and need the Tailwind 4 `@amerfathullah/myds-style` 2.x. The React peer range is unchanged: `^18.0.0 || ^19.0.0`.

  - **Tailwind 4 class names.** Components use `outline-hidden` instead of `outline-none` and `ring-3` instead of a bare `ring`. Stacked Tailwind variants (`hover:*:`, `data-[state=checked]:before:` …) are written in Tailwind 4's left-to-right order: the calendar's range days, table header borders, tab underlines and toggle thumbs. Search bar and skeleton gradients use `bg-linear-to-*/srgb`, and Spinner's ring uses `bg-conic/srgb`: Tailwind 4's gradient stops don't work in a hand-written `conic-gradient()`, so the ring would disappear. DateField and TimeField put back the 1px padding inside the native field that Tailwind 4's preflight removes, so they keep their height. Dialog's open and close animation no longer adds `slide-in-from-left-1/2 slide-in-from-top-[48%]` to its centring translate. They render as they did on Tailwind 3; compiled with Tailwind 3, they wouldn't.
  - **`clx` uses tailwind-merge 3**, which knows Tailwind 4's class groups. It's configured for the MYDS theme, so a text size and a text colour don't cancel each other (`clx("text-txt-danger", "text-body-sm")` keeps both), and MYDS shadows and named animations now override each other and `shadow-none` / `animate-none`.

  ### Migrating from 1.x
  1. Switch to the new package names. 2.0.0 continues `@govtechmy/myds-*` 1.x as `@amerfathullah/myds-*`. Swap each `@govtechmy/myds-*` dependency for its `@amerfathullah/myds-*` successor, then replace `@govtechmy/myds-` with `@amerfathullah/myds-` in every import, CSS `@import` and `@source` path. If you use both packages:

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

- 839fbb4: MYDS is now published as `@amerfathullah/myds-react` and `@amerfathullah/myds-style`, continuing `@govtechmy/myds-*` 1.x under names this repository can publish. The migration guide's first step covers the switch. The docs, standard site and Storybook import the new names, and the docs installation pages install them.
- f488281: Move to TanStack Table 9 (`@tanstack/react-table` 9.3) and react-day-picker 10, with every other dependency on its latest stable release except `tailwind-merge`, which moves to 3 with the Tailwind 4 preset. React and React DOM 18 and 19 stay supported (`^18.0.0 || ^19.0.0`). `DataTable`, `DatePicker` and `DateRangePicker` keep their props, look and behaviour.

  **`DataTable` column definitions**

  - `ColumnDef` from `@amerfathullah/myds-react/data-table` keeps its name and its `<TData, TValue>` type parameters, so `ColumnDef<Employee>[]` still compiles. It is now TanStack Table 9's `ColumnDef` for the features `DataTable` registers.
  - Rename `sortingFn` to `sortFn`. TypeScript doesn't flag the old key, and `DataTable` ignores it.
  - Where you name TanStack types yourself, import them from `@tanstack/react-table` 9 and pass the new `DataTableFeatures` type (exported from `@amerfathullah/myds-react/data-table`) first: `Row<Employee>` becomes `Row<DataTableFeatures, Employee>`, `CellContext<Employee, unknown>` becomes `CellContext<DataTableFeatures, Employee, unknown>`, and `createColumnHelper<Employee>()` becomes `createColumnHelper<DataTableFeatures, Employee>()`. Wrap a column helper's columns in `helper.columns([...])` to pass them to `columns`.
  - `meta` (`className`, `sortable`, `expandable`, `tooltip`) is typed on `DataTable` columns only: `DataTable` no longer augments TanStack's global `ColumnMeta`.
  - The `table`, `column`, `row` and `cell` objects that `header`, `cell` and `footer` receive only have the APIs of the features `DataTable` uses: sorting, row selection, expanding, column pinning, sizing, visibility, ordering and faceting, plus `table.getRowCount()`. The column filtering, grouping, row pinning and column resizing APIs are gone: `DataTable` never applied them. Read state with `table.store.state` in place of `table.getState()`.
  - `column.getIsPinned()` returns `"start"` or `"end"` in place of `"left"` or `"right"`. The `pin={{ left, right }}` prop and the `data-pinned="left" | "right"` attribute don't change.
  - `table.getIsSomeRowsSelected()` is also `true` when every row is selected. Check `!table.getIsAllRowsSelected()` as well for an indeterminate state.

  **`DatePicker` and `DateRangePicker`**

  No prop changes. `Matcher` (the `disabled` prop) and `DateRange` (re-exported from `@amerfathullah/myds-react/daterange-picker`) are react-day-picker 10's types, with the same shape. `CalendarProps` stays internal: `Calendar` isn't an entry point. The calendar now sets `lang` from `locale` (`en-GB` or `ms`) and labels its navigation "Navigation bar". In the day grid, Shift with the left/right arrows moves by a month and with the up/down arrows by a year. A day that becomes disabled while focused keeps focus and is marked `aria-disabled`, styled like other disabled days.

  **`Select`**

  `SelectItem` renders its text inside Radix's `ItemText`, which Radix Slot 1.5 requires (it throws on the old markup). The item text gains a `<span>` wrapper, each option's `aria-labelledby` now resolves to that text, and typing a letter moves to the matching option.

### Minor Changes

- fca197a: Add `TimeField` (`@amerfathullah/myds-react/time-field`), a native `<input type="time">` that matches `DateField` in every size and state, with a decorative clock icon. `step` (seconds) defaults to `60`, so it shows hours and minutes; 12/24-hour display follows the user's locale. It renders no id of its own: name it with a `Label` (`htmlFor`). `ClockIcon` loses its unused Figma ids. The docs add a TimeField page (EN/MS) with a "Time slots" section showing the `Select` pattern for booking from fixed availability.
- 3f92068: Add `Skeleton` (`@amerfathullah/myds-react/skeleton`), a loading placeholder with a `shape` of `line` (default), `circle` or `block`. It is always `aria-hidden` and stops shimmering under `prefers-reduced-motion`, showing a flat `bg-black-100` fill. `TableSkeleton` is now a `line` Skeleton: its API and animated look are unchanged, and it gains the `aria-hidden` and reduced-motion behaviour.
- b34ece5: `ThemeSwitch` with `as="select"` now gives its trigger an accessible name, so screen readers announce "Theme" followed by the current theme instead of an unnamed combobox. Set the new `selectLabel` prop to name it in your site's language, for example `selectLabel="Tema"`. The toggle form is unchanged and still takes its name from the current theme's `label`. The docs (EN/MS) document `selectLabel`.

### Patch Changes

- 2481545: `DateField` no longer renders a hardcoded `id="date-field"`; its calendar icon is now decorative (`aria-hidden`) and no longer adds an English-only "Select date" to the input's accessible name. Name the field with a `Label` (`htmlFor`) and pass the matching `id`. If you targeted `#date-field` (e.g. `<label htmlFor="date-field">`), pass `id="date-field"` explicitly.
- f488281: `require("@amerfathullah/myds-react/hooks")` resolves again: the `./hooks` export pointed CommonJS at `dist/hooks/index.j` in place of `dist/hooks/index.js`.
- d9b8018: Rebuild with the upgraded toolchain (TypeScript 6, tsup 9). The published JavaScript and type declarations are regenerated: minified names and the order of statements in the `.d.ts` files change (type-only exports are now emitted as `export type { … }`), with no change to the public API.

## 1.0.2

### Patch Changes

- 4259c83: refactor: positioning of `Navbar` menu in mobile
  fix: omit `Breadcrumb` padding from default style, add to `fill` variant

## 1.0.1

### Patch Changes

- 2673812: fix pagination : error duplicate key (...) thrown by myds auto pagination due to design --> pageiniital (...) pagemiddle (...) pagefinal

## 1.0.0

### Major Changes

- :q
- Fix patch tailwind
- ee2d39a: :q

## 0.0.24

### Patch Changes

- d2e231e: fix navbar : passing classname on mobile and desktop

## 0.0.23

### Patch Changes

- 348f449: Maximize available width for p tag before truncating

## 0.0.22

### Patch Changes

- c6a904f: Fix Tabs vertical padding

## 0.0.21

### Patch Changes

- e71f6dc: Move eslint config from dependency to devDependency

## 0.0.20

### Patch Changes

- d92931f: Implement shared eslint config, and fixed lint issues
- d897cd3: Fix navbar height for mobile
- Updated dependencies [d92931f]
  - @myds/eslint-config@0.0.1

## 0.0.19

### Patch Changes

- 02810f0: Support asChild interaction for NavbarMenuItem
- fe0b3be: Update color of table cell
- b73a362: Fix Tabs line style off by 1px and remove divider

## 0.0.18

### Patch Changes

- 2558fb8: Fix alert dialog spacing

## 0.0.17

### Patch Changes

- 1ae118c: Fix Tooltip trigger animation
- 6fe6aa7: Fix Checkbox icon stroke too thin
- 8ec3c92: Fix spacing for DialogHeader based on border existence
- 2f311ad: Refactor Calendar, DatePicker & DateRangePicker to update selected date on month/year change
- 105565f: Fix adding border to Announcebar
- 263f775: Refactor CookieBanner component

## 0.0.16

### Patch Changes

- 07e9ffb: Refactored Masthead component

## 0.0.15

### Patch Changes

- 9d51bae: Refactor Navbar component
- 353589f: Restructure Footer component

## 0.0.14

### Patch Changes

- 4ce2d50: fix masthead responsive issue

## 0.0.13

### Patch Changes

- 40b8a2b: Remove vitest in favor of jest (storybook)
- d4ed3ec: 1. Remove asChild props from AnnounceBarDescription 2. Small refactor on AnnounceBatTag

## 0.0.12

### Patch Changes

- 7eeb60d: Fix to listen to theme changes and update the ThemeSwitch state accordingly
- 57bebb9: Fix ThemeContextProvider not recognising parent if reexported

## 0.0.11

### Patch Changes

- 6956a40: Added `useTheme` hook and documentation.
  Added `ThemeToggler` component and documentation.

## 0.0.10

### Patch Changes

- 1f49811: Fix: ButtonIcon preserve size

## 0.0.9

### Patch Changes

- f50b423: Fix: Make asChild non-default
- 2f6d05d: Fix peer dependency version to include react 19

## 0.0.8

### Patch Changes

- a61fba9: Add `hideClose` prop to DialogBody
- 26ed81e: Masthead css update (container)
- c45e030: remove DropdownTrigger `asChild` set as always true

## 0.0.7

### Patch Changes

- 3d24986: Added CookieBannerPreferencesDisplay and CookieBannerPreferencesToggle in Cookies Banner component.

## 0.0.6

### Patch Changes

- c309fd9: Fix to use ReactFragment instead of returning Element[]
- 3c99cca: Navbar Documentation update and added missing props in navbar components

## 0.0.5

### Patch Changes

- 475d3c6: Remove extra div in AccordionContent
- 2c925c1: Fixed input styling to fill width of parent by default
- 2efcf8e: Fix SearchBar's z-index
- 3535a3d: Implement stacked layout for Dialogue mobile view

## 0.0.4

### Patch Changes

- 1a9e476: Footer Documentation Update : MS integration and add classname and props missed in component
- 6181ab0: Fixed AlertDialogAction from recursion; Attach onDismissListener to DialogClose
- 650a846: Refactored AlertDialog to conform Dialog's changed API
- 7711524: Navbar Component
- 6e4317e: Add DialogBody which wraps DialogHeader,DialogContent,DialogFooter
- 3495d7f: Footer Documentation
- 0903c8f: add DialogBody, repurpose DialogContent
- 6e4317e: AlertDialog variants extended to 'default' | 'info'
- 8a0cb3b: Add CalloutClose wrapper component
- c0f469a: DropdownTrigger converted to full wrapper
  Documentation for Dropdown
- 6e4317e: Bind DialogClose to onDismiss if exists

## 0.0.3

### Patch Changes

- a973f87: Removed DialogOverlay and DialogPortal
- a973f87: Rename withCloseButton to dismissible and added onDismiss event listener

## 0.0.2

### Patch Changes

- 23aa39e: adding readme

## 0.0.1

### Patch Changes

- eeb6bd4: trial publish
