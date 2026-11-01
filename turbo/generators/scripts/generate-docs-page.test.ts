import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { parse } from "yaml";

import {
  type DocsGroup,
  docsGroups,
  generateDocsPage,
} from "./generate-docs-page";

let root: string;
let docs: string;

/** The group folders of a docs content directory's sections */
function groupFolders(content: string): string[] {
  const { pages: sections } = JSON.parse(
    readFileSync(join(content, "meta.json"), "utf8"),
  ) as { pages: string[] };
  return sections.flatMap((section) =>
    readdirSync(join(content, section), { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && /^\(.+\)$/.test(entry.name))
      .map((entry) => `${section}/${entry.name}`),
  );
}

test("the choices are the docs app's group folders, one each", () => {
  const repository = join(import.meta.dirname, "../../..");

  expect([...docsGroups].sort()).toEqual(
    groupFolders(join(repository, "apps/docs/content/docs")).sort(),
  );
});

function write(files: Record<string, string>) {
  for (const [file, content] of Object.entries(files)) {
    mkdirSync(dirname(join(docs, file)), { recursive: true });
    writeFileSync(join(docs, file), content);
  }
}

function read(file: string): string {
  return readFileSync(join(docs, file), "utf8");
}

/** Every file under the docs content, with its contents */
function snapshot(): Record<string, string> {
  return Object.fromEntries(
    readdirSync(docs, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => {
        const file = join(entry.parentPath, entry.name);
        return [file, readFileSync(file, "utf8")];
      }),
  );
}

/** A page's frontmatter, parsed the way the docs app's build parses it */
function frontmatter(file: string): unknown {
  const matter = /^---\r?\n(.+?)\r?\n---\r?\n?/s.exec(read(file))?.[1];
  if (matter === undefined) throw new Error(`${file} has no frontmatter`);
  return parse(matter);
}

beforeEach(() => {
  // A repository root that isn't the working directory, or above it
  root = mkdtempSync(join(tmpdir(), "docs-page-generator-"));
  docs = join(root, "apps/docs/content/docs");
  write({
    "meta.json": `{\n  "pages": ["design", "develop"]\n}\n`,
    "design/index.mdx": "---\ntitle: Design\n---\n",
    "design/(foundation)/color.mdx": "---\ntitle: Colour\n---\n",
    "design/(foundation)/color.ms.mdx": "---\ntitle: Warna\n---\n",
    "design/(components)/button.mdx": "---\ntitle: Button\n---\n",
    "design/(components)/button.ms.mdx": "---\ntitle: Butang\n---\n",
    "design/meta.en.json": `{
  "title": "Design",
  "pages": [
    "index",
    "---Foundation---",
    "(foundation)/color",

    "---Components---",
    "(components)/button"
  ],
  "root": true
}
`,
    "design/meta.ms.json": `{
  "title": "Design",
  "pages": [
    "index",
    "---Dasar Rekaan---",
    "(foundation)/color",

    "---Components---",
    "(components)/button"
  ],
  "root": true
}
`,
  });
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

test("says what it wrote", async () => {
  await expect(
    generateDocsPage({
      root,
      group: "design/(foundation)",
      title: "Probe",
      slug: "probe",
    }),
  ).resolves.toBe(
    "Added apps/docs/content/docs/design/(foundation)/probe.mdx and probe.ms.mdx, and listed the page in apps/docs/content/docs/design/meta.en.json and meta.ms.json",
  );
});

test("is refused when turbo gives it no repository root", async () => {
  await expect(
    generateDocsPage({
      root: undefined as unknown as string,
      group: "design/(foundation)",
      title: "Probe",
      slug: "probe",
    }),
  ).rejects.toThrow(
    "turbo gen didn't pass the repository root (turbo.paths.root)",
  );
});

describe("the pages", () => {
  // Titles YAML would misread unquoted, or that HTML-escaping would mangle
  test.each([
    `Probe: X & "Y"`,
    "2026",
    "true",
    "- Lists & <tags>",
    "# It's 'quoted' \\ back-slashed",
    "  Spaced  ",
  ])(
    "have the title %j as typed, in English and Malay, and an empty description",
    async (title) => {
      await generateDocsPage({
        root,
        group: "design/(foundation)",
        title,
        slug: "probe",
      });

      for (const file of [
        "design/(foundation)/probe.mdx",
        "design/(foundation)/probe.ms.mdx",
      ]) {
        expect(frontmatter(file)).toEqual({ title, description: "" });
      }
    },
  );
});

describe("the sidebar", () => {
  test("lists the page after its group's last page, in English and Malay", async () => {
    await generateDocsPage({
      root,
      group: "design/(foundation)",
      title: "Probe",
      slug: "probe",
    });

    expect(read("design/meta.en.json")).toBe(`{
  "title": "Design",
  "pages": [
    "index",
    "---Foundation---",
    "(foundation)/color",
    "(foundation)/probe",

    "---Components---",
    "(components)/button"
  ],
  "root": true
}
`);
    expect(read("design/meta.ms.json")).toBe(`{
  "title": "Design",
  "pages": [
    "index",
    "---Dasar Rekaan---",
    "(foundation)/color",
    "(foundation)/probe",

    "---Components---",
    "(components)/button"
  ],
  "root": true
}
`);
  });

  test("lists the page last when its group's last page is the sidebar's", async () => {
    await generateDocsPage({
      root,
      group: "design/(components)",
      title: "Probe",
      slug: "probe",
    });

    // JSON has no trailing commas, so the page before it gains one
    expect(read("design/meta.en.json")).toBe(`{
  "title": "Design",
  "pages": [
    "index",
    "---Foundation---",
    "(foundation)/color",

    "---Components---",
    "(components)/button",
    "(components)/probe"
  ],
  "root": true
}
`);
  });
});

describe("a page that exists already", () => {
  test.each(["color.mdx", "color.ms.mdx"])(
    "is refused, changing nothing, when its group has %s",
    async (existing) => {
      rmSync(join(docs, "design/(foundation)/color.mdx"));
      rmSync(join(docs, "design/(foundation)/color.ms.mdx"));
      write({ [`design/(foundation)/${existing}`]: "the existing page\n" });
      const before = snapshot();

      await expect(
        generateDocsPage({
          root,
          group: "design/(foundation)",
          title: "Colour",
          slug: "color",
        }),
      ).rejects.toThrow(`design/(foundation)/${existing}`);
      expect(snapshot()).toEqual(before);
    },
  );

  // Group folders don't appear in URLs, so these would share its URL
  test.each<[string, DocsGroup, string, string]>([
    ["another group", "design/(components)", "color", "(foundation)/color.mdx"],
    ["the section itself", "design/(foundation)", "index", "index.mdx"],
  ])(
    "is refused, changing nothing, when %s has it",
    async (_, group, slug, existing) => {
      const before = snapshot();

      await expect(
        generateDocsPage({ root, group, title: "Probe", slug }),
      ).rejects.toThrow(`design/${existing}`);
      expect(snapshot()).toEqual(before);
    },
  );

  test("in another section doesn't stop it", async () => {
    write({
      "develop/(components)/button.mdx": "---\ntitle: Button\n---\n",
      "develop/meta.en.json": `{\n  "pages": [\n    "(components)/button"\n  ]\n}`,
      "develop/meta.ms.json": `{\n  "pages": [\n    "(components)/button"\n  ]\n}`,
    });

    await generateDocsPage({
      root,
      group: "develop/(components)",
      title: "Colour",
      slug: "color",
    });

    expect(frontmatter("develop/(components)/color.mdx")).toEqual({
      title: "Colour",
      description: "",
    });
  });
});

describe("a sidebar that lists no page in the group", () => {
  test.each(["meta.en.json", "meta.ms.json"])(
    "in %s is refused, changing nothing",
    async (meta) => {
      write({
        [`design/${meta}`]: `{\n  "pages": [\n    "(components)/button"\n  ]\n}\n`,
      });
      const before = snapshot();

      await expect(
        generateDocsPage({
          root,
          group: "design/(foundation)",
          title: "Probe",
          slug: "probe",
        }),
      ).rejects.toThrow(`design/${meta}`);
      expect(snapshot()).toEqual(before);
    },
  );
});

test("a sidebar whose group's last page isn't on a line of its own is refused, changing nothing", async () => {
  write({
    "design/meta.ms.json": `{\n  "pages": [\n    "(foundation)/color", "(components)/button"\n  ]\n}\n`,
  });
  const before = snapshot();

  await expect(
    generateDocsPage({
      root,
      group: "design/(foundation)",
      title: "Probe",
      slug: "probe",
    }),
  ).rejects.toThrow(
    "Can't list the page in apps/docs/content/docs/design/meta.ms.json: put each page on a line of its own",
  );
  expect(snapshot()).toEqual(before);
});
