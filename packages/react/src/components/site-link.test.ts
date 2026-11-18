import { createElement, type ComponentProps, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { SiteLink, SiteLinkGroup } from "./footer";

type SiteLinkProps = Omit<ComponentProps<typeof SiteLink>, "children">;

// An element's tag and attributes, from its opening tag
function parse(openingTag = "") {
  const [, tag, rest = ""] = openingTag.match(/^<([a-z]+)(.*)>$/) ?? [];
  const attributes: Record<string, string> = Object.fromEntries(
    [...rest.matchAll(/\s([^\s=]+)(?:="([^"]*)")?/g)].map(
      ([, name, value = ""]) => [name, value],
    ),
  );
  return { tag, attributes, classes: attributes.class?.split(" ") ?? [] };
}

// A SiteLink in a SiteLinkGroup, which adds its own classes to each link.
// Returns the link's markup and its parsed opening tag.
function render(props: SiteLinkProps, child: ReactNode) {
  const html = renderToStaticMarkup(
    createElement(
      SiteLinkGroup,
      { groupTitle: "Pautan" },
      createElement(SiteLink, { ...props, children: child }),
    ),
  );
  const markup = html.match(/<a\b.*?<\/a>/)?.[0] ?? "";
  const [link] = markup.match(/^<a\b[^>]*>/) ?? [];
  expect(link).toBeDefined();
  return { markup, link: parse(link) };
}

// An `asChild` SiteLink around `child`, by default a plain <a> with no class
function renderAsChild(
  props: SiteLinkProps = {},
  child: ReactNode = createElement("a", { href: "#s2" }, "Two"),
) {
  return render({ ...props, asChild: true }, child).link;
}

// The Link props SiteLink takes, none of which may reach the DOM or a child
const linkProps = ["underline", "newTab", "primary", "asChild"];

// Link's focus ring
const ringClasses = [
  "box-decoration-clone",
  "focus-visible:outline-hidden",
  "focus-visible:ring-3",
  "focus-visible:ring-fr-primary",
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

describe("SiteLink in a SiteLinkGroup", () => {
  test("without `asChild`, renders its link as before", () => {
    expect(render({ href: "#s1" }, "One").markup).toBe(
      '<a href="#s1" class="transition-colors box-decoration-clone focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-fr-primary no-underline hover:underline text-inherit decoration-inherit hover:text-txt-black-900 line-clamp-1 lg:col-span-full text-txt-black-700" target="_self">One</a>',
    );
  });

  describe.each([
    ["no Link props", {}],
    ['`underline="always"`', { underline: "always" }],
    ['`underline="none"`', { underline: "none" }],
    ["`newTab`", { newTab: true }],
    ["`primary`", { primary: true }],
  ] as const)("with %s", (_, props) => {
    test("with `asChild`, an <a> child gets the same classes, in the same order, and `target` as the link without `asChild`", () => {
      const { attributes, classes } = render(
        { ...props, href: "#s2" },
        "Two",
      ).link;
      expect(classes).toContain("line-clamp-1");
      const link = renderAsChild(props);
      expect(link.classes).toEqual(classes);
      expect(link.attributes.target).toBe(attributes.target);
    });

    test("with `asChild`, an <a> child gets no attribute for a Link prop", () => {
      const { tag, attributes } = renderAsChild(props);
      expect(tag).toBe("a");
      expect(Object.keys(attributes).sort()).toEqual([
        "class",
        "href",
        "target",
      ]);
    });

    test("with `asChild`, a component child receives no Link prop", () => {
      const received: Record<string, unknown>[] = [];
      const Child = (childProps: Record<string, unknown>) => {
        received.push(childProps);
        return createElement("a", childProps);
      };
      const { attributes } = renderAsChild(
        props,
        createElement(Child, { href: "#s2" }, "Two"),
      );
      expect(received).toHaveLength(1);
      for (const name of linkProps)
        expect(received[0]).not.toHaveProperty(name);
      expect(Object.keys(attributes).sort()).toEqual([
        "class",
        "href",
        "target",
      ]);
    });
  });

  test("with `asChild`, a child's own classes follow SiteLink's", () => {
    const { classes } = render({ href: "#s2" }, "Two").link;
    const child = createElement(
      "a",
      { href: "#s2", className: "font-semibold" },
      "Two",
    );
    expect(renderAsChild({}, child).classes).toEqual([
      ...classes,
      "font-semibold",
    ]);
  });

  test.each(ringClasses)(
    "with `asChild`, the link has Link's ring class %s once",
    (ringClass) => {
      const { classes } = renderAsChild();
      expect(classes.filter((name) => name === ringClass)).toHaveLength(1);
    },
  );

  test('with `asChild`, a child with no `href` takes SiteLink\'s, and gets `target="_self"`', () => {
    const child = createElement("a", null, "About");
    const { attributes } = renderAsChild({ href: "/about" }, child);
    expect(attributes.href).toBe("/about");
    expect(attributes.target).toBe("_self");
  });

  test("with `asChild`, the child's own `href` and `target` win over SiteLink's", () => {
    const child = createElement(
      "a",
      { href: "/lain", target: "_blank" },
      "Lain",
    );
    const { attributes } = renderAsChild({ href: "/about" }, child);
    expect(attributes.href).toBe("/lain");
    expect(attributes.target).toBe("_blank");
  });

  test('with `asChild`, `newTab` gives `target="_blank"`', () => {
    expect(renderAsChild({ newTab: true }).attributes.target).toBe("_blank");
  });

  test("with `asChild`, `primary` gives `text-txt-primary` in place of `text-inherit`", () => {
    expect(renderAsChild().classes).toContain("text-inherit");
    const { classes } = renderAsChild({ primary: true });
    expect(classes).toContain("text-txt-primary");
    expect(classes).not.toContain("text-inherit");
  });
});
