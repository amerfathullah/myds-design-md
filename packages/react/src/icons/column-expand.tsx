import React from "react";
import { forwardRef, ForwardRefExoticComponent, SVGProps } from "react";

/**
 * ColumnExpand Icon
 * @param className
 * @returns ColumnExpandIcon
 */
export const ColumnExpandIcon: ForwardRefExoticComponent<
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
              d="M6 6L2 10L6 14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 14L18 10L14 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 10L8 10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 10H18"
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
  { displayName: "ColumnExpandIcon" },
);
