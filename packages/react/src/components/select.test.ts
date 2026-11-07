// @vitest-environment happy-dom
import {
  act,
  createElement,
  createRef,
  type ComponentProps,
  type ReactElement,
} from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
  Select,
  SelectContent,
  SelectFooter,
  SelectGroup,
  SelectGroupTitle,
  SelectHeader,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

type SelectProps = ComponentProps<typeof Select>;
type SizeAndVariant = Pick<SelectProps, "size" | "variant">;

// A custom chevron, as an app passes one to SelectValue's `icon`
const CustomIcon = (props: ComponentProps<"svg">) =>
  createElement("svg", { ...props, "data-icon": "custom" });

// An open Select with "apple" selected, composed as the docs compose one: a
// labelled value in the trigger, and two items. A single select shows a check
// icon on the selected item, and a `multiple` one a Checkbox and a counter.
const select = (
  props: SizeAndVariant & { multiple?: boolean },
  icon?: typeof CustomIcon,
) =>
  createElement(
    Select,
    {
      ...props,
      open: true,
      defaultValue: props.multiple ? ["apple"] : "apple",
    } as SelectProps,
    createElement(
      SelectTrigger,
      { "aria-label": "Fruit" },
      createElement(SelectValue, {
        label: "Fruit:",
        placeholder: "Select a fruit",
        icon,
      }),
    ),
    createElement(
      SelectContent,
      null,
      createElement(SelectItem, { value: "apple" }, "Apple"),
      createElement(SelectItem, { value: "banana" }, "Banana"),
    ),
  );

const unmounts: (() => Promise<void>)[] = [];

// Mounts `element` in a container on the page, as an app would. The open
// content portals into `<body>`, outside the container.
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

