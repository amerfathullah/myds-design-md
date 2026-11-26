---
"@amerfathullah/myds-react": patch
---

The declaration files now list the members of a union in a stable, sorted order, so two builds of the same source ship the same files (#239). Before, the order could change from build to build. For example, Breadcrumb's `variant` prop was typed `"fill" | "default" | null | undefined` in one build and `"default" | "fill" | null | undefined` in another.

This changes how unions are written in the `.d.ts` and `.d.mts` files of 17 components, not what they accept:

- in 16 of them, props that take one of a list of names, such as `variant` and `size`: `size?: "small" | "medium" | "large"` is now `"large" | "medium" | "small"`;
- Accordion's props, now `AccordionMultipleProps | AccordionSingleProps`.

It shows in editor tooltips and in snapshots of the types. The JavaScript and the sourcemaps are unchanged.
