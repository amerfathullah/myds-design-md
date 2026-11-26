// The fixtures accordion-disabled.page.jsx renders and
// accordion-disabled.test.mjs checks (#226). Each is an Accordion in a box
// `data-test="<id>"`, of `type="multiple"` with two items, "Closed" and
// "Open", the second open by default. Each trigger is marked
// `data-test="<id>-<at>-trigger"`, `at` being "closed" or "open". Each
// fixture says:
// - `wrap`: what the Accordion sits in (see `wraps` in the page), if
//   anything. "outer" puts it in the open item of a disabled outer
//   Accordion, whose trigger is marked `data-test="<id>-outer-trigger"`.
// - `props`: props for Accordion (`root`), each AccordionItem (`item`) and
//   each AccordionTrigger (`trigger`)
// - `single`: the Accordion is `type="single"` and not `collapsible`, so
//   Radix marks its open trigger `aria-disabled="true"` and leaves it enabled
// - `icon`: each trigger holds, as its first child, an icon of the author's
//   own with the class `text-txt-primary`, marked `data-test="<id>-<at>-icon"`
// - `textClass`: the colour class the trigger's `className` passes, if any;
//   `svgClass`: the same for the trigger's `[&>svg]:` children
// - `triggers`: what the test expects of each trigger, in the page's order:
//   whether it's `:disabled` and open, whether Radix marks it
//   `aria-disabled`, and whether #226 changes its look from main
// - `axe`: "same" (axe-core's color-contrast rule finds no violation in it,
//   on main too) or "new" (main dims an enabled trigger, which it finds,
//   and #226 removes that)
// - `topic`: the test that checks the fixture's looks

export const fixtures = [];

/**
 * Adds a fixture. `expectations` maps each trigger's `at` to
 * `[disabled, changes]`, or to `{ disabled, changes, open, ariaDisabled }`.
 */
function add(id, topic, spec, expectations, axe = "same") {
  fixtures.push({
    id,
    topic,
    props: {},
    ...spec,
    axe,
    triggers: Object.entries(expectations).map(([at, expected]) => {
      const { disabled, changes, open, ariaDisabled } = Array.isArray(expected)
        ? { disabled: expected[0], changes: expected[1] }
        : expected;
      return {
        at,
        disabled,
        open: open ?? at !== "closed",
        ariaDisabled: ariaDisabled ?? false,
        changes,
      };
    }),
  });
}

// `disabled` on Accordion or AccordionItem disables both triggers. Main
// already dims a closed one, but an open one kept `txt-black-900` text. On
// AccordionTrigger it sets no `data-disabled`, so main didn't dim either.
add(
  "root-prop",
  "prop",
  { props: { root: { disabled: true } } },
  { closed: [true, false], open: [true, true] },
);
add(
  "item-prop",
  "prop",
  { props: { item: { disabled: true } } },
  { closed: [true, false], open: [true, true] },
);
add(
  "trigger-prop",
  "prop",
  { props: { trigger: { disabled: true } } },
  { closed: [true, true], open: [true, true] },
);

// A disabled fieldset: plain, `group`, around an enabled one, disabled once
// the page has rendered, and with `disabled={false}` on Accordion and
// AccordionItem. It disables both triggers, and sets no `data-disabled`.
for (const [id, spec] of [
  ["fieldset", { wrap: "fieldset" }],
  ["fieldset-group", { wrap: "fieldset-group" }],
  ["nested", { wrap: "nested" }],
  ["late", { wrap: "late" }],
  [
    "props-false",
    {
      wrap: "fieldset",
      props: { root: { disabled: false }, item: { disabled: false } },
    },
  ],
])
  add(id, "fieldset", spec, { closed: [true, true], open: [true, true] });

// Enabled triggers, as on main: at rest, in the first legend of a disabled
// fieldset, plain, `group` or a named group, which the browser leaves
// enabled, and a non-collapsible Accordion's open trigger, which is
// `aria-disabled` but not `:disabled`
add("enabled", "enabled", {}, { closed: [false, false], open: [false, false] });
for (const wrap of ["legend", "legend-group", "legend-named-group"])
  add(
    wrap,
    "enabled",
    { wrap },
    { closed: [false, false], open: [false, false] },
  );
add(
  "single",
  "enabled",
  { single: true },
  {
    closed: [false, false],
    open: { disabled: false, changes: false, ariaDisabled: true },
  },
);

// Triggers that are enabled but carry `data-disabled`, which main dimmed:
// `disabled={false}` or `{undefined}` on AccordionTrigger under a disabled
// AccordionItem or Accordion, which re-enables the button (#432), and a
// hand-passed `data-disabled`
for (const [id, props] of [
  [
    "item-trigger-false",
    { item: { disabled: true }, trigger: { disabled: false } },
  ],
  [
    "item-trigger-undefined",
    { item: { disabled: true }, trigger: { disabled: undefined } },
  ],
  [
    "root-trigger-false",
    { root: { disabled: true }, trigger: { disabled: false } },
  ],
  ["data-disabled", { trigger: { "data-disabled": "" } }],
])
  add(
    id,
    "re-enabled",
    { props },
    { closed: [false, true], open: [false, true] },
    "new",
  );

// An enabled Accordion under a `group` with `data-disabled`: the open item
// of a disabled outer Accordion, and a consumer's own. Main dimmed its
// chevrons. Beside a disabled Button in a consumer's `group`, main didn't.
add(
  "outer",
  "chevron",
  { wrap: "outer" },
  { outer: [true, true], closed: [false, true], open: [false, true] },
);
add(
  "data-disabled-group",
  "chevron",
  { wrap: "data-disabled-group" },
  { closed: [false, true], open: [false, true] },
);
add(
  "group-sibling",
  "chevron",
  { wrap: "group-sibling" },
  { closed: [false, false], open: [false, false] },
);

// The author's own classes: an icon of their own in the trigger, a
// `[&>svg]:` colour on the trigger, and a text colour on it, each under a
// disabled AccordionItem, in a disabled fieldset and in an enabled item
const svgClass = "[&>svg]:text-txt-primary";
const textClass = "text-txt-primary";
for (const [name, spec] of [
  ["icon", { icon: true }],
  ["svg", { svgClass }],
  ["text", { textClass }],
]) {
  add(
    `${name}-prop`,
    "classes",
    { ...spec, props: { item: { disabled: true } } },
    { closed: [true, false], open: [true, true] },
  );
  add(
    `${name}-fieldset`,
    "classes",
    { ...spec, wrap: "fieldset" },
    { closed: [true, true], open: [true, true] },
  );
  add(`${name}-enabled`, "classes", spec, {
    closed: [false, false],
    open: [false, false],
  });
}

// Every trigger, with its fixture and `data-test`, in the page's order
export const triggers = fixtures.flatMap((fixture) =>
  fixture.triggers.map((trigger) => ({
    fixture,
    ...trigger,
    test: `${fixture.id}-${trigger.at}-trigger`,
  })),
);
