import { ComponentProps, FunctionComponent } from "react";
import { ClockIcon } from "../icons/clock";
import { cva, VariantProps } from "class-variance-authority";

const timefield_container_cva = cva(
  [
    "flex items-center gap-2 border rounded-md text-txt-black-900 shadow-button focus:outline-hidden font-body font-normal",
    "focus-within:border-otl-primary-300 focus-within:ring-3 focus-within:ring-fr-primary",
  ],
  {
    variants: {
      size: {
        small: "px-[10px] py-[6px] text-sm",
        medium: "px-[12px] py-[8px] text-base",
        large: "px-[14px] py-[10px] text-lg",
      },
      disabled: {
        true: "bg-bg-washed text-txt-black-500 cursor-not-allowed",
        false: "bg-bg-white",
      },
      invalid: {
        true: "border-otl-danger-300 ring-fr-danger ring-3",
        false: "border-otl-gray-200",
      },
    },
    defaultVariants: {
      size: "small",
      disabled: false,
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
  // Chromium's focus scroll centres a segment wholly outside the wrapper's
  // scroll padding, and leaves a partly hidden one. With half the width on
  // each side, only a segment that crosses the centre line stays put, and if
  // it's no wider than half the field, it already shows in full
  "[&::-webkit-datetime-edit-fields-wrapper]:overflow-hidden [&::-webkit-datetime-edit-fields-wrapper]:scroll-px-[50%]",
  "[&::-webkit-datetime-edit-text]:mx-[2px]",
  "[&::-webkit-datetime-edit-hour-field:focus-within]:bg-primary-600 [&::-webkit-datetime-edit-hour-field:focus-within]:text-white",
  "[&::-webkit-datetime-edit-minute-field:focus-within]:bg-primary-600 [&::-webkit-datetime-edit-minute-field:focus-within]:text-white",
  "[&::-webkit-datetime-edit-second-field:focus-within]:bg-primary-600 [&::-webkit-datetime-edit-second-field:focus-within]:text-white",
  "[&::-webkit-datetime-edit-ampm-field:focus-within]:bg-primary-600 [&::-webkit-datetime-edit-ampm-field:focus-within]:text-white",
]);

const icon_cva = cva([], {
  variants: {
    size: {
      small: "size-4",
      medium: "size-4.5",
      large: "size-5",
    },
    disabled: {
      true: "text-txt-black-500",
      false: "text-txt-black-700",
    },
  },
  defaultVariants: {
    size: "small",
    disabled: false,
  },
});

type TimeFieldProps = Omit<ComponentProps<"input">, "type" | "size"> &
  VariantProps<typeof timefield_container_cva>;

/**
 * Native time input styled to match DateField. `step` is in seconds and defaults to 60 (hours and minutes).
 * 12/24-hour display follows the user's locale.
 */
const TimeField: FunctionComponent<TimeFieldProps> = ({
  className,
  size,
  disabled,
  invalid,
  step = 60,
  ...props
}) => {
  return (
    <div
      className={timefield_container_cva({
        size,
        disabled,
        invalid,
        className,
      })}
    >
      <ClockIcon className={icon_cva({ size, disabled })} aria-hidden />
      <input
        type="time"
        className={timefield_cva()}
        disabled={disabled}
        aria-invalid={invalid ?? undefined}
        step={step}
        {...props}
      />
    </div>
  );
};
TimeField.displayName = "TimeField";

export { TimeField };
