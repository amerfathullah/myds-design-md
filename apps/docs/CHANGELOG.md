# @govtechmy/myds-docs

## 1.0.5

### Patch Changes

- 095eb25: The docs' Accordion pages (EN/MS) now say that a disabled `<fieldset>` around the Accordion disables its triggers too. Accordion gains a Storybook story in a disabled fieldset, with one item open and one closed.
- 337ddbe: BreadcrumbLink and BreadcrumbPage now render a `title` you pass, whatever their children. Before, the crumb's children replaced it: `<BreadcrumbLink title="Go to the home page">Home</BreadcrumbLink>` rendered `title="Home"`. An element child, such as a `<span>`, an icon or `asChild` around a router link, rendered `title="[object Object]"`, which screen readers read as the link's description, and an icon-only crumb named only by its `title` was announced as "[object Object]". An icon plus text, or `Page {n}`, rendered its children converted to text, such as `title="Page ,2"`, and a crumb with no children dropped the `title`.

  - **Your `title` wins.** A `title` you pass renders as given, with plain text, an element, an icon, an icon plus text, `Page {n}` or no children at all.
  - **The default is unchanged.** With no `title`, or a `title` of `undefined` or `null`, plain-text children still become the `title`, so a truncated crumb shows its full text on hover. Any other children still give no `title`.
  - **`title=""` now turns the hover text off.** It renders an empty `title`. Before, a plain-text crumb rendered its text instead.
  - **`asChild`.** A `title` on BreadcrumbLink now reaches the child it renders as given. A `title` on the child itself still wins over it.

  The props types don't change. A workaround that put `title` on the child of an `asChild` BreadcrumbLink, rather than on BreadcrumbLink, can stay.

  The docs (EN/MS) say that only a plain-text crumb shows its full text on hover, that any other crumb should be given its full text in `title`, and that an icon-only crumb is named with `aria-label`, not `title`.

- 8b4f54a: The calendar in `DatePicker` and `DateRangePicker` now names its controls in the picker's `locale`, and you can rename the month view's year buttons in your site's language.

  - **Malay names under `locale="ms"`:** the calendar takes its names from react-day-picker's own `ms` locale. Screen readers announce the `<nav>` as "Bar navigasi", the day view's buttons as "Pergi ke bulan sebelumnya" / "Pergi ke bulan seterusnya", the grid as "Oktober 2026", the weekday headings in full ("Ahad" … "Sabtu"), and the day buttons like "Jumaat, 30 Oktober 2026, dipilih". Before, they were English inside an element marked `lang="ms"`.
  - **New `previousYearLabel` and `nextYearLabel` props** on both pickers, defaulting to "Go to the Previous Year" and "Go to the Next Year". They name the month view's year buttons, which no locale names, in every calendar the picker renders. For example, `previousYearLabel="Pergi ke tahun sebelumnya"` and `nextYearLabel="Pergi ke tahun seterusnya"`. They never reach the DOM.
  - **Named month and year grids:** the month view's grid is "Pilih bulan" / "Choose the Month", and the year view's grid "Pilih tahun" / "Choose the Year". They had no name. Opening either view no longer logs React's missing-key warning.
  - **New wording of English day buttons:** under `locale="en"` the calendar uses react-day-picker's `enGB` names, so day buttons read "Friday, 30 October 2026, selected" instead of "Friday, October 30th, 2026, selected". Its other English names are unchanged.

  Nothing changes visually: the same elements, classes and text render, the week still starts on Sunday, and the triggers read as before.

  The docs (EN/MS) say the calendar's names follow `locale`, and document `previousYearLabel` and `nextYearLabel`.

- fd1d8ac: The Callout develop pages (EN/MS) show code you can copy as it is, and the Malay page says what the English one does. The Usage import brings in all five parts, `CalloutClose` among them, and `Button`, which the examples use. The opening Code tab imports `Button` too, and its preview's button says "Call to Action", as its code does. Before, the English Anatomy and the Dismissible samples that wrap their button in `CalloutClose` didn't import it, and the opening, Variant, Layout and Dismissible samples didn't import `Button`. Layout says a callout with `CalloutContent` is stacked whether or not it has an action, and its stacked preview is the success callout its Code tab shows. The Malay page now has that Layout section (Susun Atur), `CalloutClose` in its Anatomi block, and Variant comments that match the English ones, and its intro calls the component a callout. Neither page mentions a render prop on `CalloutAction`, which has none: the action sample dismisses the callout through `CalloutClose`. The Dismissible previews do what their samples do. In the basic one, only the cross dismisses, with no alert. In the action one, the action button, wrapped in `CalloutClose`, dismisses it too, and `onDismiss` alerts first. On the Malay page, the previews' buttons, the close button's name ("Tutup"), the alert and the console message are in Malay. The action button, the close button's name, the alert and the console message are the same as in its samples.

  The Callout story's Usage block in Storybook imports what it uses.

- 9859bd4: Callout is now a note (`role="note"`) for every Variant, including when `variant` is left out, instead of an assertive alert. A note isn't a live region, so screen readers read a callout in reading order with the rest of the page and don't announce it when it appears. As an alert, a callout interrupted the user when it was inserted: one that appeared after the user acted, or every callout on a page reached by client-side navigation, even an Information callout.

  - **Your role wins.** A `role` you pass still replaces the default, whatever the Variant.
  - **Names.** An `aria-label` or `aria-labelledby` you pass names the note, for example `aria-label="Notis"`.
  - **Nothing else changes.** Nothing changes visually: the same elements, classes and icons render. Callout's props and ref types are the same, and its ref is still the root `<div>`. CalloutTitle keeps `role="term"` and CalloutContent `role="definition"`.

  **If you upgrade:**

  - Pass `role="alert"` to a callout that appears after the user acts and must be announced, such as an error after a failed submit.
  - Update tests or CSS that select Callout by `[role="alert"]`.

  The docs (EN/MS) say when to pass `role="alert"`, and list `role` in Callout's props.

