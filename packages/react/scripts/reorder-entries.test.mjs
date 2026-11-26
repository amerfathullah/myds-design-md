// The orders `check-reproducible.mjs` forces on tsup's entries (#239). The
// check also takes the order it expects a rebuild to have from `order()`, so
// an `order()` that put the entries in the wrong orders could pass the check
// without testing anything. This pins it.
import { createRequire } from "node:module";
import { expect, test } from "vitest";

const { order } = createRequire(import.meta.url)("./reorder-entries.cjs");

// As tinyglobby might find them: folder by folder, in no fixed order
const found = [
  "src/hooks/index.ts",
  "src/components/tag.tsx",
  "src/utils/index.ts",
  "src/components/nested/deep.tsx",
  "src/components/button.tsx",
];

test("`reverse` gives every entry, sorted, last to first", () => {
  expect(order(found, "reverse")).toEqual([
    "src/utils/index.ts",
    "src/hooks/index.ts",
    "src/components/tag.tsx",
    "src/components/nested/deep.tsx",
    "src/components/button.tsx",
  ]);
});

test("`first:<folder>` gives that folder's own files, sorted, then the others, sorted", () => {
  expect(order(found, "first:src/hooks")).toEqual([
    "src/hooks/index.ts",
    "src/components/button.tsx",
    "src/components/nested/deep.tsx",
    "src/components/tag.tsx",
    "src/utils/index.ts",
  ]);
  // Not the files of a folder inside it
  expect(order(found, "first:src/components")).toEqual([
    "src/components/button.tsx",
    "src/components/tag.tsx",
    "src/components/nested/deep.tsx",
    "src/hooks/index.ts",
    "src/utils/index.ts",
  ]);
  expect(order(found, "first:src/components/nested")).toEqual([
    "src/components/nested/deep.tsx",
    "src/components/button.tsx",
    "src/components/tag.tsx",
    "src/hooks/index.ts",
    "src/utils/index.ts",
  ]);
});

test("leaves the entries it's given as they were", () => {
  const copy = [...found];
  order(found, "reverse");
  order(found, "first:src/utils");
  expect(found).toEqual(copy);
});

test("throws on a spec it doesn't know, and on a folder with no entry", () => {
  expect(() => order(found, "shuffle")).toThrow(/first:<folder>/);
  expect(() => order(found, "first:src/icons")).toThrow(
    /No entry is in src\/icons/,
  );
});
