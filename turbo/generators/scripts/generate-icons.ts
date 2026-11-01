/**
 * The icon generator: builds a package's icon components and their barrel from
 * its SVG sources.
 *
 * Every path comes from the repository root that turbo gen passes in, never
 * from the working directory or this file's location: turbo gen bundles the
 * generator config, and this file with it, into a single file elsewhere.
 *
 * It reads, converts and formats everything before it touches the output, so a
 * run that fails changes nothing on disk.
 */
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { basename, join, relative } from "node:path";

import { barrelIcon } from "./barrel-icon";
import { componentName, convertIcon } from "./convert-icon";

export type Framework = "react";

export interface OutputFile {
  path: string;
  content: string;
}

/** Formats the generated files before they're written */
export type Formatter = (files: OutputFile[]) => Promise<OutputFile[]>;

export interface GenerateIconsOptions {
  /** The repository root */
  root: string;
  framework: Framework;
  format?: Formatter;
}

// An icon's file and component names come from its source's, so a source is
// named in lower-case dash-case, like `arrow-back.svg`
const sourceName = /^[a-z0-9]+(-[a-z0-9]+)*\.svg$/;

/** The package's icon SVG sources, and the directory its components go in */
export function iconDirectories(root: string, framework: string) {
  const src = join(root, "packages", framework, "src");
  return { sources: join(src, "svg/icons"), output: join(src, "icons") };
}

/**
 * Rebuilds the icon directory from the SVG sources: a component per SVG, and
 * the barrel. Components whose SVG is gone are removed. Resolves to a summary
 * of what it wrote, or rejects, having changed nothing, with what went wrong.
 */
export async function generateIcons({
  root,
  framework,
  format,
}: GenerateIconsOptions): Promise<string> {
  if (typeof root !== "string" || !root) {
    throw new Error(
      "turbo gen didn't pass the repository root (turbo.paths.root)",
    );
  }
  const { sources, output } = iconDirectories(root, framework);
  const svgs = readSources(sources);

  const icons = svgs.map((svg) => basename(svg, ".svg"));
  const files: OutputFile[] = icons.map((icon) => {
    const source = join(sources, `${icon}.svg`);
    try {
      return {
        path: join(output, `${icon}.tsx`),
        content: convertIcon(componentName(icon), readFileSync(source, "utf8")),
      };
    } catch (error) {
      throw new Error(`Can't convert ${source}: ${message(error)}`, {
        cause: error,
      });
    }
  });
  files.push({ path: join(output, "index.ts"), content: barrelIcon(icons) });

  const formatted = await (format ?? prettierFormatter(root))(files);

  // Everything is ready, so only now change the output
  mkdirSync(output, { recursive: true });
  for (const { path, content } of formatted) writeFileSync(path, content);
  const written = new Set(formatted.map(({ path }) => basename(path)));
  const removed = readdirSync(output).filter(
    (file) => file.endsWith(".tsx") && !written.has(file),
  );
  for (const file of removed) rmSync(join(output, file));

  return [
    `Generated ${icons.length} icons and their barrel in ${relative(root, output)}`,
    ...(removed.length ? [`removed ${removed.join(", ")}`] : []),
  ].join("; ");
}

/** The SVG sources' file names, sorted, once they're known to be usable */
function readSources(sources: string): string[] {
  let files: string[];
  try {
    files = readdirSync(sources);
  } catch (error) {
    throw new Error(
      `Can't read the icon SVG sources in ${sources}: ${message(error)}`,
      { cause: error },
    );
  }

  const svgs = files.filter((file) => file.endsWith(".svg")).sort();
  if (svgs.length === 0) {
    throw new Error(`Found no icon SVG sources in ${sources}`);
  }
  const misnamed = svgs.filter((svg) => !sourceName.test(svg));
  if (misnamed.length > 0) {
    throw new Error(
      `Name each icon SVG source in lower-case dash-case, like arrow-back.svg. In ${sources}: ${misnamed.join(", ")}`,
    );
  }
  return svgs;
}

interface Prettier {
  resolveConfig(
    file: string,
    options: { editorconfig: boolean },
  ): Promise<Record<string, unknown> | null>;
  format(source: string, options: Record<string, unknown>): Promise<string>;
}

/**
 * Formats with the repository's own prettier and config, as `pnpm format`
 * does. turbo gen bundles the generator config and its imports into one
 * CommonJS file, and Prettier 3 breaks when bundled, so this loads prettier
 * from the repository at run time instead of importing it.
 */
export function prettierFormatter(root: string): Formatter {
  return async (files) => {
    const prettier = createRequire(join(root, "package.json"))(
      "prettier",
    ) as Prettier;
    return Promise.all(
      files.map(async ({ path, content }) => {
        try {
          const config = await prettier.resolveConfig(path, {
            editorconfig: true,
          });
          return {
            path,
            content: await prettier.format(content, {
              ...config,
              filepath: path,
            }),
          };
        } catch (error) {
          throw new Error(`Can't format ${path}: ${message(error)}`, {
            cause: error,
          });
        }
      }),
    );
  };
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
