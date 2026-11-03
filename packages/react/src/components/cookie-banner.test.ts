// @vitest-environment happy-dom
//
// CookieBanner is a named page region, not a dialog (ADR-0009): it renders in
// place as a `<section>` named by its title, and only its own controls close
// it. Pressing or focusing outside it doesn't, and neither does Escape. Focus
// moves only when a visitor action opens it, and when it closes with focus
// inside it. While it's shown, it pads the page so it never hides a focused
// control. happy-dom has no layout and runs no animations, so the banner's
// look, its exit animation, Tab order and the padding's size are checked in
// Chromium (packages/style/test/cookie-banner.test.mjs).
import {
  act,
  createElement,
  createRef,
  Fragment,
  useState,
  type ComponentProps,
  type MouseEvent,
  type ReactElement,
} from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { computeAccessibleName } from "dom-accessibility-api";
import { afterEach, describe, expect, test, vi } from "vitest";

import {
  CookieBanner,
  CookieBannerAction,
  CookieBannerClose,
  CookieBannerDescription,
  CookieBannerPreferences,
  CookieBannerPreferencesTrigger,
  CookieBannerTitle,
} from "./cookie-banner";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

type BannerProps = Omit<ComponentProps<typeof CookieBanner>, "children">;
type ClickHandler = (event: MouseEvent<HTMLButtonElement>) => void;

const TITLE = "This site uses cookies";

// A CookieBanner composed as the docs compose one. The default view offers
// Accept all, Reject all and Customise. The Customise view shows the
// preferences, a disabled checkbox and then the Analytics one, with Back and
// Save preferences.
function banner(
  props: BannerProps = {},
  {
    title = true,
    onAccept,
    onCustomise,
  }: {
    title?: boolean;
    onAccept?: ClickHandler;
    onCustomise?: ClickHandler;
  } = {},
) {
  return createElement(
    CookieBanner,
    props,
    title ? createElement(CookieBannerTitle, null, TITLE) : null,
    createElement(
      CookieBannerDescription,
      null,
      "We use them to improve the site. Choose which to allow.",
    ),
    createElement(
      CookieBannerPreferences,
      null,
      createElement(
        "label",
        null,
        createElement("input", {
          type: "checkbox",
          checked: true,
          disabled: true,
          readOnly: true,
        }),
        "Necessary",
      ),
      createElement(
        "label",
        null,
        createElement("input", { type: "checkbox", id: "analytics" }),
        "Analytics",
      ),
    ),
    createElement(
      CookieBannerAction,
      null,
      createElement(CookieBannerClose, { onClick: onAccept }, "Accept all"),
      createElement(CookieBannerClose, null, "Reject all"),
      // Only a handler the author passes: the trigger's props used to replace
      // its own `onClick`, so an `onClick: undefined` stopped it toggling
      createElement(
        CookieBannerPreferencesTrigger,
        onCustomise ? { onClick: onCustomise } : null,
        "Customise",
      ),
    ),
    createElement(
      CookieBannerAction,
      { preferences: true },
      createElement(CookieBannerPreferencesTrigger, null, "Back"),
      createElement(CookieBannerClose, null, "Save preferences"),
    ),
  );
}

// Clicks on the page's own button, which sits outside the banner
const outsideClicks = vi.fn();

// The page frame around `bannerElement`: the banner first, then SkipLink, then
// the content, whose "Cookie settings" button calls `onSettings`
const page = (bannerElement: ReactElement, onSettings?: () => void) =>
  createElement(
    Fragment,
    null,
    bannerElement,
    createElement("a", { href: "#main", id: "skip" }, "Skip to main content"),
    createElement(
      "main",
      { id: "main" },
      createElement(
        "button",
        { id: "outside", onClick: outsideClicks },
        "Read more",
      ),
      createElement(
        "button",
        { id: "settings", onClick: onSettings },
        "Cookie settings",
      ),
    ),
  );

// The page with the banner's open state held by the page, as an app holds
// it. The banner starts `initialOpen`, and "Cookie settings" opens it.
function BannerPage({
  initialOpen = true,
  onOpenChange,
  onAccept,
}: {
  initialOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onAccept?: ClickHandler;
}) {
  const [open, setOpen] = useState(initialOpen);
  return page(
    banner(
      {
        open,
        onOpenChange: (next) => {
          onOpenChange?.(next);
          setOpen(next);
        },
      },
      { onAccept },
    ),
    () => setOpen(true),
  );
}

