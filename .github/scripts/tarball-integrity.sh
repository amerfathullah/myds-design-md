#!/usr/bin/env bash
# Logs each tarball that a `changeset pack` directory holds for publishing, with
# its integrity in npm's form: `sha512-` and the base64 SHA-512 of the .tgz. Once
# a version is public, `npm view <package>@<version> dist.integrity` gives the
# same string. The integrity in the pack's own plan is sha256, so it can never
# match. Also writes the list to the job summary when run in GitHub Actions.
#
# Usage: tarball-integrity.sh <pack dir>
set -euo pipefail

pack_dir=$1
summary=${GITHUB_STEP_SUMMARY:-/dev/null}

releases=$(jq -r '.plan[][] | select(.kind == "publish") | [.name, .version, .tarball.path] | @tsv' \
  "$pack_dir/publish-plan.json")

echo "### Tarballs" >> "$summary"
while IFS=$'\t' read -r name version tarball; do
  [ -n "$name" ] || continue
  integrity="sha512-$(openssl dgst -sha512 -binary "$pack_dir/$tarball" | openssl base64 -A)"
  echo "$name@$version $integrity"
  echo "- \`$name@$version\`: \`$integrity\`" >> "$summary"
done <<< "$releases"
