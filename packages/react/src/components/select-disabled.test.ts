// @vitest-environment happy-dom
import {
  act,
  createElement,
  type ComponentProps,
  type ReactElement,
} from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

type SelectProps = ComponentProps<typeof Select>;

// The fruits of the docs' "Disable individual options" example
const FRUITS = [
  ["apple", "Apple"],
  ["banana", "Banana"],
  ["blueberry", "Blueberry"],
  ["grapes", "Grapes"],
  ["pineapple", "Pineapple"],
] as const;

type Fruit = (typeof FRUITS)[number][0];

// The example disables the first and third items, and gives the others no
// `disabled`
const EXAMPLE_DISABLED: Partial<Record<Fruit, boolean>> = {
  apple: true,
  blueberry: true,
};

const PLACEHOLDER = "Select";

type Options = {
  // Each item's `disabled`
  disabled?: Partial<Record<Fruit, boolean>>;
  // Puts the select, named "fruit", in a `<form>`. Radix renders the hidden
  // native `<select>` a form submits only inside one.
  form?: boolean;
};

// A Select of the example's fruits, composed as the docs compose one
const fruits = (
  props: SelectProps,
  { disabled = EXAMPLE_DISABLED, form }: Options = {},
) => {
  const select = createElement(
    Select,
    form ? { ...props, name: "fruit" } : props,
    createElement(
      SelectTrigger,
      { "aria-label": "Fruit" },
      createElement(SelectValue, { placeholder: PLACEHOLDER }),
    ),
    createElement(
      SelectContent,
      null,
      FRUITS.map(([value, label]) =>
        createElement(
          SelectItem,
          { key: value, value, disabled: disabled[value] },
          label,
        ),
      ),
    ),
  );
  return form ? createElement("form", null, select) : select;
};

const unmounts: (() => Promise<void>)[] = [];

// Mounts `element` in a container on the page, as an app would. The open
// list portals into `<body>`, outside the container.
async function mount(element: ReactElement) {
  const container = document.body.appendChild(document.createElement("div"));
  const root = createRoot(container);
  unmounts.push(async () => {
    await act(async () => root.unmount());
    container.remove();
  });
  await act(async () => root.render(element));
}

const trigger = () => document.querySelector<HTMLElement>('[role="combobox"]')!;

const isOpen = () => trigger().getAttribute("aria-expanded") === "true";

// The list's items, while it's open
const items = () => [
  ...document.querySelectorAll<HTMLElement>('[role="option"]'),
];

// The open list's item labelled `label`
function item(label: string) {
  const found = items().find((i) => i.textContent === label);
  expect(found, `the item "${label}"`).toBeDefined();
  return found!;
}

// The Checkbox in a `multiple` select's item labelled `label`
const checkbox = (label: string) =>
  item(label).querySelector<HTMLElement>('[role="checkbox"]')!;

// The label of the item that has focus, if one has
const focused = () =>
  document.activeElement?.getAttribute("role") === "option"
    ? document.activeElement.textContent
    : null;

// The labels of the items Radix highlights
const highlighted = () =>
  items()
    .filter((i) => i.hasAttribute("data-highlighted"))
    .map((i) => i.textContent);

// The labels of the items marked checked and, in a `multiple` select, whose
// Checkbox is checked
const checked = () =>
  items()
    .filter(
      (i) =>
        i.getAttribute("data-state") === "checked" ||
        i.querySelector('[role="checkbox"]')?.getAttribute("data-state") ===
          "checked",
    )
    .map((i) => i.textContent);

// Waits for what Radix does on a timer: placing the open list and focusing an
// item in it, and moving focus after a key
const settle = () =>
  act(() => new Promise((resolve) => setTimeout(resolve, 20)));

// Presses `key` on `target` as a keyboard does: a keydown that bubbles
async function press(target: Element, key: string) {
  await act(
    async () =>
      void target.dispatchEvent(
        new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
      ),
  );
  await settle();
}

