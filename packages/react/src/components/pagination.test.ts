// @vitest-environment happy-dom
import { act, createElement, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { computeAccessibleName, isInaccessible } from "dom-accessibility-api";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
  AutoPagination,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationNumber,
  PaginationPrevious,
  type AutoPaginationProps,
} from "./pagination";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const unmounts: (() => Promise<void>)[] = [];

// Mounts `element` in a container on the page, as an app would, and returns
// the container
async function mount(element: ReactElement) {
  const container = document.body.appendChild(document.createElement("div"));
  const root = createRoot(container);
  unmounts.push(async () => {
    await act(async () => root.unmount());
    container.remove();
  });
  await act(async () => root.render(element));
  return container;
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

// No test logs an error or a warning, and nothing is left on the page
afterEach(async () => {
  while (unmounts.length) await unmounts.pop()!();
  const logged = [
    ...vi.mocked(console.error).mock.calls,
    ...vi.mocked(console.warn).mock.calls,
  ];
  vi.restoreAllMocks();
  expect(logged).toEqual([]);
  expect(document.body.innerHTML).toBe("");
});

// The fixtures' pages: 100 items, 10 a page, on page 5 of 10
const pages = { count: 100, limit: 10, page: 5, onPageChange: () => {} };

// The accessible name of every button in `within`, in order
const buttonNames = (within: ParentNode) =>
  [...within.querySelectorAll("button")].map((button) =>
    computeAccessibleName(button),
  );

// Each ellipsis in `within`: what a list item that holds no button holds
const ellipses = (within: ParentNode) =>
  [...within.querySelectorAll("li")]
    .filter((item) => !item.querySelector("button"))
    .map((item) => item.firstElementChild!);

// The text in `element` that assistive technology meets: every text node
// that isn't inside an `aria-hidden="true"` element
function announced(element: Element) {
  const texts = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let text = "";
  while (texts.nextNode())
    if (!isInaccessible(texts.currentNode.parentElement!))
      text += texts.currentNode.textContent;
  return text;
}

describe("A composed Pagination", () => {
  // A Pagination composed by hand from a previous button, page 3's button,
  // an ellipsis and a next button. Each part can be swapped for another.
  const composed = ({
    previous = createElement(PaginationPrevious),
    number = createElement(PaginationNumber, { number: 3 }),
    ellipsis = createElement(PaginationEllipsis),
    next = createElement(PaginationNext),
  }: Partial<
    Record<"previous" | "number" | "ellipsis" | "next", ReactElement>
  > = {}) =>
    mount(
      createElement(
        Pagination,
        { ...pages, type: "default" },
        createElement(
          PaginationContent,
          null,
          createElement(PaginationItem, null, previous),
          createElement(PaginationItem, null, number),
          createElement(PaginationItem, null, ellipsis),
          createElement(PaginationItem, null, next),
        ),
      ),
    );

  test('names its buttons "previous page", "page 3" and "next page" by default', async () => {
    expect(buttonNames(await composed())).toEqual([
      "previous page",
      "page 3",
      "next page",
    ]);
  });

  test("lets an `aria-label` rename each button", async () => {
    const page = await composed({
      previous: createElement(PaginationPrevious, {
        "aria-label": "Halaman sebelumnya",
      }),
      number: createElement(PaginationNumber, {
        number: 3,
        "aria-label": "Halaman 3",
      }),
      next: createElement(PaginationNext, {
        "aria-label": "Halaman seterusnya",
      }),
    });
    expect(buttonNames(page)).toEqual([
      "Halaman sebelumnya",
      "Halaman 3",
      "Halaman seterusnya",
    ]);
  });

  // The name then contains the visible label (WCAG 2.5.3)
  test("names the previous and next buttons from their children", async () => {
    const page = await composed({
      previous: createElement(PaginationPrevious, null, "Sebelumnya"),
      next: createElement(PaginationNext, null, "Seterusnya"),
    });
    const [previous, , next] = page.querySelectorAll("button");
    expect([previous, next].map((button) => button!.textContent)).toEqual([
      "Sebelumnya",
      "Seterusnya",
    ]);
    expect(buttonNames(page)).toEqual(["Sebelumnya", "page 3", "Seterusnya"]);
    expect(previous!.hasAttribute("aria-label")).toBe(false);
    expect(next!.hasAttribute("aria-label")).toBe(false);
  });

  test("lets an `aria-label` win over the children", async () => {
    const page = await composed({
      previous: createElement(
        PaginationPrevious,
        { "aria-label": "Halaman sebelumnya" },
        "Sebelumnya",
      ),
      next: createElement(
        PaginationNext,
        { "aria-label": "Halaman seterusnya" },
        "Seterusnya",
      ),
    });
    expect(buttonNames(page)).toEqual([
      "Halaman sebelumnya",
      "page 3",
      "Halaman seterusnya",
    ]);
  });

  // With `asChild`, the author's element replaces the button
  describe.each([
    ["previous", PaginationPrevious, "Halaman sebelumnya"],
    ["next", PaginationNext, "Halaman seterusnya"],
  ] as const)("with an `asChild` %s part", (part, Part, label) => {
    // The author's link, holding only an icon. Returns it.
    async function link(ariaLabel?: string) {
      const page = await composed({
        [part]: createElement(
          Part,
          ariaLabel === undefined
            ? { asChild: true }
            : { asChild: true, "aria-label": ariaLabel },
          createElement("a", { href: "#p" }, createElement("svg")),
        ),
      });
      const [element, ...others] = page.querySelectorAll("a");
      expect(others).toEqual([]);
      return element!;
    }

    test("adds no name to the author's element", async () => {
      const element = await link();
      expect(element.hasAttribute("aria-label")).toBe(false);
      expect(computeAccessibleName(element)).toBe("");
    });

    test("passes an `aria-label` on to the author's element", async () => {
      const element = await link(label);
      expect(computeAccessibleName(element)).toBe(label);
    });
  });

  test('announces the ellipsis as "More pages" and hides only its icon', async () => {
    const [ellipsis, ...others] = ellipses(await composed());
    expect(others).toEqual([]);
    expect(ellipsis!.textContent).toBe("More pages");
    expect(announced(ellipsis!)).toBe("More pages");
    expect(ellipsis!.querySelector("svg")!.getAttribute("aria-hidden")).toBe(
      "true",
    );
  });

  // `aria-label` isn't allowed on the ellipsis's generic span, so children
  // are what renames it
  test("announces the ellipsis's children in place of its default", async () => {
    const [ellipsis] = ellipses(
      await composed({
        ellipsis: createElement(
          PaginationEllipsis,
          null,
          "Lebih banyak halaman",
        ),
      }),
    );
    expect(ellipsis!.textContent).toBe("Lebih banyak halaman");
    expect(announced(ellipsis!)).toBe("Lebih banyak halaman");
  });
});

// Malay names for every control AutoPagination renders
const malay = {
  previousLabel: "Halaman sebelumnya",
  nextLabel: "Halaman seterusnya",
  pageLabel: (page: number) => `Halaman ${page}`,
  ellipsisLabel: "Lebih banyak halaman",
};

describe("AutoPagination", () => {
  // An AutoPagination of `type` on the fixtures' pages. Returns the page.
  const auto = (
    type: AutoPaginationProps["type"],
    props: Partial<AutoPaginationProps> = {},
  ) => mount(createElement(AutoPagination, { ...pages, type, ...props }));

  test('names the buttons and ellipses of type="default" in English by default', async () => {
    const page = await auto("default");
    expect(buttonNames(page)).toEqual([
      "previous page",
      "page 1",
      "page 4",
      "page 5",
      "page 6",
      "page 10",
      "next page",
    ]);
    expect(ellipses(page).map((ellipsis) => ellipsis.textContent)).toEqual([
      "More pages",
      "More pages",
    ]);
    expect(ellipses(page).map(announced)).toEqual(["More pages", "More pages"]);
  });

  test('names the buttons and ellipses of type="default" from the label props', async () => {
    const page = await auto("default", malay);
    expect(buttonNames(page)).toEqual([
      "Halaman sebelumnya",
      "Halaman 1",
      "Halaman 4",
      "Halaman 5",
      "Halaman 6",
      "Halaman 10",
      "Halaman seterusnya",
    ]);
    expect(ellipses(page).map((ellipsis) => ellipsis.textContent)).toEqual([
      "Lebih banyak halaman",
      "Lebih banyak halaman",
    ]);
    expect(ellipses(page).map(announced)).toEqual([
      "Lebih banyak halaman",
      "Lebih banyak halaman",
    ]);
  });

  // Their previous and next buttons show text, which names them
  describe.each(["simple", "full"] as const)("the %s type", (type) => {
    // The text each button shows
    const shown = (within: ParentNode) =>
      [...within.querySelectorAll("button")].map(
        (button) => button.textContent,
      );

    test('shows and names its buttons "Previous" and "Next" by default', async () => {
      const page = await auto(type);
      expect(shown(page)).toEqual(["Previous", "Next"]);
      expect(buttonNames(page)).toEqual(["Previous", "Next"]);
    });

    test("shows and names its buttons from `previousLabel` and `nextLabel`", async () => {
      const page = await auto(type, {
        previousLabel: "Sebelumnya",
        nextLabel: "Seterusnya",
      });
      expect(shown(page)).toEqual(["Sebelumnya", "Seterusnya"]);
      expect(buttonNames(page)).toEqual(["Sebelumnya", "Seterusnya"]);
    });
  });

  describe.each(["default", "simple", "full"] as const)(
    "the %s type",
    (type) => {
      test("renders a `previous` node as given, whatever `previousLabel` says", async () => {
        const page = await auto(type, {
          previous: createElement(PaginationPrevious, {
            "aria-label": "Kembali",
          }),
          previousLabel: "Halaman sebelumnya",
        });
        expect(buttonNames(page)[0]).toBe("Kembali");
      });

      // React warns about an unknown prop only the first time it meets its
      // name, so the warning check above would miss every leak after the
      // first; this check catches each one. A function `pageLabel` never
      // renders as an attribute, so the warning is what catches it leaking.
      test("keeps the label props out of the DOM", async () => {
        await auto(type, malay);
        expect(
          document.querySelectorAll(
            "[previouslabel], [nextlabel], [pagelabel], [ellipsislabel]",
          ),
        ).toHaveLength(0);
      });
    },
  );
});

describe("The pagination landmark", () => {
  // `aria-label` props for `label`, or none when it's undefined, as an
  // author who doesn't name the landmark passes none
  const ariaLabel = (label?: string) =>
    label === undefined ? {} : { "aria-label": label };

  // The `<nav>`'s name when Pagination or AutoPagination renders it
  const navName = async (
    component: "Pagination" | "AutoPagination",
    label?: string,
  ) => {
    const props = { ...pages, type: "default" as const, ...ariaLabel(label) };
    const page = await mount(
      component === "Pagination"
        ? createElement(Pagination, props)
        : createElement(AutoPagination, props),
    );
    const [nav, ...others] = page.querySelectorAll("nav");
    expect(others).toEqual([]);
    return computeAccessibleName(nav!);
  };

  describe.each(["Pagination", "AutoPagination"] as const)(
    "on %s",
    (component) => {
      test('is named "pagination" by default', async () => {
        expect(await navName(component)).toBe("pagination");
      });

      test("lets an `aria-label` rename it", async () => {
        expect(await navName(component, "Penomboran")).toBe("Penomboran");
      });
    },
  );
});
