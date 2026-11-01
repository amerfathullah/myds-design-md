import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { type Formatter, prettierFormatter } from "./generate-icons";
import { generateHook, hookNameError } from "./generate-hook";

// This repository, whose prettier the generator formats with
const repository = join(import.meta.dirname, "../../..");

const unformatted: Formatter = async (files) => files;

/**
 * Formats each file as the repository's prettier would at the same path in
 * the repository, where its config applies
 */
const repositoryPrettier: Formatter = async (files) => {
  const formatted = await prettierFormatter(repository)(
    files.map(({ path, content }) => ({
      path: join(repository, relative(root, path)),
      content,
    })),
  );
  return formatted.map(({ content }, index) => ({
    path: files[index]!.path,
    content,
  }));
};

let root: string;

function write(files: Record<string, string>) {
  for (const [file, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), content);
  }
}

function read(file: string): string {
  return readFileSync(join(root, file), "utf8");
}

/** Every file under the repository root, with its contents */
function snapshot(): Record<string, string> {
  return Object.fromEntries(
    readdirSync(root, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => {
        const file = join(entry.parentPath, entry.name);
        return [relative(root, file), readFileSync(file, "utf8")];
      }),
  );
}

const barrel = `export { useCallbackRef } from "./use-callback-ref";
export { default as useToast } from "./use-toast";
export { ThemeProvider, ThemeContext, useTheme } from "./use-theme";
`;