- f6d8bf8: Callout's status icon (the `<svg>` it picks by Variant) and the cross in a `dismissible` callout's close button are now hidden from assistive technology (`aria-hidden="true"`). Before, each was an image with no name: screen readers met an image that said nothing, and nothing told them the Variant. Nothing changes visually: the same elements, classes, icons and sizes render.

  - **The close button.** It's still named "Close", or by `closeLabel`. Its cross is hidden as Pill's remove cross is.
  - **Roles.** Hiding the icons changes no role: Callout is a note (`role="note"`), or the `role` you pass. CalloutTitle keeps `role="term"` and CalloutContent `role="definition"`.
  - **Nothing else changes.** Callout's props and ref types, and CalloutContext's value, are the same. An icon you import on its own, such as `InfoIcon` or `CrossIcon`, renders as before, with no `aria-hidden`.
  - **The title says the Variant.** Callout adds no text, prop or attribute for it. The icon and the colour don't reach screen readers, so the title must say it.

  **If you upgrade:**

  - Make each callout's title say its Variant, in your site's language. Its wording can say it, such as "Permohonan anda tidak dihantar", or it can start with the Variant's name, such as `<CalloutTitle>Ralat: Borang tidak dihantar</CalloutTitle>`. Where the design can't show that word, start the title with visually hidden text, `<span className="sr-only">Ralat: </span>`, instead of a visible name, never as well as one.
  - Update tests that look for an image inside a callout.

  The docs (EN/MS) say the title must say the Variant and show how. Every Callout title that was "Title" or "Tajuk" in the docs and stories now starts with its Variant's name, such as "Error: Form not sent", and so do the Dismissible previews' titles. The Storybook demo's title follows its `variant` control. The `variant` prop's descriptions in the docs and Storybook say it sets the colour and the icon, and that the title must say the Variant.

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

