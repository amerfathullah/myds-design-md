// Checks that the build is reproducible: that two builds of one commit write
// the same files, byte for byte (#239). tsup globs the entries in
// `entryPoints` with tinyglobby, whose order changes from build to build,
// mostly in which folder's files come first, and esbuild names and fills the
// shared chunks by that order. So this rebuilds the package with the entries
// in fixed orders, through `reorder-entries.cjs`: once last to first, then
// once with each folder's files first. It fails unless each rebuild writes
// the files of the build that was in `dist`, with the same SHA-256, and puts
// that build back at the end.
//
// Each rebuild must show that tsup built the entries in the order forced on
// it: the preload records the one glob it reordered, and tsup's
// "Building entry:" line has to list the same order. Otherwise a rebuild
// would check nothing.
//
// Run it after `pnpm build`, from the package: `pnpm check-reproducible`.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, posix, resolve, sep } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = join(root, "dist");
const preload = join(import.meta.dirname, "reorder-entries.cjs");
const require = createRequire(join(root, "package.json"));
const { order } = require(preload);
const tsupPackage = require.resolve("tsup/package.json");
const tsup = join(
  dirname(tsupPackage),
  JSON.parse(readFileSync(tsupPackage, "utf8")).bin.tsup,
);

// Every file under `dir`, by its path relative to it, to its SHA-256
const hashes = (dir) =>
  new Map(
    readdirSync(dir, { recursive: true, encoding: "utf8" })
      .filter((file) => statSync(join(dir, file)).isFile())
      .sort()
      .map((file) => [
        file.split(sep).join("/"),
        createHash("sha256")
          .update(readFileSync(join(dir, file)))
          .digest("hex"),
      ]),
  );

// The files of `built` that differ from `first`'s
function differences(first, built) {
  const lines = [];
  for (const [file, hash] of first)
    if (!built.has(file)) lines.push(`${file} isn't built`);
    else if (built.get(file) !== hash) lines.push(`${file} differs`);
  for (const file of built.keys())
    if (!first.has(file)) lines.push(`${file} is new`);
  return lines;
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

if (!existsSync(dist))
  throw new Error(`${dist} doesn't exist: run \`pnpm build\` first`);
const first = hashes(dist);
const scratch = mkdtempSync(join(tmpdir(), "myds-react-reproducible-"));
cpSync(dist, join(scratch, "dist"), { recursive: true });

// Rebuilds with the entries in the order `spec` names. It returns the entries
// tinyglobby found, and what's wrong with the rebuild.
function rebuild(spec) {
  const record = join(scratch, `${spec.replace(/\W/g, "-")}.jsonl`);
  const run = spawnSync(process.execPath, ["--require", preload, tsup], {
    cwd: root,
    env: {
      ...process.env,
      MYDS_ENTRY_ORDER: spec,
      MYDS_ENTRY_ORDER_RECORD: record,
    },
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  const output = `${run.stdout}${run.stderr}`;
  if (run.status !== 0)
    return {
      problems: [
        `tsup failed (${run.error ?? `exit ${run.status}`}):\n${output}`,
      ],
    };
  // One per glob the preload reordered
  const reorderings = existsSync(record)
    ? readFileSync(record, "utf8")
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line))
    : [];
  if (reorderings.length !== 1)
    return {
      problems: [
        `The preload reordered ${reorderings.length} entry globs, not 1, so this can't tell what tsup built`,
      ],
    };
  const [{ found, forced }] = reorderings;
  // As tsup prints it, without colours
  const logged = [
    ...output.replace(/\x1b\[[\d;]*m/g, "").matchAll(/Building entry: (.*)$/gm),
  ].map(([, list]) => list.split(", "));
  const expected = order(found, spec);
  if (
    !same(forced, expected) ||
    logged.length !== 1 ||
    !same(logged[0], expected)
  )
    return {
      found,
      problems: [
        `tsup didn't build the entries in the order forced on it, so this build checks nothing. Forced: ${expected.join(", ")}. tsup's "Building entry:" lines: ${logged.map((list) => list.join(", ")).join(" / ") || "none"}`,
      ],
    };
  return { found, problems: differences(first, hashes(dist)) };
}

// As an annotation in GitHub Actions
const report = (failure) =>
  console.error(
    process.env.GITHUB_ACTIONS === "true"
      ? `::error::${failure.replaceAll("%", "%25").replaceAll("\r", "%0D").replaceAll("\n", "%0A")}`
      : failure,
  );

let failed = false;
try {
  // Rebuilds in `spec`'s order and reports the result. It returns the
  // entries tinyglobby found, to list the folders.
  const rebuildAndReport = (spec) => {
    const { found, problems } = rebuild(spec);
    if (problems.length === 0)
      console.log(`${spec}: all ${first.size} files match the first build`);
    else {
      failed = true;
      report(`${spec}:\n  ${problems.join("\n  ")}`);
    }
    return found;
  };
  const found = rebuildAndReport("reverse") ?? [];
  const folders = [
    ...new Set(found.map((entry) => posix.dirname(entry))),
  ].sort();
  if (folders.length === 0) {
    failed = true;
    report(
      "Couldn't put each folder first: the reversed rebuild didn't record the entries tsup globbed",
    );
  }
  for (const folder of folders) rebuildAndReport(`first:${folder}`);
} finally {
  rmSync(dist, { recursive: true, force: true });
  cpSync(join(scratch, "dist"), dist, { recursive: true });
  rmSync(scratch, { recursive: true, force: true });
}

if (failed) {
  console.error(
    "\nThe build isn't reproducible (#239): a rebuild with its entries in another order didn't write the same files as the first build. If dist is from an older commit, run `pnpm build` and check again.",
  );
  process.exit(1);
}
