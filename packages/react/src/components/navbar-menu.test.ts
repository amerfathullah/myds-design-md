// @vitest-environment happy-dom
//
// NavbarMenu renders its children once: in the menu bar's list while the
// mobile menu is closed, and in the mobile menu while it's open. An author's
// id on a child is on one element, a ref on a child holds the element that's
// mounted, and an effect in a child runs for one copy (#214).
import {
  act,
  createElement,
  createRef,
  useEffect,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { createRoot } from "react-dom/client";
import type { Window as HappyWindow } from "happy-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
  Navbar,
  NavbarAction,
  NavbarMenu,
  NavbarMenuDropdown,
  NavbarMenuItem,
} from "./navbar";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const unmounts: (() => Promise<void>)[] = [];

// Mounts `element` in a container on the page, as an app would, and returns
// the container. The mobile menu portals into `<body>`, outside it.
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

// Resizes happy-dom's window to `width`, which fires the `change` event of
// each media query it takes into or out of matching
const resize = (width: number) =>
  act(async () =>
    (window as unknown as HappyWindow).happyDOM.setViewport({ width }),
  );

// happy-dom's window size, which is below `xl:` (1280px)
const defaultWidth = 1024;

// No test logs an error or a warning, and nothing is left on the page. The
// window is back to its default size.
afterEach(async () => {
  while (unmounts.length) await unmounts.pop()!();
  await resize(defaultWidth);
  const logged = [
    ...vi.mocked(console.error).mock.calls,
    ...vi.mocked(console.warn).mock.calls,
  ];
  vi.restoreAllMocks();
  expect(logged).toEqual([]);
  expect(document.body.innerHTML).toBe("");
});

// How many copies of a `Counted` child are mounted
let mounted = 0;

// A menu child with an effect, which counts its mounted copies
function Counted() {
  useEffect(() => {
    mounted++;
    return () => void mounted--;
  }, []);
  return createElement("li", { className: "list-none" }, "Counted");
}

beforeEach(() => {
  mounted = 0;
});

// A Navbar whose menu holds an item with the author's id `item-a` and `ref`,
// a second item, a `Counted` child and then `more`, and its toggle. Returns
// the toggle, the one button outside the menu's `<nav>`.
async function navbar(ref: Ref<HTMLLIElement>, more: ReactNode = null) {
  const page = await mount(
    createElement(
      Navbar,
      null,
      createElement(
        NavbarMenu,
        null,
        createElement(NavbarMenuItem, {
          id: "item-a",
          ref,
          href: "#perkhidmatan",
          children: "Perkhidmatan",
        }),
        createElement(NavbarMenuItem, {
          href: "#hubungi",
          children: "Hubungi",
        }),
        createElement(Counted),
        more,
      ),
      createElement(NavbarAction),
    ),
  );
  const [toggle, ...others] = [...page.querySelectorAll("button")].filter(
    (button) => !button.closest("nav"),
  );
  expect(others).toEqual([]);
  return toggle!;
}

const press = (button: HTMLButtonElement) => act(async () => button.click());

// The mobile menu's panel, which is on the page only while the menu is open
const panel = () => document.querySelector<HTMLElement>('[role="dialog"]');

// Where the element is: "desktop" in the `<nav>`'s list, "mobile" in the
// mobile menu's panel
function where(element: Element | null) {
  if (!element) return null;
  if (element.closest("nav")) return "desktop";
  if (panel()?.contains(element)) return "mobile";
  return "elsewhere";
}

// The elements with the author's id, where each is, and how many copies of
// `Counted` are mounted
const copies = () => ({
  items: [...document.querySelectorAll("#item-a")].map(where),
  mounted,
});

// Where the element `ref` holds is, and whether it's the one with the
// author's id
const refState = (ref: { current: Element | null }) => ({
  ref: where(ref.current),
  refIsItem: ref.current === document.getElementById("item-a"),
});

// Presses Escape where focus is, in the open mobile menu
const pressEscape = () =>
  act(
    async () =>
      void (document.activeElement ?? document.body).dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Escape",
          bubbles: true,
          cancelable: true,
        }),
      ),
  );