// The page's markup, with the ids React and Radix generate, which differ
// between mounts, replaced
const page = () =>
  document.body.innerHTML
    .replace(/radix-[^"\s]*/g, "radix-id")
    .replace(/«[^»]*»|_r_[0-9a-z]+_|:r[0-9a-z]+:/g, "react-id");

// The selected item's check icon, which a single select shows. A `multiple`
// select's items show a Checkbox, whose icons aren't the check icon.
const checkIcon = () =>
  [
    ...document.querySelectorAll('[role="option"][data-state="checked"] svg'),
  ].find((svg) => !svg.closest('[role="checkbox"]')) ?? null;

// What `element` renders open: the classes and size of the parts the docs
// size, which are the trigger, its chevron and the selected item's check
// icon, and the whole page's markup
async function rendered(element: ReactElement) {
  const container = await mount(element);
  const trigger = container.querySelector("button");
  const chevron = trigger?.querySelector("svg");
  const check = checkIcon();
  const result = {
    trigger: trigger?.getAttribute("class")?.split(" "),
    chevron: chevron?.getAttribute("class")?.split(" "),
    check: check && {
      class: check.getAttribute("class")?.split(" "),
      size: check.getAttribute("data-size"),
    },
    markup: page(),
  };
  await unmounts.pop()!();
  return result;
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

// Radix's warning that Select's open state changes between controlled and
// uncontrolled, which a Select whose `open` is left to it logs on mount and
// when it opens (#132)
const isOpenStateWarning = ([message]: unknown[]) =>
  typeof message === "string" &&
  /^Select is changing from (un)?controlled to (un)?controlled\./.test(message);

// No test logs an error or a warning besides that one, or leaves anything on
// the page
afterEach(async () => {
  while (unmounts.length) await unmounts.pop()!();
  const logged = [
    ...vi.mocked(console.error).mock.calls,
    ...vi
      .mocked(console.warn)
      .mock.calls.filter((call) => !isOpenStateWarning(call)),
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

describe.each(kinds)("%s Select without `size`", (_, multiple) => {
  test("gives the chevron the small size class", async () => {
    const { chevron } = await rendered(select({ multiple }));
    expect(chevron).toContain("size-4");
  });

  test("gives a custom chevron the small size class", async () => {
    const { chevron } = await rendered(select({ multiple }, CustomIcon));
    expect(chevron).toContain("size-4");
  });

  test('renders every part as `size="small"` does', async () => {
    expect(await rendered(select({ multiple }))).toEqual(
      await rendered(select({ multiple, size: "small" })),
    );
    expect(await rendered(select({ multiple }, CustomIcon))).toEqual(
      await rendered(select({ multiple, size: "small" }, CustomIcon)),
    );
  });
});

describe("the selected item in a Select without `size`", () => {
  test("shows a check icon sized small in a single select", async () => {
    const { check } = await rendered(select({}));
    expect(check?.size).toBe("small");
    expect(check?.class).toContain("data-[size=small]:size-4");
  });

  test("shows a Checkbox, not the check icon, in a `multiple` select", async () => {
    await mount(select({ multiple: true }));
    expect(
      document.querySelectorAll('[role="option"] [role="checkbox"]'),
    ).toHaveLength(2);
    expect(checkIcon()).toBeNull();
  });
});

describe.each(kinds)("%s Select without `variant`", (_, multiple) => {
  test("gives the trigger the outline classes", async () => {
    const { trigger } = await rendered(select({ multiple }));
    expect(trigger).toEqual(
      expect.arrayContaining(["bg-bg-white", "border-otl-gray-200"]),
    );
    expect(trigger).not.toContain("bg-transparent");
  });

  test('renders every part as `variant="outline"` does', async () => {
    expect(await rendered(select({ multiple }))).toEqual(
      await rendered(select({ multiple, variant: "outline" })),
    );
  });
});

// The chevron and check sizes are DESIGN.md's "select icons 16/20/20", and the
// trigger's padding and text the button's
describe.each([
  ["medium", "size-5", "py-2 px-3 text-body-md"],
  ["large", "size-5", "py-2.5 px-4 text-body-lg"],
] as const)('a Select with `size="%s"`', (size, icon, trigger) => {
  test("keeps its trigger, chevron and check icon size", async () => {
    const parts = await rendered(select({ size }));
    expect(parts.trigger).toEqual(expect.arrayContaining(trigger.split(" ")));
    expect(parts.trigger).not.toContain("text-body-sm");
    expect(parts.chevron).toContain(icon);
    expect(parts.chevron).not.toContain("size-4");
    expect(parts.check?.size).toBe(size);
  });

  test("keeps a `multiple` select's chevron size", async () => {
    const { chevron } = await rendered(select({ size, multiple: true }));
    expect(chevron).toContain(icon);
  });
});

describe('a Select with `variant="ghost"`', () => {
  test("keeps the ghost trigger", async () => {
    const { trigger } = await rendered(select({ variant: "ghost" }));
    expect(trigger).toEqual(
      expect.arrayContaining(["bg-transparent", "border-transparent"]),
    );
    expect(trigger).not.toContain("bg-bg-white");
    expect(trigger).not.toContain("shadow-button");
  });
});

// `null` drops the size and variant classes, as it does on Button
describe("a Select with `null` for `size` and `variant`", () => {
  test("keeps no size on the chevron or check icon", async () => {
    const parts = await rendered(select({ size: null, variant: null }));
    expect(parts.chevron).toEqual(["text-txt-black-900"]);
    expect(parts.check?.size).toBeNull();
  });

  test("keeps no size or variant classes on the trigger", async () => {
    const { trigger } = await rendered(select({ size: null, variant: null }));
    expect(trigger).not.toContain("text-body-sm");
    expect(trigger).not.toContain("bg-bg-white");
    expect(trigger).not.toContain("bg-transparent");
  });
});

/*========================================================================================================================*/

type PartProps = ComponentProps<typeof SelectHeader>;

// The props a header and a footer get besides their text
type HeaderAndFooterProps = { header?: PartProps; footer?: PartProps };

// An open Select shaped like the docs' With Header and With Footer examples,
// with a group title, a disabled item and a separator between its header and
// footer
const withHeaderAndFooter = (
  multiple: boolean,
  { header, footer }: HeaderAndFooterProps = {},
) =>
  createElement(
    Select,
    { multiple, open: true } as SelectProps,
    createElement(
      SelectTrigger,
      { "aria-label": "Fruit" },
      createElement(SelectValue, { placeholder: "Select a fruit" }),
    ),
    createElement(
      SelectContent,
      null,
      createElement(SelectHeader, header, "Search"),
      createElement(
        SelectGroup,
        null,
        createElement(SelectGroupTitle, null, "Fruits"),
        createElement(SelectItem, { value: "apple" }, "Apple"),
        createElement(
          SelectItem,
          { value: "banana", disabled: true },
          "Banana",
        ),
      ),
      createElement(SelectSeparator),
      createElement(SelectItem, { value: "cherry" }, "Cherry"),
      createElement(SelectFooter, footer, "Reset"),
    ),
  );

// The header and the footer: the text each holds and the classes each gives
// its `div`
const parts = [
  {
    part: "header",
    text: "Search",
    classes: "px-1 bg-bg-dialog sticky top-0 z-50 pb-1",
  },
  {
    part: "footer",
    text: "Reset",
    classes:
      "px-1 bg-bg-dialog border-otl-gray-200 sticky bottom-0 z-50 border-t py-1",
  },
] as const;

// The open list's child that holds `text`, which is the `div` a header or
// footer renders
function partDiv(text: string) {
  const viewport = document.querySelector("[data-radix-select-viewport]");
  const found = [...(viewport?.children ?? [])].find(
    (child) => child.textContent === text,
  );
  expect(found, `the part holding "${text}"`).toBeDefined();
  return found as HTMLElement;
}

// An element's attributes, by name
const attributes = (element: Element) =>
  Object.fromEntries(
    [...element.attributes].map(({ name, value }) => [name, value]),
  );

describe.each(kinds)("in %s Select", (_, multiple) => {
  describe.each(parts)("the $part", ({ part, text, classes }) => {
    test("puts every attribute it gets on its `div`, `className` after its own classes", async () => {
      // In a variable, as TypeScript rejects a `data-*` key in an object
      // literal passed straight to `createElement` or under a fixed key
      const props = {
        id: `fruit-${part}`,
        role: "group",
        "aria-label": `Fruit ${part}`,
        "aria-describedby": "fruit-hint",
        "data-testid": `fruit-${part}`,
        title: `The ${part}`,
        tabIndex: -1,
        style: { minHeight: "2rem" },
        className: "w-full",
      };
      await mount(withHeaderAndFooter(multiple, { [part]: props }));

      expect(attributes(partDiv(text))).toEqual({
        class: `${classes} w-full`,
        id: `fruit-${part}`,
        role: "group",
        "aria-label": `Fruit ${part}`,
        "aria-describedby": "fruit-hint",
        "data-testid": `fruit-${part}`,
        title: `The ${part}`,
        tabindex: "-1",
        style: "min-height: 2rem;",
      });
      expect(document.getElementById(`fruit-${part}`)).toBe(partDiv(text));
    });

    test("runs its `onClick` and `onKeyDown` on its `div`", async () => {
      const calls: [string, EventTarget | null][] = [];
      const onClick: PartProps["onClick"] = (event) => {
        calls.push(["click", event.currentTarget]);
      };
      const onKeyDown: PartProps["onKeyDown"] = (event) => {
        calls.push([`keydown ${event.key}`, event.currentTarget]);
      };
      await mount(
        withHeaderAndFooter(multiple, { [part]: { onClick, onKeyDown } }),
      );
      const div = partDiv(text);

      await act(async () => {
        div.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        div.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
        );
      });

      expect(calls.map(([call]) => call)).toEqual(["click", "keydown Enter"]);
      expect(calls.every(([, target]) => target === div)).toBe(true);
    });

    test("gives an object ref its `div`", async () => {
      const ref = createRef<HTMLDivElement>();
      await mount(withHeaderAndFooter(multiple, { [part]: { ref } }));

      expect(ref.current).toBe(partDiv(text));
    });

    test("calls a callback ref with its `div`, then with `null` on unmount", async () => {
      const calls: (HTMLDivElement | null)[] = [];
      const ref = (node: HTMLDivElement | null) => {
        calls.push(node);
      };
      await mount(withHeaderAndFooter(multiple, { [part]: { ref } }));
      const div = partDiv(text);

      expect(calls).toHaveLength(1);
      expect(calls[0]).toBe(div);

      await unmounts.pop()!();
      expect(calls).toHaveLength(2);
      expect(calls[1]).toBeNull();
    });
  });

  // Without props of their own, the header, footer, group title and items
  // render the wrappers they always have
  test("keeps its wrappers' markup without extra props", async () => {
    await mount(withHeaderAndFooter(multiple));

    for (const { text, classes } of parts) {
      expect(partDiv(text).tagName).toBe("DIV");
      expect(attributes(partDiv(text))).toEqual({ class: classes });
      expect(partDiv(text).innerHTML).toBe(text);
    }

    // The group title is what names the group. The items' own attributes
    // aren't checked here.
    const group = document.querySelector('[role="group"]')!;
    const title = document.getElementById(
      group.getAttribute("aria-labelledby")!,
    )!;
    expect(title.textContent).toBe("Fruits");
    const options = [...document.querySelectorAll('[role="option"]')];
    expect(options.map((option) => option.textContent)).toEqual([
      "Apple",
      "Banana",
      "Cherry",
    ]);

    for (const wrapped of [title, ...options]) {
      const wrapper = wrapped.parentElement!;
      expect(wrapper.tagName).toBe("DIV");
      expect(attributes(wrapper)).toEqual({ class: "px-1" });
      expect(wrapper.children).toHaveLength(1);
    }
  });
});

/*========================================================================================================================*/

type ContentProps = ComponentProps<typeof SelectContent>;

// A closed Select of two fruits, which leaves its `open` to Select, with
// `content` on its SelectContent. A paragraph beside it is what a press
// outside the list lands on.
const closed = (
  multiple: boolean,
  { content, ...props }: Partial<SelectProps> & { content?: ContentProps } = {},
) =>
  createElement(
    "div",
    null,
    createElement("p", null, "Outside"),
    createElement(
      Select,
      { ...props, multiple } as SelectProps,
      createElement(
        SelectTrigger,
        { "aria-label": "Fruit" },
        createElement(SelectValue, { placeholder: "Select a fruit" }),
      ),
      createElement(
        SelectContent,
        content,
        createElement(SelectItem, { value: "apple" }, "Apple"),
        createElement(SelectItem, { value: "banana" }, "Banana"),
      ),
    ),
  );

const trigger = () => document.querySelector<HTMLElement>('[role="combobox"]')!;

const listbox = () => document.querySelector('[role="listbox"]');

// Waits for what Radix does on a timer: listening for presses outside the
// list once it opens, and moving focus once it closes
const settle = () =>
  act(() => new Promise((resolve) => setTimeout(resolve, 20)));

// Opens the list by clicking the trigger
async function openList() {
  await act(async () => trigger().click());
  await settle();
  expect(listbox()).not.toBeNull();
  expect(trigger().getAttribute("aria-expanded")).toBe("true");
}

// Presses the primary button of a mouse on the paragraph outside the list,
// and returns the `pointerdown` it dispatches
async function pressOutside() {
  const outside = [...document.querySelectorAll("p")].find(
    (p) => p.textContent === "Outside",
  )!;
  const pointerdown = new PointerEvent("pointerdown", {
    bubbles: true,
    cancelable: true,
    button: 0,
    pointerType: "mouse",
  });
  await act(async () => void outside.dispatchEvent(pointerdown));
  await settle();
  return pointerdown;
}

// Presses Escape where focus is, in the open list
async function pressEscape() {
  await act(
    async () =>
      void document.activeElement!.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Escape",
          bubbles: true,
          cancelable: true,
        }),
      ),
  );
  await settle();
}

// An `onPointerDownOutside` that lets the list close, and none at all
const outsideHandlers = [
  ["an `onPointerDownOutside` that doesn't call `preventDefault()`", () => {}],
  ["no `onPointerDownOutside`", undefined],
] as const;

describe.each(kinds)(
  "in %s Select with its list open, a press outside the list",
  (_, multiple) => {
    test("calls SelectContent's `onPointerDownOutside` once, with Radix's cancelable event for the `pointerdown`", async () => {
      const events: Event[] = [];
      await mount(
        closed(multiple, {
          content: { onPointerDownOutside: (event) => events.push(event) },
        }),
      );
      await openList();

      const pointerdown = await pressOutside();

      expect(events).toHaveLength(1);
      const event = events[0] as CustomEvent<{ originalEvent: PointerEvent }>;
      expect(event).toBeInstanceOf(CustomEvent);
      expect(event.cancelable).toBe(true);
      expect(event.detail.originalEvent).toBe(pointerdown);
    });

    test("leaves the list open when `onPointerDownOutside` calls `preventDefault()`", async () => {
      const onOpenChange = vi.fn();
      await mount(
        closed(multiple, {
          onOpenChange,
          content: { onPointerDownOutside: (event) => event.preventDefault() },
        }),
      );
      await openList();

      await pressOutside();

      expect(listbox()).not.toBeNull();
      expect(trigger().getAttribute("aria-expanded")).toBe("true");
      expect(onOpenChange).not.toHaveBeenCalledWith(false);
    });

    test.each(outsideHandlers)(
      "closes the list with %s",
      async (_, handler) => {
        await mount(
          closed(multiple, { content: { onPointerDownOutside: handler } }),
        );
        await openList();

        await pressOutside();

        expect(listbox()).toBeNull();
        expect(trigger().getAttribute("aria-expanded")).toBe("false");
      },
    );

    test("calls SelectContent's `onCloseAutoFocus` once, and focus returns to the trigger", async () => {
      const onCloseAutoFocus = vi.fn();
      await mount(closed(multiple, { content: { onCloseAutoFocus } }));
      await openList();
      expect(document.activeElement).not.toBe(trigger());

      await pressOutside();

      expect(onCloseAutoFocus).toHaveBeenCalledTimes(1);
      expect(document.activeElement).toBe(trigger());
    });
  },
);

describe("in a single Select with its list open", () => {
  test.each(outsideHandlers)(
    "a press outside the list calls `onOpenChange` once, with `false`, with %s",
    async (_, handler) => {
      const onOpenChange = vi.fn();
      await mount(
        closed(false, {
          onOpenChange,
          content: { onPointerDownOutside: handler },
        }),
      );
      await openList();
      onOpenChange.mockClear();

      await pressOutside();

      expect(onOpenChange.mock.calls).toEqual([[false]]);
    },
  );

  test("Escape calls SelectContent's `onEscapeKeyDown` once and closes the list", async () => {
    const keys: string[] = [];
    await mount(
      closed(false, {
        content: { onEscapeKeyDown: (event) => keys.push(event.key) },
      }),
    );
    await openList();

    await pressEscape();

    expect(keys).toEqual(["Escape"]);
    expect(listbox()).toBeNull();
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
  });

  test("Escape leaves the list open when `onEscapeKeyDown` calls `preventDefault()`", async () => {
    const onOpenChange = vi.fn();
    await mount(
      closed(false, {
        onOpenChange,
        content: { onEscapeKeyDown: (event) => event.preventDefault() },
      }),
    );
    await openList();

    await pressEscape();

    expect(listbox()).not.toBeNull();
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  test("Escape calls SelectContent's `onCloseAutoFocus` once, and focus returns to the trigger", async () => {
    const onCloseAutoFocus = vi.fn();
    await mount(closed(false, { content: { onCloseAutoFocus } }));
    await openList();
    expect(document.activeElement).not.toBe(trigger());

    await pressEscape();

    expect(onCloseAutoFocus).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(trigger());
  });
});
