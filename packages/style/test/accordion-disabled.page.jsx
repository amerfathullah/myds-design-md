// The page accordion-disabled.test.mjs renders in Chromium: each fixture of
// accordion-disabled.cases.mjs, an Accordion in a form of its own, inside a
// disabled fieldset, a fieldset the test disables once the page has
// rendered, the first legend of a disabled fieldset, the open item of a
// disabled outer Accordion, a consumer's `group`, or nothing. `#start` and
// `#end` are inputs before and after every fixture, for the test to Tab
// between. The page sets `window.ready` once React has committed it. The test
// bundles this file with esbuild.
import { useEffect } from "react";
import { createRoot } from "react-dom/client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../react/src/components/accordion";
import { Button } from "../../react/src/components/button";
import { DocumentIcon } from "../../react/src/icons/document";
import { fixtures } from "./accordion-disabled.cases.mjs";

window.ready = false;

function FixtureAccordion({ id, props, single, icon, textClass, svgClass }) {
  const className =
    [textClass, svgClass].filter(Boolean).join(" ") || undefined;
  const item = (value, text) => (
    <AccordionItem value={value} {...props.item}>
      <AccordionTrigger
        data-test={`${id}-${value}-trigger`}
        className={className}
        {...props.trigger}
      >
        {icon && (
          <DocumentIcon
            data-test={`${id}-${value}-icon`}
            className="text-txt-primary"
            aria-hidden
          />
        )}
        {text}
      </AccordionTrigger>
      <AccordionContent>{text} content</AccordionContent>
    </AccordionItem>
  );
  const root = single
    ? { type: "single", defaultValue: "open" }
    : { type: "multiple", defaultValue: ["open"] };
  return (
    <Accordion {...root} {...props.root}>
      {item("closed", "Closed")}
      {item("open", "Open")}
    </Accordion>
  );
}

// What a fixture's Accordion sits in, by its `wrap`
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
  // A group of the name a named-group design would give the trigger
  "legend-named-group": (control) => (
    <fieldset disabled className="group/accordion-trigger">
      <legend>{control}</legend>
      <input aria-label="Other" />
    </fieldset>
  ),
  outer: (control, id) => (
    <Accordion type="multiple" defaultValue={["outer"]} disabled>
      <AccordionItem value="outer">
        <AccordionTrigger data-test={`${id}-outer-trigger`}>
          Outer
        </AccordionTrigger>
        <AccordionContent>{control}</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  "data-disabled-group": (control) => (
    <div className="group" data-disabled="">
      {control}
    </div>
  ),
  "group-sibling": (control) => (
    <div className="group">
      <Button variant="default-outline" disabled>
        Other
      </Button>
      {control}
    </div>
  ),
};

function Fixture(fixture) {
  return (
    <div data-test={fixture.id} style={{ margin: 16, width: 320 }}>
      <form onSubmit={(event) => event.preventDefault()}>
        {wraps[fixture.wrap ?? "none"](
          <FixtureAccordion {...fixture} />,
          fixture.id,
        )}
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
      <input id="end" aria-label="End" />
    </main>
  );
}

createRoot(document.getElementById("root")).render(<Page />);
