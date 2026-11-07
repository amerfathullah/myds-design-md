// @vitest-environment happy-dom
import {
  act,
  createElement,
  Fragment,
  useState,
  type ComponentProps,
  type ReactElement,
} from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
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

// The `id` of the form a select outside it names with `form`
const FORM_ID = "fruit-form";

// A Select of three fruits, composed as the docs compose one
const fruits = (props: SelectProps) =>
  createElement(
    Select,
    props,
    createElement(
      SelectTrigger,
      { "aria-label": "Fruit" },
      createElement(SelectValue, { placeholder: PLACEHOLDER }),
    ),
    createElement(
      SelectContent,
      null,
      FRUITS.map(([value, label]) =>
        createElement(SelectItem, { key: value, value }, label),
      ),
    ),
  );

// Where a select sits: inside a `<form>`, or after one and tied to it with
// `form`
type Placement = "inside" | "form prop";

// The fruits Select, named "fruit", inside a form or tied to one with `form`
const inForm = (props: SelectProps, placement: Placement = "inside") => {
  const named = { name: "fruit", ...props } as SelectProps;
  return placement === "inside"
    ? createElement("form", null, fruits(named))
    : createElement(
        Fragment,
        null,
        createElement("form", { id: FORM_ID }),
        fruits({ ...named, form: FORM_ID } as SelectProps),
      );
};

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

// Puts `tree`'s server-rendered HTML in a container on the page, as a server
// sends it, and returns the container
function serverRender(tree: ReactElement) {
  const container = document.body.appendChild(document.createElement("div"));
  container.innerHTML = renderToString(tree);
  unmounts.push(async () => container.remove());
  return container;
}

// Hydrates the server HTML in `container` with `tree`, as the browser does,
// and returns the errors React recovered from, such as a hydration mismatch
async function hydrate(container: HTMLElement, tree: ReactElement) {
  const recoverable: unknown[] = [];
  let root: ReturnType<typeof hydrateRoot> | undefined;
  await act(async () => {
    root = hydrateRoot(container, tree, {
      onRecoverableError: (error) => void recoverable.push(error),
    });
  });
  unmounts.push(async () => {
    await act(async () => root?.unmount());
  });
  return recoverable;
}

// What has gone through `console.error`
const errors = () => vi.mocked(console.error).mock.calls;

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

// No test logs an error, React's warnings included, or leaves anything on the
// page. Warnings aren't checked: Radix warns that Select's open state changes
// from controlled to uncontrolled on every mount (#132).
afterEach(async () => {
  while (unmounts.length) await unmounts.pop()!();
  const logged = [...errors()];
  vi.restoreAllMocks();
  expect(logged).toEqual([]);
  expect(document.body.innerHTML).toBe("");
});

describe("a `multiple` Select logs nothing", () => {
  test("mounted outside a form", async () => {
    await mount(fruits({ multiple: true }));

    expect(errors()).toEqual([]);
  });

  test("mounted inside a form with `name`", async () => {
    await mount(inForm({ multiple: true }));

    expect(errors()).toEqual([]);
  });

  test("with `defaultValue`", async () => {
    await mount(inForm({ multiple: true, defaultValue: ["apple"] }));

    expect(errors()).toEqual([]);
  });

  test("with `value`", async () => {
    await mount(inForm({ multiple: true, value: ["apple"] }));

    expect(errors()).toEqual([]);
  });

  test("rendered with `renderToString` inside a form", () => {
    serverRender(inForm({ multiple: true, defaultValue: ["apple"] }));

    expect(errors()).toEqual([]);
  });

  test("after a single select, inside or outside a form, becomes `multiple`", async () => {
    const outside = await mount(fruits({ defaultValue: "apple" }));
    const inside = await mount(inForm({ defaultValue: "apple" }));

    await outside.rerender(fruits({ multiple: true }));
    await inside.rerender(inForm({ multiple: true }));

    expect(errors()).toEqual([]);
  });

  test("hydrated from that HTML", async () => {
    const tree = inForm({ multiple: true, defaultValue: ["apple"] });
    const container = serverRender(tree);
    // Only what hydration logs counts here
    vi.mocked(console.error).mockClear();

    expect(await hydrate(container, tree)).toEqual([]);
    expect(errors()).toEqual([]);
  });
});

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

