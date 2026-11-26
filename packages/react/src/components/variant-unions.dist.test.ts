// The built declarations list each variant union's members sorted (#239).
// cva infers these unions (`VariantProps`) from a component's variant config,
// and TypeScript prints a union's members in the order it made their types.
// The declaration build makes them in whatever order its files happen to be
// read, which changes from build to build, unless `stableTypeOrdering` is set,
// as tsup.config.ts sets it. So this fails if that option stops taking
// effect. It needs `pnpm build` first, and fails, rather than skips, without
// it.
/// <reference types="node" />
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve, sep } from "node:path";
import { expect, test } from "vitest";

const dist = resolve(__dirname, "../../dist");
if (!existsSync(dist))
  throw new Error(`${dist} doesn't exist: run \`pnpm build\` first`);

// A variant prop, as the declarations print it:
// `variant?: "default" | "fill" | null | undefined`
const variantUnion = /(\w+)\?: ("[^"]*"(?: \| "[^"]*")+) \| null \| undefined/g;

const unions = readdirSync(dist, { recursive: true, encoding: "utf8" })
  .filter((file) => /\.d\.m?ts$/.test(file))
  .flatMap((file) =>
    [...readFileSync(resolve(dist, file), "utf8").matchAll(variantUnion)].map(
      ([, name, members]) => ({
        file: `dist/${file.split(sep).join("/")}`,
        name: name as string,
        members: (members as string)
          .split(" | ")
          .map((member) => JSON.parse(member) as string),
      }),
    ),
  );

test("finds Breadcrumb's variant union in both of its declarations", () => {
  for (const file of [
    "dist/components/breadcrumb.d.ts",
    "dist/components/breadcrumb.d.mts",
  ])
    expect(unions).toContainEqual(
      expect.objectContaining({
        file,
        name: "variant",
        members: expect.arrayContaining(["default", "fill"]),
      }),
    );
});

// In the order TypeScript sorts string literal types: by `<`, code unit by
// code unit, as `sort()` compares strings
test("lists every variant union's members sorted", () => {
  expect(
    unions
      .filter(({ members }) =>
        members.some((member, i) => i > 0 && member < members[i - 1]!),
      )
      .map(
        ({ file, name, members }) =>
          `${file}: ${name}?: ${members.map((member) => JSON.stringify(member)).join(" | ")}`,
      ),
  ).toEqual([]);
});
