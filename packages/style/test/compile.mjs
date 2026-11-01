// Compiles a consumer's Tailwind 4 stylesheet: Tailwind, then the package's
// main entry, then the `@source` directives that pick the classes to generate.
// Also compiles the precompiled full.css's source, as its build script does.
import fs from "node:fs";
import path from "node:path";

import tailwindcss from "@tailwindcss/postcss";
import postcss from "postcss";

const packageDir = new URL("..", import.meta.url).pathname;
const { exports, scripts } = JSON.parse(
  fs.readFileSync(new URL("../package.json", import.meta.url)),
);

/**
 * @param {string} sources `@source` directives; relative paths resolve from the package directory
 * @param {{ prefix?: string }} [options] `prefix` imports Tailwind with `prefix(<prefix>)`
 * @returns {Promise<string>} the compiled stylesheet
 */
export async function compile(sources, { prefix } = {}) {
  const css = `@import "tailwindcss" source(none)${prefix ? ` prefix(${prefix})` : ""};
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

// The stylesheet the build script compiles into the `./full.css` export
const [, input, output] = scripts.build.match(/-i (\S+) -o (\S+)/);
if (path.normalize(output) !== path.normalize(exports["./full.css"].default)) {
  throw new Error(`The build script writes ${output}, not ./full.css`);
}
const fullSource = path.resolve(packageDir, input);

/**
 * full.css's `@source` directives, with their paths made relative to the
 * package directory, as `compile` takes them
 * @returns {string}
 */
export function fullCssSources() {
  const sources = [];
  postcss
    .parse(fs.readFileSync(fullSource, "utf8"))
    .walkAtRules("source", ({ params }) => {
      const relative = params.startsWith("inline(")
        ? params
        : params.replace(
            /"([^"]+)"/,
            (_, file) =>
              `"${path.relative(packageDir, path.resolve(path.dirname(fullSource), file))}"`,
          );
      sources.push(`@source ${relative};`);
    });
  return sources.join("\n");
}

/**
 * Compiles full.css's source, unminified
 * @param {string} [sources] `@source` directives to add, e.g. for classes a test page uses
 * @returns {Promise<string>} the compiled stylesheet
 */
export async function compileFull(sources = "") {
  const result = await postcss([tailwindcss({ base: packageDir })]).process(
    `${fs.readFileSync(fullSource, "utf8")}\n${sources}`,
    { from: fullSource },
  );
  return result.css;
}
