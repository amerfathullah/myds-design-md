// @vitest-environment happy-dom
//
// Callout is a note, not an alert (ADR-0010): its root renders `role="note"`
// for every Variant, and nothing it renders is a live region, so screen
// readers read a callout in reading order and don't announce it when it
// appears. A `role` the author passes replaces the default, and an author's
// `aria-label` or `aria-labelledby` names the note.
import {
  act,
  createElement,
  createRef,
  Fragment,
  type ComponentProps,
  type ReactElement,
} from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { computeAccessibleName, getRole } from "dom-accessibility-api";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { Button } from "./button";
import {
  Callout,
  CalloutAction,
  CalloutClose,
  CalloutContent,
  CalloutTitle,
} from "./callout";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

type CalloutProps = Omit<ComponentProps<typeof Callout>, "children" | "ref">;

// Each Variant, and `variant` left out
const variants = [
  ["`variant` omitted", undefined],
  ['`variant="success"`', "success"],
  ['`variant="warning"`', "warning"],
  ['`variant="info"`', "info"],
  ['`variant="danger"`', "danger"],
] as const;

// A callout composed as the docs compose one: a title, a description and an
// action that dismisses it, with the `dismissible` cross. `ref` gets the root.
const callout = (props: CalloutProps = {}, ref = createRef<HTMLDivElement>()) =>
  createElement(
    Callout,
    { dismissible: true, ...props, ref },
    createElement(CalloutTitle, null, "Saved"),
    createElement(CalloutContent, null, "Your changes are saved."),
    createElement(
      CalloutAction,
      null,
      createElement(
        CalloutClose,
        null,
        createElement(Button, { variant: "default-outline" }, "Got it"),
      ),
    ),
  );

const unmounts: (() => Promise<void>)[] = [];

// Mounts `element` in a container on the page, as an app would, and returns
// the container
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

// Mounts a callout with `props` and returns its root, which its ref gets
async function mountCallout(props: CalloutProps = {}) {
  const ref = createRef<HTMLDivElement>();
  await mount(callout(props, ref));
  expect(ref.current).toBeInstanceOf(HTMLDivElement);
  return ref.current!;
}

// The live-region roles, which screen readers announce when their content
// appears or changes
const liveRoles = ["alert", "status", "log"];

// Every element in `within`, `within` too, that is a live region: it has a
// live-region role, set or implicit, or an `aria-live`
const liveRegions = (within: Element) =>
  [within, ...within.querySelectorAll("*")]
    .filter(
      (element) =>
        liveRoles.includes(getRole(element) ?? "") ||
        liveRoles.includes(element.getAttribute("role") ?? "") ||
        element.hasAttribute("aria-live"),
    )
    .map((element) => element.outerHTML);

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

describe.each(variants)("Callout with %s", (_, variant) => {
  test('is a note: its root `<div>` has `role="note"`', async () => {
    const container = await mount(callout({ variant }));
    const [root, ...others] = container.children;
    expect(others).toEqual([]);
    expect(root!.tagName).toBe("DIV");
    expect(root!.getAttribute("role")).toBe("note");
    expect(getRole(root!)).toBe("note");
  });

  test("isn't a live region, and nothing in it is", async () => {
    expect(liveRegions(await mountCallout({ variant }))).toEqual([]);
  });

  test('server markup has `role="note"` on the root `<div>`, and no `role="alert"`', () => {
    const html = renderToStaticMarkup(callout({ variant }));
    const root = html.match(/^<div\s[^>]*>/)?.[0];
    expect(root).toBeDefined();
    expect(root!.match(/\srole="([^"]*)"/)?.[1]).toBe("note");
    expect(html).not.toMatch(/\srole="alert"/);
  });
});

describe("a `role` the author passes", () => {
  test.each(["alert", "status"])(
    'replaces the default: `role="%s"` lands on the root as passed',
    async (role) => {
      const root = await mountCallout({ variant: "danger", role });
      expect(root.getAttribute("role")).toBe(role);
      expect(getRole(root)).toBe(role);
    },
  );
});

describe("an author's name", () => {
  test('`aria-label="Notis"` names the note "Notis"', async () => {
    const root = await mountCallout({ "aria-label": "Notis" });
    expect(getRole(root)).toBe("note");
    expect(computeAccessibleName(root)).toBe("Notis");
  });

  test("`aria-labelledby` names the note from an element outside it", async () => {
    const ref = createRef<HTMLDivElement>();
    const container = await mount(
      createElement(
        Fragment,
        null,
        createElement("h2", { id: "callout-label" }, "Before you apply"),
        callout({ "aria-labelledby": "callout-label" }, ref),
      ),
    );
    const root = ref.current!;
    expect(root.parentElement).toBe(container);
    expect(root.contains(container.querySelector("#callout-label"))).toBe(
      false,
    );
    expect(getRole(root)).toBe("note");
    expect(computeAccessibleName(root)).toBe("Before you apply");
  });
});

describe("the parts", () => {
  test('CalloutTitle has `role="term"` and CalloutContent `role="definition"`', async () => {
    const root = await mountCallout();
    const [title, content, ...others] = root.querySelectorAll("p");
    expect(others).toEqual([]);
    expect(title!.textContent).toBe("Saved");
    expect(getRole(title!)).toBe("term");
    expect(content!.textContent).toBe("Your changes are saved.");
    expect(getRole(content!)).toBe("definition");
  });
});
