import React from "react";
import { FunctionComponent, SVGProps } from "react";

/**
 * AmbulanceMERS Icon
 * @param className
 * @returns AmbulanceMERSIcon
 */
export const AmbulanceMERSIcon: FunctionComponent<SVGProps<SVGSVGElement>> = (
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
      <g clipPath={`url(#${id}clip0_14237_1228)`}>
        <g>
          <g>
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M25 16C25 20.9706 20.9706 25 16 25C11.0294 25 7 20.9706 7 16C7 11.0294 11.0294 7 16 7C20.9706 7 25 11.0294 25 16ZM14.2 14.2V9.7H17.8V14.2H22.3V17.8H17.8V22.3H14.2V17.8H9.7L9.7 14.2H14.2Z"
              fill="currentColor"
            />
          </g>
        </g>
      </g>
      <defs>
        <clipPath id={`${id}clip0_14237_1228`}>
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
