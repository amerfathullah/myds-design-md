// Captures fixtures/v1-tokens.json: what every token utility in DESIGN.md
// resolves to under @govtechmy/myds-style 1.0.0 (Tailwind 3 and the JS preset).
// The workspace doesn't depend on Tailwind 3, so install v1 somewhere else first:
//
//   npm i --prefix /tmp/myds-v1 @govtechmy/myds-style@1.0.0 tailwindcss@3.4.15 postcss
//   node test/capture-v1-fixture.mjs /tmp/myds-v1
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import { tokenUtilities } from "./token-utilities.mjs";
import { measure } from "./measure.mjs";

const prefix = path.resolve(process.argv[2] ?? "");
const require = createRequire(path.join(prefix, "package.json"));
const tailwind = require("tailwindcss");
const postcss = require("postcss");
// v1 exports no ./package.json, so find the package from its "." entry
const v1 = path.dirname(require.resolve("@govtechmy/myds-style"));
// The preset is an ES module without "type": "module", so read the config it re-exports
const { content, ...preset } = require(path.join(v1, "tailwind.config.js"));

const utilities = tokenUtilities();
const theme = ["color", "light", "dark"]
  .map((file) =>
    fs.readFileSync(path.join(v1, `styles/theme/${file}.css`), "utf8"),
  )
  .join("\n");
const { css } = await postcss([
  tailwind({
    content: [{ raw: utilities.map(({ utility }) => utility).join(" ") }],
    presets: [preset],
  }),
]).process(`${theme}\n@tailwind base;\n@tailwind utilities;`, {
  from: undefined,
});

const fixture = new URL("fixtures/v1-tokens.json", import.meta.url);
fs.mkdirSync(new URL(".", fixture), { recursive: true });
fs.writeFileSync(
  fixture,
  `${JSON.stringify(await measure(css, utilities), null, 2)}\n`,
);
console.log(`Measured ${utilities.length} utilities into ${fixture.pathname}`);
