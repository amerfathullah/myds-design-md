// The tests that a part forwards its ref to the element it renders, shared by
// the tests of the components whose parts do (#209, #212) and of the icons
// (#215).
//
// React 18 gives a plain function component no ref: an object ref stays
// `null`, a callback ref is never called, and in development React warns
// "Function components cannot be given refs". React 19, which these tests run
// on, passes a ref as a prop, and each part spreads its props onto its
// element, so a ref arrives either way. So each part is also checked to be a
// forwardRef component, named after its export in React's tools.
//
// The test file that calls `describeForwardedRefs` checks that nothing is
// logged, React's warnings included.
import { act, createRef, type ReactElement, type Ref } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, test } from "vitest";

/** A part whose ref the tests check: one case of `describeForwardedRefs` */
export interface RefCase {
  /** The part's export name, which is its name in React's tools */
  name: string;
  /**
   * Its name in React's tools, where that isn't its export name, as for an
   * export that's another name for a component
   * @default name
   */
  displayName?: string;
  /** The part */
  part: { readonly $$typeof?: symbol; displayName?: string };
  /** The element its ref is, as the tests' titles name it */
  element: string;
  /** The part in the parents its docs use, with `ref` on it */
  render: (ref: Ref<Element>) => ReactElement;
  /** Finds that element in the container the tree is mounted in */
  find: (container: Element) => Element | null | undefined;
  /** Shows the part, where the tree doesn't show it as it mounts */
  show?: (container: Element) => Promise<void>;
  /**
   * How many times a callback ref is given the element by the time the tree
   * has mounted. A library that re-renders the part can detach its ref and
   * attach it again, which calls it with `null` in between.
   * @default 1
   */
  attachments?: number;
}

// Mounts `element` in a container on the page, as an app would, and runs
// `use` on the container. Then unmounts it, takes the container off the page,
// and returns what `use` returned.
export async function whileMounted<T>(
  element: ReactElement,
  use: (container: Element) => Promise<T>,
) {
  const container = document.body.appendChild(document.createElement("div"));
  const root = createRoot(container);
  try {
    await act(async () => root.render(element));
    return await use(container);
  } finally {
    await act(async () => root.unmount());
    container.remove();
  }
}

/**
 * Checks each part's ref, as an object and as a callback, and that each part
 * is a forwardRef component named after its export.
 */
export function describeForwardedRefs(parts: readonly RefCase[]) {
  describe.each(parts)(
    "a ref on $name",
    ({
      name,
      displayName = name,
      part,
      element,
      render,
      find,
      show,
      attachments = 1,
    }) => {
      test(`is a forwardRef component, named "${displayName}" in React's tools`, () => {
        expect({ type: part.$$typeof, displayName: part.displayName }).toEqual({
          type: Symbol.for("react.forward_ref"),
          displayName,
        });
      });

      test(`as an object, is its ${element}`, async () => {
        const ref = createRef<Element>();
        await whileMounted(render(ref), async (container) => {
          await show?.(container);
          expect(ref.current).toBeInstanceOf(Element);
          expect(ref.current).toBe(find(container));
        });
      });

      test(`as a callback, gets its ${element} on mount and \`null\` on unmount`, async () => {
        const calls: (Element | null)[] = [];
        const ref = (node: Element | null) => {
          calls.push(node);
        };
        const { rendered, mounted } = await whileMounted(
          render(ref),
          async (container) => {
            await show?.(container);
            return { rendered: find(container), mounted: [...calls] };
          },
        );
        expect(rendered).toBeInstanceOf(Element);
        // Each call as "the element", or as what it got otherwise
        const named = (nodes: (Element | null)[]) =>
          nodes.map((node) =>
            node && node === rendered ? "the element" : node,
          );
        // Mounted, it has had the element, with `null` before each time it's
        // attached again. Unmounting calls it once more, with `null`.
        const attached = Array.from({ length: attachments }, (_, index) =>
          index ? [null, "the element"] : ["the element"],
        ).flat();
        expect({ mounted: named(mounted), all: named(calls) }).toEqual({
          mounted: attached,
          all: [...attached, null],
        });
      });
    },
  );
}
