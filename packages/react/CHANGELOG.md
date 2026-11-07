# @amerfathullah/myds-react

## 2.1.0

### Minor Changes

- 8b4f54a: The calendar in `DatePicker` and `DateRangePicker` now names its controls in the picker's `locale`, and you can rename the month view's year buttons in your site's language.

  - **Malay names under `locale="ms"`:** the calendar takes its names from react-day-picker's own `ms` locale. Screen readers announce the `<nav>` as "Bar navigasi", the day view's buttons as "Pergi ke bulan sebelumnya" / "Pergi ke bulan seterusnya", the grid as "Oktober 2026", the weekday headings in full ("Ahad" … "Sabtu"), and the day buttons like "Jumaat, 30 Oktober 2026, dipilih". Before, they were English inside an element marked `lang="ms"`.
  - **New `previousYearLabel` and `nextYearLabel` props** on both pickers, defaulting to "Go to the Previous Year" and "Go to the Next Year". They name the month view's year buttons, which no locale names, in every calendar the picker renders. For example, `previousYearLabel="Pergi ke tahun sebelumnya"` and `nextYearLabel="Pergi ke tahun seterusnya"`. They never reach the DOM.
  - **Named month and year grids:** the month view's grid is "Pilih bulan" / "Choose the Month", and the year view's grid "Pilih tahun" / "Choose the Year". They had no name. Opening either view no longer logs React's missing-key warning.
  - **New wording of English day buttons:** under `locale="en"` the calendar uses react-day-picker's `enGB` names, so day buttons read "Friday, 30 October 2026, selected" instead of "Friday, October 30th, 2026, selected". Its other English names are unchanged.

  Nothing changes visually: the same elements, classes and text render, the week still starts on Sunday, and the triggers read as before.

  The docs (EN/MS) say the calendar's names follow `locale`, and document `previousYearLabel` and `nextYearLabel`.

- 9859bd4: Callout is now a note (`role="note"`) for every Variant, including when `variant` is left out, instead of an assertive alert. A note isn't a live region, so screen readers read a callout in reading order with the rest of the page and don't announce it when it appears. As an alert, a callout interrupted the user when it was inserted: one that appeared after the user acted, or every callout on a page reached by client-side navigation, even an Information callout.

  - **Your role wins.** A `role` you pass still replaces the default, whatever the Variant.
  - **Names.** An `aria-label` or `aria-labelledby` you pass names the note, for example `aria-label="Notis"`.
  - **Nothing else changes.** Nothing changes visually: the same elements, classes and icons render. Callout's props and ref types are the same, and its ref is still the root `<div>`. CalloutTitle keeps `role="term"` and CalloutContent `role="definition"`.

  **If you upgrade:**

  - Pass `role="alert"` to a callout that appears after the user acts and must be announced, such as an error after a failed submit.
  - Update tests or CSS that select Callout by `[role="alert"]`.

  The docs (EN/MS) say when to pass `role="alert"`, and list `role` in Callout's props.

- e62a54d: More built-in accessible names that were fixed in English can now be renamed in your site's language. Each keeps its English default.

  - **New `closeLabel` prop** on `DialogBody` and `AlertDialogContent`, defaulting to "Close". It names the close button in the top-right corner, for example `closeLabel="Tutup"`. `hideClose` still removes the button, and an `aria-label` still goes to the dialog.
  - **New `closeLabel` prop** on `Pill`, defaulting to "Close". It names the remove button that `onDismiss` adds. Pills often sit side by side, so give each its own name, for example ``closeLabel={`Buang ${name}`}``. Pill's other props still go to its container.
  - **Pill's remove button is now named "Close" instead of "close button".** The name now sits on the `<button>` itself, and the cross icon inside it is hidden from assistive technology (`aria-hidden="true"`).
  - **New `viewportLabel` and `announceLabel` props** on `AutoToast`. `viewportLabel`, default "Notifications ({hotkey})", names the region that holds the toasts; Radix replaces `{hotkey}` with F8, so `viewportLabel="Pemberitahuan ({hotkey})"` gives "Pemberitahuan (F8)". `announceLabel`, default "Notification", is what screen readers announce before each toast's text, for example `announceLabel="Pemberitahuan"`. Don't pass an empty `announceLabel`: Radix logs an error.
  - **An `aria-label` on `SearchBarResultsList` now names the listbox.** cmdk used to overwrite it with its own "Suggestions". The default is still "Suggestions", and cmdk's `label` still works; when you pass both, `aria-label` wins.

  None of the new props reaches the DOM. Nothing changes visually: the same elements, classes and icons render.

  The docs (EN/MS) document the new props and default names. The Toast docs also explain the `label` on `ToastViewport` and `ToastProvider` for toasts composed by hand. The docs site names its toast region, toast announcements and the community page's dialog close button in the page's language.

