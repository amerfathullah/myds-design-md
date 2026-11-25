import type { PointerEvent } from "react";

/**
 * Keeps a Radix trigger shut on a press while its own button is `:disabled`
 * (#223). Radix opens DropdownMenu on `pointerdown`, and Select on a mouse's
 * `pointerdown`, and checks only its own `disabled` prop, but Chromium still
 * sends a disabled button `pointerdown`. So a trigger that a `<fieldset
 * disabled>` disables, or a Button with `disabled` inside `DropdownTrigger
 * asChild`, would open to a press. Radix skips a `pointerdown` whose default is prevented. Preventing it
 * also stops the browser moving focus to the body on the press, so focus
 * stays where it was.
 *
 * It keys on the button's own `:disabled`, not on a fieldset or a class, so a
 * trigger in the first `<legend>` of a disabled fieldset, which the browser
 * leaves enabled, still opens. Internal: the public `utils` entry doesn't
 * re-export it.
 * @param event the `pointerdown` on the trigger, after the consumer's own
 * handler
 */
export function keepDisabledTriggerShut(event: PointerEvent<HTMLElement>) {
  if (event.currentTarget.matches(":disabled")) event.preventDefault();
}
