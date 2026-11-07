# @amerfathullah/myds-style

## 2.1.0

### Minor Changes

- 46d3d9e: The Tailwind import now sets the scroll, focus and underline rules that only `full.css` had, so both entries render the same. `full.css`, which imports it, has each of these rules once and adds only the fonts and its box-sizing pair (`border-box` on `html`, `inherit` on every element), which stays out of the import.

  **With the Tailwind import, you now get:**

  - `scroll-padding-top: 65px` on `html`, so an in-page link's target, the SkipLink's included, lands below the 64px sticky Navbar instead of under it. The value doesn't change with the breakpoint: below `md:` the Navbar is 56px, so targets land 9px lower than they need to.
  - Smooth scrolling (`scroll-behavior: smooth` on `html`), unless the user prefers reduced motion. Under `prefers-reduced-motion: reduce`, in-page links jump.
  - No outline when focus isn't `:focus-visible`, as after a mouse click on a button or link. That hides an outline-width utility's outline too, such as `focus:outline-[3px]`, after a click; keyboard focus still shows it. An outline whose style a utility sets, such as `focus:outline-solid`, still shows on a click. The rule doesn't use `@apply`, so the import still compiles under `@import "tailwindcss" prefix(…)`.
  - `text-underline-position: from-font` on `underline` and its Tailwind variants, such as `hover:underline` and `focus-visible:underline`. Nothing is generated when your sources don't use `underline`.

  **`full.css` changes too:**

  - Smooth scrolling now respects reduced motion.
  - `hover:underline` and `focus-visible:underline` now get `from-font`, as `underline` already did.
  - `underline` no longer resets the decoration's style, thickness or colour, because it no longer sets the `text-decoration` shorthand. `decoration-*` utilities on an underlined element now apply, and a Link that isn't `primary` takes its parent's decoration, through `decoration-inherit` and the `text-decoration: inherit` that preflight gives links.

  **Opting out of the scroll padding.** In an app without the MYDS Navbar, or whose headings carry their own scroll margin (Fumadocs headings have `scroll-m-28`), the 65px adds to that margin. Set `html { scroll-padding-top: 0 }` in your stylesheet, or, with the Tailwind import, put `scroll-pt-0` on `<html>`.

  **Next.js App Router.** Put `data-scroll-behavior="smooth"` on `<html>`, so that moving to another page jumps to its top instead of scrolling there smoothly.

  **Remove the rule you added by hand.** If you followed the old advice and added `html { scroll-behavior: smooth; scroll-padding-top: 65px; }` to your own stylesheet, delete it. MYDS now sets both, and your copy would keep smooth scrolling on under reduced motion.

- 737eea1: Input and TextArea now take an `invalid` prop, as DateField and TimeField do, so a field that fails validation can show it. `invalid` sets the native element's `aria-invalid`, and the error styling follows `aria-invalid="true"`, so an `aria-invalid` you pass yourself, as form libraries do, overrides `invalid`: `<Input aria-invalid />` looks invalid, and `<Input invalid aria-invalid={false} />` looks valid. An invalid field has an `otl-danger-300` border, which it keeps while focused, and shows its 3px `fr-danger` ring only then. On Input only the editable field turns red: the wrapper keeps its `otl-gray-200` border, and `InputAddon` and `InputIcon` keep their colours. `invalid` takes `boolean | null`; omitted, `false` or `null`, the field looks as before. A border class you added to show an error, such as `border-danger-600` on Input, which lands on the wrapper, doesn't re-theme and sets no `aria-invalid`, can go. `full.css` in `@amerfathullah/myds-style` carries the new classes.
- 73321a8: Label now takes a `disabled` prop, so a Label beside a disabled field can show it. Label used to dim only after a disabled sibling marked `peer`, or inside a disabled ancestor marked `group`, and no library field is either, so a Label beside a disabled Input, TextArea, DateField, TimeField, Select or Checkbox kept its `txt-black-700` colour. `disabled` sets the rendered element's `data-disabled`, and the disabled styling, `txt-black-disabled` text with a `not-allowed` cursor, follows `data-disabled="true"`, so it doesn't depend on where the field sits: before it, after it or in another wrapper. A `data-disabled` you pass yourself overrides `disabled`. Label disables nothing, so pass `disabled` to the Label and to the field: `<Label htmlFor="name" disabled>` beside `<Input id="name" disabled />`. `disabled` takes `boolean | null`; omitted, `false` or `null`, the Label looks as before. It never reaches the element as a native `disabled`, with or without `asChild`. Label still dims inside a `<fieldset disabled className="group">`. Once the Label takes `disabled`, a `text-txt-black-disabled` class or a `peer` class added as a workaround can go. `full.css` in `@amerfathullah/myds-style` carries the new classes.
- f73a96d: SearchBar now has a hover state, as the design guideline asks. Pointing at the bar's input container turns its border from `otl-gray-200` to `otl-gray-300`, in every size and in both themes, so pointer users get feedback before they click. It's a semantic token, so it re-themes in the dark theme. Focus still wins: a bar whose input has focus keeps its `otl-primary-300` border and ring while hovered. Nothing else changes on hover, and SearchBar's props are the same. A `hover:` border class you added to the bar yourself can go. `full.css` in `@amerfathullah/myds-style` carries the new class.

