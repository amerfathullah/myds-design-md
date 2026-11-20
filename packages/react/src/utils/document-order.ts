/**
 * Compares two nodes for `sort`, which then puts them in document order.
 * Internal: the public `utils` entry doesn't re-export it.
 */
export const inDocumentOrder = (a: Node, b: Node) =>
  a === b
    ? 0
    : a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING
      ? -1
      : 1;
