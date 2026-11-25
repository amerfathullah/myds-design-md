import React from "react";
import { forwardRef, ForwardRefExoticComponent, SVGProps } from "react";

/**
 * Direction Icon
 * @param className
 * @returns DirectionIcon
 */
export const DirectionIcon: ForwardRefExoticComponent<SVGProps<SVGSVGElement>> =
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
                d="M15 3L3 11.4H9.46154L12.2308 17L15 3Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </g>
          </svg>
        );
      },
    ),
    { displayName: "DirectionIcon" },
  );
