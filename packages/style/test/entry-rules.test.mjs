// Both entries set the same rules for scrolling, mouse focus and underlines,
// so an app looks the same on either. The Tailwind import sets them, and
// full.css, which imports it, adds only the fonts and the box-sizing pair:
// - html gets a 65px scroll padding, which clears the sticky Navbar, and
//   scrolls smoothly unless the user asks for reduced motion;
// - an element focused by the mouse, not the keyboard, shows no outline;
// - `underline`, with any variant, sets the line from the font.
import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";

import postcss from "postcss";

import { compile, compileFull, fullCssSources } from "./compile.mjs";

const collapse = (text) => text.replace(/\s+/g, " ").trim();

// The selectors of Tailwind's preflight, which both entries include as is
const preflightSelectors = new Set();
postcss
  .parse(
    fs.readFileSync(new URL(import.meta.resolve("tailwindcss/preflight.css"))),
  )
  .walkRules((rule) => preflightSelectors.add(collapse(rule.selector)));

// Every declaration of `prop` in a stylesheet: the selector of the rule it's
// in, the at-rules around it (`@layer base @media (…)`), and its value
function declarations(css, prop) {
  const found = [];
  postcss.parse(css).walkDecls(prop, (decl) => {
    const atRules = [];
    let selector;
    for (let node = decl.parent; node.type !== "root"; node = node.parent) {
      if (node.type === "atrule")
        atRules.unshift(`@${node.name} ${node.params}`);
      else selector ??= node.selector;
    }
    found.push({ selector, atRules: atRules.join(" "), value: decl.value });
  });
  return found;
}

// The body of each rule with exactly this selector, nested at-rules included,
// with its whitespace collapsed
function bodies(css, selector) {
  const found = [];
  postcss.parse(css).walkRules((rule) => {
    if (rule.selector === selector) {
      found.push(rule.nodes.join("; ").replace(/\s+/g, " "));
    }
  });
  return found;
}

// Every rule in a stylesheet, in order, as one line: the at-rules and rules
// around it, its selector and its body
function rules(css) {
  const found = [];
  postcss.parse(css).walkRules((rule) => {
    const around = [];
    for (let node = rule.parent; node.type !== "root"; node = node.parent) {
      around.unshift(
        node.type === "atrule" ? `@${node.name} ${node.params}` : node.selector,
      );
    }
    found.push(
      collapse(
        `${around.join(" ")} ${rule.selector} { ${rule.nodes.join("; ")} }`,
      ),
    );
  });
  return found;
}

// The `@import`s Tailwind leaves in a stylesheet, such as a font URL
function imports(css) {
  return postcss
    .parse(css)
    .nodes.filter(({ type, name }) => type === "atrule" && name === "import")
    .map(({ params }) => params);
}

test("the Tailwind import pads html's scroll by 65px, which clears the sticky Navbar", async () => {
  const css = await compile("");
  assert.deepEqual(declarations(css, "scroll-padding-top"), [
    { selector: "html", atRules: "@layer base", value: "65px" },
  ]);
});

test("the Tailwind import scrolls html smoothly only when the user hasn't asked for reduced motion", async () => {
  const css = await compile("");
  assert.deepEqual(declarations(css, "scroll-behavior"), [
    {
      selector: "html",
      atRules: "@layer base @media (prefers-reduced-motion: no-preference)",
      value: "smooth",
    },
  ]);
});

// `--tw-outline-style: none` also empties author outlines such as
// `focus:outline-[3px]`, which read it
test("the Tailwind import hides the outline on mouse focus, as Tailwind's outline-hidden does", async () => {
  const css = await compile(`@source inline("outline-hidden");`);
  const focus = (prop) =>
    declarations(css, prop)
      .filter(({ selector }) => selector === ":focus:not(:focus-visible)")
      .map(({ atRules, value }) => ({ atRules, value }));
  assert.deepEqual(focus("--tw-outline-style"), [
    { atRules: "@layer base", value: "none" },
  ]);
  assert.deepEqual(focus("outline-style"), [
    { atRules: "@layer base", value: "none" },
  ]);
  assert.deepEqual(
    bodies(css, ":focus:not(:focus-visible)"),
    bodies(css, ".outline-hidden"),
  );
});

