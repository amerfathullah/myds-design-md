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

// Runs Tailwind over a stylesheet as if it were the file at `from`
async function tailwind(css, from) {
  const result = await postcss([tailwindcss({ base: packageDir })]).process(
    css,
    { from },
  );
  return result.css;
}

/**
 * @param {string} sources `@source` directives; relative paths resolve from the package directory
 * @param {{ prefix?: string }} [options] `prefix` imports Tailwind with `prefix(<prefix>)`
 * @returns {Promise<string>} the compiled stylesheet
 */
export function compile(sources, { prefix } = {}) {
  return tailwind(
    `@import "tailwindcss" source(none)${prefix ? ` prefix(${prefix})` : ""};
@import "./${exports["."].style.replace(/^\.\//, "")}";
${sources}`,
    `${packageDir}consumer.css`,
  );
}

// The stylesheet the build script compiles into the `./full.css` export
function fullSource() {
  const [, input, output] = scripts.build.match(/-i (\S+) -o (\S+)/) ?? [];
  if (
    !output ||
    path.normalize(output) !== path.normalize(exports["./full.css"].default)
  ) {
    throw new Error(
      `The build script (${scripts.build}) doesn't write ./full.css`,
    );
  }
  return path.resolve(packageDir, input);
}

/**
 * full.css's `@source` directives, with their paths made relative to the
 * package directory, as `compile` takes them
 * @returns {string}
 */
export function fullCssSources() {
  const source = fullSource();
  const sources = [];
  postcss
    .parse(fs.readFileSync(source, "utf8"))
    .walkAtRules("source", ({ params }) => {
      const directive = params.startsWith("inline(")
        ? params
        : params.replace(
            /"([^"]+)"/,
            (_, file) =>
              `"${path.relative(packageDir, path.resolve(path.dirname(source), file))}"`,
          );
      sources.push(`@source ${directive};`);
    });
  return sources.join("\n");
}

/**
 * Compiles full.css's source, unminified
 * @param {string} [sources] `@source` directives to add, e.g. for classes a test page uses
 * @returns {Promise<string>} the compiled stylesheet
 */
export function compileFull(sources = "") {
  const source = fullSource();
  return tailwind(`${fs.readFileSync(source, "utf8")}\n${sources}`, source);
}
