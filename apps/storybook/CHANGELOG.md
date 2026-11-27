# @govtechmy/myds-storybook

## 1.0.5

### Patch Changes

- 095eb25: The docs' Accordion pages (EN/MS) now say that a disabled `<fieldset>` around the Accordion disables its triggers too. Accordion gains a Storybook story in a disabled fieldset, with one item open and one closed.
- fd1d8ac: The Callout develop pages (EN/MS) show code you can copy as it is, and the Malay page says what the English one does. The Usage import brings in all five parts, `CalloutClose` among them, and `Button`, which the examples use. The opening Code tab imports `Button` too, and its preview's button says "Call to Action", as its code does. Before, the English Anatomy and the Dismissible samples that wrap their button in `CalloutClose` didn't import it, and the opening, Variant, Layout and Dismissible samples didn't import `Button`. Layout says a callout with `CalloutContent` is stacked whether or not it has an action, and its stacked preview is the success callout its Code tab shows. The Malay page now has that Layout section (Susun Atur), `CalloutClose` in its Anatomi block, and Variant comments that match the English ones, and its intro calls the component a callout. Neither page mentions a render prop on `CalloutAction`, which has none: the action sample dismisses the callout through `CalloutClose`. The Dismissible previews do what their samples do. In the basic one, only the cross dismisses, with no alert. In the action one, the action button, wrapped in `CalloutClose`, dismisses it too, and `onDismiss` alerts first. On the Malay page, the previews' buttons, the close button's name ("Tutup"), the alert and the console message are in Malay. The action button, the close button's name, the alert and the console message are the same as in its samples.

  The Callout story's Usage block in Storybook imports what it uses.

- f6d8bf8: Callout's status icon (the `<svg>` it picks by Variant) and the cross in a `dismissible` callout's close button are now hidden from assistive technology (`aria-hidden="true"`). Before, each was an image with no name: screen readers met an image that said nothing, and nothing told them the Variant. Nothing changes visually: the same elements, classes, icons and sizes render.

  - **The close button.** It's still named "Close", or by `closeLabel`. Its cross is hidden as Pill's remove cross is.
  - **Roles.** Hiding the icons changes no role: Callout is a note (`role="note"`), or the `role` you pass. CalloutTitle keeps `role="term"` and CalloutContent `role="definition"`.
  - **Nothing else changes.** Callout's props and ref types, and CalloutContext's value, are the same. An icon you import on its own, such as `InfoIcon` or `CrossIcon`, renders as before, with no `aria-hidden`.
  - **The title says the Variant.** Callout adds no text, prop or attribute for it. The icon and the colour don't reach screen readers, so the title must say it.

  **If you upgrade:**

  - Make each callout's title say its Variant, in your site's language. Its wording can say it, such as "Permohonan anda tidak dihantar", or it can start with the Variant's name, such as `<CalloutTitle>Ralat: Borang tidak dihantar</CalloutTitle>`. Where the design can't show that word, start the title with visually hidden text, `<span className="sr-only">Ralat: </span>`, instead of a visible name, never as well as one.
  - Update tests that look for an image inside a callout.

  The docs (EN/MS) say the title must say the Variant and show how. Every Callout title that was "Title" or "Tajuk" in the docs and stories now starts with its Variant's name, such as "Error: Form not sent", and so do the Dismissible previews' titles. The Storybook demo's title follows its `variant` control. The `variant` prop's descriptions in the docs and Storybook say it sets the colour and the icon, and that the title must say the Variant.

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

