// The package's name and version, as `define` entries for anything that
// compiles `src`: tsup, Vitest, and the style package's page tests. The
// registry (`src/utils/registry.ts`) keys the store that every bundled copy
// shares its contexts through on them, so they come from package.json rather
// than a constant kept by hand.
import pkg from "./package.json" with { type: "json" };

export const registryDefine = {
  __MYDS_REACT_NAME__: JSON.stringify(pkg.name),
  __MYDS_REACT_VERSION__: JSON.stringify(pkg.version),
};