beforeEach(() => {
  // A repository root that isn't the working directory, or above it
  root = mkdtempSync(join(tmpdir(), "hook-generator-"));
  write({
    "packages/react/src/hooks/index.ts": barrel,
    "packages/react/src/hooks/use-callback-ref.ts": "useCallbackRef\n",
    "packages/react/src/hooks/use-toast.ts": "useToast\n",
    "packages/react/src/hooks/use-theme.tsx": "useTheme\n",
  });
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

test("says what it wrote", async () => {
  await expect(
    generateHook({
      root,
      slug: "use-probe",
      name: "useProbe",
      format: unformatted,
    }),
  ).resolves.toBe(
    "Added packages/react/src/hooks/use-probe.ts, and exported useProbe from the hooks entry's barrel, packages/react/src/hooks/index.ts",
  );
});

test("writes the hook and the barrel, and nothing else", async () => {
  const before = snapshot();

  await generateHook({
    root,
    slug: "use-probe",
    name: "useProbe",
    format: unformatted,
  });

  const after = snapshot();
  expect(Object.keys(after).sort()).toEqual(
    [...Object.keys(before), "packages/react/src/hooks/use-probe.ts"].sort(),
  );
  for (const [file, content] of Object.entries(before)) {
    if (file !== "packages/react/src/hooks/index.ts") {
      expect(after[file]).toBe(content);
    }
  }
});

test("the hook is a typed function that returns a tuple, formatted with the repository's prettier", async () => {
  await generateHook({
    root,
    slug: "use-probe",
    name: "useProbe",
    format: repositoryPrettier,
  });

  expect(read("packages/react/src/hooks/use-probe.ts"))
    .toBe(`import { type Dispatch, type SetStateAction, useState } from "react";

// TODO: Say what useProbe is for.
/**
 * useProbe hook.
 * @param initialState - The state until it's first set
 * @returns The state, and a function that sets it
 */
function useProbe<T>(
  initialState: T,
): [state: T, setState: Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState(initialState);
  return [state, setState];
}

export { useProbe };
`);
});

test("the barrel exports the hook last, formatted with the repository's prettier", async () => {
  await generateHook({
    root,
    slug: "use-probe",
    name: "useProbe",
    format: repositoryPrettier,
  });

  expect(read("packages/react/src/hooks/index.ts")).toBe(
    `${barrel}export { useProbe } from "./use-probe";\n`,
  );
});

test("adds the line after the barrel's last, even with no newline at its end", async () => {
  write({ "packages/react/src/hooks/index.ts": barrel.trimEnd() });

  await generateHook({
    root,
    slug: "use-probe",
    name: "useProbe",
    format: unformatted,
  });

  expect(read("packages/react/src/hooks/index.ts")).toBe(
    `${barrel}export { useProbe } from "./use-probe";\n`,
  );
});

test("hands every file it writes to the formatter, and writes what it returns", async () => {
  const seen: string[] = [];
  await generateHook({
    root,
    slug: "use-probe",
    name: "useProbe",
    format: async (files) => {
      seen.push(...files.map(({ path }) => relative(root, path)));
      return files.map((file) => ({ ...file, content: "formatted\n" }));
    },
  });

  const written = [
    "packages/react/src/hooks/use-probe.ts",
    "packages/react/src/hooks/index.ts",
  ];
  expect(seen.sort()).toEqual([...written].sort());
  for (const file of written) expect(read(file)).toBe("formatted\n");
});

test("isn't stopped by a name in the barrel that only starts with the hook's", async () => {
  write({
    "packages/react/src/hooks/index.ts": `${barrel}export { useProbeAll } from "./use-probe-all";\n`,
  });

  await generateHook({
    root,
    slug: "use-probe",
    name: "useProbe",
    format: unformatted,
  });

  expect(read("packages/react/src/hooks/index.ts")).toMatch(
    /export \{ useProbe \} from "\.\/use-probe";\n$/,
  );
});

describe("changes nothing, and says why", () => {
  test.each([
    ["the hook", "packages/react/src/hooks/use-probe.ts"],
    [
      "a .tsx file of the hook's name",
      "packages/react/src/hooks/use-probe.tsx",
    ],
  ])("when %s exists already", async (_, existing) => {
    write({ [existing]: "the existing file\n" });
    const before = snapshot();

    await expect(
      generateHook({
        root,
        slug: "use-probe",
        name: "useProbe",
        format: unformatted,
      }),
    ).rejects.toThrow(`${existing} already exists`);
    expect(snapshot()).toEqual(before);
  });

  test("when a hook's .tsx file has its name", async () => {
    const before = snapshot();

    await expect(
      generateHook({
        root,
        slug: "use-theme",
        name: "useTheme",
        format: unformatted,
      }),
    ).rejects.toThrow("packages/react/src/hooks/use-theme.tsx already exists");
    expect(snapshot()).toEqual(before);
  });

  test.each([
    [
      "exports a hook of its name",
      `export { useProbe } from "./probe";\n`,
      "already exports useProbe",
    ],
    [
      "exports from its file",
      `export { default as useThing } from "./use-probe";\n`,
      `already exports from "./use-probe"`,
    ],
  ])("when the barrel %s", async (_, line, error) => {
    write({ "packages/react/src/hooks/index.ts": `${barrel}${line}` });
    const before = snapshot();

    await expect(
      generateHook({
        root,
        slug: "use-probe",
        name: "useProbe",
        format: unformatted,
      }),
    ).rejects.toThrow(`packages/react/src/hooks/index.ts ${error}`);
    expect(snapshot()).toEqual(before);
  });

  test("when the barrel can't be read", async () => {
    rmSync(join(root, "packages/react/src/hooks/index.ts"));
    const before = snapshot();

    await expect(
      generateHook({
        root,
        slug: "use-probe",
        name: "useProbe",
        format: unformatted,
      }),
    ).rejects.toThrow("Can't read packages/react/src/hooks/index.ts");
    expect(snapshot()).toEqual(before);
  });

  test("when formatting fails", async () => {
    const before = snapshot();

    await expect(
      generateHook({
        root,
        slug: "use-probe",
        name: "useProbe",
        format: async () => {
          throw new Error("prettier can't parse this");
        },
      }),
    ).rejects.toThrow("prettier can't parse this");
    expect(snapshot()).toEqual(before);
  });

  test("when the name won't do", async () => {
    const before = snapshot();

    await expect(
      generateHook({
        root,
        slug: "probe",
        name: "probe",
        format: unformatted,
      }),
    ).rejects.toThrow(hookNameError("probe", "probe"));
    expect(snapshot()).toEqual(before);
  });

  test("when turbo gives it no repository root", async () => {
    await expect(
      generateHook({
        root: undefined as unknown as string,
        slug: "use-probe",
        name: "useProbe",
        format: unformatted,
      }),
    ).rejects.toThrow(
      "turbo gen didn't pass the repository root (turbo.paths.root)",
    );
  });
});

describe("a name", () => {
  test.each([
    ["use-probe", "useProbe"],
    ["use-probe-x2", "useProbeX2"],
    ["use-2fa", "use2fa"],
  ])("like %s is fine", (slug, name) => {
    expect(hookNameError(slug, name)).toBeUndefined();
  });

  test.each([
    ["", ""],
    ["use", "use"],
    ["probe", "probe"],
    ["user-list", "userList"],
    ["use-àbc", "useÀbc"],
    ["use-probe-", "useProbe"],
    ["use-probe", "UseProbe"],
    ["use-probe", "use$Probe"],
  ])("like %j, %j won't do", (slug, name) => {
    expect(hookNameError(slug, name)).toMatch(/starts? with use/);
  });
});
