// The `require` and `import` builds each make their own InputIcon, as a
// second install does. An Input from one must still make room for an
// InputIcon from the other, `position` or not (#123, as #235 did for the
// contexts). A Node child process loads the built package by its own name
// from the package root and renders on the server. It needs `pnpm build`
// first, and fails, rather than skips, without it.
/// <reference types="node" />
import { execFile } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { promisify } from "node:util";
import { expect, test } from "vitest";

const root = resolve(__dirname, "../..");
const { name } = JSON.parse(
  readFileSync(resolve(root, "package.json"), "utf8"),
) as { name: string };

const conditions = ["require", "import"] as const;
// How each case gives InputIcon its `position`: not at all, as
// `position={undefined}`, or as a side
const positions = ["omitted", "undefined", "left", "right"] as const;

// Renders an Input holding one InputIcon, each loaded through each
// condition, and prints the room the <input> makes on each side and the side
// class the icon draws on
const program = `
  import { createRequire } from "node:module";
  const require = createRequire(process.cwd() + "/package.json");
  const { createElement } = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const entry = ${JSON.stringify(`${name}/input`)};
  const via = { require: require(entry), import: await import(entry) };
  const attribute = (html, name) =>
    html.match(new RegExp(name + '="([^"]*)"'))?.[1];
  const results = [];
  for (const input of ${JSON.stringify(conditions)})
    for (const icon of ${JSON.stringify(conditions)})
      for (const position of ${JSON.stringify(positions)}) {
        const html = renderToStaticMarkup(
          createElement(
            via[input].Input,
            null,
            createElement(
              via[icon].InputIcon,
              position === "omitted"
                ? null
                : { position: position === "undefined" ? undefined : position },
              createElement("svg"),
            ),
          ),
        );
        results.push({
          input,
          icon,
          position,
          left: attribute(html, "data-has-left-icon"),
          right: attribute(html, "data-has-right-icon"),
          side: attribute(html.slice(html.indexOf("<svg")), "class")
            ?.split(" ")
            .find((name) => name === "left-3" || name === "right-3"),
        });
      }
  process.stdout.write(
    JSON.stringify({
      separate: via.require.InputIcon !== via.import.InputIcon,
      results,
    }),
  );
`;

test("an Input makes room for an InputIcon from either build, on the side it draws on", async () => {
  for (const condition of conditions)
    expect(
      existsSync(
        resolve(
          root,
          `dist/components/input.${condition === "import" ? "mjs" : "js"}`,
        ),
      ),
      "run `pnpm build` first",
    ).toBe(true);
  const { stdout } = await promisify(execFile)(
    process.execPath,
    ["--input-type=module", "--eval", program],
    { cwd: root, encoding: "utf8" },
  );
  const { separate, results } = JSON.parse(stdout) as {
    separate: boolean;
    results: Record<string, string | undefined>[];
  };
  // Otherwise this would check nothing the unit test doesn't
  expect(separate).toBe(true);
  const expected = { left: "true", right: "false", side: "left-3" };
  expect(results).toEqual(
    conditions.flatMap((input) =>
      conditions.flatMap((icon) =>
        positions.map((position) => ({
          input,
          icon,
          position,
          ...(position === "right"
            ? { left: "false", right: "true", side: "right-3" }
            : expected),
        })),
      ),
    ),
  );
}, 30_000);
