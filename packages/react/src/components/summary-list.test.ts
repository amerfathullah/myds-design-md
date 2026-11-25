// @vitest-environment happy-dom
//
// SummaryListHeader is the list's title. It renders an `<h2>` by default, so a
// summary list doesn't add a second `<h1>` to a page that has its own. An
// author's props on SummaryListTerm and SummaryListAction land on their table
// cells. A ref on any part is the element it renders. The header's `id` and
// the body's `aria-labelledby` name the list's table, as the docs show.
import {
  act,
  createElement,
  createRef,
  Fragment,
  useId,
  type ComponentProps,
  type MouseEvent,
  type ReactElement,
  type Ref,
} from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { computeAccessibleName } from "dom-accessibility-api";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { describeForwardedRefs } from "./forwarded-ref-tests";
import {
  SummaryList,
  SummaryListAction,
  SummaryListAddition,
  SummaryListBody,
  SummaryListDetail,
  SummaryListHeader,
  SummaryListRow,
  SummaryListTerm,
} from "./summary-list";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// The header's classes, as the design description gives them: `txt-black-900`,
// Semibold `text-xl` with `leading-[30px]`
const headerClasses = [
  "text-txt-black-900",
  "text-xl",
  "font-semibold",
  "leading-[30px]",
];