- abad11c: Icon-only controls that screen readers announced as just "button" now have accessible names, in English by default, and you can rename each one in your site's language.

  - **New `closeLabel` prop** on `Callout`, `AutoToast` and `CookieBanner`, defaulting to "Close". It names a close button you don't render yourself: Callout's `dismissible` cross, each AutoToast toast's close button, and CookieBanner's close cross. For example, `closeLabel="Tutup"`. It never reaches the DOM. Every other prop still goes where it went before: Callout's to its `role="note"` container, AutoToast's to each toast, CookieBanner's to its region.
  - **Default names on icon-only parts you render:** `ToastClose` is named "Close", `SearchBarSearchButton` "Search" in every size, and `SearchBarClearButton` "Clear". An `aria-label` you pass replaces the default, for example `aria-label="Cari"`.
  - **Hidden decoration:** AutoToast's status icon and countdown bar are now hidden from assistive technology (`aria-hidden="true"`). They were a `role="img"` and a `role="progressbar"` with no name or value, so they told screen readers nothing. The toast's title carries its meaning.

  Nothing changes visually: the same elements, classes and icons render.

  The docs (EN/MS) document `closeLabel` and the default names, and the docs site names these controls in the page's language.

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

- 8e41f09: DataTable's built-in controls now have English default names that tell rows apart, and you can rename each one in your site's language. Screen readers announced every row's selection control as just "checkbox" or "radio".

  - **Row selection controls:** each row's checkbox or radio is named "Select row N", where N numbers the rows the table shows from 1, top to bottom in the current sort, counting expanded sub-rows. The new `selection.rowLabel` renames them: a function is called with each row and returns its name, for example `` rowLabel: (row) => `Pilih ${row.original.name}` ``. A string also works, but gives every row's control the same name again.
  - **More `selection` options:** `selectAllLabel` names the select-all checkbox in `checkbox` mode (default "Select all rows"). `clearLabel` names the radio column's reset button, which had no name (default "Clear selection"). `columnLabel` sets the selection column's visually hidden header, which read "selection-column" (default "Select").
  - **Nested-row toggle:** `Cell.Expand`'s button is named "expand row", and the new `nest.expandLabel` renames it, as a string or a function of the row. The button now has `aria-expanded`, so screen readers say whether the row is expanded. The chevron icon no longer has a name of its own. `Cell.Expand` keeps its call signature.
  - **Header tooltips:** a column's new `meta.tooltipLabel` names its tooltip's trigger (default "Tooltip"). `TableTooltip` now declares `aria-label` and sends it to its trigger, so `<TableTooltip aria-label="Maklumat">` renames it; its other props still go to the tooltip root.

  These options never reach the DOM. Nothing changes visually: the same elements, classes and icons render.

  The docs (EN/MS) document the new options, their defaults and `TableTooltip`'s `aria-label`, with Malay examples.

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

- 59fd000: `DatePicker` and `DateRangePicker` can now be named by a Label. Screen readers announce each trigger by the field's label, then by what the trigger shows, so two pickers in one form no longer read as two "dd / mm / yyyy" buttons.

  - **New `aria-labelledby`, `aria-label` and `aria-describedby` props** on both pickers. They reach every trigger the picker renders: the dialog's trigger below `lg:` and the popover's from `lg:` up, both of them on DateRangePicker.
    - `aria-labelledby` takes a Label's `id`: `<Label id="dob">Date of birth</Label>` with `<DatePicker aria-labelledby="dob" />`. The trigger is announced as "Date of birth 12 Mar 2024", or "Date of birth dd / mm / yyyy" before a date is chosen. DateRangePicker's triggers are announced as "Travel dates From: 12 Mar 2024" and "Travel dates To: 20 Mar 2024", their prefixes following `fromLabel` / `toLabel` and `locale` as before.
    - `aria-label` names a picker with no visible label, in your site's language, and the date still follows it: `<DatePicker locale="ms" aria-label="Tarikh lahir" />` is announced as "Tarikh lahir 12 Mac 2024". If you pass both, `aria-labelledby` wins.
    - `aria-describedby` takes the id of a hint, which describes every trigger.
  - **Not `htmlFor`.** The pickers still take no `id`, so a Label's `htmlFor` can't name them, unlike the date field, and clicking the Label doesn't open the picker. Each picker renders its triggers twice, so one `id` would repeat, and a `<label for>` would replace the date in a trigger's name.
  - **Without the props, nothing changes.** The triggers have the same names, text and classes, with no `aria-labelledby` or `aria-describedby`. The pickers have no default name.

  Nothing changes visually.

  **If you upgrade:** an `aria-label` or `aria-labelledby` you already passed, which TypeScript and plain JavaScript both allow, used to land on the open calendar's root, and now names the triggers instead. An `aria-describedby`, which was dropped, now describes them.

  The docs (EN/MS) name each picker with a Label, say that `htmlFor` doesn't work, and document the three props, and `fromLabel` / `toLabel` on DateRangePicker. Each picker's Storybook usage example names it with a Label, and a new story shows it.

