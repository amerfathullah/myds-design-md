import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { Label } from "./label";

// The props the tests pass, including a `data-disabled` an author can pass
// in JSX, which a props object's type doesn't take
type LabelProps = Pick<ComponentProps<typeof Label>, "disabled"> & {
  "data-disabled"?: boolean;
};

// The rendered element's classes, `data-disabled` and attribute names. With
// `asChild`, Label renders its child, a <span>, through Slot.
function render(props: LabelProps, asChild: boolean) {
  const html = renderToStaticMarkup(
    createElement(
      Label,
      { ...props, asChild, htmlFor: asChild ? undefined : "name" },
      asChild ? createElement("span", null, "Name") : "Name",
    ),
  );
  const element = html.match(/^<(label|span)\s[^>]*>/);
  return {
    tag: element?.[1],
    classes: element?.[0].match(/\sclass="([^"]*)"/)?.[1],
    dataDisabled: element?.[0].match(/\sdata-disabled="([^"]*)"/)?.[1],
    attributes: [...(element?.[0].matchAll(/\s([\w-]+)=/g) ?? [])].map(
      ([, name]) => name,
    ),
  };
}

// React renders a native `disabled` it's passed on any element, so a test
// can see one reach the markup. It warns about a prop it can't render, so
// every test here also fails on any warning, whichever test renders it first
beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  const warnings = [...vi.mocked(console.error).mock.calls];
  vi.restoreAllMocks();
  expect(warnings).toEqual([]);
});

// Label dims from its own `data-disabled`, which the `disabled` prop sets, so
// it doesn't depend on where the field sits
describe.each([
  ["Label", false, "label"],
  ["Label asChild", true, "span"],
] as const)("%s", (_, asChild, tag) => {
  test("renders its element", () => {
    expect(render({}, asChild).tag).toBe(tag);
  });

  test("`disabled` sets the element's data-disabled, and a data-disabled prop overrides it", () => {
    expect(render({}, asChild).dataDisabled).toBeUndefined();
    expect(render({ disabled: null }, asChild).dataDisabled).toBeUndefined();
    expect(render({ disabled: false }, asChild).dataDisabled).toBe("false");
    expect(render({ disabled: true }, asChild).dataDisabled).toBe("true");
    expect(render({ "data-disabled": true }, asChild).dataDisabled).toBe(
      "true",
    );
    expect(
      render({ disabled: true, "data-disabled": false }, asChild).dataDisabled,
    ).toBe("false");
    expect(
      render({ disabled: false, "data-disabled": true }, asChild).dataDisabled,
    ).toBe("true");
  });

  test("the classes don't depend on `disabled`", () => {
    const { classes } = render({}, asChild);
    expect(classes).toBeTruthy();
    for (const disabled of [null, false, true])
      expect(render({ disabled }, asChild).classes).toBe(classes);
  });

  test("`disabled` doesn't reach the element as a native disabled", () => {
    for (const disabled of [null, false, true])
      expect(render({ disabled }, asChild).attributes).not.toContain(
        "disabled",
      );
  });
});
