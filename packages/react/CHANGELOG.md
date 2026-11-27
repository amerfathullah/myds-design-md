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

- a350f9b: CookieBanner now sits where the design guideline's "Cookie banner location" puts it: across the bottom of the window below `md:` (768px), and in the bottom-left corner from `md:` up. It used to sit bottom-right, touching the window's edges on a phone. From `md:` up a toast sat over it there, and took the clicks meant for its "Reject all" and "Customise" buttons. Toasts stay bottom-right, so from 908px up the two no longer overlap. From 768 to 907px a toast can still cover the banner's right side.

  - **Below `md:`.** The banner stretches across the window, 18px from its left, right and bottom edges, with 18px padding. Nothing caps its width here: it's the window's width less 36px.
  - **From `md:` up.** It's 500px wide, border and padding included, 24px from the window's left and bottom edges, with 24px padding. Its padding used to widen at `sm:` (640px); it now widens at `md:`.
  - **Height cap.** It's never taller than the window less its bottom gap: 18px below `md:` and 24px from `md:` up. Its content scrolls inside it beyond that.
  - **Page padding.** While it's shown, the inline `scroll-padding-bottom` on `<html>` and `padding-bottom` on `<body>` are its height plus its new bottom gap.
  - **Unchanged.** The action row still stacks below `sm:`, and `CookieBannerPreferencesTrigger` is still full width below `sm:`. The slide-in, the close cross, the z-index and the focus behaviour are as before. No props, types or exports change.

  **If you upgrade:**

  - From 768px up, the banner now covers the bottom-left corner of the window, so check what you place there, such as chat or feedback widgets and back-to-top buttons.
  - On a phone it has 18px margins, so it no longer touches the window's edges.
  - A `className` that sets the banner's position must now also override its `md:` classes, such as `md:right-auto` and `md:ml-6`, which win from `md:` up. Its gaps are margins on a box fixed at `bottom-0`, so an unprefixed `bottom-auto` or `top-*` still moves it at every width.

  `full.css` in `@amerfathullah/myds-style` gains `mx-4.5`, `mb-4.5`, `md:right-auto`, `md:ml-6`, `md:mb-6`, `md:w-[500px]` and `md:p-6`, and loses `max-w-[500px]`, `sm:mr-4` and `sm:mb-4`.

  In `DESIGN.md`, the Page frame and the CookieBanner entry describe where the banner sits, and Known Gaps no longer lists its position as a Divergence. The docs (EN/MS) describe where it sits.

- 9472d1b: CookieBanner is now a named page region instead of a modal dialog, so it no longer blocks the page, and only its own controls close it. As a dialog with no overlay, it hid the rest of the page from screen readers and kept Tab inside itself while open. It also caught the first click outside it, which closed it without reaching its target. Escape closed it too, so a visitor could dismiss it without choosing.

  - **A `<section>` named by its title.** CookieBanner renders a `<section>` that `CookieBannerTitle` names, so always include a title. An `aria-label` or `aria-labelledby` you pass takes precedence. It has no `role="dialog"`, `aria-modal` or `aria-describedby`, and it leaves the rest of the page alone: no `aria-hidden`, no `pointer-events: none`, no scroll lock. Its description is read in reading order.
  - **Rendered in place.** It renders where you put it, with no portal, and only in the browser, so a `defaultOpen` read from browser storage doesn't cause a hydration mismatch. It's now capped at the window's height less its bottom margin, and its content scrolls inside it beyond that.
  - **What closes it.** Only a `CookieBannerClose` (Accept, Reject or Save) and the close cross. A press outside it, focus moving outside it and Escape no longer close it. It calls `preventDefault()` on none of them, so a click outside reaches its target. `onOpenChange(false)` is called once per close. Every opening starts in the default view, and nothing resets the Customise view while the banner is open.
  - **Focus.** Opening it right after a visitor action, such as a click on "Cookie settings", moves focus to the banner. Opening it on page load or from an effect doesn't move focus. Closing it with focus inside moves focus back to what opened it, else to the next focusable element after it (SkipLink in the page frame), else to `<body>`, without scrolling the page. Tab and Shift+Tab move into and out of it in DOM order. Customise moves focus to the first preference, and a trigger that goes back, such as "Back", to Customise.
  - **Page padding.** While it's shown, it sets an inline `scroll-padding-bottom` on `<html>` and `padding-bottom` on `<body>` to its height plus its bottom offset, and keeps them up to date as it resizes. A control that takes focus then scrolls into view above it (WCAG 2.2 SC 2.4.11). When it closes or unmounts, it puts back the inline values that were there before.
  - **Handlers.** A `CookieBannerClose` or `CookieBannerPreferencesTrigger` runs your `onClick` first. If your handler calls `preventDefault()`, the banner stays open or the view stays. A trigger's `onClick` used to replace its toggle.
  - **Props.** CookieBanner takes every `<section>` attribute, such as `id`, `aria-label` and `style`, and forwards its ref to the `<section>`. `open`, `defaultOpen`, `onOpenChange`, `modal` and `closeLabel` never reach the DOM, so React no longer warns about them. `modal` is deprecated and does nothing; it's removed at the next major. `CookieBannerPreferences` is now a `<div>`, so block content inside it no longer nests in a `<p>`.

  **To migrate:**

  - Render CookieBanner first in `<body>`, before SkipLink.
  - Update tests and CSS that select it by `role="dialog"`. Select its region instead, for example by its title's name.
  - Drop `modal`, and any `onInteractOutside` or `onEscapeKeyDown` handlers. They're no longer accepted, and the banner already stays open until the visitor chooses.

  `full.css` in `@amerfathullah/myds-style` gains `max-h-[calc(100dvh-1.125rem)]` and `md:max-h-[calc(100dvh-1.5rem)]`, for the banner's height cap.

  The docs (EN/MS) say to render the banner first in `<body>`, describe what closes it, its focus and its page padding, and document its section attributes, its ref and the deprecated `modal`. Their previews render it in place. In Storybook, the CookieBanner story's docs page shows each story in its own frame, so the banner isn't cut off, and the story logs `onOpenChange`.

- 8e41f09: DataTable's built-in controls now have English default names that tell rows apart, and you can rename each one in your site's language. Screen readers announced every row's selection control as just "checkbox" or "radio".

  - **Row selection controls:** each row's checkbox or radio is named "Select row N", where N numbers the rows the table shows from 1, top to bottom in the current sort, counting expanded sub-rows. The new `selection.rowLabel` renames them: a function is called with each row and returns its name, for example `` rowLabel: (row) => `Pilih ${row.original.name}` ``. A string also works, but gives every row's control the same name again.
  - **More `selection` options:** `selectAllLabel` names the select-all checkbox in `checkbox` mode (default "Select all rows"). `clearLabel` names the radio column's reset button, which had no name (default "Clear selection"). `columnLabel` sets the selection column's visually hidden header, which read "selection-column" (default "Select").
  - **Nested-row toggle:** `Cell.Expand`'s button is named "expand row", and the new `nest.expandLabel` renames it, as a string or a function of the row. The button now has `aria-expanded`, so screen readers say whether the row is expanded. The chevron icon no longer has a name of its own. `Cell.Expand` keeps its call signature.
  - **Header tooltips:** a column's new `meta.tooltipLabel` names its tooltip's trigger (default "Tooltip"). `TableTooltip` now declares `aria-label` and sends it to its trigger, so `<TableTooltip aria-label="Maklumat">` renames it.

  These options never reach the DOM. Nothing changes visually: the same elements, classes and icons render.

  The docs (EN/MS) document the new options, their defaults and `TableTooltip`'s `aria-label`, with Malay examples.

- 23c9bc0: DataTable's `<table>` can now be named. DataTable takes `aria-label` and `aria-labelledby`. Before, both type-checked in JSX, but DataTable dropped them without a warning, so no DataTable could be named, and screen reader users couldn't tell two tables on a page apart.

  - **They name the `<table>`.** Point `aria-labelledby` at a visible heading above the table, for example `<h2 id="pemohon">Senarai pemohon</h2>` with `aria-labelledby="pemohon"`. Where the page shows no title for the table, use `aria-label`, for example `aria-label="Senarai pemohon"`. If you pass both, `aria-labelledby` wins, as usual. The name holds while `loading` and with no rows, and server-rendered HTML carries it.
  - **There is no default name.** ADR-0008's English defaults are for controls with no text of their own, and a table's name describes your data. Without either prop, the table has no name, as before, and DataTable logs no warning.
  - **Only the `<table>` gets them.** Neither reaches the scroll wrapper or any other element. `className` still styles the scroll wrapper, as on Table. DataTable still takes no `caption`, `id`, `title` or children, so name a table with a heading and `aria-labelledby` rather than a `TableCaption`.
  - **Nothing changes visually.**

  **If you upgrade:** a non-string `aria-label` or `aria-labelledby` on DataTable, which TypeScript used to accept, is now a type error.

  The docs (EN/MS) add a section on naming the table, with a live example whose heading names it through `aria-labelledby`, and `aria-label` and `aria-labelledby` rows in DataTable's props. The page's main example names its table. Every DataTable story in Storybook names its table.

- 1afbb83: DataTable's radio selection is now one radio group per table, so it's one Tab stop, keeps the arrow keys inside the table and submits its selected row with a form. A new `selection.name` names the form field. Disabled radios now look as the library's Radio does.

  - **One Tab stop per table.** The row radios share one `name`, so Tab stops on the selected row, or on the first row that can be selected while none is selected, instead of on every row. That includes a selected row that has since been made unselectable, in React 18 as well as 19. "Clear selection" stays a Tab stop of its own while a row is selected.
  - **The arrow keys stay in the table.** They move between the table's selectable rows and select each one, wrapping at the ends. In Chromium, they used to move into, and select a row in, the next radio DataTable or any other unnamed radio on the page. `onSelectionChange` is still called with `[]` on mount, and now once for each actual change, never again with unchanged ids, for example when the selected row is clicked again.
  - **New `selection.name`.** Inside a `<form>`, the table submits its selected row as `<name>=<row id>`, e.g. `pegawai=b` with `selection={{ id_by: "id", mode: "radio", name: "pegawai" }}`. Without `name`, or with an empty one, each table gets a name of its own from `useId()`. Make it unique within its form. Nothing is submitted while no row is selected, or once the selected row can no longer be selected, because a disabled radio isn't submitted. `checkbox` mode ignores `name`. Before, a radio DataTable submitted nothing.
  - **"Clear selection" is `type="button"`.** Inside a form, it clears the selection without submitting. Before, it submitted the form, and when it was the form's first submit button, Enter in a text field submitted through it, clearing the selection first.
  - **Disabled looks match Radio.** A selected row that can no longer be selected keeps `primary-600` at 30%, round, with its dot. Before, it painted almost the page's colour, so you couldn't tell which row was selected. A row that can't be selected is `bg-washed` at full opacity in its `otl-gray-200` border, instead of fading to 30%. An unselected radio no longer draws its dot in the page's colour.
  - **No warning.** The radios select on their change event, so React no longer logs "You provided a `checked` prop to a form field without an `onChange` handler" for each row, in the browser or on the server.
  - **No radio `id`.** The row radios no longer render the bare row id as their `id`, which repeated across tables. Their `value` is still the row id.

  `full.css` gains `checked:before:bg-bg-white`, `disabled:not-checked:bg-bg-washed` and `has-[:disabled]:has-[:checked]:opacity-30`, and loses `has-[:disabled]:opacity-30`, which nothing else used. DataTable also drops `has-[:disabled]:has-[:checked]::bg-primary-600` and `before:contents-['']`, which generated no CSS; the pinned columns' edge shadows are unchanged.

  The docs (EN/MS) describe the radio column's single Tab stop and arrow keys, `selection.name` and what a form submits.

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

- 496cf6e: DataTable now truncates exactly its widenable columns, so a column that can't be widened shows all its text, and every widen press on clipped text reveals it (#192). DataTable used to decide once, when it mounted, from the `id` of each top-level entry in `columns`. `meta.expandable`, which adds the widen button, played no part.

  - **Widenable columns.** A column is widenable when it's a leaf column with `meta.expandable: true`, however it's defined: with an `id`, with `accessorKey` alone, inside a grouped header, or added after mount. DataTable works this out on every render. Its header, body and footer cells carry `data-expanded="false"` until the column is widened, and `"true"` once it is.
  - **Truncation.** A collapsed widenable column truncates its text at every width: one line, with an ellipsis where its content is text. Its cells keep `max-width: 230px`, which caps the text, not the column: the column is at least 230px wide while its text is longer, and takes its share of spare width.
  - **Wrapping.** Every other column wraps, at every width, `md:` and up included, so its text shows in full and makes its rows taller rather than the table wider. A widened column stays on one line from `md:` up and wraps below `md:`.
  - **Each widen press shows its result.** A widenable column defined without an `id`, inside a grouped header or added after mount showed all its text at rest, changed nothing on its first widen press and truncated on its second. It now starts truncated, and its first press reveals its text.
  - **Groups.** Group and placeholder header cells, and their footer cells, never carry `data-expanded`, even where a group shares an id with one of its leaves. A group column isn't widenable, so its `meta.expandable` no longer gives it a widen button.
  - **Focus rings.** A focused button that starts a cell of a column that can't be widened, such as an Edit button in an Action column, no longer loses the left side of its ring to the cell's `overflow: hidden`.

  Pinned columns' offsets and widths, and the table's width, don't change.

  **If you upgrade:**

  - A column with an `id` and no `meta.expandable` no longer truncates. Set `meta.expandable: true` to keep it truncated, which also gives it a widen button. In a table with pinned columns, give a long column that can't be widened a `size`, or it can be squeezed to its longest word.
  - Widenable columns defined without an `id`, inside a grouped header or added after mount now start truncated.

  `full.css` in `@amerfathullah/myds-style` drops `md:whitespace-nowrap` and gains `md:data-[expanded=true]:whitespace-nowrap`.

  The docs (EN/MS) rename "Expanding Columns" to "Widening Columns" ("Melebarkan Lajur"), say which columns truncate, how wide a collapsed column is, that other columns wrap and that a widened one wraps below `md:`, and advise giving a long column a `size` in a pinned table. They say "widen" for a column, keeping "expand" for nested rows. Storybook's PinnedColumns story gives its Action columns unique ids, so no React key repeats.

