import type { Matcher } from "react-day-picker";

/**
 * Whether a date picker's `disabled` disables the whole picker, not only
 * days (#231): `true`, alone or as an element of an array, wherever it
 * stands. DatePicker and DateRangePicker disable every trigger they render
 * when it does, so the two can't drift apart. Any other value leaves the
 * triggers enabled, even one that matches every day, such as `() => true`;
 * so does a `false` element, and a nested `[[true]]`, which react-day-picker
 * reads as matching no day. The calendars still take `disabled` as it is.
 * Internal: the public `utils` entry doesn't re-export it.
 * @param disabled the picker's `disabled` prop
 */
export function disablesWholePicker(
  disabled: Matcher | Matcher[] | undefined,
): boolean {
  // Not `disabled.includes(true)`: `Array.isArray` narrows the type to
  // `Date[] | Matcher[]`, whose `includes` wants a `Date`
  return (
    disabled === true ||
    (Array.isArray(disabled) && disabled.some((matcher) => matcher === true))
  );
}
