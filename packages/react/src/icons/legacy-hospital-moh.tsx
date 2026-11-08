import React from "react";
import { FunctionComponent, SVGProps } from "react";

/**
 * HospitalMOH Icon
 * @param className
 * @returns HospitalMOHIcon
 */
export const HospitalMOHIcon: FunctionComponent<SVGProps<SVGSVGElement>> = (
  props,
) => {
  // A prefix for the ids this SVG refers to, unique to this copy, so that
  // hiding another copy on the page can't change how this one draws
  const id = React.useId();
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath={`url(#${id}clip0_14237_1229)`}>
        <g>
          <g>
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10 8C10 6.89543 10.8954 6 12 6H20C21.1046 6 22 6.89543 22 8V25H18V21C18 20.4477 17.5523 20 17 20H15C14.4477 20 14 20.4477 14 21V25H10V8ZM16 17C18.7614 17 21 14.7614 21 12C21 9.23858 18.7614 7 16 7C13.2386 7 11 9.23858 11 12C11 14.7614 13.2386 17 16 17ZM15 9V11H13V13H15V15H17V13H19V11H17V9H15Z"
              fill="currentColor"
            />
            <path
              d="M23 14H25C25.5523 14 26 14.4477 26 15V25H23V14Z"
              fill="currentColor"
            />
            <path
              d="M6 15C6 14.4477 6.44772 14 7 14H9V25H6V15Z"
              fill="currentColor"
            />
          </g>
        </g>
      </g>
      <defs>
        <clipPath id={`${id}clip0_14237_1229`}>
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
