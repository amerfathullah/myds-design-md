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
  minify: true,
  // The package's name and version, which key the store that every bundled
  // copy shares its contexts through (`src/utils/registry.ts`)
  define: registryDefine,
}));