- db9cc57: `DatePicker` and `DateRangePicker` now disable the whole picker when `disabled` is an array that contains `true`, as they do for `true` (#231). react-day-picker reads an array of Matchers as "any of these", so a `true` in it disabled every day, but only `disabled={true}` disabled the triggers. With `disabled={[isLocked, { before: today }]}` and `isLocked` on, every trigger looked enabled, took Tab focus, was announced as an operable button, and opened a calendar in which nothing could be picked: below `lg:`, a dialog with no close button.

  - **`true`, alone or as an element of an array, wherever it stands, disables the whole picker.** `[true]`, `[true, { before: date }]` and `[{ dayOfWeek: [0, 6] }, true]` now behave as `true` does. Every trigger the picker renders takes native `disabled` and the `default-outline` Button's disabled look, Tab skips it, and a click, Enter or Space opens nothing. DateRangePicker's `From:` / `To:` prefix dims, as it does for `true`. A disabled trigger keeps its text, its accessible name and its description, and the calendars disable the same days as before.
  - **Booleans elsewhere don't count.** A `false` in an array changes nothing, so `[false, { before: date }]` behaves as `{ before: date }`, and `[false]` and `[]` disable nothing.
  - **Any other value still disables only days, even every day.** A function such as `() => true`, a `{ before }`, `{ after }` or `{ from, to }` that covers `minYear` to `maxYear`, all seven `dayOfWeek` values, a list of Dates, and DateRangePicker's own From/To bound combined with a day rule leave the triggers enabled. The picker doesn't try to detect them. To disable the whole picker whatever the rule, pass `true` itself, as in `disabled={isLocked ? true : rule}`, or put the picker in a disabled `<fieldset>`.

  `disabled` keeps its type, `Matcher | Matcher[]`, and its JSDoc on both pickers states the rule. Nothing changes for `true` or for a single non-boolean Matcher.

  **If you upgrade:**

  - An array that contains `true` now disables the triggers: they leave the Tab order, are announced as disabled, and open nothing.
  - To keep a picker focusable while no day can be picked, pass a rule without `true`, such as `() => true`.

- 59fd000: `DatePicker` and `DateRangePicker` can now be named by a Label. Screen readers announce each trigger by the field's label, then by what the trigger shows, so two pickers in one form no longer read as two "dd / mm / yyyy" buttons.

  - **New `aria-labelledby`, `aria-label` and `aria-describedby` props** on both pickers. They reach every trigger the picker renders: the dialog's trigger below `lg:` and the popover's from `lg:` up, both of them on DateRangePicker.
    - `aria-labelledby` takes a Label's `id`: `<Label id="dob">Date of birth</Label>` with `<DatePicker aria-labelledby="dob" />`. The trigger is announced as "Date of birth 12 Mar 2024", or "Date of birth dd / mm / yyyy" before a date is chosen. DateRangePicker's triggers are announced as "Travel dates From: 12 Mar 2024" and "Travel dates To: 20 Mar 2024", their prefixes following `fromLabel` / `toLabel` and `locale` as before.
    - `aria-label` names a picker with no visible label, in your site's language, and the date still follows it: `<DatePicker locale="ms" aria-label="Tarikh lahir" />` is announced as "Tarikh lahir 12 Mac 2024". If you pass both, `aria-labelledby` wins.
    - `aria-describedby` takes the id of a hint, which describes every trigger.
  - **Not `htmlFor`.** The pickers still take no `id`, so a Label's `htmlFor` can't name them, unlike the date field, and clicking the Label doesn't open the picker. Each picker renders its triggers twice, so one `id` would repeat, and a `<label for>` would replace the date in a trigger's name.
  - **Without the props, nothing changes.** The triggers have the same names, text and classes, with no `aria-labelledby` or `aria-describedby`. They have no default name.

  Nothing changes visually.

  **If you upgrade:** an `aria-label` or `aria-labelledby` you already passed, which TypeScript and plain JavaScript both allow, used to land on the open calendar's root, and now names the triggers instead. An `aria-describedby`, which was dropped, now describes them.

  The docs (EN/MS) name each picker with a Label, say that `htmlFor` doesn't work, and document the three props, and `fromLabel` / `toLabel` on DateRangePicker. Each picker's Storybook usage example names it with a Label, and a new story shows it.

- bd661d3: `MalaysiaFlagIcon` and `JataNegaraIcon` are deprecated on `@amerfathullah/myds-react/icon`, and the next major removes them from it. Both are national marks, not icons. A national mark tells citizens that the Government runs a site, so only an official service may show one, and an icon entry that offers both next to 218 other icons invites any site to show them. Nothing breaks: the entry still exports both, as the same components with the same type, and they render the same SVG. Editors and the `@typescript-eslint/no-deprecated` rule now flag each import, with a note saying what to use instead. The Masthead already shows the flag. An official service that shows the Jata Negara supplies the image itself, through the Navbar or Footer logo slot, as it supplies its agency logo. The Masthead renders as before, and no other entry exports either mark.
- 6e3979f: Screen readers now announce what the date pickers' calendars and the Navbar's mobile menu are for. The dialogs they open in had no name, and axe flagged each one (`aria-dialog-name`). DateRangePicker's From and To dialogs couldn't be told apart.

  - **New `calendarLabel` prop** on `DatePicker`, defaulting to "Choose date". It names the dialog the calendar opens in: the Dialog below `lg:` and the Popover from `lg:` up. Screen readers announce it; it isn't shown. Set it in your site's language, for example `calendarLabel="Pilih tarikh"`.
  - **New `fromCalendarLabel` and `toCalendarLabel` props** on `DateRangePicker`, defaulting to "Choose start date" and "Choose end date". `fromCalendarLabel` names the From calendar's Dialog and Popover, and `toCalendarLabel` the To calendar's. For example, `fromCalendarLabel="Pilih tarikh mula"` and `toCalendarLabel="Pilih tarikh akhir"`. `fromLabel` / `toLabel` still change only the triggers' "From:" / "To:" prefixes, not these names.
  - **The new props don't follow `locale`.** Under `locale="ms"` the dialogs are named "Choose date", "Choose start date" and "Choose end date" until you pass Malay text, as the year buttons are named "Go to the Previous Year" / "Go to the Next Year" until you pass `previousYearLabel` / `nextYearLabel`.
  - **The pickers' `aria-label`, `aria-labelledby` and `aria-describedby` are unchanged.** They still reach every trigger and nothing in an open calendar or dialog, so a dialog isn't named after its picker's label. The triggers still have no default name.
  - **Why the dialogs have a default.** ADR-0011 rejected "Choose date" as a default for the triggers: a trigger shows its date, which a default `aria-label` would replace, and a default would hide a picker you forgot to label. Neither reason applies to a dialog with no visible title, so the dialogs get English defaults you can replace, as other built-in names do (ADR-0008).
  - **The Navbar's mobile menu is named after its toggle.** Below `xl:`, NavbarAction's toggle opens the menu in a panel that screen readers announce as a dialog. The panel now takes its name from the toggle, so it is "Menu" by default, and an `aria-label` or `aria-labelledby` on NavbarAction renames the toggle and the panel at once, for example `aria-label="Navigasi"`. There is no new prop. If the panel can't find the toggle, as when the Navbar's context comes from an older copy of the library, it is still named "Menu".
    - The toggle keeps its name, `aria-expanded` and `aria-controls`, and NavbarMenu's `aria-label` / `aria-labelledby` still name only its `<nav>` ("Main"). Focus and the Tab order in the menu don't change.
    - The toggle now always has an `id`. It is generated, and an `id` you pass to NavbarAction replaces it. In the server-rendered HTML, this change only adds that `id`.

  Nothing changes visually.

  The docs (EN/MS) document `calendarLabel`, `fromCalendarLabel` and `toCalendarLabel` and say that they don't follow `locale`, say that the pickers' triggers have no default name, and give the name of the Navbar's mobile menu panel and how NavbarAction's `aria-label` or `aria-labelledby` renames it.

- 737eea1: Input and TextArea now take an `invalid` prop, as DateField and TimeField do, so a field that fails validation can show it. `invalid` sets the native element's `aria-invalid`, and the error styling follows `aria-invalid="true"`, so an `aria-invalid` you pass yourself, as form libraries do, overrides `invalid`: `<Input aria-invalid />` looks invalid, and `<Input invalid aria-invalid={false} />` looks valid. An invalid field has an `otl-danger-300` border, which it keeps while focused, and shows its 3px `fr-danger` ring only then. On Input only the editable field turns red: the wrapper keeps its `otl-gray-200` border, and `InputAddon` and `InputIcon` keep their colours. `invalid` takes `boolean | null`; omitted, `false` or `null`, the field looks as before. A border class you added to show an error, such as `border-danger-600` on Input, which lands on the wrapper, doesn't re-theme and sets no `aria-invalid`, can go. `full.css` in `@amerfathullah/myds-style` carries the new classes.
- 73321a8: Label now takes a `disabled` prop, so a Label beside a disabled field can show it. Label used to dim only after a disabled sibling marked `peer`, or inside a disabled ancestor marked `group`, and no library field is either, so a Label beside a disabled Input, TextArea, DateField, TimeField, Select or Checkbox kept its `txt-black-700` colour. `disabled` sets the rendered element's `data-disabled`, and the disabled styling, `txt-black-disabled` text with a `not-allowed` cursor, follows `data-disabled="true"`, so it doesn't depend on where the field sits: before it, after it or in another wrapper. A `data-disabled` you pass yourself overrides `disabled`. Label disables nothing, so pass `disabled` to the Label and to the field: `<Label htmlFor="name" disabled>` beside `<Input id="name" disabled />`. `disabled` takes `boolean | null`; omitted, `false` or `null`, the Label looks as before. It never reaches the element as a native `disabled`, with or without `asChild`. Label still dims inside a `<fieldset disabled className="group">`. Once the Label takes `disabled`, a `text-txt-black-disabled` class or a `peer` class added as a workaround can go. `full.css` in `@amerfathullah/myds-style` carries the new classes.
- 1e26a74: The Navbar's mobile menu, below `xl:` (1280px), now manages focus as the library's Dialog does, and its toggle says whether the menu is open. Keyboard and screen-reader users could start partway down the menu, never reach the toggle while the menu was open, and lose their place when it closed.

  - **The toggle is named "Menu", open or closed.** NavbarAction's toggle was named "Open navigation menu" while the menu was closed and "Close navigation menu" while it was open, and that name was its only sign of the menu's state. It now has `aria-expanded`, `"false"` or `"true"`, and, while the menu is open, `aria-controls` naming the menu. An `aria-label` on NavbarAction still renames it, for example `aria-label="Navigasi"`, and screen readers now still hear whether the menu is open.
  - **Opening the menu focuses its first item.** Enter, Space, a click or a tap on the toggle focuses the menu's first item, whatever kind of control it is. Before, focus skipped the menu's links and landed on its first other control, such as a NavbarMenuDropdown's trigger. In a menu of links only, it landed on the menu's panel, which has no width, so no focus showed.
  - **Tab and Shift+Tab cycle through the menu's items and the toggle.** Before, they looped through the items and never reached the toggle. An open dropdown's links are in the cycle: with a dropdown open last in the menu, Tab skipped its last link. The header's other controls and the page stay out of the cycle while the menu is open, as before.
  - **Closing the menu leaves focus on the toggle.** Escape, a press on the overlay and the toggle each close the menu and leave focus on the toggle. Before, focus fell to `<body>`, so the next Tab started again at the top of the page. With a dropdown open, the first Escape still closes only the dropdown. A press on a control elsewhere on the page still closes the menu and leaves focus on that control.
  - **A press in the menu's padding leaves focus where it was.** Before, it moved focus to the menu's panel.

  **If you upgrade:** update tests that select the toggle by its old names, such as `getByRole("button", { name: "Open navigation menu" })`. Select it by the name "Menu", and read whether the menu is open from `aria-expanded`.

  NavbarAction's props don't change. Its `onClick` is still called, with no arguments, on every press of the toggle, and not when the menu closes in another way. The server-rendered HTML changes only in the toggle's `aria-label` and its new `aria-expanded="false"`. From `xl:` up, nothing changes.

  The docs (EN/MS) give the toggle's new name, say that screen readers hear whether the menu is open even after an `aria-label` renames it, and describe the menu's keyboard use.

- a47cd61: You can now rename the Navbar menu's `<nav>` landmark in your site's language. Screen readers announced it as "Main", in English, and no prop changed it.

  - **New `aria-label` and `aria-labelledby` props** on `NavbarMenu`. They name its `<nav>`, for example `<NavbarMenu aria-label="Utama">`. Without them it is still named "Main", which is now NavbarMenu's own documented default. Before, NavbarMenu dropped both props. It passes only these two to its `<nav>`, and an `aria-label` on `Navbar` still goes to its `<header>`.

  Nothing changes visually: the same elements, classes and icons render.

  The docs (EN/MS) give the default names of the Navbar menu's `<nav>` ("Main"), the Navbar menu toggle ("Menu"), the mobile menu's panel (also "Menu", which it takes from the toggle), the Masthead trigger ("Toggle masthead", only when it has no children; otherwise its text names it) and the Breadcrumb's `<nav>` ("breadcrumb"), and show how to rename each one with an `aria-label`.

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

- dead670: `RadioHintText` now describes its radio instead of being part of its name. It renders a `<div>`, and the `RadioButton` in the same `RadioItem` points `aria-describedby` at it by itself, so you pass nothing to wire it. Before, the hint was a `<label>`, and every documented example gave it the same `htmlFor` as the item's `RadioLabel`, which made it a second label of the radio: screen readers announced an option as "Email We will send notifications to your registered email address." with no description, and the longer the hints, the slower the options were to tell apart.

  - **Name and description.** A radio is now named by its `RadioLabel` alone, and described by the text of the `RadioHintText`s in its `RadioItem`, in document order, which screen readers read after the name.
  - **`htmlFor` and `form` are deprecated.** They still compile, but do nothing and never reach the DOM. Leave them out; they're removed at the next major.
  - **Clicking the hint no longer selects the radio.** Clicking the `RadioLabel` still does.
  - **Your ids.** An `aria-describedby` you pass `RadioButton` follows the hints' ids, each id once, and `aria-describedby={undefined}` doesn't drop them. A radio with no hint gets no `aria-describedby`. An `id` you pass `RadioHintText` is rendered and referenced, or it generates one. Code that wired the hint by hand, with an `id` on the hint and the same id in the button's `aria-describedby`, still reads the hint once.
  - **Disabled options.** A hint in a disabled `RadioItem`, or in a disabled `Radio`, is marked `aria-disabled="true"`, as part of the inactive option, so accessibility checkers such as axe exempt its dimmed colour from contrast, as they did when it was a label of the disabled radio. An `aria-disabled` you pass the hint wins.
  - **Server rendering.** Server-rendered HTML doesn't carry the description; it arrives when the page hydrates, as the radios themselves work only after hydration.

  The generated ids come from React's `useId()`, so don't rely on their format; it differs between React 18 and 19. The hint keeps its classes at every size and when disabled.

  **If you upgrade:**

  - Retarget CSS or tests that select the hint as a `label`, or that expect its text in the radio's name.
  - The hint is now a block. Inside the documented `grid` wrapper it looks the same; where it sat inline beside its label, it now starts on its own line.
  - A ref typed `HTMLLabelElement` still compiles, but now receives the `<div>`.
  - Mixing a `RadioButton` from an older 2.x copy of the library with a newer `RadioHintText` loses the description.

  The docs (EN/MS) and the Radio story no longer pass `htmlFor` to `RadioHintText`. The previews on each develop page, and the stories on the Radio autodocs page, now generate their ids, so none repeats an id: before, every label on a page pointed at the first group's radio, and the radios in the other groups had no name. The Size sample's three groups get ids of their own, such as `email-small`. The Props sections describe `RadioItem` under `RadioItem`, and say `RadioHintText` takes a `div`'s props, describes its radio, doesn't select it when clicked and ignores the deprecated `htmlFor`. The story's usage comment names `RadioHintText`, not `RadioHelpText`, which doesn't exist.

- 65d5194: SearchBar's keys act on the results only while a list of results is displayed, and only when pressed in the input (#398). Before, cmdk handled ArrowDown, ArrowUp, Home, End, Enter and Ctrl+N/J/P/K for every key pressed anywhere in the bar, whether or not any results were shown. A closed `SearchBarResults` hid its results, but the arrow keys still moved through them and Enter chose one. cmdk also cancelled Enter every time, so a SearchBar inside a `<form>` never submitted it, and Enter on the clear and search buttons didn't press them.

  - **While no list is displayed,** the input works as a plain text field. That's with no `SearchBarResultsList`, or with one in a closed `SearchBarResults`: the same state in which the input reports `aria-expanded="false"`. The arrow keys, Home, End, Enter and Ctrl+N/J/P/K leave cmdk's selection where it was, Enter chooses no result and submits a surrounding form, and Home and End move the caret.
  - **On the clear and search buttons,** and anywhere else in the bar outside the input, cmdk's keys reach the button. Enter presses it, and never chooses a result.
  - **While a list is displayed,** the keys pressed in the input work as before: ArrowDown, ArrowUp, Alt+ArrowDown, Alt+ArrowUp and Ctrl+N/J/P/K move the highlight, and Enter chooses the highlighted result. The entry for #205 stops them moving it onto the hidden `--` option, and the entry for #399 makes Home and End edit the text.
  - **`aria-activedescendant` names the highlighted result, or nothing.** On the input and on the listbox, it names the result that's highlighted in a displayed list, and nothing while no result is highlighted or no list is displayed. Before, cmdk worked it out before the results re-rendered, and never again when the list mounted again, so it could name a result that was no longer highlighted, the hidden `--` option, or an option that no longer existed. Server-rendered HTML has none.
  - **Your `onKeyDown` on SearchBar** still runs first, once per key, with SearchBar's root as its `currentTarget`, and its `preventDefault` stops cmdk.
  - **SearchBarResultsList's hidden `--` option** now carries `data-nothing-highlighted`. It's how nothing is highlighted until the person moves into the results.
  - **cmdk is pinned to exactly `1.1.1`.** SearchBar now relies on how cmdk 1.1.1 handles keys and selection, which cmdk doesn't document (ADR-0015). A cmdk release reaches SearchBar only once this library moves the pin.

  **If you upgrade:**

  - **A key SearchBar keeps from cmdk** reads as cancelled to React `onKeyDown` handlers above SearchBar, as it did when cmdk cancelled it, but its `isDefaultPrevented()` is `false`. Listeners added with `addEventListener`, on `document` or `window` for example, now see it uncancelled, since the browser acts on it.
  - **A SearchBar inside a `<form>`** now submits it on Enter while no list is displayed. If you called `form.requestSubmit()` from an `onKeyDown` that cancelled Enter, you can drop it.
  - **An older copy's `SearchBarResultsList`** inside this copy's SearchBar doesn't count as displayed, so cmdk's keys don't reach its results. Render a SearchBar's parts from one copy.
  - **A cmdk of your own** that isn't 1.1.1 is a second copy. Raw cmdk parts and `useCommandState` from your copy don't see SearchBar's state.

- e0f307d: SearchBarInput's `aria-expanded` and `aria-controls` now follow the results parts mounted in its SearchBar, so the input says it's expanded only while a list of results is displayed, and its `aria-controls` never names a missing id (#204, #369). Before, cmdk set `aria-expanded="true"` on the input in every state, over an `aria-expanded` you passed. Its `aria-controls` named the results panel, `SearchBarResults`, whether or not one was mounted, and never the listbox. A SearchBar with no SearchBarResults, as in the docs' Size, Clear Button and Hint examples, pointed its input at an id that doesn't exist, which axe reports as `aria-valid-attr-value`. And since `aria-controls` never named the listbox, axe didn't treat it as the input's popup, so the docs' scrolling list failed `scrollable-region-focusable`.

  - **`aria-controls` names the listbox while a `SearchBarResultsList` is mounted,** even in a closed panel, else the `SearchBarResults` panel, else nothing. ARIA requires a combobox's `aria-controls` to name its popup, and the listbox holds the options the input's `aria-activedescendant` names.
  - **`aria-expanded` is `"true"` only while a list is displayed.** A list is displayed unless the `SearchBarResults` around it is closed, so a `SearchBarResultsList` with no `SearchBarResults` counts as displayed. With no `aria-controls` or `aria-expanded` of your own, the input:
    - with nothing mounted, is collapsed and has no `aria-controls`;
    - with a panel and no list, open or closed, is collapsed and names the panel, so an open panel showing only "No results found" leaves it collapsed;
    - with a list in a closed panel, is collapsed and names the listbox;
    - with a list in an open panel, or a list with no panel, is expanded and names the listbox.
  - **An `id` you pass `SearchBarResults`** still renders on the panel. The input names it while no list is mounted, the listbox once one mounts, and your `id` again after the list unmounts.
  - **Your values win.** An `aria-controls` or `aria-expanded` you pass `SearchBarInput` reaches the `<input>` unchanged in every state; cmdk used to replace your `aria-expanded` with `"true"`. Pass an `aria-controls` with an `aria-expanded`, since an expanded combobox must name its popup.
  - **Server rendering.** Server-rendered HTML has the input collapsed, with no generated `aria-controls`, until the page hydrates; an `aria-controls` or `aria-expanded` you pass still renders. Hydration matches it without a warning, and the input then takes the values above before the browser paints.
  - **Re-renders.** The input follows each panel or list mounting, unmounting, opening and closing before the browser paints, at the cost of at most one extra React commit. Typing that doesn't mount or unmount the list costs none.

  Nothing changes visually: the same elements and classes render. The props and ref types are the same, and typing, ArrowDown, ArrowUp and Enter calling a result's `onSelect` work as before while a list is displayed. The keys change while no list is displayed in the entry for #398, Home and End in the entry for #399, and the keys that reached the hidden `--` option in the entry for #205.

  **If you upgrade:**

  - **Tests, CSS or scripts that expect `aria-expanded="true"` on the input** now see `"false"` while no list is displayed: with no panel or list, with a closed panel, with an open panel that has no list, and in server-rendered HTML.
  - **Tests or scripts that find the panel through the input's `aria-controls`** now find cmdk's listbox while a `SearchBarResultsList` is mounted, and nothing while neither a panel nor a list is. Pass your own `id` to `SearchBarResults` and select the panel by it.
  - **Several copies of the library.** A SearchBar doesn't count the `SearchBarResults` or `SearchBarResultsList` of an older copy of the library, such as a second bundled copy in module federation, so with only those, its input reports collapsed. Render a SearchBar's parts from one copy.

  The docs (EN/MS) say that the input points `aria-controls` at `SearchBarResults`' `id` only while no `SearchBarResultsList` is mounted.

- f60f853: In SearchBarInput, Home and End now edit the text in every state, as in a plain text field, and so do Meta+ArrowUp and Meta+ArrowDown (#399). Before, cmdk cancelled them and moved to the first or last result instead, even with no results shown, so the caret never moved, and Shift+Home and Shift+End selected nothing. While results were shown, Home could move to the hidden `--` option, so the highlight disappeared (#205).

  - **Which keys.** Home and End, with any modifiers or none, and Meta+ArrowUp and Meta+ArrowDown, with any other modifiers or none. They move the caret, or with Shift select to the start or end of the query, as the browser does in an `<input type="text">`.
  - **In every state:** with a list displayed, a result highlighted or not, a list in a closed `SearchBarResults`, an open panel with no list, and no panel at all.
  - **The highlight stays where it is.** These keys don't change which result is highlighted, or the input's and the listbox's `aria-activedescendant`, so Enter afterwards still chooses the highlighted result. That's what ArrowLeft and ArrowRight already did.
  - **Reaching the first and last result.** ArrowDown from rest highlights the first result. With `loop`, ArrowUp from rest highlights the last. cmdk's Ctrl+Meta+N/J/P/K, with `vimBindings`, still jump.
  - **Your `onKeyDown` on SearchBar** runs first, once per key, with SearchBar's root as its `currentTarget`, and its `preventDefault` stops the caret moving. SearchBar keeps these keys from cmdk the way it keeps the others (#398): React `onKeyDown` handlers above SearchBar read them as cancelled, as before, and listeners added with `addEventListener` see them uncancelled.

  **If you upgrade:** tests or scripts that press Home or End in a SearchBar to reach the first or last result now move the caret instead. Press ArrowDown from rest for the first result.

- f73a96d: SearchBar now has a hover state, as the design guideline asks. Pointing at the bar's input container turns its border from `otl-gray-200` to `otl-gray-300`, in every size and in both themes, so pointer users get feedback before they click. It's a semantic token, so it re-themes in the dark theme. Focus still wins: a bar whose input has focus keeps its `otl-primary-300` border and ring while hovered. Nothing else changes on hover, and SearchBar's props are the same. A `hover:` border class you added to the bar yourself can go. `full.css` in `@amerfathullah/myds-style` carries the new class.
- 5fbf505: SearchBarInput is now named by its own `aria-labelledby`, then its own `aria-label`, then SearchBar's `label`. Before, SearchBar's `label` beat an `aria-label` on SearchBarInput, and cmdk replaced an `aria-labelledby` on SearchBarInput with its own. An `aria-label` named the input in Chromium, but not under dom-accessibility-api, which Testing Library uses.

  - **The first name given wins.** That's SearchBarInput's `aria-labelledby`, then its `aria-label`, then SearchBar's `label`, which cmdk renders in a visually hidden `<label>`. An `undefined`, empty or blank value counts as not passed, so a wrapper that forwards `aria-label={undefined}` leaves SearchBar's `label` naming the input.
  - **There is no default name.** ADR-0008's Scope gives a form control the author names no default. With none of the three, the input has no accessible name, and its placeholder doesn't name it either, so name every search input, for example `aria-label="Cari nama"`.
  - **A visible Label takes an `id`, not `htmlFor`.** cmdk owns the input's `id` and finds the input by it, so an `id` you pass SearchBarInput doesn't reach the `<input>`, and a Label's `htmlFor` names nothing. Give the Label an `id` and pass it to SearchBarInput's `aria-labelledby`, as for the date pickers: `<Label id="search-by-name">Search by name</Label>` with `<SearchBarInput aria-labelledby="search-by-name" />`. Clicking the Label doesn't focus the input.
  - **SearchBarInput takes no `asChild` (#206).** It always renders its own `<input>` through cmdk's `asChild`, so `asChild` is no longer in its props type. An untyped `asChild={false}` used to crash the render, and is now ignored.
  - **Nothing else changes here.** Typing, ArrowDown, ArrowUp, Enter calling a result's `onSelect`, `aria-describedby` and refs work as before, and server-rendered HTML carries the name before the page hydrates. Nothing changes visually. The input's `aria-controls` and `aria-expanded` change in the entry for #204 and #369, and the keys while no list is displayed in the entry for #398.

  **If you upgrade:**

  - **Passing both SearchBar's `label` and SearchBarInput's `aria-label`** now names the input by the `aria-label`, not the `label`.
  - **An `aria-labelledby` on SearchBarInput** now reaches the input, instead of being replaced by cmdk's.
  - **SearchBarInput's `aria-label` now names the input under Testing Library too,** so tests can find it with, for example, `getByRole("combobox", { name: "Cari nama" })`.
  - **`asChild` is no longer in SearchBarInput's type.** Remove it where you pass it.

  The docs (EN/MS), Storybook and the docs site's icon search now name every search input. The docs add an example with a visible Label, and document SearchBar's `label`, for example `label="Cari nama"`.

- a5002a3: SkipLink is now fixed to the window, appears at once, and isn't printed, as the design guideline's Skip link page shows it (#220). It was positioned against the page and faded in over 500ms. On a scrolled page, Tab scrolled the page back to the top to show it. When a CookieBanner closed on a scrolled page, it moved focus to the skip link without scrolling, so the link was drawn above the window, and nothing on screen showed where focus was.

  - **Fixed to the window.** When it has focus, the link appears 16px from the window's left edge and 44px from its top, above the sticky Navbar, however far the page is scrolled. Tab no longer scrolls the page to show it, and after a CookieBanner closes, the link shows inside the window.
  - **No fade.** It shows in the first frame it has focus and hides in the first frame after it loses focus, with or without reduced motion. Its `transition-all duration-500 ease-in-out` is replaced by `transition-colors`, so only its colours transition: hovering it still fades its background.
  - **Not printed.** It's hidden when the page prints (`print:hidden`), as the Masthead, Navbar and Footer are.
  - **Unchanged.** It still shows on any focus, from Tab or from script, which CookieBanner's close relies on. Its props, types and exports don't change.

  **If you upgrade:**

  - A wrapper with `position: relative` no longer contains the link, which now appears at the top left of the window. To keep it inside a wrapper, such as a preview box, give the wrapper `contain: layout` (`contain-layout`) or a transform.
  - Tests or CSS that read the link's position or opacity see it fixed, and at full opacity in the first frame it has focus.

  `full.css` in `@amerfathullah/myds-style` already has the classes SkipLink now uses, so it doesn't change.

  In `DESIGN.md`, the SkipLink entry says the link is fixed to the window, what its 16px and 44px are measured from, that it appears at once, and that it hides when printed. Motion no longer lists it under `ease-in-out`. The preview pages' skip link is fixed and appears at once, and the page frame specimen's stays inside its card.

  The design guideline's Skip link page (EN/MS) now describes what the page frame and SkipLink do:

  - **The example** is HTML, fenced as `html`. The cookie banner, the Masthead and the Navbar are comments, so the main content no longer parses as inside a `<nav>`. The target is `<main id="main-content" tabindex="-1">`, the `<input>` has no `tabindex`, and the two `myds-` classes, which exist nowhere else, are gone. A sentence after it says it shows placement only, and links to the develop docs' Skiplink page. On the Malay page, the link text and the comments are Malay.
  - **Note 2** tells authors to give the target `tabindex="-1"`, so the skip link can move focus to it without adding a Tab stop, and not to add `tabindex="0"` to content that isn't interactive. It used to tell them to add `tabindex="0"` anywhere.
  - **How it works** says the link is hidden until it has focus, what the first TAB does while a cookie banner is shown, and that closing the banner moves focus to the link. ENTER moves focus to the main content section, and the next TAB reaches the first focusable element in it. The page used to say ENTER focused that element.
  - **The TAB section** names the Masthead's trigger, then the Navbar's logo, as the stops after the skip link, where it named the nav buttons. A note before the demos says the images and videos are design mockups, and how a MYDS page differs from them.
  - **Wording.** Both pages write TAB, ENTER, "Tab stop" and "Tab order" the same way, call the skip link a link, not a button, and say "`<body>` tag". The Malay page translates its "Where to use?" heading, and adds "sejurus", "serta-merta" and the shadow's name, Shadow/context-menu. The English page's grammar is fixed.

  On the develop docs' Skiplink page (EN/MS), the Code and Anatomy snippets' `<main id="main-content">` has `tabIndex={-1}`, as the Preview's does. The Preview's box keeps the link inside it with `contain-layout`, so Tab still shows it there.

- 3b1c9d5: `SummaryListHeader` now renders an `<h2>` by default instead of an `<h1>`, so a summary list no longer adds a second `<h1>` to a page that has its own, and `asChild` lets its title take the level the page's outline needs. Before, a page with its own `<h1>` and two summary lists had three.

  - **`asChild` chooses the heading.** Pass `asChild` and your own heading to give the title the level your page needs, e.g. `<SummaryListHeader asChild><h3>Applicant Details</h3></SummaryListHeader>` for a summary list in an `<h2>` section. Your heading gets the header's classes. To restyle the title, pass `className` to `SummaryListHeader`, which merges your classes with its own; with `asChild`, the classes on your heading are added after the header's without that merge.
  - **A forwarded ref.** A ref on `SummaryListHeader` is the heading it renders: the `<h2>`, or your heading with `asChild`. On React 18 it used to be dropped, with React's "Function components cannot be given refs" warning.
  - **Nothing else changes.** The same classes render, so the title looks as before unless your CSS styles headings by element. Its props are now typed as an `<h2>`'s, with `asChild`; code written against the old `<div>` props, refs and event handlers included, still compiles. The other SummaryList parts are unchanged.

  **To migrate:**

  - Update tests or CSS that select the header as `h1`, or with `getByRole('heading', { level: 1 })`.
  - Check pages whose CSS styles `h2` differently from `h1`. Inside a Tailwind Typography `prose` container, for example, the title now takes prose's `h2` margins, 40px above it at its size. Add `not-prose` to the header (`<SummaryListHeader className="not-prose">`) to keep its spacing.
  - To keep an `<h1>`, write `<SummaryListHeader asChild><h1>…</h1></SummaryListHeader>`.

  The docs (EN/MS) say the header is an `<h2>` by default, show `asChild` with an `<h3>`, and list `asChild` in its props. In Storybook, a new story renders it as an `<h3>` under an `<h2>`.

- cda3853: `SummaryListTerm` and `SummaryListAction` now lay out as table cells, so `colSpan` and `rowSpan` work on them, and a row without a detail lays out as a table. Both were `display: flex`, so the browser wrapped each in an anonymous cell that ignored their spans:

  - **An action with `colSpan={2}`** filled only its own column, and left the next one empty. It now spans both.
  - **A term with `rowSpan={2}`** spanned one row. The next row's detail moved into the term column, which grew to most of the list's width. The term now spans both rows, and the detail stays in its column.
  - **A term with `colSpan={2}`** spanned one column, and its row's action rendered under it. The term now spans both columns, with the action beside it.
  - **A row with a term and an action but no detail** rendered the action under the term. The action now takes the next column, beside the term. That's the detail's column, so give the action `colSpan={2}` to line its buttons up with other rows' actions.
  - **A row with two actions, or two terms,** stacked them in one column. Each now takes a column of its own. To stack buttons as before, put them in one action, in your own `<div className="flex flex-col items-end gap-3">`. To stack terms, put them in one term, in your own `<div className="flex flex-col items-start gap-6">`.

  Each part now lays its children out in a flex row inside its cell, as the cell itself used to, so lists look as before, in both themes and in right-to-left pages. That includes terms holding icons or several elements, and terms that wrap. The term is still a `<th scope="row">`, and the accessibility tree doesn't change, except where an `empty:hidden` class no longer hides a term or an action, as below. No props or types change.

  **If you style the children through `SummaryListTerm` or `SummaryListAction`:** `className` and the other props still go on the `<th>` or `<td>`, but the children now sit in a `<div>` inside it. So these no longer reach them:

  - flex classes such as `gap-2`, `items-center` or `justify-start`;
  - classes and page styles that select the cell's direct children, such as `space-x-2`, `*:mr-2`, `[&>svg]:size-5` or `td > button`.

  Put them on your own wrapper, e.g. `<SummaryListAction><div className="flex gap-2">…</div></SummaryListAction>`. To move an action's buttons off the right edge, give your wrapper `flex-1` too, e.g. `<div className="flex flex-1 justify-start">`.

  The `<div>` changes a few other things:

  - Content you add with `before:` or `after:`, such as a required field's `after:content-['*']`, now sits outside the `<div>`, on a line of its own. Put it on your own element inside, e.g. `<SummaryListTerm><span className="flex after:content-['*']">Full name</span></SummaryListTerm>`.
  - A term always holds the `<div>`, so `:empty` and `empty:` classes no longer match an empty term. An action with no children, or only `null`, `undefined`, booleans or `""`, as in `{canEdit && <EditButton />}`, is still an empty cell. But an action whose children render nothing, such as an empty fragment or a component that returns `null`, now holds the `<div>`, so `:empty` and `empty:` no longer match it either: put the condition in the action, as above.
  - A class or page style that selects the `div`s in a list, such as `[&_div]:py-0.5` on `SummaryListBody`, now selects these too. Select your own elements by class instead.

  **Don't change the term's or the action's own `display`**, e.g. with `flex`, `block` or `line-clamp-2`. A cell that isn't `table-cell` loses its spans again, and the class lays out the cell around the `<div>`, not the children, so `line-clamp-2` no longer clamps a term. Put such classes on your own element inside. To hide an action on small screens, use `hidden sm:table-cell`. `hidden sm:flex` still looks as it did, but costs the action its spans. An action you already made a table cell, with `table-cell` or `hidden sm:table-cell`, now lays its buttons out like any other action: in a row, against its end edge, on the row's first line. Before, each button sat on a line of its own, against the start edge, in the row's middle.

  **If you set a width or a height on `SummaryListTerm` or `SummaryListAction`:** it now sizes a table cell, not a box inside one. The detail takes all the width the other columns' minimums leave, so a fixed width such as `w-64` or `style={{ width: 250 }}` no longer widens a column, and `w-0` no longer squeezes an action's buttons. Use a minimum width instead, e.g. `min-w-[250px]`, which works before and after this change. A percentage width such as `w-1/3`, which did nothing before, now sizes the term's column. A height such as `h-12` now sets its row's minimum height, and `min-h-*` and `max-h-*` do nothing: to size a box, put the height on your own element inside, less the cell's padding, e.g. `h-6` in a term or `<div className="flex h-9">` around an action's buttons for the old `h-12`. An empty term or action with `h-12` or `min-h-12` no longer pushes the rest of its row down.

  **Classes and page styles that act on a table cell now act on the term and the action as cells**, as they already did on the detail:

  - A background, a border or a click handler covers the cell's full height, and borders join the table's. They used to cover only a box the height of the content.
  - `align-top` and `align-middle` now place the cell's content in its row.
  - A rule such as `td { vertical-align: middle }` now reaches the action, and `th { vertical-align: middle }` the term, whenever it beats their own `align-baseline` class: with `!important`, outside a cascade layer, in a layer declared after Tailwind's, or in Tailwind's utilities layer with a stronger selector, as `[&_td]:align-middle` on `SummaryListBody` has, or with an equal one that Tailwind puts later, as `*:align-middle` on a row has. It moves the action's buttons, or the term's text, from the row's first line to its middle: leave them out of it, e.g. `:is(th, td):not(.align-baseline)`.
  - An empty term or action with tall vertical padding, e.g. `py-4` or a page rule `td { padding: 16px }`, no longer pushes its row's text down as far. An empty action, like any empty table cell, takes no part in its row's baseline, so its padding can only make the row taller. An empty term holds the `<div>`, so its top padding still counts toward the row's baseline, but its bottom padding no longer does.

  Text read with `innerText`, or copied from a selection of the list, changes in its whitespace only. It gains tabs between some cells, but a line break still separates the term, the detail and an action with children, so unlike a plain table's, a row doesn't read or copy as one tab-separated line. An empty action, like any empty cell, adds no line break of its own, so a `SummaryListAddition` after one can join the line before it. Each cell's own text doesn't change.

  On the docs site, the rule that centres table cells now leaves out cells with `align-baseline`, so the actions in its summary list examples stay on their row's first line, as before.

  `full.css` in `@amerfathullah/myds-style` gains `align-baseline`.

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

- fa92e36: TableTooltip's trigger now has a hit area of at least 24×24, and its ref and every prop but the tooltip root's reach the trigger button. The trigger was only its 16px question-mark icon, under WCAG 2.5.8's 24×24 minimum and the design guideline's minimum trigger size. Every prop but `aria-label` went to the tooltip root, which renders no element, and the ref was ignored.

  - **Hit area:** an `::after` reaches 4px past each side of the trigger, so hovering anywhere in a 24×24 box centred on the icon opens the tooltip, and the pointer shows the `help` cursor over all of it. Beside a DataTable's sort or widen button, whose row makes the trigger 18px high, the area is 24×26, and it meets that button without covering it. The icon, the trigger's own box, the focus ring around that box, the header row's height and the column widths don't move, and the tooltip opens where it did. A pinned DataTable column scrolled over the trigger still covers it. DataTable's `meta.tooltip` gets the same hit area.
  - **Props:** `open`, `defaultOpen`, `onOpenChange`, `delayDuration` and `disableHoverableContent` still go to the tooltip root. Every other prop now goes to the trigger button: `className` (after the library's classes), `id`, `style`, `type`, event handlers, and `data-*` and `aria-*` attributes. Before, `className`, `id`, `style`, `type` and event handlers were TypeScript errors, and `data-*` and `aria-*` attributes were dropped without a warning. For example, `type="button"` now stops a TableTooltip inside a form from submitting it.
  - **Ref:** a ref on TableTooltip is now the trigger `<button>`. It was a TypeScript error, and stayed `null`.
  - **Name:** the trigger is still named "Tooltip" when `aria-label` is left out or `undefined`, as DataTable passes it for a column with no `meta.tooltipLabel`.

  TableTooltip's props are now the trigger button's, without `children` and `asChild`, plus the root props above, the tooltip's content as `children`, and `aria-label`. Code that passed only the root props, `children` and `aria-label` still compiles and behaves as before.

  The docs (EN/MS) say which props reach the root and which reach the trigger, give the trigger's hit area, and show how to keep a plain Table header's name to its text with `aria-labelledby` and an id from `useId`, or with `aria-label`, since a TableTooltip's name otherwise joins its header's. The DataTable page now says to hover over or focus the question-mark icon, not the column header.

- ed151c9: ThemeProvider now applies `defaultTheme` and restores the saved theme on load. It used to save each choice to `localStorage` but never read it back, and never put `defaultTheme` on `<html>`, so a reload returned to light, and `defaultTheme="dark"` rendered light while ThemeSwitch showed Dark. When it mounts, it puts on `<html>` the theme saved under `storageKey` (default `theme`), or `defaultTheme` (default `light`) when nothing valid is saved. It removes the other theme names, leaves other classes alone and saves nothing. A new `themes` prop lists the names it restores (default `["light", "dark"]`; `defaultTheme` always counts), each a single class name. `setTheme` still applies and saves any name. It now keeps its identity while `storageKey`, `defaultTheme` and the names in `themes` stay the same, even when `themes` is a new array. With storage blocked, as in a sandboxed iframe, it used to throw after changing the class, leaving `<html>` and the provider's `theme` out of step; the theme now lasts for the page's lifetime. A theme name other than `light` and `dark`, such as `system` in the ThemeSwitch docs' old Custom Themes sample, is now restored on load only if it is listed in ThemeProvider's `themes`, as in `<ThemeProvider themes={["light", "dark", "system"]}>`; otherwise choosing it still applies it, but it isn't restored, and it logs a warning once per name. `@amerfathullah/myds-react/utils`, which a Server Component can import, now exports `getThemeScript()`. It returns a script for `<head>` that applies the same theme before the page renders, so a user who chose Dark sees no flash of light. Pass it ThemeProvider's `storageKey`, `defaultTheme` and `themes`, and regenerate a copied script whenever they change. Code you added to read the saved theme, put its class on `<html>` and pass it as `defaultTheme` can go; if it ran before the page rendered, use `getThemeScript` in its place. The ThemeSwitch toggle now shows the provider's theme in its server HTML. A toggle rendered without a ThemeProvider now stays on Light when clicked, where before it flipped its icon and label without changing the theme; to fix it, wrap the app in ThemeProvider.
- 0efbfe7: ThemeSwitch now shows and names a theme it doesn't list. Before, when ThemeProvider's theme wasn't one of a ThemeSwitch's `themes`, the toggle was an empty, unnamed button that screen readers announced as just "button", and the select's value was blank. That happens with `<ThemeProvider defaultTheme="system">` and a default ThemeSwitch, or when System is chosen in another switch.

  - **New `toggleLabel` prop,** defaulting to "Theme". It names the toggle while the provider's theme isn't one of its `themes`, and the toggle shows a monitor icon (`DesktopIcon`), styled like the theme icons. Set it in your site's language, for example `toggleLabel="Tema"`. It never reaches the DOM, and it never names the select, which keeps `selectLabel`.
  - **The select shows the monitor icon alone** while its value isn't one of its `themes`. It shows no text, which screen readers would read after its name as "Theme, Theme". None of its options is marked selected.
  - **A one-theme switch now switches to its theme.** From a theme it doesn't list, a click on the toggle goes to the first of its `themes`, as a switch with two or more already did. A switch with only one theme ignored every click and choice; now a click or a choice switches to that theme and calls `onChange` with it. Once it's on that theme, a click does nothing.

  Nothing changes for a theme the switch lists: the toggle is named by its `label` and shows its icon, and the select shows both.

  The docs (EN/MS) and Storybook's controls document `toggleLabel`.

- 3935cb9: `ToastIcon` and `ToastProgress` are now exported from `@amerfathullah/myds-react/toast`, so a toast you compose from `ToastRoot` can show the status icon and the countdown bar that `AutoToast` shows. Before, only AutoToast could render them, and the docs' samples that imported them didn't compile.

  - **`ToastIcon`** draws the toast's 20px status icon in the variant's colour: a tick for `success`, an "i" for `info`, an exclamation mark in a circle for `warning` and in a triangle for `error`. It draws nothing for `message`.
  - **`ToastProgress`** draws the 4px countdown bar along the toast's bottom edge, filled in the variant's colour. It shrinks to nothing over `ToastRoot`'s `duration` (default 5000ms) and pauses while the pointer is over the toast.
  - **Render both inside a `ToastRoot`**, which gives them their variant and the bar its duration. Outside one, ToastIcon renders nothing and ToastProgress draws the `message` bar over 5000ms.
  - **Both are hidden from assistive technology** (`aria-hidden="true"`), because the toast's title carries its meaning. Each takes a `<div>`'s props, apart from `children`, and its ref is that `<div>`.
  - **`className` and `style`.** On ToastIcon, a `className` goes on the `<div>` around the icon, once; the icon keeps its size and colour. On ToastProgress, a `className` adds to the classes that place and animate the bar, and a conflicting utility, such as `bottom-1`, replaces only the one it conflicts with. A `style` adds to the bar's animation duration, which it can also set.

  AutoToast's toasts render as before, for every variant.

- 0752301: Only error toasts now interrupt the screen reader. Toasts of every other Variant are announced politely, at the next pause, and `toast()` takes `type`. Before, neither ToastRoot nor AutoToast set `type`, and `toast()` couldn't, so unless you passed `type` to ToastRoot or AutoToast yourself, every toast got Radix's default, `"foreground"`, and was announced assertively. A `success` toast interrupted what the screen reader was reading just as an `error` did, and the second of two toasts could cut off the first.

  - **The default follows the Variant.** ToastRoot sets `type` to `"foreground"` for an `error` toast, so it is announced assertively. It sets `"background"`, which is announced politely, for `message`, `success`, `info` and `warning`, and for a toast whose `variant` is unset or `null`, which is a `message`. A `type` of `undefined` gets the Variant default, never Radix's `"foreground"`.
  - **`toast()` takes `type`.** `ToastEvent` gains an optional `type?: "foreground" | "background"`. Pass `type: "foreground"` for a toast of another Variant that must be heard at once, for example `toast({ variant: "warning", title: "Warning: Your session is about to end", type: "foreground" })`, and `type: "background"` for an error that can wait.
  - **A toast's own `type` wins.** A `type` in `toast()` wins over AutoToast's `type`, which wins over the Variant default. On a hand-composed ToastRoot, the `type` you pass wins over the Variant default.
  - **`type` isn't the design guideline's Type**, which is `variant`. It sets only how urgently screen readers announce a toast.
  - **Nothing else changes.** Nothing changes visually: the same elements, classes and sizes render. Each toast is still announced in a visually hidden `role="status"` span, with "Notification", or your `announceLabel`, before its text. The props and ref types, and ToastContext's value, are the same; only `ToastEvent` gains a field.

  **If you upgrade:**

  - `<AutoToast type="foreground" />` brings back the old behaviour for every toast. `type: "foreground"` in `toast()` brings it back for one toast, and `type="foreground"` on a hand-composed ToastRoot for that toast.
  - In a toaster you compose by hand, pass each event's `type` to its ToastRoot, as the docs' Advanced Usage toaster now does: `<ToastRoot variant={event.variant || "message"} type={event.type}>`. Without it, a toast ignores the `type` passed to `toast()` and gets its Variant's default.
  - Update tests that expect `aria-live="assertive"` on a toast that isn't an error.

  The docs (EN/MS) say this in a new Screen readers section on the Toast page, and document `type` in ToastRoot's and AutoToast's props and in `ToastEvent` on the useToast page. The docs' Advanced Usage toaster, and the Toast story's Usage block in Storybook, pass each event's `type` to its ToastRoot. The docs site's own toasts follow the Variant default.

### Patch Changes

- 095eb25: AccordionTrigger's disabled look now follows its own button's `:disabled`. It took `txt-black-disabled` text, a not-allowed cursor, no hover underline and a dimmed chevron only from Radix's `data-disabled`, which only `disabled` on Accordion or AccordionItem sets. So a trigger disabled another way looked enabled, with a pointer and a hover underline, though a click didn't open it and Tab skipped it. It now looks disabled whatever disables it:

  - a `<fieldset disabled>` around the Accordion: plain, `group`, a plain fieldset nested in a disabled one, or one disabled after mount, even with `disabled={false}` on Accordion and AccordionItem. The enabled look comes back when the fieldset is enabled again;
  - `disabled` on AccordionTrigger alone;
  - an open trigger, whose text kept `txt-black-900` beside a dimmed chevron, with the props as well. It's now `txt-black-disabled`, as the `accordion-trigger-disabled` token says.

  A trigger that `disabled={false}` or `disabled={undefined}` re-enables under a disabled AccordionItem or Accordion no longer looks disabled. It already opened on click and took a Tab stop; see #432. Neither does one with a hand-passed `data-disabled`. No `group` around the Accordion dims an enabled trigger's chevron any more: it dimmed inside the open item of a disabled outer Accordion, or under any element marked `group` with `data-disabled`. An icon of your own in a trigger keeps its colour, and a `text-*` or `[&>svg]:text-*` class on the trigger still applies while it's enabled and gives way to the dim while it's disabled. Every trigger's `:disabled` state, click, Tab stop and accessible state are unchanged, and no prop type changes. A `disabled` you passed to an Accordion inside a disabled fieldset only for its look can go.

  `full.css` in `@amerfathullah/myds-style` gains `disabled:hover:no-underline`, `disabled:data-[state=open]:text-txt-black-disabled` and `[:disabled>&]:text-txt-black-disabled`, and loses `data-[disabled]:text-txt-black-disabled`, `data-[disabled]:hover:no-underline` and `group-data-[disabled]:text-txt-black-disabled`. `data-[disabled]:cursor-not-allowed` stays, for Dropdown.

- 248a593: AlertDialog's `variant` is now optional and defaults to `default`, as its docs say. A missing, `null` or unknown `variant`, which plain JavaScript or a cast can pass, now renders as `default` instead of throwing a TypeError. The throw stopped the whole dialog from rendering, its trigger too, whether open, closed or server-rendered. TypeScript still rejects `null` and any name but `default`, `info`, `success`, `warning` and `danger`. Opening a `default` dialog no longer logs React's warning about an invalid `className` prop on `React.Fragment`. It still shows no status icon, and its layout is unchanged.
- 337ddbe: BreadcrumbLink and BreadcrumbPage now render a `title` you pass, whatever their children. Before, the crumb's children replaced it: `<BreadcrumbLink title="Go to the home page">Home</BreadcrumbLink>` rendered `title="Home"`. An element child, such as a `<span>`, an icon or `asChild` around a router link, rendered `title="[object Object]"`, which screen readers read as the link's description, and an icon-only crumb named only by its `title` was announced as "[object Object]". An icon plus text, or `Page {n}`, rendered its children converted to text, such as `title="Page ,2"`, and a crumb with no children dropped the `title`.

  - **Your `title` wins.** A `title` you pass renders as given, with plain text, an element, an icon, an icon plus text, `Page {n}` or no children at all.
  - **The default is unchanged.** With no `title`, or a `title` of `undefined` or `null`, plain-text children still become the `title`, so a truncated crumb shows its full text on hover. Any other children still give no `title`.
  - **`title=""` now turns the hover text off.** It renders an empty `title`. Before, a plain-text crumb rendered its text instead.
  - **`asChild`.** A `title` on BreadcrumbLink now reaches the child it renders as given. A `title` on the child itself still wins over it.

  The props types don't change. A workaround that put `title` on the child of an `asChild` BreadcrumbLink, rather than on BreadcrumbLink, can stay.

  The docs (EN/MS) say that only a plain-text crumb shows its full text on hover, that any other crumb should be given its full text in `title`, and that an icon-only crumb is named with `aria-label`, not `title`.

- 94e4e68: The calendar in `DatePicker` and `DateRangePicker` now picks the month or year you click in its month and year views, and its year view lists exactly `minYear` to `maxYear`.

  - **Month view on the 29th to the 31st.** A month cell now picks a date in its own month, with the selected day cut to that month's length. With 30 October 2026 selected, the cells read "Jan, Feb, Mar…", February picks 28 February 2026 and the day view opens on February. With 31 October, November picks 30 November. Before, the day carried over and a shorter month rolled into the next one. The cells read "Jan, Mar, Mar, Apr…", and February's cell picked 2 March 2026. With 31 October, February, April, June, September and November were missing. With nothing selected, the same happened whenever today was the 29th to the 31st. A `disabled` matcher checked the rolled-over date, so disabling every day of March disabled two cells, and disabling every day of February disabled none.
  - **The year view lists `minYear` to `maxYear`.** It counts down with `yearOrder="desc"`, in rows of three with the short row last. Before, it showed one year too many or one too few:
    - 1900 to 2100 by default, so 2100 could be picked.
    - 2020 to 2031 with `minYear={2020} maxYear={2030}`.
    - 2000 to 2002 with `minYear={2000} maxYear={2003}`.
    - No years when `minYear` equalled `maxYear`.
    - A `minYear` 3 or more above `maxYear` threw a `RangeError`. Now a `minYear` above `maxYear` shows no years.
  - **29 February in the year view.** With 29 February 2024 selected, picking 2025 now picks 28 February 2025, and the month view fills Feb. Before, it picked 1 March 2025 and filled Mar.
  - **Picking a year leaves your Dates alone.** It no longer changes the Date you passed as DatePicker's `value` or `defaultValue`, or as DateRangePicker's `from` or `to`, or a Date that `onValueChange` received from a month pick in the same calendar. Before, with `value` 15 October 2026, picking 2030 changed that Date to 15 October 2030, even when `onValueChange` ignored the change. A range whose `from` and `to` were the same Date moved both ends.

  The props and their types don't change.

  **If you upgrade:**

  - The year view no longer offers `maxYear + 1`, which is 2100 by default. If your users need that year, raise `maxYear`, for example `maxYear={2100}`.
  - Picking a year no longer changes the Date passed as `value`, `from` or `to`. Read the picked date from `onValueChange`, not from the Date you passed in.

- 73ae476: The package no longer ships Calendar and Popover as entries of their own (#236). The build wrote 12 files for them, `dist/components/calendar.*` and `dist/components/popover.*`: CommonJS and ESM scripts, declarations and sourcemaps. These files were never in the `exports` map, so `@amerfathullah/myds-react/calendar` and `/popover` could never be imported, and Node and current bundlers refuse the deep paths. Both stay internal to DatePicker and DateRangePicker, which carry their code as before.

  Every subpath is unchanged: it resolves to the same files, with the same exports, types and behaviour.

  **What changes:**

  - Resolvers that ignore `exports`, such as TypeScript's `moduleResolution: "node10"`, webpack 4 and Jest before 28, could load `dist/components/calendar` and `dist/components/popover` by their deep paths. They can't any more.
  - The tarball holds 16 fewer files: those 12, and 4 chunk files, because the three ESM chunks that only the pickers share are now one. That makes it about 21 kB smaller packed and 91 kB smaller unpacked. The saving is in what you download and install, not in your app's bundle, which keeps the same code in a different module order.

- f6d8bf8: Callout's status icon (the `<svg>` it picks by Variant) and the cross in a `dismissible` callout's close button are now hidden from assistive technology (`aria-hidden="true"`). Before, each was an image with no name: screen readers met an image that said nothing, and nothing told them the Variant. Nothing changes visually: the same elements, classes, icons and sizes render.

  - **The close button.** It's still named "Close", or by `closeLabel`. Its cross is hidden as Pill's remove cross is.
  - **Roles.** Hiding the icons changes no role: Callout is a note (`role="note"`), or the `role` you pass. CalloutTitle keeps `role="term"` and CalloutContent `role="definition"`.
  - **Nothing else changes.** Callout's props and ref types, and CalloutContext's value, are the same. An icon you import on its own, such as `InfoIcon` or `CrossIcon`, renders as before, with no `aria-hidden`.
  - **The title says the Variant.** Callout adds no text, prop or attribute for it. The icon and the colour don't reach screen readers, so the title must say it.

  **If you upgrade:**

  - Make each callout's title say its Variant, in your site's language. Its wording can say it, such as "Permohonan anda tidak dihantar", or it can start with the Variant's name, such as `<CalloutTitle>Ralat: Borang tidak dihantar</CalloutTitle>`. Where the design can't show that word, start the title with visually hidden text, `<span className="sr-only">Ralat: </span>`, instead of a visible name, never as well as one.
  - Update tests that look for an image inside a callout.

  The docs (EN/MS) say the title must say the Variant and show how. Every Callout title that was "Title" or "Tajuk" in the docs and stories now starts with its Variant's name, such as "Error: Form not sent", and so do the Dismissible previews' titles. The Storybook demo's title follows its `variant` control. The `variant` prop's descriptions in the docs and Storybook say it sets the colour and the icon, and that the title must say the Variant.

- 91f81f3: An `id` on the heading you pass `CookieBannerTitle` with `asChild` now names the banner (#213). The title registered its own id, or a generated one, while the heading rendered with yours, so the banner's `aria-labelledby` named an id that wasn't in the page. The banner then had no name, and Chromium no longer exposed it as a region. A heading with `id={undefined}` rendered with no id at all, and left the banner unnamed the same way.

  - **Your heading's `id` wins.** With `asChild`, a heading with its own `id` keeps it, and that id names the banner, even when you also pass `id` to `CookieBannerTitle`. A heading with no `id`, or `id={undefined}`, gets the title's `id`, else a generated one. If your heading's `id` changes, the banner follows it.
  - **Unchanged.** Without `asChild`, the `<h2>` still gets the title's `id`, else a generated one. Only one heading renders, with both the title's classes and yours, and both refs. An `aria-label` or `aria-labelledby` you pass `CookieBanner` still names it instead.

  Only a single element child is read. Nothing changes visually: the same elements and classes render.

  The docs (EN/MS) list `asChild` on `CookieBannerTitle`, and say that with it, your own heading's `id` names the banner.

- 697b46f: DataTable's header and body cells no longer render an `id`. Two DataTables on one page now repeat no id, and a table no longer takes an id such as `name` or `email` from the page around it.

  - **Which ids.** Each header cell rendered TanStack's header id, which is the column id for most headers, such as `name`, `_radio` or `_checkbox`. Each body cell rendered its cell id, `<row id>_<column id>`, such as `0_name`, `a__radio` or `0.0_email`. These were unique only within one table, so two tables with the same column ids repeated them, in every selection mode and with `nest`. A row id with a space, such as an `id_by` value of "Aminah binti Yusof", also gave an id that isn't valid HTML.
  - **They took an app's ids.** The first element with an id wins, so after a table with `name` and `email` columns, `<input id="email">` lost its `<label for="email">` and had no accessible name, and a section with `aria-labelledby="name"` was named "Name", by the table's header.
  - **Nothing read them.** Each header is still named by its own label, whose id comes from `useId()`, and radio selection keeps its `useId()` group name. `TableHead` and `TableCell` still render an `id` you pass them when you use Table directly. Nothing changes visually.
  - **Several React roots.** The ids DataTable still renders come from `useId()`. A page that server-renders and hydrates several separate React roots, such as islands, should give each root its own `identifierPrefix` (in `hydrateRoot` and the matching server render), or tables in different roots can still share ids.

  **If you upgrade:** selectors such as `#name`, `[id="0_name"]` and `[id="a__radio"]` no longer match. Select cells by position, role or text instead.

  The docs' naming example (EN/MS) no longer says each table on a page needs column ids of its own.

- 02b360f: DateRangePicker's `disabled={true}` now disables the whole picker, as DatePicker's does. It disabled every day in the calendars but left all four triggers enabled, so the From and To triggers looked enabled, took Tab focus, were announced as operable buttons, and each opened a calendar in which nothing could be picked: below `lg:`, a dialog with no close button. Now every trigger the picker renders takes native `disabled` and the `default-outline` Button's disabled look, Tab skips it, and a click, Enter or Space opens nothing. A disabled trigger keeps its text, its accessible name and its description. Its `From:` / `To:` prefix, always `txt-black-500` before, now takes `txt-black-disabled` whenever the trigger it sits in is `:disabled`, so it dims inside a `<fieldset disabled>` as well, where only the date used to dim. An enabled picker in the first `<legend>` of a `<fieldset disabled className="group">` keeps a `txt-black-500` prefix. Any other `disabled`, such as `{ before: date }`, a function or `false`, still leaves the triggers enabled, and the calendars disable the same days as before. So does an array of Matchers, unless it holds `true`: the entry for #231 covers those, which now disable the whole picker on both pickers. A `<fieldset disabled>` you wrapped around a DateRangePicker only to disable its triggers can go. `disabled` keeps its type, `Matcher | Matcher[]`, and its JSDoc on both pickers now says which values disable the whole picker and which only the days they match. `full.css` in `@amerfathullah/myds-style` carries the new class.
- f60b247: DialogBody and AlertDialogContent now call your `onInteractOutside` with Radix's event before their own handling of a press outside, instead of being replaced by it. Before, passing any `onInteractOutside`, even one that did nothing, or `onInteractOutside={undefined}`, silently switched off `dismissible={false}` and `onDismiss`.

  - **`dismissible={false}` still keeps the dialog open** on a press outside, whatever your handler does.
  - **`onDismiss` still runs when a press outside closes the dialog,** once, after your handler.
  - **`onDismiss` no longer runs when the dialog stays open:** on a right-click outside, or when your `onInteractOutside` or `onPointerDownOutside` called `preventDefault()`. Calling `preventDefault()` in your `onInteractOutside` still keeps a dismissible dialog open.

  DialogClose and AlertDialogClose now call your `onClick`, which they used to drop, before `onDismiss`. Calling `preventDefault()` in it, or in the `onClick` of the element inside it, keeps the dialog open without calling `onDismiss`. Before, `preventDefault()` in that element's `onClick` kept the dialog open but still called `onDismiss`.

  Escape, the built-in close cross, `onPointerDownOutside`, `onEscapeKeyDown` and every other prop work as before, and the props types don't change.

- 48c1ad8: Each subpath in the package's `exports` map no longer has a `type` key (#234). No tool read it by default: TypeScript's condition is `types`, not `type`, and Node, bundlers and TypeScript skip conditions they don't recognise. Each entry now has only `import` and `require`, pointing at the same files as before.

  Nothing changes for you. Every subpath resolves to the same JavaScript, and TypeScript still finds each condition's declarations beside the file that condition resolves to: the `.d.mts` for `import` and the `.d.ts` for `require`. The one exception is a build that opts into a custom condition named `type`, such as TypeScript's `customConditions: ["type"]`. Its ESM imports now get the `.d.mts` declarations, which match the ESM they load, where before they got the CommonJS `.d.ts`.

- 7dfcd6d: DateField and TimeField now look disabled whenever their `<input>` is, including inside a `<fieldset disabled>`. Their frame and their calendar or clock icon took the disabled look only from the `disabled` prop, so in a disabled fieldset, which disables the input without the prop, the field showed a washed patch behind its value inside a white frame, beside an icon in its enabled colour. The frame and the icon now follow the input's `:disabled`, as the error styling follows its `aria-invalid`: a disabled field has a `bg-washed` frame with a `not-allowed` cursor and a `txt-black-500` icon, whether the prop or a disabled fieldset, with or without `className="group"`, disables it. A `disabled={false}` field inside a disabled fieldset, which the browser disables anyway, now looks disabled too. An enabled field looks as before, also inside an element you mark `group` or `group/field` that holds other disabled inputs. On a disabled field, a background you pass in `className` now gives way to the washed background, as on Input; before, some, such as `bg-transparent`, won. A `disabled` you added to each field in a disabled fieldset only for its look can go. `disabled` keeps its type, `boolean | undefined`. `full.css` in `@amerfathullah/myds-style` carries the new classes.
- 75f291e: In Chromium, DateField and TimeField now fill the focused segment of their native input (day, month or year; hour, minute, second or AM/PM) with primitive `primary-600` and `white` text, the same in both themes. Their classes matched the segment with `:focus`, which Chromium never matches on a `::-webkit-datetime-edit-*-field` pseudo-element, so the browser's own highlight showed instead; they now match it with `:focus-within`. The fill they asked for, `primary-500` with `txt-white`, is replaced: it fell short of the 4.5:1 contrast WCAG AA asks of text, and `txt-white` turns dark in the dark theme. Firefox still shows its own highlight, because it gives page CSS no way to style a segment. `full.css` in `@amerfathullah/myds-style` carries the new classes.
- efe0620: A focused filled control now draws its focus ring 2px wide, outside a 2px band in a new token, `fr-gap`, so the ring no longer merges into the fill. The opaque `fr-primary` ring sat close to a fill's colour: 1.30:1 against a `primary-fill` button's `primary-600` in light and 2.59:1 in dark, and 1.00:1 against its hover fill, `primary-700`, in light, so a focused, hovered button just looked 3px bigger.

  - **`fr-gap`** is `white` (`#FFFFFF`) in light and `black` (`#000000`) in dark. It contrasts at least 3:1 with every fill it touches, at rest and hovered: 4.83:1 or more in light and 3.13:1 or more in dark. The ring is 6.70:1 against it in light and 10.51:1 in dark.
  - **Which controls.** `primary-fill` and `danger-fill` Buttons, and everything that renders one, such as the large SearchBar's search button; checked and indeterminate Checkboxes, DataTable's included; checked Radios and DataTable's checked radio; the checked Switch; and the Calendar's selected day, range start and end, and selected month and year, in DatePicker and DateRangePicker too. The band shows only while the control is focused and filled, and `danger-fill`'s ring stays `fr-primary`. Every other ring is unchanged: 3px, with no band.
  - **Size.** The band and ring reach 4px out, 1px more than the 3px ring, which still fits DataTable's selection cells, a Select's footer and the SearchBar's padding.
  - **Around the control.** In light the band is the page's white. In dark it is 1.19:1 against the page and 1.25:1 on a dialog, so it shows as a faint halo on surfaces other than the page.
  - **Forced colours** are unchanged. The band is a box-shadow, like the ring, so a focused control still shows a 2px outline instead.
  - **The Calendar's previous and next buttons** now render as `default-outline` Buttons, where they took that look from their class names over Button's default `primary-fill`. They look the same, and keep the 3px ring with no band.

  **If you set focus styles yourself:**

  - A ring width you pass to a filled Button, such as `focus:ring-3`, now sits outside the 2px band. Add `focus:ring-offset-0` to drop the band.
  - On a control of your own that fills, draw the ring the same way, behind its focus variant, and behind the state that fills it where a state does, such as `focus:ring-2 focus:ring-offset-2 focus:ring-offset-fr-gap`. Don't leave a `ring-offset-*` width bare, because `shadow-button` then draws the band at rest, and don't leave out `ring-offset-fr-gap`, because Tailwind colours an offset white, which in dark is a white band.

  `full.css` in `@amerfathullah/myds-style` carries the new classes, and the preset's `fr-gap` utilities, such as `ring-offset-fr-gap`, `bg-fr-gap` and `border-fr-gap`, are new.

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

- a0d594f: Under forced colours, as in Windows High Contrast, Button and the other controls below now show when they have focus. Forced colours drop box-shadows, which draw every MYDS focus ring, so a focused control shows a 2px outline instead. These controls drew that outline all the time, at rest too, so keyboard focus changed nothing a user could see, which fails WCAG's SC 2.4.7 (Focus Visible). Now they draw it only while they have focus, from the keyboard or the mouse.

  - **Controls.** Button, and everything that renders it or reuses its classes, such as Pagination, the calendar's buttons and the DatePicker and DateRangePicker triggers; Input; Checkbox; SelectTrigger; TabsTrigger; and the CookieBanner's close cross. A disabled Button drew the outline too, and now draws none.
  - **Items in an open list.** Every SelectItem and DropdownItem in an open list drew an outline, disabled ones included. Now only the focused item does. Forced colours remove its highlight fill, so the outline is what shows which item has focus.
  - **Panels.** PopoverContent, such as the DatePicker's panel, and the CookieBanner draw the outline only while they hold focus themselves. The DatePicker's panel no longer shows a double border while a control inside it has focus, and the CookieBanner no longer has a box around it whenever it shows.
  - **Stray boxes.** These never take focus but drew an outline all the time, and now draw none: Input's bordered wrapper and InputAddon's default `<div>`, the Masthead's inner grid and MastheadHeader, the Navbar's mobile menu, and DataTable's pinned-column edge, which drew two bars down every row, over the next column's first letter.

  Nothing changes in normal colours: no element gains or loses an outline or a ring. The one exception is a focusable element you render through `InputAddon asChild`, such as a `<button>`, which now shows the browser's outline on keyboard focus, where it showed none.

  `full.css` in `@amerfathullah/myds-style` no longer carries `before:outline-hidden`, which only DataTable's pinned-column edge used.

  **If you set focus styles yourself:**

  - An outline-width class you pass to these components, such as `outline-2`, is no longer hidden at rest, so it now draws an outline at rest. Put it behind the Tailwind focus variant you want, such as `focus-visible:outline-2`.
  - Your own bare `outline-hidden` brings the permanent outline back under forced colours. Put it behind the Tailwind variant your ring is on: `focus-visible:outline-hidden`, or `focus:outline-hidden`.

- 0e682dc: Icons no longer render the layer ids from their Figma sources, such as `Vector`, `Vector 146` or `Icon/cross`, so components stop repeating ids on a page. Nothing referred to these ids, but every copy of an icon carried them. So each of these repeated an id on its own: a checked Checkbox, AutoPagination, a Callout with a close button, an Accordion with two items, a Breadcrumb with two separators, an AlertDialog or a Toast with a status variant, and ThemeSwitch with `as="select"`. Two Selects on one page did too. An app's own id that matched a layer name, such as `<h2 id="Vector">`, resolved to an icon instead. That could leave a section named by `aria-labelledby` with no name, or send a `#Vector` link to the wrong place.

  - **Which icons.** 214 of the icons on `@amerfathullah/myds-react/icon` drop these ids. So does the deprecated `MalaysiaFlagIcon`, the same flag the Masthead shows. They all draw the same as before. An icon still renders the ids its clip paths, masks and gradients need, each copy with its own. The deprecated `JataNegaraIcon` is unchanged until the next major removes it.
  - **Snapshots.** Snapshot tests that include these icons will see the ids go.

  **If you upgrade:** a selector, stylesheet or test that matched one of these ids now matches nothing. That includes `[id="Icon/cross"]`, `#Vector`, and the legacy icons' group ids, such as `agency-icons/mini/dosm` or `agency-icons/miniidentity-jpn`. Hook it to something else, such as the button around the icon, or your own `className` or `data-` attribute on the icon, which an icon passes to its `<svg>`.

- 0f2e20c: Each copy of an icon with a clip path, mask or gradient now gets its own ids, so hiding one copy no longer breaks another. Before, every copy of such an icon carried the same ids, and the browser resolved each copy's `url(#…)` to the first copy. A later copy then rendered blank while an earlier one was under `visibility: hidden` (Tailwind's `invisible`), or drew wrong while an earlier one was under `display: none` (`hidden`, a closed `<details>`). This affected 46 icons on `@amerfathullah/myds-react/icon`, such as `FacebookIcon`, `SunIcon`, the agency marks, `MiniInternetMCMCIcon` and the four `…MediaIcon`s. The deprecated `MalaysiaFlagIcon`, which the Masthead also shows, no longer has any id that its copies share, and it draws the same as before. The deprecated `JataNegaraIcon` still shares its ids until the next major removes it.

  - The ids come from React's `useId()`, so don't rely on their format. They're the only ids these icons render now: the layer ids that nothing referred to, such as `Icon/cross`, are gone.
  - Snapshot tests that include these icons will see their ids change.
  - A page that server-renders and hydrates several separate React roots, such as islands, should give each root its own `identifierPrefix` (in `hydrateRoot` and the matching server render), or copies in different roots can still share ids.

- 032f281: Every icon on `@amerfathullah/myds-react/icon` now forwards its ref to its `<svg>`, so a ref on an icon works on React 18. That includes a ref a component attaches to an icon you give it as its child, such as `ButtonIcon`'s, `InputIcon`'s, `DropdownItemIcon`'s and `DialogIcon`'s, and a Radix trigger's with `asChild`: `<TooltipTrigger asChild><InfoIcon /></TooltipTrigger>` now anchors its tooltip to the icon, not off the top-left corner of the page. Before, React 18 dropped the ref: an object ref stayed `null` and a callback ref was never called. In development React warned "Function components cannot be given refs"; in production it said nothing. React 19 already passed the ref on, and still does. The deprecated `JataNegaraIcon` and `MalaysiaFlagIcon` forward theirs too.

  - **Importing one icon still bundles only that icon.** Each icon is now a `forwardRef` component, named after its export in React's developer tools. Your bundler still drops the icons you don't import, from the icon entry and from the component entries that use an icon. For that, the package's built files are no longer minified for whitespace, which would strip the `/* @__PURE__ */` marks your bundler reads. Its ES modules are about 1.3 MB to install, up from 1.0 MB. Your app's own build minifies them as before, so an app that imports every entry grows by about 4 kB gzipped, the cost of the icons' wrappers.
  - **Render icons as elements.** `<ChevronDownIcon />` and `createElement(ChevronDownIcon)` work as before. Calling an icon as a function, `ChevronDownIcon(props)`, still type-checks, but it now throws a `TypeError`.

  Nothing else changes. Each icon renders the same markup, and takes the same props. Its type is now `ForwardRefExoticComponent<SVGProps<SVGSVGElement>>`, and code that assigns it to `FunctionComponent<SVGProps<SVGSVGElement>>` still compiles. The deprecated national marks keep that old type.

- 3d924cc: An InputIcon inside a Fragment, including one in an array, or inside your own component now gets room on the side it draws on. Input pads the field 40px on that side, as it does for an InputIcon passed directly, so the placeholder and typed text no longer run under the icon. The room is already there in server-rendered HTML, before the page hydrates. InputIcon's rendered element now carries the side it draws on in a new `data-input-icon` attribute, `"left"` or `"right"`, and Input pads the field from that attribute on a later sibling of its `<input>`. `data-has-left-icon` and `data-has-right-icon` are unchanged: they still describe Input's direct children only. Input's and InputIcon's props are the same. `full.css` in `@amerfathullah/myds-style` carries the new classes.
- 8a69b5f: InputIcon's `position` is now optional and defaults to `left`, the side an InputIcon without it already drew on. `<InputIcon>` and `position={undefined}` now type-check. TypeScript still rejects any side but `left` and `right`.

  Input now pads the field for an InputIcon without `position`. The `<input>` gets `data-has-left-icon="true"` and its 40px left padding, as with `position="left"`, so the placeholder and typed text no longer run under the icon. Explicit `left` and `right`, and a left and a right icon together, render as before.

- a4c05a6: InputOTP's slots now take their invalid and disabled looks only from InputOTP's own `<input>`. Inside an element marked `group`, such as a `<div className="group">` or a `<fieldset className="group">`, and inside the library's `AccordionItem` and `Toast`, which are marked `group`, the slots took the look of any other control there. An invalid Input, DateField, TimeField or another InputOTP gave them the `otl-danger-300` border, and the active slot the `fr-danger` ring. A disabled Button, Checkbox or Input, or a `<select>` with a disabled placeholder `<option>`, gave them the `bg-washed` fill and `txt-black-500` text. A control among InputOTP's children, such as a disabled Resend button, did the same. All the while InputOTP's own input stayed valid and enabled, and assistive technology announced it so. Now the slots have the `otl-danger-300` border exactly when the input has `aria-invalid="true"`, from `invalid` or an `aria-invalid` you pass, and the disabled look exactly when the input is `:disabled`, from `disabled` or a `<fieldset disabled>`. The one exception is an InputOTP you place among another InputOTP's children, which still takes the outer one's look. InputOTP's own looks don't change. Its container's class is now `group/input-otp` instead of `group`, so a bare `group-*` class you put on InputOTP's children or on `InputOTPSlot` no longer keys off the container: pass `containerClassName="group"`, or use the `/input-otp` form, such as `group-hover/input-otp:`. `full.css` in `@amerfathullah/myds-style` carries the new classes.
- 6d0d3b0: DateField and TimeField now have an `otl-gray-200` border whether `invalid` is omitted, `null` or `false`. With `invalid` omitted, the border fell back to the preset's primitive `gray-200`, which doesn't re-theme, so in the dark theme the field had a light edge. An invalid field now keeps its `otl-danger-300` border while focused and shows its 3px `fr-danger` ring only then, as the design guideline asks; focus used to replace both with the `otl-primary-300` border and `fr-primary` ring. At rest it shows no ring. The error styling now follows the input's `aria-invalid="true"`, which `invalid` sets, so an `aria-invalid` you pass yourself, as form libraries do, overrides `invalid`: `<DateField aria-invalid />` looks invalid, and `<DateField invalid aria-invalid={false} />` looks valid. `invalid` keeps its type, `boolean | null`. An `invalid={false}` added as a workaround is no longer needed. `full.css` in `@amerfathullah/myds-style` carries the new classes.
- 4d9f843: MastheadTrigger is now named by the text it shows, such as "Kenal pasti begini". Before, screen readers announced every trigger as "Toggle masthead", in English, whatever it showed, and speech-input users couldn't activate it by saying its text (WCAG 2.5.3, Label in Name).

  - **Children name the trigger, at every width.** Below `sm:` the trigger still shows only its chevron. Its text is now visually hidden there (`max-sm:sr-only`) instead of `display: none`, so it names the trigger below `sm:` too.
  - **"Toggle masthead" is the default only with no children.** A trigger with no children, or with `null`, `false` or `""`, is still named "Toggle masthead". An `aria-label` still replaces the name, with or without children, for example `<MastheadTrigger aria-label="Kenal pasti begini" />`.
  - **Nothing else changes.** Opening the masthead still sets `aria-expanded`, and the name stays the same. Nothing changes visually: the trigger keeps its size at every width, and its text stays on one line beside a long title.

  **If you upgrade:**

  - **Tests that find the trigger by "Toggle masthead"** must find it by its text, for example `getByRole("button", { name: "Kenal pasti begini" })`.
  - **An `aria-label` that only repeats the trigger's text** can be removed.
  - **Children with no text,** such as an icon alone, need an `aria-label`.

  `full.css` in `@amerfathullah/myds-style` gains `max-sm:sr-only` and no longer carries `sm:block`, which nothing else in the library used.

  The docs (EN/MS) no longer pass an `aria-label` that repeats the trigger's text. They say the trigger's text names it below `sm:` too, that "Toggle masthead" applies only with no children, and how to rename it, with a Malay example.

- 499cf29: The 24px `Mini…` legacy icons, such as `MiniBNMIcon` and `MiniPolicePDRMIcon`, now draw in the text colour, like the full-size legacy marks, so a `txt-*` class colours them and they change with the theme. They used to be a fixed `gray-800` (#27272A), which nearly disappears on the dark theme's backgrounds. In the light theme a Mini icon now follows the surrounding text colour instead of staying `gray-800`. To keep the old look, pass `className="text-gray-800"`.
- 626d987: An `id` you pass `Navbar` now reaches its `<header>` without breaking the mobile menu (#216). The mobile menu finds the header by its id, to open below it. Navbar gave the header a generated id, and yours replaced it, so the menu found no header. Below `xl:` (1280px), it then opened in the top-left corner, only as wide as its content and with no overlay, and the sticky header covered its first item: a tap there landed on the header, and keyboard focus there was hidden behind it.

  - **The menu follows your `id`.** A non-empty `id` you pass `Navbar` stays on the `<header>`, as before, and the mobile menu now finds the header by it. The menu opens below the header, at its full width, over its overlay, as it does with no `id`. Adding or removing the `id` on a mounted Navbar keeps the menu there.
  - **An empty or undefined `id` counts as none.** With `id={undefined}` or `id=""`, the `<header>` now gets the generated id. Before, it had no id, or an empty one.

  The generated id comes from React's `useId()`, so don't rely on its format. Server-rendered HTML doesn't change with no `id` or with a non-empty one. The props, types and classes don't change.

  The docs (EN/MS) list `id` on `Navbar`.

- ef48a3a: NavbarMenu now renders its children once: in the menu bar's list while the Navbar's mobile menu is closed, and in the mobile menu while it's open. Before, it rendered them twice while the mobile menu was open: once in the menu bar's list, which is hidden below `xl:` (1280px), and again in the mobile menu.

  - **Ids no longer repeat.** An `id` you give a menu child is on one element. Before, it was on two while the mobile menu was open, and `document.getElementById` found the hidden copy.
  - **A ref holds the mounted element.** A ref on a menu child holds the element in the menu bar's list at load and after the mobile menu closes, and the element in the mobile menu while it's open. Before, it was `null` once the mobile menu closed, although the menu bar's element was still on the page.
  - **The mobile menu closes when the window widens to `xl:`.** From `xl:` up the menu bar's list shows and the toggle hides, so a mobile menu left open as the window widened stayed open where nobody could see it, and its scroll lock stopped the page scrolling until a click on the page closed it. Now it closes, the page scrolls, and the toggle's `aria-expanded` is `"false"` again.

  **If you upgrade:** below `xl:`, the menu's children now mount again each time the mobile menu opens or closes, so their effects run, and their state resets, each time. Before, they mounted again only when it opened. Keep state that must last above `NavbarMenu`. From `xl:` up the toggle is hidden by default, so the mobile menu doesn't open and nothing mounts again. If your own classes show the toggle from `xl:` up, pressing it there no longer opens the mobile menu: the menu closes as soon as it opens, and the menu bar's children mount again on each press.

  The props, types, classes and server-rendered HTML don't change.

  The docs (EN/MS) say that NavbarMenu renders its children once, and that they mount again each time the mobile menu opens or closes.

- 1afef8a: NavbarMenuItem with `asChild` now renders your element through Link, as `<Link asChild>` does. Before, the element got a stray `underline` attribute and none of Link's classes. `<NavbarMenuItem asChild href="#x"><a href="#x">About</a></NavbarMenuItem>` rendered `<a href="#x" underline="none" class="w-full">`. HTML doesn't define an `underline` attribute, and React logged no warning. A router link, such as Next.js `Link`, received an `underline` prop it doesn't know and passed it on to its `<a>`.

  The same item now renders `<a href="#x" class="transition-colors box-decoration-clone focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-fr-primary no-underline text-inherit decoration-inherit w-full truncate px-2.5 py-1.5 rounded-md" target="_self">`, the same element an item without `asChild` renders.

  - **No `underline`.** Your element gets no `underline` attribute, and a router link gets no `underline` prop.
  - **Link's classes.** Your element now gets the same classes as an item without `asChild`, followed by any classes of its own, so it looks and focuses like the other items.
  - **`target="_self"`.** Your element gets `target="_self"`, unless it sets its own `target`. Next.js `Link` keeps client-side navigation, because Next.js handles a `_self` link as a plain click.
  - **Your element's own props still win.** Its own `href` and `target` beat the item's, and an element with no `href` takes the item's.

  **If you set a colour on the element:** it now carries `text-inherit`, as it already does under `<Link asChild>`. A colour class on it, such as `text-gray-700` or an arbitrary colour, may now lose to `text-inherit`, since Link doesn't merge classes and the stylesheet's order decides. Put the colour on a `<span>` inside the element instead. The element also carries `transition-colors`, as the other items do, including under reduced motion.

  **If you put MYDS `<Link asChild>` between the item and your router link,** as a workaround, remove it. The item now does what the workaround did. Left in, it underlines the link: Link underlines by default, and the item no longer passes it `underline="none"`. To keep it, pass it `underline="none"` yourself.

  The props types don't change, and an item without `asChild` renders as before.

  The docs (EN/MS) now document `asChild` in the `NavbarMenuItem` props table.

- 09a9ad2: `PaginationPrevious` and `PaginationNext` with `asChild` now change the page, and are disabled on the first and last page, as they are without `asChild`. Before, your element got neither. A button child did nothing when clicked and stayed enabled on every page. A link child followed its own `href`, with no disabled state on the first or last page.

  - **The page change.** A click on your element calls `onPageChange` with `page - 1` or `page + 1`. Your element's own `onClick` runs first, and calling `event.preventDefault()` in it keeps the page. On the other pages, a link both calls `onPageChange` and follows its `href`.
  - **The disabled state.** On the first page for `PaginationPrevious`, or the last for `PaginationNext`, a `<button>`, or a MYDS `Button` that isn't itself `asChild`, gets `disabled`. Any other element, such as a link or a router's `Link`, gets `aria-disabled="true"`, and its click is prevented, so it doesn't navigate. A `disabled` or `aria-disabled` you pass the part, or set on your element, wins.
  - **No name or classes.** `asChild` still adds no name, and adds no classes.

  With or without `asChild`:

  - **Your `onClick` runs, then the page changes.** An `onClick` you pass `PaginationPrevious` or `PaginationNext` now runs before the page change, instead of replacing it. Call `event.preventDefault()` in it to stay on the page.
  - **No pages.** `PaginationNext` is now disabled when there are no pages, such as with `count={0}`. Before, it was enabled and did nothing.

  The props types don't change.

  **If you upgrade:**

  - An `onClick` on `PaginationPrevious` or `PaginationNext` that calls `onPageChange` itself now runs alongside the built-in page change, so `onPageChange` is called twice, and a functional updater such as `(p) => p - 1` moves two pages. Remove that `onClick`, or call `event.preventDefault()` in it to keep only your own.
  - A disabled link is only `aria-disabled`, with its click prevented. Middle-click, "open in new tab" and "copy link" still use its `href`, so on the first and last page, point the `href` somewhere sensible, such as the current page, or leave it out.

  The docs (EN/MS) say what `asChild` keeps and that it adds no name or classes, and show an `asChild` example. Their manual-assembly example no longer passes `PaginationPrevious` and `PaginationNext` an `onClick`, which would now change the page twice.

- 65815bd: Pagination's current page button now carries `aria-current="page"`, so screen readers announce which page is current. Before, it differed from the other page buttons only by its `bg-washed-active` fill, which in light barely stands out from its surface, and was announced like every other page.

  - **AutoPagination** marks its current page with `type="default"`, with no new prop. `type="simple"` and `type="full"` render no page buttons and are unchanged.
  - **PaginationNumber.** The one whose `number` is the `Pagination`'s `page` renders `aria-current="page"`. The others render no `aria-current` attribute.
  - **Your `aria-current` wins.** An `aria-current` you pass `PaginationNumber`, such as `"step"` or `false`, replaces the default, and `aria-current={undefined}` removes it. The fill still follows the current page, whatever `aria-current` says.
  - **Nothing else changes.** Nothing changes visually, the current page's button stays enabled, and the accessible names are unchanged: "page N", your `pageLabel`, or your `aria-label`.

  **If you upgrade:** if you added "current" to `pageLabel`, or to a `PaginationNumber`'s `aria-label`, so screen readers would announce the current page, remove it. Screen readers now announce it from `aria-current`, so they would say it twice.

  The docs (EN/MS) say the current page's button carries `aria-current="page"` and that an `aria-current` on `PaginationNumber` replaces it.

- 2f1dcbd: The 26 parts of Masthead, Navbar, DateField, TimeField, Spinner, Breadcrumb, Pagination, Radio and SearchBar that didn't forward their refs now do, so a ref on them works on React 18. That includes a ref a library attaches: react-hook-form's `register()` on a `DateField` now moves focus to it after a failed submit, and a `SearchBarSearchButton` inside a Radix trigger with `asChild`, such as `DialogTrigger` or `TooltipTrigger`, gets focus back when the dialog closes and anchors its tooltip. Before, React 18 dropped the ref: an object ref stayed `null` and a callback ref was never called. In development React warned "Function components cannot be given refs"; in production it said nothing. React 19 already passed the ref on, and still does.

  Each ref is the element the part renders, the one its props go on:

  - **Masthead:** `Masthead`'s is its `<div id="masthead">`, not the collapsible around it. `MastheadHeader`'s and `MastheadSection`'s are their `<div>`, `MastheadTitle`'s its `<p>`, `MastheadTrigger`'s its `<button>`, and `MastheadContent`'s its `<div>`.
  - **Navbar:** `Navbar`'s is its `<header>`, `NavbarLogo`'s its `<a>`, `NavbarMenuItem`'s its `<li>`, and `NavbarAction`'s the menu toggle's `<button>`, not the `<div>` around it.
  - **DateField and TimeField:** the `<input>`, not the frame around it, which `className` styles.
  - **Spinner:** its outer `<div>`. With `show={false}` it renders nothing, so the ref gets no element.
  - **BreadcrumbSeparator** and **PaginationEllipsis:** their `<li>` and `<span>`.
  - **Radio:** `RadioItem`'s is its `<div>`, `RadioLabel`'s its `<label>`, and `RadioHintText`'s its `<div>`.
  - **SearchBar:** `SearchBarInputContainer`'s, `SearchBarHint`'s and `SearchBarResults`' are their `<div>`, and `SearchBarSearchButton`'s and `SearchBarClearButton`'s their `<button>`. `SearchBarResultsList`'s, `SearchBarResultsGroup`'s and `SearchBarResultsItem`'s are cmdk's `role="listbox"`, `role="presentation"` and `role="option"` elements.

  Nothing else changes. The parts render the same markup, and their props types are the same. Each export's type is now a `ForwardRefExoticComponent` over those props, and code that assigns one to its old `FunctionComponent` type still compiles. `SearchBar` and `SearchBarInput`, which already forwarded their refs, are typed the same way now. Every SearchBar part has a `displayName`, so React's developer tools show its name.

  The docs (EN/MS) say each part forwards its `ref`, and which element it is where that isn't the obvious one.

- 5fd6cd3: Pill's remove button is now `type="button"`. It was a submit button, so inside a `<form>`, as in a tags field, removing a pill could submit the form, and Enter in a field could remove a pill.

  - **Click.** Clicking the remove button calls `onDismiss` and no longer submits a form around the pill. It did whenever `onDismiss` left the pill rendered.
  - **Enter.** Enter in a field no longer activates a pill's remove button. When the pills came before the form's own submit button, or the form had none, the first pill's remove button was the form's default button, so Enter called that pill's `onDismiss`, and a tags field lost its first tag. Enter now submits the form as it would without the pills: through the form's own submit button, or, in a form with no submit button and one text field, with no submitter.
  - **Workaround.** A `preventDefault()` in `onDismiss`, used as a workaround, can stay but is no longer needed.

  `Button` doesn't change: it still renders no `type` unless you pass one, so an untyped `Button` inside a form still submits it. Pill's props and look don't change.

- 5b65fd4: A Radio option's RadioLabel and RadioHintText now dim exactly when the option's own radio button is disabled. They took `txt-black-disabled` and `otl-gray-300` only from the `disabled` of Radio or RadioItem, so a radio disabled another way looked disabled beside text in its enabled colours: inside a `<fieldset disabled>` (plain, `group`, nested or disabled after mount), with `disabled` on the RadioButton alone, or under `<Radio disabled>` with `<RadioItem disabled={false}>`, where Radix disables the radio anyway (#357). RadioItem now dims its label and hint from its radio's `:disabled`, whatever disabled it, when they sit directly in RadioItem or inside one wrapper there, and they come back when the fieldset is enabled again. RadioLabel and RadioHintText render `data-radio-label` and `data-radio-hint` for that. With RadioButton's `disabled` and in #357's case, the hint is now also marked `aria-disabled`, so contrast checkers exempt its dimmed colour, as they do the label's; RadioButton reports its disabled state to its RadioItem for that. In a disabled fieldset the hint isn't marked, because checkers exempt everything inside one. With `<RadioItem disabled>` and `<RadioButton disabled={false}>` or `disabled={undefined}`, which leave the radio enabled, the label and hint no longer dim and the hint is no longer marked `aria-disabled`, though server-rendered HTML still shows them dimmed and marked until it hydrates. A colour class on a RadioLabel or RadioHintText no longer keeps it from dimming on a disabled option; on an enabled one it still applies. An `aria-disabled` you pass to RadioHintText still wins, but `aria-disabled={undefined}`, as a wrapper that forwards it passes, no longer removes the computed value. A RadioButton in a Radio nested inside an option doesn't change that option's look. No part's prop types change, and a RadioLabel or RadioHintText of this version still works under an older copy's RadioItem. `full.css` in `@amerfathullah/myds-style` carries the new classes.
- 7baa1a2: The README's hero image now loads from this repository's default branch, not from upstream's CloudFront bucket (ADR-0006), so it keeps showing on GitHub and npm if the bucket goes.
- c87bdef: The icons on `@amerfathullah/myds-react/icon` are regenerated from their SVG sources by the repaired icon generator. Nothing you import or render changes: the entry exports the same names, each icon renders the same markup, and `MalaysiaFlagIcon` and `JataNegaraIcon` keep their deprecation notes. Only some icons' doc comments in the type declarations change, to name their export: `BookMOEIcon`, `MiniBookMOEIcon`, `PDFMediaIcon` and `RSSIcon`.
- ee9b229: The unexported Sheet component is removed from `@amerfathullah/myds-react`. Its compiled files shipped in the package, but its `exports` map never had a `./sheet` entry, so `@amerfathullah/myds-react/sheet` could never be imported and no component used it. Nothing public changes: every subpath the package exports resolves as before, and its dependencies are the same. `full.css` in `@amerfathullah/myds-style` no longer carries the classes that only Sheet used.
- 75be647: In Chromium, a DateField or TimeField whose input is narrower than its text (a fixed `width`, or a `min-width` inside a narrow parent) now scrolls the focused segment fully into view, fill included, whenever keyboard focus moves to it. Chromium's focus scroll used to bring a segment into view only when it was entirely hidden, so a partly hidden one stayed cut off. The fields wrapper inside the edit area now has scroll padding of half its width on each side, which leaves only its centre line, and Chromium centres any focused segment that doesn't cross it. Typing that widens the focused segment, as when an empty AM/PM becomes PM, doesn't scroll it, and neither does a click. A segment wider than half the field, such as milliseconds when `step` is under 1, can stay partly cut. A field at its natural width keeps its layout and never scrolls, in left-to-right and right-to-left locales. `full.css` in `@amerfathullah/myds-style` carries the new classes.
- 1b25edc: SearchBar's keys no longer move the highlight onto the hidden `--` option, so it never disappears while the person moves through the results (#205). `SearchBarResultsList` renders a hidden `--` option first, so that nothing is highlighted until the person moves into the results. cmdk's keys treated it as an ordinary option, so ArrowUp from the first result, Ctrl+P, Ctrl+K or Alt+ArrowUp from there, and with `loop` a wrap from the last result, highlighted nothing, Enter then chose nothing, and with `loop` it took an extra key to wrap.

  - **No key takes the highlight back to nothing.** ArrowDown, ArrowUp, Alt+ArrowDown, Alt+ArrowUp and, with `vimBindings`, Ctrl+N/J/P/K move only through the shown results. Without `loop`, ArrowUp from the first result stays on it, and ArrowDown from the last stays on that. With `loop`, they wrap from the last result to the first and back.
  - **Nothing is highlighted at rest, or after a query change,** as before. Only a query change, or the highlighted result unmounting, takes the highlight back to nothing. `useCommandState` and SearchBar's `onValueChange` still report `--` then.
  - **A key pressed straight after typing into a controlled `SearchBarInput` now acts on the query just typed.** On React 18.3, cmdk took a controlled query in an effect that React rendered after the keystroke, and an ArrowDown pressed in between was undone: nothing was highlighted, and the input named the first result. A controlled value now reaches cmdk only when you set it yourself, such as from a clear button, so typing hands cmdk the query inside the keystroke, as an uncontrolled `SearchBarInput` always did. `value` and `onValueChange` mean what they did: the input shows your `value`, and `onValueChange` fires once per edit with the input's new value.
  - **Your `onKeyDown` on SearchBar** still runs first, once per key, and its `preventDefault` stops cmdk.

  **Known limits:**

  - **On React 18.3, a query you set yourself,** such as from a clear button, still reaches cmdk after the render, so a key pressed within a few milliseconds of it can still be undone.
  - **A keystroke your `onValueChange` rejects or rewrites** still reaches cmdk's query for a moment, as cmdk takes the typed text before it calls `onValueChange`. SearchBar then hands cmdk your `value`. Each of those is a query change, so a highlighted result goes back to nothing, and `useCommandState((state) => state.search)` briefly reports the text you refused. Before, cmdk's query only ever held your `value`.

- dce477b: Several SearchBars can now share a page. Each SearchBar generates its own id for its results panel, `SearchBarResults`, so its input's `aria-controls` names only its own bar's results. Before, every SearchBar rendered `id="search-input"` on its panel and `aria-controls="search-input"` on its input. Two SearchBars on one page, such as a header search beside a page search, duplicated the id, and both inputs pointed at the first bar's panel.

  - **Your `id` wins.** An `id` you pass `SearchBarResults` is now rendered, and that bar's input points at it while no `SearchBarResultsList` is mounted. SearchBar used to overwrite it.
  - **Your `aria-controls` wins.** An `aria-controls` you pass `SearchBarInput` now reaches the `<input>`. SearchBar used to overwrite it with `search-input`.
  - **What the input names.** Its `aria-controls` names cmdk's listbox while a `SearchBarResultsList` is mounted, else the panel, else nothing, as the entry for #204 and #369 describes.
  - **Server rendering.** Server-rendered HTML has the input collapsed, with no generated `aria-controls`, until the page hydrates, and it hydrates without a warning (#204, #369).

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

- 5b4bc2c: Select and Dropdown no longer open from a press on a trigger that's disabled without their own `disabled` prop. Radix opens both on `pointerdown` and checks only that prop, but Chromium still sends a disabled button `pointerdown`. So inside a `<fieldset disabled>`, where the trigger looked disabled and Tab skipped it, a mouse press opened a Select or a Dropdown, and a touch tap opened a Dropdown. A pick then called `onValueChange` or an item's `onSelect`, and reached the form once the fieldset was enabled again. `<DropdownTrigger asChild><Button disabled>` opened the same way. SelectTrigger and DropdownTrigger now stop the press while their own button is `:disabled`, whatever disabled it: the prop, a disabled fieldset (plain, `group`, nested or disabled after mount, even with `disabled={false}` on the component), or `disabled` on an `asChild` child. A press on a disabled trigger also no longer moves focus. Before, a mouse press on a Dropdown trigger with `disabled`, or a touch tap on any trigger with `disabled`, moved it to the page's body. A trigger in the first `<legend>` of a disabled fieldset, which the browser leaves enabled, still opens. An `onPointerDown` you pass to either trigger, or to an `asChild` child, is still called on every press. Both triggers keep their prop types.

  SelectLabel, the prefix a SelectValue `label` draws, now dims with the trigger it sits in. It took `txt-black-disabled` only from the `disabled` prop, so in a disabled fieldset it kept its enabled `txt-black-500` (`txt-black-900` in a `multiple` select) beside the dimmed value. An enabled Select's label also dimmed under any ancestor marked `group` with a `data-disabled` attribute, such as an open, disabled AccordionItem. It now follows the trigger's `:disabled`, as DateRangePicker's prefix does, and a label with a colour class of its own dims too. A `disabled` you added to each Select or DropdownTrigger in a disabled fieldset only to keep it shut, or to dim its label, can go. `full.css` in `@amerfathullah/myds-style` already carries the class, and doesn't change.

- 803fcb0: SelectHeader and SelectFooter now pass every prop and their ref to their `div`, as their types say. Before, they kept only `className` and `children`, so anything else you gave them never reached the page. React 19 logged nothing, and React 18 only warned that a function component can't be given a ref.

  - **Attributes land on the `div`.** `id`, `role`, `aria-*`, `data-*`, `title`, `tabIndex` and `style` now render on the header's or footer's `div`, so you can give the region a role, a name or a description, or point `aria-labelledby` or `aria-describedby` at it by `id`. `className` still merges after the part's own classes.
  - **Event handlers run.** `onClick`, `onKeyDown` and the other handlers now run when the `div` gets the event. Before, only SelectContent's handlers saw it, by bubbling.
  - **The ref gets the `div`.** An object or callback ref now receives the header's or footer's `div`, under React 18 and 19, so you can measure it. Before, an object ref stayed `null` and a callback ref was never called.

  Without extra props, the header, the footer and every other part of Select render the same markup as before, and the props types don't change.

- ba4baf7: A Select's highlighted option, the one the arrow keys move to and Enter picks, can now be seen in the dark theme. It had only a `bg-washed` fill, which in dark is `gray-850`, the same colour as the list's `bg-dialog` panel, and its text didn't change. So a keyboard user couldn't see which option had focus. Now they can, as WCAG's SC 2.4.7 (Focus Visible) asks.

  - **It now looks like a highlighted Dropdown item.** The option takes a `bg-washed-active` fill with `txt-black-900` text, as a focused default `DropdownItem` does and as the design guideline's Menu list state draws it. In dark that's a `gray-800` fill with white text.
  - **In light, only the text darkens,** from `txt-black-700` to `txt-black-900`, because `bg-washed-active` equals `bg-washed` there.
  - **Every highlighted option gets it:** one a mouse pointer moves onto, a selected one, which still shows its check, and the options of a `multiple` select. Resting and disabled options don't change.
  - **ThemeSwitch's select mode is fixed too,** as its options are SelectItems.

  **A text colour you pass in `className` gives way while the option is highlighted.** A plain class such as `text-txt-primary` on `SelectItem` now yields to `txt-black-900` on the highlighted option, as it does on `DropdownItem`. A `data-[highlighted]:` class you pass still wins.

  `full.css` in `@amerfathullah/myds-style` carries the new classes.

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

- cae6623: SiteLink with `asChild` now renders your element through Link, as a SiteLink without `asChild` does. Before, the element got none of Link's classes, so on hover it only changed colour, at once, and didn't underline like the other footer links. In a `SiteLinkGroup`, `<SiteLink asChild><a href="#s2">Two</a></SiteLink>` rendered `<a href="#s2" class="hover:text-txt-black-900 line-clamp-1 lg:col-span-full text-txt-black-700">`.

  The same link now renders `<a href="#s2" class="transition-colors box-decoration-clone focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-fr-primary no-underline hover:underline text-inherit decoration-inherit hover:text-txt-black-900 line-clamp-1 lg:col-span-full text-txt-black-700" target="_self">`, the same element a SiteLink without `asChild` renders.

  - **Link's classes.** Your element now gets the same classes as a SiteLink without `asChild`, followed by any classes of its own. It underlines on hover and its colour transitions, like the other footer links.
  - **`target="_self"`.** Your element gets `target="_self"`, unless it sets its own `target`. Next.js `Link` keeps client-side navigation, because Next.js handles a `_self` link as a plain click.
  - **SiteLink's props work with `asChild`.** Your element takes SiteLink's `href` unless it has its own. Before, SiteLink dropped its `href`, so an element with none wasn't a link. `newTab` now gives `target="_blank"`, `primary` the primary text colour, and `underline` Link's underline style. Before, they reached your element: `underline` rendered as an attribute HTML doesn't define, `newTab` and `primary` did nothing, and React warned about `newTab` and `primary`. It no longer does.
  - **Your element's own props still win.** Its own `href` and `target` beat SiteLink's.

  **If you set a colour on the element outside a `SiteLinkGroup`:** it now carries `text-inherit`, as it already does under `<Link asChild>`. A colour class on it, such as `text-gray-400` or an arbitrary colour, may now lose to `text-inherit`, since Link doesn't merge classes and the stylesheet's order decides. Put the colour on a `<span>` inside the element instead. Inside a `SiteLinkGroup` the colour doesn't change, because the group's `text-txt-black-700` already applies.

  **If you put MYDS `<Link asChild underline="hover">` between SiteLink and your router link,** as a workaround, you no longer need it: SiteLink now does what the workaround did. Left in, it looks the same.

  The props types don't change, and a SiteLink without `asChild` renders as before.

  The docs (EN/MS) now document `asChild` in the `SiteLink` props table, and show `SiteLink` with `asChild` around a Next.js `Link`.

- 0f1a7ca: The declaration files now list the members of a union in a stable, sorted order, so two builds of the same source ship the same files (#239). Before, the order could change from build to build. For example, Breadcrumb's `variant` prop was typed `"fill" | "default" | null | undefined` in one build and `"default" | "fill" | null | undefined` in another.

  This changes how unions are written in the `.d.ts` and `.d.mts` files of 17 components, not what they accept:

  - in 16 of them, props that take one of a list of names, such as `variant` and `size`: `size?: "small" | "medium" | "large"` is now `"large" | "medium" | "small"`;
  - Accordion's props, now `AccordionMultipleProps | AccordionSingleProps`.

  It shows in editor tooltips and in snapshots of the types. The JavaScript and the sourcemaps are unchanged.

- 73ac5f4: `SummaryList`, `SummaryListBody`, `SummaryListRow`, `SummaryListTerm`, `SummaryListDetail`, `SummaryListAction` and `SummaryListAddition` now forward their refs, so a ref on them works on React 18. Before, React 18 dropped it: an object ref stayed `null` and a callback ref was never called. In development React warned "Function components cannot be given refs"; in production it said nothing. React 19 already passed the ref on, and still does.

  Each ref is the element the part renders: the list's `<div>`, the body's `<table>` (not the `<tbody>` inside it), the row's `<tr>`, the term's `<th>`, and the detail's, the action's and the addition's `<td>`. `SummaryListHeader` already forwarded its ref.

  Nothing else changes. The parts render the same markup, and their props types are the same. Each export's type is now a `ForwardRefExoticComponent` over those props, as Table's parts are, and code that assigns one to its old `FunctionComponent` type still compiles.

  The docs (EN/MS) say each part forwards its `ref`, and that `SummaryListBody`'s is its `<table>`.

- 93e922c: `setTheme` outside a ThemeProvider, from a ThemeSwitch with no provider above it or from an app's own `useTheme()`, now logs one console warning per page, where it used to fail silently. The theme still doesn't change. Rendering a ThemeSwitch logs nothing: only a click, a choice or a call to `setTheme` does. The warning says `setTheme("dark")` (with the theme it was given) was called outside a ThemeProvider. To fix it, wrap the app in one ThemeProvider from `@amerfathullah/myds-react/hooks`, above every ThemeSwitch and `useTheme` call, or feed `ThemeContext.Provider` from your own theme state or another theme library. Test suites that fail on console output, and click a ThemeSwitch with no provider above it, will see the warning.

  The ThemeSwitch and useTheme develop pages (EN/MS) say so in the callouts that tell you to wrap the app in ThemeProvider.

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