- bd661d3: `MalaysiaFlagIcon` and `JataNegaraIcon` are deprecated on `@amerfathullah/myds-react/icon`, and the next major removes them from it. Both are national marks, not icons. A national mark tells citizens that the Government runs a site, so only an official service may show one, and an icon entry that offers both next to 218 other icons invites any site to show them. Nothing breaks: the entry still exports both, as the same components with the same type, and they render the same SVG. Editors and the `@typescript-eslint/no-deprecated` rule now flag each import, with a note saying what to use instead. The Masthead already shows the flag. An official service that shows the Jata Negara supplies the image itself, through the Navbar or Footer logo slot, as it supplies its agency logo. The Masthead renders as before, and no other entry exports either mark.
- 737eea1: Input and TextArea now take an `invalid` prop, as DateField and TimeField do, so a field that fails validation can show it. `invalid` sets the native element's `aria-invalid`, and the error styling follows `aria-invalid="true"`, so an `aria-invalid` you pass yourself, as form libraries do, overrides `invalid`: `<Input aria-invalid />` looks invalid, and `<Input invalid aria-invalid={false} />` looks valid. An invalid field has an `otl-danger-300` border, which it keeps while focused, and shows its 3px `fr-danger` ring only then. On Input only the editable field turns red: the wrapper keeps its `otl-gray-200` border, and `InputAddon` and `InputIcon` keep their colours. `invalid` takes `boolean | null`; omitted, `false` or `null`, the field looks as before. A border class you added to show an error, such as `border-danger-600` on Input, which lands on the wrapper, doesn't re-theme and sets no `aria-invalid`, can go. `full.css` in `@amerfathullah/myds-style` carries the new classes.
- 73321a8: Label now takes a `disabled` prop, so a Label beside a disabled field can show it. Label used to dim only after a disabled sibling marked `peer`, or inside a disabled ancestor marked `group`, and no library field is either, so a Label beside a disabled Input, TextArea, DateField, TimeField, Select or Checkbox kept its `txt-black-700` colour. `disabled` sets the rendered element's `data-disabled`, and the disabled styling, `txt-black-disabled` text with a `not-allowed` cursor, follows `data-disabled="true"`, so it doesn't depend on where the field sits: before it, after it or in another wrapper. A `data-disabled` you pass yourself overrides `disabled`. Label disables nothing, so pass `disabled` to the Label and to the field: `<Label htmlFor="name" disabled>` beside `<Input id="name" disabled />`. `disabled` takes `boolean | null`; omitted, `false` or `null`, the Label looks as before. It never reaches the element as a native `disabled`, with or without `asChild`. Label still dims inside a `<fieldset disabled className="group">`. Once the Label takes `disabled`, a `text-txt-black-disabled` class or a `peer` class added as a workaround can go. `full.css` in `@amerfathullah/myds-style` carries the new classes.
- a47cd61: You can now rename the Navbar menu's `<nav>` landmark in your site's language. Screen readers announced it as "Main", in English, and no prop changed it.

  - **New `aria-label` and `aria-labelledby` props** on `NavbarMenu`. They name its `<nav>`, for example `<NavbarMenu aria-label="Utama">`. Without them it is still named "Main", which is now NavbarMenu's own documented default. Before, NavbarMenu dropped both props. It passes only these two to its `<nav>`, and an `aria-label` on `Navbar` still goes to its `<header>`.

  Nothing changes visually: the same elements, classes and icons render.

  The docs (EN/MS) give the default names of the Navbar menu's `<nav>` ("Main"), the Navbar menu toggle ("Open navigation menu" / "Close navigation menu"), the Masthead trigger ("Toggle masthead") and the Breadcrumb's `<nav>` ("breadcrumb"), and show how to rename each one with an `aria-label`. The Masthead examples pass an `aria-label` that matches the trigger's visible text.

- 193d8b1: `PaginationLabel` is now exported from `@amerfathullah/myds-react/pagination`, at runtime and in the declarations, as the Pagination docs already document it. Its rendering is unchanged: inside a `Pagination` it shows `content` when given, and otherwise "Page {page} of {totalPages}" when `type` is `full` and nothing for `default` or `simple`. Its `content` prop takes any React node. The entry point's other exports are unchanged.

  `type` is now optional on `Pagination` and `AutoPagination`, and defaults to `default`, as their docs say. `<Pagination>`, `<AutoPagination>` and an `AutoPaginationProps` object without `type` now type-check. TypeScript still rejects any type but `default`, `simple` and `full`. A `Pagination` without `type` now renders exactly like `type="default"`: `PaginationContext` gives the parts inside it, your own included, `type: "default"` instead of `undefined`, and its type still says `type` is always set. `AutoPagination` without `type` already rendered like `type="default"`, and still does.

  `PaginatorProps`'s JSDoc, which editors show on hover, now names the types `default`, `simple` and `full` and gives `default` as the default. It named them `basic`, `basic-alternate` and `number`.

- be02fd4: Pagination's built-in accessible names keep their English defaults, and you can now rename each one in your site's language.

  - **New label props on `AutoPagination`:** `previousLabel`, `nextLabel`, `pageLabel` and `ellipsisLabel` name the previous, next and page buttons and the ellipses it renders. With `type="default"`, `previousLabel` and `nextLabel` name the icon-only buttons and default to "previous page" and "next page". With `type="simple"` or `type="full"`, they are the buttons' visible text and default to "Previous" and "Next". `pageLabel` takes a page number and defaults to `` (page) => `page ${page}` ``, and `ellipsisLabel` defaults to "More pages". For example, `previousLabel="Halaman sebelumnya"` and ``pageLabel={(n) => `Halaman ${n}`}``. None of them reaches the DOM, and every other prop still goes to the `<nav>`. A node you pass as `previous` or `next` renders as before.
  - **`aria-label` now renames the parts you render:** `PaginationPrevious`, `PaginationNext` and `PaginationNumber` overwrote an `aria-label` you passed with "previous page", "next page" and "page N". Now yours replaces the default, for example `aria-label="Halaman 3"`.
  - **Children now name `PaginationPrevious` and `PaginationNext`:** with children, they get no default name, so a button showing "Sebelumnya" is named "Sebelumnya". Children with no text, such as an icon alone, need an `aria-label`. So AutoPagination's `simple` and `full` buttons are now named "Previous" and "Next", their visible text, not "previous page" and "next page".
  - **The ellipsis is now announced:** `PaginationEllipsis`'s "More pages" sat inside `aria-hidden`, so screen readers skipped it. Now only its icon is hidden, and its children replace the text, for example `<PaginationEllipsis>Lebih banyak halaman</PaginationEllipsis>`.

  Nothing changes visually: the same elements, classes and icons render.

  The docs (EN/MS) document the default names, the new props and how to replace each name.

