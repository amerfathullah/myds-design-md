import { defineConfig } from "tsup";

import { registryDefine } from "./registry-define.mjs";

export default defineConfig((options) => ({
  ...options,
  // Every entry has a subpath in `exports`, and every subpath an entry
  // (`src/utils/entry-points.test.ts`). Keep this a list of string literals:
  // the tests read it. tsup globs it with tinyglobby, which reads a leading
  // `!` as an ignore.
  entryPoints: [
    "src/components/**/*.tsx",
    // Internal: only the date pickers use them, and no subpath loads them
    // (#236). Their code is built into the pickers and the chunks those import.
    "!src/components/calendar.tsx",
    "!src/components/popover.tsx",
    "src/hooks/index.ts",
    "src/utils/index.ts",
    "src/icons/index.ts",
  ],
  format: ["cjs", "esm"],
  clean: true,
  // Declarations list a union's members sorted, not in the order TypeScript
  // made their types, which changes from build to build: the declaration
  // build reads its files concurrently (#239). `stableTypeOrdering` is a
  // hidden TypeScript 6.0 option, meant for the move to TypeScript 7, which
  // orders them so by default. tsup ignores an option TypeScript doesn't
  // know, silently, so `variant-unions.dist.test.ts` fails if it stops
  // taking effect.
  dts: { compilerOptions: { stableTypeOrdering: true } },
  sourcemap: true,
  external: ["react"],
  // Minified, but for whitespace and comments: `minify: true` strips the
  // `@__PURE__` marks on the calls that make each icon. An app's bundler
  // needs them to drop the icons it doesn't use, from the icon entry and from
  // the chunk it shares with the component entries that import an icon
  // (#215). The app's own build minifies the rest.
  minify: false,
  esbuildOptions(esbuild) {
    esbuild.minifySyntax = true;
    esbuild.minifyIdentifiers = true;
    // esbuild names and fills the shared ESM chunks by the order of the
    // entries, and tsup gives it them in the order tinyglobby found them,
    // which changes from build to build (#239). So sort them, in a copy: the
    // array is tsup's own. `pnpm check-reproducible` fails without this.
    if (Array.isArray(esbuild.entryPoints))
      esbuild.entryPoints = [...esbuild.entryPoints].sort();
  },
  // The package's name and version, which key the store that every bundled
  // copy shares its contexts through (`src/utils/registry.ts`)
  define: registryDefine,
}));
