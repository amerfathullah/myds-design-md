// @vitest-environment happy-dom
import {
  act,
  createElement,
  useState,
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

const FRUITS = [
  ["apple", "Apple"],
  ["banana", "Banana"],
  ["cherry", "Cherry"],
] as const;

const PLACEHOLDER = "Select a fruit";

type Options = {
  // SelectValue's `children` function
  children?: (value: string | string[]) => string;
  // Puts the select, named "fruit", in a `<form>`. Radix renders the hidden
  // native `<select>` a form submits only inside one.
  form?: boolean;
};

// A Select of three fruits, composed as the docs compose one
const fruits = (props: SelectProps, { children, form }: Options = {}) => {
  const select = createElement(
    Select,
    form ? { ...props, name: "fruit" } : props,
    createElement(
      SelectTrigger,
      { "aria-label": "Fruit" },
      createElement(SelectValue, { placeholder: PLACEHOLDER, children }),
    ),
    createElement(
      SelectContent,
      null,
      FRUITS.map(([value, label]) =>
        createElement(SelectItem, { key: value, value }, label),
      ),
    ),
  );
  return form ? createElement("form", null, select) : select;
};

// A parent that keeps `value` in state and passes back each pick, as a form
// library does, and that can reset it
function following(initial: string | string[], options?: Options) {
  let setValue: (value: string | string[]) => void = () => {};
  const Parent = () => {
    const [value, set] = useState(initial);
    setValue = set;
    return fruits(
      {
        multiple: Array.isArray(initial),
        value,
        onValueChange: set,
      } as SelectProps,
      options,
    );
  };
  return {
    element: createElement(Parent),
    reset: (value: string | string[]) => act(async () => setValue(value)),
  };
}

const unmounts: (() => Promise<void>)[] = [];

// Mounts `element` in a container on the page, as an app would, and
// re-renders it with a new element. The open list portals into `<body>`,
// outside the container.
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

const trigger = () => document.querySelector<HTMLElement>('[role="combobox"]')!;

// The list's items, while it's open
const items = () => [
  ...document.querySelectorAll<HTMLElement>('[role="option"]'),
];

// Opens the list from the trigger, unless it's open
async function open() {
  if (trigger().getAttribute("aria-expanded") === "true") return;
  await act(async () => trigger().click());
}

// Picks the item labelled `label`, opening the list first
async function pick(label: string) {
  await open();
  const item = items().find((i) => i.textContent === label);
  await act(async () => item!.click());
}

// The labels of the items marked checked, which opens the list
async function checked() {
  await open();
  return items()
    .filter((i) => i.getAttribute("data-state") === "checked")
    .map((i) => i.textContent);
}

// The labels of the items whose Checkbox is checked, in a `multiple` select,
// which opens the list
async function checkedBoxes() {
  await open();
  return items()
    .filter(
      (i) =>
        i.querySelector('[role="checkbox"]')?.getAttribute("data-state") ===
        "checked",
    )
    .map((i) => i.textContent);
}

// What the select's form submits for it
const formValue = () =>
  new FormData(document.querySelector("form")!).get("fruit");

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

describe("a single Select with a controlled `value`", () => {
  test("keeps showing `value` after a pick the parent ignores", async () => {
    const onValueChange = vi.fn();
    await mount(fruits({ value: "apple", onValueChange }));

    await pick("Banana");

    expect(onValueChange.mock.calls).toEqual([["banana"]]);
    expect(trigger().textContent).toBe("Apple");
    expect(await checked()).toEqual(["Apple"]);
  });

  test("passes `value`, not a pick the parent ignores, to SelectValue's `children`", async () => {
    const children = vi.fn((value: string | string[]) => String(value));
    await mount(
      fruits({ value: "apple", onValueChange: () => {} }, { children }),
    );

    await pick("Banana");

    expect(children).toHaveBeenLastCalledWith("apple");
  });

  test("submits `value`, not a pick the parent ignores, with its form", async () => {
    await mount(
      fruits({ value: "apple", onValueChange: () => {} }, { form: true }),
    );

    await pick("Banana");

    expect(formValue()).toBe("apple");
  });

  test('shows the placeholder when `value` changes to ""', async () => {
    const { rerender } = await mount(
      fruits({ value: "cherry" }, { form: true }),
    );
    expect(trigger().textContent).toBe("Cherry");
    expect(formValue()).toBe("cherry");

    await rerender(fruits({ value: "" }, { form: true }));

    expect(trigger().textContent).toBe(PLACEHOLDER);
    expect(trigger().hasAttribute("data-placeholder")).toBe(true);
    expect(formValue()).toBe("");
    expect(await checked()).toEqual([]);
  });

  test('shows the placeholder when a parent that followed a pick resets `value` to ""', async () => {
    const parent = following("", { form: true });
    await mount(parent.element);
    await pick("Banana");
    expect(trigger().textContent).toBe("Banana");
    expect(formValue()).toBe("banana");

    await parent.reset("");

    expect(trigger().textContent).toBe(PLACEHOLDER);
    expect(trigger().hasAttribute("data-placeholder")).toBe(true);
    expect(formValue()).toBe("");
    expect(await checked()).toEqual([]);
  });

  test('shows the placeholder for `value=""` over `defaultValue`', async () => {
    await mount(fruits({ value: "", defaultValue: "apple" }));

    expect(trigger().textContent).toBe(PLACEHOLDER);
    expect(trigger().hasAttribute("data-placeholder")).toBe(true);
    expect(await checked()).toEqual([]);
  });

  test("follows `value` when it changes to another item", async () => {
    const { rerender } = await mount(fruits({ value: "apple" }));

    await rerender(fruits({ value: "cherry" }));

    expect(trigger().textContent).toBe("Cherry");
    expect(await checked()).toEqual(["Cherry"]);
  });

  test("shows each pick to a parent that passes it back", async () => {
    await mount(following("apple").element);

    await pick("Banana");
    expect(trigger().textContent).toBe("Banana");

    await pick("Cherry");
    expect(trigger().textContent).toBe("Cherry");
    expect(await checked()).toEqual(["Cherry"]);
  });

  test("doesn't call `onValueChange` when the selected item is picked", async () => {
    const onValueChange = vi.fn();
    await mount(fruits({ value: "apple", onValueChange }));

    await pick("Apple");

    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe("a `multiple` Select with a controlled `value`", () => {
  test("builds `onValueChange` on `value`, and keeps showing `value`, after picks the parent ignores", async () => {
    const onValueChange = vi.fn();
    await mount(fruits({ multiple: true, value: ["apple"], onValueChange }));

    await pick("Banana");
    await pick("Cherry");

    expect(onValueChange.mock.calls).toEqual([
      [["apple", "banana"]],
      [["apple", "cherry"]],
    ]);
    expect(trigger().textContent).toBe("1");
    expect(await checked()).toEqual(["Apple"]);
    expect(await checkedBoxes()).toEqual(["Apple"]);
  });

  test("removes a picked item from `value` for `onValueChange`", async () => {
    const onValueChange = vi.fn();
    await mount(
      fruits({ multiple: true, value: ["apple", "banana"], onValueChange }),
    );

    await pick("Apple");

    expect(onValueChange.mock.calls).toEqual([[["banana"]]]);
    expect(trigger().textContent).toBe("2");
  });

  test("follows `value` when it changes to another item", async () => {
    const { rerender } = await mount(
      fruits({ multiple: true, value: ["apple"] }),
    );

    await rerender(fruits({ multiple: true, value: ["cherry"] }));

    expect(trigger().textContent).toBe("1");
    expect(await checked()).toEqual(["Cherry"]);
    expect(await checkedBoxes()).toEqual(["Cherry"]);
  });

  test("checks nothing for `value={[]}`", async () => {
    await mount(fruits({ multiple: true, value: [] }));

    expect(trigger().textContent).toBe("0");
    expect(await checked()).toEqual([]);
    expect(await checkedBoxes()).toEqual([]);
  });

  test("shows each pick to a parent that passes it back", async () => {
    await mount(following(["apple"]).element);

    await pick("Banana");
    expect(trigger().textContent).toBe("2");
    expect(await checked()).toEqual(["Apple", "Banana"]);

    await pick("Apple");
    expect(trigger().textContent).toBe("1");
    expect(await checked()).toEqual(["Banana"]);
    expect(await checkedBoxes()).toEqual(["Banana"]);
  });
});

describe("an uncontrolled Select", () => {
  test("shows a pick from `defaultValue` and calls `onValueChange`", async () => {
    const onValueChange = vi.fn();
    await mount(fruits({ defaultValue: "apple", onValueChange }));
    expect(trigger().textContent).toBe("Apple");

    await pick("Banana");

    expect(onValueChange.mock.calls).toEqual([["banana"]]);
    expect(trigger().textContent).toBe("Banana");
    expect(await checked()).toEqual(["Banana"]);
  });

  test("shows the placeholder, then a pick, without `defaultValue`", async () => {
    await mount(fruits({}));
    expect(trigger().textContent).toBe(PLACEHOLDER);
    expect(trigger().hasAttribute("data-placeholder")).toBe(true);

    await pick("Banana");

    expect(trigger().textContent).toBe("Banana");
    expect(trigger().hasAttribute("data-placeholder")).toBe(false);
  });

  test("ignores a later `defaultValue`", async () => {
    const { rerender } = await mount(fruits({ defaultValue: "apple" }));

    await rerender(fruits({ defaultValue: "cherry" }));

    expect(trigger().textContent).toBe("Apple");
  });

  test("doesn't call `onValueChange` when the selected item is picked", async () => {
    const onValueChange = vi.fn();
    await mount(fruits({ defaultValue: "apple", onValueChange }));

    await pick("Apple");

    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("adds a `multiple` pick to `defaultValue` and calls `onValueChange`", async () => {
    const onValueChange = vi.fn();
    await mount(
      fruits({ multiple: true, defaultValue: ["apple"], onValueChange }),
    );

    await pick("Banana");

    expect(onValueChange.mock.calls).toEqual([[["apple", "banana"]]]);
    expect(trigger().textContent).toBe("2");
    expect(await checked()).toEqual(["Apple", "Banana"]);
    expect(await checkedBoxes()).toEqual(["Apple", "Banana"]);
  });
});
