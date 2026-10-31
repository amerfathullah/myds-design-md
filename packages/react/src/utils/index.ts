import { type ClassNameValue, extendTailwindMerge } from "tailwind-merge";

// The MYDS theme in @amerfathullah/myds-style, so tailwind-merge can tell its
// utilities apart: `text-body-sm` is a size and `text-txt-danger` a colour
const twMergeConfig = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "heading-xl",
        "heading-lg",
        "heading-md",
        "heading-sm",
        "heading-xs",
        "heading-2xs",
        "body-xl",
        "body-lg",
        "body-md",
        "body-sm",
        "body-xs",
      ],
      font: ["body", "heading", "mono"],
      shadow: ["button", "card", "context-menu"],
      animate: [
        "expire",
        "slide-up",
        "slide-down",
        "accordion-slide-down",
        "accordion-slide-up",
        "collapsible-slide-down",
        "collapsible-slide-up",
        "shimmer",
      ],
    },
    classGroups: {
      "transform-origin": [{ origin: ["tooltip-origin"] }],
    },
  },
});

/**
 * Conditional class joiner.
 * @param args classNames
 * @returns string
 */
export const clx = (...args: ClassNameValue[]): string => {
  return twMergeConfig(args);
};

/**
 * Pick into key-pairs from array of objects.
 * @param results Array of objects
 * @param key Key of record
 * @param value Value of record
 * @returns {Record<string, any>} ObjectMap
 */
export const pick = <T = string>(
  results: Array<T>,
  key: keyof T | ((item: T) => string),
  value: keyof T | ((item: T) => unknown),
): Record<string, any> => {
  return results.reduce((previous, current) => {
    const _key = typeof key === "function" ? key(current) : current[key];
    const _value =
      typeof value === "function" ? value(current) : current[value];
    return { ...previous, [_key as string]: _value };
  }, {});
};

export { getThemeScript, type ThemeScriptOptions } from "./theme";