// Types `text` where focus is, one key at a time
async function type(text: string) {
  for (const key of text) await press(document.activeElement!, key);
}

// Focuses the trigger, as a Tab to it does
const focusTrigger = () => act(async () => trigger().focus());

// Opens the list with Enter on the focused trigger. happy-dom has no layout,
// so a pointer can't open it.
async function open() {
  await focusTrigger();
  await press(trigger(), "Enter");
  expect(isOpen()).toBe(true);
}

// Presses and releases `target` with the primary button of a mouse or a
// touch, dispatching what a click or a tap dispatches
async function pointerPress(target: Element, pointerType: "mouse" | "touch") {
  const init = { bubbles: true, cancelable: true, button: 0, pointerType };
  await act(async () => {
    for (const event of [
      new PointerEvent("pointerdown", init),
      new MouseEvent("mousedown", init),
      new PointerEvent("pointerup", init),
      new MouseEvent("mouseup", init),
      new MouseEvent("click", init),
    ])
      target.dispatchEvent(event);
  });
  await settle();
}

// Moves a mouse pointer over `target`
async function hover(target: Element) {
  await act(
    async () =>
      void target.dispatchEvent(
        new PointerEvent("pointermove", {
          bubbles: true,
          cancelable: true,
          pointerType: "mouse",
        }),
      ),
  );
  await settle();
}

// The ways a visitor picks an item in the open list
const picks = [
  ["Enter", (target: Element) => press(target, "Enter")],
  ["Space", (target: Element) => press(target, " ")],
  ["a mouse click", (target: Element) => pointerPress(target, "mouse")],
  ["a touch tap", (target: Element) => pointerPress(target, "touch")],
] as const;

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

// No test logs an error or a warning, or leaves anything on the page
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

// A single select and a `multiple` one
const kinds = [
  ["a single", false],
  ["a `multiple`", true],
] as const;

