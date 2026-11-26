// The fixtures radio-disabled.page.jsx renders and radio-disabled.test.mjs
// checks (#225). Each is a Radio in a box `data-test="<id>"`, in the docs'
// layout unless it says otherwise: a RadioItem holding a RadioButton, then a
// `div.grid` holding a RadioLabel (`htmlFor` the button) and a
// RadioHintText. Each fixture says:
// - `shape`: what the box holds (see `shapes` in the page): "option" (one
//   option, the default), "raw" (an option whose button is Radix's own
//   RadioGroup Item, which never reports its state to RadioItem, as an older
//   copy's RadioButton doesn't), "two" (two RadioButtons in one RadioItem),
//   "nested" (an option whose `div.grid` also holds a Radio of RadioItems),
//   "nested-bare" (the same with a Radio of bare RadioButtons), or
//   "nested-fieldset" (the same with a Radio of RadioItems in a disabled
//   fieldset)
// - `wrap`: what the Radio sits in (see `wraps` in the page), if anything
// - `props`: props for Radio (`radio`), RadioItem (`item`), RadioButton or
//   the raw Item (`button`), RadioLabel (`label`) and RadioHintText (`hint`),
//   and the same for the nested Radio's parts (`inner`)
// - `size`: Radio's `size`, `flat`: the label and hint sit directly in
//   RadioItem, `libraryButton`: a disabled library Button sits in RadioItem
// - `options`: what the test expects of each option, marked
//   `data-test="<id>-<at>-radio"` (and `-label`, `-hint`), with `at` "outer"
//   or "inner" for a nested Radio's, and "" for a lone option's (marked
//   `data-test="<id>-radio"`): whether its radio is `:disabled`, the colour
//   tokens of its label and hint, and the hint's `aria-disabled`, `null` for
//   none. A nested bare Radio has a label and no hint.
// - `changes`: what #225 changes from main, for each option: "look" (the
//   label's or hint's colour) and "aria" (the hint's `aria-disabled`); and
//   `axe`: "same" (no colour-contrast violation, on main too), "new" (main
//   has one, and #225 removes it) or "skip" (left out of the check)
// - `topic`: the test that checks the fixture's looks
// - `radios`: for a fixture with no `options`, each radio's `data-test`, its
//   name, and whether it's `:disabled`

// Colour tokens: a dimmed option, a resting one, and a recoloured one
const dim = { label: "txt-black-disabled", hint: "otl-gray-300" };
const rest = { label: "txt-black-700", hint: "txt-black-500" };
const primary = { label: "txt-primary", hint: "txt-primary" };
const classed = {
  label: { className: "text-txt-primary" },
  hint: { className: "text-txt-primary" },
};

export const fixtures = [];

/**
 * Adds a fixture. `options` maps each `at` to its expectations: `disabled`
 * (the radio is `:disabled`), `look` (dim, rest or primary), `aria` and
 * `changes`.
 */
function add(id, topic, spec, options, axe = "same") {
  fixtures.push({
    id,
    topic,
    shape: "option",
    props: {},
    ...spec,
    axe,
    options: Object.entries(options).map(
      ([at, { disabled, look, aria = null, changes = [] }]) => ({
        at,
        disabled,
        label: look.label,
        hint: spec.shape === "nested-bare" && at === "inner" ? null : look.hint,
        aria,
        changes,
      }),
    ),
  });
}

// One option's expectations
const option = (disabled, look, aria, changes) => ({
  "": { disabled, look, aria, changes },
});

// `disabled` on Radio, RadioItem or RadioButton, and #357's case: Radix ORs
// the Radio's `disabled` into the item's
add(
  "radio-prop",
  "prop",
  { props: { radio: { disabled: true } } },
  option(true, dim, "true"),
);
add(
  "item-prop",
  "prop",
  { props: { item: { disabled: true } } },
  option(true, dim, "true"),
);
add(
  "button-prop",
  "prop",
  { props: { button: { disabled: true } } },
  option(true, dim, "true", ["look", "aria"]),
);
add(
  "radio-item-false",
  "prop",
  { props: { radio: { disabled: true }, item: { disabled: false } } },
  option(true, dim, "true", ["look", "aria"]),
);