### Patch Changes

- c7723da: The preset now clears Tailwind's `drop-shadow-*` and `text-shadow-*` scales, as it already cleared `shadow-*` and `inset-shadow-*`. Their steps no longer generate any CSS: bare `drop-shadow`, `drop-shadow-xs` … `drop-shadow-2xl` and `text-shadow-2xs` … `text-shadow-lg`. They gave Tailwind's own shadows, which aren't part of MYDS's shadow scale.

  **If you use them in your own markup, that element loses its shadow.** Use `shadow-button`, `shadow-card` or `shadow-context-menu` instead.

  `drop-shadow-none`, `text-shadow-none`, shadow colours such as `drop-shadow-primary-600`, and arbitrary values such as `drop-shadow-[0_1px_2px_black]` still work. No MYDS component used these utilities, so components look the same.

- 9472d1b: CookieBanner is now a named page region instead of a modal dialog, so it no longer blocks the page, and only its own controls close it. As a dialog with no overlay, it hid the rest of the page from screen readers and kept Tab inside itself while open. It also caught the first click outside it, which closed it without reaching its target. Escape closed it too, so a visitor could dismiss it without choosing.

  - **A `<section>` named by its title.** CookieBanner renders a `<section>` that `CookieBannerTitle` names, so always include a title. An `aria-label` or `aria-labelledby` you pass takes precedence. It has no `role="dialog"`, `aria-modal` or `aria-describedby`, and it leaves the rest of the page alone: no `aria-hidden`, no `pointer-events: none`, no scroll lock. Its description is read in reading order.
  - **Rendered in place.** It renders where you put it, with no portal, and only in the browser, so a `defaultOpen` read from browser storage doesn't cause a hydration mismatch. It looks as before, fixed bottom-right. It's now capped at the viewport's height, less its 16px bottom margin from `sm:` up, and its content scrolls inside it beyond that.
  - **What closes it.** Only a `CookieBannerClose` (Accept, Reject or Save) and the close cross. A press outside it, focus moving outside it and Escape no longer close it. It calls `preventDefault()` on none of them, so a click outside reaches its target. `onOpenChange(false)` is called once per close. Every opening starts in the default view, and nothing resets the Customise view while the banner is open.
  - **Focus.** Opening it right after a visitor action, such as a click on "Cookie settings", moves focus to the banner. Opening it on page load or from an effect doesn't move focus. Closing it with focus inside moves focus back to what opened it, else to the next focusable element after it (SkipLink in the page frame), else to `<body>`, without scrolling the page. Tab and Shift+Tab move into and out of it in DOM order. Customise moves focus to the first preference, and a trigger that goes back, such as "Back", to Customise.
  - **Page padding.** While it's shown, it sets an inline `scroll-padding-bottom` on `<html>` and `padding-bottom` on `<body>` to its height plus its bottom offset, and keeps them up to date as it resizes. A control that takes focus then scrolls into view above it (WCAG 2.2 SC 2.4.11). When it closes or unmounts, it puts back the inline values that were there before.
  - **Handlers.** A `CookieBannerClose` or `CookieBannerPreferencesTrigger` runs your `onClick` first. If your handler calls `preventDefault()`, the banner stays open or the view stays. A trigger's `onClick` used to replace its toggle.
  - **Props.** CookieBanner takes every `<section>` attribute, such as `id`, `aria-label` and `style`, and forwards its ref to the `<section>`. `open`, `defaultOpen`, `onOpenChange`, `modal` and `closeLabel` never reach the DOM, so React no longer warns about them. `modal` is deprecated and does nothing; it's removed at the next major. `CookieBannerPreferences` is now a `<div>`, so block content inside it no longer nests in a `<p>`.

  **To migrate:**

  - Render CookieBanner first in `<body>`, before SkipLink.
  - Update tests and CSS that select it by `role="dialog"`. Select its region instead, for example by its title's name.
  - Drop `modal`, and any `onInteractOutside` or `onEscapeKeyDown` handlers. They're no longer accepted, and the banner already stays open until the visitor chooses.

  `full.css` in `@amerfathullah/myds-style` gains `max-h-dvh` and `sm:max-h-[calc(100dvh-1rem)]`, for the banner's height cap.

  The docs (EN/MS) say to render the banner first in `<body>`, describe what closes it, its focus and its page padding, and document its section attributes, its ref and the deprecated `modal`. Their previews render it in place. In Storybook, the CookieBanner story's docs page shows each story in its own frame, so the banner isn't cut off, and the story logs `onOpenChange`.

