# The images and videos from upstream's CloudFront bucket live in this repository

The docs site, the npm READMEs, Storybook and the templates loaded their images and videos from upstream's CloudFront bucket, `d2391uizq0pg2.cloudfront.net`. No one here can add a file to that bucket or change one, and if it goes, every one of those images and videos breaks. So the files live in this repository, copied from the bucket as it serves them, not recreated. The design guideline's files come first, into the docs app's `public/design` (#109). The docs site's own `/common/` assets follow (#110), then the READMEs, Storybook and the templates, which also takes the bucket out of the config (#111).

## Considered Options

- **Keep using upstream's bucket**: rejected. No one here can add, fix or keep a file there, and upstream isn't maintained (ADR-0002).
- **A bucket the maintainer owns**: rejected. It means infrastructure, credentials and a bill for one maintainer to keep, for files that rarely change (the same reasoning as ADR-0003).

## Consequences

- The repository now redistributes upstream's unlicensed images and videos, on the same footing as the upstream code it already holds (see [the root licence entry](../../.out-of-scope/root-licence.md) in `.out-of-scope/`).
- The npm READMEs' hero image depends on this repository's name and default branch.
- The files are in Git's history for good, and each changed copy of one adds to it. The design guideline's 444 files add 63 MB.
- The `docs` workflow fails when a design guideline page references a file under `/design/` that the repository doesn't hold, the `-dark` copy of each Markdown image included (`pnpm --filter @govtechmy/myds-docs check-design-files`). A file the bucket didn't serve is listed in that check as known missing, not recreated.
