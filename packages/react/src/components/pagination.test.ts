// @vitest-environment happy-dom
import {
  act,
  createElement,
  useContext,
  type ComponentProps,
  type ReactElement,
} from "react";
import { createRoot } from "react-dom/client";
import { computeAccessibleName, isInaccessible } from "dom-accessibility-api";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { Button } from "./button";
import {
  AutoPagination,
  Pagination,
  PaginationContent,
  PaginationContext,
  PaginationEllipsis,
  PaginationItem,
  PaginationLabel,
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

  test('renders the same markup without `type` as with type="default"', async () => {
    const omitted = (await mount(createElement(AutoPagination, pages)))
      .innerHTML;
    expect(omitted).toBe((await auto("default")).innerHTML);
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

// 200 items, 10 a page, on page 2 of 20
const pageTwo = { count: 200, limit: 10, page: 2, onPageChange: () => {} };

// A Pagination's `type`, or undefined for one whose author leaves it out
type Type = AutoPaginationProps["type"];

// `type` props for `type`, or none when it's undefined, as an author who
// leaves `type` out passes none
const typeProp = (type: Type) => (type === undefined ? {} : { type });

describe("PaginationLabel", () => {
  // The paragraph a PaginationLabel with `props` renders inside a Pagination
  // of `type` on page 2 of 20
  async function label(
    type: Type,
    props: ComponentProps<typeof PaginationLabel> = {},
  ) {
    const page = await mount(
      createElement(
        Pagination,
        { ...pageTwo, ...typeProp(type) },
        createElement(PaginationLabel, props),
      ),
    );
    const [paragraph, ...others] = page.querySelectorAll("p");
    expect(others).toEqual([]);
    return paragraph!;
  }

  test('shows "Page 2 of 20" in a full Pagination', async () => {
    expect((await label("full")).textContent).toBe("Page 2 of 20");
  });

  describe.each(["default", "simple", "full", undefined] as const)(
    "with type %s",
    (type) => {
      test("shows `content` in place of its default", async () => {
        const paragraph = await label(type, {
          content: createElement("strong", null, "Halaman 2 daripada 20"),
        });
        expect(paragraph.innerHTML).toBe(
          "<strong>Halaman 2 daripada 20</strong>",
        );
      });
    },
  );

  describe.each(["default", "simple", undefined] as const)(
    "with type %s",
    (type) => {
      test("renders an empty paragraph without `content`", async () => {
        const paragraph = await label(type);
        expect(paragraph.childNodes).toHaveLength(0);
      });
    },
  );
});

describe("Pagination's `type`", () => {
  // An author's own part that shows the `type` PaginationContext carries
  const ShowType = () =>
    createElement("output", {
      "data-type": useContext(PaginationContext).type,
    });

  // The `type` an author's own part reads from PaginationContext inside a
  // Pagination of `type`, or null when it reads none
  async function contextType(type: Type) {
    const page = await mount(
      createElement(
        Pagination,
        { ...pageTwo, ...typeProp(type) },
        createElement(ShowType),
      ),
    );
    const [output, ...others] = page.querySelectorAll("output");
    expect(others).toEqual([]);
    return output!.getAttribute("data-type");
  }

  test('gives PaginationContext the type "default" when left out', async () => {
    expect(await contextType(undefined)).toBe("default");
  });

  test("gives PaginationContext the type it's given", async () => {
    expect(await contextType("full")).toBe("full");
  });

  test('renders the same markup without `type` as with type="default"', async () => {
    // Every part, the author's own included
    const parts = [
      createElement(PaginationPrevious),
      createElement(PaginationNumber, { number: 2 }),
      createElement(PaginationEllipsis),
      createElement(PaginationLabel),
      createElement(ShowType),
      createElement(PaginationNext),
    ];
    // The markup of a Pagination of `type` composed from the parts
    const composed = async (type: Type) =>
      (
        await mount(
          createElement(
            Pagination,
            { ...pageTwo, ...typeProp(type) },
            createElement(
              PaginationContent,
              null,
              ...parts.map((part) => createElement(PaginationItem, null, part)),
            ),
          ),
        )
      ).innerHTML;
    const omitted = await composed(undefined);
    expect(omitted).toContain('data-type="default"');
    expect(omitted).toBe(await composed("default"));
  });
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

describe("The current page", () => {
  // Each element in `within` that carries an `aria-current`, whatever its
  // value
  const currents = (within: ParentNode) => [
    ...within.querySelectorAll("[aria-current]"),
  ];

  describe("in AutoPagination", () => {
    // 100 items, 10 a page, on page `page` of 10
    const onPage = (page: number, props: Partial<AutoPaginationProps> = {}) =>
      mount(
        createElement(AutoPagination, {
          ...pages,
          page,
          type: "default",
          ...props,
        }),
      );

    // The first, a middle and the last page
    test.each([1, 5, 10])(
      'marks only page %i\'s button aria-current="page"',
      async (page) => {
        const [current, ...others] = currents(await onPage(page));
        expect(others).toEqual([]);
        expect(current!.tagName).toBe("BUTTON");
        expect(current!.getAttribute("aria-current")).toBe("page");
        expect(current!.textContent).toBe(String(page));
        expect(computeAccessibleName(current!)).toBe(`page ${page}`);
      },
    );

    // The current page is a link-like place in a set of pages, not a pressed
    // or selected option, and it stays a button the user can press
    test("keeps the current page's button enabled, and neither pressed nor selected", async () => {
      const page = await onPage(5);
      const [current] = currents(page);
      expect(current).toBeInstanceOf(HTMLButtonElement);
      expect((current as HTMLButtonElement).disabled).toBe(false);
      expect([
        ...page.querySelectorAll("[aria-pressed], [aria-selected]"),
      ]).toEqual([]);
    });

    test("leaves the page buttons' names as they were", async () => {
      expect(buttonNames(await onPage(2))).toEqual([
        "previous page",
        "page 1",
        "page 2",
        "page 3",
        "page 4",
        "page 10",
        "next page",
      ]);
    });

    test("leaves names from `pageLabel` as they were", async () => {
      const page = await onPage(2, malay);
      expect(buttonNames(page)).toEqual([
        "Halaman sebelumnya",
        "Halaman 1",
        "Halaman 2",
        "Halaman 3",
        "Halaman 4",
        "Halaman 10",
        "Halaman seterusnya",
      ]);
      const [current, ...others] = currents(page);
      expect(others).toEqual([]);
      expect(computeAccessibleName(current!)).toBe("Halaman 2");
    });

    // They render no page buttons
    test.each(["simple", "full"] as const)(
      'marks nothing aria-current in type="%s"',
      async (type) => {
        expect(currents(await onPage(5, { type }))).toEqual([]);
      },
    );
  });

  describe("in a composed Pagination", () => {
    // A Pagination on page 5 composed by hand from the buttons of pages 4, 5
    // and 6. `current` replaces page 5's button. Returns the three buttons.
    async function composed(
      current = createElement(PaginationNumber, { number: 5 }),
    ) {
      const page = await mount(
        createElement(
          Pagination,
          { ...pages, type: "default" },
          createElement(
            PaginationContent,
            null,
            createElement(
              PaginationItem,
              null,
              createElement(PaginationNumber, { number: 4 }),
            ),
            createElement(PaginationItem, null, current),
            createElement(
              PaginationItem,
              null,
              createElement(PaginationNumber, { number: 6 }),
            ),
          ),
        ),
      );
      const buttons = [...page.querySelectorAll("button")];
      expect(buttons).toHaveLength(3);
      return buttons as [
        HTMLButtonElement,
        HTMLButtonElement,
        HTMLButtonElement,
      ];
    }

    test('marks the current PaginationNumber aria-current="page" and leaves the others without the attribute', async () => {
      const [before, current, after] = await composed();
      expect(current.getAttribute("aria-current")).toBe("page");
      expect(before.hasAttribute("aria-current")).toBe(false);
      expect(after.hasAttribute("aria-current")).toBe(false);
      expect(
        [before, current, after].map((b) => computeAccessibleName(b)),
      ).toEqual(["page 4", "page 5", "page 6"]);
    });

    // React renders `false` as "false"
    test.each([
      ["true", "true"],
      ["step", "step"],
      [false, "false"],
    ] as const)(
      "lets an `aria-current` of %j replace the default",
      async (value, rendered) => {
        const [, current] = await composed(
          createElement(PaginationNumber, { number: 5, "aria-current": value }),
        );
        expect(current.getAttribute("aria-current")).toBe(rendered);
      },
    );

    test("lets `aria-current={undefined}` remove the default", async () => {
      const [, current] = await composed(
        createElement(PaginationNumber, {
          number: 5,
          "aria-current": undefined,
        }),
      );
      expect(current.hasAttribute("aria-current")).toBe(false);
    });

    // The fill follows which page is current, not the attribute
    test("fills the current page whatever its `aria-current`, and no other page", async () => {
      const [other, current, after] = await composed();
      expect(current.className).toContain("bg-bg-washed-active");
      expect(other.className).not.toContain("bg-bg-washed-active");
      expect(after.className).toBe(other.className);

      const [, unmarked] = await composed(
        createElement(PaginationNumber, {
          number: 5,
          "aria-current": undefined,
        }),
      );
      expect(unmarked.className).toBe(current.className);

      // Page 7, which isn't current, marked current by its author
      const [, marked] = await composed(
        createElement(PaginationNumber, { number: 7, "aria-current": "page" }),
      );
      expect(marked.getAttribute("aria-current")).toBe("page");
      expect(marked.className).toBe(other.className);
    });
  });
});

describe("Previous and next", () => {
  // Clicks `element` as a user would. Returns the click event, which says
  // whether a handler prevented its default action, such as following a link.
  async function click(element: Element) {
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    await act(async () => {
      element.dispatchEvent(event);
    });
    return event;
  }

  // Mounts `part` on `page` of a Pagination of 50 items, 10 a page, so pages
  // 1 to 5. Returns the element the part renders and the `onPageChange` the
  // Pagination was given.
  async function render(
    page: number,
    part: ReactElement,
    { count = 50, onPageChange = vi.fn() } = {},
  ) {
    const container = await mount(
      createElement(
        Pagination,
        { count, limit: 10, page, onPageChange },
        createElement(
          PaginationContent,
          null,
          createElement(PaginationItem, null, part),
        ),
      ),
    );
    const [element, ...others] = container.querySelectorAll("li > *");
    expect(others).toEqual([]);
    return { element: element!, onPageChange };
  }

  // The children an author passes an `asChild` part
  const button = () => createElement("button", { type: "button" }, "Pergi");
  const mydsButton = () => createElement(Button, null, "Pergi");
  const link = () => createElement("a", { href: "#halaman" }, "Pergi");

  // Each part, the page at its end of the range, where it's disabled, and
  // the page it goes to from page 3
  describe.each([
    ["previous", PaginationPrevious, 1, 2],
    ["next", PaginationNext, 5, 4],
  ] as const)("The %s part", (_, Part, end, target) => {
    // The part with `props`, around `child` when one is given
    const part = (props: Record<string, unknown> = {}, child?: ReactElement) =>
      createElement(Part, props, child);

    describe("without `asChild`", () => {
      test(`is disabled on page ${end}, and a click changes no page`, async () => {
        const { element, onPageChange } = await render(end, part());
        expect((element as HTMLButtonElement).disabled).toBe(true);
        await click(element);
        expect(onPageChange).not.toHaveBeenCalled();
      });

      test(`goes to page ${target} from page 3`, async () => {
        const { element, onPageChange } = await render(3, part());
        expect((element as HTMLButtonElement).disabled).toBe(false);
        await click(element);
        expect(onPageChange.mock.calls).toEqual([[target]]);
      });
    });

    describe.each([
      ["a <button>", button],
      ["a MYDS Button", mydsButton],
    ] as const)("with `asChild` around %s", (_, child) => {
      test(`is natively disabled on page ${end}, with no aria-disabled, and a click changes no page`, async () => {
        const { element, onPageChange } = await render(
          end,
          part({ asChild: true }, child()),
        );
        expect(element).toBeInstanceOf(HTMLButtonElement);
        expect((element as HTMLButtonElement).disabled).toBe(true);
        expect(element.hasAttribute("aria-disabled")).toBe(false);
        await click(element);
        expect(onPageChange).not.toHaveBeenCalled();
      });

      test(`is enabled on page 3, and a click goes to page ${target}`, async () => {
        const { element, onPageChange } = await render(
          3,
          part({ asChild: true }, child()),
        );
        expect((element as HTMLButtonElement).disabled).toBe(false);
        expect(element.hasAttribute("aria-disabled")).toBe(false);
        await click(element);
        expect(onPageChange.mock.calls).toEqual([[target]]);
      });
    });

    // `disabled` isn't valid on a link, nor on whatever a component renders
    describe.each([
      ["a link", link],
      [
        "a MYDS Button that is itself `asChild`, around a link",
        () => createElement(Button, { asChild: true }, link()),
      ],
    ] as const)("with `asChild` around %s", (_, child) => {
      test(`is aria-disabled on page ${end}, and a click neither follows the link nor changes the page`, async () => {
        const { element, onPageChange } = await render(
          end,
          part({ asChild: true }, child()),
        );
        expect(element).toBeInstanceOf(HTMLAnchorElement);
        expect(element.getAttribute("aria-disabled")).toBe("true");
        expect(element.hasAttribute("disabled")).toBe(false);
        expect((await click(element)).defaultPrevented).toBe(true);
        expect(onPageChange).not.toHaveBeenCalled();
      });

      test(`isn't aria-disabled on page 3, and a click follows the link and goes to page ${target}`, async () => {
        const { element, onPageChange } = await render(
          3,
          part({ asChild: true }, child()),
        );
        expect(element.hasAttribute("aria-disabled")).toBe(false);
        expect(element.hasAttribute("disabled")).toBe(false);
        expect((await click(element)).defaultPrevented).toBe(false);
        expect(onPageChange.mock.calls).toEqual([[target]]);
      });
    });

    // The default branch's `shadow-transparent` stays on its own Button
    test(`adds no classes to its child with \`asChild\`, on page ${end} or 3`, async () => {
      for (const page of [end, 3]) {
        const { element } = await render(page, part({ asChild: true }, link()));
        expect(element.hasAttribute("class")).toBe(false);
      }
    });

    describe("an `onClick`", () => {
      // Each call, in order, from the handlers and `onPageChange`
      let calls: string[];
      const onPageChange = vi.fn((page: number) => calls.push(`page ${page}`));
      beforeEach(() => {
        calls = [];
      });
      // A handler that logs `name` when called, and calls `preventDefault()`
      // when `prevent` is set
      const handler =
        (name: string, prevent = false) =>
        (event: { preventDefault(): void }) => {
          calls.push(name);
          if (prevent) event.preventDefault();
        };

      test("on the child runs before the page changes", async () => {
        const { element } = await render(
          3,
          part(
            { asChild: true },
            createElement("a", { href: "#h", onClick: handler("child") }, "P"),
          ),
          { onPageChange },
        );
        await click(element);
        expect(calls).toEqual(["child", `page ${target}`]);
      });

      test("on the child that calls `preventDefault()` keeps the page", async () => {
        const { element } = await render(
          3,
          part(
            { asChild: true },
            createElement(
              "button",
              { type: "button", onClick: handler("child", true) },
              "P",
            ),
          ),
          { onPageChange },
        );
        await click(element);
        expect(calls).toEqual(["child"]);
      });

      describe.each([
        ["without `asChild`", {}, undefined],
        ["with `asChild`", { asChild: true }, link()],
      ] as const)("on the part %s", (_, props, child) => {
        test("runs, and then the page changes once", async () => {
          const { element } = await render(
            3,
            part({ ...props, onClick: handler("part") }, child),
            { onPageChange },
          );
          await click(element);
          expect(calls).toEqual(["part", `page ${target}`]);
        });

        test("that calls `preventDefault()` keeps the page", async () => {
          const { element } = await render(
            3,
            part({ ...props, onClick: handler("part", true) }, child),
            { onPageChange },
          );
          await click(element);
          expect(calls).toEqual(["part"]);
        });
      });

      test("on the child runs before one on an `asChild` part", async () => {
        const { element } = await render(
          3,
          part(
            { asChild: true, onClick: handler("part") },
            createElement("a", { href: "#h", onClick: handler("child") }, "P"),
          ),
          { onPageChange },
        );
        await click(element);
        expect(calls).toEqual(["child", "part", `page ${target}`]);
      });
    });

    describe("lets the author's own disabled state win", () => {
      test(`as \`disabled={false}\` on the part, on page ${end}`, async () => {
        for (const [props, child] of [
          [{}, undefined],
          [{ asChild: true }, button()],
        ] as const) {
          const { element, onPageChange } = await render(
            end,
            part({ ...props, disabled: false }, child),
          );
          expect((element as HTMLButtonElement).disabled).toBe(false);
          // It still doesn't leave the range
          expect((await click(element)).defaultPrevented).toBe(true);
          expect(onPageChange).not.toHaveBeenCalled();
        }
      });

      test("as `disabled` on the part, on page 3", async () => {
        const { element } = await render(
          3,
          part({ asChild: true, disabled: true }, button()),
        );
        expect((element as HTMLButtonElement).disabled).toBe(true);
      });

      test(`as \`aria-disabled={false}\` on the part, on page ${end}`, async () => {
        const { element } = await render(
          end,
          part({ asChild: true, "aria-disabled": false }, link()),
        );
        expect(element.getAttribute("aria-disabled")).toBe("false");
      });

      test("as `aria-disabled` on the part, on page 3", async () => {
        const { element } = await render(
          3,
          part({ asChild: true, "aria-disabled": true }, link()),
        );
        expect(element.getAttribute("aria-disabled")).toBe("true");
      });

      test(`as \`aria-disabled="false"\` on the child, on page ${end}`, async () => {
        const { element } = await render(
          end,
          part(
            { asChild: true },
            createElement("a", { href: "#h", "aria-disabled": "false" }, "P"),
          ),
        );
        expect(element.getAttribute("aria-disabled")).toBe("false");
      });
    });

    test("is disabled in a Pagination with no pages", async () => {
      for (const [props, child] of [
        [{}, undefined],
        [{ asChild: true }, button()],
      ] as const) {
        const { element, onPageChange } = await render(1, part(props, child), {
          count: 0,
        });
        expect((element as HTMLButtonElement).disabled).toBe(true);
        await click(element);
        expect(onPageChange).not.toHaveBeenCalled();
      }
    });
  });

  // As the CustomizedButtonAndLabel story passes them, on page 1 of 15
  test("disables an `asChild` previous part around a MYDS Button in AutoPagination, and lets the next part's go to page 2", async () => {
    const onPageChange = vi.fn();
    const container = await mount(
      createElement(AutoPagination, {
        type: "full",
        page: 1,
        limit: 4,
        count: 60,
        maxDisplay: 2,
        onPageChange,
        previous: createElement(
          PaginationPrevious,
          { asChild: true },
          createElement(Button, { variant: "danger-fill" }, "Stop"),
        ),
        next: createElement(
          PaginationNext,
          { asChild: true },
          createElement(Button, { variant: "primary-fill" }, "Go"),
        ),
      }),
    );
    const [stop, go, ...others] = container.querySelectorAll("button");
    expect(others).toEqual([]);
    expect([stop!.textContent, go!.textContent]).toEqual(["Stop", "Go"]);
    expect(stop!.disabled).toBe(true);
    expect(go!.disabled).toBe(false);
    await click(stop!);
    await click(go!);
    expect(onPageChange.mock.calls).toEqual([[2]]);
  });
});
