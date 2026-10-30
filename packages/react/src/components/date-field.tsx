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
  // An input narrower than its text scrolls the wrapper to the focused
  // segment, its only snap area
  "[&::-webkit-datetime-edit-fields-wrapper]:overflow-hidden [&::-webkit-datetime-edit-fields-wrapper]:snap-x [&::-webkit-datetime-edit-fields-wrapper]:snap-mandatory",
  "[&::-webkit-datetime-edit-text]:mx-[2px]",
  // Only a box can be a snap area. Trimmed to its text, with negative block
  // margins, an inline-block segment lays out like the inline one it replaces
  "[&::-webkit-datetime-edit-day-field]:inline-block [&::-webkit-datetime-edit-day-field]:[text-box:trim-both_text] [&::-webkit-datetime-edit-day-field]:-my-[1em]",
  "[&::-webkit-datetime-edit-month-field]:inline-block [&::-webkit-datetime-edit-month-field]:[text-box:trim-both_text] [&::-webkit-datetime-edit-month-field]:-my-[1em]",
  "[&::-webkit-datetime-edit-year-field]:inline-block [&::-webkit-datetime-edit-year-field]:[text-box:trim-both_text] [&::-webkit-datetime-edit-year-field]:-my-[1em]",
  "[&::-webkit-datetime-edit-day-field:focus-within]:bg-primary-600 [&::-webkit-datetime-edit-day-field:focus-within]:text-white [&::-webkit-datetime-edit-day-field:focus-within]:snap-end",
  "[&::-webkit-datetime-edit-month-field:focus-within]:bg-primary-600 [&::-webkit-datetime-edit-month-field:focus-within]:text-white [&::-webkit-datetime-edit-month-field:focus-within]:snap-end",
  "[&::-webkit-datetime-edit-year-field:focus-within]:bg-primary-600 [&::-webkit-datetime-edit-year-field:focus-within]:text-white [&::-webkit-datetime-edit-year-field:focus-within]:snap-end",
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
