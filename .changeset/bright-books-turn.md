---
"@govtechmy/myds-storybook": patch
---

Move the Storybook app to Storybook 10, Vite 8, Jest 30 (through `@storybook/test-runner` 0.26) and React 19, with every other dependency on its latest stable release except Tailwind 3, `autoprefixer` and `postcss`. Essentials, interactions, blocks and `@storybook/test` are now part of Storybook core, with `@storybook/addon-docs` providing autodocs. Stories import from `@storybook/react-vite` and `storybook/test`. Background and viewport choices are story `globals`, which Storybook 9 and later read in place of `parameters.backgrounds.default` and `parameters.viewport.defaultViewport`.
