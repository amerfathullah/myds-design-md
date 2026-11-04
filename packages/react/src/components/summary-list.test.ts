// @vitest-environment happy-dom
//
// SummaryListHeader is the list's title. It renders an `<h2>` by default, so a
// summary list doesn't add a second `<h1>` to a page that has its own.
import {
  act,
  createElement,
  createRef,
  type MouseEvent,
  type ReactElement,
} from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

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

// A summary list composed as the docs compose one, with every part, titled by
// `header`
const summaryList = (
  header: ReactElement = createElement(SummaryListHeader, null, "Title"),
) =>
  createElement(
    SummaryList,
    null,
    header,
    createElement(
      SummaryListBody,
      null,
      createElement(
        SummaryListRow,
        null,
        createElement(SummaryListTerm, null, "Application ID"),
        createElement(SummaryListDetail, null, "SUB12345"),
        createElement(SummaryListAction, null, "Change"),
        createElement(SummaryListAddition, null, "Additional information"),
      ),
    ),
  );

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

const consoleMethods = ["error", "warn", "log", "info"] as const;

beforeEach(() => {
  for (const method of consoleMethods)
    vi.spyOn(console, method).mockImplementation(() => {});
});

// No test logs anything, React's warnings and errors included, and nothing
// is left on the page
afterEach(async () => {
  while (unmounts.length) await unmounts.pop()!();
  const logged = consoleMethods.flatMap((method) =>
    vi.mocked(console[method]).mock.calls.map((args) => [method, ...args]),
  );
  vi.restoreAllMocks();
  expect(logged).toEqual([]);
  expect(document.body.innerHTML).toBe("");
});

describe("SummaryListHeader by default", () => {
  test("server markup is an `<h2>` with the header's classes", () => {
    const html = serverRender(createElement(SummaryListHeader, null, "Title"));
    expect(headings(html)).toEqual([title("h2", headerClasses)]);
  });

  test("mounted in a list, its title is the list's one heading: an `<h2>` with the header's classes, and no part renders an `<h1>`", async () => {
    expect(headings(await mount(summaryList()))).toEqual([
      title("h2", headerClasses),
    ]);
  });
});

describe("an author's props on SummaryListHeader", () => {
  test("`className` merges through clx: an author's text colour replaces the header's", () => {
    const html = serverRender(
      createElement(
        SummaryListHeader,
        { className: "text-txt-black-700" },
        "Title",
      ),
    );
    expect(headings(html)).toEqual([
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
