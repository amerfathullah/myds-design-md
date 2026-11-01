import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, expect, test } from "vitest";

const script = join(import.meta.dirname, "check-icons.sh");

let repo: string;

/** The icon directory's committed files: what the generator writes back */
const generated = {
  "packages/react/src/icons/arrow-back.tsx": "export const ArrowBackIcon;\n",
  "packages/react/src/icons/index.ts": `export * from "./arrow-back";\n`,
};

function write(files: Record<string, string>) {
  for (const [file, content] of Object.entries(files)) {
    mkdirSync(dirname(join(repo, file)), { recursive: true });
    writeFileSync(join(repo, file), content);
  }
}

function git(...args: string[]) {
  execFileSync("git", args, { cwd: repo, stdio: "ignore" });
}

function commit(message: string) {
  git(
    "-c",
    "user.name=test",
    "-c",
    "user.email=test@example.com",
    "-c",
    "commit.gpgsign=false",
    "commit",
    "--quiet",
    `--message=${message}`,
  );
}

function run(command: string) {
  const { status, stdout, stderr } = spawnSync("bash", [script, command], {
    cwd: repo,
    encoding: "utf8",
  });
  return { status, output: stdout + stderr };
}

beforeEach(() => {
  // A throwaway checkout, laid out like the repository
  repo = mkdtempSync(join(tmpdir(), "check-icons-"));
  git("init", "--quiet");
  write({
    ...generated,
    "packages/react/src/svg/icons/arrow-back.svg": "<svg/>\n",
    "packages/react/src/national-marks/malaysia-flag.tsx": "the flag\n",
  });
  git("add", "--all");
  commit("icons");
});

afterEach(() => {
  rmSync(repo, { recursive: true, force: true });
});

/** What a failure's annotation says the committed files do */
const differ =
  "The committed files differ from what the icon generator writes from the SVG sources";

/** Words CONTEXT.md keeps for other relationships */
const reserved = /drift|divergen|stale|out of date/i;

/** The step whose log says why the generator wrote nothing */
const generatorStep = `"Regenerate the icons from their SVG sources"`;

/**
 * Expects a failure that names each file and ends with one error annotation
 * giving the fix, and returns that annotation
 */
function expectFailure(
  { status, output }: ReturnType<typeof run>,
  files: string[],
): string {
  expect(status).toBe(1);
  expect(output).not.toMatch(reserved);
  for (const file of files) {
    expect(output).toContain(file);
    // In the diff, too
    expect(output).toContain(`diff --git a/${file} b/${file}`);
  }
  // A diffstat
  if (files.length > 0) expect(output).toMatch(/\d+ files? changed/);

  const annotations = output
    .split("\n")
    .filter((line) => line.startsWith("::error "));
  expect(annotations).toHaveLength(1);
  const annotation = annotations[0] ?? "";
  // Where an icon changes, and how the change is committed
  expect(annotation).toContain("in its SVG");
  expect(annotation).toContain("in the generator");
  expect(annotation).toContain("never in the component");
  expect(annotation).toContain("pnpm exec turbo gen icon --args react");
  expect(annotation).toContain("on a clean checkout");
  expect(annotation).toContain("commit everything it changes");
  return annotation;
}

test("passes when the generator writes back exactly the committed files", () => {
  run("empty");
  write(generated);

  const { status, output } = run("check");

  expect(status).toBe(0);
  expect(output).toContain("Regenerating the icons changed no file");
  expect(output).not.toMatch(reserved);
});

test("fails and names a component the generator writes differently", () => {
  run("empty");
  write({
    ...generated,
    "packages/react/src/icons/arrow-back.tsx": `export const ArrowBackIcon; // id="Vector"\n`,
  });

  const annotation = expectFailure(run("check"), [
    "packages/react/src/icons/arrow-back.tsx",
  ]);
  expect(annotation).toContain(differ);
});

test("fails and names a file the generator writes that isn't committed", () => {
  run("empty");
  write({
    ...generated,
    "packages/react/src/icons/arrow-up.tsx": "export const ArrowUpIcon;\n",
  });

  const annotation = expectFailure(run("check"), [
    "packages/react/src/icons/arrow-up.tsx",
  ]);
  expect(annotation).toContain(differ);
});

test("fails and names a committed file in the icon directory the generator doesn't write", () => {
  run("empty");
  const { "packages/react/src/icons/arrow-back.tsx": _, ...barrel } = generated;
  write(barrel);

  const annotation = expectFailure(run("check"), [
    "packages/react/src/icons/arrow-back.tsx",
  ]);
  expect(annotation).toContain(differ);
});

test("fails and names a file the generator changes outside the icon directory", () => {
  run("empty");
  write({
    ...generated,
    "packages/react/src/national-marks/malaysia-flag.tsx":
      "a regenerated flag\n",
  });

  const annotation = expectFailure(run("check"), [
    "packages/react/src/national-marks/malaysia-flag.tsx",
  ]);
  expect(annotation).toContain(differ);
});

test("fails saying the generator wrote nothing, and where its log is, when it wrote nothing", () => {
  run("empty");

  const annotation = expectFailure(run("check"), Object.keys(generated));
  expect(annotation).toContain("wrote nothing");
  expect(annotation).toContain(generatorStep);
  expect(annotation).not.toContain(differ);
});

test("fails when the generator wrote nothing, even with no icons committed", () => {
  git("rm", "-r", "--quiet", "packages/react/src/icons");
  commit("no icons");
  run("empty");

  const annotation = expectFailure(run("check"), []);
  expect(annotation).toContain("wrote nothing");
});

test("caps the diff it prints", () => {
  run("empty");
  const lines = Array.from({ length: 2000 }, (_, i) => `line ${i + 1}`);
  write({
    ...generated,
    "packages/react/src/icons/arrow-back.tsx": `${lines.join("\n")}\n`,
  });

  const { output } = run("check");

  expect(output).toContain("+line 1\n");
  expect(output).not.toContain("+line 2000\n");
  expect(output).toMatch(/first \d+ of the diff's \d+ lines/);
});

test.each(["chek", ""])(
  "fails on the command %j, rather than checking nothing",
  (command) => {
    run("empty");

    const { status, output } = run(command);

    expect(status).toBe(2);
    expect(output).toContain("empty|check");
  },
);