// Picks the item labelled `label`, opening the list first. A `multiple`
// select stays open after a pick.
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

// The labels of the items whose Checkbox is checked, which opens the list
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

// A parent that keeps a `multiple` select's `value` in state and passes back
// each pick, as a form library does
function following(
  initial: string[],
  onValueChange: (value: string[]) => void,
  placement?: Placement,
) {
  const Parent = () => {
    const [value, setValue] = useState(initial);
    return inForm(
      {
        multiple: true,
        value,
        onValueChange: (next) => {
          onValueChange(next);
          setValue(next);
        },
      },
      placement,
    );
  };
  return createElement(Parent);
}

// The ways a select is tied to a form
const placements = [
  ["inside a `<form>`", "inside"],
  ["tied to a `<form>` with `form`", "form prop"],
] as const;

describe.each(placements)("a `multiple` Select %s", (_, placement) => {
  test("keeps each pick, starting from nothing", async () => {
    const onValueChange = vi.fn();
    await mount(inForm({ multiple: true, onValueChange }, placement));

    await pick("Banana");
    await pick("Apple");
    await pick("Banana");

    expect(onValueChange.mock.calls).toEqual([
      [["banana"]],
      [["banana", "apple"]],
      [["apple"]],
    ]);
    expect(trigger().textContent).toBe("1");
    expect(await checked()).toEqual(["Apple"]);
    expect(await checkedBoxes()).toEqual(["Apple"]);
  });

  test("keeps each pick without `name`", async () => {
    const onValueChange = vi.fn();
    await mount(
      inForm({ multiple: true, name: undefined, onValueChange }, placement),
    );

    await pick("Banana");
    await pick("Apple");
    await pick("Banana");

    expect(onValueChange.mock.calls).toEqual([
      [["banana"]],
      [["banana", "apple"]],
      [["apple"]],
    ]);
    expect(trigger().textContent).toBe("1");
    expect(await checked()).toEqual(["Apple"]);
  });

  test("keeps each pick with a controlled `value` its parent follows", async () => {
    const onValueChange = vi.fn();
    await mount(following([], onValueChange, placement));

    await pick("Banana");
    await pick("Apple");
    await pick("Banana");

    expect(onValueChange.mock.calls).toEqual([
      [["banana"]],
      [["banana", "apple"]],
      [["apple"]],
    ]);
    expect(trigger().textContent).toBe("1");
    expect(await checked()).toEqual(["Apple"]);
    expect(await checkedBoxes()).toEqual(["Apple"]);
  });
});

// What the page's form submits, as [name, value] pairs in value order: each
// selected option of a named, enabled `<select>`, and the value of a named,
// enabled `<input>`. happy-dom's FormData appends `select.value` for every
// `<select>`, `multiple` or not, and its `selectedOptions` goes stale once a
// select's value is set from script, so the options are read instead.
function submitted() {
  const form = document.querySelector("form")!;
  return [...form.elements]
    .flatMap((control): [string, string][] => {
      if (control instanceof HTMLSelectElement) {
        if (!control.name || control.disabled) return [];
        return [...control.options]
          .filter((option) => option.selected && !option.disabled)
          .map((option) => [control.name, option.value]);
      }
      if (control instanceof HTMLInputElement) {
        if (!control.name || control.disabled) return [];
        if (/^(checkbox|radio)$/.test(control.type) && !control.checked)
          return [];
        return [[control.name, control.value]];
      }
      return [];
    })
    .sort(([, a], [, b]) => a.localeCompare(b));
}

