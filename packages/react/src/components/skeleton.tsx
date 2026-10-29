import React, {
  ComponentProps,
  forwardRef,
  ForwardRefExoticComponent,
  RefAttributes,
} from "react";
import { cva, VariantProps } from "class-variance-authority";
import { clx } from "../utils";

const skeleton_cva = cva(
  [
    "animate-shimmer direction-reverse from-bg-black-100 via-bg-black-300 to-bg-black-100 bg-linear-to-r/srgb bg-[length:200%_50%]",
    "motion-reduce:animate-none motion-reduce:bg-none motion-reduce:bg-bg-black-100",
  ],
  {
    variants: {
      shape: {
        line: "min-h-3 w-full rounded-full",
        circle: "rounded-full",
        block: "rounded-md",
      },
    },
    defaultVariants: {
      shape: "line",
    },
  },
);

/**
 * Props for Skeleton component.
 * @typedef SkeletonProps
 * @property {"line" | "circle" | "block"} [shape="line"] - The shape of the placeholder. Set its size with `className`.
 */
interface SkeletonProps
  extends ComponentProps<"div">,
    VariantProps<typeof skeleton_cva> {
  shape?: "line" | "circle" | "block";
}

/**
 * A loading placeholder in the shape of the content it stands in for.
 * It is always hidden from assistive technology: mark the loading region with `aria-busy` and announce it yourself.
 */
const Skeleton: ForwardRefExoticComponent<
  SkeletonProps & RefAttributes<HTMLDivElement>
> = forwardRef(({ shape, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={clx(skeleton_cva({ shape }), className)}
      {...props}
      aria-hidden="true"
    />
  );
});
Skeleton.displayName = "Skeleton";

export { Skeleton };
export type { SkeletonProps };
