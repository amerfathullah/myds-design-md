import React from "react";
import { forwardRef, ForwardRefExoticComponent, SVGProps } from "react";

/**
 * ArrowBackClose Icon
 * @param className
 * @returns ArrowBackCloseIcon
 */
export const ArrowBackCloseIcon: ForwardRefExoticComponent<
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
              d="M9.25 15.5L3.75 10.25M3.75 10.25L9.25 5M3.75 10.25L17.25 10.25M2.75 15.25L2.75 4.75"
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
  { displayName: "ArrowBackCloseIcon" },
);
