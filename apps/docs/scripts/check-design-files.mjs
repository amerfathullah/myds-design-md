// Checks that this repository holds every file under /design/ that a design
// guideline page loads (ADR-0006). It reads only the repository: no network,
// build or browser.
//
//   pnpm --filter @govtechmy/myds-docs check-design-files
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// The docs app's own rule for the file its MDX `img` override shows in the
// dark theme.
import { darkify } from "../lib/constant.ts";

/**
 * Files under /design/ that a design guideline page references but upstream's
 * CloudFront bucket didn't serve when the files were copied from it (#109), so
 * the repository can't hold them. The check doesn't name these.
 */
export const KNOWN_MISSING = [];

// A /design/ path in any syntax: a Markdown image, an <Image> `src` or an
// `s3()` call. Not the end of a longer path or URL, such as /docs/design/… or
// figma.com/design/….
const DESIGN_FILE = /(?<![\w./-])\/design\/[^\s"'`()<>{}[\]]+/g;
const MARKDOWN_IMAGE = /!\[[^\]]*\]\(\s*<?(\/design\/[^\s)>]+)/g;

/**
 * The files under /design/ that the design guideline's pages reference and
 * `publicDir` doesn't hold, in path order, each with the pages (relative to
 * `contentDir`) that reference it. A Markdown image also needs its -dark copy.
 */
export async function findMissingDesignFiles({
  contentDir,
  publicDir,
  knownMissing = [],
}) {
  const pagesByFile = new Map();
  const reference = (file, page) => {
    if (!pagesByFile.has(file)) pagesByFile.set(file, new Set());
    pagesByFile.get(file).add(page);
  };
  for (const page of await guidelinePages(contentDir)) {
    const source = await readFile(path.join(contentDir, page), "utf8");
    for (const [file] of source.matchAll(DESIGN_FILE)) reference(file, page);
    for (const [, file] of source.matchAll(MARKDOWN_IMAGE)) {
      reference(darkify(file), page);
    }
  }
  return [...pagesByFile]
    .filter(([file]) => !knownMissing.includes(file))
    .filter(([file]) => !existsSync(path.join(publicDir, file)))
    .map(([file, pages]) => ({ file, pages: [...pages].sort() }))
    .sort((a, b) => (a.file < b.file ? -1 : 1));
}

async function guidelinePages(contentDir) {
  const entries = await readdir(contentDir, { recursive: true });
  return entries.filter((entry) => entry.endsWith(".mdx"));
}

if (import.meta.main) {
  const contentDir = "content/docs/design";
  const docsApp = (dir) => fileURLToPath(new URL(`../${dir}`, import.meta.url));
  const missing = await findMissingDesignFiles({
    contentDir: docsApp(contentDir),
    publicDir: docsApp("public"),
    knownMissing: KNOWN_MISSING,
  });

  if (missing.length === 0) {
    const known = KNOWN_MISSING.length
      ? `, apart from the ${KNOWN_MISSING.length} known missing`
      : "";
    console.log(
      `public/ holds every file under /design/ that the design guideline references${known}.`,
    );
  } else {
    console.error(
      `public/ is missing ${missing.length} file(s) under /design/ that the design guideline references:\n`,
    );
    for (const { file, pages } of missing) {
      console.error(`  ${file}`);
      for (const page of pages) console.error(`    in ${contentDir}/${page}`);
    }
    console.error(
      "\nCopy each file from upstream's CloudFront bucket into public/ at the same path. If the bucket doesn't serve it, add it to KNOWN_MISSING in scripts/check-design-files.mjs.",
    );
    process.exitCode = 1;
  }
}
