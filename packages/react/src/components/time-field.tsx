import { ComponentProps, FunctionComponent } from "react";
import { ClockIcon } from "../icons/clock";
import { cva, VariantProps } from "class-variance-authority";

const timefield_container_cva = cva(
  [
    "flex items-center gap-2 border border-otl-gray-200 rounded-md bg-bg-white text-txt-black-900 shadow-button focus:outline-hidden font-body font-normal",
    "focus-within:border-otl-primary-300 focus-within:ring-3 focus-within:ring-fr-primary",
    // The input's aria-invalid, which the invalid prop sets, picks the error
    // styling, so it matches what assistive technology announces. has-
    // outranks focus-within:, so a focused invalid field keeps its danger
    // border and rings fr-danger. Unlike InputOTP's group-has-, it can't match
    // a group ancestor the consumer adds
    "has-[input[aria-invalid=true]]:border-otl-danger-300 has-[input[aria-invalid=true]]:ring-fr-danger",
    // The input's :disabled picks the disabled styling, so a disabled
    // fieldset, which disables the input without the disabled prop, gives
    // the frame and icon the look the prop does. has- outranks the base and
    // a background passed in className. The icon's colour is set from here,
    // on this field's own svg, so that no group ancestor the consumer adds
    // can dim it
    "has-[input:disabled]:bg-bg-washed has-[input:disabled]:text-txt-black-500 has-[input:disabled]:cursor-not-allowed",
    "[&:has(input:disabled)>svg]:text-txt-black-500",
  ],
  {
    variants: {
      size: {
        small: "px-[10px] py-[6px] text-sm",
        medium: "px-[12px] py-[8px] text-base",
        large: "px-[14px] py-[10px] text-lg",
      },
    },
    defaultVariants: {
      size: "small",
    },
  },
);

const timefield_cva = cva([
  "bg-transparent focus:outline-hidden",
  "disabled:bg-bg-washed disabled:text-txt-black-500 disabled:cursor-not-allowed",
  "[&::-webkit-calendar-picker-indicator]:hidden",
  // Chromium sizes the edit to an estimate that leaves out the separators'
  // margins, so it has no box: the fields wrapper sizes to the segments
  "[&::-webkit-datetime-edit]:contents",
  // Tailwind 4's preflight removes this padding, which sets the field's height
  "[&::-webkit-datetime-edit-fields-wrapper]:py-px",
  // Chromium's focus scroll centres a segment wholly outside the area the
  // wrapper's scroll padding leaves, and leaves a partly hidden one where it
  // is. Half the width on each side leaves only the centre line, so only a
  // segment that crosses it stays put, and if it's no wider than half the
  // field, it already shows in full
  "[&::-webkit-datetime-edit-fields-wrapper]:overflow-hidden [&::-webkit-datetime-edit-fields-wrapper]:scroll-px-[50%]",
  "[&::-webkit-datetime-edit-text]:mx-[2px]",
  "[&::-webkit-datetime-edit-hour-field:focus-within]:bg-primary-600 [&::-webkit-datetime-edit-hour-field:focus-within]:text-white",
  "[&::-webkit-datetime-edit-minute-field:focus-within]:bg-primary-600 [&::-webkit-datetime-edit-minute-field:focus-within]:text-white",
  "[&::-webkit-datetime-edit-second-field:focus-within]:bg-primary-600 [&::-webkit-datetime-edit-second-field:focus-within]:text-white",
  "[&::-webkit-datetime-edit-ampm-field:focus-within]:bg-primary-600 [&::-webkit-datetime-edit-ampm-field:focus-within]:text-white",
]);

const icon_cva = cva(["text-txt-black-700"], {
  variants: {
    size: {
      small: "size-4",
      medium: "size-4.5",
      large: "size-5",
    },
  },
  defaultVariants: {
    size: "small",
  },
});

type TimeFieldProps = Omit<ComponentProps<"input">, "type" | "size"> &
  VariantProps<typeof timefield_container_cva> & {
    /** Sets the input's `aria-invalid`, which shows the error styling */
    invalid?: boolean | null;
  };

/**
 * Native time input styled to match DateField. `step` is in seconds and defaults to 60 (hours and minutes).
 * 12/24-hour display follows the user's locale.
 */
const TimeField: FunctionComponent<TimeFieldProps> = ({
  className,
  size,
  invalid,
  step = 60,
  ...props
}) => {
  return (
    <div
      className={timefield_container_cva({
        size,
        className,
      })}
    >
      <ClockIcon className={icon_cva({ size })} aria-hidden />
      <input
        type="time"
        className={timefield_cva()}
        aria-invalid={invalid ?? undefined}
        step={step}
        {...props}
      />
    </div>
  );
};
TimeField.displayName = "TimeField";

export { TimeField };
