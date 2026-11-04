import { useId } from "react";

/**
 * Names a date picker's triggers (ADR-0011). Each trigger's `aria-labelledby`
 * is the picker's label, then the ids of the elements inside the trigger that
 * hold its text, never the trigger itself. The label is the author's
 * `aria-labelledby`, or else `aria-label`, which `hiddenLabel` holds; so
 * `aria-labelledby` wins if both are passed, as on any element. With neither,
 * the triggers get no `aria-labelledby`. Internal: the public `hooks` entry
 * doesn't re-export it.
 * @param ariaLabelledBy the author's `aria-labelledby`
 * @param ariaLabel the author's `aria-label`
 * @returns `id`, a `useId()` that prefixes the picker's own ids; `hiddenLabel`,
 * the hidden element that holds `aria-label`, which the picker renders once;
 * and `labelledBy`, which gives a trigger's `aria-labelledby` from the ids of
 * the elements that hold its text
 */
export function useTriggerNames(ariaLabelledBy?: string, ariaLabel?: string) {
  const id = useId();
  const hiddenLabelId = !ariaLabelledBy && ariaLabel ? `${id}label` : undefined;
  const labelIds = ariaLabelledBy || hiddenLabelId;
  return {
    id,
    hiddenLabel: hiddenLabelId ? (
      <span id={hiddenLabelId} hidden>
        {ariaLabel}
      </span>
    ) : null,
    labelledBy: (...textIds: string[]) =>
      labelIds ? [labelIds, ...textIds].join(" ") : undefined,
  };
}
