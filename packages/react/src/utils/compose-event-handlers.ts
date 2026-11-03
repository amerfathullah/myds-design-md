/**
 * Composes a consumer's event handler with the library's own: the consumer's
 * runs first, then the library's, unless the consumer's called
 * `event.preventDefault()`. Internal: the public `utils` entry doesn't
 * re-export it.
 * @param theirs the handler the consumer passed, if any
 * @param ours what the component does on the event
 */
export function composeEventHandlers<E extends { defaultPrevented: boolean }>(
  theirs: ((event: E) => void) | undefined,
  ours: (event: E) => void,
): (event: E) => void {
  return (event) => {
    theirs?.(event);
    if (!event.defaultPrevented) ours(event);
  };
}
