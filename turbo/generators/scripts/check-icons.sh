#!/usr/bin/env bash
# The icons workflow's check that the icon components and their barrel are the
# icon generator's output, and nothing else (.github/workflows/icons.yml):
#
#   check-icons.sh empty   empties the icon directory, before the generator runs
#   check-icons.sh check   once it has run, fails if the working tree has any
#                          added, modified or deleted file, anywhere, or if the
#                          generator wrote nothing
#
# Emptying the directory first means a generator that didn't run, or failed
# having written nothing, can't pass: every committed icon would be deleted.
# The check doesn't rely on turbo gen's exit code or its log, since turbo gen
# can exit 0 when the generator fails.
set -euo pipefail

icons=packages/react/src/icons
sources=packages/react/src/svg/icons
# The most lines of the diff a failure prints
diff_lines=500

cd "$(git rev-parse --show-toplevel)"

case "${1-}" in
  empty)
    rm -rf -- "$icons"
    mkdir -p -- "$icons"
    ;;
  check)
    # Stage the whole working tree in a copy of the index, so the comparison
    # with HEAD sees new files too, and the real index stays as it was
    index="$(mktemp)"
    diff="$(mktemp)"
    trap 'rm -f -- "$index" "$diff"' EXIT
    cp -- "$(git rev-parse --git-path index)" "$index"
    export GIT_INDEX_FILE="$index"
    git add --all

    # The generator writes at least the barrel whenever it runs, so an empty
    # icon directory means it didn't, whatever else is committed
    wrote_nothing=false
    if [ -z "$(ls -A -- "$icons" 2>/dev/null)" ]; then
      wrote_nothing=true
    fi

    if [ "$wrote_nothing" = false ] && git diff --cached --quiet HEAD; then
      echo "Regenerating the icons changed no file."
      exit 0
    fi

    echo "Files the regeneration added (A), modified (M), deleted (D) or renamed (R):"
    git --no-pager diff --cached --name-status HEAD
    echo
    git --no-pager diff --cached --stat=200 HEAD
    echo

    git --no-pager diff --cached --no-color --no-ext-diff HEAD >"$diff"
    lines="$(wc -l <"$diff")"
    echo "::group::The diff"
    if [ "$lines" -gt "$diff_lines" ]; then
      echo "Showing the first $diff_lines of the diff's $lines lines."
    fi
    head -n "$diff_lines" "$diff"
    echo "::endgroup::"

    fix="Change an icon's markup in its SVG, in $sources, or a rule for every icon in the generator, in turbo/generators, never in the component. Then run pnpm exec turbo gen icon --args react on a clean checkout and commit everything it changes."
    if [ "$wrote_nothing" = true ]; then
      echo "::error title=The icon generator wrote nothing::The icon generator wrote nothing to $icons. The log of the step \"Regenerate the icons from their SVG sources\" says why. $fix"
    else
      echo "::error title=Icons differ from the generator's output::The committed files differ from what the icon generator writes from the SVG sources. $fix"
    fi
    exit 1
    ;;
  *)
    echo "Usage: $0 empty|check" >&2
    exit 2
    ;;
esac
