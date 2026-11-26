// Loaded into tsup by `check-reproducible.mjs`, with `node --require` (#239).
// tsup globs the entries in `entryPoints` with tinyglobby, whose order
// changes from build to build. This puts them in the order that
// MYDS_ENTRY_ORDER names, and appends what it found and what it gave back,
// as a line of JSON, to the file MYDS_ENTRY_ORDER_RECORD names. Without both
// variables, it changes nothing.
//
// tsup calls `glob(patterns)` for the entries, with no options. Its `clean`
// step calls `glob(patterns, options)`, which this leaves alone.
const { appendFileSync } = require("node:fs");
const { createRequire } = require("node:module");
const { posix } = require("node:path");

/**
 * The entries in the order `spec` names:
 * - `first:<folder>`, e.g. `first:src/hooks`: that folder's files, sorted,
 *   then the others, sorted;
 * - `reverse`: all of them, sorted, then last to first.
 * It throws on any other spec, and on a folder that holds no entry.
 */
function order(entries, spec) {
  const sorted = [...entries].sort();
  if (spec === "reverse") return sorted.reverse();
  const folder = /^first:(.+)$/.exec(spec)?.[1];
  if (folder === undefined)
    throw new Error(
      `MYDS_ENTRY_ORDER isn't \`first:<folder>\` or \`reverse\`: ${spec}`,
    );
  const first = sorted.filter((entry) => posix.dirname(entry) === folder);
  if (first.length === 0)
    throw new Error(`No entry is in ${folder}: ${sorted.join(", ")}`);
  return [...first, ...sorted.filter((entry) => !first.includes(entry))];
}

module.exports = { order };

const spec = process.env.MYDS_ENTRY_ORDER;
const record = process.env.MYDS_ENTRY_ORDER_RECORD;
if (spec && record) {
  // The copy tsup loads
  const tinyglobby = createRequire(
    require.resolve("tsup", { paths: [process.cwd()] }),
  )("tinyglobby");
  const { glob } = tinyglobby;
  tinyglobby.glob = async function (...args) {
    const found = await glob.apply(this, args);
    if (args.length !== 1) return found;
    const forced = order(found, spec);
    appendFileSync(record, `${JSON.stringify({ found, forced })}\n`);
    return forced;
  };
}
