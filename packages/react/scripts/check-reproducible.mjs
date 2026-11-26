// Checks that the build is reproducible: that two builds of one commit write
// the same files, byte for byte (#239). tsup globs the entries in
// `entryPoints` with tinyglobby, whose order changes from build to build,
// mostly in which folder's files come first, and esbuild names and fills the
// shared chunks by that order. So this rebuilds the package with the entries
// in fixed orders, through `reorder-entries.cjs`: once last to first, then
// once with each folder's files first. Each rebuild starts from an empty
// `dist`. It fails unless each writes the files of the build that was there,
// with the same SHA-256, and puts that build back at the end.
//
// Each rebuild must show that tsup built the entries in the order forced on
// it: the preload records the one glob it reordered, and tsup's
// "Building entry:" line has to list the same order. No two rebuilds may
// build the same order. Otherwise a rebuild would check nothing new. The
// orders themselves are pinned by `reorder-entries.test.mjs`.
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

// As an annotation in GitHub Actions
const report = (failure) =>
  console.error(
    process.env.GITHUB_ACTIONS === "true"
      ? `::error::${failure.replaceAll("%", "%25").replaceAll("\r", "%0D").replaceAll("\n", "%0A")}`
      : failure,
  );

if (!existsSync(dist)) {
  report(`${dist} doesn't exist: run \`pnpm build\` first`);
  process.exit(1);
}
const first = hashes(dist);
if (first.size === 0) {
  report(`${dist} is empty: run \`pnpm build\` first`);
  process.exit(1);
}

// Ctrl-C, or a cancelled CI job, signals tsup too, which stops it. These
// listeners keep this process alive, so that it can put the first build back.
// They can't run before the check is over, since it runs synchronously, so a
// signal sent to this process alone waits until then.
for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"])
  process.on(signal, () => {});

const scratch = mkdtempSync(join(tmpdir(), "myds-react-reproducible-"));
cpSync(dist, join(scratch, "dist"), { recursive: true });

let rebuilds = 0;
// Rebuilds with the entries in the order `spec` names. It returns the entries
// tinyglobby found, the order tsup built them in, and what's wrong:
// `problems` with the check itself, or `differences` from the first build.
function rebuild(spec) {
  const record = join(scratch, `rebuild-${rebuilds++}.jsonl`);
  // So that a file the rebuild doesn't write shows, whatever `clean` says
  rmSync(dist, { recursive: true, force: true });
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
  // Without colours
  const output = `${run.stdout}${run.stderr}`.replace(/\x1b\[[\d;]*m/g, "");
  // Such as ENOBUFS, when spawnSync stops tsup itself
  if (run.error)
    return { problems: [`Couldn't run tsup: ${run.error.message}`] };
  if (run.signal) throw new Error(`tsup was stopped by ${run.signal}`);
  if (run.status !== 0)
    return {
      problems: [
        `tsup failed (exit ${run.status}). The end of its output:\n${output.trimEnd().split("\n").slice(-40).join("\n")}`,
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
  const logged = [...output.matchAll(/Building entry: (.*)$/gm)].map(
    ([, list]) => list.split(", "),
  );
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
  return { found, forced, differences: differences(first, hashes(dist)) };
}

// The check itself couldn't do its job
let broken = false;
// A rebuild didn't write the files of the first build
let differs = false;
try {
  // Each spec, to the order tsup built, as JSON
  const built = new Map();
  // Rebuilds in `spec`'s order and reports the result. It returns the
  // entries tinyglobby found, to list the folders.
  const rebuildAndReport = (spec) => {
    const { found, forced, problems = [], differences = [] } = rebuild(spec);
    if (forced) built.set(spec, JSON.stringify(forced));
    if (problems.length > 0) {
      broken = true;
      report(`${spec}:\n  ${problems.join("\n  ")}`);
    } else if (differences.length > 0) {
      differs = true;
      report(
        `${spec}: ${differences.length} files differ from the first build:\n  ${differences.join("\n  ")}`,
      );
    } else
      console.log(`${spec}: all ${first.size} files match the first build`);
    return found;
  };
  // No entries only when that rebuild failed, which it reported
  const found = rebuildAndReport("reverse") ?? [];
  const folders = [
    ...new Set(found.map((entry) => posix.dirname(entry))),
  ].sort();
  for (const folder of folders) rebuildAndReport(`first:${folder}`);
  const specs = [...built.keys()];
  const repeats = specs.filter((spec, i) =>
    specs.slice(0, i).some((other) => built.get(other) === built.get(spec)),
  );
  if (repeats.length > 0) {
    broken = true;
    report(
      `These rebuilds built the entries in an order an earlier rebuild built, so they checked nothing new: ${repeats.join(", ")}`,
    );
  }
} catch (error) {
  broken = true;
  report(error instanceof Error ? error.message : String(error));
} finally {
  rmSync(dist, { recursive: true, force: true });
  cpSync(join(scratch, "dist"), dist, { recursive: true });
  rmSync(scratch, { recursive: true, force: true });
}

if (differs)
  console.error(
    "\nThe build isn't reproducible (#239): a rebuild with its entries in another order didn't write the files of the first build. If dist is from an older commit, run `pnpm build` and check again.",
  );
if (broken)
  console.error(
    "\nThe check couldn't do its job, so it shows nothing about those rebuilds: see above.",
  );
if (differs || broken) process.exit(1);