- 9cc1a9f: DataTable's sort and widen buttons now always show, so keyboard, screen reader and touch users can sort and widen columns, and they have names. They didn't render below 1024px, and from 1024px up they stayed invisible, and out of the tab order, until the pointer hovered their header or the column was sorted or widened.

  - **Always shown.** In a `sortable` column the sort button shows, and in an `expandable` column the widen button shows. They show at rest, at every screen width, on touch screens too, whether or not the column is sorted or widened. Tab stops on each one, and focus stays on it after every press, including the one that clears a sort or collapses a column. They look as they did when their header was hovered.
  - **Names.** The sort button is named "Sort by {header}" and the widen button "Widen {header}", where {header} is the text the column's header renders, whether `header` is a string, a function or left out. A header that renders no text gives "Sort column" and "Widen column". The names stay the same whether the column is sorted or widened. The column's new `meta.sortLabel` and `meta.widenLabel` replace the whole name in your site's language, for example `sortLabel: "Isih mengikut Jawatan"` and `widenLabel: "Lebarkan Nama"`. These options never reach the DOM. The icons inside the buttons are hidden from assistive technology.
  - **State.** The primary sort column's header, the first in the sort, has `aria-sort="ascending"` or `aria-sort="descending"`. The other columns in a Shift+click multi-sort have none. The widen button has `aria-pressed`, `"true"` while its column is widened.
  - **`type="button"`.** Both buttons are `type="button"`, so a sort or widen press no longer submits a form around the table.
  - **Column header names.** Each column header is named by its text alone, not by the buttons and tooltip trigger inside it. Screen readers announced a header with a tooltip as "Age Tooltip", and the checkbox selection column's as "Select Select all rows"; they now announce "Age" and "Select". A header that renders no text is no longer named by the buttons inside it. The ids these names use come from `useId`, so they don't repeat across tables.
  - **No dead sort button.** A `sortable` column without an accessor, which can't sort, no longer renders a sort button that did nothing.

  Sorting itself doesn't change: a text column sorts ascending first and a number column descending first, and a third press clears the sort.

  `full.css` in `@amerfathullah/myds-style` no longer carries the classes that only the hidden buttons used: `lg:block`, `group-hover:visible`, `data-[sorted=true]:visible` and `data-[expanded=true]:visible`.

  The docs (EN/MS) say the buttons always show, give their default names, document `meta.sortLabel` and `meta.widenLabel` with Malay examples, and say a sorted header sets `aria-sort`. The design guideline's Table page says the expand and sort column buttons are always shown.

