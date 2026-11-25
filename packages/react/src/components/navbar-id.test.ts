// @vitest-environment happy-dom
//
// An `id` on Navbar reaches its `<header>`, and the mobile menu still finds
// the header by it. Navbar resolves one id: the author's, if it's a non-empty
// string, else the one it generates. The mobile menu used to look the header
// up by the generated id, which an author's id replaced. With no anchor, the
// menu opened in the window's top-left corner, as wide as its content and
// without its overlay, partly under the header (#216).
import {
  act,
  createElement,
  type ComponentProps,
  type ReactElement,
} from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { Navbar, NavbarAction, NavbarMenu, NavbarMenuItem } from "./navbar";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const unmounts: (() => Promise<void>)[] = [];

// Mounts a root in a container on the page, as an app does, and returns a
// function that renders an element into it. The mobile menu portals into
// `<body>`, outside the container.
function mountRoot() {
  const container = document.body.appendChild(document.createElement("div"));
  const root = createRoot(container);
  unmounts.push(async () => {
    await act(async () => root.unmount());
    container.remove();
  });
  return (element: ReactElement) => act(async () => root.render(element));
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

// No test logs an error or a warning, such as React's for a change in the
// order of hooks, and nothing is left on the page
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

type NavbarProps = ComponentProps<typeof Navbar>;

// A Navbar with `props`, a menu of two items and its toggle, as the docs
// compose one
const navbar = (props: NavbarProps) =>
  createElement(
    Navbar,
    props,
    createElement(
      NavbarMenu,
      null,
      createElement(NavbarMenuItem, {
        href: "#perkhidmatan",
        children: "Perkhidmatan",
      }),
      createElement(NavbarMenuItem, {
        href: "#hubungi",
        children: "Hubungi",
      }),
    ),
    createElement(NavbarAction),
  );

// The `<header>`. happy-dom has no layout, so every element's box is empty:
// the header gets the box it has in a 390px-wide window, 56px tall.
function header() {
  const element = document.querySelector("header")!;
  vi.spyOn(element, "getBoundingClientRect").mockReturnValue(
    new DOMRect(0, 0, 390, 56),
  );
  return element;
}

// NavbarAction's toggle: the one button outside the menu's `<nav>`
function toggle() {
  const [button, ...others] = [...document.querySelectorAll("button")].filter(
    (element) => !element.closest("nav"),
  );
  expect(others).toEqual([]);
  return button!;
}

// The popper Radix wraps the mobile menu's panel in, which is on the page
// only while the menu is open
const popper = () =>
  document.querySelector<HTMLElement>("[data-radix-popper-content-wrapper]");

// Opens the mobile menu with its toggle. Returns the anchor's width, which
// Radix gives the popper once the menu has an anchor, and which the menu's
// list and overlay take as their own; it's empty while the menu has none.
async function openMenu() {
  await act(async () => toggle().click());
  expect(popper()).not.toBeNull();
  return popper()!.style.getPropertyValue("--radix-popper-anchor-width");
}

// Closes the open mobile menu with its toggle
async function closeMenu() {
  await act(async () => toggle().click());
  expect(popper()).toBeNull();
  expect(toggle().getAttribute("aria-expanded")).toBe("false");
}

// The header's id, whether it finds the header, and the anchor's width once
// the mobile menu is open
async function anchored() {
  const element = header();
  return {
    id: element.id,
    findsHeader: document.getElementById(element.id) === element,
    anchorWidth: await openMenu(),
  };
}

describe("Navbar's `<header>`", () => {
  test('renders `id: "site-header"`, and the mobile menu opens anchored to it, as wide as it', async () => {
    await mountRoot()(navbar({ id: "site-header" }));
    expect(await anchored()).toEqual({
      id: "site-header",
      findsHeader: true,
      anchorWidth: "390px",
    });
  });

  test.each([
    ["no `id`", {}],
    ["`id: undefined`", { id: undefined }],
    ['`id: ""`', { id: "" }],
  ])(
    "with %s, gets a generated id, and the mobile menu opens anchored to it, as wide as it",
    async (_, props) => {
      await mountRoot()(navbar(props));
      expect(await anchored()).toEqual({
        id: expect.stringMatching(/\S/),
        findsHeader: true,
        anchorWidth: "390px",
      });
    },
  );
});

// An author can add or remove the id on a mounted Navbar. The mobile menu
// then finds the header by its new id, and the order of hooks doesn't
// change, which React would log an error for.
describe("Navbar's `<header>`, re-rendered with and without an `id`", () => {
  test.each<[string, NavbarProps[]]>([
    [
      'from `id: "site-header"` to no `id` and back',
      [{ id: "site-header" }, {}, { id: "site-header" }],
    ],
    [
      'from no `id` to `id: "site-header"` and back',
      [{}, { id: "site-header" }, {}],
    ],
  ])(
    "%s, keeps the mobile menu anchored to it at each step",
    async (_, steps) => {
      const render = mountRoot();
      const states = [];
      for (const props of steps) {
        await render(navbar(props));
        states.push(await anchored());
        await closeMenu();
      }
      // The one generated id, which the header has whenever there's no `id`
      const generated = states.find(({ id }) => id !== "site-header")!.id;
      expect(generated).toMatch(/\S/);
      expect(states).toEqual(
        steps.map((props) => ({
          id: props.id ?? generated,
          findsHeader: true,
          anchorWidth: "390px",
        })),
      );
    },
  );
});

// On the server, an empty or undefined `id` renders as no `id` does, and an
// author's id stands in for the generated one, with nothing else changed
describe("Navbar's `<header>` on the server", () => {
  const markup = (props: NavbarProps) => renderToStaticMarkup(navbar(props));

  test.each([
    ["`id: undefined`", { id: undefined }],
    ['`id: ""`', { id: "" }],
  ])("with %s, gets the generated id, as with no `id`", (_, props) => {
    expect(markup(props)).toBe(markup({}));
  });

  test('with `id: "site-header"`, renders it in place of the generated id', () => {
    const plain = markup({});
    const [, generated] = plain.match(/^<header id="([^"]+)"/) ?? [];
    expect(generated).toMatch(/\S/);
    expect(markup({ id: "site-header" })).toBe(
      plain.replaceAll(`"${generated}"`, '"site-header"'),
    );
  });
});
