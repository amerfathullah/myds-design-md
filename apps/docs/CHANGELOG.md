# @govtechmy/myds-docs

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