// A disabled fieldset: plain, `group`, around an enabled one, inside an
// enabled one, around a small Radio whose label and hint sit directly in
// RadioItem, and one the test disables once the page has rendered. It marks
// no hint: checkers exempt everything inside it.
for (const [id, spec] of [
  ["fieldset", { wrap: "fieldset" }],
  ["fieldset-group", { wrap: "fieldset-group" }],
  ["fieldset-outer", { wrap: "nested" }],
  ["fieldset-inner", { wrap: "nested-inner" }],
  ["fieldset-small-flat", { wrap: "fieldset", size: "small", flat: true }],
  ["late", { wrap: "late" }],
])
  add(id, "fieldset", spec, option(true, dim, null, ["look"]));

// A label and hint with their own colour class: it gives way to the dim, by
// a prop and in a fieldset, and applies in an enabled option
add(
  "classed-prop",
  "classed",
  { props: { item: { disabled: true }, ...classed } },
  option(true, dim, "true", ["look"]),
);
add(
  "classed-fieldset",
  "classed",
  { wrap: "fieldset", props: classed },
  option(true, dim, null, ["look"]),
);
add(
  "classed-enabled",
  "classed",
  { props: classed },
  option(false, primary, null),
);

// The text never dims beside an enabled radio. RadioButton's own `disabled`,
// even `undefined`, overrides its RadioItem's, so its radio is enabled.
add(
  "button-false",
  "never",
  { props: { item: { disabled: true }, button: { disabled: false } } },
  option(false, rest, null, ["look", "aria"]),
  "new",
);
add(
  "button-undefined",
  "never",
  { props: { item: { disabled: true }, button: { disabled: undefined } } },
  option(false, rest, null, ["look", "aria"]),
  "new",
);
add("enabled", "never", {}, option(false, rest, null));
// Beside a disabled Button and checkbox in a consumer's `group`, or
// `group/radio-item`, marked `data-disabled`
add(
  "group-sibling",
  "never",
  { wrap: "group-sibling" },
  option(false, rest, null),
);
add(
  "named-group-sibling",
  "never",
  { wrap: "named-group-sibling" },
  option(false, rest, null),
);
// A disabled library Button in the enabled RadioItem
add(
  "library-button",
  "never",
  { libraryButton: true },
  option(false, rest, null),
);
// A disabled fieldset leaves enabled the controls in its first legend
add("legend", "never", { wrap: "legend" }, option(false, rest, null));
add(
  "legend-group",
  "never",
  { wrap: "legend-group" },
  option(false, rest, null),
);

// An enabled option whose `div.grid` holds a nested Radio, its radio
// disabled by the nested Radio's, RadioItem's or RadioButton's `disabled`.
// The nested option dims and the outer one doesn't. A bare RadioButton
// reports to no RadioItem of another Radio, and its label, with no RadioItem
// of its own, reads the outer option's, as on main.
const outerRest = { disabled: false, look: rest };
for (const part of ["radio", "item", "button"])
  add(
    `nested-${part}`,
    "nested",
    { shape: "nested", props: { inner: { [part]: { disabled: true } } } },
    {
      outer: outerRest,
      inner: {
        disabled: true,
        look: dim,
        aria: "true",
        changes: part === "button" ? ["look", "aria"] : [],
      },
    },
  );
for (const part of ["radio", "button"])
  add(
    `nested-bare-${part}`,
    "nested",
    { shape: "nested-bare", props: { inner: { [part]: { disabled: true } } } },
    { outer: outerRest, inner: { disabled: true, look: rest } },
  );
// An enabled option whose `div.grid` holds a Radio in a disabled fieldset
add(
  "nested-fieldset",
  "nested",
  { shape: "nested-fieldset" },
  { outer: outerRest, inner: { disabled: true, look: dim, changes: ["look"] } },
);
// An enabled Radio nested in a disabled RadioItem. Its RadioItems' radios
// stay enabled, and their text with them. A bare RadioButton inherits the
// outer item's `disabled`, as on main, and its label dims with it.
add(
  "in-disabled-item",
  "nested",
  { shape: "nested", props: { item: { disabled: true } } },
  {
    outer: { disabled: true, look: dim, aria: "true" },
    inner: { disabled: false, look: rest },
  },
);
add(
  "in-disabled-item-bare",
  "nested",
  { shape: "nested-bare", props: { item: { disabled: true } } },
  {
    outer: { disabled: true, look: dim, aria: "true" },
    inner: { disabled: true, look: dim },
  },
);

