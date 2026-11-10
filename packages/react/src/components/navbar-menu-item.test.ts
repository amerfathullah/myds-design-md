import { createElement, type ComponentProps, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { sharedContext } from "../utils/registry";
import { NavbarMenu, NavbarMenuItem } from "./navbar";

// NavbarMenuDropdown's context, which tells an item it sits in a dropdown. It
// isn't exported, and a closed dropdown renders no items, so the tests provide
// it themselves, under the name the library's registry holds it by
const DropdownContext = sharedContext("NavbarMenuDropdownContext", false);

type ItemProps = Omit<ComponentProps<typeof NavbarMenuItem>, "children">;

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

// An item rendered in a NavbarMenu, at the top level or in a dropdown.
// Returns the item's markup, its `<li>` and the element in the `<li>`, which
// is the item's link.
function render(props: ItemProps, child: ReactNode, inDropdown: boolean) {
  const item = createElement(NavbarMenuItem, { ...props, children: child });
  const html = renderToStaticMarkup(
    createElement(
      NavbarMenu,
      null,
      inDropdown
        ? createElement(DropdownContext.Provider, { value: true }, item)
        : item,
    ),
  );
  const markup = html.match(/<li\b.*<\/li>/)?.[0] ?? "";
  const [, li, link] = markup.match(/^(<li\b[^>]*>)(<[a-z]+\b[^>]*>)/) ?? [];
  expect(link).toBeDefined();
  return { markup, li: parse(li), link: parse(link) };
}

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

// An item's link takes the radius of the area it fills: `rounded-md` at the
// top level, `rounded-xs` in a dropdown. The links below are the markup each
// item rendered before `asChild` went through Link.
describe.each([
  [
    "at the top level",
    false,
    '<a href="#a" class="transition-colors box-decoration-clone focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-fr-primary no-underline text-inherit decoration-inherit w-full truncate px-2.5 py-1.5 rounded-md" target="_self">Lain</a>',
  ],
  [
    "in a dropdown",
    true,
    '<a href="#a" class="transition-colors box-decoration-clone focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-fr-primary no-underline text-inherit decoration-inherit w-full truncate px-2.5 py-1.5 rounded-xs" target="_self">Lain</a>',
  ],
] as const)("NavbarMenuItem %s", (_, inDropdown, defaultLink) => {
  const item = (props: Partial<ItemProps>, child: ReactNode) =>
    render({ href: "#a", ...props }, child, inDropdown);
  // An `asChild` item around `child`, by default a plain <a> with no class
  const asChildItem = (
    child: ReactNode = createElement("a", { href: "#a" }, "Lain"),
  ) => item({ asChild: true }, child);

  test("without `asChild`, renders its link as before", () => {
    expect(item({}, "Lain").markup).toContain(`>${defaultLink}</li>`);
  });

  test("with `asChild`, renders an <a> child with no `underline` attribute", () => {
    const { tag, attributes } = asChildItem().link;
    expect(tag).toBe("a");
    expect(Object.keys(attributes).sort()).toEqual(["class", "href", "target"]);
  });

  test("with `asChild`, a component child receives no `underline` prop", () => {
    const received: Record<string, unknown>[] = [];
    const Child = (props: Record<string, unknown>) => {
      received.push(props);
      return createElement("a", props);
    };
    const { link } = asChildItem(createElement(Child, null, "Lain"));
    expect(received).toHaveLength(1);
    expect(received[0]).not.toHaveProperty("underline");
    expect(received[0]).toMatchObject({ href: "#a", target: "_self" });
    expect(link.attributes).not.toHaveProperty("underline");
  });

  test("with `asChild`, a child with no class gets the same classes as the item without `asChild`", () => {
    const { classes } = item({}, "Lain").link;
    expect(classes).toContain("w-full");
    expect(asChildItem().link.classes.sort()).toEqual(classes.sort());
  });

  test("with `asChild`, a child's own classes follow the item's", () => {
    const { classes } = item({}, "Lain").link;
    const child = createElement(
      "a",
      { href: "#a", className: "font-semibold" },
      "Lain",
    );
    expect(asChildItem(child).link.classes).toEqual([
      ...classes,
      "font-semibold",
    ]);
  });

  test.each(ringClasses)(
    "with `asChild`, the link has Link's ring class %s once",
    (ringClass) => {
      const { classes } = asChildItem().link;
      expect(classes.filter((name) => name === ringClass)).toHaveLength(1);
    },
  );

  test('with `asChild`, a child with no `target` gets `target="_self"`', () => {
    expect(asChildItem().link.attributes.target).toBe("_self");
  });

  test("with `asChild`, the child's own `href` and `target` win over the item's", () => {
    const child = createElement(
      "a",
      { href: "/lain", target: "_blank" },
      "Lain",
    );
    const { attributes } = asChildItem(child).link;
    expect(attributes.href).toBe("/lain");
    expect(attributes.target).toBe("_blank");
  });

  test("with `asChild`, a child with no `href` takes the item's", () => {
    const child = createElement("a", null, "Lain");
    expect(asChildItem(child).link.attributes.href).toBe("#a");
  });

  test.each([
    ["without `asChild`", false],
    ["with `asChild`", true],
  ])(
    "a `className` on the item goes on its <li>, not its link, %s",
    (_, asChild) => {
      const child = asChild
        ? createElement("a", { href: "#a" }, "Lain")
        : "Lain";
      const { li, link } = item({ asChild, className: "my-item" }, child);
      expect(li.classes).toContain("my-item");
      expect(link.classes).not.toContain("my-item");
    },
  );
});