// The ways a test closes the open mobile menu
const closings = [
  ["the toggle", press],
  ["Escape", () => pressEscape()],
] as const;

describe("NavbarMenu's children", () => {
  test.each(closings)(
    "are mounted once, and a ref holds the one with the author's id, closed, open and after %s closes the menu",
    async (_, close) => {
      const ref = createRef<HTMLLIElement>();
      const toggle = await navbar(ref);
      const closed = { ...copies(), ...refState(ref) };
      await press(toggle);
      const open = { ...copies(), ...refState(ref) };
      await close(toggle);
      const reclosed = { ...copies(), ...refState(ref) };
      expect([closed, open, reclosed]).toEqual([
        { items: ["desktop"], mounted: 1, ref: "desktop", refIsItem: true },
        { items: ["mobile"], mounted: 1, ref: "mobile", refIsItem: true },
        { items: ["desktop"], mounted: 1, ref: "desktop", refIsItem: true },
      ]);
      expect(toggle.getAttribute("aria-expanded")).toBe("false");
    },
  );

  test("call a callback ref with the desktop element last, once the menu closes", async () => {
    const calls: (string | null)[] = [];
    const toggle = await navbar((element) => void calls.push(where(element)));
    await press(toggle);
    await press(toggle);
    expect(calls).toEqual(["desktop", null, "mobile", null, "desktop"]);
  });

  // A dropdown's trigger, "Lagi", opens it, and its `aria-controls` names
  // its panel, in the mobile menu while it's open and in the desktop list
  // once it closes
  test("keep a dropdown working, in the mobile menu and then in the desktop list", async () => {
    const toggle = await navbar(
      createRef(),
      createElement(NavbarMenuDropdown, {
        title: "Lagi",
        children: createElement(NavbarMenuItem, {
          href: "#soalan",
          children: "Soalan lazim",
        }),
      }),
    );
    // Opens the dropdown from its one trigger, and returns what the trigger
    // says, where the panel it names is, and where each of the dropdown's
    // links is, "elsewhere" when it's outside that panel
    const openDropdown = async () => {
      const [trigger, ...others] = [
        ...document.querySelectorAll("button"),
      ].filter((button) => button.textContent === "Lagi");
      expect(others).toEqual([]);
      await act(async () => trigger!.click());
      const content = document.getElementById(
        trigger!.getAttribute("aria-controls") ?? "",
      );
      return {
        expanded: trigger!.getAttribute("aria-expanded"),
        content: where(content),
        links: [...document.querySelectorAll('a[href="#soalan"]')].map(
          (link) => (content?.contains(link) ? where(link) : "elsewhere"),
        ),
      };
    };
    await press(toggle);
    const mobile = await openDropdown();
    await pressEscape();
    await pressEscape();
    const desktop = await openDropdown();
    expect({ mobile, desktop }).toEqual({
      mobile: { expanded: "true", content: "mobile", links: ["mobile"] },
      desktop: { expanded: "true", content: "desktop", links: ["desktop"] },
    });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
  });
});

// Presses `element` with a pointer of type `pointerType`, as a click or a tap
// does: a pointerdown, then a click. A tick first lets an open dropdown start
// listening for presses outside it.
async function pointerPress(element: HTMLElement, pointerType: string) {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    element.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        cancelable: true,
        pointerType,
      }),
    );
    element.click();
  });
}

// A press on an open dropdown's trigger closes it again. Radix tells a press
// on the trigger from one outside the dropdown by the items the menu bar's
// list tracks, so the list stays mounted while the mobile menu is open.
describe("A dropdown in the mobile menu", () => {
  test.each(["mouse", "touch"])(
    "opens on a %s press on its trigger, and closes on the next",
    async (pointerType) => {
      const toggle = await navbar(
        createRef(),
        createElement(NavbarMenuDropdown, {
          title: "Lagi",
          children: createElement(NavbarMenuItem, {
            href: "#soalan",
            children: "Soalan lazim",
          }),
        }),
      );
      await press(toggle);
      const [trigger, ...others] = [...panel()!.querySelectorAll("button")];
      expect(others).toEqual([]);
      expect(trigger!.textContent).toBe("Lagi");
      const expanded = [trigger!.getAttribute("aria-expanded")];
      for (let pressed = 0; pressed < 3; pressed++) {
        await pointerPress(trigger!, pointerType);
        expanded.push(trigger!.getAttribute("aria-expanded"));
      }
      expect(expanded).toEqual(["false", "true", "false", "true"]);
      expect(toggle.getAttribute("aria-expanded")).toBe("true");
    },
  );
});

