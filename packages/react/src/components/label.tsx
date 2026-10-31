import { Slot } from "@radix-ui/react-slot";
import { cva, VariantProps } from "class-variance-authority";
import React, { ComponentProps, ForwardRefExoticComponent } from "react";

const label_cva = cva(
  [
    "inline-flex gap-1 text-txt-black-700",
    // The label's data-disabled, which the disabled prop sets, picks the
    // disabled styling, so it dims wherever the field sits
    "data-[disabled=true]:text-txt-black-disabled data-[disabled=true]:cursor-not-allowed",
    "group-disabled:text-txt-black-disabled group-disabled:cursor-not-allowed group-disabled:shadow-none",
    "peer-disabled:text-txt-black-disabled peer-disabled:cursor-not-allowed peer-disabled:shadow-none",
  ],
  {
    variants: {
      size: {
        small: "text-body-sm",
        medium: "text-body-md",
        large: "text-body-lg",
      },
    },
    defaultVariants: {
      size: "medium",
    },
  },
);

interface LabelProps
  extends ComponentProps<"label">,
    VariantProps<typeof label_cva> {
  asChild?: boolean;
  /** Sets the label's `data-disabled`, which shows the disabled styling */
  disabled?: boolean | null;
}

const Label: ForwardRefExoticComponent<LabelProps> = React.forwardRef(
  ({ asChild, size, className, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "label";
    return (
      <Comp
        className={label_cva({ size, className })}
        ref={ref}
        data-disabled={disabled ?? undefined}
        {...props}
      />
    );
  },
);
Label.displayName = "Label";

export { Label };
