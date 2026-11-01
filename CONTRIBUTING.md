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

## Icons

The icon components in `packages/react/src/icons`, which `@amerfathullah/myds-react/icon` exports, are generated from the SVGs in `packages/react/src/svg/icons`, the icon sources. So is the entry's barrel, `index.ts`. To add or change an icon:

1. Add or edit its SVG in `packages/react/src/svg/icons`.
   - Name the file in lower-case dash-case. `arrow-back.svg` becomes `arrow-back.tsx`, which exports `ArrowBackIcon`.
   - Words on the generator's upper-case list (`turbo/generators/scripts/convert-icon.ts`), mostly agency acronyms, stay upper-case. A `legacy-` prefix stays in the file name but leaves the component's: `legacy-police-pdrm.svg` exports `PolicePDRMIcon`.
   - A fill or stroke of `#18181B` becomes `currentColor`, so that part takes the text colour. Every other colour stays fixed.
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

CI regenerates the icons from their SVGs and fails if that changes any file ([`icons.yml`](./.github/workflows/icons.yml)), so change an icon in its SVG, or every icon in the generator, never in the component.

National marks, such as the Malaysia flag and the Jata Negara, never go in the icon sources ([ADR-0007](./docs/adr/0007-component-library-doesnt-hand-out-national-marks.md)). A national mark isn't an icon, and a regeneration would export one as an ordinary icon. The marks' SVGs sit in `packages/react/src/svg/national-marks` and their components in `packages/react/src/national-marks`, outside the generator's directories. The barrel writes their two deprecated exports itself.

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