- 02b360f: DateRangePicker's `disabled={true}` now disables the whole picker, as DatePicker's does. It disabled every day in the calendars but left all four triggers enabled, so the From and To triggers looked enabled, took Tab focus, were announced as operable buttons, and each opened a calendar in which nothing could be picked: below `lg:`, a dialog with no close button. Now every trigger the picker renders takes native `disabled` and the `default-outline` Button's disabled look, Tab skips it, and a click, Enter or Space opens nothing. A disabled trigger keeps its text, its accessible name and its description. Its `From:` / `To:` prefix, always `txt-black-500` before, now takes `txt-black-disabled` whenever the trigger it sits in is `:disabled`, so it dims inside a `<fieldset disabled>` as well, where only the date used to dim. An enabled picker in the first `<legend>` of a `<fieldset disabled className="group">` keeps a `txt-black-500` prefix. Any other `disabled`, such as `{ before: date }`, a function, an array of Matchers (`[true]` included) or `false`, still leaves the triggers enabled, and the calendars disable the same days as before. A `<fieldset disabled>` you wrapped around a DateRangePicker only to disable its triggers can go. `disabled` keeps its type, `Matcher | Matcher[]`, and its JSDoc on both pickers now says that `true` disables the whole picker and any other value only the days it matches. `full.css` in `@amerfathullah/myds-style` carries the new class.
- 7dfcd6d: DateField and TimeField now look disabled whenever their `<input>` is, including inside a `<fieldset disabled>`. Their frame and their calendar or clock icon took the disabled look only from the `disabled` prop, so in a disabled fieldset, which disables the input without the prop, the field showed a washed patch behind its value inside a white frame, beside an icon in its enabled colour. The frame and the icon now follow the input's `:disabled`, as the error styling follows its `aria-invalid`: a disabled field has a `bg-washed` frame with a `not-allowed` cursor and a `txt-black-500` icon, whether the prop or a disabled fieldset, with or without `className="group"`, disables it. A `disabled={false}` field inside a disabled fieldset, which the browser disables anyway, now looks disabled too. An enabled field looks as before, also inside an element you mark `group` or `group/field` that holds other disabled inputs. On a disabled field, a background you pass in `className` now gives way to the washed background, as on Input; before, some, such as `bg-transparent`, won. A `disabled` you added to each field in a disabled fieldset only for its look can go. `disabled` keeps its type, `boolean | undefined`. `full.css` in `@amerfathullah/myds-style` carries the new classes.
- 75f291e: In Chromium, DateField and TimeField now fill the focused segment of their native input (day, month or year; hour, minute, second or AM/PM) with primitive `primary-600` and `white` text, the same in both themes. Their classes matched the segment with `:focus`, which Chromium never matches on a `::-webkit-datetime-edit-*-field` pseudo-element, so the browser's own highlight showed instead; they now match it with `:focus-within`. The fill they asked for, `primary-500` with `txt-white`, is replaced: it fell short of the 4.5:1 contrast WCAG AA asks of text, and `txt-white` turns dark in the dark theme. Firefox still shows its own highlight, because it gives page CSS no way to style a segment. `full.css` in `@amerfathullah/myds-style` carries the new classes.
- 2e872fb: The controls below now show MYDS's focus ring on keyboard focus: a 3px `fr-primary` ring, or `fr-danger` on an invalid Input OTP. They show it only on keyboard focus, so a mouse click shows none, except on SearchBar and Input OTP, which ring while their input has focus.

  - **Links.** Link, and SiteLink, NavbarMenuItem and NavbarLogo, which render it, showed only the browser's outline. They now show the ring, with or without `asChild`, and a link that wraps onto two lines has a closed ring on each line. A NavbarMenuItem's link now fills its item, so the ring outlines the rounded area its hover background fills. NavbarLogo's link no longer fills the header's height, so its ring isn't cut off at the top of the window; you click its image and name. The NavbarMenuDropdown trigger shows the ring too.
  - **BreadcrumbLink** shows the ring. The one-line truncation moved from BreadcrumbItem onto the link, so the item no longer clips the ring. A long link still truncates to one line within the item's 200px.
  - **Accordion.** Its trigger showed only an underline, which hover shows too. Now its item shows the ring while the trigger has keyboard focus, and the underline stays. A focused link inside the content doesn't ring the item.
  - **Toast.** The close button and the toast card, which Tab reaches, showed no focus indicator at all. Both now show the ring. The viewport, which F8 focuses, shows it inset.
  - **TooltipTrigger**, the table's tooltip trigger included, and the **Tabs** panel show the ring. With `asChild`, TooltipTrigger adds no classes, so its child keeps its own ring.
  - **Rings in other colours.** TableCell's 3px outline in primitive `primary-600` @ 20%, which didn't re-theme, is now an inset `fr-primary` ring. SearchBar's and the active Input OTP slot's opaque `otl-primary-200` ring is now `fr-primary`, and an invalid slot's `otl-danger-200` ring is `fr-danger`, as on Input.
  - **Radio** showed an opaque 4px ring in its text colour, black or white: `clx` read its `ring-opacity-40`, a Tailwind 3 utility that Tailwind 4 doesn't generate, as a ring colour and dropped `ring-fr-primary`. It now shows the 3px `fr-primary` ring. So does DataTable's radio-selection column, which no longer rings after a click. That column's cells are now 32px wide with 4px before the radio, as the checkbox column's are.
  - **Forced colours.** Where rings don't render, as in Windows High Contrast, these controls show an outline on keyboard focus instead.

  **If you set focus styles on these yourself:** a ring class you pass to Link or SiteLink can't reliably replace the 3px ring. Link doesn't merge `className` with its own classes, so the stylesheet's order decides which ring shows. A padding class you pass to NavbarMenuItem still lands on the item, so it now adds to its link's padding.

  `full.css` in `@amerfathullah/myds-style` carries the new classes.