const unmounts: (() => Promise<void>)[] = [];

// Mounts `element` in a container on the page, as an app would
async function mount(element: ReactElement) {
  const container = document.body.appendChild(document.createElement("div"));
  const root = createRoot(container);
  unmounts.push(async () => {
    await act(async () => root.unmount());
    container.remove();
  });
  await act(async () => root.render(element));
  return {
    rerender: (next: ReactElement) => act(async () => root.render(next)),
  };
}

// Unmounts every mounted page, the last first
async function unmountAll() {
  while (unmounts.length) await unmounts.pop()!();
}

// The inline styles of `<html>` and `<body>`, where the banner pads the page
const html = () => document.documentElement.style;
const body = () => document.body.style;

afterEach(async () => {
  await unmountAll();
  vi.restoreAllMocks();
  outsideClicks.mockClear();
  Reflect.deleteProperty(navigator, "userActivation");
  document.documentElement.removeAttribute("style");
  document.body.removeAttribute("style");
  document.body.innerHTML = "";
});

// The banner's region
const region = () => document.querySelector("section");
// Whether the banner is shown: its title is on the page
const isOpen = () =>
  [...document.querySelectorAll("h2")].some(
    (heading) => heading.textContent === TITLE,
  );
// Whether the Customise view is showing: its preferences are on the page
const showsCustomise = () => document.getElementById("analytics") !== null;
const byId = (id: string) => document.getElementById(id)!;
// The one button named `name`
function button(name: string) {
  const matches = [...document.querySelectorAll("button")].filter(
    (element) => computeAccessibleName(element) === name,
  );
  expect(matches).toHaveLength(1);
  return matches[0]!;
}

const click = (element: HTMLElement) => act(async () => element.click());
const focus = (element: HTMLElement) => act(async () => element.focus());

// One zero-delay timer. The Radix dialog CookieBanner used to be started
// listening for presses outside it on one, so waiting for it makes sure a
// press outside is one that would have closed the dialog.
const tick = () => act(() => new Promise((resolve) => setTimeout(resolve, 0)));

// Presses `element` with the primary mouse button, dispatching what a click
// dispatches, and returns the events
async function press(element: Element) {
  const init = { bubbles: true, cancelable: true, button: 0 };
  const events = [
    new PointerEvent("pointerdown", init),
    new MouseEvent("mousedown", init),
    new PointerEvent("pointerup", init),
    new MouseEvent("mouseup", init),
    new MouseEvent("click", init),
  ];
  await act(async () => {
    for (const event of events) element.dispatchEvent(event);
  });
  return events;
}

// Presses Escape with focus on `element`, and returns the keydown
async function escape(element: Element) {
  const event = new KeyboardEvent("keydown", {
    key: "Escape",
    bubbles: true,
    cancelable: true,
  });
  await act(async () => element.dispatchEvent(event));
  return event;
}

// What the browser reports of a visitor action: `isActive` is true just after
// a click or key press. happy-dom has no `navigator.userActivation`.
function userActivation(isActive: boolean) {
  Object.defineProperty(navigator, "userActivation", {
    configurable: true,
    value: { isActive, hasBeenActive: isActive },
  });
}