// The hint's `aria-disabled` an author passes: `true` and `false` win, and
// `undefined`, as a forwarding wrapper passes, doesn't erase the computed
// one. With `false` on a hint whose radio a prop disables, the context class
// still dims it, and the author owns its contrast, so axe leaves it out. In a
// fieldset, `false` keeps it from dimming.
const hint = (value) => ({ hint: { "aria-disabled": value } });
add("hint-true", "hint", { props: hint(true) }, option(false, rest, "true"));
add(
  "hint-false-item",
  "hint",
  { props: { item: { disabled: true }, ...hint(false) } },
  option(true, dim, "false"),
  "skip",
);
add(
  "hint-false-button",
  "hint",
  { props: { button: { disabled: true }, ...hint(false) } },
  option(true, dim, "false", ["look"]),
  "skip",
);
add(
  "hint-false-fieldset",
  "hint",
  { wrap: "fieldset", props: hint(false) },
  option(true, { label: dim.label, hint: rest.hint }, "false", ["look"]),
);
add(
  "hint-undefined-item",
  "hint",
  { props: { item: { disabled: true }, ...hint(undefined) } },
  option(true, dim, "true", ["aria"]),
  "new",
);
add(
  "hint-undefined-button",
  "hint",
  { props: { button: { disabled: true }, ...hint(undefined) } },
  option(true, dim, "true", ["look", "aria"]),
);

// A button that never reports its state. Given its RadioItem's `disabled`,
// as an older copy's RadioButton takes it, the context dims and marks the
// text. In a fieldset, or by its own `disabled`, the label dims by CSS, and
// the hint only where checkers exempt it: in the fieldset, not unmarked.
add(
  "raw-item",
  "raw",
  {
    shape: "raw",
    props: { item: { disabled: true }, button: { disabled: true } },
  },
  option(true, dim, "true"),
);
add(
  "raw-fieldset",
  "raw",
  { shape: "raw", wrap: "fieldset" },
  option(true, dim, null, ["look"]),
);
add(
  "raw-button",
  "raw",
  { shape: "raw", props: { button: { disabled: true } } },
  option(true, { label: dim.label, hint: rest.hint }, null, ["look"]),
);
// The author's `aria-disabled={false}` on the hint keeps it undimmed by the
// CSS, in a fieldset and by the button's own `disabled`
add(
  "raw-false-fieldset",
  "raw",
  { shape: "raw", wrap: "fieldset", props: hint(false) },
  option(true, { label: dim.label, hint: rest.hint }, "false", ["look"]),
);
add(
  "raw-false-button",
  "raw",
  { shape: "raw", props: { button: { disabled: true }, ...hint(false) } },
  option(true, { label: dim.label, hint: rest.hint }, "false", ["look"]),
);

// Two RadioButtons in one RadioItem, the second disabled: unsupported, so
// their looks aren't checked, but nothing crashes or logs
fixtures.push({
  id: "two",
  topic: "two",
  shape: "two",
  props: {},
  axe: "skip",
  options: [],
  radios: [
    { test: "two-radio", name: "Apple", disabled: false },
    { test: "two-second-radio", name: "Cherry", disabled: true },
  ],
});

// The fixtures the server renders and the browser hydrates: RadioButton's
// `disabled` alone, which the button reports only once hydrated, #357's
// case, and RadioItem's `disabled`. `before` and `after` are what the test
// expects of the option before and after hydration.
export const serverFixtures = [
  {
    id: "server-button",
    props: { button: { disabled: true } },
    // The label dims by CSS at once. The hint dims only once marked.
    before: { label: dim.label, hint: rest.hint, aria: null },
    after: { label: dim.label, hint: dim.hint, aria: "true" },
    changed: true,
  },
  {
    id: "server-radio-item-false",
    props: { radio: { disabled: true }, item: { disabled: false } },
    before: { label: dim.label, hint: dim.hint, aria: "true" },
    after: { label: dim.label, hint: dim.hint, aria: "true" },
    changed: true,
  },
  {
    id: "server-item",
    props: { item: { disabled: true } },
    before: { label: dim.label, hint: dim.hint, aria: "true" },
    after: { label: dim.label, hint: dim.hint, aria: "true" },
    changed: false,
  },
];
