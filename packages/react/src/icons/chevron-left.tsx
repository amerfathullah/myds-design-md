import React from "react";
import { forwardRef, ForwardRefExoticComponent, SVGProps } from "react";

/**
 * ChevronLeft Icon
 * @param className
 * @returns ChevronLeftIcon
 */
export const ChevronLeftIcon: ForwardRefExoticComponent<
  SVGProps<SVGSVGElement>
> = /* @__PURE__ */ Object.assign(
  /* @__PURE__ */ forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
    (props, ref) => {
      return (
        <svg
          ref={ref}
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          {...props}
        >
          <g>
            <path
              d="M11 5L6 10L11 15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      );
    },
  ),
  { displayName: "ChevronLeftIcon" },
);
