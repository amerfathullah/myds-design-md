import { defineConfig } from "vitest/config";

import { registryDefine } from "./registry-define.mjs";

// The package's name and version, as tsup puts them in (`tsup.config.ts`)
export default defineConfig({ define: registryDefine });
