/**
 * The mdx generator: adds a page to the docs app, in English and Malay, and
 * lists it in its section's sidebar.
 *
 * The docs root lists its sections, and each section's meta files list its
 * pages, in sidebar order, as `(<group>)/<page>`. A page they don't list isn't
 * in the sidebar. Group folders, like `(foundation)`, don't appear in URLs.
 *
 * Every path comes from the repository root that turbo gen passes in. It
 * checks and prepares everything before it touches the docs, so a run that
 * fails changes nothing.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";

/** Every group folder of the docs app's sections, in sidebar order */
export const docsGroups = [
  "design/(foundation)",
  "design/(components)",
  "develop/(getting-started)",
  "develop/(installation)",
  "develop/(template)",
  "develop/(components)",
  "develop/(hooks)",
] as const;

export type DocsGroup = (typeof docsGroups)[number];

export interface GenerateDocsPageOptions {
  /** The repository root */
  root: string;
  /** The section and group folder the page goes in */
  group: DocsGroup;
  /** The page's title, as typed */
  title: string;
  /** The page's file name, without its extension */
  slug: string;
}

/**
 * Writes the page's English and Malay files in its group folder, and lists it
 * in both of its section's meta files. Resolves to a summary of what it wrote,
 * or rejects, having changed nothing, with what went wrong.
 */
export async function generateDocsPage({
  root,
  group,
  title,
  slug,
}: GenerateDocsPageOptions): Promise<string> {
  if (typeof root !== "string" || !root) {
    throw new Error(
      "turbo gen didn't pass the repository root (turbo.paths.root)",
    );
  }
  const section = join(root, "apps/docs/content/docs", dirname(group));
  const folder = basename(group);
  const pages = [`${slug}.mdx`, `${slug}.ms.mdx`] as const;

  // Group folders don't appear in URLs, so a page of the same name anywhere in
  // the section, in its group, another group or the section itself, would
  // share its URL
  const folders = [
    section,
    ...readdirSync(section, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && /^\(.+\)$/.test(entry.name))
      .map((entry) => join(section, entry.name)),
  ];
  const existing = folders
    .flatMap((path) => pages.map((page) => join(path, page)))
    .filter((path) => existsSync(path));
  if (existing.length > 0) {
    throw new Error(
      `A page named ${slug} exists already: ${existing.map((path) => relative(root, path)).join(", ")}`,
    );
  }

  const metas = ["meta.en.json", "meta.ms.json"] as const;
  const files = [
    ...pages.map((page) => ({
      path: join(section, folder, page),
      content: frontmatter(title),
    })),
    ...metas.map((meta) => {
      const path = join(section, meta);
      try {
        return {
          path,
          content: listPage(readFileSync(path, "utf8"), folder, slug),
        };
      } catch (error) {
        throw new Error(
          `Can't list the page in ${relative(root, path)}: ${message(error)}`,
          { cause: error },
        );
      }
    }),
  ];

  // Everything is ready, so only now change the docs
  for (const { path, content } of files) writeFileSync(path, content);
  return [
    `Added ${relative(root, join(section, folder, pages[0]))} and ${pages[1]}`,
    `and listed the page in ${relative(root, join(section, metas[0]))} and ${metas[1]}`,
  ].join(", ");
}

/**
 * The section's meta file with the page listed right after its group's last
 * page. Only that line is added: the rest of the file stays as it was.
 */
function listPage(meta: string, folder: string, slug: string): string {
  const lines = meta.split("\n");
  const last = lines.findLastIndex((line) =>
    line.trimStart().startsWith(`"${folder}/`),
  );
  if (last === -1) throw new Error(`it lists no page in ${folder}`);
  const match = /^(\s*)("[^"]*")(,?)(\s*)$/.exec(lines[last]!);
  if (!match) throw new Error("put each page on a line of its own");
  const [, indent, entry, comma, end] = match;
  const page = JSON.stringify(`${folder}/${slug}`);
  // JSON has no trailing commas, so a page listed last gives the new one its
  // comma
  lines.splice(
    last,
    1,
    `${indent}${entry},${end}`,
    `${indent}${page}${comma}${end}`,
  );
  return lines.join("\n");
}

/**
 * The frontmatter of a page whose author has yet to write it. The title is a
 * YAML double-quoted string, so it parses to exactly what was typed: a JSON
 * string is one, with every character YAML treats specially escaped. The Malay
 * page keeps the English title until someone translates it.
 */
function frontmatter(title: string): string {
  return `---\ntitle: ${JSON.stringify(title)}\ndescription: ""\n---\n`;
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
