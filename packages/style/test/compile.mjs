// Compiles a consumer's Tailwind 4 stylesheet: Tailwind, then the package's
// main entry, then the `@source` directives that pick the classes to generate.
import fs from "node:fs";

import tailwindcss from "@tailwindcss/postcss";
import postcss from "postcss";

const packageDir = new URL("..", import.meta.url).pathname;
const { exports } = JSON.parse(
  fs.readFileSync(new URL("../package.json", import.meta.url)),
);

/**
 * @param {string} sources `@source` directives; relative paths resolve from the package directory
 * @returns {Promise<string>} the compiled stylesheet
 */
export async function compile(sources) {
  const css = `@import "tailwindcss" source(none);
@import "./${exports["."].style.replace(/^\.\//, "")}";
${sources}`;
  const result = await postcss([tailwindcss({ base: packageDir })]).process(
    css,
    {
      from: `${packageDir}consumer.css`,
    },
  );
  return result.css;
}
