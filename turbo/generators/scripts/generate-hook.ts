/**
 * The hook generator: adds a hook to the react package, and exports it from
 * the package's hooks entry, `@amerfathullah/myds-react/hooks`, through the
 * entry's barrel.
 *
 * Every path comes from the repository root that turbo gen passes in. It
 * checks and prepares everything before it touches the repository, so a run
 * that fails changes nothing.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

import {
  type Formatter,
  type OutputFile,
  prettierFormatter,
} from "./generate-icons";

export interface GenerateHookOptions {
  /** The repository root */
  root: string;
  /** The hook's file name, in dash-case, like `use-probe` */
  slug: string;
  /** The hook's name, in camelCase, like `useProbe` */
  name: string;
  format?: Formatter;
}

const slugPattern = /^use(-[a-z0-9]+)+$/;
const namePattern = /^use[A-Z0-9][A-Za-z0-9]*$/;

/**
 * Why a hook can't have this file name and name, or undefined if it can. The
 * name is an identifier, and React's rules of hooks expect it to start with
 * `use`.
 */
export function hookNameError(slug: string, name: string): string | undefined {
  if (slugPattern.test(slug) && namePattern.test(name)) return undefined;
  return `Can't name a hook ${JSON.stringify(slug)}: a hook's name starts with use, and has only letters and digits, separating words with dashes, like use-probe`;
}

/**
 * Writes the hook, and exports it from the hooks entry's barrel. Resolves to a
 * summary of what it wrote, or rejects, having changed nothing, with what went
 * wrong.
 */
export async function generateHook({
  root,
  slug,
  name,
  format,
}: GenerateHookOptions): Promise<string> {
  if (typeof root !== "string" || !root) {
    throw new Error(
      "turbo gen didn't pass the repository root (turbo.paths.root)",
    );
  }
  const nameError = hookNameError(slug, name);
  if (nameError) throw new Error(nameError);

  const hooks = join(root, "packages/react/src/hooks");
  const hookPath = join(hooks, `${slug}.ts`);
  const barrelPath = join(hooks, "index.ts");

  let barrel: string;
  try {
    barrel = readFileSync(barrelPath, "utf8");
  } catch (error) {
    throw new Error(
      `Can't read ${relative(root, barrelPath)}: ${message(error)}`,
      { cause: error },
    );
  }

  // A .tsx file of the same name would make `./<slug>` ambiguous
  const existing = [hookPath, join(hooks, `${slug}.tsx`)]
    .filter((path) => existsSync(path))
    .map((path) => relative(root, path));
  const problems = [
    ...existing.map((path) => `${path} already exists`),
    ...(new RegExp(`\\b${name}\\b`).test(barrel)
      ? [`${relative(root, barrelPath)} already exports ${name}`]
      : []),
    ...(new RegExp(`["']\\./${slug}(\\.tsx?)?["']`).test(barrel)
      ? [`${relative(root, barrelPath)} already exports from "./${slug}"`]
      : []),
  ];
  if (problems.length > 0) {
    throw new Error(`Can't add the hook ${slug}: ${problems.join("; ")}`);
  }

  const files: OutputFile[] = [
    { path: hookPath, content: hook(name) },
    {
      path: barrelPath,
      content: `${barrel.replace(/\n*$/, "\n")}export { ${name} } from "./${slug}";\n`,
    },
  ];
  const formatted = await (format ?? prettierFormatter(root))(files);

  // Everything is ready, so only now change the repository
  for (const { path, content } of formatted) writeFileSync(path, content);
  return `Added ${relative(root, hookPath)}, and exported ${name} from the hooks entry's barrel, ${relative(root, barrelPath)}`;
}

/**
 * A hook with typed parameters and a tuple return type, so its declarations
 * say what it takes and returns
 */
function hook(name: string): string {
  return `import { type Dispatch, type SetStateAction, useState } from "react";

// TODO: Say what ${name} is for.
/**
 * ${name} hook.
 * @param initialState - The state until it's first set
 * @returns The state, and a function that sets it
 */
function ${name}<T>(
  initialState: T,
): [state: T, setState: Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState(initialState);
  return [state, setState];
}

export { ${name} };
`;
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
