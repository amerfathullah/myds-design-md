import { defineConfig } from "vitest/config";

import { name, version } from "./package.json";

// The package's name and version, as tsup puts them in (`tsup.config.ts`)
export default defineConfig({
  define: {
    __MYDS_REACT_NAME__: JSON.stringify(name),
    __MYDS_REACT_VERSION__: JSON.stringify(version),
  },
});