- 502938b: The docs site's own images are now served from the docs site itself, not from upstream's CloudFront bucket (ADR-0006). Its 22 files under `/common/` (the hero, the home page's preview illustrations and "about" icons, the `-dark` copy of each, the logo and the Jata Negara) are copied unchanged into `public/common`, at the paths the pages and components already use, so none of them changes. The locale redirect leaves `/common/` alone, and the image loader serves it from `public/`, as they do `/design/`. `check-design-files` now also fails when a docs page or component references a file under `/common/` that the repository doesn't hold, counting the `-dark` copy that `darkify()` requests for each preview illustration and "about" icon.
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

- db9cc57: The docs' DatePicker and DateRangePicker pages (EN/MS) now say that `true` inside a `disabled` array disables the whole picker, as `true` does, so `disabled={[isLocked, { before: new Date() }]}` disables it while `isLocked` is `true`. They also say that a rule that happens to match every day, such as `() => true`, disables only the days and leaves the picker focusable, and that `disabled={isLocked ? true : rule}` or a disabled `<fieldset>` disables the whole picker whatever the rule. The `disabled` row of each props table, and both pickers' `disabled` descriptions in Storybook, state the same rule.
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

- 02b360f: The docs' DatePicker and DateRangePicker pages (EN/MS) now say that `true` disables the whole picker, and any other Matcher only the days it matches, and that a disabled `<fieldset>` around the picker disables it too, with `disabled` passed to its Label as well so the label dims. Both pickers' `disabled` descriptions in Storybook say the same.
- ed7f54e: The design guideline's images and videos are now served from the docs site itself, not from upstream's CloudFront bucket (ADR-0006). Its 444 files under `/design/` (the Markdown images and the `-dark` copy of each, the `<Image>` files and the demo videos) are copied unchanged into `public/design`, at the paths the pages already use, so no page changes. The locale redirect leaves `/design/` alone, as it does `/assets/`, and the build reads each Markdown image's size from `public/`. Any other path, such as the site's own `/common/` assets, still loads from the bucket. A new `docs` workflow runs `check-design-files`, which fails when a guideline page references a file under `/design/` that the repository doesn't hold.
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

- 7dfcd6d: The docs' DateField and TimeField pages (EN/MS) now say that a disabled `<fieldset>` around the field disables it too, and DateField and TimeField each gain a Storybook story of the field in a disabled fieldset.
- 7b427c3: The docs and standard sites and Storybook now take the scroll, focus and underline rules from `@amerfathullah/myds-style`. Storybook drops its own copies of them, the box-sizing pair included, so stories render as an app on the Tailwind import does. The docs and standard sites set `html { scroll-padding-top: 0 }`, so a Fumadocs heading still lands 112px from the top (its `scroll-m-28`) rather than 177px. They also drop their own unconditional smooth scrolling, so they scroll smoothly only when the user hasn't asked for reduced motion.
- 0836030: The docs now show how to make the Masthead a page region named by its title, and the docs site's own Masthead is one. The Masthead renders a plain `<div id="masthead">`, so in the page frame its title and explainer sat outside every landmark: screen reader users who move by landmark skipped them, and an axe run over a whole page reported them under its `region` rule.

  - **The develop docs (EN/MS).** The Masthead page's example, in its preview and its code, passes `role="region"` to `Masthead` and points its `aria-labelledby` at `MastheadTitle`'s `id`. A note says why and shows the pattern, with "Portal Rasmi Kerajaan Malaysia" on the Malay page. It says to always name the region, because browsers don't expose a region with no name as a landmark, and not to name the Masthead without the role. Masthead's props list `role`, `aria-labelledby` and `aria-label`, and MastheadTitle's list `id`.
  - **The docs site.** Its shared Masthead, on the home, community, icon and not-found pages, is a region named by its translated title.

  `@amerfathullah/myds-react` doesn't change: `Masthead` already passes `role` and `aria-labelledby` to its `<div id="masthead">`, and `MastheadTitle` passes `id` to its `<p>`.

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

- 1e26a74: The Navbar's mobile menu, below `xl:` (1280px), now manages focus as the library's Dialog does, and its toggle says whether the menu is open. Keyboard and screen-reader users could start partway down the menu, never reach the toggle while the menu was open, and lose their place when it closed.

  - **The toggle is named "Menu", open or closed.** NavbarAction's toggle was named "Open navigation menu" while the menu was closed and "Close navigation menu" while it was open, and that name was its only sign of the menu's state. It now has `aria-expanded`, `"false"` or `"true"`, and, while the menu is open, `aria-controls` naming the menu. An `aria-label` on NavbarAction still renames it, for example `aria-label="Navigasi"`, and screen readers now still hear whether the menu is open.
  - **Opening the menu focuses its first item.** Enter, Space, a click or a tap on the toggle focuses the menu's first item, whatever kind of control it is. Before, focus skipped the menu's links and landed on its first other control, such as a NavbarMenuDropdown's trigger. In a menu of links only, it landed on the menu's panel, which has no width, so no focus showed.
  - **Tab and Shift+Tab cycle through the menu's items and the toggle.** Before, they looped through the items and never reached the toggle. An open dropdown's links are in the cycle: with a dropdown open last in the menu, Tab skipped its last link. The header's other controls and the page stay out of the cycle while the menu is open, as before.
  - **Closing the menu leaves focus on the toggle.** Escape, a press on the overlay and the toggle each close the menu and leave focus on the toggle. Before, focus fell to `<body>`, so the next Tab started again at the top of the page. With a dropdown open, the first Escape still closes only the dropdown. A press on a control elsewhere on the page still closes the menu and leaves focus on that control.
  - **A press in the menu's padding leaves focus where it was.** Before, it moved focus to the menu's panel.

  **If you upgrade:** update tests that select the toggle by its old names, such as `getByRole("button", { name: "Open navigation menu" })`. Select it by the name "Menu", and read whether the menu is open from `aria-expanded`.

  NavbarAction's props don't change. Its `onClick` is still called, with no arguments, on every press of the toggle, and not when the menu closes in another way. The server-rendered HTML changes only in the toggle's `aria-label` and its new `aria-expanded="false"`. From `xl:` up, nothing changes.

  The docs (EN/MS) give the toggle's new name, say that screen readers hear whether the menu is open even after an `aria-label` renames it, and describe the menu's keyboard use.

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

- a47cd61: You can now rename the Navbar menu's `<nav>` landmark in your site's language. Screen readers announced it as "Main", in English, and no prop changed it.

  - **New `aria-label` and `aria-labelledby` props** on `NavbarMenu`. They name its `<nav>`, for example `<NavbarMenu aria-label="Utama">`. Without them it is still named "Main", which is now NavbarMenu's own documented default. Before, NavbarMenu dropped both props. It passes only these two to its `<nav>`, and an `aria-label` on `Navbar` still goes to its `<header>`.

  Nothing changes visually: the same elements, classes and icons render.

  The docs (EN/MS) give the default names of the Navbar menu's `<nav>` ("Main"), the Navbar menu toggle ("Menu"), the mobile menu's panel (also "Menu", which it takes from the toggle), the Masthead trigger ("Toggle masthead", only when it has no children; otherwise its text names it) and the Breadcrumb's `<nav>` ("breadcrumb"), and show how to rename each one with an `aria-label`.

- 7baa1a2: The docs site and Storybook load nothing from upstream's CloudFront bucket any more (ADR-0006).

  - **Develop docs.** The Navbar and Login pages (EN/MS) show the logo from `/common/logo.svg`, which the docs site serves, in their live previews; the Login page's preview renders `templates/login.tsx`. Their Code tabs use the same path, as a placeholder for your own logo.
  - **No custom image loader.** `next/image` no longer goes through one: image optimisation is off, so it still serves each image from `public/` exactly as committed, and the config no longer names the bucket as a remote image host.
  - **No `s3()`.** Every file it pointed at is in `public/`, so the guideline's demo videos name their `/design/` file directly, and Markdown images keep the path they're written with.
  - **Storybook.** The Navbar story's logo and the Article and Landing Page stories' illustration come from Storybook's own static files, under `/common/`.

  A new `upstream bucket` workflow fails any push in which a file outside the ADRs and CHANGELOGs names the bucket's host.

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

- be02fd4: Pagination's built-in accessible names keep their English defaults, and you can now rename each one in your site's language.

  - **New label props on `AutoPagination`:** `previousLabel`, `nextLabel`, `pageLabel` and `ellipsisLabel` name the previous, next and page buttons and the ellipses it renders. With `type="default"`, `previousLabel` and `nextLabel` name the icon-only buttons and default to "previous page" and "next page". With `type="simple"` or `type="full"`, they are the buttons' visible text and default to "Previous" and "Next". `pageLabel` takes a page number and defaults to `` (page) => `page ${page}` ``, and `ellipsisLabel` defaults to "More pages". For example, `previousLabel="Halaman sebelumnya"` and ``pageLabel={(n) => `Halaman ${n}`}``. None of them reaches the DOM, and every other prop still goes to the `<nav>`. A node you pass as `previous` or `next` renders as before.
  - **`aria-label` now renames the parts you render:** `PaginationPrevious`, `PaginationNext` and `PaginationNumber` overwrote an `aria-label` you passed with "previous page", "next page" and "page N". Now yours replaces the default, for example `aria-label="Halaman 3"`.
  - **Children now name `PaginationPrevious` and `PaginationNext`:** with children, they get no default name, so a button showing "Sebelumnya" is named "Sebelumnya". Children with no text, such as an icon alone, need an `aria-label`. So AutoPagination's `simple` and `full` buttons are now named "Previous" and "Next", their visible text, not "previous page" and "next page".
  - **The ellipsis is now announced:** `PaginationEllipsis`'s "More pages" sat inside `aria-hidden`, so screen readers skipped it. Now only its icon is hidden, and its children replace the text, for example `<PaginationEllipsis>Lebih banyak halaman</PaginationEllipsis>`.

  Nothing changes visually: the same elements, classes and icons render.

  The docs (EN/MS) document the default names, the new props and how to replace each name.

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

- 5b65fd4: The docs' Radio pages (EN/MS) now say that a disabled `<fieldset>` around the Radio disables its items too, with their labels and hints dimmed, and that `disabled` on a RadioButton disables just that option, as on its RadioItem. They also say that RadioHintText is marked `aria-disabled` when its RadioButton is disabled, but not in a disabled fieldset. Radio gains two Storybook stories in a disabled fieldset, one light and one dark.
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

- dce477b: Several SearchBars can now share a page. Each SearchBar generates its own id for its results panel, `SearchBarResults`, so its input's `aria-controls` names only its own bar's results. Before, every SearchBar rendered `id="search-input"` on its panel and `aria-controls="search-input"` on its input. Two SearchBars on one page, such as a header search beside a page search, duplicated the id, and both inputs pointed at the first bar's panel.

  - **Your `id` wins.** An `id` you pass `SearchBarResults` is now rendered, and that bar's input points at it while no `SearchBarResultsList` is mounted. SearchBar used to overwrite it.
  - **Your `aria-controls` wins.** An `aria-controls` you pass `SearchBarInput` now reaches the `<input>`. SearchBar used to overwrite it with `search-input`.
  - **What the input names.** Its `aria-controls` names cmdk's listbox while a `SearchBarResultsList` is mounted, else the panel, else nothing, as the entry for #204 and #369 describes.
  - **Server rendering.** Server-rendered HTML has the input collapsed, with no generated `aria-controls`, until the page hydrates, and it hydrates without a warning (#204, #369).

  The generated id comes from React's `useId()`, so don't rely on its format; it differs between React 18 and 19. Nothing changes visually: the same elements and classes render.

  **If you upgrade:** update tests, CSS or scripts that select `#search-input`. Pass your own `id` to `SearchBarResults` and select that instead.

  The docs (EN/MS) list `id` on `SearchBarResults`.

- 5b4bc2c: The docs' Select and Dropdown pages (EN/MS) now say that a disabled `<fieldset>` around the component disables it too, with `disabled` passed to a Select's Label as well so the label dims. The Dropdown pages also say that `disabled` on `DropdownTrigger` disables the menu, warn that with `asChild` a `disabled` on the child overrides it, even `false` or `undefined`, and list `disabled` in DropdownTrigger's props. Select and Dropdown each gain a Storybook story in a disabled fieldset.
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

- c920fe3: The design guideline's Skip link page (EN/MS) now puts skip links first, outside any `<header>`. It told authors to wrap skip links inside the page's `<header>`, but MYDS's Navbar renders that header after the Masthead, so a skip link inside it can't come first. Skip links still come right after `<body>`, or after the cookie banner if one is used, and never inside `<nav>`.

  The page's example link now points at its target. The example's attribute values use straight quotes instead of curly ones, and its target is `id="main-content"` instead of `id="#main-content"`, so the link's `href="#main-content"` matches it.

- 346d0de: The develop docs' Skiplink pages (EN/MS) now have an Anatomy block and a Code tab that compile, and say where `Skiplink` goes in the page. The Anatomy block and the Code tab each wrap the `Skiplink` and its `<main id="main-content" tabIndex={-1}>` target in one fragment. Before, each listed two sibling elements with no parent, so neither compiled. A new Placement section (Kedudukan on the Malay page) says to render `Skiplink` first in `<body>`, right after the `CookieBanner` if the page shows one, outside any `<header>` and `<nav>`, and to give the `<main>` it points at `tabIndex={-1}`. It shows the page frame and links to the design guideline's Skip link page. On the Malay page, the skip link reads "Langkau ke kandungan utama" in the preview, the code and the new section.

  The Malay Accessibility page now calls a skip link "pautan langkau", as the design guideline's Malay page does, in place of "pautan lompat". Its page layout example's link text is "Langkau ke kandungan utama".

  Every skip-link example in the docs now gives its `<main id="main-content">` target `tabIndex={-1}`, as the design guideline asks: the Accessibility page's page layout example and the CookieBanner page's Placement example (EN/MS) gained it.

- eef221c: The design guideline's Summary list page (EN/MS) now describes the table markup the library uses. It said the summary list used `<dt>` and `<dd>` elements, but the library renders a `<table>`, one row per key-value pair. The key is now the row's header (`<th scope="row">`), and the value and the optional actions are cells (`<td>`). Each part's purpose, the mention of the Table component's style and the three numbered parts, which match the anatomy image, are unchanged.
- 3b1c9d5: `SummaryListHeader` now renders an `<h2>` by default instead of an `<h1>`, so a summary list no longer adds a second `<h1>` to a page that has its own, and `asChild` lets its title take the level the page's outline needs. Before, a page with its own `<h1>` and two summary lists had three.

  - **`asChild` chooses the heading.** Pass `asChild` and your own heading to give the title the level your page needs, e.g. `<SummaryListHeader asChild><h3>Applicant Details</h3></SummaryListHeader>` for a summary list in an `<h2>` section. Your heading gets the header's classes. To restyle the title, pass `className` to `SummaryListHeader`, which merges your classes with its own; with `asChild`, the classes on your heading are added after the header's without that merge.
  - **A forwarded ref.** A ref on `SummaryListHeader` is the heading it renders: the `<h2>`, or your heading with `asChild`. On React 18 it used to be dropped, with React's "Function components cannot be given refs" warning.
  - **Nothing else changes.** The same classes render, so the title looks as before unless your CSS styles headings by element. Its props are now typed as an `<h2>`'s, with `asChild`; code written against the old `<div>` props, refs and event handlers included, still compiles. The other SummaryList parts are unchanged.

  **To migrate:**

  - Update tests or CSS that select the header as `h1`, or with `getByRole('heading', { level: 1 })`.
  - Check pages whose CSS styles `h2` differently from `h1`. Inside a Tailwind Typography `prose` container, for example, the title now takes prose's `h2` margins, 40px above it at its size. Add `not-prose` to the header (`<SummaryListHeader className="not-prose">`) to keep its spacing.
  - To keep an `<h1>`, write `<SummaryListHeader asChild><h1>…</h1></SummaryListHeader>`.

  The docs (EN/MS) say the header is an `<h2>` by default, show `asChild` with an `<h3>`, and list `asChild` in its props. In Storybook, a new story renders it as an `<h3>` under an `<h2>`.

- 73ac5f4: `SummaryList`, `SummaryListBody`, `SummaryListRow`, `SummaryListTerm`, `SummaryListDetail`, `SummaryListAction` and `SummaryListAddition` now forward their refs, so a ref on them works on React 18. Before, React 18 dropped it: an object ref stayed `null` and a callback ref was never called. In development React warned "Function components cannot be given refs"; in production it said nothing. React 19 already passed the ref on, and still does.

  Each ref is the element the part renders: the list's `<div>`, the body's `<table>` (not the `<tbody>` inside it), the row's `<tr>`, the term's `<th>`, and the detail's, the action's and the addition's `<td>`. `SummaryListHeader` already forwarded its ref.

  Nothing else changes. The parts render the same markup, and their props types are the same. Each export's type is now a `ForwardRefExoticComponent` over those props, as Table's parts are, and code that assigns one to its old `FunctionComponent` type still compiles.

  The docs (EN/MS) say each part forwards its `ref`, and that `SummaryListBody`'s is its `<table>`.

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

- a02e65c: The docs and Storybook now name each summary list's table from its header, and show authors how to do the same. `SummaryListBody`'s `<table>` has no accessible name of its own, and the `SummaryListHeader` before it doesn't name it, so a screen reader user moving between a page's tables, or listing them, reached a table with no name.

  - **The docs (EN/MS).** The main example gives the header an `id` and passes it to `SummaryListBody`'s `aria-labelledby`, in its code and its preview, and the `asChild` example's code does the same with its `<h3>`. A note under `SummaryListBody` says how to name the table: point `aria-labelledby` at the header's `id`, which goes on your own heading with `asChild`; use `aria-label` only when no visible title names the table; make each id with `useId()` where a list renders more than once; and don't put a `<caption>` in the body. Its example passes an `aria-label`, and its props list `aria-labelledby` and `aria-label`.
  - **Storybook.** Every SummaryList story names its table from its header, with an id from `useId()`, so no id repeats on the docs page.

  `@amerfathullah/myds-react` doesn't change: `SummaryListHeader` already passes `id` to its heading, and `SummaryListBody` passes `aria-label` and `aria-labelledby` to its `<table>`.

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

- 5057e46: The theme files now set the browser's `color-scheme`, `light` on `:root` and `dark` on `.dark`, so the browser draws its own parts to match the theme. Nothing set it before, so in the dark theme the browser drew them as it does for a light page. Both entries carry the change, the Tailwind import and `full.css`, and so do the standalone `light.css` and `dark.css`.

  - **Inside `.dark`, on `<html>` or on a subtree, the browser draws its own parts dark:** scrollbars, number spinners, the pickers of native date and time inputs, and native form controls in your own markup, such as checkboxes and range sliders. MYDS's Checkbox, Radio and Select draw no native control, so they look the same.
  - **The browser's focus ring is drawn for a dark page** on your own links and buttons that have no focus style of their own. It was drawn for a light page, so its dark inner line almost vanished in the dark theme.
  - **On a dark root,** with `.dark` on `<html>`, three things change. `bg-bg-white text-txt-black-900` on `<body>` avoids the first two:
    - Where nothing colours `<html>` or `<body>`, the page shows the browser's dark canvas, which isn't MYDS's dark background.
    - Text with no colour of its own turns white instead of black.
    - An iframe whose document doesn't declare dark shows an opaque light canvas instead of a transparent one.
  - **In the light theme, an app's `<meta name="color-scheme">` no longer decides the scheme:** the root computes `light`. With `<meta name="color-scheme" content="light dark">` on a dark OS, scrollbars and form controls were dark and default text was white. They're now light, and default text is black.
  - **To override it,** put a Tailwind `scheme-*` utility, such as `scheme-light`, on `<html>` or on a `.dark` element, or set `color-scheme` in an inline style or in a rule of your own outside any layer. MYDS sets it in `@layer base`, so each of these wins.

  Only `.dark` sets `dark`. Under a custom theme class, such as `system`, the root keeps `light` unless you set `color-scheme` for that class. `.dark` wins on `<html>` only because `dark.css` comes after `light.css`, as both entries already import them, so keep that order if you import the standalone files. ThemeProvider and `getThemeScript` don't change.

  The docs (EN/MS) say, in Style Configuration's Theme section, that the theme files set `color-scheme`, that `light.css` comes before `dark.css`, and to put `.dark` on `<html>` and colour `<body>` with the theme's tokens. In ThemeSwitch's Custom Themes, they say that a custom theme class keeps `light`.

- 93e922c: `setTheme` outside a ThemeProvider, from a ThemeSwitch with no provider above it or from an app's own `useTheme()`, now logs one console warning per page, where it used to fail silently. The theme still doesn't change. Rendering a ThemeSwitch logs nothing: only a click, a choice or a call to `setTheme` does. The warning says `setTheme("dark")` (with the theme it was given) was called outside a ThemeProvider. To fix it, wrap the app in one ThemeProvider from `@amerfathullah/myds-react/hooks`, above every ThemeSwitch and `useTheme` call, or feed `ThemeContext.Provider` from your own theme state or another theme library. Test suites that fail on console output, and click a ThemeSwitch with no provider above it, will see the warning.

  The ThemeSwitch and useTheme develop pages (EN/MS) say so in the callouts that tell you to wrap the app in ThemeProvider.

- 5368d8a: The Navbar develop page's first Code tab and the Login develop page's "Render Page" block (EN/MS) now wrap `ThemeSwitch` in one `ThemeProvider` from `@amerfathullah/myds-react/hooks`, so copying them gives a switch that changes the theme. Before, neither had a provider, and a `ThemeSwitch` with no `ThemeProvider` above it never changes the theme. "Render Page" says in a comment to leave its provider out if the app already has one at its root. The Navbar Action sample and `LoginTemplate` say in a comment that `ThemeSwitch` needs one `ThemeProvider` at the app's root. They get no provider of their own, so an app with one at its root doesn't get a second. The Login page no longer lists dark/light mode toggling as logic the template lacks, and its Customization section no longer names the toggle among the components to wire up.

  The Navbar stories in Storybook render under one `ThemeProvider`, so their toggle changes the theme.

- 0efbfe7: ThemeSwitch now shows and names a theme it doesn't list. Before, when ThemeProvider's theme wasn't one of a ThemeSwitch's `themes`, the toggle was an empty, unnamed button that screen readers announced as just "button", and the select's value was blank. That happens with `<ThemeProvider defaultTheme="system">` and a default ThemeSwitch, or when System is chosen in another switch.

  - **New `toggleLabel` prop,** defaulting to "Theme". It names the toggle while the provider's theme isn't one of its `themes`, and the toggle shows a monitor icon (`DesktopIcon`), styled like the theme icons. Set it in your site's language, for example `toggleLabel="Tema"`. It never reaches the DOM, and it never names the select, which keeps `selectLabel`.
  - **The select shows the monitor icon alone** while its value isn't one of its `themes`. It shows no text, which screen readers would read after its name as "Theme, Theme". None of its options is marked selected.
  - **A one-theme switch now switches to its theme.** From a theme it doesn't list, a click on the toggle goes to the first of its `themes`, as a switch with two or more already did. A switch with only one theme ignored every click and choice; now a click or a choice switches to that theme and calls `onChange` with it. Once it's on that theme, a click does nothing.

  Nothing changes for a theme the switch lists: the toggle is named by its `label` and shows its icon, and the select shows both.

  The docs (EN/MS) and Storybook's controls document `toggleLabel`.

- 3935cb9: The Toast develop pages (EN/MS) show code you can copy as it is. The first Code tab shows what its Preview does: a button that publishes a toast with `useToast().toast()`, and an `AutoToast` that shows it. Advanced Usage is a complete toaster composed from the toast's parts, `ToastIcon` and `ToastProgress` among them, that shows each toast `toast()` publishes. Both, and the Anatomy block, open with `"use client"` and import everything they use. Before, they used `ToastClose`, `toasts`, `props`, `toast()` and `useEffect` without importing or defining them, and imported `ToastIcon` and `ToastProgress`, which weren't exported. The Malay page has one Anatomi block, which now parses, where the English page has its Anatomy block. The props section documents `ToastIcon` and `ToastProgress`.

  The Toast story's Usage block in Storybook shows the same two samples.

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

- Updated dependencies [095eb25]
- Updated dependencies [248a593]
- Updated dependencies [337ddbe]
- Updated dependencies [8b4f54a]
- Updated dependencies [94e4e68]
- Updated dependencies [73ae476]
- Updated dependencies [9859bd4]
- Updated dependencies [f6d8bf8]
- Updated dependencies [c7723da]
- Updated dependencies [e62a54d]
- Updated dependencies [abad11c]
- Updated dependencies [a350f9b]
- Updated dependencies [9472d1b]
- Updated dependencies [91f81f3]
- Updated dependencies [697b46f]
- Updated dependencies [8e41f09]
- Updated dependencies [23c9bc0]
- Updated dependencies [1afbb83]
- Updated dependencies [9cc1a9f]
- Updated dependencies [496cf6e]
- Updated dependencies [db9cc57]
- Updated dependencies [59fd000]
- Updated dependencies [02b360f]
- Updated dependencies [bd661d3]
- Updated dependencies [6e3979f]
- Updated dependencies [f60b247]
- Updated dependencies [48c1ad8]
- Updated dependencies [7dfcd6d]
- Updated dependencies [75f291e]
- Updated dependencies [efe0620]
- Updated dependencies [2e872fb]
- Updated dependencies [a0d594f]
- Updated dependencies [0e682dc]
- Updated dependencies [0f2e20c]
- Updated dependencies [032f281]
- Updated dependencies [46d3d9e]
- Updated dependencies [3d924cc]
- Updated dependencies [8a69b5f]
- Updated dependencies [a4c05a6]
- Updated dependencies [737eea1]
- Updated dependencies [6d0d3b0]
- Updated dependencies [73321a8]
- Updated dependencies [4d9f843]
- Updated dependencies [499cf29]
- Updated dependencies [626d987]
- Updated dependencies [ef48a3a]
- Updated dependencies [1e26a74]
- Updated dependencies [1afef8a]
- Updated dependencies [a47cd61]
- Updated dependencies [099bc3a]
- Updated dependencies [09a9ad2]
- Updated dependencies [65815bd]
- Updated dependencies [193d8b1]
- Updated dependencies [be02fd4]
- Updated dependencies [2f1dcbd]
- Updated dependencies [5fd6cd3]
- Updated dependencies [5b65fd4]
- Updated dependencies [dead670]
- Updated dependencies [7baa1a2]
- Updated dependencies [c87bdef]
- Updated dependencies [ee9b229]
- Updated dependencies [75be647]
- Updated dependencies [65d5194]
- Updated dependencies [e0f307d]
- Updated dependencies [1b25edc]
- Updated dependencies [f60f853]
- Updated dependencies [f73a96d]
- Updated dependencies [5fbf505]
- Updated dependencies [dce477b]
- Updated dependencies [b38270e]
- Updated dependencies [5bfa2bc]
- Updated dependencies [62127ab]
- Updated dependencies [5b4bc2c]
- Updated dependencies [803fcb0]
- Updated dependencies [ba4baf7]
- Updated dependencies [f2a8536]
- Updated dependencies [548ec9d]
- Updated dependencies [016c018]
- Updated dependencies [40cf7ef]
- Updated dependencies [7b808b2]
- Updated dependencies [c9fe45b]
- Updated dependencies [cae6623]
- Updated dependencies [a5002a3]
- Updated dependencies [0f1a7ca]
- Updated dependencies [3b1c9d5]
- Updated dependencies [73ac5f4]
- Updated dependencies [cda3853]
- Updated dependencies [6e2ff6c]
- Updated dependencies [fa92e36]
- Updated dependencies [5057e46]
- Updated dependencies [ed151c9]
- Updated dependencies [93e922c]
- Updated dependencies [0efbfe7]
- Updated dependencies [3935cb9]
- Updated dependencies [0752301]
- Updated dependencies [0868970]
  - @amerfathullah/myds-react@2.1.0
  - @amerfathullah/myds-style@2.1.0

## 1.0.4

### Patch Changes

- Updated dependencies [e8bc6e6]
  - @amerfathullah/myds-react@2.0.1
  - @amerfathullah/myds-style@2.0.1

## 1.0.3

### Patch Changes

- b6abdbc: upgrade `next` to 14.2.35 for security fixes backported to Next.js 14
- fca197a: Add `TimeField` (`@amerfathullah/myds-react/time-field`), a native `<input type="time">` that matches `DateField` in every size and state, with a decorative clock icon. `step` (seconds) defaults to `60`, so it shows hours and minutes; 12/24-hour display follows the user's locale. It renders no id of its own: name it with a `Label` (`htmlFor`). `ClockIcon` loses its unused Figma ids. The docs add a TimeField page (EN/MS) with a "Time slots" section showing the `Select` pattern for booking from fixed availability.
- 3f92068: Add `Skeleton` (`@amerfathullah/myds-react/skeleton`), a loading placeholder with a `shape` of `line` (default), `circle` or `block`. It is always `aria-hidden` and stops shimmering under `prefers-reduced-motion`, showing a flat `bg-black-100` fill. `TableSkeleton` is now a `line` Skeleton: its API and animated look are unchanged, and it gains the `aria-hidden` and reduced-motion behaviour.
- 382b4a5: `Footer` no longer breaks landmark and heading rules: it nests no complementary landmark, each link group is a navigation landmark named after its title, and a string group title is no longer a heading. The footer looks the same. `SiteInfo` and `SiteLinkGroup` render different elements, and their prop types change with them:

  - `SiteInfo` renders a `<div>` in place of an `<aside>`. Its props are `div` props, so its ref is an `HTMLDivElement`: a `RefObject<HTMLElement>` no longer type-checks. Update CSS or tests that select the `aside`.
  - `SiteLinkGroup` renders one `<nav>` holding the title and the links, in place of a `<div>` wrapping the title and a `<nav>`. Its props are `nav` props, so its ref is an `HTMLElement`. Props, `className` and `ref` apply to the `<nav>` only; they used to land on both elements, which duplicated an `id` or `aria-label`. `className` no longer reaches the grid that lays out the links.
  - A string `groupTitle` renders as text (a `<div>`) in place of an `<h6>`, and names the group's `<nav>` through `aria-labelledby`, unless you pass an `aria-label`. Give each group a distinct title, so each navigation landmark has a unique name. To keep a heading, pass your own element as `groupTitle` and name the navigation yourself, e.g. `groupTitle={<h2 id="services-title">Services</h2>}` with `aria-labelledby="services-title"`.

  The docs Footer page (EN/MS) describes the new elements and gives each example link group its own title.

- b34ece5: `ThemeSwitch` with `as="select"` now gives its trigger an accessible name, so screen readers announce "Theme" followed by the current theme instead of an unnamed combobox. Set the new `selectLabel` prop to name it in your site's language, for example `selectLabel="Tema"`. The toggle form is unchanged and still takes its name from the current theme's `label`. The docs (EN/MS) document `selectLabel`.
- eb696b5: Remove the "transistory assistance" (HTML/CSS) section from the developer docs: its EN/MS pages and nav entries, the `ta-preview` public assets and the `IframeThemePreview` component. Per ADR-0003, MYDS ships React on the Tailwind preset only. The Installation page (EN/MS) now has a "Not Using React?" note pointing other stacks to the Tailwind preset and DESIGN.md.
- 56b9af8: Load MYDS through the Tailwind 4 `@amerfathullah/myds-style` import. The docs and standard sites drop `@config`, their `tailwind.config.ts` and their own Fumadocs colour mapping for `@amerfathullah/myds-style/fumadocs.css`, and the placeholder and button-cursor defaults now come from the package's preflight additions. Storybook moves from Tailwind 3 to Tailwind 4 through `@tailwindcss/vite`. The docs' Style Configuration page (EN/MS) shows the Tailwind 4 setup.
- 839fbb4: MYDS is now published as `@amerfathullah/myds-react` and `@amerfathullah/myds-style`, continuing `@govtechmy/myds-*` 1.x under names this repository can publish. The migration guide's first step covers the switch. The docs, standard site and Storybook import the new names, and the docs installation pages install them.
- 2481545: `DateField` no longer renders a hardcoded `id="date-field"`; its calendar icon is now decorative (`aria-hidden`) and no longer adds an English-only "Select date" to the input's accessible name. Name the field with a `Label` (`htmlFor`) and pass the matching `id`. If you targeted `#date-field` (e.g. `<label htmlFor="date-field">`), pass `id="date-field"` explicitly.
- 327d985: Move the docs and standard sites to Next.js 16, React 19, Fumadocs 16 (fumadocs-mdx 15) and Tailwind 4, with every other dependency on its latest stable release. Locale routing runs in `proxy.ts`, route `params` are awaited, search is per locale, and the standard site now lints with ESLint. Each site's `app/global.css` is the Tailwind 4 entry point: it loads the MYDS v1 preset through `@config`, maps the former `preset_fumadocs` colours onto Fumadocs 16's theme variables, and scans `@amerfathullah/myds-react` with `@source`. Google Fonts load from `<link>` tags, since Turbopack drops remote CSS imports. Fumadocs `<Tabs items>` in MDX no longer pass `defaultValue`: Fumadocs 13 ignored it, and Fumadocs 16 would select no tab.
- bf2e232: Replace the "Work In Progress" Contact Us template page (EN/MS) with the full template from [upstream PR #346](https://redirect.github.com/govtechmy/myds/pull/346): a live `ContactUsTemplate` preview, copyable code importing only from `@amerfathullah/myds-react/*`, anatomy and customisation notes. The template's styling now uses MYDS tokens (`otl-*` outlines, `bg-*` surfaces, `txt-*` text, `text-body-*` and `font-heading` with `text-heading-*`, `shadow-card`) in place of class names Tailwind never generated. The Malay Login page is titled "Log Masuk", and the Malay Forgot Password page says "lupa kata laluan" throughout. The docs Tailwind config now scans `templates/`.
- Updated dependencies [fca197a]
- Updated dependencies [3f92068]
- Updated dependencies [382b4a5]
- Updated dependencies [b34ece5]
- Updated dependencies [56b9af8]
- Updated dependencies [56b9af8]
- Updated dependencies [839fbb4]
- Updated dependencies [2481545]
- Updated dependencies [f488281]
- Updated dependencies [f488281]
- Updated dependencies [d9b8018]
  - @amerfathullah/myds-react@2.0.0
  - @amerfathullah/myds-style@2.0.0

## 1.0.2

### Patch Changes

- 4259c83: standardise `Masthead`, `Navbar` and container padding
- Updated dependencies [4259c83]
  - @govtechmy/myds-react@1.0.2

## 1.0.1

### Patch Changes

- Updated dependencies [2673812]
  - @govtechmy/myds-react@1.0.1

## 1.0.0

### Major Changes

- :q
- Fix patch tailwind
- ee2d39a: :q

### Patch Changes

- Updated dependencies
- Updated dependencies
- Updated dependencies [ee2d39a]
  - @govtechmy/myds-react@1.0.0
  - @govtechmy/myds-style@1.0.0

## 0.0.26

### Patch Changes

- a408a73: UI:Icon Docs - Fix: Hover did not display copy icon
- 9f5f069: Fix: Bug - Wrong timeline order in "Our Plan" while in portrait (mobile) bug
- Updated dependencies [d2e231e]
  - @govtechmy/myds-react@0.0.24

## 0.0.25

### Patch Changes

- Updated dependencies [348f449]
  - @govtechmy/myds-react@0.0.23

## 0.0.24

### Patch Changes

- 0396a22: adding icon docs
- Updated dependencies [c6a904f]
  - @govtechmy/myds-react@0.0.22
  - @govtechmy/myds-style@0.0.10

## 0.0.23

### Patch Changes

- Updated dependencies [e71f6dc]
  - @govtechmy/myds-react@0.0.21

## 0.0.22

### Patch Changes

- d92931f: Added accessibility testing docs, and fix linting issues.
- Updated dependencies [d92931f]
- Updated dependencies [d897cd3]
  - @govtechmy/myds-react@0.0.20

## 0.0.21

### Patch Changes

- Updated dependencies [02810f0]
- Updated dependencies [fe0b3be]
- Updated dependencies [b73a362]
  - @govtechmy/myds-react@0.0.19

## 0.0.20

### Patch Changes

- Updated dependencies [2558fb8]
  - @govtechmy/myds-react@0.0.18
  - @govtechmy/myds-style@0.0.9

## 0.0.19

### Patch Changes

- Updated dependencies [1ae118c]
- Updated dependencies [6fe6aa7]
- Updated dependencies [8ec3c92]
- Updated dependencies [2f311ad]
- Updated dependencies [105565f]
- Updated dependencies [263f775]
  - @govtechmy/myds-react@0.0.17
  - @govtechmy/myds-style@0.0.8

## 0.0.18

### Patch Changes

- 27d8b4a: Improve the accessibility of the landing page.
- Updated dependencies [07e9ffb]
  - @govtechmy/myds-react@0.0.16
  - @govtechmy/myds-style@0.0.7

## 0.0.17

### Patch Changes

- 8e8d0d9: Modify Footer docs to reflect the latest change.
- 3dd63a8: Added usePagination hook docs
- 21dd39c: Added useToast hook docs
- Updated dependencies [9d51bae]
- Updated dependencies [353589f]
  - @govtechmy/myds-react@0.0.15
  - @govtechmy/myds-style@0.0.6

## 0.0.16

### Patch Changes

- 43a94da: Added Accessibility guide for Developers
- Updated dependencies [7964da7]
  - @govtechmy/myds-style@0.0.5

## 0.0.15

### Patch Changes

- Updated dependencies [4ce2d50]
  - @govtechmy/myds-react@0.0.14

## 0.0.14

### Patch Changes

- e267c3c: Added docs for Design > Motion
- Updated dependencies [40b8a2b]
- Updated dependencies [d4ed3ec]
  - @govtechmy/myds-react@0.0.13

## 0.0.13

### Patch Changes

- 7eeb60d: Added ThemeSwitch docs
- Updated dependencies [7eeb60d]
- Updated dependencies [57bebb9]
  - @govtechmy/myds-react@0.0.12

## 0.0.12

### Patch Changes

- Updated dependencies [6ddcc13]
- Updated dependencies [6ddcc13]
- Updated dependencies [6956a40]
  - @govtechmy/myds-style@0.0.4
  - @govtechmy/myds-react@0.0.11

## 0.0.11

### Patch Changes

- Updated dependencies [1f49811]
  - @govtechmy/myds-react@0.0.10

## 0.0.10

### Patch Changes

- Updated dependencies [f50b423]
- Updated dependencies [2f6d05d]
  - @govtechmy/myds-react@0.0.9

## 0.0.9

### Patch Changes

- a61fba9: Add `hideClose` prop to DialogBody
- Updated dependencies [a61fba9]
- Updated dependencies [26ed81e]
- Updated dependencies [c45e030]
  - @govtechmy/myds-react@0.0.8

## 0.0.8

### Patch Changes

- c813d43: Added documentation in English and Bahasa Melayu for Pagination component.
- Updated dependencies [3d24986]
  - @govtechmy/myds-react@0.0.7

## 0.0.7

### Patch Changes

- 585e752: Added documentation for Tooltip.
- 2a8476b: Add CONTRIBUTING.md and update installation docs
- Updated dependencies [c309fd9]
- Updated dependencies [3c99cca]
  - @govtechmy/myds-react@0.0.6

## 0.0.6

### Patch Changes

- 6308c64: Add docs for `Radio` component
- d7d6d2c: Added documentation for Tabs component for both langugages.
- 066de70: Add docs for SearchBar
- 41d207f: Add docs for `InputOTP` component
- Updated dependencies [475d3c6]
- Updated dependencies [2c925c1]
- Updated dependencies [2efcf8e]
- Updated dependencies [3535a3d]
  - @govtechmy/myds-react@0.0.5

## 0.0.5

### Patch Changes

- 6e4317e: Documentation for Dialog & Alert Dialog
- 8a0cb3b: Add CalloutClose wrapper component
- c0f469a: DropdownTrigger converted to full wrapper
  Documentation for Dropdown
- Updated dependencies [1a9e476]
- Updated dependencies [6181ab0]
- Updated dependencies [650a846]
- Updated dependencies [7711524]
- Updated dependencies [6e4317e]
- Updated dependencies [3495d7f]
- Updated dependencies [0903c8f]
- Updated dependencies [6e4317e]
- Updated dependencies [8a0cb3b]
- Updated dependencies [c0f469a]
- Updated dependencies [6e4317e]
  - @govtechmy/myds-react@0.0.4

## 0.0.4

### Patch Changes

- Updated dependencies [a973f87]
- Updated dependencies [a973f87]
  - @govtechmy/myds-react@0.0.3

## 0.0.3

### Patch Changes

- Updated dependencies [97ed561]
  - @govtechmy/myds-style@0.0.3

## 0.0.2

### Patch Changes

- Updated dependencies [23aa39e]
- Updated dependencies [23aa39e]
  - @govtechmy/myds-react@0.0.2
  - @govtechmy/myds-style@0.0.2

## 0.0.1

### Patch Changes

- Updated dependencies [eeb6bd4]
  - @govtechmy/myds-style@0.0.1
  - @govtechmy/myds-react@0.0.1

## 0.0.1-beta.0

### Patch Changes

- Updated dependencies
  - @govtechmy/myds-style@0.0.1-beta.0
  - @govtechmy/myds-react@0.0.1-beta.0
