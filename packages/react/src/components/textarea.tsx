import { cva, VariantProps } from "class-variance-authority";
import React, { forwardRef } from "react";

const text_area_cva = cva(
  [
    "w-full rounded border border-otl-gray-200 bg-bg-white resize-none",
    "placeholder:text-txt-black-500 text-txt-black-700 transition-colors font-body placeholder:font-body",
    "focus:outline-hidden focus:ring-3 focus:ring-fr-primary focus:border-otl-primary-300",
    // The textarea's aria-invalid, which the invalid prop sets, picks the
    // error styling, so it matches what assistive technology announces.
    // Tailwind writes aria- after focus:, so a focused invalid textarea keeps
    // its danger border and rings fr-danger
    "aria-invalid:border-otl-danger-300 aria-invalid:ring-fr-danger",
    "disabled:bg-bg-washed disabled:cursor-not-allowed disabled:text-txt-black-disabled",
  ],
  {
    variants: {
      size: {
        small: "min-h-[100px] p-2.5 text-body-sm placeholder:text-body-sm",
        medium: "min-h-[120px] p-3 text-body-md placeholder:text-body-md",
        large: "min-h-[150px] p-3.5 text-body-lg placeholder:text-body-lg",
      },
    },
    defaultVariants: {
      size: "medium",
    },
  },
);

interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    VariantProps<typeof text_area_cva> {
  /** Sets the textarea's `aria-invalid`, which shows the error styling */
  invalid?: boolean | null;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, size, invalid, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={text_area_cva({ size, className })}
        aria-invalid={invalid ?? undefined}
        {...props}
      />
    );
  },
);

TextArea.displayName = "TextArea";

export { TextArea };
