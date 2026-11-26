---
"@amerfathullah/myds-react": patch
"@amerfathullah/myds-style": patch
---

AccordionTrigger's disabled look now follows its own button's `:disabled`. It took `txt-black-disabled` text, a not-allowed cursor, no hover underline and a dimmed chevron only from Radix's `data-disabled`, which only `disabled` on Accordion or AccordionItem sets. So a trigger disabled another way looked enabled, with a pointer and a hover underline, though a click didn't open it and Tab skipped it. It now looks disabled whatever disables it:

- a `<fieldset disabled>` around the Accordion: plain, `group`, a plain fieldset nested in a disabled one, or one disabled after mount, even with `disabled={false}` on Accordion and AccordionItem. The enabled look comes back when the fieldset is enabled again;
- `disabled` on AccordionTrigger alone;
- an open trigger, whose text kept `txt-black-900` beside a dimmed chevron, with the props as well. It's now `txt-black-disabled`, as the `accordion-trigger-disabled` token says.

A trigger that `disabled={false}` or `disabled={undefined}` re-enables under a disabled AccordionItem or Accordion no longer looks disabled. It already opened on click and took a Tab stop; see #432. Neither does one with a hand-passed `data-disabled`. No `group` around the Accordion dims an enabled trigger's chevron any more: it dimmed inside the open item of a disabled outer Accordion, or under any element marked `group` with `data-disabled`. An icon of your own in a trigger keeps its colour, and a `text-*` or `[&>svg]:text-*` class on the trigger still applies while it's enabled and gives way to the dim while it's disabled. Every trigger's `:disabled` state, click, Tab stop and accessible state are unchanged, and no prop type changes. A `disabled` you passed to an Accordion inside a disabled fieldset only for its look can go.

`full.css` in `@amerfathullah/myds-style` gains `disabled:hover:no-underline`, `disabled:data-[state=open]:text-txt-black-disabled` and `[:disabled>&]:text-txt-black-disabled`, and loses `data-[disabled]:text-txt-black-disabled`, `data-[disabled]:hover:no-underline` and `group-data-[disabled]:text-txt-black-disabled`. `data-[disabled]:cursor-not-allowed` stays, for Dropdown.
