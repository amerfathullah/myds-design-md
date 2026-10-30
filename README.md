# Malaysian Government Design System (MYDS)

> **Unofficial fork.** This isn't the official MYDS repository; that's [govtechmy/myds](https://github.com/govtechmy/myds). This fork adds [`DESIGN.md`](./DESIGN.md), an independent description of MYDS as built for AI agents working on official Malaysian government services, and its glossary, [`CONTEXT.md`](./CONTEXT.md). Both files are © 2026 Amer Fathullah Nuaim Zakaria, licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); the licence covers only their text, not MYDS itself. For DESIGN.md files of other design systems, see [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md).

![myds-hero-img](https://d2391uizq0pg2.cloudfront.net/design/myds-hero-img.png)

> The Malaysian Government Design System (MYDS) contains the design guideline and the component library for creating consistent and accessible digital services across the Malaysian government.

## Preview

Interactive HTML previews of what [`DESIGN.md`](./DESIGN.md) documents: the design tokens (colour ramps, semantic tokens, typography, spacing, radius and elevation) and UI components (buttons, tags, form controls including the date and time fields, callouts, skeletons, tabs, pagination, accordion, data table, dropdown, dialog, and the page frame from SkipLink to Footer, with a placeholder Masthead):

| Theme    | Link                                                                                  |
| -------- | ------------------------------------------------------------------------------------- |
| ☀️ Light | [preview.html](https://amerfathullah.github.io/myds-design-md/preview.html)           |
| 🌙 Dark  | [preview-dark.html](https://amerfathullah.github.io/myds-design-md/preview-dark.html) |

There are two (2) key products in MYDS:

1. **Design Language Guideline**: Aimed at designers and project managers, this guideline provides the principles, standards, and best practices for designing user interfaces that are cohesive and user-friendly.
2. **Component Library**: Targeted at developers, this library offers a collection of reusable UI components that adhere to the design language guidelines, ensuring consistency and efficiency in development.

## Documentation

1. Design Guideline: https://design.digital.gov.my/en/docs/design
2. Component Library: https://design.digital.gov.my/en/docs/develop

## Running and testing the apps

This is a [pnpm](https://pnpm.io/) + [Turborepo](https://turbo.build/) monorepo. You need Node.js 26 (see [`.nvmrc`](./.nvmrc)) and pnpm 12.16.1 (pinned in `packageManager`).

```sh
nvm use               # Node.js 26
pnpm install          # install every workspace
pnpm build:packages   # build @amerfathullah/myds-react and @amerfathullah/myds-style, which the apps import
```

### Everything at once

Run these from the repository root. Turborepo runs the script in every workspace that has it.

| Command      | What it does                                          |
| ------------ | ----------------------------------------------------- |
| `pnpm dev`   | Starts every dev server and the package watchers      |
| `pnpm build` | Builds the packages and all apps                      |
| `pnpm start` | Serves the production builds (run `pnpm build` first) |
| `pnpm test`  | Runs the package test suites                          |
| `pnpm lint`  | Lints the packages and apps                           |

### One workspace at a time

Use `pnpm --filter <name> <script>`:

| Workspace                            | Name                        | Dev                           | Production (`build`, then `start`) |
| ------------------------------------ | --------------------------- | ----------------------------- | ---------------------------------- |
| [Docs site](./apps/docs)             | `@govtechmy/myds-docs`      | `dev` → http://localhost:3000 | `start` → http://localhost:4000    |
| [Standard](./apps/standard)          | `@govtechmy/kd-standard`    | `dev` → http://localhost:3001 | `start` → http://localhost:3000    |
| [Storybook](./apps/storybook)        | `@govtechmy/myds-storybook` | `dev` → http://localhost:6006 | `start` → http://localhost:6006    |
| [React components](./packages/react) | `@amerfathullah/myds-react` | `dev` (tsup watch)            | `build`                            |
| [Styles](./packages/style)           | `@amerfathullah/myds-style` | `dev` (Tailwind watch)        | `build`                            |

For example, `pnpm --filter @govtechmy/myds-docs dev`.

### Tests

```sh
pnpm test                                                # all test suites
pnpm --filter @amerfathullah/myds-react test             # Vitest unit tests
pnpm --filter @amerfathullah/myds-react check-types      # type-check against React 18 and 19 types
pnpm --filter @amerfathullah/myds-react check-exports    # check the package's published exports (run build first)
pnpm --filter @amerfathullah/myds-style test             # token parity, focused-segment, segment-clip and segment-scroll tests, rendered in Chromium, and the DESIGN.md lint check
```

The token parity, focused-segment, segment-clip and segment-scroll tests render in Chromium through Playwright. If Playwright reports a missing browser, install the one that matches its version: `pnpm --filter @amerfathullah/myds-style exec playwright install chromium`.

### Frontend templates

[`template/fe-template-a`](./template/fe-template-a), [`-b`](./template/fe-template-b) and [`-c`](./template/fe-template-c) are standalone React + Vite starters. They aren't part of the pnpm workspace and use npm, so run them from their own folder:

```sh
cd template/fe-template-a
npm ci
npm run dev       # http://localhost:5173
npm run build     # type-check and build to dist/
npm run preview   # serve the build
npm run lint      # oxlint
```

## Contributing

MYDS is an open-source project and welcomes contributions from the public. To contribute, please read our [contributing guideline](./CONTRIBUTING.md)

We look forward to see what you may bring to MYDS.

---

## important note

### 1. Tailwind Intellisense Workaround

MYDS has no Tailwind config file: Tailwind 4 reads the theme from a stylesheet that imports `@amerfathullah/myds-style`. The Tailwind Intellisense extension on VSCode looks for that stylesheet in the folder you work in, so inside `packages/**` it finds none and stops suggesting classes and previewing CSS.

To solve this, add the following in your VSCode **Workspace settings** (_Not your User settings_):

```json
// .vscode/settings.json
{
  "tailwindCSS.experimental.configFile": {
    "apps/docs/app/global.css": "apps/docs/**",
    "apps/standard/app/global.css": "apps/standard/**",
    "apps/storybook/.storybook/global.css": ["apps/storybook/**", "packages/**"]
  }
}
```

This will override Intellisense's auto-config-locator to point to the defined stylesheets and together with their glob scopes.

Made with ❤️ by GNU, Kementerian Digital
