import React from "react";
import { FunctionComponent, SVGProps } from "react";

/**
 * InternetMCMC Icon
 * @param className
 * @returns InternetMCMCIcon
 */
export const InternetMCMCIcon: FunctionComponent<SVGProps<SVGSVGElement>> = (
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
      <g clipPath={`url(#${id}clip0_14237_1216)`}>
        <g>
          <g>
            <circle
              cx="16"
              cy="16"
              r="9"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <g>
              <mask
                id={`${id}mask0_14237_1216`}
                style={{ maskType: "alpha" }}
                maskUnits="userSpaceOnUse"
                x="7"
                y="7"
                width="18"
                height="18"
              >
                <circle cx="16" cy="16" r="9" fill="white" />
              </mask>
              <g mask={`url(#${id}mask0_14237_1216)`}>
                <g>
                  <path
                    d="M16.0002 7.00116V25.0012"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M7.00024 16.0012L25.0002 16.0012"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M25.8182 4.5455C25.8182 8.61233 21.4225 11.9091 16.0001 11.9091C10.5776 11.9091 6.18188 8.61233 6.18188 4.5455"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M25.8182 27.4544C25.8182 23.3875 21.4225 20.0907 16.0001 20.0907C10.5776 20.0907 6.18188 23.3875 6.18188 27.4544"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M18.4542 25.8184C14.3874 25.8184 11.0906 21.4227 11.0906 16.0002C11.0906 10.5778 14.3874 6.18204 18.4542 6.18204"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M13.5453 25.8193C17.6121 25.8193 20.9089 21.4235 20.9089 16.0011C20.9089 10.5786 17.6121 6.18289 13.5453 6.18289"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>
      <defs>
        <clipPath id={`${id}clip0_14237_1216`}>
          <rect width="32" height="32" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};
