import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import {
  type Formatter,
  generateIcons,
  prettierFormatter,
} from "./generate-icons";

const unformatted: Formatter = async (files) => files;

let root: string;
let sources: string;
let icons: string;
let marks: string;

/** Every file under a directory, with its contents */
function snapshot(directory: string): Record<string, string> {
  return Object.fromEntries(
    readdirSync(directory, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => {
        const file = join(entry.parentPath, entry.name);
        return [file, readFileSync(file, "utf8")];
      }),
  );
}

beforeEach(() => {
  // A repository root that isn't the working directory, or above it
  root = mkdtempSync(join(tmpdir(), "icon-generator-"));
  const src = join(root, "packages/react/src");
  sources = join(src, "svg/icons");
  icons = join(src, "icons");
  marks = join(src, "national-marks");
  for (const directory of [sources, icons, marks]) {
    mkdirSync(directory, { recursive: true });
  }
  writeFileSync(
    join(sources, "rss.svg"),
    `<svg xmlns="http://www.w3.org/2000/svg"><path fill="#18181B"/></svg>\n`,
  );
  writeFileSync(
    join(sources, "arrow-back.svg"),
    `<svg xmlns="http://www.w3.org/2000/svg"><path stroke-width="2"/></svg>\n`,
  );
  writeFileSync(join(icons, "rss.tsx"), "the committed RSS icon\n");
  writeFileSync(join(icons, "removed.tsx"), "an icon whose SVG is gone\n");
  writeFileSync(join(icons, "index.ts"), "the committed barrel\n");
  writeFileSync(join(marks, "malaysia-flag.tsx"), "the flag\n");
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("with readable sources", () => {
  test("writes a component per SVG, and the barrel", async () => {
    await generateIcons({ root, framework: "react", format: unformatted });

    expect(readdirSync(icons).sort()).toEqual([
      "arrow-back.tsx",
      "index.ts",
      "rss.tsx",
    ]);
    expect(readFileSync(join(icons, "rss.tsx"), "utf8")).toContain(
      `export const RSSIcon`,
    );
    expect(readFileSync(join(icons, "arrow-back.tsx"), "utf8")).toContain(
      `<path strokeWidth="2"/>`,
    );
    expect(readFileSync(join(icons, "index.ts"), "utf8")).toContain(
      `export * from "./arrow-back";\nexport * from "./rss";`,
    );
  });

  test("leaves the national marks alone", async () => {
    const before = snapshot(marks);
    await generateIcons({ root, framework: "react", format: unformatted });
    expect(snapshot(marks)).toEqual(before);
  });

  test("hands every file to the formatter, and writes what it returns", async () => {
    const seen: string[] = [];
    await generateIcons({
      root,
      framework: "react",
      format: async (files) => {
        seen.push(...files.map(({ path }) => path));
        return files.map((file) => ({ ...file, content: "formatted\n" }));
      },
    });

    expect(seen.sort()).toEqual(
      ["arrow-back.tsx", "index.ts", "rss.tsx"].map((file) =>
        join(icons, file),
      ),
    );
    for (const file of readdirSync(icons)) {
      expect(readFileSync(join(icons, file), "utf8")).toBe("formatted\n");
    }
  });

  test("says what it wrote", async () => {
    await expect(
      generateIcons({ root, framework: "react", format: unformatted }),
    ).resolves.toMatch(/2 icons.*packages\/react\/src\/icons/);
  });
});

describe("changes nothing, and says why", () => {
  test("when the SVG sources are missing", async () => {
    renameSync(sources, `${sources}-moved`);
    const before = snapshot(icons);

    await expect(
      generateIcons({ root, framework: "react", format: unformatted }),
    ).rejects.toThrow(sources);
    expect(snapshot(icons)).toEqual(before);
  });

  test("when there are no SVG sources", async () => {
    for (const file of readdirSync(sources)) rmSync(join(sources, file));
    const before = snapshot(icons);

    await expect(
      generateIcons({ root, framework: "react", format: unformatted }),
    ).rejects.toThrow(sources);
    expect(snapshot(icons)).toEqual(before);
  });

  test("when a source isn't named in lower-case dash-case", async () => {
    renameSync(join(sources, "rss.svg"), join(sources, "RSS.svg"));
    const before = snapshot(icons);

    await expect(
      generateIcons({ root, framework: "react", format: unformatted }),
    ).rejects.toThrow("RSS.svg");
    expect(snapshot(icons)).toEqual(before);
  });

  test("when a source can't be converted", async () => {
    writeFileSync(
      join(sources, "blend.svg"),
      `<svg><g style="mix-blend-mode"/></svg>`,
    );
    const before = snapshot(icons);

    await expect(
      generateIcons({ root, framework: "react", format: unformatted }),
    ).rejects.toThrow("blend.svg");
    expect(snapshot(icons)).toEqual(before);
  });

  test("when formatting fails", async () => {
    const before = snapshot(icons);

    await expect(
      generateIcons({
        root,
        framework: "react",
        format: async () => {
          throw new Error("prettier can't parse this");
        },
      }),
    ).rejects.toThrow("prettier can't parse this");
    expect(snapshot(icons)).toEqual(before);
  });

  test("when turbo gives it no repository root", async () => {
    await expect(
      generateIcons({
        root: undefined as unknown as string,
        framework: "react",
        format: unformatted,
      }),
    ).rejects.toThrow(/root/);
  });
});

describe("the default formatter", () => {
  // This repository, whose prettier and root config the generator formats with
  const repository = resolve(__dirname, "../../..");

  test("formats with the repository's prettier and config", async () => {
    const file = join(repository, "packages/react/src/icons/example.tsx");

    await expect(
      prettierFormatter(repository)([
        { path: file, content: `export const a = 'b'` },
      ]),
    ).resolves.toEqual([{ path: file, content: `export const a = "b";\n` }]);
  });
});
