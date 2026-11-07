// @vitest-environment happy-dom
import {
  act,
  createElement,
  createRef,
  StrictMode,
  useState,
  type ComponentProps,
  type ReactElement,
} from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { ThemeProvider } from "../hooks/use-theme";
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
import { ThemeSwitch } from "./theme-switch";

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

/*========================================================================================================================*/

// Opening and closing the list. `open` controls it when it isn't
// `undefined`; otherwise Select keeps the state, starting from `defaultOpen`.
// Each request to open or close calls `onOpenChange`, except the close that
// follows a pick in a `multiple` select, which stays open (#132).

const FRUITS = [
  ["apple", "Apple"],
  ["banana", "Banana"],
  ["cherry", "Cherry"],
] as const;

// A Select of three fruits with `props`, beside a paragraph that a press
// outside the list lands on
const fruits = (props: Partial<SelectProps> = {}) =>
  createElement(
    "div",
    null,
    createElement("p", null, "Outside"),
    createElement(
      Select,
      props as SelectProps,
      createElement(
        SelectTrigger,
        { "aria-label": "Fruit" },
        createElement(SelectValue, { placeholder: "Select a fruit" }),
      ),
      createElement(
        SelectContent,
        null,
        FRUITS.map(([value, label]) =>
          createElement(SelectItem, { key: value, value }, label),
        ),
      ),
    ),
  );

// A parent that holds `open`, from `false`, and passes back each state
// `onOpenChange` asks for
function Following({ onOpenChange, ...props }: Partial<SelectProps>) {
  const [open, setOpen] = useState(false);
  return fruits({
    ...props,
    open,
    onOpenChange: (next: boolean) => {
      onOpenChange?.(next);
      setOpen(next);
    },
  } as Partial<SelectProps>);
}

// Mounts `element` as `mount` does, and returns a function that renders
// another element in its place, as a parent's new props do
async function mountRerenderable(element: ReactElement) {
  const container = document.body.appendChild(document.createElement("div"));
  const root = createRoot(container);
  unmounts.push(async () => {
    await act(async () => root.unmount());
    container.remove();
  });
  await act(async () => root.render(element));
  return (next: ReactElement) => act(async () => root.render(next));
}

// Whether the list shows: the trigger's `aria-expanded` and `data-state`, and
// whether the listbox renders
const shown = () => ({
  expanded: trigger().getAttribute("aria-expanded"),
  state: trigger().getAttribute("data-state"),
  listbox: listbox() !== null,
});

const OPEN = { expanded: "true", state: "open", listbox: true };
const CLOSED = { expanded: "false", state: "closed", listbox: false };

// The open list's item labelled `label`
function option(label: string) {
  const found = [
    ...document.querySelectorAll<HTMLElement>('[role="option"]'),
  ].find((item) => item.textContent === label);
  expect(found, `the item "${label}"`).toBeDefined();
  return found!;
}

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

// Focuses the trigger, as a Tab to it does, and presses `key` on it
async function pressOnTrigger(key: string) {
  await act(async () => trigger().focus());
  await press(trigger(), key);
}

// A mouse's pointer event of `type` with its primary button, at `x` and `y`
// on the page. happy-dom has no layout, so it leaves an event's `pageX` and
// `pageY`, which Radix reads, at 0.
function mouse(type: string, x = 0, y = 0) {
  const event = new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    button: 0,
    pointerType: "mouse",
    clientX: x,
    clientY: y,
  });
  Object.defineProperties(event, { pageX: { value: x }, pageY: { value: y } });
  return event;
}

// Presses the primary button of a mouse on `target`, without releasing it
async function mouseDown(target: Element) {
  await act(async () => void target.dispatchEvent(mouse("pointerdown")));
  await settle();
}

// Fires `type` on the window, as the browser does when the window loses
// focus or changes size
async function windowEvent(type: "blur" | "resize") {
  await act(async () => void window.dispatchEvent(new Event(type)));
  await settle();
}

// The requests to open the closed list, each made on its trigger
const openRequests = [
  [
    "a click on the trigger",
    async () => {
      await act(async () => trigger().click());
      await settle();
    },
  ],
  ["a mouse press on the trigger", () => mouseDown(trigger())],
  ["Enter on the focused trigger", () => pressOnTrigger("Enter")],
  ["Space on the focused trigger", () => pressOnTrigger(" ")],
  ["ArrowDown on the focused trigger", () => pressOnTrigger("ArrowDown")],
  ["ArrowUp on the focused trigger", () => pressOnTrigger("ArrowUp")],
] as const;

// The requests to close the open list that a single and a `multiple` select
// share
const closeRequests = [
  ["Escape", pressEscape],
  ["a press outside the list", pressOutside],
  ["a window `blur`", () => windowEvent("blur")],
  ["a window `resize`", () => windowEvent("resize")],
] as const;

