// The page select-dropdown-disabled.test.mjs renders in Chromium: each
// fixture of select-dropdown-disabled.cases.mjs, a Select or a Dropdown, in a
// form of its own, inside a disabled fieldset, a fieldset the test disables
// once the page has rendered, the first legend of a disabled fieldset, an
// open and disabled AccordionItem, a consumer's `group`, or nothing. Each
// Select is named `fruit` and holds Apple, picked by default, Banana and
// Cherry. Each Dropdown holds Edit and Delete. Every Select reports to
// `window.calls` the `onOpenChange` and `onValueChange` it gets, every
// Dropdown its `onOpenChange` and its items' `onSelect`, and a consumer's
// `onPointerDown` reports each press. `#start` is an input outside every
// fixture, for the test to focus before a press. The test bundles this file
// with esbuild.
import { useEffect } from "react";
import { createRoot } from "react-dom/client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../react/src/components/accordion";
import { Button } from "../../react/src/components/button";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "../../react/src/components/dropdown";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../react/src/components/select";
import { fixtures, selectKinds } from "./select-dropdown-disabled.cases.mjs";

window.calls = [];
window.ready = false;

// Logs a call of the fixture `id`'s callback `kind` with `value`
const log = (id, kind) => (value) => window.calls.push({ id, kind, value });

// A consumer's `onPointerDown` for the fixture `id`, which logs each press
const logPress = (id) => (event) =>
  window.calls.push({ id, kind: "pointerdown", value: event.pointerType });

// SelectValue's `label` for each fixture `label`
const labels = {
  string: "Fruit",
  element: <SelectLabel>Fruit</SelectLabel>,
  wrapped: (
    <span>
      <SelectLabel>Fruit</SelectLabel>
    </span>
  ),
  classed: <SelectLabel className="text-txt-primary">Fruit</SelectLabel>,
};

function FixtureSelect({
  id,
  kind,
  props,
  label = "string",
  consumerPointerDown,
}) {
  const multiple = kind === "multiple";
  return (
    <Select
      name="fruit"
      multiple={multiple}
      defaultValue={multiple ? ["apple"] : "apple"}
      onOpenChange={log(id, "open")}
      onValueChange={log(id, "value")}
      {...props.root}
    >
      <SelectTrigger
        data-test={`${id}-trigger`}
        {...(consumerPointerDown === "trigger" && {
          onPointerDown: logPress(id),
        })}
        {...props.trigger}
      >
        <SelectValue label={labels[label]} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="cherry">Cherry</SelectItem>
      </SelectContent>
    </Select>
  );
}

function FixtureDropdown({ id, kind, props, consumerPointerDown }) {
  const trigger = {
    "data-test": `${id}-trigger`,
    ...(consumerPointerDown === "trigger" && { onPointerDown: logPress(id) }),
    ...props.trigger,
  };
  return (
    <Dropdown onOpenChange={log(id, "open")}>
      {kind === "asChild" ? (
        <DropdownTrigger asChild {...trigger}>
          <Button
            variant="default-outline"
            {...(consumerPointerDown === "child" && {
              onPointerDown: logPress(id),
            })}
            {...props.child}
          >
            Menu
          </Button>
        </DropdownTrigger>
      ) : (
        <DropdownTrigger {...trigger}>Menu</DropdownTrigger>
      )}
      <DropdownContent>
        <DropdownItem onSelect={() => log(id, "select")("edit")}>
          Edit
        </DropdownItem>
        <DropdownItem onSelect={() => log(id, "select")("delete")}>
          Delete
        </DropdownItem>
      </DropdownContent>
    </Dropdown>
  );
}

// What a fixture's control sits in, by its `wrap`
const wraps = {
  none: (control) => control,
  fieldset: (control) => <fieldset disabled>{control}</fieldset>,
  "fieldset-group": (control) => (
    <fieldset disabled className="group">
      {control}
    </fieldset>
  ),
  nested: (control) => (
    <fieldset disabled>
      <fieldset>{control}</fieldset>
    </fieldset>
  ),
  late: (control) => <fieldset data-late>{control}</fieldset>,
  legend: (control) => (
    <fieldset disabled>
      <legend>{control}</legend>
      <input aria-label="Other" />
    </fieldset>
  ),
  "legend-group": (control) => (
    <fieldset disabled className="group">
      <legend>{control}</legend>
      <input aria-label="Other" />
    </fieldset>
  ),
  "group-sibling": (control) => (
    <div className="group" style={{ display: "flex", gap: 8 }}>
      <Button variant="default-outline" disabled>
        Other
      </Button>
      {control}
    </div>
  ),
  accordion: (control) => (
    <Accordion type="single" defaultValue="item">
      <AccordionItem value="item" disabled>
        <AccordionTrigger>Details</AccordionTrigger>
        <AccordionContent>{control}</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  "data-disabled-group": (control) => (
    <div className="group" data-disabled="">
      {control}
    </div>
  ),
};

function Fixture(fixture) {
  const Control = selectKinds.includes(fixture.kind)
    ? FixtureSelect
    : FixtureDropdown;
  return (
    <div data-test={fixture.id} style={{ margin: 16, width: 320 }}>
      <form
        id={`${fixture.id}-form`}
        onSubmit={(event) => event.preventDefault()}
      >
        {wraps[fixture.wrap ?? "none"](<Control {...fixture} />)}
      </form>
    </div>
  );
}

function Page() {
  useEffect(() => void (window.ready = true), []);
  return (
    <main>
      <input id="start" aria-label="Start" />
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {fixtures.map((fixture) => (
          <Fixture key={fixture.id} {...fixture} />
        ))}
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<Page />);
