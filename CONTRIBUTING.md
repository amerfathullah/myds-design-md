# Contributing to MYDS

Thank you for your interest in contributing to MYDS! We welcome all contributions that help improve the library, whether through bug fixes, new components, documentation, or discussions.

## Issue Reporting

If you've found a bug in MYDS that you'd like to fix, you may raise it in [Issues](https://github.com/govtechmy/myds/issues) first. After the bug is confirmed by our team, we may opt to resolve it ourselves or open it to the public (or you) to submit a pull request with the fix, depending on how critical the bug is.

We recommend searching the existing issues to avoid duplicates.

## New features

If there's a new feature you'd like to see added to MYDS, share your idea with us in the [Discussion](https://github.com/govtechmy/myds/discussions) forum to get it on our radar as something to consider for a future release.

Please note that we don't often accept pull requests for new features. Adding a new feature or component to MYDS requires us to think through the entire problem ourselves to make sure we agree with the proposed API, which means the feature needs to be high on our own priority list for us to be able to give it the attention it needs.

If you open a pull request for a new feature, we're likely to close it not because it's a bad idea, but because we aren't ready to prioritize the feature and don't want the PR to sit open for months or even years.

## Turborepo

MYDS is largely managed by [Turborepo](https://turbo.build/). If you would like contribute via code, we recommend learning to utilise the features of Turborepo to make your life easier, from running multiple dev servers, scope installs, using codegens and many more.

## Coding standards

Our code formatting rules are defined in the [prettierc](./.prettierrc) and [\_eslint](./packages/_eslint/).

Running tests

## Components and hooks

To start a component, run this from anywhere in the repository, with its name in dash-case and whether it gets a story:

```sh
pnpm exec turbo gen component --args react probe-x true
```

It writes `packages/react/src/components/probe-x.tsx`, which exports `ProbeX`: a `div` that takes a div's own props, forwards its ref and merges its `className` with `clx`. It exports the component as `@amerfathullah/myds-react/probe-x`, adding the entry last in the react package's `exports`. With `true`, it also writes a story, `apps/storybook/stories/probe-x.stories.tsx`. Each file has TODOs for you to fill in.

To start a hook, run this with its name, which starts with `use`:

```sh
pnpm exec turbo gen hook --args react use-probe
```

It writes `packages/react/src/hooks/use-probe.ts`, a typed hook that holds a value, and exports `useProbe` from `@amerfathullah/myds-react/hooks` by adding it to the entry's barrel, `index.ts`. Change the hook into the one you need.

Both are formatted with the repository's prettier. If a file a generator would add exists already, or the name is exported already, it changes nothing, not even `package.json` or the barrel, and prints why. turbo gen can exit 0 even then, so read what it prints. Neither writes tests, docs pages, `DESIGN.md` entries or a changeset: add those yourself.

## Contexts

Make every React context with `sharedContext` from `packages/react/src/utils/registry.ts`, never with React's `createContext`, and give it a name of its own, the name of its `const`. The toast emitter is made the same way, with `sharedEmitter`. Each CommonJS entry carries its own copy of every module it imports, so a context made with `createContext` would exist once per entry, and a provider from one entry would never reach a component from another (#119). The registry keeps one of each context per copy of React, and every copy of the library of the same major version shares it. So within a major:

- a context's name is frozen;
- a field added to a context's value must be optional, and every reader must work without it;
- a change an older copy can't handle needs a new name.

`registry.guard.test.ts` fails on a context or an emitter made any other way, and keeps each name and default value in a snapshot. Change the snapshot only as a reviewed decision.

The registry's key takes the package's name and version from `package.json`, which whatever compiles `src` puts in with `define`. tsup, Vitest and the style package's page tests take them from `packages/react/registry-define.mjs`. Anything else that bundles `src` itself must do the same, or the page throws `__MYDS_REACT_NAME__ is not defined` as it loads.

A module evaluated again gets back the context it made first. So after you change a context's default value, restart `next dev` in the workspace-linked Next apps (`apps/docs`, `apps/standard`). Until you do, their server rendering keeps the old default, and the page reports hydration errors.

## Icons

The icon components in `packages/react/src/icons`, which `@amerfathullah/myds-react/icon` exports, are generated from the SVGs in `packages/react/src/svg/icons`, the icon sources. So is the entry's barrel, `index.ts`. To add or change an icon:

1. Add or edit its SVG in `packages/react/src/svg/icons`.
   - Name the file in lower-case dash-case. `arrow-back.svg` becomes `arrow-back.tsx`, which exports `ArrowBackIcon`.
   - Words on the generator's upper-case list (`turbo/generators/scripts/convert-icon.ts`), mostly agency acronyms, stay upper-case. A `legacy-` prefix stays in the file name but leaves the component's: `legacy-police-pdrm.svg` exports `PolicePDRMIcon`.
   - A fill or stroke of `#18181B` becomes `currentColor`, so that part takes the text colour. Every other colour stays fixed.
   - An id the SVG refers to, with `url(#…)` in an attribute such as `clip-path`, `mask` or `fill`, or with `href="#…"`, gets a prefix from `React.useId()`, so each copy of the icon on a page has its own clip paths, masks and gradients. The generator refuses a reference it can't prefix, such as one in a `style` attribute, and a reference to an id the SVG doesn't define.
   - Every other id is dropped. These are Figma's layer names, such as `Vector` or `Icon/cross`: every copy of the icon would repeat them, and an app's own id could resolve to one instead. So the generator also refuses anything that might refer to an id in a way it doesn't recognise, rather than drop an id the icon needs: a `<style>`, `<script>` or animation element, a `url(` that isn't `url(#…)` in lower case, a link that isn't `#…`, an ARIA attribute that names ids, such as `aria-labelledby`, and a tag with an attribute it can't read, such as one with spaces around its `=`.
2. From anywhere in the repository, run:

   ```sh
   pnpm exec turbo gen icon --args react
   ```

   It rebuilds every component in `packages/react/src/icons`, and the barrel, from the icon sources, formatted with the repository's prettier. It removes a component whose SVG is gone. If it can't read or convert every SVG, it changes nothing and prints why. Because it rewrites the whole directory, a change made only in a component is lost the next time it runs.

3. Check `git diff`: only the icons you added, changed or removed, and the barrel, should change.
4. Update these by hand. The generator doesn't touch them:
   - the docs icon gallery's list, `apps/docs/components/icon/IconDataList.tsx`;
   - the icon count under Iconography in [`DESIGN.md`](./DESIGN.md).
5. Add a changeset for `@amerfathullah/myds-react` (see below).

CI regenerates the icons from their SVGs and fails if that changes any file ([`icons.yml`](./.github/workflows/icons.yml)), so change an icon in its SVG, or a rule for every icon in the generator, never in the component.

National marks, such as the Malaysia flag and the Jata Negara, never go in the icon sources ([ADR-0007](./docs/adr/0007-component-library-doesnt-hand-out-national-marks.md)). A national mark isn't an icon, and a regeneration would export one as an ordinary icon. The marks' SVGs sit in `packages/react/src/svg/national-marks` and their components in `packages/react/src/national-marks`, outside the generator's directories. The barrel writes their two deprecated exports itself.

## Docs pages

To add a page to the docs app, run this from anywhere in the repository, with the page's section and group folder, and its title:

```sh
pnpm exec turbo gen mdx --args "design/(foundation)" "Page title"
```

Or run `pnpm exec turbo gen mdx` to choose them from a list. It writes the English page, `page-title.mdx`, and the Malay one, `page-title.ms.mdx`, in the group folder, and lists the page in the section's sidebar, `meta.en.json` and `meta.ms.json`, after the group's last page. Both pages have the title as typed and an empty description: write the description, and translate the Malay page's title. If a page of that name exists anywhere in the section, it changes nothing and prints why, because group folders don't appear in URLs.

## Submitting a Pull Request (PR)

1. **Ensure Tests Pass**:
   ```sh
   pnpm run test
   ```
2. **Format Code**:

   ```sh
   pnpm run lint
   ```

3. **Adding Changeset**:

   ```sh
   pnpm changeset
   ```

   - Describe the changes made in the PR inside the Changeset and only select the affected package(s)
   - Refer to [Changeset guide](https://github.com/changesets/changesets/blob/main/docs/adding-a-changeset.md)

4. **Push Your Changes**:
   ```sh
   git push origin feature/your-feature-name
   ```
5. **Open a Pull Request**:
   - Go to the repository on GitHub.
   - Click "New pull request".
   - Fill out the PR template.
   - Link to relevant issues.
   - Request a review from a maintainer.

## Questions?

Feel free to open a discussion or reach out to the maintainers.

Thank you for contributing! 🎉
