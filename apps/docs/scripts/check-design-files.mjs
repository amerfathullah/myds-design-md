// Checks that this repository holds every file under /design/ that a design
// guideline page loads, and every file under /common/ that the docs site's own
// pages and components load (ADR-0006). It reads only the repository: no
// network, build or browser.
//
//   pnpm --filter @govtechmy/myds-docs check-design-files
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// The docs app's own rule for the file it shows in the dark theme.
import { darkify } from "../lib/constant.ts";

/**
 * Files under /design/ or /common/ that a docs page or component references but
 * upstream's CloudFront bucket didn't serve when the files were copied from it
 * (#109, #110), so the repository can't hold them. The check doesn't name these.
 */
export const KNOWN_MISSING = [];

// A /design/ path in any syntax: a Markdown image, or an <Image> or a video's
// <source> `src`. Not the end of a longer path or URL, such as /docs/design/…
// or figma.com/design/….
const DESIGN_FILE = /(?<![\w./-])\/design\/[^\s"'`()<>{}[\]]+/g;
const MARKDOWN_IMAGE = /!\[[^\]]*\]\(\s*<?(\/design\/[^\s)>]+)/g;

// A /common/ path in any syntax. Not the end of a longer path, URL or import
// path, such as /docs/common/…, https://…/common/… or @/common/….
const COMMON_FILE = /(?<![\w./@~-])\/common\/[^\s"'`()<>{}[\]]+/g;
const COMMON_MARKDOWN_IMAGE = /!\[[^\]]*\]\(\s*<?(\/common\/[^\s)>]+)/g;

/**
 * The docs app's pages and components that name /common/ files the docs also
 * load a -dark copy of, through darkify(), in the dark theme: About's "about"
 * icons, and the home page's preview illustrations, which it hands to
 * PreviewContent. Each /common/ file these name needs its -dark copy too. Add a
 * page or component here when it names /common/ files that darkify() is given.
 */
const DARK_COPIES_OF = [
  "components/home/About.tsx",
  "app/[lang]/(home)/page.tsx",
];

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
  const references = fileReferences();
  for (const page of await guidelinePages(contentDir)) {
    const source = await readFile(path.join(contentDir, page), "utf8");
    for (const [file] of source.matchAll(DESIGN_FILE)) {
      references.add(file, page);
    }
    for (const [, file] of source.matchAll(MARKDOWN_IMAGE)) {
      references.add(darkify(file), page);
    }
  }
  return references.missing({ publicDir, knownMissing });
}

/**
 * The files under /common/ that the docs app's pages and components reference
 * and `publicDir` doesn't hold, in path order, each with the pages and
 * components (relative to `appDir`) that reference it. A Markdown image, and
 * each file a page or component in DARK_COPIES_OF names, also needs its -dark
 * copy.
 */
export async function findMissingCommonFiles({
  appDir,
  publicDir,
  knownMissing = [],
}) {
  const references = fileReferences();
  for (const page of await appSources(appDir)) {
    const source = await readFile(path.join(appDir, page), "utf8");
    for (const [file] of source.matchAll(COMMON_FILE)) {
      references.add(file, page);
      if (DARK_COPIES_OF.includes(page)) references.add(darkify(file), page);
    }
    for (const [, file] of source.matchAll(COMMON_MARKDOWN_IMAGE)) {
      references.add(darkify(file), page);
    }
  }
  return references.missing({ publicDir, knownMissing });
}

// Which pages reference each file.
function fileReferences() {
  const pagesByFile = new Map();
  return {
    add(file, page) {
      if (!pagesByFile.has(file)) pagesByFile.set(file, new Set());
      pagesByFile.get(file).add(page);
    },
    // The files `publicDir` doesn't hold, apart from `knownMissing`, in path
    // order, each with its pages in order.
    missing({ publicDir, knownMissing }) {
      return [...pagesByFile]
        .filter(([file]) => !knownMissing.includes(file))
        .filter(([file]) => !existsSync(path.join(publicDir, file)))
        .map(([file, pages]) => ({ file, pages: [...pages].sort() }))
        .sort((a, b) => (a.file < b.file ? -1 : 1));
    },
  };
}

async function guidelinePages(contentDir) {
  const entries = await readdir(contentDir, { recursive: true });
  return entries.filter((entry) => entry.endsWith(".mdx"));
}

// The docs app's source files, relative to `appDir` and with / between folders.
// Not public/ or scripts/, dependencies, or generated folders such as .next/
// and .source/.
async function appSources(appDir, dir = "") {
  const sources = [];
  const entries = await readdir(path.join(appDir, dir), {
    withFileTypes: true,
  });
  for (const entry of entries) {
    const name = path.posix.join(dir, entry.name);
    if (entry.isDirectory()) {
      const skipped =
        ["public", "scripts"].includes(name) ||
        entry.name === "node_modules" ||
        entry.name.startsWith(".");
      if (!skipped) sources.push(...(await appSources(appDir, name)));
    } else if (/\.(mdx|[jt]sx?)$/.test(entry.name)) {
      sources.push(name);
    }
  }
  return sources;
}

if (import.meta.main) {
  const contentDir = "content/docs/design";
  const docsApp = (dir) => fileURLToPath(new URL(`../${dir}`, import.meta.url));
  const publicDir = docsApp("public");
  const checks = [
    {
      dir: "/design/",
      referencedBy: "the design guideline references",
      pagesIn: contentDir,
      missing: await findMissingDesignFiles({
        contentDir: docsApp(contentDir),
        publicDir,
        knownMissing: KNOWN_MISSING,
      }),
    },
    {
      dir: "/common/",
      referencedBy: "the docs site's pages and components reference",
      pagesIn: "",
      missing: await findMissingCommonFiles({
        appDir: docsApp(""),
        publicDir,
        knownMissing: KNOWN_MISSING,
      }),
    },
  ];

  for (const { dir, referencedBy, pagesIn, missing } of checks) {
    if (missing.length === 0) {
      const knownCount = KNOWN_MISSING.filter((file) =>
        file.startsWith(dir),
      ).length;
      const known = knownCount
        ? `, apart from the ${knownCount} known missing`
        : "";
      console.log(
        `public/ holds every file under ${dir} that ${referencedBy}${known}.`,
      );
    } else {
      console.error(
        `public/ is missing ${missing.length} file(s) under ${dir} that ${referencedBy}:\n`,
      );
      for (const { file, pages } of missing) {
        console.error(`  ${file}`);
        for (const page of pages) {
          console.error(`    in ${path.posix.join(pagesIn, page)}`);
        }
      }
      console.error("");
      process.exitCode = 1;
    }
  }
  if (process.exitCode === 1) {
    console.error(
      "Copy each file from upstream's CloudFront bucket into public/ at the same path. If the bucket doesn't serve it, add it to KNOWN_MISSING in scripts/check-design-files.mjs.",
    );
  }
}