- 3d924cc: An InputIcon inside a Fragment, including one in an array, or inside your own component now gets room on the side it draws on. Input pads the field 40px on that side, as it does for an InputIcon passed directly, so the placeholder and typed text no longer run under the icon. The room is already there in server-rendered HTML, before the page hydrates. InputIcon's rendered element now carries the side it draws on in a new `data-input-icon` attribute, `"left"` or `"right"`, and Input pads the field from that attribute on a later sibling of its `<input>`. `data-has-left-icon` and `data-has-right-icon` are unchanged: they still describe Input's direct children only. Input's and InputIcon's props are the same. `full.css` in `@amerfathullah/myds-style` carries the new classes.
- a4c05a6: InputOTP's slots now take their invalid and disabled looks only from InputOTP's own `<input>`. Inside an element marked `group`, such as a `<div className="group">` or a `<fieldset className="group">`, and inside the library's `AccordionItem` and `Toast`, which are marked `group`, the slots took the look of any other control there. An invalid Input, DateField, TimeField or another InputOTP gave them the `otl-danger-300` border, and the active slot the `fr-danger` ring. A disabled Button, Checkbox or Input, or a `<select>` with a disabled placeholder `<option>`, gave them the `bg-washed` fill and `txt-black-500` text. A control among InputOTP's children, such as a disabled Resend button, did the same. All the while InputOTP's own input stayed valid and enabled, and assistive technology announced it so. Now the slots have the `otl-danger-300` border exactly when the input has `aria-invalid="true"`, from `invalid` or an `aria-invalid` you pass, and the disabled look exactly when the input is `:disabled`, from `disabled` or a `<fieldset disabled>`. The one exception is an InputOTP you place among another InputOTP's children, which still takes the outer one's look. InputOTP's own looks don't change. Its container's class is now `group/input-otp` instead of `group`, so a bare `group-*` class you put on InputOTP's children or on `InputOTPSlot` no longer keys off the container: pass `containerClassName="group"`, or use the `/input-otp` form, such as `group-hover/input-otp:`. `full.css` in `@amerfathullah/myds-style` carries the new classes.
- 6d0d3b0: DateField and TimeField now have an `otl-gray-200` border whether `invalid` is omitted, `null` or `false`. With `invalid` omitted, the border fell back to the preset's primitive `gray-200`, which doesn't re-theme, so in the dark theme the field had a light edge. An invalid field now keeps its `otl-danger-300` border while focused and shows its 3px `fr-danger` ring only then, as the design guideline asks; focus used to replace both with the `otl-primary-300` border and `fr-primary` ring. At rest it shows no ring. The error styling now follows the input's `aria-invalid="true"`, which `invalid` sets, so an `aria-invalid` you pass yourself, as form libraries do, overrides `invalid`: `<DateField aria-invalid />` looks invalid, and `<DateField invalid aria-invalid={false} />` looks valid. `invalid` keeps its type, `boolean | null`. An `invalid={false}` added as a workaround is no longer needed. `full.css` in `@amerfathullah/myds-style` carries the new classes.
- 7baa1a2: The README's hero image now loads from this repository's default branch, not from upstream's CloudFront bucket (ADR-0006), so it keeps showing on GitHub and npm if the bucket goes.
- ee9b229: The unexported Sheet component is removed from `@amerfathullah/myds-react`. Its compiled files shipped in the package, but its `exports` map never had a `./sheet` entry, so `@amerfathullah/myds-react/sheet` could never be imported and no component used it. Nothing public changes: every subpath the package exports resolves as before, and its dependencies are the same. `full.css` in `@amerfathullah/myds-style` no longer carries the classes that only Sheet used.
- 75be647: In Chromium, a DateField or TimeField whose input is narrower than its text (a fixed `width`, or a `min-width` inside a narrow parent) now scrolls the focused segment fully into view, fill included, whenever keyboard focus moves to it. Chromium's focus scroll used to bring a segment into view only when it was entirely hidden, so a partly hidden one stayed cut off. The fields wrapper inside the edit area now has scroll padding of half its width on each side, which leaves only its centre line, and Chromium centres any focused segment that doesn't cross it. Typing that widens the focused segment, as when an empty AM/PM becomes PM, doesn't scroll it, and neither does a click. A segment wider than half the field, such as milliseconds when `step` is under 1, can stay partly cut. A field at its natural width keeps its layout and never scrolls, in left-to-right and right-to-left locales. `full.css` in `@amerfathullah/myds-style` carries the new classes.
- 6e2ff6c: Switch (`Toggle` + `ToggleThumb`) can now be named in your site's language, keyboard users meet it once, and a disabled fieldset disables it.

  - **The checkbox is the switch.** ToggleThumb's visually hidden `<input type="checkbox">` now has `role="switch"` and is the switch's one tab stop. The track beside it is hidden from assistive technology (`aria-hidden="true"`) and no longer takes focus or keys. Keyboard users met two tab stops per switch, and the first showed no focus indicator.
  - **No more "Toggle".** Every switch was announced as "Toggle", whatever it controlled. It now has no default name, so name each one:
    - a `<Label htmlFor>` with Toggle's `id` now names the switch itself;
    - or pass the new `aria-label` or `aria-labelledby` prop to ToggleThumb, for example `<ToggleThumb aria-label="Pemberitahuan e-mel" />`. ToggleThumb also takes `aria-describedby`. These go to the checkbox.
    - The `ToggleThumbProps` type is exported.
  - **Keys.** Space toggles the switch, as on any checkbox, and Enter still toggles it. Each calls `onCheckedChange` once. Enter now clicks the checkbox, so it fires the same native `change` event as Space, and it no longer submits a form around the switch.
  - **Disabled fieldsets.** Inside a `<fieldset disabled>`, a switch without its own `disabled` looked disabled but still toggled with Space and Enter. Now it is disabled: Tab skips it, and no key or click changes it.
  - **Focus ring.** The track shows the 3px `fr-primary` ring while the switch has focus, after a click on it too. Under forced colours it shows an outline only while the switch has focus; before, the outline showed at rest too.
  - **Hooks.** Toggle now calls `useId()` on every render, so adding or removing `id` no longer breaks React's order of hooks.

  Apart from focus, nothing changes visually: the track has the same sizes, colours, thumb and cursor.

  **If you upgrade:**

  - **A switch without a label** is now announced with no name, and accessibility checkers such as axe flag it. Give it a `<Label htmlFor>` or an `aria-label`.
  - **Don't wrap a Toggle in a Label.** That nests ToggleThumb's own `<label>` inside the Label's, which HTML doesn't allow, and axe's `label` rule now flags it. Use `htmlFor` with Toggle's `id`.
  - **`className` on ToggleThumb** still styles the track. The track never takes focus itself, so style its focus with `peer-focus:`, not `focus:`.
  - **Tests that found the switch by `role="switch"`** now find the `<input type="checkbox">`, which has no `aria-checked`; read its `checked` instead.

  `full.css` in `@amerfathullah/myds-style` carries the new classes.

  The docs (EN/MS) name every switch with a Label, document `id` and ToggleThumb's props, and say how to name a switch, which keys toggle it and that a disabled fieldset disables it. Every Toggle story in Storybook names its switch, and new stories show an `aria-label` and a disabled fieldset.

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
