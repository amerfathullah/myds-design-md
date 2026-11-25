// @vitest-environment happy-dom
//
// A ref on each icon that `@amerfathullah/myds-react/icon` exports is its root
// `<svg>`, so it works on React 18 too, as the icons' type says (#215). That
// includes a ref a component attaches, such as ButtonIcon's through Radix
// Slot, or a Radix trigger's with `asChild`, which anchors a tooltip to the
// icon. The deprecated national marks are the marks' own components, so a
// ref works on them too. It sits outside the icon directory, which the icon
// generator rewrites.
import { createElement, type Ref } from "react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import {
  describeForwardedRefs,
  type RefCase,
} from "../components/forwarded-ref-tests";
import * as icons from "../icons";
import { marks } from "../national-marks/national-marks-test-cases";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const consoleMethods = ["error", "warn", "log", "info"] as const;

beforeEach(() => {
  for (const method of consoleMethods)
    vi.spyOn(console, method).mockImplementation(() => {});
});

// No test logs anything, React's warnings and errors included, and nothing
// is left on the page
afterEach(() => {
  const logged = consoleMethods.flatMap((method) =>
    vi.mocked(console[method]).mock.calls.map((args) => [method, ...args]),
  );
  vi.restoreAllMocks();
  expect(logged).toEqual([]);
  expect(document.body.innerHTML).toBe("");
});

// A deprecated national mark is the mark's own component, so React's tools
// name it after the mark: `JataNegaraIcon` is `JataNegara`
const markNames: Record<string, string> = Object.fromEntries(
  marks.map(({ iconExport, privateName }) => [iconExport, privateName]),
);

const exported = Object.entries(icons);

test("checks every export of the entry, the national marks among them", () => {
  expect(exported.length).toBeGreaterThan(marks.length);
  expect(exported.map(([name]) => name)).toEqual(
    expect.arrayContaining(Object.keys(markNames)),
  );
});

describeForwardedRefs(
  exported.map(([name, icon]): RefCase => ({
    name,
    displayName: markNames[name],
    part: icon,
    element: "`<svg>`",
    render: (ref) => createElement(icon, { ref: ref as Ref<SVGSVGElement> }),
    find: (container) => container.querySelector(":scope > svg"),
  })),
);