// Every heading in `within`, in document order, as its tag, its classes
// (sorted, since their order doesn't change how it looks) and its text
const headings = (within: ParentNode) =>
  [...within.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((heading) => ({
    tag: heading.tagName.toLowerCase(),
    classes: [...heading.classList].sort(),
    text: heading.textContent,
  }));

// What `headings` reads of a `tag` heading with `classes` and "Title"
const title = (tag: string, classes: string[]) => ({
  tag,
  classes: [...classes].sort(),
  text: "Title",
});

// `element`'s server markup, parsed as the browser parses a server's HTML
function serverRender(element: ReactElement) {
  const template = document.createElement("template");
  template.innerHTML = renderToStaticMarkup(element);
  return template.content;
}

// A SummaryList part other than the header
type Part =
  | typeof SummaryList
  | typeof SummaryListBody
  | typeof SummaryListRow
  | typeof SummaryListTerm
  | typeof SummaryListDetail
  | typeof SummaryListAction
  | typeof SummaryListAddition;

// A summary list composed as the docs compose one, with every part, titled by
// `header`, and with `ref` on the part `refOn`, if given
const summaryList = (
  header: ReactElement = createElement(SummaryListHeader, null, "Title"),
  { refOn, ref }: { refOn?: Part; ref?: Ref<Element> } = {},
) => {
  // `part`'s props: the ref, if it's the part to get it. Each part's ref is
  // typed as its element's; the type-tests check those types.
  const props = (part: Part) =>
    part === refOn ? { ref: ref as Ref<never> } : null;
  return createElement(
    SummaryList,
    props(SummaryList),
    header,
    createElement(
      SummaryListBody,
      props(SummaryListBody),
      createElement(
        SummaryListRow,
        props(SummaryListRow),
        createElement(
          SummaryListTerm,
          props(SummaryListTerm),
          "Application ID",
        ),
        createElement(SummaryListDetail, props(SummaryListDetail), "SUB12345"),
        createElement(SummaryListAction, props(SummaryListAction), "Change"),
        createElement(
          SummaryListAddition,
          props(SummaryListAddition),
          "Additional information",
        ),
      ),
    ),
  );
};

const unmounts: (() => Promise<void>)[] = [];

// Unmounts everything `mount` mounted, and takes its containers off the page
async function unmountAll() {
  while (unmounts.length) await unmounts.pop()!();
}

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

const consoleMethods = ["error", "warn", "log", "info"] as const;

beforeEach(() => {
  for (const method of consoleMethods)
    vi.spyOn(console, method).mockImplementation(() => {});
});

// No test logs anything, React's warnings and errors included, and nothing
// is left on the page
afterEach(async () => {
  await unmountAll();
  const logged = consoleMethods.flatMap((method) =>
    vi.mocked(console[method]).mock.calls.map((args) => [method, ...args]),
  );
  vi.restoreAllMocks();
  expect(logged).toEqual([]);
  expect(document.body.innerHTML).toBe("");
});

describe("SummaryListHeader by default", () => {
  test("server markup is an `<h2>` with the header's classes", () => {
    const fragment = serverRender(
      createElement(SummaryListHeader, null, "Title"),
    );
    expect(headings(fragment)).toEqual([title("h2", headerClasses)]);
  });

  test("mounted in a list, its title is the list's one heading: an `<h2>` with the header's classes, and no part renders an `<h1>`", async () => {
    expect(headings(await mount(summaryList()))).toEqual([
      title("h2", headerClasses),
    ]);
  });
});

describe("an author's props on SummaryListHeader", () => {
  test("`className` merges through clx: an author's text colour replaces the header's", () => {
    const fragment = serverRender(
      createElement(
        SummaryListHeader,
        { className: "text-txt-black-700" },
        "Title",
      ),
    );
    expect(headings(fragment)).toEqual([
      title("h2", [
        "text-txt-black-700",
        "text-xl",
        "font-semibold",
        "leading-[30px]",
      ]),
    ]);
  });

  test("`id`, `aria-*`, `data-*` and event handlers reach the heading", async () => {
    // Returns the element it ran on, which React clears after the event
    const onClick = vi.fn(
      (event: MouseEvent<HTMLHeadingElement>) => event.currentTarget,
    );
    // Passed as JSX would pass them, which accepts any `data-*` attribute
    const attributes = {
      id: "application",
      "aria-describedby": "application-note",
      "data-testid": "summary-title",
      onClick,
    };
    const container = await mount(
      createElement(SummaryListHeader, attributes, "Title"),
    );
    const heading = container.querySelector("h2")!;
    expect(heading.id).toBe("application");
    expect(heading.getAttribute("aria-describedby")).toBe("application-note");
    expect(heading.getAttribute("data-testid")).toBe("summary-title");
    await act(async () => heading.click());
    expect(onClick).toHaveBeenCalledOnce();
    expect(onClick.mock.results[0]!.value).toBe(heading);
  });
});

describe("a ref on SummaryListHeader", () => {
  test("is the `<h2>` it renders", async () => {
    const ref = createRef<HTMLHeadingElement>();
    const container = await mount(
      createElement(SummaryListHeader, { ref }, "Title"),
    );
    expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
    expect(ref.current).toBe(container.querySelector("h2"));
  });

  test("is the child it renders with `asChild`", async () => {
    const ref = createRef<HTMLHeadingElement>();
    const container = await mount(
      createElement(
        SummaryListHeader,
        { ref, asChild: true },
        createElement("h3", null, "Title"),
      ),
    );
    expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
    expect(ref.current).toBe(container.querySelector("h3"));
  });
});

// Every other part forwards its ref to the element it renders too, so a ref
// works on React 18, which gives a plain function component none (#209)
describeForwardedRefs(
  // Each part, the element its ref is, and how to find that element in the
  // container a summary list is mounted in
  [
    {
      name: "SummaryList",
      part: SummaryList,
      element: "`<div>`",
      render: (ref) => summaryList(undefined, { refOn: SummaryList, ref }),
      find: (container) => container.firstElementChild,
    },
    {
      name: "SummaryListBody",
      part: SummaryListBody,
      element: "`<table>`, not its `<tbody>`",
      render: (ref) => summaryList(undefined, { refOn: SummaryListBody, ref }),
      find: (container) => container.querySelector("table"),
    },
    {
      name: "SummaryListRow",
      part: SummaryListRow,
      element: "`<tr>`",
      render: (ref) => summaryList(undefined, { refOn: SummaryListRow, ref }),
      find: (container) => container.querySelector("tr"),
    },
    {
      name: "SummaryListTerm",
      part: SummaryListTerm,
      element: '`<th scope="row">`',
      render: (ref) => summaryList(undefined, { refOn: SummaryListTerm, ref }),
      find: (container) => container.querySelector("th"),
    },
    {
      name: "SummaryListDetail",
      part: SummaryListDetail,
      element: "`<td>`",
      render: (ref) =>
        summaryList(undefined, { refOn: SummaryListDetail, ref }),
      find: (container) => container.querySelector("tr")!.children[1],
    },
    {
      name: "SummaryListAction",
      part: SummaryListAction,
      element: "`<td>`",
      render: (ref) =>
        summaryList(undefined, { refOn: SummaryListAction, ref }),
      find: (container) => container.querySelector("tr")!.children[2],
    },
    {
      name: "SummaryListAddition",
      part: SummaryListAddition,
      element: "`<td>`",
      render: (ref) =>
        summaryList(undefined, { refOn: SummaryListAddition, ref }),
      find: (container) => container.querySelector("tr")!.children[3],
    },
  ],
);

// Forwarding refs changes no markup. This is a full summary list's server
// markup as main (5afee22) rendered it, before its parts forwarded their refs,
// recorded on React 18.3.1 and 19.3.1 alike. The test builds that list itself,
// not with `summaryList`, so a change to the helper can't change what it covers.
const mainMarkup = [
  '<div class="space-y-6" id="list">',
  '<h2 class="text-txt-black-900 text-xl font-semibold leading-[30px]">Title</h2>',
  '<table class="w-full text-sm font-medium min-h-[40px] relative mt-2"><tbody>',
  '<tr class="border-otl-gray-200 border-b">',
  '<th scope="row" class="text-txt-black-500 min-w-[190px] py-3 pr-3 align-baseline"><div class="flex items-start">Application ID</div></th>',
  '<td class="text-txt-black-900 w-full py-3 pr-3">SUB12345</td>',
  '<td class="py-1.5 pr-3 text-right align-baseline"><div class="flex flex-1 justify-end"><button>Change</button></div></td>',
  '<td class="text-txt-black-900 min-w-36 py-2 pr-3">Additional information</td>',
  "</tr>",
  '<tr class="border-otl-gray-200 border-b" data-row="2">',
  '<th scope="row" class="text-txt-black-500 min-w-[190px] py-3 pr-3 align-baseline" colSpan="2"><div class="flex items-start">Status</div></th>',
  '<td class="py-1.5 pr-3 text-right align-baseline"></td>',
  '<td class="text-txt-black-900 min-w-36 py-2 pr-3 w-40"></td>',
  "</tr>",
  "</tbody></table></div>",
].join("");

test("a full summary list, with a ref on every part, server-renders as on main", () => {
  // Passed as JSX would pass them, which accepts any `data-*` attribute
  const row = { "data-row": "2", ref: createRef<HTMLTableRowElement>() };
  const list = createElement(
    SummaryList,
    { id: "list", ref: createRef<HTMLDivElement>() },
    createElement(SummaryListHeader, { ref: createRef() }, "Title"),
    createElement(
      SummaryListBody,
      { className: "mt-2", ref: createRef<HTMLTableElement>() },
      createElement(
        SummaryListRow,
        { ref: createRef<HTMLTableRowElement>() },
        createElement(
          SummaryListTerm,
          { ref: createRef<HTMLTableCellElement>() },
          "Application ID",
        ),
        createElement(
          SummaryListDetail,
          { ref: createRef<HTMLTableCellElement>() },
          "SUB12345",
        ),
        createElement(
          SummaryListAction,
          { ref: createRef<HTMLTableCellElement>() },
          createElement("button", null, "Change"),
        ),
        createElement(
          SummaryListAddition,
          { ref: createRef<HTMLTableCellElement>() },
          "Additional information",
        ),
      ),
      createElement(
        SummaryListRow,
        row,
        createElement(
          SummaryListTerm,
          { colSpan: 2, ref: createRef<HTMLTableCellElement>() },
          "Status",
        ),
        createElement(SummaryListAction, {
          ref: createRef<HTMLTableCellElement>(),
        }),
        createElement(SummaryListAddition, {
          className: "w-40",
          ref: createRef<HTMLTableCellElement>(),
        }),
      ),
    ),
  );
  expect(renderToStaticMarkup(list)).toBe(mainMarkup);
});

describe("SummaryListHeader with `asChild`", () => {
  // A header that renders `child` in its place
  const header = (child: ReactElement) =>
    createElement(SummaryListHeader, { asChild: true }, child);

  test("renders its `<h3>` child in place of the `<h2>`, with the header's classes and the child's", async () => {
    const container = await mount(
      summaryList(header(createElement("h3", { className: "mt-8" }, "Title"))),
    );
    expect(headings(container)).toEqual([
      title("h3", [...headerClasses, "mt-8"]),
    ]);
  });

  test("renders an `<h1>` child as an `<h1>`, in server markup too", async () => {
    const h1 = header(createElement("h1", null, "Title"));
    expect(headings(serverRender(h1))).toEqual([title("h1", headerClasses)]);
    expect(headings(await mount(h1))).toEqual([title("h1", headerClasses)]);
  });
});

// SummaryListTerm and SummaryListAction are table cells with no `display` of
// their own (#208), so `colSpan` and `rowSpan` work on them. Each lays its
// children out in a wrapper inside it. The Chromium test in the style package
// checks the layout; these check where an author's props land.
describe("an author's props on SummaryListTerm and SummaryListAction", () => {
  // A summary list's body holding `rows`, each given as its cells
  const body = (...rows: ReactElement[][]) =>
    createElement(
      SummaryListBody,
      null,
      ...rows.map((cells) => createElement(SummaryListRow, null, ...cells)),
    );

  test("the term's `colSpan`, `rowSpan` and `className` reach its `<th scope=\"row\">`, and an author's `scope` wins", async () => {
    const container = await mount(
      body(
        [
          createElement(
            SummaryListTerm,
            { colSpan: 2, rowSpan: 2, className: "w-60" },
            "Application ID",
          ),
        ],
        [createElement(SummaryListTerm, { scope: "col" }, "Applicant Name")],
      ),
    );
    const [spanning, scoped] = container.querySelectorAll("th");
    expect({
      scope: spanning!.scope,
      colSpan: spanning!.colSpan,
      rowSpan: spanning!.rowSpan,
      hasAuthorClass: spanning!.classList.contains("w-60"),
      authorScope: scoped!.scope,
    }).toEqual({
      scope: "row",
      colSpan: 2,
      rowSpan: 2,
      hasAuthorClass: true,
      authorScope: "col",
    });
  });

  test("the term's children sit in a wrapper inside its `<th>`, which its `className` doesn't reach", async () => {
    const container = await mount(
      body([
        createElement(
          SummaryListTerm,
          { className: "gap-2" },
          createElement("span", null, "Alamat"),
          createElement("span", null, "Address"),
        ),
      ]),
    );
    const cell = container.querySelector("th")!;
    const [malay, english] = cell.querySelectorAll("span");
    const wrapper = malay!.parentElement!;
    expect({
      cellHasGap: cell.classList.contains("gap-2"),
      sameWrapper: english!.parentElement === wrapper,
      wrapperInCell: wrapper.parentElement === cell,
      wrapperHasGap: wrapper.classList.contains("gap-2"),
    }).toEqual({
      cellHasGap: true,
      sameWrapper: true,
      wrapperInCell: true,
      wrapperHasGap: false,
    });
  });

  test("the action's `className`, `colSpan` and `id` go on its `<td>`, and its children sit in a wrapper inside it, which the `className` doesn't reach", async () => {
    const container = await mount(
      body([
        createElement(SummaryListTerm, null, "Application ID"),
        createElement(
          SummaryListAction,
          { colSpan: 2, id: "actions", className: "gap-2" },
          createElement("button", { type: "button" }, "Edit"),
          createElement("button", { type: "button" }, "Remove"),
        ),
      ]),
    );
    const cell = container.querySelector("td")!;
    const [edit, remove] = cell.querySelectorAll("button");
    const wrapper = edit!.parentElement!;
    expect({
      id: cell.id,
      colSpan: cell.colSpan,
      cellHasGap: cell.classList.contains("gap-2"),
      sameWrapper: remove!.parentElement === wrapper,
      wrapperInCell: wrapper.parentElement === cell,
      wrapperHasGap: wrapper.classList.contains("gap-2"),
    }).toEqual({
      id: "actions",
      colSpan: 2,
      cellHasGap: true,
      sameWrapper: true,
      wrapperInCell: true,
      wrapperHasGap: false,
    });
  });

  test("`dangerouslySetInnerHTML` on the term and the action fills the wrapper inside its cell, as children do, in server markup too", async () => {
    const list = body([
      createElement(SummaryListTerm, {
        dangerouslySetInnerHTML: { __html: "Nama <em>pemohon</em>" },
      }),
      createElement(SummaryListAction, {
        dangerouslySetInnerHTML: { __html: '<a href="#change">Change</a>' },
      }),
    ]);
    // How many nodes each cell holds, and the markup inside its first
    const read = (within: ParentNode) =>
      [...within.querySelectorAll("th, td")].map((cell) => ({
        nodes: cell.childNodes.length,
        wrapped: cell.firstElementChild?.innerHTML,
      }));
    const expected = [
      { nodes: 1, wrapped: "Nama <em>pemohon</em>" },
      { nodes: 1, wrapped: '<a href="#change">Change</a>' },
    ];
    expect(read(serverRender(list))).toEqual(expected);
    expect(read(await mount(list))).toEqual(expected);
  });

  // As in an action holding `{label && <Button>{label}</Button>}`, which
  // renders `""` when `label` is an empty string
  test("an action with nothing to show is an empty `<td>`, so `:empty` and `empty:hidden` still match it, in server markup too", async () => {
    const list = body(
      [createElement(SummaryListAction)],
      [createElement(SummaryListAction, null, undefined)],
      [createElement(SummaryListAction, null, false)],
      [createElement(SummaryListAction, null, null, false)],
      [createElement(SummaryListAction, null, "")],
      [createElement(SummaryListAction, null, "", null)],
      [
        createElement(SummaryListAction, {
          dangerouslySetInnerHTML: { __html: "" },
        }),
      ],
      // What a Trusted Types policy returns for "": an object, which React
      // sets as its string
      [
        createElement(SummaryListAction, {
          dangerouslySetInnerHTML: {
            __html: { toString: () => "" } as unknown as TrustedHTML,
          },
        }),
      ],
    );
    const read = (within: ParentNode) =>
      [...within.querySelectorAll("td")].map((cell) => cell.matches(":empty"));
    const expected = [true, true, true, true, true, true, true, true];
    expect(read(serverRender(list))).toEqual(expected);
    expect(read(await mount(list))).toEqual(expected);
  });

  // React renders an iterator's items, as on main, though it warns that
  // iterators as children are unsupported, since one can be read only once.
  // So deciding whether the action is empty mustn't read it first.
  test("an action given its buttons as an iterator, such as `map.values()`, renders them, in server markup too", async () => {
    // A list whose action holds a fresh iterator over two buttons
    const list = () =>
      body([
        createElement(
          SummaryListAction,
          null,
          new Map([
            ["edit", createElement("button", { key: "edit" }, "Edit")],
            ["remove", createElement("button", { key: "remove" }, "Remove")],
          ]).values(),
        ),
      ]);
    const read = (within: ParentNode) =>
      [...within.querySelectorAll("td button")].map(
        (button) => button.textContent,
      );
    expect(read(serverRender(list()))).toEqual(["Edit", "Remove"]);
    expect(read(await mount(list()))).toEqual(["Edit", "Remove"]);
    // React's warning is all that's logged
    const errors = vi
      .mocked(console.error)
      .mock.calls.map(([message]) => String(message));
    expect(
      errors.filter(
        (message) =>
          !message.startsWith("Using Iterators as children is unsupported"),
      ),
    ).toEqual([]);
    vi.mocked(console.error).mockClear();
  });
});

// SummaryListBody's `<table>` has no name of its own, and the header before it
// doesn't name it (#211). The docs show authors how to: point the body's
// `aria-labelledby` at the header's `id`, or pass an `aria-label` where no
// visible title names the table. SummaryList needs no code of its own for
// this, since the header passes `id` to its heading and the body passes
// `aria-*` to its `<table>`. These keep that pattern working.
describe("naming a summary list's table", () => {
  // The attributes that can name the table
  type Naming = Pick<ComponentProps<"table">, "aria-label" | "aria-labelledby">;

  // A summary list titled by `heading`, if given, whose body gets `naming`
  const list = (heading: ReactElement | null, naming: Naming = {}) =>
    createElement(
      SummaryList,
      null,
      heading,
      createElement(
        SummaryListBody,
        naming,
        createElement(
          SummaryListRow,
          null,
          createElement(SummaryListTerm, null, "Application ID"),
          createElement(SummaryListDetail, null, "SUB12345"),
        ),
      ),
    );

  // A header with `id`, titled "Government Subsidy Application"
  const header = (id?: string) =>
    createElement(SummaryListHeader, { id }, "Government Subsidy Application");

  // The accessible name of each table in `within`, in document order
  const tableNames = (within: ParentNode) =>
    [...within.querySelectorAll("table")].map((table) =>
      computeAccessibleName(table),
    );

  test("the header's `id`, with the body's `aria-labelledby`, names the table by the header's text", async () => {
    const container = await mount(
      list(header("subsidy-application"), {
        "aria-labelledby": "subsidy-application",
      }),
    );
    expect(tableNames(container)).toEqual(["Government Subsidy Application"]);
  });

  test("the name is in the server markup, so it doesn't wait for hydration", async () => {
    // The server's HTML, on the page as the browser shows it before React
    // hydrates it
    const container = document.body.appendChild(document.createElement("div"));
    unmounts.push(async () => container.remove());
    container.innerHTML = renderToStaticMarkup(
      list(header("subsidy-application"), {
        "aria-labelledby": "subsidy-application",
      }),
    );
    expect(tableNames(container)).toEqual(["Government Subsidy Application"]);
  });

  test.each([
    [
      "an `<h3>` child's `id`",
      createElement(
        SummaryListHeader,
        { asChild: true },
        createElement("h3", { id: "tax-summary" }, "Tax summary"),
      ),
    ],
    [
      "an `id` on the header, around an `<h3>` child",
      createElement(
        SummaryListHeader,
        { asChild: true, id: "tax-summary" },
        createElement("h3", null, "Tax summary"),
      ),
    ],
  ])(
    "with `asChild`, %s names the table by the heading's text",
    async (_, asChildHeader) => {
      const container = await mount(
        list(asChildHeader, { "aria-labelledby": "tax-summary" }),
      );
      expect(container.querySelector("h3")!.id).toBe("tax-summary");
      expect(tableNames(container)).toEqual(["Tax summary"]);
    },
  );

  test("an `aria-label` on the body names the table", async () => {
    const container = await mount(
      list(null, { "aria-label": "Ringkasan permohonan" }),
    );
    expect(tableNames(container)).toEqual(["Ringkasan permohonan"]);
  });

  test("`aria-labelledby` and `aria-label` go on the `<table>`, not its `<tbody>`", async () => {
    const container = await mount(
      list(header("subsidy-application"), {
        "aria-labelledby": "subsidy-application",
        "aria-label": "Ringkasan permohonan",
      }),
    );
    const table = container.querySelector("table")!;
    const tbody = table.querySelector("tbody")!;
    expect({
      table: [
        table.getAttribute("aria-labelledby"),
        table.getAttribute("aria-label"),
      ],
      tbody: [
        tbody.getAttribute("aria-labelledby"),
        tbody.getAttribute("aria-label"),
      ],
    }).toEqual({
      table: ["subsidy-application", "Ringkasan permohonan"],
      tbody: [null, null],
    });
  });

  test("with both, `aria-labelledby` wins over `aria-label`", async () => {
    const container = await mount(
      list(header("subsidy-application"), {
        "aria-labelledby": "subsidy-application",
        "aria-label": "Ringkasan permohonan",
      }),
    );
    expect(tableNames(container)).toEqual(["Government Subsidy Application"]);
  });

  test("with neither, the table has no name, though a header comes before it", async () => {
    const container = await mount(list(header()));
    const table = container.querySelector("table")!;
    expect(computeAccessibleName(table)).toBe("");
    expect(table.hasAttribute("aria-labelledby")).toBe(false);
    expect(table.hasAttribute("aria-label")).toBe(false);
  });

  test("two lists on one page, each with its own id from `useId()`, are each named by their own header", async () => {
    // A summary list named by its header, as a component that renders one
    // more than once makes it
    const Titled = ({ text }: { text: string }) => {
      const id = useId();
      return list(createElement(SummaryListHeader, { id }, text), {
        "aria-labelledby": id,
      });
    };
    const container = await mount(
      createElement(
        Fragment,
        null,
        createElement(Titled, { text: "Applicant Details" }),
        createElement(Titled, { text: "Subsidy Details" }),
      ),
    );
    const ids = [...container.querySelectorAll("h2")].map(({ id }) => id);
    expect(new Set(ids).size).toBe(2);
    expect(tableNames(container)).toEqual([
      "Applicant Details",
      "Subsidy Details",
    ]);
  });
});