- f73a96d: SearchBar now has a hover state, as the design guideline asks. Pointing at the bar's input container turns its border from `otl-gray-200` to `otl-gray-300`, in every size and in both themes, so pointer users get feedback before they click. It's a semantic token, so it re-themes in the dark theme. Focus still wins: a bar whose input has focus keeps its `otl-primary-300` border and ring while hovered. Nothing else changes on hover, and SearchBar's props are the same. A `hover:` border class you added to the bar yourself can go. `full.css` in `@amerfathullah/myds-style` carries the new class.
- 3b1c9d5: `SummaryListHeader` now renders an `<h2>` by default instead of an `<h1>`, so a summary list no longer adds a second `<h1>` to a page that has its own, and `asChild` lets its title take the level the page's outline needs. Before, a page with its own `<h1>` and two summary lists had three.

  - **`asChild` chooses the heading.** Pass `asChild` and your own heading to give the title the level your page needs, e.g. `<SummaryListHeader asChild><h3>Applicant Details</h3></SummaryListHeader>` for a summary list in an `<h2>` section. Your heading gets the header's classes. To restyle the title, pass `className` to `SummaryListHeader`, which merges your classes with its own; with `asChild`, the classes on your heading are added after the header's without that merge.
  - **A forwarded ref.** A ref on `SummaryListHeader` is the heading it renders: the `<h2>`, or your heading with `asChild`. On React 18 it used to be dropped, with React's "Function components cannot be given refs" warning.
  - **Nothing else changes.** The same classes render, so the title looks as before unless your CSS styles headings by element. Its props are now typed as an `<h2>`'s, with `asChild`; code written against the old `<div>` props, refs and event handlers included, still compiles. The other SummaryList parts are unchanged.

  **To migrate:**

  - Update tests or CSS that select the header as `h1`, or with `getByRole('heading', { level: 1 })`.
  - Check pages whose CSS styles `h2` differently from `h1`. Inside a Tailwind Typography `prose` container, for example, the title now takes prose's `h2` margins, 40px above it at its size. Add `not-prose` to the header (`<SummaryListHeader className="not-prose">`) to keep its spacing.
  - To keep an `<h1>`, write `<SummaryListHeader asChild><h1>…</h1></SummaryListHeader>`.

  The docs (EN/MS) say the header is an `<h2>` by default, show `asChild` with an `<h3>`, and list `asChild` in its props. In Storybook, a new story renders it as an `<h3>` under an `<h2>`.

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

- ed151c9: ThemeProvider now applies `defaultTheme` and restores the saved theme on load. It used to save each choice to `localStorage` but never read it back, and never put `defaultTheme` on `<html>`, so a reload returned to light, and `defaultTheme="dark"` rendered light while ThemeSwitch showed Dark. When it mounts, it puts on `<html>` the theme saved under `storageKey` (default `theme`), or `defaultTheme` (default `light`) when nothing valid is saved. It removes the other theme names, leaves other classes alone and saves nothing. A new `themes` prop lists the names it restores (default `["light", "dark"]`; `defaultTheme` always counts), each a single class name. `setTheme` still applies and saves any name. It now keeps its identity while `storageKey`, `defaultTheme` and the names in `themes` stay the same, even when `themes` is a new array. With storage blocked, as in a sandboxed iframe, it used to throw after changing the class, leaving `<html>` and the provider's `theme` out of step; the theme now lasts for the page's lifetime. A theme name other than `light` and `dark`, such as `system` in the ThemeSwitch docs' old Custom Themes sample, is now restored on load only if it is listed in ThemeProvider's `themes`, as in `<ThemeProvider themes={["light", "dark", "system"]}>`; otherwise choosing it still applies it, but it isn't restored, and it logs a warning once per name. `@amerfathullah/myds-react/utils`, which a Server Component can import, now exports `getThemeScript()`. It returns a script for `<head>` that applies the same theme before the page renders, so a user who chose Dark sees no flash of light. Pass it ThemeProvider's `storageKey`, `defaultTheme` and `themes`, and regenerate a copied script whenever they change. Code you added to read the saved theme, put its class on `<html>` and pass it as `defaultTheme` can go; if it ran before the page rendered, use `getThemeScript` in its place. The ThemeSwitch toggle now shows the provider's theme in its server HTML. A toggle rendered without a ThemeProvider now stays on Light when clicked, where before it flipped its icon and label without changing the theme; to fix it, wrap the app in ThemeProvider.

### Patch Changes

