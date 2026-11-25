import React from "react";
import { forwardRef, ForwardRefExoticComponent, SVGProps } from "react";

/**
 * ChevronDown Icon
 * @param className
 * @returns ChevronDownIcon
 */
export const ChevronDownIcon: ForwardRefExoticComponent<
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
              d="M5 8L10 13L15 8"
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
  { displayName: "ChevronDownIcon" },
);
