import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { DateField } from "./date-field";
import { TimeField } from "./time-field";

type FieldProps = ComponentProps<typeof DateField>;

// The wrapper's classes and the <input>'s `aria-invalid`
function render(field: typeof DateField | typeof TimeField, props: FieldProps) {
  const html = renderToStaticMarkup(createElement(field, props));
  return {
    classes: html.match(/^<div class="([^"]*)"/)?.[1],
    ariaInvalid: html.match(/<input [^>]*\baria-invalid="([^"]*)"/)?.[1],
  };
}

// DateField and TimeField style an invalid field from its <input>'s
// `aria-invalid`, so the look matches what assistive technology announces
describe.each([
  ["DateField", DateField],
  ["TimeField", TimeField],
])("%s", (_, field) => {
  test("`invalid` sets the input's aria-invalid, and an aria-invalid prop overrides it", () => {
    expect(render(field, {}).ariaInvalid).toBeUndefined();
    expect(render(field, { invalid: null }).ariaInvalid).toBeUndefined();
    expect(render(field, { invalid: false }).ariaInvalid).toBe("false");
    expect(render(field, { invalid: true }).ariaInvalid).toBe("true");
    expect(render(field, { "aria-invalid": true }).ariaInvalid).toBe("true");
    expect(
      render(field, { invalid: true, "aria-invalid": false }).ariaInvalid,
    ).toBe("false");
  });

  test("the wrapper's classes don't depend on `invalid`", () => {
    const { classes } = render(field, {});
    for (const invalid of [null, false, true])
      expect(render(field, { invalid }).classes).toBe(classes);
  });
});