// The ways a visitor picks the item labelled `label` in the open list
const picks = [
  [
    "a click",
    async (label: string) => {
      await act(async () => option(label).click());
      await settle();
    },
  ],
  [
    "a mouse press and release",
    // The mouse moves onto the item, away from the trigger, first. Until the
    // pointer moves from where the list was opened, Radix takes a release for
    // the end of the press that opened it, and ignores it.
    async (label: string) => {
      await act(async () => {
        for (const type of ["pointermove", "pointerdown", "pointerup"])
          option(label).dispatchEvent(mouse(type, 100, 100));
      });
      await settle();
    },
  ],
  [
    "Enter",
    async (label: string) => {
      await act(async () => option(label).focus());
      await press(option(label), "Enter");
    },
  ],
  [
    "Space",
    async (label: string) => {
      await act(async () => option(label).focus());
      await press(option(label), " ");
    },
  ],
] as const;

describe.each(kinds)(
  "%s Select with `open={false}` and a parent that ignores `onOpenChange`",
  (_, multiple) => {
    test.each(openRequests)(
      "%s calls `onOpenChange(true)` once and leaves the list closed",
      async (_, request) => {
        const onOpenChange = vi.fn();
        await mount(fruits({ multiple, open: false, onOpenChange }));

        await request();

        expect(onOpenChange.mock.calls).toEqual([[true]]);
        expect(shown()).toEqual(CLOSED);
      },
    );
  },
);

describe.each(kinds)(
  "%s Select with `open={true}` and a parent that ignores `onOpenChange`",
  (_, multiple) => {
    test("shows the list from mount", async () => {
      await mount(fruits({ multiple, open: true }));
      await settle();

      expect(shown()).toEqual(OPEN);
    });

    test.each(closeRequests)(
      "%s calls `onOpenChange(false)` once and leaves the list open",
      async (_, request) => {
        const onOpenChange = vi.fn();
        await mount(fruits({ multiple, open: true, onOpenChange }));
        await settle();

        await request();

        expect(onOpenChange.mock.calls).toEqual([[false]]);
        expect(shown()).toEqual(OPEN);
      },
    );

    test("never calls `onOpenChange(true)` while the list is open", async () => {
      const onOpenChange = vi.fn();
      await mount(fruits({ multiple, open: true, onOpenChange }));
      await settle();

      await act(async () => trigger().click());
      await press(trigger(), "Enter");

      expect(onOpenChange).not.toHaveBeenCalled();
    });
  },
);

describe("a single Select with `open={true}` and a parent that ignores `onOpenChange`", () => {
  test.each(picks)(
    "a pick by %s calls `onValueChange`, then `onOpenChange(false)` once, and leaves the list open",
    async (_, pick) => {
      const calls: unknown[][] = [];
      await mount(
        fruits({
          open: true,
          onValueChange: (value: string) => calls.push(["value", value]),
          onOpenChange: (open: boolean) => calls.push(["open", open]),
        }),
      );
      await settle();

      await pick("Banana");

      expect(calls).toEqual([
        ["value", "banana"],
        ["open", false],
      ]);
      expect(shown()).toEqual(OPEN);
    },
  );
});

describe("a `multiple` Select with `open={true}` and a parent that ignores `onOpenChange`", () => {
  test.each(picks)(
    "a pick by %s calls `onValueChange` but not `onOpenChange`, and leaves the list open",
    async (_, pick) => {
      const onValueChange = vi.fn();
      const onOpenChange = vi.fn();
      await mount(
        fruits({ multiple: true, open: true, onValueChange, onOpenChange }),
      );
      await settle();

      await pick("Banana");

      expect(onValueChange.mock.calls).toEqual([[["banana"]]]);
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(shown()).toEqual(OPEN);
    },
  );
});

describe.each(kinds)(
  "%s Select whose parent passes back what `onOpenChange` asks for",
  (_, multiple) => {
    test.each(closeRequests)(
      "opens from the trigger and closes on %s, calling `onOpenChange(true)` then `onOpenChange(false)`",
      async (_, request) => {
        const onOpenChange = vi.fn();
        await mount(createElement(Following, { multiple, onOpenChange }));
        expect(shown()).toEqual(CLOSED);

        await openList();
        expect(onOpenChange.mock.calls).toEqual([[true]]);

        await request();
        expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
        expect(shown()).toEqual(CLOSED);
      },
    );

    test("closes on releasing, outside the list, a mouse press that started on the trigger and moved away", async () => {
      const onOpenChange = vi.fn();
      await mount(createElement(Following, { multiple, onOpenChange }));
      await mouseDown(trigger());
      expect(shown()).toEqual(OPEN);

      const outside = document.querySelector("p")!;
      await act(async () => {
        outside.dispatchEvent(mouse("pointermove", 200, 200));
        outside.dispatchEvent(mouse("pointerup", 200, 200));
      });
      await settle();

      expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
      expect(shown()).toEqual(CLOSED);
    });
  },
);

