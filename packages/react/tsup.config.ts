import { defineConfig } from "tsup";

import { name, version } from "./package.json";

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
  define: {
    __MYDS_REACT_NAME__: JSON.stringify(name),
    __MYDS_REACT_VERSION__: JSON.stringify(version),
  },
}));
