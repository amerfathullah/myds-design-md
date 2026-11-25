// The fixtures select-dropdown-disabled.page.jsx renders and
// select-dropdown-disabled.test.mjs checks: a Select (single or `multiple`)
// or a Dropdown (a plain DropdownTrigger, or one with `asChild` around a
// `default-outline` Button) in a box `data-test="<id>"`, its trigger marked
// `data-test="<id>-trigger"`. Each fixture says:
// - `kind`: "single", "multiple", "plain" or "asChild"
// - `wrap`: what the control sits in (see `wraps` in the page), if anything
// - `props`: props for Select (`root`), SelectTrigger or DropdownTrigger
//   (`trigger`) and the asChild Button (`child`)
// - `label`: the SelectValue `label` other than the string "Fruit":
//   "element" (a SelectLabel), "wrapped" (a SelectLabel in the consumer's
//   own `<span>`) or "classed" (a SelectLabel with `text-txt-primary`)
// - `consumerPointerDown`: where a consumer's own `onPointerDown` goes,
//   "trigger" or "child"
// - `state`: whether the trigger is `:disabled`, and why: "blocked" (a
//   fieldset or the asChild Button's `disabled` disables it, without the
//   component's own `disabled`), "prop" (`disabled` on Select, SelectTrigger
//   or DropdownTrigger disables it) or "open" (it's enabled). A press opens
//   only an "open" trigger.

export const selectKinds = ["single", "multiple"];
export const dropdownKinds = ["plain", "asChild"];
const kinds = [...selectKinds, ...dropdownKinds];

export const fixtures = [];
const add = (kind, name, spec) =>
  fixtures.push({ id: `${kind}-${name}`, kind, props: {}, ...spec });

for (const kind of kinds) {
  add(kind, "fieldset", { wrap: "fieldset", state: "blocked" });
  add(kind, "fieldset-group", { wrap: "fieldset-group", state: "blocked" });
  add(kind, "nested", { wrap: "nested", state: "blocked" });
  // The test disables this fieldset once the page has rendered
  add(kind, "late", { wrap: "late", state: "blocked" });
  add(kind, "trigger-false", {
    wrap: "fieldset",
    props: { trigger: { disabled: false } },
    state: "blocked",
  });
  add(kind, "trigger-prop", {
    props: { trigger: { disabled: true } },
    state: "prop",
  });
  add(kind, "enabled", { state: "open" });
  // A disabled fieldset leaves enabled the controls in its first legend
  add(kind, "legend-group", { wrap: "legend-group", state: "open" });
  add(kind, "group-sibling", { wrap: "group-sibling", state: "open" });
}

for (const kind of selectKinds) {
  add(kind, "root-false", {
    wrap: "fieldset",
    props: { root: { disabled: false } },
    state: "blocked",
  });
  add(kind, "root-prop", {
    props: { root: { disabled: true } },
    state: "prop",
  });
  for (const label of ["element", "wrapped", "classed"]) {
    add(kind, `${label}-label-fieldset`, {
      wrap: "fieldset",
      label,
      state: "blocked",
    });
    add(kind, `${label}-label-prop`, {
      label,
      props: { root: { disabled: true } },
      state: "prop",
    });
  }
  add(kind, "legend", { wrap: "legend", state: "open" });
  add(kind, "accordion", { wrap: "accordion", state: "open" });
  add(kind, "data-disabled-group", {
    wrap: "data-disabled-group",
    state: "open",
  });
}

add("asChild", "child-disabled", {
  props: { child: { disabled: true } },
  state: "blocked",
});

// A consumer's `onPointerDown` on SelectTrigger, on a plain DropdownTrigger,
// and with `asChild` on DropdownTrigger and on its Button, each on an enabled
// trigger and in a disabled fieldset
for (const [kind, consumerPointerDown, name] of [
  ["single", "trigger", "pointer-down"],
  ["plain", "trigger", "pointer-down"],
  ["asChild", "trigger", "pointer-down"],
  ["asChild", "child", "child-pointer-down"],
]) {
  add(kind, name, { consumerPointerDown, state: "open" });
  add(kind, `${name}-fieldset`, {
    wrap: "fieldset",
    consumerPointerDown,
    state: "blocked",
  });
}