- 248a593: AlertDialog's `variant` is now optional and defaults to `default`, as its docs say. A missing, `null` or unknown `variant`, which plain JavaScript or a cast can pass, now renders as `default` instead of throwing a TypeError. The throw stopped the whole dialog from rendering, its trigger too, whether open, closed or server-rendered. TypeScript still rejects `null` and any name but `default`, `info`, `success`, `warning` and `danger`. Opening a `default` dialog no longer logs React's warning about an invalid `className` prop on `React.Fragment`. It still shows no status icon, and its layout is unchanged.
- 02b360f: DateRangePicker's `disabled={true}` now disables the whole picker, as DatePicker's does. It disabled every day in the calendars but left all four triggers enabled, so the From and To triggers looked enabled, took Tab focus, were announced as operable buttons, and each opened a calendar in which nothing could be picked: below `lg:`, a dialog with no close button. Now every trigger the picker renders takes native `disabled` and the `default-outline` Button's disabled look, Tab skips it, and a click, Enter or Space opens nothing. A disabled trigger keeps its text, its accessible name and its description. Its `From:` / `To:` prefix, always `txt-black-500` before, now takes `txt-black-disabled` whenever the trigger it sits in is `:disabled`, so it dims inside a `<fieldset disabled>` as well, where only the date used to dim. An enabled picker in the first `<legend>` of a `<fieldset disabled className="group">` keeps a `txt-black-500` prefix. Any other `disabled`, such as `{ before: date }`, a function, an array of Matchers (`[true]` included) or `false`, still leaves the triggers enabled, and the calendars disable the same days as before. A `<fieldset disabled>` you wrapped around a DateRangePicker only to disable its triggers can go. `disabled` keeps its type, `Matcher | Matcher[]`, and its JSDoc on both pickers now says that `true` disables the whole picker and any other value only the days it matches. `full.css` in `@amerfathullah/myds-style` carries the new class.
- f60b247: DialogBody and AlertDialogContent now call your `onInteractOutside` with Radix's event before their own handling of a press outside, instead of being replaced by it. Before, passing any `onInteractOutside`, even one that did nothing, or `onInteractOutside={undefined}`, silently switched off `dismissible={false}` and `onDismiss`.

  - **`dismissible={false}` still keeps the dialog open** on a press outside, whatever your handler does.
  - **`onDismiss` still runs when a press outside closes the dialog,** once, after your handler.
  - **`onDismiss` no longer runs when the dialog stays open:** on a right-click outside, or when your `onInteractOutside` or `onPointerDownOutside` called `preventDefault()`. Calling `preventDefault()` in your `onInteractOutside` still keeps a dismissible dialog open.

  DialogClose and AlertDialogClose now call your `onClick`, which they used to drop, before `onDismiss`. Calling `preventDefault()` in it, or in the `onClick` of the element inside it, keeps the dialog open without calling `onDismiss`. Before, `preventDefault()` in that element's `onClick` kept the dialog open but still called `onDismiss`.

  Escape, the built-in close cross, `onPointerDownOutside`, `onEscapeKeyDown` and every other prop work as before, and the props types don't change.

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
- 8a69b5f: InputIcon's `position` is now optional and defaults to `left`, the side an InputIcon without it already drew on. `<InputIcon>` and `position={undefined}` now type-check. TypeScript still rejects any side but `left` and `right`.

  Input now pads the field for an InputIcon without `position`. The `<input>` gets `data-has-left-icon="true"` and its 40px left padding, as with `position="left"`, so the placeholder and typed text no longer run under the icon. Explicit `left` and `right`, and a left and a right icon together, render as before.