describe("a single Select whose parent passes back what `onOpenChange` asks for", () => {
  test.each(picks)(
    "closes on a pick by %s, calling `onOpenChange(false)`",
    async (_, pick) => {
      const onOpenChange = vi.fn();
      await mount(createElement(Following, { onOpenChange }));
      await openList();

      await pick("Banana");

      expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
      expect(shown()).toEqual(CLOSED);
    },
  );
});

describe("a `multiple` Select whose parent passes back what `onOpenChange` asks for", () => {
  test.each(picks)(
    "stays open after a pick by %s, calling no `onOpenChange`, and a following Escape closes it with one `onOpenChange(false)`",
    async (_, pick) => {
      const onOpenChange = vi.fn();
      const onValueChange = vi.fn();
      await mount(
        createElement(Following, {
          multiple: true,
          onOpenChange,
          onValueChange,
        }),
      );
      await openList();
      onOpenChange.mockClear();

      await pick("Banana");
      expect(onValueChange.mock.calls).toEqual([[["banana"]]]);
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(shown()).toEqual(OPEN);

      await pressEscape();
      expect(onOpenChange.mock.calls).toEqual([[false]]);
      expect(shown()).toEqual(CLOSED);
    },
  );

  test("stays open after picks by click, Enter and Space in turn, then closes on Escape", async () => {
    const onOpenChange = vi.fn();
    const onValueChange = vi.fn();
    await mount(
      createElement(Following, { multiple: true, onOpenChange, onValueChange }),
    );
    await openList();
    onOpenChange.mockClear();

    await picks[0][1]("Apple");
    await picks[2][1]("Banana");
    await picks[3][1]("Cherry");
    expect(onValueChange.mock.calls).toEqual([
      [["apple"]],
      [["apple", "banana"]],
      [["apple", "banana", "cherry"]],
    ]);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(shown()).toEqual(OPEN);

    await pressEscape();
    expect(onOpenChange.mock.calls).toEqual([[false]]);
    expect(shown()).toEqual(CLOSED);
  });
});

describe.each(kinds)(
  "%s Select without `open` or `defaultOpen`",
  (_, multiple) => {
    test("starts closed", async () => {
      await mount(fruits({ multiple }));

      expect(shown()).toEqual(CLOSED);
    });

    test.each(openRequests)(
      "opens on %s, calling `onOpenChange(true)` once",
      async (_, request) => {
        const onOpenChange = vi.fn();
        await mount(fruits({ multiple, onOpenChange }));

        await request();

        expect(onOpenChange.mock.calls).toEqual([[true]]);
        expect(shown()).toEqual(OPEN);
      },
    );

    test.each(closeRequests)(
      "closes on %s, calling `onOpenChange(false)` once",
      async (_, request) => {
        const onOpenChange = vi.fn();
        await mount(fruits({ multiple, onOpenChange }));
        await openList();
        onOpenChange.mockClear();

        await request();

        expect(onOpenChange.mock.calls).toEqual([[false]]);
        expect(shown()).toEqual(CLOSED);
      },
    );
  },
);

describe("a single Select without `open`", () => {
  test.each(picks)(
    "closes on a pick by %s, calling `onOpenChange(false)` once",
    async (_, pick) => {
      const onOpenChange = vi.fn();
      await mount(fruits({ onOpenChange }));
      await openList();
      onOpenChange.mockClear();

      await pick("Banana");

      expect(onOpenChange.mock.calls).toEqual([[false]]);
      expect(shown()).toEqual(CLOSED);
    },
  );
});

describe("a `multiple` Select without `open`", () => {
  test.each(picks)(
    "stays open after a pick by %s, calling no `onOpenChange`",
    async (_, pick) => {
      const onOpenChange = vi.fn();
      await mount(fruits({ multiple: true, onOpenChange }));
      await openList();
      onOpenChange.mockClear();

      await pick("Banana");

      expect(onOpenChange).not.toHaveBeenCalled();
      expect(shown()).toEqual(OPEN);
    },
  );
});