describe.each(placements)(
  "a named `multiple` Select %s submits",
  (_, placement) => {
    test("nothing with nothing selected", async () => {
      await mount(inForm({ multiple: true }, placement));

      expect(submitted()).toEqual([]);
    });

    test("each value of `defaultValue`", async () => {
      await mount(
        inForm(
          { multiple: true, defaultValue: ["apple", "banana"] },
          placement,
        ),
      );

      expect(submitted()).toEqual([
        ["fruit", "apple"],
        ["fruit", "banana"],
      ]);
    });

    test("each value of a controlled `value`", async () => {
      await mount(
        inForm({ multiple: true, value: ["banana", "cherry"] }, placement),
      );

      expect(submitted()).toEqual([
        ["fruit", "banana"],
        ["fruit", "cherry"],
      ]);
    });

    test("the selection after picks", async () => {
      await mount(inForm({ multiple: true }, placement));

      await pick("Banana");
      await pick("Apple");
      await pick("Banana");

      expect(submitted()).toEqual([["fruit", "apple"]]);
    });

    test("the selection after picks, with a controlled `value` its parent follows", async () => {
      await mount(following([], () => {}, placement));

      await pick("Banana");
      await pick("Apple");
      await pick("Banana");

      expect(submitted()).toEqual([["fruit", "apple"]]);
    });
  },
);

// The select's own control in the page's form, the one named "fruit"
const control = () =>
  [...document.querySelector("form")!.elements].find(
    (element): element is HTMLSelectElement =>
      element instanceof HTMLSelectElement && element.name === "fruit",
  )!;

describe("a named `multiple` Select's form control", () => {
  test("takes the select's `autoComplete`", async () => {
    await mount(inForm({ multiple: true, autoComplete: "off" }));

    expect(control().getAttribute("autocomplete")).toBe("off");
  });

  test("replaces the selection with its own after it changes, as autofill changes it", async () => {
    const onValueChange = vi.fn();
    await mount(
      inForm({
        multiple: true,
        defaultValue: ["apple", "banana"],
        onValueChange,
      }),
    );

    await act(async () => {
      const apple = [...control().options].find((o) => o.value === "apple")!;
      apple.selected = false;
      control().dispatchEvent(new Event("change", { bubbles: true }));
    });

    expect(onValueChange.mock.calls).toEqual([[["banana"]]]);
    expect(trigger().textContent).toBe("1");
    expect(await checked()).toEqual(["Banana"]);
    expect(submitted()).toEqual([["fruit", "banana"]]);
  });
});

describe.each(placements)(
  "a `required` `multiple` Select %s",
  (_, placement) => {
    test("keeps its form invalid until something is picked", async () => {
      await mount(inForm({ multiple: true, required: true }, placement));
      const form = document.querySelector("form")!;
      expect(form.checkValidity()).toBe(false);

      await pick("Banana");

      expect(form.checkValidity()).toBe(true);
    });
  },
);

describe("a disabled `multiple` Select", () => {
  test("submits nothing, with a selection", async () => {
    await mount(
      inForm({ multiple: true, disabled: true, defaultValue: ["apple"] }),
    );

    expect(submitted()).toEqual([]);
  });

  test("submits nothing, with a controlled `value`", async () => {
    await mount(inForm({ multiple: true, disabled: true, value: ["apple"] }));

    expect(submitted()).toEqual([]);
  });
});

// Resets the page's form, as a reset button does. happy-dom fires the form's
// `reset` event but, unlike a browser, leaves each `<select>`'s options as
// they are.
const reset = () => act(async () => document.querySelector("form")!.reset());

