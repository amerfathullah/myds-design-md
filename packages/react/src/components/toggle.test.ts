// @vitest-environment happy-dom
import { act, createElement, type ReactElement } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { computeAccessibleName } from "dom-accessibility-api";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { Label } from "./label";
import {
  Toggle,
  ToggleThumb,
  type ToggleProps,
  type ToggleThumbProps,
} from "./toggle";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const unmounts: (() => Promise<void>)[] = [];

// Mounts `element` in a container on the page, as an app would, and returns
// the container and a function that renders another element in its place
async function mount(element: ReactElement) {
  const container = document.body.appendChild(document.createElement("div"));
  const root = createRoot(container);
  unmounts.push(async () => {
    await act(async () => root.unmount());
    container.remove();
  });
  await act(async () => root.render(element));
  return {
    container,
    rerender: (next: ReactElement) => act(async () => root.render(next)),
  };
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

// A Toggle holding one ToggleThumb
const toggle = (
  props: Partial<ToggleProps> = {},
  thumb: ToggleThumbProps = {},
): ReactElement =>
  createElement(Toggle, {
    ...props,
    children: createElement(ToggleThumb, thumb),
  });

// The one switch in `within`, and the track beside it
function parts(within: ParentNode) {
  const switches = within.querySelectorAll('[role="switch"]');
  expect(switches).toHaveLength(1);
  const input = switches[0] as HTMLInputElement;
  return { input, track: input.nextElementSibling as HTMLElement };
}

// Presses a key on `target` as a keyboard does: a cancellable keydown that
// bubbles. Returns whether the default action was prevented.
function keydown(target: Element, key: string) {
  const event = new KeyboardEvent("keydown", {
    key,
    bubbles: true,
    cancelable: true,
  });
  act(() => void target.dispatchEvent(event));
  return event.defaultPrevented;
}

const click = (target: HTMLElement) => act(() => target.click());

describe("the switch", () => {
  test("is the one focusable element: the native checkbox, with role switch", async () => {
    const { container } = await mount(toggle({}, { "aria-label": "Sync" }));
    const { input, track } = parts(container);
    expect(input.tagName).toBe("INPUT");
    expect(input.type).toBe("checkbox");
    expect(input.tabIndex).toBe(0);
    // Nothing else is a tab stop, or exposes a role or state
    expect(
      [...container.querySelectorAll("[tabindex]")].filter(
        (element) => element.getAttribute("tabindex") !== "-1",
      ),
    ).toEqual([]);
    expect(container.querySelector("label")!.hasAttribute("tabindex")).toBe(
      false,
    );
    expect(track.tagName).toBe("SPAN");
    expect(track.getAttribute("aria-hidden")).toBe("true");
    expect(track.hasAttribute("tabindex")).toBe(false);
    expect(track.hasAttribute("role")).toBe(false);
    expect(
      track.getAttributeNames().filter((name) => name.startsWith("aria-")),
    ).toEqual(["aria-hidden"]);
    // The track keeps the state its styles key off
    expect(track.getAttribute("data-state")).toBe("unchecked");
  });

  test("has no default name, and nothing is named Toggle", async () => {
    const { container } = await mount(toggle());
    const { input } = parts(container);
    expect(input.hasAttribute("aria-label")).toBe(false);
    expect(computeAccessibleName(input)).toBe("");
    expect(container.innerHTML).not.toMatch(/Toggle/);
  });

  test("is named by a Label's htmlFor", async () => {
    const { container } = await mount(
      createElement(
        "div",
        null,
        createElement(Label, { htmlFor: "sync" }, "Enable sync"),
        toggle({ id: "sync" }),
      ),
    );
    const { input } = parts(container);
    expect(input.id).toBe("sync");
    expect(computeAccessibleName(input)).toBe("Enable sync");
  });

  test("is named by an aria-label on ToggleThumb", async () => {
    const { container } = await mount(
      toggle({}, { "aria-label": "Tetapan awam" }),
    );
    expect(computeAccessibleName(parts(container).input)).toBe("Tetapan awam");
  });

  test("is named by aria-labelledby and described by aria-describedby on ToggleThumb", async () => {
    const { container } = await mount(
      createElement(
        "div",
        null,
        createElement("h3", { id: "title" }, "Pemberitahuan e-mel"),
        createElement("p", { id: "hint" }, "Hantar ringkasan mingguan"),
        toggle({}, { "aria-labelledby": "title", "aria-describedby": "hint" }),
      ),
    );
    const { input } = parts(container);
    expect(computeAccessibleName(input)).toBe("Pemberitahuan e-mel");
    expect(input.getAttribute("aria-describedby")).toBe("hint");
  });

  test("passes className to the track", async () => {
    const { container } = await mount(toggle({}, { className: "mt-1" }));
    expect(parts(container).track.classList).toContain("mt-1");
  });
});

describe("toggling", () => {
  test("a click on the switch toggles it once and calls onCheckedChange with the new value", async () => {
    const onCheckedChange = vi.fn();
    const { container } = await mount(toggle({ onCheckedChange }));
    const { input, track } = parts(container);
    await click(input);
    expect(onCheckedChange.mock.calls).toEqual([[true]]);
    expect(input.checked).toBe(true);
    expect(track.getAttribute("data-state")).toBe("checked");
    await click(input);
    expect(onCheckedChange.mock.calls).toEqual([[true], [false]]);
    expect(input.checked).toBe(false);
    expect(track.getAttribute("data-state")).toBe("unchecked");
  });

  test("a click on the track toggles it once, through the label", async () => {
    const onCheckedChange = vi.fn();
    const { container } = await mount(toggle({ onCheckedChange }));
    const { input, track } = parts(container);
    await click(track);
    expect(onCheckedChange.mock.calls).toEqual([[true]]);
    expect(input.checked).toBe(true);
  });

  test("a click on a Label's text toggles it once", async () => {
    const onCheckedChange = vi.fn();
    const { container } = await mount(
      createElement(
        "div",
        null,
        createElement(Label, { htmlFor: "sync" }, "Enable sync"),
        toggle({ id: "sync", onCheckedChange }),
      ),
    );
    await click(container.querySelector("label[for=sync]")!);
    expect(onCheckedChange.mock.calls).toEqual([[true]]);
    expect(parts(container).input.checked).toBe(true);
  });

  test("Enter toggles it once, and its default action, which can submit a form, is prevented", async () => {
    const onCheckedChange = vi.fn();
    const { container } = await mount(toggle({ onCheckedChange }));
    const { input } = parts(container);
    expect(keydown(input, "Enter")).toBe(true);
    expect(onCheckedChange.mock.calls).toEqual([[true]]);
    expect(input.checked).toBe(true);
    expect(keydown(input, "Enter")).toBe(true);
    expect(onCheckedChange.mock.calls).toEqual([[true], [false]]);
    expect(input.checked).toBe(false);
  });

  test("other keys' keydown does nothing; Space is left to the browser", async () => {
    const onCheckedChange = vi.fn();
    const { container } = await mount(toggle({ onCheckedChange }));
    const { input } = parts(container);
    for (const key of [" ", "a", "Tab"])
      expect(keydown(input, key)).toBe(false);
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(input.checked).toBe(false);
  });

  test("a controlled switch shows `checked`, and follows it", async () => {
    const onCheckedChange = vi.fn();
    const { container, rerender } = await mount(
      toggle({ checked: true, onCheckedChange }),
    );
    const { input } = parts(container);
    expect(input.checked).toBe(true);
    await rerender(toggle({ checked: false, onCheckedChange }));
    expect(input.checked).toBe(false);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  test("the disabled prop blocks clicks on the switch, its track and its Label, and Enter", async () => {
    const onCheckedChange = vi.fn();
    const { container } = await mount(
      createElement(
        "div",
        null,
        createElement(Label, { htmlFor: "sync" }, "Enable sync"),
        toggle({ id: "sync", disabled: true, onCheckedChange }),
      ),
    );
    const { input, track } = parts(container);
    expect(input.disabled).toBe(true);
    await click(input);
    await click(track);
    await click(container.querySelector("label[for=sync]")!);
    keydown(input, "Enter");
    keydown(input, " ");
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(input.checked).toBe(false);
    expect(track.getAttribute("data-state")).toBe("unchecked");
  });
});

describe("ids", () => {
  test("a Toggle without an id gives its switch a unique one", async () => {
    const { container } = await mount(
      createElement("div", null, toggle(), toggle()),
    );
    const ids = [...container.querySelectorAll("input")].map(({ id }) => id);
    expect(ids).toHaveLength(2);
    expect(ids.every(Boolean)).toBe(true);
    expect(new Set(ids).size).toBe(2);
  });

  // useId() was called only without an id, so adding or removing one
  // changed the number of hooks
  test("adding and removing the id keeps the hooks in order", async () => {
    const { container, rerender } = await mount(toggle({ id: "sync" }));
    const id = () => container.querySelector("input")!.id;
    expect(id()).toBe("sync");
    await rerender(toggle());
    expect(id()).not.toBe("sync");
    expect(id()).toBeTruthy();
    await rerender(toggle({ id: "sync" }));
    expect(id()).toBe("sync");
  });

  test("server HTML hydrates without a warning, and the switch works after", async () => {
    const onCheckedChange = vi.fn();
    const tree = createElement(
      "form",
      null,
      createElement(Label, { htmlFor: "a" }, "Enable sync"),
      toggle({ id: "a" }),
      toggle({ onCheckedChange }, { "aria-label": "Tetapan awam" }),
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(tree);
    document.body.append(container);
    const serverIds = [...container.querySelectorAll("input")].map(
      ({ id }) => id,
    );
    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(container, tree);
    });
    unmounts.push(async () => {
      await act(async () => root?.unmount());
      container.remove();
    });
    expect(
      [...container.querySelectorAll("input")].map(({ id }) => id),
    ).toEqual(serverIds);
    const second = container.querySelectorAll("input")[1]!;
    await click(second);
    expect(onCheckedChange.mock.calls).toEqual([[true]]);
  });
});