describe.each(kinds)("in %s Select, a disabled item", (_, multiple) => {
  test("carries `aria-disabled` and `data-disabled`, which an item without `disabled` or with `disabled={false}` doesn't", async () => {
    await mount(
      fruits({ multiple } as SelectProps, {
        disabled: { apple: true, banana: false, blueberry: true },
      }),
    );
    await open();

    expect(
      items().map((i) => [
        i.textContent,
        i.getAttribute("aria-disabled"),
        i.hasAttribute("data-disabled"),
      ]),
    ).toEqual([
      ["Apple", "true", true],
      ["Banana", null, false],
      ["Blueberry", "true", true],
      ["Grapes", null, false],
      ["Pineapple", null, false],
    ]);
  });

  test("isn't focused when the list opens with nothing selected", async () => {
    await mount(fruits({ multiple } as SelectProps));
    await open();

    expect(focused()).toBe("Banana");
    expect(highlighted()).toEqual(["Banana"]);
  });

  test("is skipped by ArrowDown and ArrowUp", async () => {
    await mount(fruits({ multiple } as SelectProps));
    await open();

    await press(document.activeElement!, "ArrowDown");
    expect(focused()).toBe("Grapes");

    await press(document.activeElement!, "ArrowUp");
    expect(focused()).toBe("Banana");
  });

  test("is skipped by Home, End and the arrow keys when it's the first or last item", async () => {
    await mount(
      fruits({ multiple } as SelectProps, {
        disabled: { apple: true, blueberry: true, pineapple: true },
      }),
    );
    await open();

    await press(document.activeElement!, "End");
    expect(focused()).toBe("Grapes");
    await press(document.activeElement!, "ArrowDown");
    expect(focused()).toBe("Grapes");

    await press(document.activeElement!, "Home");
    expect(focused()).toBe("Banana");
    await press(document.activeElement!, "ArrowUp");
    expect(focused()).toBe("Banana");
  });

  test.each(picks)(
    "isn't picked by %s, and the list stays open",
    async (_, pick) => {
      const onValueChange = vi.fn();
      await mount(fruits({ multiple, onValueChange } as SelectProps));
      await open();
      const shown = trigger().textContent;

      for (const label of ["Apple", "Blueberry"]) {
        await pick(item(label));

        expect(onValueChange).not.toHaveBeenCalled();
        expect(trigger().textContent).toBe(shown);
        expect(isOpen()).toBe(true);
        expect(checked()).toEqual([]);
      }
    },
  );

  test("isn't highlighted on hover, so it keeps its disabled fill", async () => {
    await mount(fruits({ multiple } as SelectProps));
    await open();

    await hover(item("Blueberry"));

    // The highlight's `bg-washed-active` fill and `txt-black-900` text apply
    // only with `data-highlighted`, so without it the item keeps its disabled
    // fill and text. happy-dom doesn't compute the cascade, so the attribute
    // is what's checked.
    expect(item("Blueberry").hasAttribute("data-highlighted")).toBe(false);
    expect(focused()).not.toBe("Blueberry");
  });

  test("is skipped by typeahead in the open list, even when it alone matches", async () => {
    const onValueChange = vi.fn();
    await mount(fruits({ multiple, onValueChange } as SelectProps));
    await open();

    // Only Blueberry starts with "bl"
    await type("bl");

    expect(focused()).toBe("Banana");
    expect(highlighted()).toEqual(["Banana"]);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("is skipped by typeahead on the closed trigger, even when it alone matches", async () => {
    const onValueChange = vi.fn();
    await mount(fruits({ multiple, onValueChange } as SelectProps));
    await focusTrigger();
    const shown = trigger().textContent;

    // Only Apple starts with "a"
    await type("a");

    expect(onValueChange).not.toHaveBeenCalled();
    expect(trigger().textContent).toBe(shown);
    expect(isOpen()).toBe(false);
  });
});

describe.each(kinds)("in %s Select, an enabled item", (_, multiple) => {
  test("is reached by ArrowDown, ArrowUp, Home and End", async () => {
    // Only the middle item is disabled, so none of these keys passes one
    await mount(
      fruits({ multiple } as SelectProps, { disabled: { blueberry: true } }),
    );
    await open();
    expect(focused()).toBe("Apple");

    await press(document.activeElement!, "ArrowDown");
    expect(focused()).toBe("Banana");
    await press(document.activeElement!, "End");
    expect(focused()).toBe("Pineapple");
    await press(document.activeElement!, "ArrowUp");
    expect(focused()).toBe("Grapes");
    await press(document.activeElement!, "Home");
    expect(focused()).toBe("Apple");
  });

  test("is highlighted on hover", async () => {
    await mount(fruits({ multiple } as SelectProps));
    await open();

    await hover(item("Grapes"));

    expect(focused()).toBe("Grapes");
    expect(highlighted()).toEqual(["Grapes"]);
  });

  test("is reached by typeahead in the open list", async () => {
    await mount(fruits({ multiple } as SelectProps));
    await open();

    await type("g");

    expect(focused()).toBe("Grapes");
  });

  test.each(picks)("is picked by %s", async (_, pick) => {
    const onValueChange = vi.fn();
    await mount(fruits({ multiple, onValueChange } as SelectProps));
    await open();

    await pick(item("Grapes"));

    if (multiple) {
      expect(onValueChange.mock.calls).toEqual([[["grapes"]]]);
      expect(trigger().textContent).toBe("1");
      // A `multiple` select stays open for the next pick
      expect(isOpen()).toBe(true);
      expect(checked()).toEqual(["Grapes"]);
    } else {
      expect(onValueChange.mock.calls).toEqual([["grapes"]]);
      expect(trigger().textContent).toBe("Grapes");
      expect(isOpen()).toBe(false);
      await open();
      expect(checked()).toEqual(["Grapes"]);
    }
  });

  test("is picked by typeahead on the closed trigger", async () => {
    const onValueChange = vi.fn();
    await mount(fruits({ multiple, onValueChange } as SelectProps));
    await focusTrigger();

    await type("g");

    expect(onValueChange.mock.calls).toEqual([
      [multiple ? ["grapes"] : "grapes"],
    ]);
    expect(trigger().textContent).toBe(multiple ? "1" : "Grapes");
  });
});

describe("in a `multiple` Select, a disabled item", () => {
  test("isn't added to a selection by any key or pointer", async () => {
    const onValueChange = vi.fn();
    await mount(fruits({ multiple: true, onValueChange }));
    // Only Apple starts with "a"
    await focusTrigger();
    await type("a");
    await open();
    await press(item("Banana"), "Enter");

    for (const [, pick] of picks) {
      await pick(item("Apple"));
      await pick(item("Blueberry"));
    }

    expect(onValueChange.mock.calls).toEqual([[["banana"]]]);
    expect(trigger().textContent).toBe("1");
    expect(checked()).toEqual(["Banana"]);
  });

  test("renders its Checkbox disabled, in Checkbox's existing disabled look", async () => {
    await mount(fruits({ multiple: true }));
    await open();

    expect(checkbox("Apple").hasAttribute("disabled")).toBe(true);
    expect(checkbox("Apple").hasAttribute("data-disabled")).toBe(true);
    expect(checkbox("Banana").hasAttribute("disabled")).toBe(false);
    expect(checkbox("Banana").hasAttribute("data-disabled")).toBe(false);
    // The look is Checkbox's own `disabled:` classes, which an enabled
    // Checkbox has too
    expect(checkbox("Apple").className).toBe(checkbox("Banana").className);
    expect(checkbox("Apple").className.split(" ")).toEqual(
      expect.arrayContaining([
        "disabled:opacity-30",
        "disabled:bg-bg-washed",
        "disabled:cursor-not-allowed",
      ]),
    );
  });
});

describe("in a single Select inside a `<form>`", () => {
  test("a disabled item's native option is disabled", async () => {
    await mount(
      fruits(
        {},
        {
          disabled: { apple: true, banana: false, blueberry: true },
          form: true,
        },
      ),
    );

    const options = [
      ...document.querySelectorAll<HTMLOptionElement>("form select option"),
    ].filter((option) => option.value !== "");

    expect(options.map((option) => [option.value, option.disabled])).toEqual([
      ["apple", true],
      ["banana", false],
      ["blueberry", true],
      ["grapes", false],
      ["pineapple", false],
    ]);
  });
});

// The classes SelectItem gave a disabled item before it forwarded `disabled`,
// with the highlight every item has had since #158
const DISABLED_ITEM_CLASSES = {
  single:
    "flex items-center w-full select-none py-1.5 gap-2 font-medium outline-hidden rounded-xs data-[highlighted]:bg-bg-washed-active data-[highlighted]:text-txt-black-900 text-body-xs pl-2.5 pr-[38px] bg-bg-white-disabled text-txt-black-disabled border-transparent cursor-not-allowed hover:bg-none",
  multiple:
    "flex items-center w-full select-none py-1.5 gap-2 font-medium outline-hidden rounded-xs data-[highlighted]:bg-bg-washed-active data-[highlighted]:text-txt-black-900 text-body-xs px-2.5 bg-bg-white-disabled text-txt-black-disabled border-transparent cursor-not-allowed hover:bg-none",
};

describe.each(kinds)("in %s Select", (_, multiple) => {
  test("a disabled item keeps its classes", async () => {
    await mount(fruits({ multiple } as SelectProps));
    await open();

    expect(item("Apple").className).toBe(
      DISABLED_ITEM_CLASSES[multiple ? "multiple" : "single"],
    );
  });

  test("Select's own `disabled` still disables the trigger", async () => {
    await mount(fruits({ multiple, disabled: true } as SelectProps));

    expect(trigger().hasAttribute("disabled")).toBe(true);
    expect(trigger().hasAttribute("data-disabled")).toBe(true);
    await press(trigger(), "Enter");
    expect(isOpen()).toBe(false);
  });
});
