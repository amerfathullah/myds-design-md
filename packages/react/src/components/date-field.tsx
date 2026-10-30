import { ComponentProps, FunctionComponent } from "react";
import { CalendarIcon } from "../icons/calendar";
import { cva, VariantProps } from "class-variance-authority";

const datefield_container_cva = cva(
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

const datefield_cva = cva([
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
  "[&::-webkit-datetime-edit-day-field:focus-within]:bg-primary-600 [&::-webkit-datetime-edit-day-field:focus-within]:text-white",
  "[&::-webkit-datetime-edit-month-field:focus-within]:bg-primary-600 [&::-webkit-datetime-edit-month-field:focus-within]:text-white",
  "[&::-webkit-datetime-edit-year-field:focus-within]:bg-primary-600 [&::-webkit-datetime-edit-year-field:focus-within]:text-white",
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

type DateFieldProps = Omit<ComponentProps<"input">, "type" | "size"> &
  VariantProps<typeof datefield_container_cva>;

const DateField: FunctionComponent<DateFieldProps> = ({
  className,
  size,
  disabled,
  invalid,
  ...props
}) => {
  return (
    <div
      className={datefield_container_cva({
        size,
        disabled,
        invalid,
        className,
      })}
    >
      <CalendarIcon className={icon_cva({ size, disabled })} aria-hidden />
      <input
        type="date"
        className={datefield_cva()}
        disabled={disabled}
        aria-invalid={invalid ?? undefined}
        {...props}
      />
    </div>
  );
};
DateField.displayName = "DateField";

export { DateField };