describe("what it renders", () => {
  test("an open banner is a section named by its title, with no `aria-describedby`", async () => {
    await mount(page(banner({ defaultOpen: true })));
    const section = region();
    expect(section).not.toBeNull();
    expect(computeAccessibleName(section!)).toBe(TITLE);
    expect(section!.hasAttribute("aria-describedby")).toBe(false);
  });

  test("it isn't a dialog: no dialog role, no `aria-modal` and no focus guards", async () => {
    await mount(page(banner({ defaultOpen: true })));
    expect(region()).not.toBeNull();
    expect(
      document.querySelectorAll(
        '[role="dialog"], [role="alertdialog"], [aria-modal], [data-radix-focus-guard]',
      ),
    ).toHaveLength(0);
  });

  test("the rest of the page stays readable and clickable: no `aria-hidden`, `pointer-events` or scroll lock", async () => {
    const header = document.body.appendChild(document.createElement("header"));
    await mount(page(banner({ defaultOpen: true })));
    expect(region()).not.toBeNull();
    expect(header.hasAttribute("aria-hidden")).toBe(false);
    expect(
      [...document.body.children].filter((child) =>
        child.hasAttribute("aria-hidden"),
      ),
    ).toEqual([]);
    expect(document.body.style.pointerEvents).toBe("");
    expect(document.body.hasAttribute("data-scroll-locked")).toBe(false);
  });

  test("with no CookieBannerTitle and no name from the author, the section has no accessible name", async () => {
    await mount(page(banner({ defaultOpen: true }, { title: false })));
    const section = region();
    expect(section).not.toBeNull();
    expect(computeAccessibleName(section!)).toBe("");
    expect(section!.hasAttribute("aria-labelledby")).toBe(false);
  });

  test("an author's `aria-label` names the section", async () => {
    await mount(page(banner({ defaultOpen: true, "aria-label": "Kuki" })));
    expect(computeAccessibleName(region()!)).toBe("Kuki");
  });

  test("it renders in place, where the author puts it, before what follows it", async () => {
    await mount(page(banner({ defaultOpen: true })));
    const section = region();
    expect(section).not.toBeNull();
    expect(section!.nextElementSibling).toBe(byId("skip"));
  });

  test("its ref is the section", async () => {
    const ref = createRef<HTMLElement>();
    await mount(page(banner({ defaultOpen: true, ref })));
    expect(ref.current).not.toBeNull();
    expect(ref.current).toBe(region());
  });
});

describe("its own props stay out of the DOM", () => {
  // React warns about an unknown prop only the first time it meets its name,
  // so this checks the attributes as well as the warnings
  test("no element gets `open`, `modal`, `defaultOpen`, `onOpenChange` or `closeLabel`, and React warns of none", async () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const names = [
      "open",
      "modal",
      "defaultOpen",
      "onOpenChange",
      "closeLabel",
    ];
    await mount(
      page(
        banner({
          open: true,
          onOpenChange: () => {},
          modal: false,
          closeLabel: "Tutup",
        }),
      ),
    );
    await mount(page(banner({ defaultOpen: true, modal: true })));
    expect(document.querySelectorAll("section")).toHaveLength(2);
    expect(
      document.querySelectorAll(
        "[open], [modal], [defaultopen], [onopenchange], [closelabel]",
      ),
    ).toHaveLength(0);
    const warnings = errors.mock.calls.filter((args) =>
      names.some(
        (name) =>
          args.slice(1).some((arg) => arg === name) ||
          String(args[0]).includes(`\`${name}\``),
      ),
    );
    expect(warnings).toEqual([]);
  });
});

describe("what doesn't close it", () => {
  test("a press outside it: the banner stays open and the press reaches its target", async () => {
    const onOpenChange = vi.fn();
    await mount(createElement(BannerPage, { onOpenChange }));
    await tick();
    const events = await press(byId("outside"));
    expect(isOpen()).toBe(true);
    expect(region()?.dataset.state).toBe("open");
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(outsideClicks).toHaveBeenCalledTimes(1);
    expect(events.filter((event) => event.defaultPrevented)).toEqual([]);
  });

  test("focus moving outside it: the banner stays open and focus stays outside", async () => {
    const onOpenChange = vi.fn();
    await mount(createElement(BannerPage, { onOpenChange }));
    await tick();
    await focus(button("Accept all"));
    await focus(byId("outside"));
    await tick();
    expect(isOpen()).toBe(true);
    expect(region()).not.toBeNull();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(byId("outside"));
  });

  test("Escape pressed inside it", async () => {
    const onOpenChange = vi.fn();
    await mount(createElement(BannerPage, { onOpenChange }));
    await focus(button("Accept all"));
    const event = await escape(button("Accept all"));
    expect(isOpen()).toBe(true);
    expect(region()).not.toBeNull();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });

  test("Escape pressed outside it", async () => {
    const onOpenChange = vi.fn();
    await mount(createElement(BannerPage, { onOpenChange }));
    await tick();
    await focus(byId("outside"));
    const event = await escape(byId("outside"));
    expect(isOpen()).toBe(true);
    expect(region()).not.toBeNull();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  });
});

describe("the view while it's open", () => {
  test("with the Customise view showing, a press outside, focus moving outside and Escape each leave it showing", async () => {
    await mount(createElement(BannerPage));
    await tick();
    await click(button("Customise"));
    expect(showsCustomise()).toBe(true);
    await press(byId("outside"));
    expect(region()).not.toBeNull();
    expect(showsCustomise()).toBe(true);
    await focus(byId("outside"));
    expect(showsCustomise()).toBe(true);
    await escape(byId("outside"));
    expect(showsCustomise()).toBe(true);
    await escape(byId("analytics"));
    expect(showsCustomise()).toBe(true);
  });
});

