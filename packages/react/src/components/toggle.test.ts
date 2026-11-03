// @vitest-environment happy-dom
import { act, createElement, type ReactElement } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import {
  computeAccessibleDescription,
  computeAccessibleName,
} from "dom-accessibility-api";
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
    vi.mocked(console[method]).mock.calls.map((call) => [method, ...call]),
  );
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

// The one Switch's native checkbox in `within`, which is the switch, and the
// track beside it
function parts(within: ParentNode) {
  const inputs = within.querySelectorAll<HTMLInputElement>(
    'input[type="checkbox"]',
  );
  expect(inputs).toHaveLength(1);
  const input = inputs[0]!;
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
    expect([...container.querySelectorAll('[role="switch"]')]).toEqual([input]);
    expect(input.tabIndex).toBe(0);
    // Nothing else is a tab stop
    expect(
      [...container.querySelectorAll<HTMLElement>("*")].filter(
        (element) => element !== input && element.tabIndex >= 0,
      ),
    ).toEqual([]);
    expect(container.querySelector("label")!.hasAttribute("tabindex")).toBe(
      false,
    );
    // The track exposes no role or state, and keeps the state its styles
    // key off
    expect(track.tagName).toBe("SPAN");
    expect(track.getAttribute("aria-hidden")).toBe("true");
    expect(track.hasAttribute("tabindex")).toBe(false);
    expect(track.hasAttribute("role")).toBe(false);
    expect(
      track.getAttributeNames().filter((name) => name.startsWith("aria-")),
    ).toEqual(["aria-hidden"]);
    expect(track.getAttribute("data-state")).toBe("unchecked");
    await click(input);
    expect(track.getAttribute("data-state")).toBe("checked");
  });

  test("has no default name, and nothing is named Toggle", async () => {
    const { container } = await mount(toggle());
    const { input } = parts(container);
    expect(input.hasAttribute("aria-label")).toBe(false);
    expect(computeAccessibleName(input)).toBe("");
    for (const element of container.querySelectorAll("*")) {
      expect(element.getAttribute("aria-label")).not.toBe("Toggle");
      expect(computeAccessibleName(element)).not.toBe("Toggle");
    }
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
        createElement("p", { id: "hint" }, "Disimpan secara automatik"),
        toggle({}, { "aria-labelledby": "title", "aria-describedby": "hint" }),
      ),
    );
    const { input } = parts(container);
    expect(computeAccessibleName(input)).toBe("Pemberitahuan e-mel");
    expect(computeAccessibleDescription(input)).toBe(
      "Disimpan secara automatik",
    );
  });

  test("passes className to the track, not the checkbox", async () => {
    const { container } = await mount(toggle({}, { className: "mt-1" }));
    const { input, track } = parts(container);
    expect(track.classList).toContain("mt-1");
    expect(input.classList).not.toContain("mt-1");
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
    for (const key of [" ", "a", "Escape", "Tab", "ArrowRight"])
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

  test("the disabled prop takes the switch out of the tab order, and blocks clicks on the switch, its track and its Label, and Enter", async () => {
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
    // Tab skips the disabled checkbox, and nothing else is a tab stop
    expect(
      [...container.querySelectorAll<HTMLElement>("*")].filter(
        (element) => element !== input && element.tabIndex >= 0,
      ),
    ).toEqual([]);
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
    const { container, rerender } = await mount(toggle({ id: "a" }));
    const id = () => container.querySelector("input")!.id;
    expect(id()).toBe("a");
    await rerender(toggle());
    expect(id()).not.toBe("a");
    expect(id()).toBeTruthy();
    await rerender(toggle({ id: "a" }));
    expect(id()).toBe("a");
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
    const recoverable: unknown[] = [];
    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(container, tree, {
        onRecoverableError: (error) => void recoverable.push(error),
      });
    });
    unmounts.push(async () => {
      await act(async () => root?.unmount());
      container.remove();
    });
    expect(recoverable).toEqual([]);
    expect(
      [...container.querySelectorAll("input")].map(({ id }) => id),
    ).toEqual(serverIds);
    const second = container.querySelectorAll("input")[1]!;
    await click(second);
    expect(onCheckedChange.mock.calls).toEqual([[true]]);
  });
});
