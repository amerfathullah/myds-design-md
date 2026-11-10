import { createElement, type ComponentProps, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { HomeIcon } from "../icons/home";
import { BreadcrumbLink, BreadcrumbPage } from "./breadcrumb";

// The props the tests pass. Plain JavaScript can pass a `null` title, which
// the props' types don't take
type CrumbProps = { title?: string | null };

// A crumb's markup, rendered with `props` and `children` as JSX would pass
// them: one child as itself, several as an array, none as `undefined`
function render(
  crumb: typeof BreadcrumbLink | typeof BreadcrumbPage,
  props: CrumbProps,
  children: ReactNode[],
) {
  return renderToStaticMarkup(
    createElement(
      crumb as typeof BreadcrumbLink,
      props as ComponentProps<typeof BreadcrumbLink>,
      ...children,
    ),
  );
}

// The `title` on the element a crumb renders: `undefined` if it has none,
// and `""` if it has an empty one
function titleOf(html: string) {
  const element = html.match(/^<[a-z]+(?:\s[^>]*)?>/)?.[0];
  expect(element).toBeDefined();
  return element?.match(/\stitle="([^"]*)"/)?.[1];
}

const title = "Go to the home page";

// What a crumb can hold. Only plain text is a string
const textChildren: ReactNode[] = ["Home"];
const otherChildren: [string, ReactNode[]][] = [
  ["a <span>", [createElement("span", null, "Home")]],
  ["an icon only", [createElement(HomeIcon)]],
  ["an icon plus text", [createElement(HomeIcon), "Home"]],
  ["`Page {n}`", ["Page ", 2]],
  ["no children", []],
];
const allChildren: [string, ReactNode[]][] = [
  ["plain text", textChildren],
  ...otherChildren,
];

// A crumb with no `title`: left out, `undefined`, or `null` from plain
// JavaScript
const noTitles: [string, CrumbProps][] = [
  ["left out", {}],
  ["undefined", { title: undefined }],
  ["null", { title: null }],
];

// Every test here also fails on any warning React logs, whichever test
// renders it first
beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  const warnings = [...vi.mocked(console.error).mock.calls];
  vi.restoreAllMocks();
  expect(warnings).toEqual([]);
});

describe.each([
  ["BreadcrumbLink", BreadcrumbLink],
  ["BreadcrumbPage", BreadcrumbPage],
] as const)("%s", (_, crumb) => {
  test.each(allChildren)(
    "a `title` you pass renders as given, with %s",
    (_, children) => {
      expect(titleOf(render(crumb, { title }, children))).toBe(title);
    },
  );

  test.each(noTitles)(
    "with the `title` %s, plain-text children render their text as the `title`",
    (_, props) => {
      expect(titleOf(render(crumb, props, textChildren))).toBe("Home");
    },
  );

  describe.each(noTitles)("with the `title` %s", (_, props) => {
    test.each(otherChildren)("%s render no `title`", (_, children) => {
      expect(titleOf(render(crumb, props, children))).toBeUndefined();
    });
  });

  test.each(allChildren)(
    "an empty `title` renders empty, with %s",
    (_, children) => {
      expect(titleOf(render(crumb, { title: "" }, children))).toBe("");
    },
  );

  test("no case renders `[object Object]`", () => {
    for (const props of [
      { title },
      { title: "" },
      ...noTitles.map(([, p]) => p),
    ])
      for (const [, children] of allChildren)
        expect(render(crumb, props, children)).not.toContain("[object Object]");
  });
});

// Under `asChild`, BreadcrumbLink renders its child, an <a>, through Slot,
// which applies the child's props last
describe("BreadcrumbLink asChild", () => {
  function renderAsChild(props: CrumbProps, child: CrumbProps = {}) {
    return renderToStaticMarkup(
      createElement(
        BreadcrumbLink,
        { ...(props as ComponentProps<typeof BreadcrumbLink>), asChild: true },
        createElement(
          "a",
          { ...(child as ComponentProps<"a">), href: "/" },
          "Home",
        ),
      ),
    );
  }

  test("renders its child, an <a>", () => {
    expect(renderAsChild({})).toMatch(/^<a\s/);
  });

  test("renders the `title` passed to BreadcrumbLink", () => {
    expect(titleOf(renderAsChild({ title }))).toBe(title);
  });

  test("a `title` on the child wins over one on BreadcrumbLink", () => {
    expect(titleOf(renderAsChild({ title }, { title: "Home page" }))).toBe(
      "Home page",
    );
  });

  test.each(noTitles)("with the `title` %s, renders no `title`", (_, props) => {
    expect(titleOf(renderAsChild(props))).toBeUndefined();
  });

  test("no case renders `[object Object]`", () => {
    for (const props of [{ title }, ...noTitles.map(([, p]) => p)])
      expect(renderAsChild(props)).not.toContain("[object Object]");
  });
});