describe.each(placements)(
  "a `multiple` Select %s, on reset",
  (_, placement) => {
    test("restores `defaultValue`", async () => {
      const onValueChange = vi.fn();
      await mount(
        inForm(
          { multiple: true, defaultValue: ["apple"], onValueChange },
          placement,
        ),
      );
      await pick("Banana");

      await reset();

      expect(onValueChange.mock.calls).toEqual([
        [["apple", "banana"]],
        [["apple"]],
      ]);
      expect(trigger().textContent).toBe("1");
      expect(await checked()).toEqual(["Apple"]);
      expect(await checkedBoxes()).toEqual(["Apple"]);
      expect(submitted()).toEqual([["fruit", "apple"]]);
    });

    test("restores nothing without `defaultValue`", async () => {
      const onValueChange = vi.fn();
      await mount(inForm({ multiple: true, onValueChange }, placement));
      await pick("Banana");

      await reset();

      expect(onValueChange.mock.calls).toEqual([[["banana"]], [[]]]);
      expect(trigger().textContent).toBe("0");
      expect(await checked()).toEqual([]);
      expect(submitted()).toEqual([]);
    });

    test("restores a controlled `value` its parent follows", async () => {
      const onValueChange = vi.fn();
      await mount(following(["apple"], onValueChange, placement));
      await pick("Banana");

      await reset();

      expect(onValueChange.mock.calls).toEqual([
        [["apple", "banana"]],
        [["apple"]],
      ]);
      expect(trigger().textContent).toBe("1");
      expect(await checked()).toEqual(["Apple"]);
      expect(submitted()).toEqual([["fruit", "apple"]]);
    });

    // A browser's reset also restores each option's default selectedness,
    // which only a browser run shows doesn't empty the submission
    test("keeps showing and submitting a controlled `value` until its parent passes the restored one", async () => {
      const onValueChange = vi.fn();
      const { rerender } = await mount(
        inForm({ multiple: true, value: ["apple"], onValueChange }, placement),
      );
      await rerender(
        inForm(
          { multiple: true, value: ["apple", "banana"], onValueChange },
          placement,
        ),
      );

      await reset();

      expect(onValueChange.mock.calls).toEqual([[["apple"]]]);
      expect(trigger().textContent).toBe("2");
      expect(await checked()).toEqual(["Apple", "Banana"]);
      expect(submitted()).toEqual([
        ["fruit", "apple"],
        ["fruit", "banana"],
      ]);
    });
  },
);

describe("a named `multiple` Select in server HTML", () => {
  test("submits `defaultValue` before and after hydration", async () => {
    const tree = inForm({ multiple: true, defaultValue: ["apple", "banana"] });
    const container = serverRender(tree);
    expect(submitted()).toEqual([
      ["fruit", "apple"],
      ["fruit", "banana"],
    ]);

    expect(await hydrate(container, tree)).toEqual([]);

    expect(submitted()).toEqual([
      ["fruit", "apple"],
      ["fruit", "banana"],
    ]);
  });
});

describe("a named single Select inside a form", () => {
  test("logs nothing", async () => {
    await mount(inForm({ defaultValue: "banana" }));

    expect(errors()).toEqual([]);
  });

  test("submits `defaultValue`", async () => {
    await mount(inForm({ defaultValue: "banana" }));

    expect(submitted()).toEqual([["fruit", "banana"]]);
  });

  test("submits a pick", async () => {
    await mount(inForm({ defaultValue: "banana" }));

    await pick("Apple");

    expect(submitted()).toEqual([["fruit", "apple"]]);
  });

  test("restores `defaultValue` on reset", async () => {
    const onValueChange = vi.fn();
    await mount(inForm({ defaultValue: "banana", onValueChange }));
    await pick("Apple");

    await reset();

    expect(onValueChange.mock.calls).toEqual([["apple"], ["banana"]]);
    expect(trigger().textContent).toBe("Banana");
    expect(submitted()).toEqual([["fruit", "banana"]]);
  });
});

describe("a `multiple` Select outside a form", () => {
  test("shows its counter, never the placeholder, and keeps each pick", async () => {
    const onValueChange = vi.fn();
    await mount(fruits({ multiple: true, onValueChange }));
    expect(trigger().textContent).toBe("0");
    expect(trigger().hasAttribute("data-placeholder")).toBe(false);

    await pick("Banana");
    await pick("Apple");
    await pick("Banana");

    expect(onValueChange.mock.calls).toEqual([
      [["banana"]],
      [["banana", "apple"]],
      [["apple"]],
    ]);
    expect(trigger().textContent).toBe("1");
    expect(trigger().hasAttribute("data-placeholder")).toBe(false);
    expect(await checked()).toEqual(["Apple"]);
    expect(await checkedBoxes()).toEqual(["Apple"]);
  });
});
