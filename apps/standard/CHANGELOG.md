# @govtechmy/myds-standard

## 1.0.3

### Patch Changes

- b6abdbc: upgrade `next` to 14.2.35 for security fixes backported to Next.js 14
- 56b9af8: Load MYDS through the Tailwind 4 `@amerfathullah/myds-style` import. The docs and standard sites drop `@config`, their `tailwind.config.ts` and their own Fumadocs colour mapping for `@amerfathullah/myds-style/fumadocs.css`, and the placeholder and button-cursor defaults now come from the package's preflight additions. Storybook moves from Tailwind 3 to Tailwind 4 through `@tailwindcss/vite`. The docs' Style Configuration page (EN/MS) shows the Tailwind 4 setup.
- 839fbb4: MYDS is now published as `@amerfathullah/myds-react` and `@amerfathullah/myds-style`, continuing `@govtechmy/myds-*` 1.x under names this repository can publish. The migration guide's first step covers the switch. The docs, standard site and Storybook import the new names, and the docs installation pages install them.
- 327d985: Move the docs and standard sites to Next.js 16, React 19, Fumadocs 16 (fumadocs-mdx 15) and Tailwind 4, with every other dependency on its latest stable release. Locale routing runs in `proxy.ts`, route `params` are awaited, search is per locale, and the standard site now lints with ESLint. Each site's `app/global.css` is the Tailwind 4 entry point: it loads the MYDS v1 preset through `@config`, maps the former `preset_fumadocs` colours onto Fumadocs 16's theme variables, and scans `@amerfathullah/myds-react` with `@source`. Google Fonts load from `<link>` tags, since Turbopack drops remote CSS imports. Fumadocs `<Tabs items>` in MDX no longer pass `defaultValue`: Fumadocs 13 ignored it, and Fumadocs 16 would select no tab.
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
