// An app that imports one icon from the built package bundles that icon
// alone, and an app that imports only SearchBar bundles no icon but the two
// its parts draw (#215). Each icon is made by calls to `forwardRef()` and
// `Object.assign()`, and a bundler keeps a call it can't prove is free of side
// effects, so the icon generator marks both `@__PURE__`. This checks that the
// marks reach the built package: tsup's `minify: true` strips them, and an app
// that imported one icon from the chunk the icon entry shares with the
// component entries would then bundle every icon in it. It bundles with
// esbuild, as an app's bundler would; Rollup and webpack read the marks the
// same way. It needs `pnpm build` first, and fails, rather than skips, without
// it.
/// <reference types="node" />
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { build } from "esbuild";
import { describe, expect, test } from "vitest";

const root = resolve(__dirname, "../..");
const dist = resolve(root, "dist");

/**
 * The bundle of an app whose only module is `code`, which imports the built
 * package's files by their paths. The package's dependencies, React among
 * them, stay out of it.
 */
async function bundle(code: string): Promise<string> {
  const { outputFiles } = await build({
    stdin: { contents: code, resolveDir: root, loader: "js" },
    bundle: true,
    write: false,
    format: "esm",
    platform: "browser",
    packages: "external",
    logLevel: "silent",
  });
  return outputFiles.map(({ text }) => text).join("\n");
}

/**
 * How many icons the code holds. Each icon, and each national mark, renders
 * one `<svg>` with a `viewBox`, and no other component renders one.
 */
const iconCount = (code: string) => code.match(/\bviewBox\b/g)?.length ?? 0;

/** The path data of the icon's SVG source, which its component draws */
function pathData(source: string): string[] {
  const svg = readFileSync(
    resolve(__dirname, "icons", `${source}.svg`),
    "utf8",
  );
  const paths = [...svg.matchAll(/\sd="([^"]+)"/g)].map(([, d]) => d!);
  if (!paths.length) throw new Error(`${source}.svg draws no path`);
  return paths;
}

/** The built ES module that holds the icon's component */
function builtFile(source: string): string {
  const [d] = pathData(source);
  const files = readdirSync(dist, { recursive: true, encoding: "utf8" })
    .filter((file) => file.endsWith(".mjs"))
    .filter((file) => readFileSync(resolve(dist, file), "utf8").includes(d!));
  expect(files, `the built files that draw ${source}.svg`).toHaveLength(1);
  return readFileSync(resolve(dist, files[0]!), "utf8");
}

describe.each([
  {
    icon: "AccessibleIcon",
    source: "accessible",
    // Built with 200-odd other icons, into the chunk that the icon entry
    // shares with the component entries that import an icon
    sharesItsFile: true,
  },
  {
    icon: "ChevronDownIcon",
    source: "chevron-down",
    // Built into a chunk of its own
    sharesItsFile: false,
  },
])(
  "an app that imports $icon from the icon entry",
  ({ icon, source, sharesItsFile }) => {
    test(`finds it ${sharesItsFile ? "beside other icons" : "on its own"} in the built package`, () => {
      const count = iconCount(builtFile(source));
      if (sharesItsFile) expect(count).toBeGreaterThan(100);
      else expect(count).toBe(1);
    });

    test("bundles that icon alone", async () => {
      const app = await bundle(
        `export { ${icon} } from "./dist/icons/index.mjs";`,
      );

      expect(iconCount(app)).toBe(1);
      for (const d of pathData(source)) expect(app).toContain(d);
    });
  },
);

// SearchBar itself draws no icon. Its entry loads the chunk that holds the
// icons, for the parts that draw them, so an app that imports SearchBar alone
// would bundle every icon in that chunk if the marks were lost. It does still
// bundle the two that SearchBarSearchButton and SearchBarClearButton draw. Each
// part's `displayName` is set by an assignment, which a bundler keeps, and it
// keeps the part with it (#212). Marking the components' own calls pure is
// another change.
test("an app that imports only SearchBar from its entry bundles only the icons its parts draw", async () => {
  const app = await bundle(
    `export { SearchBar } from "./dist/components/search-bar.mjs";`,
  );

  expect(
    iconCount(readFileSync(resolve(dist, "components/search-bar.mjs"), "utf8")),
    "icons built into the entry itself",
  ).toBe(0);
  expect(app).toContain("SearchBar");
  expect(iconCount(app)).toBe(2);
  for (const d of [...pathData("search"), ...pathData("cross")]) {
    expect(app).toContain(d);
  }
});
