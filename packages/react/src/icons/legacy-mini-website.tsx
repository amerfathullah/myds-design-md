import React from "react";
import { FunctionComponent, SVGProps } from "react";

/**
 * MiniWebsite Icon
 * @param className
 * @returns MiniWebsiteIcon
 */
export const MiniWebsiteIcon: FunctionComponent<SVGProps<SVGSVGElement>> = (
  props,
) => {
  // A prefix for the ids this SVG refers to, unique to this copy, so that
  // hiding another copy on the page can't change how this one draws
  const id = React.useId();
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath={`url(#${id}clip0_14447_1250)`}>
        <path
          d="M13.3746 5.82876L14.3176 2.9997"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M3 14.3154L5.82897 13.3724"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M7.71741 19.0309L8.6604 16.2019"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M19.0321 7.71616L16.2031 8.65918"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M3 8L6 9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M8 3L9 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M10.6756 11.9595L13.1295 20.2487C13.369 21.0576 14.4407 21.2248 14.9152 20.5273L16.2676 18.5392L18.5606 20.8321C18.9511 21.2226 19.5842 21.2226 19.9747 20.8321L20.5605 20.2463C20.9511 19.8558 20.9511 19.2226 20.5605 18.8321L18.2676 16.5392L20.3148 15.1465C21.0019 14.679 20.8522 13.6261 20.062 13.3688L11.9441 10.7247C11.1783 10.4753 10.4469 11.1872 10.6756 11.9595Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id={`${id}clip0_14447_1250`}>
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
