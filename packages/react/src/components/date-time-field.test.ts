import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { DateField } from "./date-field";
import { TimeField } from "./time-field";

type FieldProps = ComponentProps<typeof DateField>;

// The wrapper's classes, the classes of the icon that is its first child, and
// the <input>'s `aria-invalid` and `disabled`
function render(field: typeof DateField | typeof TimeField, props: FieldProps) {
  const html = renderToStaticMarkup(createElement(field, props));
  const [, classes, iconClasses] =
    html.match(/^<div class="([^"]*)"><svg [^>]*\bclass="([^"]*)"/) ?? [];
  const input = html.match(/<input [^>]*>/)?.[0] ?? "";
  return {
    classes,
    iconClasses,
    ariaInvalid: input.match(/\baria-invalid="([^"]*)"/)?.[1],
    disabled: / disabled=""/.test(input),
  };
}

// DateField and TimeField style an invalid field from its <input>'s
// `aria-invalid`, so the look matches what assistive technology announces,
// and a disabled one from the <input>'s `:disabled`, so a disabled
// `<fieldset>` gives it the same look as the `disabled` prop
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

  test("`disabled` disables the input exactly when it's `true`", () => {
    expect(render(field, {}).disabled).toBe(false);
    expect(render(field, { disabled: false }).disabled).toBe(false);
    expect(render(field, { disabled: true }).disabled).toBe(true);
  });

  test("the wrapper's and the icon's classes don't depend on `disabled`", () => {
    const { classes, iconClasses } = render(field, {});
    expect(classes).toBeDefined();
    expect(iconClasses).toBeDefined();
    for (const disabled of [false, true])
      expect(render(field, { disabled })).toMatchObject({
        classes,
        iconClasses,
      });
  });
});
