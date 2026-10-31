// What the field-state tests share: the props a consumer passes, the
// attributes they give the field's native element, and the computed colours
// of the tokens the fields' and their labels' looks use

// The props a consumer passes, and the look they give at rest. A disabled
// field can't take focus, so it keeps that look.
export const cases = [
  { name: "invalid omitted", props: {}, look: "valid" },
  { name: "invalid={null}", props: { invalid: null }, look: "valid" },
  { name: "invalid={false}", props: { invalid: false }, look: "valid" },
  { name: "invalid", props: { invalid: true }, look: "invalid" },
  { name: "aria-invalid", props: { "aria-invalid": true }, look: "invalid" },
  {
    name: "invalid aria-invalid={false}",
    props: { invalid: true, "aria-invalid": false },
    look: "valid",
  },
  { name: "disabled", props: { disabled: true }, look: "valid" },
  {
    name: "disabled invalid",
    props: { disabled: true, invalid: true },
    look: "invalid",
  },
];

/**
 * The attributes a field gives its native element for `props`: `disabled`,
 * and `aria-invalid` from `invalid` unless an `aria-invalid` prop overrides it
 * @param {{ disabled?: boolean, invalid?: boolean | null, "aria-invalid"?: boolean }} props
 * @returns {string} each attribute with a leading space
 */
export function stateAttributes(props) {
  const ariaInvalid =
    "aria-invalid" in props
      ? props["aria-invalid"]
      : (props.invalid ?? undefined);
  return `${props.disabled ? " disabled" : ""}${
    ariaInvalid == null ? "" : ` aria-invalid="${ariaInvalid}"`
  }`;
}

// The computed colours of the tokens the looks use, in each theme
export const colours = {
  light: {
    transparent: "rgba(0, 0, 0, 0)",
    "bg-white": "rgb(255, 255, 255)",
    "bg-washed": "rgb(244, 244, 245)",
    "otl-gray-200": "rgb(228, 228, 231)",
    "otl-primary-300": "rgb(150, 183, 255)",
    "otl-danger-300": "rgb(252, 165, 165)",
    "fr-primary": "rgba(150, 183, 255, 0.4)",
    "fr-danger": "rgba(252, 165, 165, 0.4)",
    "txt-black-700": "rgb(63, 63, 70)",
    "txt-black-disabled": "rgba(82, 82, 91, 0.4)",
  },
  dark: {
    transparent: "rgba(0, 0, 0, 0)",
    "bg-white": "rgb(24, 24, 27)",
    "bg-washed": "rgb(29, 29, 33)",
    "otl-gray-200": "rgb(39, 39, 42)",
    "otl-primary-300": "rgb(29, 78, 216)",
    "otl-danger-300": "rgb(185, 28, 28)",
    "fr-primary": "rgba(29, 78, 216, 0.4)",
    "fr-danger": "rgba(185, 28, 28, 0.4)",
    "txt-black-700": "rgb(212, 212, 216)",
    "txt-black-disabled": "rgba(161, 161, 170, 0.4)",
  },
};
