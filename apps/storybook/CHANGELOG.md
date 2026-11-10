# @govtechmy/myds-storybook

## 1.0.5

### Patch Changes

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
- 7dfcd6d: The docs' DateField and TimeField pages (EN/MS) now say that a disabled `<fieldset>` around the field disables it too, and DateField and TimeField each gain a Storybook story of the field in a disabled fieldset.
- 7b427c3: The docs and standard sites and Storybook now take the scroll, focus and underline rules from `@amerfathullah/myds-style`. Storybook drops its own copies of them, the box-sizing pair included, so stories render as an app on the Tailwind import does. The docs and standard sites set `html { scroll-padding-top: 0 }`, so a Fumadocs heading still lands 112px from the top (its `scroll-m-28`) rather than 177px. They also drop their own unconditional smooth scrolling, so they scroll smoothly only when the user hasn't asked for reduced motion.
- 7baa1a2: The docs site and Storybook load nothing from upstream's CloudFront bucket any more (ADR-0006).

  - **Develop docs.** The Navbar and Login pages (EN/MS) show the logo from `/common/logo.svg`, which the docs site serves, in their live previews; the Login page's preview renders `templates/login.tsx`. Their Code tabs use the same path, as a placeholder for your own logo.
  - **No custom image loader.** `next/image` no longer goes through one: image optimisation is off, so it still serves each image from `public/` exactly as committed, and the config no longer names the bucket as a remote image host.
  - **No `s3()`.** Every file it pointed at is in `public/`, so the guideline's demo videos name their `/design/` file directly, and Markdown images keep the path they're written with.
  - **Storybook.** The Navbar story's logo and the Article and Landing Page stories' illustration come from Storybook's own static files, under `/common/`.

  A new `upstream bucket` workflow fails any push in which a file outside the ADRs and CHANGELOGs names the bucket's host.

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
