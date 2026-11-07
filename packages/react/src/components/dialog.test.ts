// @vitest-environment happy-dom
import { act, createElement, type ComponentProps } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { Button } from "./button";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

type RootProps = Omit<ComponentProps<typeof Dialog>, "children">;
type BodyProps = Omit<ComponentProps<typeof DialogBody>, "children">;
type CloseProps = Omit<ComponentProps<typeof DialogClose>, "children">;
type CancelProps = Omit<ComponentProps<typeof Button>, "children">;

interface Parts {
  root?: RootProps;
  body?: BodyProps;
  close?: CloseProps;
  /** Props of the Cancel button, DialogClose's child */
  cancel?: CancelProps;
}

// A Dialog that mounts open and leaves its `open` to Radix, composed as the
// docs compose one, with a title, which Radix requires, a description, and a
// DialogClose around a Cancel button. A paragraph beside it is what a press
// outside the dialog lands on.
const opened = ({ root, body, close, cancel }: Parts = {}) =>
  createElement(
    "div",
    null,
    createElement("p", null, "Outside"),
    createElement(
      Dialog,
      { defaultOpen: true, ...root },
      createElement(
        DialogBody,
        body,
        createElement(
          DialogHeader,
          null,
          createElement(DialogTitle, null, "Save the draft?"),
          createElement(DialogDescription, null, "You can edit it later."),
        ),
        createElement(
          DialogFooter,
          null,
          createElement(
            DialogClose,
            close,
            createElement(
              Button,
              { variant: "default-outline", ...cancel },
              "Cancel",
            ),
          ),
        ),
      ),
    ),
  );

const unmounts: (() => Promise<void>)[] = [];

// Waits for what Radix does on a timer, such as listening for presses
// outside the dialog once it opens
const settle = () =>
  act(() => new Promise((resolve) => setTimeout(resolve, 20)));

// Mounts `element` in a container on the page, as an app would. The dialog's
// content portals into `<body>`, outside the container.
async function mount(element: ReturnType<typeof opened>) {
  const container = document.body.appendChild(document.createElement("div"));
  const root = createRoot(container);
  unmounts.push(async () => {
    await act(async () => root.unmount());
    container.remove();
  });
  await act(async () => root.render(element));
  await settle();
  expect(dialog()).not.toBeNull();
}

const dialog = () => document.querySelector('[role="dialog"]');

const buttonNamed = (name: string) =>
  [...document.querySelectorAll("button")].find(
    (button) => button.textContent === name,
  )!;

// DialogBody's built-in close button: the one with the cross
const cross = () =>
  dialog()!.querySelector('[id="Icon/cross"]')!.closest("button")!;

// Presses a mouse button on the paragraph outside the dialog, dispatching
// the events a browser does, and returns the `pointerdown`. Radix waits for
// the `click` of a primary press before it handles it; it handles a
// secondary press, which has no `click`, on its `pointerdown`.
async function pressOutside(button: 0 | 2 = 0) {
  const outside = [...document.querySelectorAll("p")].find(
    (p) => p.textContent === "Outside",
  )!;
  const init = {
    bubbles: true,
    cancelable: true,
    button,
    pointerType: "mouse",
  };
  const pointerdown = new PointerEvent("pointerdown", init);
  const events = [
    pointerdown,
    new MouseEvent("mousedown", init),
    new PointerEvent("pointerup", init),
    new MouseEvent("mouseup", init),
    new MouseEvent(button === 0 ? "click" : "contextmenu", init),
  ];
  await act(async () => {
    for (const event of events) outside.dispatchEvent(event);
  });
  return pointerdown;
}

// Clicks `element` with the primary mouse button, as a browser does: with a
// cancelable `click`
async function click(element: Element) {
  await act(
    async () =>
      void element.dispatchEvent(
        new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }),
      ),
  );
}

// Presses Escape where focus is, in the open dialog
async function pressEscape() {
  await act(
    async () =>
      void (document.activeElement ?? document.body).dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Escape",
          bubbles: true,
          cancelable: true,
        }),
      ),
  );
}

// The handlers each test passes, which record their calls in `calls`, in
// order
let calls: string[];
const record =
  (name: string, preventDefault = false) =>
  (event?: { preventDefault(): void }) => {
    calls.push(name);
    if (preventDefault) event!.preventDefault();
  };
const onOpenChange = (open: boolean) => calls.push(`onOpenChange(${open})`);
const onDismiss = () => calls.push("onDismiss");

