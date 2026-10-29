// The token utilities DESIGN.md documents, each with the computed style
// properties that show what it resolves to.
import fs from "node:fs";

const designMd = new URL("../../../DESIGN.md", import.meta.url);

// Top-level keys of one block in DESIGN.md's front matter (`colors:`, `rounded:`, …)
function frontMatterKeys(block) {
  const frontMatter = fs.readFileSync(designMd, "utf8").split(/^---$/m)[1];
  const body = frontMatter.split(new RegExp(`^${block}:$`, "m"))[1];
  const keys = [];
  for (const line of body.split("\n").slice(1)) {
    if (/^\S/.test(line)) break;
    const key = line.match(/^ {2}"?([\w.-]+)"?:/);
    if (key) keys.push(key[1]);
  }
  return keys;
}

const shadow = ["boxShadow"];
const animation = [
  "animationName",
  "animationDuration",
  "animationTimingFunction",
  "animationIterationCount",
  "keyframes",
];
// The first frame of an enter animation and the last of an exit: opacity,
// and the element's box after the transform
const enter = ["frame:start", "opacity", "box"];
const exit = ["frame:end", "opacity", "box"];

export function tokenUtilities() {
  const colors = frontMatterKeys("colors").flatMap((token) => [
    { utility: `bg-${token}`, props: ["backgroundColor"] },
    { utility: `text-${token}`, props: ["color"] },
    { utility: `border-${token}`, props: ["borderTopColor"] },
  ]);
  const typography = frontMatterKeys("typography").map((token) => ({
    utility: `text-${token}`,
    props: ["fontSize", "lineHeight"],
  }));
  const rounded = frontMatterKeys("rounded").map((token) => ({
    utility: `rounded-${token}`,
    props: ["borderTopLeftRadius"],
  }));
  const spacing = frontMatterKeys("spacing").map((token) => ({
    utility: `p-${token}`,
    props: ["paddingTop"],
  }));

  // Utilities the prose of DESIGN.md documents
  const prose = [
    // Colours: primitives at an opacity, as the tags and overlays use them,
    // and classes that DESIGN.md says the preset doesn't generate
    ...["bg-gray-700/60", "bg-black", "bg-bg-black-600", "bg-bg-black-950"].map(
      (utility) => ({ utility, props: ["backgroundColor"] }),
    ),
    // The keywords the preset keeps next to the MYDS colours
    { utility: "bg-transparent", props: ["backgroundColor"] },
    { utility: "text-white border-current", props: ["borderTopColor"] },
    { utility: "text-white bg-inherit", props: ["backgroundColor"] },
    ...[
      "border-primary-600/20",
      "border-gray-600/20",
      "border-danger-600/20",
      "border-success-700/20",
      "border-warning-700/20",
    ].map((utility) => ({ utility, props: ["borderTopColor"] })),
    { utility: "outline-primary-600/20", props: ["outlineColor"] },
    // Typography
    { utility: "text", props: ["fontSize", "lineHeight"] },
    ...["font-body", "font-heading", "font-mono"].map((utility) => ({
      utility,
      props: ["fontFamily"],
    })),
    // Shapes
    { utility: "rounded", props: ["borderTopLeftRadius"] },
    { utility: "rounded-b-2xl", props: ["borderBottomLeftRadius"] },
    // Elevation, including the Tailwind steps the preset doesn't generate
    ...[
      "shadow-button",
      "shadow-card",
      "shadow-context-menu",
      "shadow-sm",
      "shadow",
      "shadow-lg",
    ].map((utility) => ({ utility, props: shadow })),
    // Motion
    ...["duration-200", "duration-400", "duration-600"].map((utility) => ({
      utility,
      props: ["transitionDuration"],
    })),
    ...[
      "animate-slide-up",
      "animate-slide-down",
      "animate-accordion-slide-down",
      "animate-accordion-slide-up",
      "animate-collapsible-slide-down",
      "animate-collapsible-slide-up",
      "animate-shimmer",
      "animate-expire",
      // Input OTP asks for it, but the preset never defined it
      "animate-caret-blink",
    ].map((utility) => ({ utility, props: animation })),
    { utility: "origin-tooltip-origin", props: ["transformOrigin"] },
    // Enter and exit animations, as dropdown, select, popover, dialog,
    // sheet and tooltip combine them
    {
      utility: "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
      props: enter,
    },
    {
      utility: "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2",
      props: enter,
    },
    {
      utility: "animate-in fade-in-0 zoom-in-95 slide-in-from-left-2",
      props: enter,
    },
    {
      utility: "animate-in fade-in-0 zoom-in-95 slide-in-from-right-2",
      props: enter,
    },
    {
      utility:
        "animate-in fade-in slide-in-from-left-1/2 slide-in-from-top-[48%]",
      props: enter,
    },
    { utility: "animate-in slide-in-from-bottom-full", props: enter },
    { utility: "animate-out fade-out-0 zoom-out-95", props: exit },
    { utility: "animate-out fade-out-80 slide-out-to-right-full", props: exit },
    {
      utility: "animate-out slide-out-to-left-1/2 slide-out-to-top-[48%]",
      props: exit,
    },
  ];

  return [...colors, ...typography, ...rounded, ...spacing, ...prose];
}
