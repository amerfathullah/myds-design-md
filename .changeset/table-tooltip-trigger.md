---
"@amerfathullah/myds-react": minor
"@govtechmy/myds-docs": patch
---

TableTooltip's trigger now has a hit area of at least 24×24, and its ref and every prop but the tooltip root's reach the trigger button. The trigger was only its 16px question-mark icon, under WCAG 2.5.8's 24×24 minimum and the design guideline's minimum trigger size. Every prop but `aria-label` went to the tooltip root, which renders no element, and the ref was ignored.

- **Hit area:** an `::after` reaches 4px past each side of the trigger, so hovering anywhere in a 24×24 box centred on the icon opens the tooltip, and the pointer shows the `help` cursor over all of it. Beside a DataTable's sort or widen button, whose row makes the trigger 18px high, the area is 24×26, and it meets that button without covering it. The icon, the trigger's own box, the focus ring around that box, the header row's height and the column widths don't move, and the tooltip opens where it did. A pinned DataTable column scrolled over the trigger still covers it. DataTable's `meta.tooltip` gets the same hit area.
- **Props:** `open`, `defaultOpen`, `onOpenChange`, `delayDuration` and `disableHoverableContent` still go to the tooltip root. Every other prop now goes to the trigger button: `className` (after the library's classes), `id`, `style`, `type`, event handlers, and `data-*` and `aria-*` attributes. Before, `className`, `id`, `style`, `type` and event handlers were TypeScript errors, and `data-*` and `aria-*` attributes were dropped without a warning. For example, `type="button"` now stops a TableTooltip inside a form from submitting it.
- **Ref:** a ref on TableTooltip is now the trigger `<button>`. It was a TypeScript error, and stayed `null`.
- **Name:** the trigger is still named "Tooltip" when `aria-label` is left out or `undefined`, as DataTable passes it for a column with no `meta.tooltipLabel`.

TableTooltip's props are now the trigger button's, without `children` and `asChild`, plus the root props above, the tooltip's content as `children`, and `aria-label`. Code that passed only the root props, `children` and `aria-label` still compiles and behaves as before.

The docs (EN/MS) say which props reach the root and which reach the trigger, give the trigger's hit area, and show how to keep a plain Table header's name to its text with `aria-labelledby` and an id from `useId`, or with `aria-label`, since a TableTooltip's name otherwise joins its header's. The DataTable page now says to hover over or focus the question-mark icon, not the column header.
