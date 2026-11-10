# @govtechmy/myds-docs

## 1.0.5

### Patch Changes

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

- 502938b: The docs site's own images are now served from the docs site itself, not from upstream's CloudFront bucket (ADR-0006). Its 22 files under `/common/` (the hero, the home page's preview illustrations and "about" icons, the `-dark` copy of each, the logo and the Jata Negara) are copied unchanged into `public/common`, at the paths the pages and components already use, so none of them changes. The locale redirect leaves `/common/` alone, and the image loader serves it from `public/`, as they do `/design/`. `check-design-files` now also fails when a docs page or component references a file under `/common/` that the repository doesn't hold, counting the `-dark` copy that `darkify()` requests for each preview illustration and "about" icon.
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

- 02b360f: The docs' DatePicker and DateRangePicker pages (EN/MS) now say that `true` disables the whole picker, and any other Matcher, or an array of Matchers, only the days it matches, and that a disabled `<fieldset>` around the picker disables it too, with `disabled` passed to its Label as well so the label dims. Both pickers' `disabled` descriptions in Storybook say the same.
- ed7f54e: The design guideline's images and videos are now served from the docs site itself, not from upstream's CloudFront bucket (ADR-0006). Its 444 files under `/design/` (the Markdown images and the `-dark` copy of each, the `<Image>` files and the demo videos) are copied unchanged into `public/design`, at the paths the pages already use, so no page changes. The locale redirect leaves `/design/` alone, as it does `/assets/`, and the build reads each Markdown image's size from `public/`. Any other path, such as the site's own `/common/` assets, still loads from the bucket. A new `docs` workflow runs `check-design-files`, which fails when a guideline page references a file under `/design/` that the repository doesn't hold.
- 7dfcd6d: The docs' DateField and TimeField pages (EN/MS) now say that a disabled `<fieldset>` around the field disables it too, and DateField and TimeField each gain a Storybook story of the field in a disabled fieldset.
- 7b427c3: The docs and standard sites and Storybook now take the scroll, focus and underline rules from `@amerfathullah/myds-style`. Storybook drops its own copies of them, the box-sizing pair included, so stories render as an app on the Tailwind import does. The docs and standard sites set `html { scroll-padding-top: 0 }`, so a Fumadocs heading still lands 112px from the top (its `scroll-m-28`) rather than 177px. They also drop their own unconditional smooth scrolling, so they scroll smoothly only when the user hasn't asked for reduced motion.
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

  The docs (EN/MS) give the default names of the Navbar menu's `<nav>` ("Main"), the Navbar menu toggle ("Open navigation menu" / "Close navigation menu"), the Masthead trigger ("Toggle masthead") and the Breadcrumb's `<nav>` ("breadcrumb"), and show how to rename each one with an `aria-label`. The Masthead examples pass an `aria-label` that matches the trigger's visible text.

- 7baa1a2: The docs site and Storybook load nothing from upstream's CloudFront bucket any more (ADR-0006).

  - **Develop docs.** The Navbar and Login pages (EN/MS) show the logo from `/common/logo.svg`, which the docs site serves, in their live previews; the Login page's preview renders `templates/login.tsx`. Their Code tabs use the same path, as a placeholder for your own logo.
  - **No custom image loader.** `next/image` no longer goes through one: image optimisation is off, so it still serves each image from `public/` exactly as committed, and the config no longer names the bucket as a remote image host.
  - **No `s3()`.** Every file it pointed at is in `public/`, so the guideline's demo videos name their `/design/` file directly, and Markdown images keep the path they're written with.
  - **Storybook.** The Navbar story's logo and the Article and Landing Page stories' illustration come from Storybook's own static files, under `/common/`.

  A new `upstream bucket` workflow fails any push in which a file outside the ADRs and CHANGELOGs names the bucket's host.

- be02fd4: Pagination's built-in accessible names keep their English defaults, and you can now rename each one in your site's language.

  - **New label props on `AutoPagination`:** `previousLabel`, `nextLabel`, `pageLabel` and `ellipsisLabel` name the previous, next and page buttons and the ellipses it renders. With `type="default"`, `previousLabel` and `nextLabel` name the icon-only buttons and default to "previous page" and "next page". With `type="simple"` or `type="full"`, they are the buttons' visible text and default to "Previous" and "Next". `pageLabel` takes a page number and defaults to `` (page) => `page ${page}` ``, and `ellipsisLabel` defaults to "More pages". For example, `previousLabel="Halaman sebelumnya"` and ``pageLabel={(n) => `Halaman ${n}`}``. None of them reaches the DOM, and every other prop still goes to the `<nav>`. A node you pass as `previous` or `next` renders as before.
  - **`aria-label` now renames the parts you render:** `PaginationPrevious`, `PaginationNext` and `PaginationNumber` overwrote an `aria-label` you passed with "previous page", "next page" and "page N". Now yours replaces the default, for example `aria-label="Halaman 3"`.
  - **Children now name `PaginationPrevious` and `PaginationNext`:** with children, they get no default name, so a button showing "Sebelumnya" is named "Sebelumnya". Children with no text, such as an icon alone, need an `aria-label`. So AutoPagination's `simple` and `full` buttons are now named "Previous" and "Next", their visible text, not "previous page" and "next page".
  - **The ellipsis is now announced:** `PaginationEllipsis`'s "More pages" sat inside `aria-hidden`, so screen readers skipped it. Now only its icon is hidden, and its children replace the text, for example `<PaginationEllipsis>Lebih banyak halaman</PaginationEllipsis>`.

  Nothing changes visually: the same elements, classes and icons render.

  The docs (EN/MS) document the default names, the new props and how to replace each name.

- dce477b: Several SearchBars can now share a page. Each SearchBar generates its own id for its results panel, `SearchBarResults`, and points its input's `aria-controls` at it. Before, every SearchBar rendered `id="search-input"` on its panel and `aria-controls="search-input"` on its input. Two SearchBars on one page, such as a header search beside a page search, duplicated the id, and both inputs pointed at the first bar's panel.

  - **Your `id` wins.** An `id` you pass `SearchBarResults` is now rendered, and that bar's input points at it. SearchBar used to overwrite it.
  - **Your `aria-controls` wins.** An `aria-controls` you pass `SearchBarInput` now reaches the `<input>`. SearchBar used to overwrite it with `search-input`.
  - **Same target.** The input still points at the results panel, which stays mounted, not at cmdk's listbox, which the documented composition mounts only when there are results.
  - **Server rendering.** Server-rendered HTML wires each input to its own panel, and hydrates without a warning. When you pass `SearchBarResults` an `id`, the server HTML still points the input at the generated id, and the input follows yours once the page hydrates.

  The generated id comes from React's `useId()`, so don't rely on its format; it differs between React 18 and 19. Nothing changes visually: the same elements and classes render.

  **If you upgrade:** update tests, CSS or scripts that select `#search-input`. Pass your own `id` to `SearchBarResults` and select that instead.

  The docs (EN/MS) list `id` on `SearchBarResults`.

- c920fe3: The design guideline's Skip link page (EN/MS) now puts skip links first, outside any `<header>`. It told authors to wrap skip links inside the page's `<header>`, but MYDS's Navbar renders that header after the Masthead, so a skip link inside it can't come first. Skip links still come right after `<body>`, or after the cookie banner if one is used, and never inside `<nav>`.

  The page's example link now points at its target. The example's attribute values use straight quotes instead of curly ones, and its target is `id="main-content"` instead of `id="#main-content"`, so the link's `href="#main-content"` matches it. The English note writes `tabindex="0"` in straight quotes, as the Malay note does.

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

- Updated dependencies [248a593]
- Updated dependencies [337ddbe]
- Updated dependencies [8b4f54a]
- Updated dependencies [9859bd4]
- Updated dependencies [c7723da]
- Updated dependencies [e62a54d]
- Updated dependencies [abad11c]
- Updated dependencies [9472d1b]
- Updated dependencies [8e41f09]
- Updated dependencies [9cc1a9f]
- Updated dependencies [59fd000]
- Updated dependencies [02b360f]
- Updated dependencies [bd661d3]
- Updated dependencies [f60b247]
- Updated dependencies [7dfcd6d]
- Updated dependencies [75f291e]
- Updated dependencies [2e872fb]
- Updated dependencies [a0d594f]
- Updated dependencies [0e682dc]
- Updated dependencies [0f2e20c]
- Updated dependencies [46d3d9e]
- Updated dependencies [3d924cc]
- Updated dependencies [8a69b5f]
- Updated dependencies [a4c05a6]
- Updated dependencies [737eea1]
- Updated dependencies [6d0d3b0]
- Updated dependencies [73321a8]
- Updated dependencies [499cf29]
- Updated dependencies [1afef8a]
- Updated dependencies [a47cd61]
- Updated dependencies [099bc3a]
- Updated dependencies [193d8b1]
- Updated dependencies [be02fd4]
- Updated dependencies [7baa1a2]
- Updated dependencies [c87bdef]
- Updated dependencies [ee9b229]
- Updated dependencies [75be647]
- Updated dependencies [f73a96d]
- Updated dependencies [dce477b]
- Updated dependencies [b38270e]
- Updated dependencies [5bfa2bc]
- Updated dependencies [62127ab]
- Updated dependencies [803fcb0]
- Updated dependencies [ba4baf7]
- Updated dependencies [f2a8536]
- Updated dependencies [548ec9d]
- Updated dependencies [016c018]
- Updated dependencies [40cf7ef]
- Updated dependencies [7b808b2]
- Updated dependencies [c9fe45b]
- Updated dependencies [3b1c9d5]
- Updated dependencies [6e2ff6c]
- Updated dependencies [ed151c9]
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
