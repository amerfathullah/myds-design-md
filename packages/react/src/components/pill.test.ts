// @vitest-environment happy-dom
//
// Pill's remove button is `type="button"` (#182), inside a form and out, so a
// click on it calls its pill's `onDismiss` and submits nothing around it, as
// DataTable's "Clear selection" does. `Button` itself keeps no default
// `type`, so an untyped `Button` still submits its form. happy-dom doesn't
// implement Enter's implicit submission: the style package's pill.test.mjs
// checks Enter in Chromium.
import { act, createElement, type FormEvent, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { computeAccessibleName } from "dom-accessibility-api";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { Button } from "./button";
import { Pill } from "./pill";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

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

// The button in `within` whose accessible name is `name`
function buttonNamed(within: ParentNode, name: string) {
  const button = [...within.querySelectorAll("button")].find(
    (element) => computeAccessibleName(element) === name,
  );
  if (!button) throw new Error(`No button is named "${name}"`);
  return button;
}

async function click(element: HTMLElement) {
  await act(async () => element.click());
}

// The states a tags field holds, one dismissible pill each
const states = ["Kuala Lumpur", "Johor"];

// A dismissible pill for each of `states`, named by `closeLabel` after its
// state. Each `onDismiss` records its state in `dismissed` and leaves the
// pill rendered.
const pills = (dismissed: string[]) =>
  states.map((state) =>
    createElement(
      Pill,
      {
        key: state,
        closeLabel: `Buang ${state}`,
        onDismiss: () => dismissed.push(state),
      },
      state,
    ),
  );

// A form holding the pills, then a `Button` with no `type`, as the login
// template's "Log in" button is. The form records each submit by its
// submitter's name, or null with no submitter, and cancels it.
async function tagsForm() {
  const dismissed: string[] = [];
  const submits: (string | null)[] = [];
  const page = await mount(
    createElement(
      "form",
      {
        onSubmit: (event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const { submitter } = event.nativeEvent as SubmitEvent;
          submits.push(submitter ? computeAccessibleName(submitter) : null);
        },
      },
      ...pills(dismissed),
      createElement(Button, { key: "submit" }, "Hantar"),
    ),
  );
  return { page, dismissed, submits };
}

const removeNames = states.map((state) => `Buang ${state}`);

describe("Pill's remove button", () => {
  test('is `type="button"`, inside a form and out', async () => {
    const outside = await mount(createElement("div", null, ...pills([])));
    const { page: inside } = await tagsForm();
    const types = (within: ParentNode) =>
      removeNames.map((name) => {
        const button = buttonNamed(within, name);
        return {
          attribute: button.getAttribute("type"),
          property: button.type,
        };
      });
    const button = { attribute: "button", property: "button" };
    expect({ outside: types(outside), inside: types(inside) }).toEqual({
      outside: [button, button],
      inside: [button, button],
    });
  });

  test("inside a form, a click calls its pill's `onDismiss` once and submits nothing", async () => {
    const { page, dismissed, submits } = await tagsForm();
    await click(buttonNamed(page, "Buang Johor"));
    const afterJohor = { dismissed: [...dismissed], submits: [...submits] };
    await click(buttonNamed(page, "Buang Kuala Lumpur"));
    expect({
      afterJohor,
      afterBoth: { dismissed, submits },
    }).toEqual({
      afterJohor: { dismissed: ["Johor"], submits: [] },
      afterBoth: { dismissed: ["Johor", "Kuala Lumpur"], submits: [] },
    });
  });
});

test("an untyped `Button` beside the pills renders no `type`, and still submits the form", async () => {
  const { page, dismissed, submits } = await tagsForm();
  const submit = buttonNamed(page, "Hantar");
  await click(submit);
  expect({
    attribute: submit.getAttribute("type"),
    property: submit.type,
    submits,
    dismissed,
  }).toEqual({
    attribute: null,
    property: "submit",
    submits: ["Hantar"],
    dismissed: [],
  });
});
