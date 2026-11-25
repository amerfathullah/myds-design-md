import React from "react";
import { forwardRef, ForwardRefExoticComponent, SVGProps } from "react";

/**
 * Bell Icon
 * @param className
 * @returns BellIcon
 */
export const BellIcon: ForwardRefExoticComponent<SVGProps<SVGSVGElement>> =
  /* @__PURE__ */ Object.assign(
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
                d="M7 14.5C7 14.5 7 17.25 10 17.25C13 17.25 13 14.5 13 14.5M15.25 10V8C15.25 5.1005 12.8995 2.75 10 2.75C7.10051 2.75 4.75 5.10051 4.75 8V10L3.75 14.25H16.25L15.25 10Z"
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
    { displayName: "BellIcon" },
  );