describe.each(kinds)("%s Select with `defaultOpen`", (_, multiple) => {
  test("renders its trigger expanded in server HTML", () => {
    const html = document.createElement("div");
    html.innerHTML = renderToString(fruits({ multiple, defaultOpen: true }));
    const combobox = html.querySelector('[role="combobox"]');

    expect(combobox?.getAttribute("aria-expanded")).toBe("true");
    expect(combobox?.getAttribute("data-state")).toBe("open");
  });

  test("hydrates its server HTML with the list shown and no recoverable error", async () => {
    const tree = fruits({ multiple, defaultOpen: true });
    const container = document.body.appendChild(document.createElement("div"));
    container.innerHTML = renderToString(tree);
    const recoverable: unknown[] = [];
    let root: ReturnType<typeof hydrateRoot> | undefined;
    unmounts.push(async () => {
      await act(async () => root?.unmount());
      container.remove();
    });

    await act(async () => {
      root = hydrateRoot(container, tree, {
        onRecoverableError: (error) => void recoverable.push(error),
      });
    });
    await settle();

    expect(recoverable).toEqual([]);
    expect(shown()).toEqual(OPEN);
  });

  test("shows the list from mount, and closes it on Escape, calling `onOpenChange(false)` once", async () => {
    const onOpenChange = vi.fn();
    await mount(fruits({ multiple, defaultOpen: true, onOpenChange }));
    await settle();
    expect(shown()).toEqual(OPEN);

    await pressEscape();

    expect(onOpenChange.mock.calls).toEqual([[false]]);
    expect(shown()).toEqual(CLOSED);
  });

  test("ignores a later change to `defaultOpen`", async () => {
    const rerender = await mountRerenderable(
      fruits({ multiple, defaultOpen: true }),
    );
    await settle();

    await rerender(fruits({ multiple, defaultOpen: false }));
    await settle();

    expect(shown()).toEqual(OPEN);
  });

  test("stays closed under `open={false}`", async () => {
    await mount(fruits({ multiple, defaultOpen: true, open: false }));
    await settle();

    expect(shown()).toEqual(CLOSED);
  });
});

describe("a `multiple` Select with `defaultOpen`", () => {
  test.each(picks)(
    "stays open after a first pick by %s, calling no `onOpenChange`",
    async (_, pick) => {
      const onOpenChange = vi.fn();
      await mount(fruits({ multiple: true, defaultOpen: true, onOpenChange }));
      await settle();

      await pick("Banana");

      expect(onOpenChange).not.toHaveBeenCalled();
      expect(shown()).toEqual(OPEN);
    },
  );
});

describe.each(kinds)("%s Select opened from the keyboard", (_, multiple) => {
  test("returns focus to the trigger when Escape closes the list", async () => {
    await mount(fruits({ multiple }));
    await pressOnTrigger("Enter");
    expect(shown()).toEqual(OPEN);
    expect(document.activeElement?.getAttribute("role")).toBe("option");

    await pressEscape();

    expect(shown()).toEqual(CLOSED);
    expect(document.activeElement).toBe(trigger());
  });
});

describe("a `multiple` Select opened from the keyboard", () => {
  test("returns focus to the trigger when Escape closes the list after a pick by Space", async () => {
    await mount(fruits({ multiple: true }));
    await pressOnTrigger("Enter");

    await picks[3][1]("Banana");
    expect(shown()).toEqual(OPEN);
    await pressEscape();

    expect(shown()).toEqual(CLOSED);
    expect(document.activeElement).toBe(trigger());
  });
});

// Radix's warning that Select's open state changes between controlled and
// uncontrolled
const isOpenStateWarning = ([message]: unknown[]) =>
  typeof message === "string" && message.startsWith("Select is changing from");

const openStateWarnings = () =>
  vi.mocked(console.warn).mock.calls.filter(isOpenStateWarning);

describe.each(kinds)(
  '%s Select logs no "Select is changing from" warning',
  (_, multiple) => {
    test("without `open`, mounted, opened and closed", async () => {
      await mount(fruits({ multiple }));
      await openList();
      await pressEscape();

      expect(openStateWarnings()).toEqual([]);
    });

    test("with `defaultOpen`, mounted, closed and opened", async () => {
      await mount(fruits({ multiple, defaultOpen: true }));
      await settle();
      await pressEscape();
      await openList();

      expect(openStateWarnings()).toEqual([]);
    });

    test("with `open` its parent follows, mounted, opened and closed", async () => {
      await mount(createElement(Following, { multiple }));
      await openList();
      await pressEscape();

      expect(openStateWarnings()).toEqual([]);
    });

    test("in `StrictMode`, mounted, opened and closed", async () => {
      await mount(createElement(StrictMode, null, fruits({ multiple })));
      await openList();
      await pressEscape();

      expect(openStateWarnings()).toEqual([]);
    });
  },
);

describe("ThemeSwitch as a select", () => {
  test('logs no "Select is changing from" warning, mounted, opened and closed', async () => {
    await mount(
      createElement(
        ThemeProvider,
        null,
        createElement(ThemeSwitch, { as: "select" }),
      ),
    );
    await openList();
    await pressEscape();

    expect(openStateWarnings()).toEqual([]);
  });
});