- 23c9bc0: DataTable's `<table>` can now be named. DataTable takes `aria-label` and `aria-labelledby`. Before, both type-checked in JSX, but DataTable dropped them without a warning, so no DataTable could be named, and screen reader users couldn't tell two tables on a page apart.

  - **They name the `<table>`.** Point `aria-labelledby` at a visible heading above the table, for example `<h2 id="pemohon">Senarai pemohon</h2>` with `aria-labelledby="pemohon"`. Where the page shows no title for the table, use `aria-label`, for example `aria-label="Senarai pemohon"`. If you pass both, `aria-labelledby` wins, as usual. The name holds while `loading` and with no rows, and server-rendered HTML carries it.
  - **There is no default name.** ADR-0008's English defaults are for controls with no text of their own, and a table's name describes your data. Without either prop, the table has no name, as before, and DataTable logs no warning.
  - **Only the `<table>` gets them.** Neither reaches the scroll wrapper or any other element. `className` still styles the scroll wrapper, as on Table. DataTable still takes no `caption`, `id`, `title` or children, so name a table with a heading and `aria-labelledby` rather than a `TableCaption`.
  - **Nothing changes visually.**

  **If you upgrade:** a non-string `aria-label` or `aria-labelledby` on DataTable, which TypeScript used to accept, is now a type error.

  The docs (EN/MS) add a section on naming the table, with a live example whose heading names it through `aria-labelledby`, and `aria-label` and `aria-labelledby` rows in DataTable's props. The page's main example names its table. Every DataTable story in Storybook names its table.

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
- 7dfcd6d: The docs' DateField and TimeField pages (EN/MS) now say that a disabled `<fieldset>` around the field disables it too, and DateField and TimeField each gain a Storybook story of the field in a disabled fieldset.
- 7b427c3: The docs and standard sites and Storybook now take the scroll, focus and underline rules from `@amerfathullah/myds-style`. Storybook drops its own copies of them, the box-sizing pair included, so stories render as an app on the Tailwind import does. The docs and standard sites set `html { scroll-padding-top: 0 }`, so a Fumadocs heading still lands 112px from the top (its `scroll-m-28`) rather than 177px. They also drop their own unconditional smooth scrolling, so they scroll smoothly only when the user hasn't asked for reduced motion.
- 32238d7: The LandingPage example story now renders the whole page frame: `Skiplink` first, then the Masthead and the Navbar, then the content `<section>` inside `<main id="main-content" tabIndex={-1}>`, then the Footer. Before, it had no skip link and no `<main>`, so keyboard users Tabbed through the Navbar to reach the content, and screen reader users had no main landmark to jump to. Now the first Tab focuses "Skip to main content", Enter moves focus to the `<main>`, and the next Tab reaches the content's button. A `play` test on the Mobile, Tablet and Desktop stories checks this.
- 7baa1a2: The docs site and Storybook load nothing from upstream's CloudFront bucket any more (ADR-0006).

  - **Develop docs.** The Navbar and Login pages (EN/MS) show the logo from `/common/logo.svg`, which the docs site serves, in their live previews; the Login page's preview renders `templates/login.tsx`. Their Code tabs use the same path, as a placeholder for your own logo.
  - **No custom image loader.** `next/image` no longer goes through one: image optimisation is off, so it still serves each image from `public/` exactly as committed, and the config no longer names the bucket as a remote image host.
  - **No `s3()`.** Every file it pointed at is in `public/`, so the guideline's demo videos name their `/design/` file directly, and Markdown images keep the path they're written with.
  - **Storybook.** The Navbar story's logo and the Article and Landing Page stories' illustration come from Storybook's own static files, under `/common/`.

  A new `upstream bucket` workflow fails any push in which a file outside the ADRs and CHANGELOGs names the bucket's host.

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

- 5b4bc2c: The docs' Select and Dropdown pages (EN/MS) now say that a disabled `<fieldset>` around the component disables it too, with `disabled` passed to a Select's Label as well so the label dims. The Dropdown pages also say that `disabled` on `DropdownTrigger` disables the menu, warn that with `asChild` a `disabled` on the child overrides it, even `false` or `undefined`, and list `disabled` in DropdownTrigger's props. Select and Dropdown each gain a Storybook story in a disabled fieldset.
- 3b1c9d5: `SummaryListHeader` now renders an `<h2>` by default instead of an `<h1>`, so a summary list no longer adds a second `<h1>` to a page that has its own, and `asChild` lets its title take the level the page's outline needs. Before, a page with its own `<h1>` and two summary lists had three.

  - **`asChild` chooses the heading.** Pass `asChild` and your own heading to give the title the level your page needs, e.g. `<SummaryListHeader asChild><h3>Applicant Details</h3></SummaryListHeader>` for a summary list in an `<h2>` section. Your heading gets the header's classes. To restyle the title, pass `className` to `SummaryListHeader`, which merges your classes with its own; with `asChild`, the classes on your heading are added after the header's without that merge.
  - **A forwarded ref.** A ref on `SummaryListHeader` is the heading it renders: the `<h2>`, or your heading with `asChild`. On React 18 it used to be dropped, with React's "Function components cannot be given refs" warning.
  - **Nothing else changes.** The same classes render, so the title looks as before unless your CSS styles headings by element. Its props are now typed as an `<h2>`'s, with `asChild`; code written against the old `<div>` props, refs and event handlers included, still compiles. The other SummaryList parts are unchanged.

  **To migrate:**

  - Update tests or CSS that select the header as `h1`, or with `getByRole('heading', { level: 1 })`.
  - Check pages whose CSS styles `h2` differently from `h1`. Inside a Tailwind Typography `prose` container, for example, the title now takes prose's `h2` margins, 40px above it at its size. Add `not-prose` to the header (`<SummaryListHeader className="not-prose">`) to keep its spacing.
  - To keep an `<h1>`, write `<SummaryListHeader asChild><h1>…</h1></SummaryListHeader>`.

  The docs (EN/MS) say the header is an `<h2>` by default, show `asChild` with an `<h3>`, and list `asChild` in its props. In Storybook, a new story renders it as an `<h3>` under an `<h2>`.

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

