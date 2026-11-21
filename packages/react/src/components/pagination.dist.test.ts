// The `require` and `import` builds each make their own Button, as a second
// install does. An `asChild` PaginationPrevious or PaginationNext from one
// must still give a Button from the other native `disabled` at its end of the
// range, as it does a <button>, and not `aria-disabled`, as it does a link.
// A Node child process loads the built package by its own name from the
// package root and renders on the server. It needs `pnpm build` first, and
// fails, rather than skips, without it.
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
// Each part, and the page of 5 at its end of the range
const parts = { PaginationPrevious: 1, PaginationNext: 5 } as const;

// Renders each part around a Button, each loaded through each condition, on
// its end page and on page 3, and prints the <button> each renders
const program = `
  import { createRequire } from "node:module";
  const require = createRequire(process.cwd() + "/package.json");
  const { createElement } = require("react");
  const { renderToStaticMarkup } = require("react-dom/server");
  const entry = (path) => ${JSON.stringify(name)} + "/" + path;
  const load = async (path) => ({
    require: require(entry(path)),
    import: await import(entry(path)),
  });
  const pagination = await load("pagination");
  const button = await load("button");
  const results = [];
  for (const [part, end] of Object.entries(${JSON.stringify(parts)}))
    for (const from of ${JSON.stringify(conditions)})
      for (const child of ${JSON.stringify(conditions)})
        for (const page of [end, 3]) {
          const html = renderToStaticMarkup(
            createElement(
              pagination[from].Pagination,
              { count: 50, limit: 10, page, onPageChange: () => {} },
              createElement(
                pagination[from][part],
                { asChild: true },
                createElement(button[child].Button, null, "Pergi"),
              ),
            ),
          );
          const tag = html.match(/<button[^>]*>/)?.[0] ?? "";
          results.push({
            part,
            from,
            child,
            page,
            disabled: / disabled=""/.test(tag),
            ariaDisabled: / aria-disabled=/.test(tag),
          });
        }
  process.stdout.write(
    JSON.stringify({
      separate: button.require.Button !== button.import.Button,
      results,
    }),
  );
`;

test("an `asChild` previous or next part natively disables a Button from either build at its end of the range", async () => {
  for (const entry of ["pagination", "button"])
    for (const condition of conditions)
      expect(
        existsSync(
          resolve(
            root,
            `dist/components/${entry}.${condition === "import" ? "mjs" : "js"}`,
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
    results: Record<string, unknown>[];
  };
  // Otherwise this would check nothing the unit test doesn't
  expect(separate).toBe(true);
  expect(results).toEqual(
    Object.entries(parts).flatMap(([part, end]) =>
      conditions.flatMap((from) =>
        conditions.flatMap((child) =>
          [end, 3].map((page) => ({
            part,
            from,
            child,
            page,
            disabled: page === end,
            ariaDisabled: false,
          })),
        ),
      ),
    ),
  );
}, 30_000);