describe("what closes it", () => {
  test("a CookieBannerClose: its `onClick` runs, then `onOpenChange(false)` is called once", async () => {
    const calls: string[] = [];
    await mount(
      createElement(BannerPage, {
        onOpenChange: (open) => calls.push(`onOpenChange(${open})`),
        onAccept: () => calls.push("onClick"),
      }),
    );
    await click(button("Accept all"));
    expect(calls).toEqual(["onClick", "onOpenChange(false)"]);
    expect(isOpen()).toBe(false);
  });

  test("a CookieBannerClose whose `onClick` calls `preventDefault()` leaves the banner open", async () => {
    const onOpenChange = vi.fn();
    await mount(
      createElement(BannerPage, {
        onOpenChange,
        onAccept: (event) => event.preventDefault(),
      }),
    );
    await click(button("Accept all"));
    expect(isOpen()).toBe(true);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  test("the close cross, which `closeLabel` names", async () => {
    const onOpenChange = vi.fn();
    await mount(
      page(banner({ defaultOpen: true, closeLabel: "Tutup", onOpenChange })),
    );
    await click(button("Tutup"));
    expect(isOpen()).toBe(false);
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false);
  });
});

describe("the Customise view", () => {
  test("Customise shows it and focuses the first control in CookieBannerPreferences, not the close cross", async () => {
    await mount(page(banner({ defaultOpen: true })));
    await focus(button("Customise"));
    await click(button("Customise"));
    expect(showsCustomise()).toBe(true);
    expect(document.activeElement).toBe(byId("analytics"));
  });

  test("Back returns to the default view and focuses Customise", async () => {
    await mount(page(banner({ defaultOpen: true })));
    await focus(button("Customise"));
    await click(button("Customise"));
    await focus(button("Back"));
    await click(button("Back"));
    expect(showsCustomise()).toBe(false);
    expect(document.activeElement).toBe(button("Customise"));
  });

  test("after a CookieBannerClose closes the banner, the next opening shows the default view", async () => {
    await mount(createElement(BannerPage));
    await click(button("Customise"));
    await click(button("Save preferences"));
    expect(isOpen()).toBe(false);
    await click(byId("settings"));
    expect(isOpen()).toBe(true);
    expect(showsCustomise()).toBe(false);
  });

  test("after the close cross closes the banner, the next opening shows the default view", async () => {
    await mount(createElement(BannerPage));
    await click(button("Customise"));
    await click(button("Close"));
    expect(isOpen()).toBe(false);
    await click(byId("settings"));
    expect(isOpen()).toBe(true);
    expect(showsCustomise()).toBe(false);
  });

  test("after `open` is set to false, the next opening shows the default view", async () => {
    const { rerender } = await mount(page(banner({ open: true })));
    await click(button("Customise"));
    expect(showsCustomise()).toBe(true);
    await rerender(page(banner({ open: false })));
    expect(isOpen()).toBe(false);
    await rerender(page(banner({ open: true })));
    expect(isOpen()).toBe(true);
    expect(showsCustomise()).toBe(false);
  });

  test("a CookieBannerPreferencesTrigger runs its `onClick`, then toggles the view unless that called `preventDefault()`", async () => {
    const onCustomise = vi.fn();
    const { rerender } = await mount(
      page(banner({ defaultOpen: true }, { onCustomise })),
    );
    await click(button("Customise"));
    expect(onCustomise).toHaveBeenCalledTimes(1);
    expect(showsCustomise()).toBe(true);

    const prevented = vi.fn((event: MouseEvent) => event.preventDefault());
    await rerender(page(banner({ open: false })));
    await rerender(page(banner({ open: true }, { onCustomise: prevented })));
    expect(showsCustomise()).toBe(false);
    await click(button("Customise"));
    expect(prevented).toHaveBeenCalledTimes(1);
    expect(showsCustomise()).toBe(false);
  });
});

describe("focus on open", () => {
  test("opening at mount with no visitor action leaves focus on `<body>`", async () => {
    userActivation(false);
    await mount(page(banner({ defaultOpen: true })));
    await tick();
    expect(region()).not.toBeNull();
    expect(document.activeElement).toBe(document.body);
  });

  test("opening at mount with no visitor action leaves focus on an autofocused field", async () => {
    userActivation(false);
    const field = document.body.appendChild(document.createElement("input"));
    field.focus();
    await mount(page(banner({ defaultOpen: true })));
    await tick();
    expect(region()).not.toBeNull();
    expect(document.activeElement).toBe(field);
  });

  test("opening from a button click focuses the section, and closing returns focus to the button", async () => {
    await mount(createElement(BannerPage, { initialOpen: false }));
    const settings = byId("settings");
    await focus(settings);
    userActivation(true);
    await click(settings);
    const section = region();
    expect(section).not.toBeNull();
    expect(section!.getAttribute("tabindex")).toBe("-1");
    expect(document.activeElement).toBe(section);
    await click(button("Accept all"));
    expect(isOpen()).toBe(false);
    expect(document.activeElement).toBe(settings);
  });
});

describe("focus on close", () => {
  test("closing from inside, with no remembered element, moves focus to the first focusable element after the banner", async () => {
    await mount(page(banner({ defaultOpen: true })));
    await focus(button("Accept all"));
    await click(button("Accept all"));
    expect(isOpen()).toBe(false);
    expect(document.activeElement).toBe(byId("skip"));
  });

  test("setting `open` to false with focus outside the banner leaves focus there", async () => {
    const { rerender } = await mount(page(banner({ open: true })));
    await tick();
    await focus(byId("outside"));
    await rerender(page(banner({ open: false })));
    expect(isOpen()).toBe(false);
    expect(document.activeElement).toBe(byId("outside"));
  });
});

describe("server rendering", () => {
  test("an open banner renders no markup", () => {
    expect(renderToStaticMarkup(banner({ open: true }))).toBe("");
  });
});

describe("the page padding that keeps a focused control in view", () => {
  // happy-dom has no layout and its ResizeObserver never calls back, so this
  // checks only that the values are set, not their size
  test("while the banner is open, `<html>`'s `scroll-padding-bottom` and `<body>`'s `padding-bottom` are set, and closing removes them", async () => {
    const { rerender } = await mount(page(banner({ open: true })));
    expect(html().getPropertyValue("scroll-padding-bottom")).not.toBe("");
    expect(body().getPropertyValue("padding-bottom")).not.toBe("");
    await rerender(page(banner({ open: false })));
    expect(html().getPropertyValue("scroll-padding-bottom")).toBe("");
    expect(body().getPropertyValue("padding-bottom")).toBe("");
  });

  test("closing restores inline values the author set", async () => {
    html().setProperty("scroll-padding-bottom", "5px");
    body().setProperty("padding-bottom", "8px");
    const { rerender } = await mount(page(banner({ open: true })));
    // The banner sets its own, which in happy-dom measure 0px
    expect(html().getPropertyValue("scroll-padding-bottom")).not.toBe("5px");
    expect(body().getPropertyValue("padding-bottom")).not.toBe("8px");
    await rerender(page(banner({ open: false })));
    expect(html().getPropertyValue("scroll-padding-bottom")).toBe("5px");
    expect(body().getPropertyValue("padding-bottom")).toBe("8px");
  });

  test("with two banners shown, the page stays padded until both close, in either order, then goes back to the author's values", async () => {
    body().setProperty("padding-bottom", "8px");
    for (const order of [
      ["first", "second"],
      ["second", "first"],
    ]) {
      const banners = {
        first: await mount(page(banner({ open: true }))),
        second: await mount(page(banner({ open: true }))),
      };
      for (const [index, name] of order.entries()) {
        await banners[name as keyof typeof banners].rerender(
          page(banner({ open: false })),
        );
        if (index === 0)
          expect(html().getPropertyValue("scroll-padding-bottom")).not.toBe("");
      }
      expect(html().getPropertyValue("scroll-padding-bottom")).toBe("");
      expect(body().getPropertyValue("padding-bottom")).toBe("8px");
      await unmountAll();
    }
  });

  test("unmounting an open banner removes them", async () => {
    await mount(page(banner({ open: true })));
    expect(html().getPropertyValue("scroll-padding-bottom")).not.toBe("");
    await unmountAll();
    expect(html().getPropertyValue("scroll-padding-bottom")).toBe("");
    expect(body().getPropertyValue("padding-bottom")).toBe("");
  });
});