- 450c052: Move the Storybook app to Storybook 10, Vite 8, Jest 30 (through `@storybook/test-runner` 0.26) and React 19, with every other dependency on its latest stable release except Tailwind 3, `autoprefixer` and `postcss`. Essentials, interactions, blocks and `@storybook/test` are now part of Storybook core, with `@storybook/addon-docs` providing autodocs. Stories import from `@storybook/react-vite` and `storybook/test`. Background and viewport choices are story `globals`, which Storybook 9 and later read in place of `parameters.backgrounds.default` and `parameters.viewport.defaultViewport`.
- bd2d961: The DateField stories name the field with an `aria-label` arg, as the TimeField stories do, so they pass the accessibility check. The usage example on the DateField Storybook docs page pairs the field with a `Label` (`htmlFor` and a matching `id`), imports `DateField` by name and reads the date from the change event.
- 56b9af8: Load MYDS through the Tailwind 4 `@amerfathullah/myds-style` import. The docs and standard sites drop `@config`, their `tailwind.config.ts` and their own Fumadocs colour mapping for `@amerfathullah/myds-style/fumadocs.css`, and the placeholder and button-cursor defaults now come from the package's preflight additions. Storybook moves from Tailwind 3 to Tailwind 4 through `@tailwindcss/vite`. The docs' Style Configuration page (EN/MS) shows the Tailwind 4 setup.
- 839fbb4: MYDS is now published as `@amerfathullah/myds-react` and `@amerfathullah/myds-style`, continuing `@govtechmy/myds-*` 1.x under names this repository can publish. The migration guide's first step covers the switch. The docs, standard site and Storybook import the new names, and the docs installation pages install them.
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

- Updated dependencies [d2e231e]
  - @govtechmy/myds-react@0.0.24

## 0.0.25

### Patch Changes

- Updated dependencies [348f449]
  - @govtechmy/myds-react@0.0.23

## 0.0.24

### Patch Changes

- Updated dependencies [c6a904f]
  - @govtechmy/myds-react@0.0.22
  - @govtechmy/myds-style@0.0.10

## 0.0.23

### Patch Changes

- Updated dependencies [e71f6dc]
  - @govtechmy/myds-react@0.0.21

## 0.0.22

### Patch Changes

- d897cd3: Fix storybook components file structure
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

- Updated dependencies [07e9ffb]
  - @govtechmy/myds-react@0.0.16
  - @govtechmy/myds-style@0.0.7

## 0.0.17

### Patch Changes

- 353589f: Restructure Footer component
- Updated dependencies [9d51bae]
- Updated dependencies [353589f]
  - @govtechmy/myds-react@0.0.15
  - @govtechmy/myds-style@0.0.6

## 0.0.16

### Patch Changes

- Updated dependencies [7964da7]
  - @govtechmy/myds-style@0.0.5

## 0.0.15

### Patch Changes

- Updated dependencies [4ce2d50]
  - @govtechmy/myds-react@0.0.14

## 0.0.14

### Patch Changes

- d4ed3ec: 1. Remove asChild props from AnnounceBarDescription 2. Small refactor on AnnounceBatTag
- Updated dependencies [40b8a2b]
- Updated dependencies [d4ed3ec]
  - @govtechmy/myds-react@0.0.13

## 0.0.13

### Patch Changes

- Updated dependencies [7eeb60d]
- Updated dependencies [57bebb9]
  - @govtechmy/myds-react@0.0.12

## 0.0.12

### Patch Changes

- ced37db: Implement accessibility test on stories
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

- Updated dependencies [a61fba9]
- Updated dependencies [26ed81e]
- Updated dependencies [c45e030]
  - @govtechmy/myds-react@0.0.8

## 0.0.8

### Patch Changes

- Updated dependencies [3d24986]
  - @govtechmy/myds-react@0.0.7

## 0.0.7

### Patch Changes

- Updated dependencies [c309fd9]
- Updated dependencies [3c99cca]
  - @govtechmy/myds-react@0.0.6

## 0.0.6

### Patch Changes

- Updated dependencies [475d3c6]
- Updated dependencies [2c925c1]
- Updated dependencies [2efcf8e]
- Updated dependencies [3535a3d]
  - @govtechmy/myds-react@0.0.5

## 0.0.5

### Patch Changes

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
