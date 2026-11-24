import { ComponentProps, forwardRef, ForwardRefExoticComponent } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clx } from "../utils";

const spinnerVariants = cva(
  [
    "animate-spin",
    "[animation-duration:600ms]",
    "rounded-full",
    "bg-conic/srgb",
    "from-transparent",
    "[mask:radial-gradient(transparent_56%,#000_56%)]",
  ],
  {
    variants: {
      size: {
        small: "h-4 w-4",
        medium: "h-5 w-5",
        large: "h-6 w-6",
      },
      color: {
        gray: "to-txt-black-500",
        white: "to-white",
      },
    },
    defaultVariants: {
      size: "small",
      color: "gray",
    },
  },
);

interface SpinnerProps
  extends
    VariantProps<typeof spinnerVariants>,
    Omit<ComponentProps<"div">, "color"> {
  className?: string;
  show?: boolean;
}

/**
 * Its ref is the outer `<div>`. With `show={false}` it renders nothing, so its
 * ref gets no element.
 */
export const Spinner: ForwardRefExoticComponent<SpinnerProps> = forwardRef(
  ({ size, color, className = "", show = true, ...props }, ref) => {
    if (!show) {
      return null;
    }
    return (
      <div
        ref={ref}
        {...props}
        className={clx("relative flex items-center justify-center", className)}
      >
        <div className={spinnerVariants({ size, color })}></div>
      </div>
    );
  },
);
Spinner.displayName = "Spinner";
