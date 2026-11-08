// @vitest-environment happy-dom
// Components that show icons repeat no id on a page, by themselves or beside
// one another. Icons used to render the Figma layer names in their SVG
// sources as ids, such as `Vector` and `Icon/cross`, so a Callout with a close
// button, a checked Checkbox, an Accordion with two items or two Selects each
// repeated one. An app's own id that matched a layer name, such as
// `<h2 id="Vector">`, then resolved to the icon instead (#153).
import { act, createElement, Fragment, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";
import { Callout, CalloutContent, CalloutTitle } from "./callout";
import { Checkbox } from "./checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// A Select of two fruits, named `label`, composed as the docs compose one
const select = (label: string) =>
  createElement(
    Select,
    null,
    createElement(
      SelectTrigger,
      { "aria-label": label },
      createElement(SelectValue, { placeholder: "Select a fruit" }),
    ),
    createElement(
      SelectContent,
      null,
      createElement(SelectItem, { value: "apple" }, "Apple"),
      createElement(SelectItem, { value: "banana" }, "Banana"),
    ),
  );

// An Accordion item, its trigger showing the chevron
const accordionItem = (value: string) =>
  createElement(
    AccordionItem,
    { value },
    createElement(AccordionTrigger, null, `About ${value}`),
    createElement(AccordionContent, null, `All about ${value}.`),
  );

// One page with each component the issue found repeating an id by itself
const page = createElement(
  Fragment,
  null,
  // Its status icon and its close button's cross
  createElement(
    Callout,
    { dismissible: true },
    createElement(CalloutTitle, null, "Saved"),
    createElement(CalloutContent, null, "Your changes are saved."),
  ),
  // It mounts both the minus and the check, and CSS hides one
  createElement(Checkbox, { defaultChecked: true, "aria-label": "Agree" }),
  createElement(
    Accordion,
    { type: "single", collapsible: true },
    accordionItem("fees"),
    accordionItem("refunds"),
  ),
  select("Fruit"),
  select("Another fruit"),
);

/** Each id that more than one element in `root` has, once */
function repeatedIds(root: ParentNode): string[] {
  const ids = [...root.querySelectorAll("[id]")].map((element) => element.id);
  return [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
}

const unmounts: (() => Promise<void>)[] = [];

// Mounts `element` in a container on the page, as an app would
async function mount(element: ReactElement) {
  const container = document.body.appendChild(document.createElement("div"));
  const root = createRoot(container);
  unmounts.push(async () => {
    await act(async () => root.unmount());
    container.remove();
  });
  await act(async () => root.render(element));
  return container;
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

// No test logs an error or a warning, and nothing is left on the page
afterEach(async () => {
  while (unmounts.length) await unmounts.pop()!();
  const logged = [
    ...vi.mocked(console.error).mock.calls,
    ...vi.mocked(console.warn).mock.calls,
  ];
  vi.restoreAllMocks();
  expect(logged).toEqual([]);
  expect(document.body.innerHTML).toBe("");
});

test("a Callout with a close button, a checked Checkbox, an Accordion with two items and two Selects repeat no id on one page", async () => {
  const container = await mount(page);

  // The Callout's status icon and cross, the Checkbox's minus and check, and
  // a chevron for each Accordion item and each Select, so the check below
  // checks something
  expect(container.querySelectorAll("svg")).toHaveLength(8);
  expect(repeatedIds(document)).toEqual([]);
});

test("they repeat no id in server HTML either", () => {
  const container = document.createElement("div");
  container.innerHTML = renderToStaticMarkup(page);

  expect(container.querySelectorAll("svg")).toHaveLength(8);
  expect(repeatedIds(container)).toEqual([]);
});