const underlines = [
  ".underline",
  ".hover\\:underline:hover",
  ".focus-visible\\:underline:focus-visible",
  ".md\\:underline",
];

test("underline, with any variant, sets the line's position from the font", async () => {
  const css = await compile(
    `@source inline("underline hover:underline focus-visible:underline md:underline");`,
  );
  const lines = declarations(css, "text-decoration-line");
  assert.deepEqual(
    lines.map(({ selector }) => selector).sort(),
    [...underlines].sort(),
  );
  // Tailwind may put the position in a rule of its own, later on
  const sorted = (list) => list.map((item) => JSON.stringify(item)).sort();
  assert.deepEqual(
    sorted(declarations(css, "text-underline-position")),
    sorted(lines.map((line) => ({ ...line, value: "from-font" }))),
  );
});

// A `text-decoration` shorthand would reset the style, thickness and colour
// that `decoration-*` utilities set on the same element
test("underline sets no text-decoration shorthand; only Tailwind's preflight does", async () => {
  const css = await compile(
    `@source inline("underline hover:underline focus-visible:underline md:underline");`,
  );
  const shorthands = declarations(css, "text-decoration").filter(
    ({ selector }) => !preflightSelectors.has(collapse(selector)),
  );
  assert.deepEqual(shorthands, []);
});

// `@apply` in the import would fail here: it can't apply an unprefixed class
test("the Tailwind import compiles under a Tailwind prefix, rules included", async () => {
  const css = await compile(`@source inline("tw:underline");`, {
    prefix: "tw",
  });
  assert.equal(declarations(css, "scroll-padding-top").length, 1);
  assert.equal(declarations(css, "scroll-behavior").length, 1);
  assert.deepEqual(
    bodies(css, ":focus:not(:focus-visible)").map((body) =>
      body.includes("--tw-outline-style: none"),
    ),
    [true],
  );
  assert.deepEqual(
    declarations(css, "text-underline-position").map(
      ({ selector }) => selector,
    ),
    [".tw\\:underline"],
  );
});

test("without an underline class in the sources, no underline rule is generated", async () => {
  const css = await compile(`@source inline("bg-bg-white no-underline");`);
  assert.deepEqual(declarations(css, "text-underline-position"), []);
  assert.deepEqual(bodies(css, ".underline"), []);
});

// The one difference between the entries that stays
const boxSizingPair = [
  "@layer base html { box-sizing: border-box }",
  "@layer base *, *:before, *:after { box-sizing: inherit }",
];

test("full.css has the Tailwind import's rules, in order, and adds only the fonts and the box-sizing pair", async () => {
  const [full, imported] = await Promise.all([
    compileFull(),
    compile(fullCssSources()),
  ]);
  const fullRules = rules(full);
  assert.deepEqual(
    fullRules.filter((rule) => boxSizingPair.includes(rule)),
    boxSizingPair,
  );
  assert.deepEqual(
    fullRules.filter((rule) => !boxSizingPair.includes(rule)),
    rules(imported),
  );
  assert.deepEqual(imports(imported), []);
  assert.deepEqual(
    imports(full).map((url) =>
      url.startsWith('url("https://fonts.googleapis.com/'),
    ),
    [true],
  );
});

test("full.css sets each scroll, focus and underline rule once, with no underline shorthand", async () => {
  const full = await compileFull();
  assert.equal(declarations(full, "scroll-padding-top").length, 1);
  assert.equal(declarations(full, "scroll-behavior").length, 1);
  assert.equal(bodies(full, ":focus:not(:focus-visible)").length, 1);
  // Tailwind's own `.underline` rule sets the line, a second the position
  assert.equal(
    declarations(full, "text-underline-position").filter(
      ({ selector }) => selector === ".underline",
    ).length,
    1,
  );
  assert.deepEqual(
    declarations(full, "text-decoration").filter(
      ({ selector }) => !preflightSelectors.has(collapse(selector)),
    ),
    [],
  );
});