// What the page shows of the menu: whether the mobile menu's panel is open,
// where the item with the author's id is, whether `<body>` scrolls, and what
// the toggle says
const menuState = (toggle: HTMLButtonElement) => ({
  panel: panel() !== null,
  items: copies().items,
  overflow: getComputedStyle(document.body).overflow,
  expanded: toggle.getAttribute("aria-expanded"),
});

// Below `xl:` the toggle shows and the mobile menu opens; from `xl:` up the
// desktop list shows instead, so the mobile menu closes
describe("The mobile menu", () => {
  test.each([1024, 1279])("stays open at %ipx, below xl:", async (width) => {
    const toggle = await navbar(createRef());
    await press(toggle);
    await resize(width);
    expect(menuState(toggle)).toMatchObject({
      panel: true,
      items: ["mobile"],
      overflow: "hidden",
      expanded: "true",
    });
  });

  test.each([1280, 1440])(
    "closes when the window widens to %ipx, showing the desktop list and letting the page scroll again",
    async (width) => {
      const toggle = await navbar(createRef());
      const closed = menuState(toggle);
      await press(toggle);
      const open = menuState(toggle);
      await resize(width);
      const widened = menuState(toggle);
      expect(closed).toMatchObject({
        panel: false,
        items: ["desktop"],
        expanded: "false",
      });
      expect(closed.overflow).not.toBe("hidden");
      expect(open).toEqual({
        panel: true,
        items: ["mobile"],
        overflow: "hidden",
        expanded: "true",
      });
      expect(widened).toEqual(closed);
    },
  );

  // The toggle hides from `xl:` up, but an author's class can show it there
  test("opened while the window is already 1440px wide, closes at once", async () => {
    await resize(1440);
    const toggle = await navbar(createRef());
    const closed = menuState(toggle);
    await press(toggle);
    expect(menuState(toggle)).toEqual(closed);
    expect(closed).toMatchObject({ panel: false, items: ["desktop"] });
  });

  // A test environment can have no `matchMedia`, or one that stands in for
  // it without the media query lists' `addEventListener`. The menu then
  // stays open, and opening it throws nothing: a throw there would unmount
  // the Navbar.
  describe.each([
    ["no `matchMedia`, as in jsdom", undefined],
    [
      "a `matchMedia` whose lists have only `addListener`, as an older polyfill gives",
      (media: string) => ({
        media,
        matches: false,
        addListener() {},
        removeListener() {},
      }),
    ],
    ["a `matchMedia` mock that returns nothing", () => undefined],
  ])("where the window has %s", (_, standIn) => {
    beforeEach(() => {
      vi.stubGlobal("matchMedia", standIn);
    });
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    test.each(closings)(
      "opens, and closes with %s, rendering the children once",
      async (_, close) => {
        expect(window.matchMedia).toBe(standIn);
        const ref = createRef<HTMLLIElement>();
        const toggle = await navbar(ref);
        await press(toggle);
        const open = { ...menuState(toggle), ...refState(ref) };
        await close(toggle);
        const { overflow, ...closed } = {
          ...menuState(toggle),
          ...refState(ref),
        };
        expect({ open, closed }).toEqual({
          open: {
            panel: true,
            items: ["mobile"],
            overflow: "hidden",
            expanded: "true",
            ref: "mobile",
            refIsItem: true,
          },
          closed: {
            panel: false,
            items: ["desktop"],
            expanded: "false",
            ref: "desktop",
            refIsItem: true,
          },
        });
        expect(overflow).not.toBe("hidden");
        expect(mounted).toBe(1);
      },
    );
  });
});
