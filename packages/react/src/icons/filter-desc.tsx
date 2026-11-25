import React from "react";
import { forwardRef, ForwardRefExoticComponent, SVGProps } from "react";

/**
 * FilterDesc Icon
 * @param className
 * @returns FilterDescIcon
 */
export const FilterDescIcon: ForwardRefExoticComponent<
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
          <path
            d="M4 14H16M7 10H13M9.99998 6H10.1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    },
  ),
  { displayName: "FilterDescIcon" },
);