beforeEach(() => {
  calls = [];
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

// No test logs an error or a warning
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

/*========================================================================================================================*/

// What a consumer can pass that leaves an outside press to DialogBody: a
// handler that doesn't call `preventDefault()`, `undefined`, or nothing
const passive = [
  ["an `onInteractOutside` that does nothing", { onInteractOutside: () => {} }],
  ["`onInteractOutside={undefined}`", { onInteractOutside: undefined }],
  ["no `onInteractOutside`", {}],
] satisfies [string, BodyProps][];

describe("a DialogBody with `dismissible={false}`", () => {
  test.each(passive)(
    "stays open after a press outside, with %s",
    async (_, handler) => {
      await mount(
        opened({
          root: { onOpenChange },
          body: { dismissible: false, onDismiss, ...handler },
        }),
      );

      await pressOutside();

      expect(calls).toEqual([]);
      expect(dialog()).not.toBeNull();
    },
  );

  test("calls its `onInteractOutside` once, with Radix's cancelable event for the `pointerdown`", async () => {
    const events: Event[] = [];
    await mount(
      opened({
        root: { onOpenChange },
        body: {
          dismissible: false,
          onDismiss,
          onInteractOutside: (event) => void events.push(event),
        },
      }),
    );

    const pointerdown = await pressOutside();

    expect(events).toHaveLength(1);
    const event = events[0] as CustomEvent<{ originalEvent: PointerEvent }>;
    expect(event).toBeInstanceOf(CustomEvent);
    expect(event.cancelable).toBe(true);
    expect(event.detail.originalEvent).toBe(pointerdown);
    expect(calls).toEqual([]);
    expect(dialog()).not.toBeNull();
  });
});

describe("a dismissible DialogBody with `onDismiss`", () => {
  test("a press outside calls its `onInteractOutside`, then `onDismiss`, once each, and closes", async () => {
    await mount(
      opened({
        root: { onOpenChange },
        body: { onDismiss, onInteractOutside: record("onInteractOutside") },
      }),
    );

    await pressOutside();

    expect(calls).toEqual([
      "onInteractOutside",
      "onDismiss",
      "onOpenChange(false)",
    ]);
    expect(dialog()).toBeNull();
  });

  test.each(passive)(
    "a press outside calls `onDismiss` once and closes, with %s",
    async (_, handler) => {
      await mount(
        opened({ root: { onOpenChange }, body: { onDismiss, ...handler } }),
      );

      await pressOutside();

      expect(calls).toEqual(["onDismiss", "onOpenChange(false)"]);
      expect(dialog()).toBeNull();
    },
  );

  test("stays open, without calling `onDismiss`, after a press outside whose `onInteractOutside` calls `preventDefault()`", async () => {
    await mount(
      opened({
        root: { onOpenChange },
        body: {
          onDismiss,
          onInteractOutside: record("onInteractOutside", true),
        },
      }),
    );

    await pressOutside();

    expect(calls).toEqual(["onInteractOutside"]);
    expect(dialog()).not.toBeNull();
  });

  test("stays open, without calling `onDismiss`, after a right-click outside", async () => {
    await mount(opened({ root: { onOpenChange }, body: { onDismiss } }));

    await pressOutside(2);

    expect(calls).toEqual([]);
    expect(dialog()).not.toBeNull();
  });

  test("stays open, without calling `onDismiss`, after a press outside whose `onPointerDownOutside` calls `preventDefault()`", async () => {
    await mount(
      opened({
        root: { onOpenChange },
        body: {
          onDismiss,
          onPointerDownOutside: record("onPointerDownOutside", true),
        },
      }),
    );

    await pressOutside();

    expect(calls).toEqual(["onPointerDownOutside"]);
    expect(dialog()).not.toBeNull();
  });
});

describe("in a dismissible DialogBody with `onDismiss`, clicking the child of a DialogClose", () => {
  test("calls DialogClose's `onClick`, then `onDismiss`, once each, and closes", async () => {
    await mount(
      opened({
        root: { onOpenChange },
        body: { onDismiss },
        close: { onClick: record("DialogClose onClick") },
      }),
    );

    await click(buttonNamed("Cancel"));

    expect(calls).toEqual([
      "DialogClose onClick",
      "onDismiss",
      "onOpenChange(false)",
    ]);
    expect(dialog()).toBeNull();
  });

  test("leaves it open, without calling `onDismiss`, when DialogClose's `onClick` calls `preventDefault()`", async () => {
    await mount(
      opened({
        root: { onOpenChange },
        body: { onDismiss },
        close: { onClick: record("DialogClose onClick", true) },
      }),
    );

    await click(buttonNamed("Cancel"));

    expect(calls).toEqual(["DialogClose onClick"]);
    expect(dialog()).not.toBeNull();
  });

  test("runs the child's own `onClick` before DialogClose's", async () => {
    await mount(
      opened({
        root: { onOpenChange },
        body: { onDismiss },
        close: { onClick: record("DialogClose onClick") },
        cancel: { onClick: record("Cancel onClick") },
      }),
    );

    await click(buttonNamed("Cancel"));

    expect(calls).toEqual([
      "Cancel onClick",
      "DialogClose onClick",
      "onDismiss",
      "onOpenChange(false)",
    ]);
    expect(dialog()).toBeNull();
  });

  test("leaves it open, without calling `onDismiss`, when the child's own `onClick` calls `preventDefault()`", async () => {
    await mount(
      opened({
        root: { onOpenChange },
        body: { onDismiss },
        cancel: { onClick: record("Cancel onClick", true) },
      }),
    );

    await click(buttonNamed("Cancel"));

    expect(calls).toEqual(["Cancel onClick"]);
    expect(dialog()).not.toBeNull();
  });
});

test("DialogBody's built-in close cross calls `onDismiss` once and closes", async () => {
  await mount(opened({ root: { onOpenChange }, body: { onDismiss } }));

  await click(cross());

  expect(calls).toEqual(["onDismiss", "onOpenChange(false)"]);
  expect(dialog()).toBeNull();
});

test("Escape calls DialogBody's `onEscapeKeyDown` once and closes a dismissible dialog", async () => {
  const keys: string[] = [];
  await mount(
    opened({
      root: { onOpenChange },
      body: {
        onDismiss,
        onEscapeKeyDown: (event) => void keys.push(event.key),
      },
    }),
  );

  await pressEscape();

  expect(keys).toEqual(["Escape"]);
  expect(calls).toContain("onOpenChange(false)");
  expect(dialog()).toBeNull();
});
