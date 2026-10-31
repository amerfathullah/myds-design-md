import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { Input } from "./input";
import { TextArea } from "./textarea";

type FieldProps = Pick<
  ComponentProps<typeof Input> & ComponentProps<typeof TextArea>,
  "invalid" | "aria-invalid"
>;

// The classes of each element whose look depends on validity, and the
// editable field's `aria-invalid` and attribute names
function render(
  field: typeof Input | typeof TextArea,
  tag: "input" | "textarea",
  props: FieldProps,
) {
  const html = renderToStaticMarkup(
    createElement(field as typeof Input, props),
  );
  const element = html.match(new RegExp(`<${tag}\\s[^>]*>`))?.[0] ?? "";
  return {
    // Input's outer wrapper; TextArea has none
    wrapper: tag === "input" ? html.match(/^<div class="([^"]*)"/)?.[1] : "",
    classes: element.match(/\sclass="([^"]*)"/)?.[1],
    ariaInvalid: element.match(/\saria-invalid="([^"]*)"/)?.[1],
    attributes: [...element.matchAll(/\s([\w-]+)=/g)].map(([, name]) => name),
  };
}

// React drops a boolean attribute it doesn't know, so the markup can't show
// `invalid` reaching the field. It warns instead, once per attribute name, so
// every test here fails on any warning, whichever test renders it first
beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  const warnings = [...vi.mocked(console.error).mock.calls];
  vi.restoreAllMocks();
  expect(warnings).toEqual([]);
});

// Input and TextArea style an invalid field from its native element's
// `aria-invalid`, so the look matches what assistive technology announces
describe.each([
  ["Input", Input, "input"],
  ["TextArea", TextArea, "textarea"],
] as const)("%s", (_, field, tag) => {
  test("`invalid` sets the field's aria-invalid, and an aria-invalid prop overrides it", () => {
    expect(render(field, tag, {}).ariaInvalid).toBeUndefined();
    expect(render(field, tag, { invalid: null }).ariaInvalid).toBeUndefined();
    expect(render(field, tag, { invalid: false }).ariaInvalid).toBe("false");
    expect(render(field, tag, { invalid: true }).ariaInvalid).toBe("true");
    expect(render(field, tag, { "aria-invalid": true }).ariaInvalid).toBe(
      "true",
    );
    expect(
      render(field, tag, { invalid: true, "aria-invalid": false }).ariaInvalid,
    ).toBe("false");
  });

  test("the classes don't depend on `invalid`", () => {
    const { wrapper, classes } = render(field, tag, {});
    expect(classes).toBeTruthy();
    if (tag === "input") expect(wrapper).toBeTruthy();
    for (const invalid of [null, false, true]) {
      const rendered = render(field, tag, { invalid });
      expect(rendered.wrapper).toBe(wrapper);
      expect(rendered.classes).toBe(classes);
    }
  });

  test("`invalid` doesn't reach the field as an attribute", () => {
    for (const invalid of [null, false, true])
      expect(render(field, tag, { invalid }).attributes).not.toContain(
        "invalid",
      );
  });
});
