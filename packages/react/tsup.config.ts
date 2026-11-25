import { defineConfig } from "tsup";

import { registryDefine } from "./registry-define.mjs";

export default defineConfig((options) => ({
  ...options,
  entryPoints: [
    "src/components/**/*.tsx",
    "src/hooks/index.ts",
    "src/utils/index.ts",
    "src/icons/index.ts",
  ],
  format: ["cjs", "esm"],
  clean: true,
  dts: true,
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
  },
  // The package's name and version, which key the store that every bundled
  // copy shares its contexts through (`src/utils/registry.ts`)
  define: registryDefine,
}));
