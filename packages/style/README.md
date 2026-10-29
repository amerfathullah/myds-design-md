# myds-style

![myds-hero-img](https://d2391uizq0pg2.cloudfront.net/design/myds-hero-img.png)

> The Malaysian Government Design System (MYDS) is an open-source design system to build products for the Malaysian government. It contains the design guideline and the component library for creating consistent and accessible digital services.

## Getting started

To install `@govtechmy/myds-style` in your project, run the installation command for the package manager of your choice:

```bash
# npm
npm i @govtechmy/myds-style

# yarn
yarn add @govtechmy/myds-style

# pnpm
pnpm add @govtechmy/myds-style
```

## Usage

### With Tailwind CSS 4

Import MYDS once, after Tailwind, in your stylesheet. Every MYDS token becomes a Tailwind theme variable, with the light and dark themes, so classes such as `bg-bg-white` and `text-txt-black-900` work. Tailwind's default colour palette isn't available. If you use `@govtechmy/myds-react`, let Tailwind scan it too:

```css
@import "tailwindcss";
@import "@govtechmy/myds-style";

/* Path from this stylesheet to your node_modules */
@source "../node_modules/@govtechmy/myds-react/dist";
```

The import doesn't load fonts. Load Inter and Poppins yourself, for example from Google Fonts.

For a Fumadocs site, add the MYDS colours for Fumadocs after its theme, and keep MYDS before it:

```css
@import "tailwindcss";
@import "@govtechmy/myds-style";
@import "fumadocs-ui/css/neutral.css";
@import "fumadocs-ui/css/preset.css";
@import "@govtechmy/myds-style/fumadocs.css";
```

### Without Tailwind

`full.css` is precompiled: Tailwind's preflight, the fonts, MYDS and every class `@govtechmy/myds-react` uses.

```css
/* In your CSS entry point */
@import "@govtechmy/myds-style/full.css";
```

```ts
// Or in your bundle entry point (eg. index.{ts,js})
import "@govtechmy/myds-style/full.css";
```

`color.css`, `light.css` and `dark.css` hold only the CSS variables for the colours and the two themes.

MYDS is an open-source project and welcomes contributions from the public. To contribute:

1. **Discuss New Features**: Before submitting a pull request (PR), please open an issue to discuss the feature you would like to add or change. This helps to ensure that your contribution aligns with the project's goals and guidelines.
2. **Submit a PR**: Once the feature has been discussed and approved, you can submit a PR with your changes. Please follow the contribution guidelines provided in the repository.

We look forward to collaborating with you to improve MYDS.

---