- a4c05a6: InputOTP's slots now take their invalid and disabled looks only from InputOTP's own `<input>`. Inside an element marked `group`, such as a `<div className="group">` or a `<fieldset className="group">`, and inside the library's `AccordionItem` and `Toast`, which are marked `group`, the slots took the look of any other control there. An invalid Input, DateField, TimeField or another InputOTP gave them the `otl-danger-300` border, and the active slot the `fr-danger` ring. A disabled Button, Checkbox or Input, or a `<select>` with a disabled placeholder `<option>`, gave them the `bg-washed` fill and `txt-black-500` text. A control among InputOTP's children, such as a disabled Resend button, did the same. All the while InputOTP's own input stayed valid and enabled, and assistive technology announced it so. Now the slots have the `otl-danger-300` border exactly when the input has `aria-invalid="true"`, from `invalid` or an `aria-invalid` you pass, and the disabled look exactly when the input is `:disabled`, from `disabled` or a `<fieldset disabled>`. The one exception is an InputOTP you place among another InputOTP's children, which still takes the outer one's look. InputOTP's own looks don't change. Its container's class is now `group/input-otp` instead of `group`, so a bare `group-*` class you put on InputOTP's children or on `InputOTPSlot` no longer keys off the container: pass `containerClassName="group"`, or use the `/input-otp` form, such as `group-hover/input-otp:`. `full.css` in `@amerfathullah/myds-style` carries the new classes.
- 6d0d3b0: DateField and TimeField now have an `otl-gray-200` border whether `invalid` is omitted, `null` or `false`. With `invalid` omitted, the border fell back to the preset's primitive `gray-200`, which doesn't re-theme, so in the dark theme the field had a light edge. An invalid field now keeps its `otl-danger-300` border while focused and shows its 3px `fr-danger` ring only then, as the design guideline asks; focus used to replace both with the `otl-primary-300` border and `fr-primary` ring. At rest it shows no ring. The error styling now follows the input's `aria-invalid="true"`, which `invalid` sets, so an `aria-invalid` you pass yourself, as form libraries do, overrides `invalid`: `<DateField aria-invalid />` looks invalid, and `<DateField invalid aria-invalid={false} />` looks valid. `invalid` keeps its type, `boolean | null`. An `invalid={false}` added as a workaround is no longer needed. `full.css` in `@amerfathullah/myds-style` carries the new classes.
- 499cf29: The 24px `Mini…` legacy icons, such as `MiniBNMIcon` and `MiniPolicePDRMIcon`, now draw in the text colour, like the full-size legacy marks, so a `txt-*` class colours them and they change with the theme. They used to be a fixed `gray-800` (#27272A), which nearly disappears on the dark theme's backgrounds. In the light theme a Mini icon now follows the surrounding text colour instead of staying `gray-800`. To keep the old look, pass `className="text-gray-800"`.
- 7baa1a2: The README's hero image now loads from this repository's default branch, not from upstream's CloudFront bucket (ADR-0006), so it keeps showing on GitHub and npm if the bucket goes.
- c87bdef: The icons on `@amerfathullah/myds-react/icon` are regenerated from their SVG sources by the repaired icon generator. Nothing you import or render changes: the entry exports the same names, each icon renders the same markup, and `MalaysiaFlagIcon` and `JataNegaraIcon` keep their deprecation notes. Only some icons' doc comments in the type declarations change, to name their export: `BookMOEIcon`, `MiniBookMOEIcon`, `PDFMediaIcon` and `RSSIcon`.
- ee9b229: The unexported Sheet component is removed from `@amerfathullah/myds-react`. Its compiled files shipped in the package, but its `exports` map never had a `./sheet` entry, so `@amerfathullah/myds-react/sheet` could never be imported and no component used it. Nothing public changes: every subpath the package exports resolves as before, and its dependencies are the same. `full.css` in `@amerfathullah/myds-style` no longer carries the classes that only Sheet used.
- 75be647: In Chromium, a DateField or TimeField whose input is narrower than its text (a fixed `width`, or a `min-width` inside a narrow parent) now scrolls the focused segment fully into view, fill included, whenever keyboard focus moves to it. Chromium's focus scroll used to bring a segment into view only when it was entirely hidden, so a partly hidden one stayed cut off. The fields wrapper inside the edit area now has scroll padding of half its width on each side, which leaves only its centre line, and Chromium centres any focused segment that doesn't cross it. Typing that widens the focused segment, as when an empty AM/PM becomes PM, doesn't scroll it, and neither does a click. A segment wider than half the field, such as milliseconds when `step` is under 1, can stay partly cut. A field at its natural width keeps its layout and never scrolls, in left-to-right and right-to-left locales. `full.css` in `@amerfathullah/myds-style` carries the new classes.
- dce477b: Several SearchBars can now share a page. Each SearchBar generates its own id for its results panel, `SearchBarResults`, and points its input's `aria-controls` at it. Before, every SearchBar rendered `id="search-input"` on its panel and `aria-controls="search-input"` on its input. Two SearchBars on one page, such as a header search beside a page search, duplicated the id, and both inputs pointed at the first bar's panel.

  - **Your `id` wins.** An `id` you pass `SearchBarResults` is now rendered, and that bar's input points at it. SearchBar used to overwrite it.
  - **Your `aria-controls` wins.** An `aria-controls` you pass `SearchBarInput` now reaches the `<input>`. SearchBar used to overwrite it with `search-input`.
  - **Same target.** The input still points at the results panel, which stays mounted, not at cmdk's listbox, which the documented composition mounts only when there are results.
  - **Server rendering.** Server-rendered HTML wires each input to its own panel, and hydrates without a warning. When you pass `SearchBarResults` an `id`, the server HTML still points the input at the generated id, and the input follows yours once the page hydrates.

  The generated id comes from React's `useId()`, so don't rely on its format; it differs between React 18 and 19. Nothing changes visually: the same elements and classes render.

  **If you upgrade:** update tests, CSS or scripts that select `#search-input`. Pass your own `id` to `SearchBarResults` and select that instead.

  The docs (EN/MS) list `id` on `SearchBarResults`.

- b38270e: Select's `value` now controls it, as its docs say. A pick calls `onValueChange` with the next value, but what the trigger shows, which items are checked, what SelectValue's `children` function receives and, in a single select, what a form submits change only once you pass the new `value`. Before, Select copied `value` into state of its own, so a pick showed even when the parent kept `value` as it was.

  - **`value=""` clears a single select.** It shows the placeholder, puts `data-placeholder` on the trigger, checks no item and submits an empty value. Before, the select kept showing its last value, so a form library's reset didn't clear it. `value=""` also wins over `defaultValue`.
  - **A `multiple` select's `onValueChange` builds on the current `value`.** With `value={["apple"]}`, picking Banana and then Cherry calls it with `["apple", "banana"]`, then `["apple", "cherry"]`. Before, it built on its own copy, so the second call passed `["apple", "banana", "cherry"]`, a selection the parent never held.
  - **Uncontrolled selects are unchanged.** Without `value`, the selection starts from `defaultValue`, or from nothing, and each pick shows and calls `onValueChange`.

  **If you upgrade:** code that passes `value` only as an initial value, and never updates it, now gets a select that doesn't change on a pick. Pass `defaultValue` instead.

- 5bfa2bc: Select's `size` and `variant` are now optional and default to `small` and `outline`, as its docs say. A bare `<Select>`, as in the docs' Anatomy, now type-checks, as do `<Select size="medium">`, `<Select variant="ghost">` and `<Select multiple>`. TypeScript still accepts `null` and rejects any other name.

  An omitted `size`, which plain JavaScript or a cast could already pass, now sizes the trigger's chevron and a selected item's check icon like `small`, at 16px. Before, both rendered at 20px, and an `icon` passed to SelectValue at its own size. Every other part, and every part without `variant`, already rendered like `small` and `outline`. Explicit values, `null` included, render as before.

- 62127ab: SelectItem's `disabled` now disables the option, as Select's docs say, instead of only styling it. Before, SelectItem never passed `disabled` on to Radix's item, so a disabled option behaved like an enabled one.

  - **It's marked unavailable.** A disabled option carries `aria-disabled="true"` and `data-disabled`, and in a select inside a `<form>`, its hidden native `<option>` is `disabled`.
  - **Focus skips it.** Opening the list focuses the first enabled item. In the open list, the arrow keys, Home, End and typeahead skip a disabled option, and so does typeahead on the closed trigger. Hovering doesn't highlight it, so it keeps its disabled fill.
  - **Nothing picks it.** Enter, Space, a click or a tap on a disabled option doesn't call `onValueChange` or close the list. In a `multiple` select, it can't be added to the selection, and its Checkbox shows as disabled, in Checkbox's existing disabled look.

  Enabled items, `disabled={false}` and Select's own `disabled` work as before, and a disabled item keeps its classes.

- 803fcb0: SelectHeader and SelectFooter now pass every prop and their ref to their `div`, as their types say. Before, they kept only `className` and `children`, so anything else you gave them never reached the page. React 19 logged nothing, and React 18 only warned that a function component can't be given a ref.

  - **Attributes land on the `div`.** `id`, `role`, `aria-*`, `data-*`, `title`, `tabIndex` and `style` now render on the header's or footer's `div`, so you can give the region a role, a name or a description, or point `aria-labelledby` or `aria-describedby` at it by `id`. `className` still merges after the part's own classes.
  - **Event handlers run.** `onClick`, `onKeyDown` and the other handlers now run when the `div` gets the event. Before, only SelectContent's handlers saw it, by bubbling.
  - **The ref gets the `div`.** An object or callback ref now receives the header's or footer's `div`, under React 18 and 19, so you can measure it. Before, an object ref stayed `null` and a callback ref was never called.

  Without extra props, the header, the footer and every other part of Select render the same markup as before, and the props types don't change.

- f2a8536: A string `label` on SelectValue now names its Select for assistive technology. Before, the label was drawn in the trigger before the value, as in `label="Fruit"`, but the trigger had no accessible name, and the label was read as part of its value ("Fruit Banana").

  - **A non-empty string `label` names the trigger and the open list.** Both point their `aria-labelledby` at the label, so the trigger is announced as "Fruit", with the selection, or a `multiple` select's count, as its value. The label is no longer read as part of the value. An `aria-label` or `aria-labelledby` you pass to SelectContent still names the list instead.
  - **A name you give the trigger still wins, and then nothing changes.** That's an `aria-label` or `aria-labelledby` on SelectTrigger, a Label whose `htmlFor` matches SelectTrigger's `id`, or a Label wrapping the Select. The trigger keeps that name, the label stays part of its value and the list isn't named by it.
  - **A Select without a `label` still needs a name from you.** So does one with an empty or element `label`, which names nothing. Give SelectTrigger an `id` and a Label pointed at it, or an `aria-label`.

  The name is set once the Select has mounted, so server HTML doesn't carry it until hydration. Nothing looks different, and the types are unchanged.

- 548ec9d: A `multiple` Select now works in a form. Before, it handed its array of values to the hidden native `<select>` that Radix renders for a form, which takes a single value. Now it renders a visually hidden `<select multiple>` of its own instead, with a selected option for each value. That control carries Select's `name`, `form`, `required`, `disabled` and `autoComplete`.

  - **No warning.** A `multiple` select no longer logs React's "The `defaultValue` prop supplied to `<select>` must be a scalar value if `multiple` is false", inside or outside a form, rendered on the server or hydrated.
  - **Picks stay.** Inside a `<form>`, or with `form`, each pick calls `onValueChange` once with the whole selection, as outside a form. Before, the hidden `<select>` reported each pick back as a second one, so a pick made from nothing was undone, and other picks added or removed a stray `""`.
  - **It submits each selected value under `name`**, as a native `<select multiple>` does, and nothing while nothing is selected. That holds for `defaultValue`, for a controlled `value` and after picks. Before, it submitted one value until the first pick, the first item unless exactly one was selected, and nothing after it.
  - **`required` holds.** The form is invalid while nothing is selected. Before, it passed validation.
  - **A form's reset restores the starting selection**, `defaultValue` or nothing, and calls `onValueChange` once with that array. A controlled select shows it once you pass the new `value`. Before, the reset added the starting array to the selection as one more item.

  A disabled `multiple` select still submits nothing. Single selects work as before, and so does a `multiple` select outside a form.

- 016c018: A `multiple` Select now tells assistive technology which options are selected. Before, it drew each pick as checked but marked every option not selected, because Radix's Select, which it's built on, holds a single value.

  - **Each option carries `aria-selected` matching the selection**, from `defaultValue` or `value` and after every pick, whichever option has focus. It always agrees with the option's `data-state`.
  - **The list carries `aria-multiselectable="true"`**, so it's announced as a list where more than one option can be picked.
  - **The Checkbox in each item is decorative.** It's no longer a separate unnamed, focusable checkbox inside the option, so each option is announced once, by its text and whether it's selected. A press on the Checkbox still picks or unpicks the item, and now leaves focus on the option, so the arrow keys carry on from there.

  The Checkbox looks the same, checked, unchecked and disabled. Only the square itself changes: a pointer over it no longer shows Checkbox's own hover colour or pointer cursor, and a press on it no longer leaves Checkbox's focus ring on it. Keyboard and pointer picks work as before, and single selects are unchanged.

- 40cf7ef: Select's `open` now controls it, as its types say. Each request to open or close the list calls `onOpenChange` with the state it asks for, and the list changes only once you pass the new `open`. Before, Select kept its own copy of the open state, so the list opened and closed whatever `open` said.

  - **The requests that call `onOpenChange`.** To open: a click or press on the trigger, and Enter, Space, ArrowDown or ArrowUp on the focused trigger. To close: Escape, a press outside the list, the window's blur or resize, releasing outside the list a press that started on the trigger, and, in a single select, a pick.
  - **`defaultOpen` now applies from the first render, server render included.** Before, the server HTML and the first render showed the list closed, and it opened only after mount.
  - **A `multiple` select now closes with Escape, and on the window's blur or resize, and calls `onOpenChange(false)` whenever it closes.** Escape returns focus to the trigger, so a keyboard user can leave the list. Before, only a press outside closed it, and that didn't call `onOpenChange`. It still stays open after a pick, which calls no `onOpenChange`.
  - **Select no longer logs Radix's warnings** "Select is changing from controlled to uncontrolled" and "Select is changing from uncontrolled to controlled", which every Select without `open` logged in development.

  A single select without `open` or `defaultOpen` works as before: each request shows at once and calls `onOpenChange`. The props types don't change.

  **If you upgrade:** code that passes `open` only as an initial value, and never updates it from `onOpenChange`, now gets a list that doesn't open or close. Pass `defaultOpen` instead.

- 7b808b2: SelectContent now calls your `onPointerDownOutside` with Radix's event before it closes the list, as its types say. Before, SelectContent replaced it with its own close handler, so your handler was silently dropped and never ran.

  - **It runs once per press outside the open list,** in single and `multiple` selects. It gets the event Radix's `Select.Content` passes: a cancelable event whose `detail.originalEvent` is the `pointerdown`.
  - **Calling `event.preventDefault()` in it keeps the list open,** and `onOpenChange` isn't called with `false`, as on Radix's `Select.Content`.

  Without a handler, or with one that doesn't call `preventDefault()`, a press outside closes the list as before, with the same `onOpenChange` calls. `onEscapeKeyDown`, `onCloseAutoFocus` and every other prop pass through as before, and the props types don't change.

- c9fe45b: Every entry now shares one of each context and one toast emitter when you load the library through `require`, and when you load some entries through `import` and others through `require`. Before, each CommonJS entry carried its own copy of each, so a provider from one entry never reached a component from another, and nothing was logged. This hit Jest without ESM mode, plain Node `require`, CommonJS server bundles that leave the package to Node, and the Next pages router with `esmExternals: false`. Loading only through `import`, as Next's default, Vite and Vitest do, already worked. Under `require`, or mixing the two:

  - **Theme.** ThemeSwitch inside a ThemeProvider, or inside your own `ThemeContext.Provider` as the docs' ThemeBridge does, now shows and sets the provider's theme. It showed Light, and clicking the toggle changed nothing.
  - **Toasts.** `toast()` from `useToast` now shows in a mounted `AutoToast`. Nothing showed.
  - **Buttons.** `ButtonIcon` and `ButtonCounter` inside `PaginationPrevious`, `PaginationNext`, `CookieBannerPreferencesTrigger` and `Skiplink` now take that button's size and variant, not the small `primary-fill` default.
  - **Dialogs, under `require`.** A `DialogClose` inside `AlertDialogContent`, or an `AlertDialogClose` inside `DialogBody`, now calls the dialog's `onDismiss`. The dialog closed, but `onDismiss` was never called. Load a dialog's parts through one condition: Radix's dialog, which they're built on, has a context of its own in each of its CommonJS and ESM builds, so a `DialogClose` loaded through the other condition still throws "`DialogClose` must be used within `Dialog`", as before.

  The library keeps its contexts and its emitter on `globalThis`, under a key for this package's major version, once for each copy of React. Separate copies of React, such as two independently bundled apps on one page, still share nothing, and neither do different major versions of the library. Where `globalThis` is frozen, contexts are made as before: once in each CommonJS entry, and once for all the ESM entries. The build's file layout, exports and types are unchanged.

  **What else changes:**

  - With one shared React and two bundled copies of the library, as in module federation or single-spa, each `toast()` shows in every mounted `AutoToast`. Mount one per page.
  - Copies of the same major version share each context's default value, and the copy that loads first decides it.
  - A module evaluated again gets back the context it made before. So in development, a context default you edit in the library stays as it was until a full reload, or until you restart `next dev`.
  - In Vitest, with the library inlined, `vi.resetModules()` no longer gives fresh contexts. That now matches an installed copy.

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
