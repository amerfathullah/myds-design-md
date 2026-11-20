import type { Ref } from "react";

/**
 * Sets `ref` to `node` as React sets a ref it's given, and returns what a
 * callback ref returns: under React 19, a cleanup to run in place of a later
 * call with `null`. Internal: the public `utils` entry doesn't re-export it.
 */
export function setRef<T>(ref: Ref<T> | undefined, node: T | null): unknown {
  if (typeof ref === "function") return ref(node);
  if (ref) (ref as { current: T | null }).current = node;
}
