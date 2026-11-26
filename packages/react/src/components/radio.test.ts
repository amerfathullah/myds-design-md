// @vitest-environment happy-dom
// RadioHintText is its item's description, not part of its name (#173). It
// renders a `<div>`, and the RadioButton in the same RadioItem points
// `aria-describedby` at it by itself, so the radio is named by its RadioLabel
// alone and described by its hints. Before, the hint was a second `<label>` of
// the radio, which put its text in the name and selected the radio on a click.
import {
  act,
  createElement,
  createRef,
  StrictMode,
  useState,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import {
  computeAccessibleDescription,
  computeAccessibleName,
} from "dom-accessibility-api";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
  Radio,
  RadioButton,
  RadioHintText,
  RadioItem,
  RadioLabel,
} from "./radio";
import { sharedContext } from "../utils/registry";

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

type RadioProps = ComponentProps<typeof Radio>;
type ButtonProps = Partial<ComponentProps<typeof RadioButton>>;
// A hint's props, and a `data-hint` the tests find it by
type HintProps = ComponentProps<typeof RadioHintText> & {
  "data-hint"?: string;
};

// One option, composed as the docs compose it: a RadioButton with the id its
// RadioLabel points at, and the label and hints stacked beside it. Each hint
// is made with `hint()`, so the tests find it.
const option = (
  value: string,
  {
    button = {},
    hints = [],
    disabled,
  }: { button?: ButtonProps; hints?: HintProps[]; disabled?: boolean } = {},
): ReactElement =>
  createElement(
    RadioItem,
    { key: value, disabled },
    createElement(RadioButton, { value, id: value, ...button }),
    createElement(
      "div",
      { className: "grid" },
      createElement(RadioLabel, { htmlFor: value }, label(value)),
      ...hints.map(({ children, ...props }, index) =>
        hint(children, { key: String(index), ...props }),
      ),
    ),
  );

// A RadioHintText reading `text`, marked with `data-hint` so the tests find it
function hint(
  text: ReactNode,
  { key, ...props }: HintProps & { key?: string } = {},
): ReactElement {
  const marked: HintProps = { "data-hint": "", ...props };
  return createElement(RadioHintText, { key, ...marked }, text);
}

// What an option's label reads, e.g. "Email" for `email`
const label = (value: string) => value[0]!.toUpperCase() + value.slice(1);

const radio = (props: RadioProps, ...options: ReactNode[]): ReactElement =>
  createElement(Radio, props, ...options);

// The radio button whose value is `value`
function button(within: ParentNode, value: string) {
  const found = within.querySelector<HTMLButtonElement>(
    `[role="radio"][value="${value}"]`,
  );
  expect(found, `no radio ${value}`).not.toBeNull();
  return found!;
}

// Each hint in the RadioItem of `value`'s radio, in document order
const hints = (within: ParentNode, value: string) => [
  ...button(within, value).parentElement!.querySelectorAll<HTMLElement>(
    "[data-hint]",
  ),
];

const describedBy = (element: Element) =>
  element.getAttribute("aria-describedby");

const name = (element: Element) => computeAccessibleName(element);
const description = (element: Element) => computeAccessibleDescription(element);

describe("a RadioHintText in a RadioItem", () => {
  test("describes the radio, which its RadioLabel alone names", async () => {
    const { container } = await mount(
      radio(
        {},
        option("email", {
          hints: [{ children: "We will email you." }],
        }),
        option("post"),
      ),
    );
    const email = button(container, "email");
    expect(name(email)).toBe("Email");
    expect(description(email)).toBe("We will email you.");
    const [hint] = hints(container, "email");
    expect(describedBy(email)).toBe(hint!.id);
    expect(name(button(container, "post"))).toBe("Post");
  });

  test("renders a `<div>`, never a `for` or a `form`, even when given `htmlFor` and `form`", async () => {
    const { container } = await mount(
      radio(
        {},
        option("email", {
          hints: [
            {
              children: "We will email you.",
              htmlFor: "email",
              form: "notifications",
            },
          ],
        }),
      ),
    );
    const [hint] = hints(container, "email");
    expect(hint!.tagName).toBe("DIV");
    expect(hint!.hasAttribute("for")).toBe(false);
    expect(hint!.hasAttribute("form")).toBe(false);
    expect(container.querySelectorAll("label")).toHaveLength(1);
    // Its text is in the description, not in the name
    const email = button(container, "email");
    expect(name(email)).toBe("Email");
    expect(description(email)).toBe("We will email you.");
  });

  test("doesn't select the radio when clicked, even given `htmlFor`; its RadioLabel does", async () => {
    const onValueChange = vi.fn();
    const { container } = await mount(
      radio(
        { onValueChange },
        option("email", {
          hints: [
            {
              children: "We will email you.",
              htmlFor: "email",
            },
          ],
        }),
        option("post"),
      ),
    );
    const email = button(container, "email");
    const [hint] = hints(container, "email");
    await act(async () => hint!.click());
    expect(onValueChange).not.toHaveBeenCalled();
    expect(email.getAttribute("aria-checked")).toBe("false");
    await act(async () =>
      container.querySelector<HTMLLabelElement>('label[for="email"]')!.click(),
    );
    expect(onValueChange).toHaveBeenCalledWith("email");
    expect(email.getAttribute("aria-checked")).toBe("true");
  });

  test("passes its ref the `<div>`", async () => {
    const ref = createRef<HTMLElement>();
    const { container } = await mount(
      radio(
        {},
        option("email", {
          hints: [{ children: "We will email you.", ref }],
        }),
      ),
    );
    const [hint] = hints(container, "email");
    expect(ref.current).toBe(hint);
    expect(description(button(container, "email"))).toBe("We will email you.");
  });
});

describe("RadioButton's aria-describedby", () => {
  test("is left off when the item has no hint", async () => {
    const { container } = await mount(
      radio({}, option("email"), option("post", { button: {} })),
    );
    for (const value of ["email", "post"]) {
      expect(button(container, value).hasAttribute("aria-describedby")).toBe(
        false,
      );
      expect(description(button(container, value))).toBe("");
    }
  });

  test("lists the hint's id before the author's own ids", async () => {
    const { container } = await mount(
      createElement(
        "div",
        null,
        radio(
          {},
          option("email", {
            button: { "aria-describedby": "err" },
            hints: [{ children: "We will email you." }],
          }),
        ),
        createElement("p", { id: "err" }, "Choose one."),
      ),
    );
    const email = button(container, "email");
    const [hint] = hints(container, "email");
    expect(describedBy(email)).toBe(`${hint!.id} err`);
    expect(description(email)).toBe("We will email you. Choose one.");
  });

  test("keeps the hint's id when the author passes `aria-describedby={undefined}`", async () => {
    const { container } = await mount(
      radio(
        {},
        option("email", {
          button: { "aria-describedby": undefined },
          hints: [{ children: "We will email you." }],
        }),
      ),
    );
    const email = button(container, "email");
    const [hint] = hints(container, "email");
    expect(describedBy(email)).toBe(hint!.id);
    expect(description(email)).toBe("We will email you.");
  });

  test("lists a hand-wired hint's id once", async () => {
    const { container } = await mount(
      radio(
        {},
        option("email", {
          button: { "aria-describedby": "email-hint" },
          hints: [
            {
              children: "We will email you.",
              id: "email-hint",
            },
          ],
        }),
      ),
    );
    const email = button(container, "email");
    expect(describedBy(email)).toBe("email-hint");
    expect(description(email)).toBe("We will email you.");
  });

  test("lists each of the author's own ids once, after the hints'", async () => {
    const { container } = await mount(
      radio(
        {},
        option("email", {
          button: { "aria-describedby": "  a  b a  " },
          hints: [{ children: "Hint.", id: "b" }],
        }),
      ),
    );
    expect(describedBy(button(container, "email"))).toBe("b a");
  });
});

describe("the hint's id", () => {
  test("is the author's `id`, which the radio points at", async () => {
    const { container } = await mount(
      radio(
        {},
        option("email", {
          hints: [{ children: "We will email you.", id: "mine" }],
        }),
      ),
    );
    const [hint] = hints(container, "email");
    expect(hint!.id).toBe("mine");
    expect(describedBy(button(container, "email"))).toBe("mine");
  });

  test('is generated when left out or given `id=""`', async () => {
    const { container } = await mount(
      radio(
        {},
        option("email", {
          hints: [{ children: "We will email you.", id: "" }],
        }),
        option("post", {
          hints: [{ children: "We will post it." }],
        }),
      ),
    );
    for (const value of ["email", "post"]) {
      const [hint] = hints(container, value);
      expect(hint!.id).not.toBe("");
      expect(describedBy(button(container, value))).toBe(hint!.id);
    }
  });

  test("differs between two Radios' hints on one page", async () => {
    const group = (value: string) =>
      radio(
        { name: value },
        option(value, {
          hints: [{ children: `About ${value}.` }],
        }),
      );
    const { container } = await mount(
      createElement("div", null, group("email"), group("post")),
    );
    const [email] = hints(container, "email");
    const [post] = hints(container, "post");
    expect(email!.id).not.toBe(post!.id);
    expect(description(button(container, "email"))).toBe("About email.");
    expect(description(button(container, "post"))).toBe("About post.");
  });
});

describe("two hints in one item", () => {
  test("have different ids, and describe the radio in document order", async () => {
    const { container } = await mount(
      radio(
        {},
        option("email", {
          hints: [{ children: "First." }, { children: "Second." }],
        }),
      ),
    );
    const [first, second] = hints(container, "email");
    expect(first!.id).not.toBe(second!.id);
    const email = button(container, "email");
    expect(describedBy(email)).toBe(`${first!.id} ${second!.id}`);
    expect(description(email)).toBe("First. Second.");
  });

  test("describe it in document order when one mounts later in front of the other", async () => {
    const tree = (both: boolean) =>
      radio(
        {},
        createElement(
          RadioItem,
          null,
          createElement(RadioButton, { value: "email", id: "email" }),
          createElement(RadioLabel, { htmlFor: "email" }, "Email"),
          both && hint("First.", { key: "first" }),
          hint("Second.", { key: "second" }),
        ),
      );
    const { container, rerender } = await mount(tree(false));
    const email = button(container, "email");
    expect(description(email)).toBe("Second.");
    await rerender(tree(true));
    const [first, second] = hints(container, "email");
    expect(describedBy(email)).toBe(`${first!.id} ${second!.id}`);
    expect(description(email)).toBe("First. Second.");
  });

  test("describe it in their new order when they move without remounting", async () => {
    const tree = (order: readonly string[]) =>
      radio(
        {},
        createElement(
          RadioItem,
          null,
          createElement(RadioButton, { value: "email", id: "email" }),
          createElement(RadioLabel, { htmlFor: "email" }, "Email"),
          ...order.map((text) => hint(text, { key: text, id: text })),
        ),
      );
    const { container, rerender } = await mount(tree(["a", "b"]));
    const email = button(container, "email");
    expect(describedBy(email)).toBe("a b");
    await rerender(tree(["b", "a"]));
    expect(hints(container, "email").map(({ id }) => id)).toEqual(["b", "a"]);
    expect(describedBy(email)).toBe("b a");
  });

  test("describe it in their new order when a component inside the item moves them", async () => {
    let swap: () => void = () => {};
    // Holds its own order, so the RadioItem doesn't render again when it
    // changes
    function Hints() {
      const [order, setOrder] = useState(["a", "b"]);
      swap = () => setOrder(["b", "a"]);
      return order.map((text) => hint(text, { key: text, id: text }));
    }
    const { container } = await mount(
      radio(
        {},
        createElement(
          RadioItem,
          null,
          createElement(RadioButton, { value: "email", id: "email" }),
          createElement(RadioLabel, { htmlFor: "email" }, "Email"),
          createElement(Hints),
        ),
      ),
    );
    const email = button(container, "email");
    expect(describedBy(email)).toBe("a b");
    await act(async () => swap());
    expect(hints(container, "email").map(({ id }) => id)).toEqual(["b", "a"]);
    expect(describedBy(email)).toBe("b a");
  });
});

describe("aria-describedby follows the hints", () => {
  test("when a hint is removed", async () => {
    const tree = (withHint: boolean) =>
      radio(
        {},
        option("email", {
          hints: withHint ? [{ children: "We will email you." }] : [],
        }),
      );
    const { container, rerender } = await mount(tree(true));
    const email = button(container, "email");
    expect(description(email)).toBe("We will email you.");
    await rerender(tree(false));
    expect(email.hasAttribute("aria-describedby")).toBe(false);
    expect(description(email)).toBe("");
  });

  test("when a hint's id changes", async () => {
    const tree = (id: string) =>
      radio(
        {},
        option("email", {
          hints: [{ children: "We will email you.", id }],
        }),
      );
    const { container, rerender } = await mount(tree("one"));
    const email = button(container, "email");
    expect(describedBy(email)).toBe("one");
    await rerender(tree("two"));
    expect(describedBy(email)).toBe("two");
    expect(description(email)).toBe("We will email you.");
  });

  test("under StrictMode, listing each id once", async () => {
    const { container } = await mount(
      createElement(
        StrictMode,
        null,
        radio(
          {},
          option("email", {
            hints: [
              { children: "First." },
              { children: "Second.", id: "second" },
            ],
          }),
        ),
      ),
    );
    const email = button(container, "email");
    const [first] = hints(container, "email");
    expect(describedBy(email)).toBe(`${first!.id} second`);
    expect(description(email)).toBe("First. Second.");
  });
});

test("a RadioHintText outside any RadioItem renders its id and wires nothing", async () => {
  const { container } = await mount(
    createElement(
      "div",
      null,
      hint("On its own."),
      radio({}, option("email"), hint("In the group.")),
    ),
  );
  const outside = [...container.querySelectorAll<HTMLElement>("[data-hint]")];
  expect(outside).toHaveLength(2);
  for (const hint of outside) {
    expect(hint.tagName).toBe("DIV");
    expect(hint.id).not.toBe("");
  }
  expect(button(container, "email").hasAttribute("aria-describedby")).toBe(
    false,
  );
});

test("server-rendered, then hydrated, logs nothing, and each hinted radio has its description", async () => {
  const tree = radio(
    { defaultValue: "email" },
    option("email", {
      hints: [{ children: "We will email you." }],
    }),
    option("post", {
      hints: [
        { children: "We will post it." },
        { children: "It takes a week.", id: "week" },
      ],
    }),
    option("none"),
  );
  const container = serverRender(tree);
  expect(await hydrate(container, tree)).toEqual([]);
  expect(description(button(container, "email"))).toBe("We will email you.");
  expect(description(button(container, "post"))).toBe(
    "We will post it. It takes a week.",
  );
  expect(name(button(container, "post"))).toBe("Post");
  expect(button(container, "none").hasAttribute("aria-describedby")).toBe(
    false,
  );
});

// The classes the hint rendered as a `<label>` before #173
describe.each([
  ["small", "text-txt-black-500 text-xs", "text-xs text-otl-gray-300"],
  [
    "medium",
    "text-txt-black-500 text-body-sm",
    "text-body-sm text-otl-gray-300",
  ],
  [
    "large",
    "text-txt-black-500 text-body-md",
    "text-body-md text-otl-gray-300",
  ],
] as const)("the hint's classes at %s", (size, enabled, disabled) => {
  const classes = (props: RadioProps, itemDisabled?: boolean) => {
    const html = renderToStaticMarkup(
      radio(
        { size, ...props },
        option("email", {
          disabled: itemDisabled,
          hints: [{ children: "Hint" }],
        }),
      ),
    );
    const hint = html.match(/<(\w+)[^>]*data-hint[^>]*>/)!;
    expect(hint[1]).toBe("div");
    return hint[0].match(/\sclass="([^"]*)"/)?.[1];
  };

  test("are as before when enabled", () => {
    expect(classes({})).toBe(enabled);
  });

  test("are as before when the Radio or its RadioItem is disabled", () => {
    expect(classes({ disabled: true })).toBe(disabled);
    expect(classes({}, true)).toBe(disabled);
  });
});

// The RadioLabel that names the radio whose value is `value`
function labelOf(within: ParentNode, value: string) {
  const found = within.querySelector<HTMLLabelElement>(`label[for="${value}"]`);
  expect(found, `no label for ${value}`).not.toBeNull();
  return found!;
}

const labelDim = "text-txt-black-disabled";
const hintDim = "text-otl-gray-300";

// Whether the option of `value` looks and reads disabled: its radio button's
// `disabled`, whether its label and hint carry their dimmed classes, and its
// hint's `aria-disabled`
function state(within: ParentNode, value: string) {
  const [hint] = hints(within, value);
  return {
    radio: button(within, value).disabled,
    label: labelOf(within, value).classList.contains(labelDim),
    hint: hint!.classList.contains(hintDim),
    ariaDisabled: hint!.getAttribute("aria-disabled"),
  };
}

const dimmed = {
  radio: true,
  label: true,
  hint: true,
  ariaDisabled: "true",
};
const enabled = {
  radio: false,
  label: false,
  hint: false,
  ariaDisabled: null,
};

// A disabled option's hint is part of that inactive option, as its label is.
// It's marked `aria-disabled`, which assistive technology and accessibility
// checkers such as axe read as inherited, so axe exempts its dimmed colour
// from contrast, as it did when the hint was a label of the disabled radio.
// The option is disabled when its radio button is, as Radix makes it: by the
// Radio's `disabled`, or by the `disabled` the RadioButton passes, or else by
// its RadioItem's (#225).
describe("the hint's aria-disabled", () => {
  const hintOf = async (
    props: RadioProps,
    item?: boolean,
    own?: HintProps,
    buttonProps?: ButtonProps,
  ) => {
    const { container } = await mount(
      radio(
        props,
        option("email", {
          disabled: item,
          button: buttonProps,
          hints: [{ children: "We will email you.", ...own }],
        }),
      ),
    );
    return hints(container, "email")[0]!;
  };

  // Mounts the option "email", with a hint, and returns how it reads
  const stateOf = async (
    props: RadioProps,
    item?: boolean,
    buttonProps?: ButtonProps,
  ) => {
    const { container } = await mount(
      radio(
        props,
        option("email", {
          disabled: item,
          button: buttonProps,
          hints: [{ children: "We will email you." }],
        }),
      ),
    );
    return state(container, "email");
  };

  test('is "true" when the Radio or the hint\'s RadioItem is disabled', async () => {
    expect(
      (await hintOf({ disabled: true })).getAttribute("aria-disabled"),
    ).toBe("true");
    expect((await hintOf({}, true)).getAttribute("aria-disabled")).toBe("true");
  });

  test('is "true", and the label and hint dim, when the RadioButton alone is disabled', async () => {
    expect(await stateOf({}, undefined, { disabled: true })).toEqual(dimmed);
  });

  test('is "true", and the label and hint dim, when a disabled Radio\'s RadioItem passes `disabled={false}`, which Radix overrides (#357)', async () => {
    expect(await stateOf({ disabled: true }, false)).toEqual(dimmed);
  });

  test("is left off when the option is enabled", async () => {
    expect((await hintOf({})).hasAttribute("aria-disabled")).toBe(false);
  });

  test.each([
    ["`disabled={false}`", { disabled: false }],
    ["`disabled={undefined}`", { disabled: undefined }],
  ] as const)(
    "is left off, and nothing dims, when a disabled RadioItem's RadioButton passes %s, which enables its radio",
    async (_, buttonProps) => {
      expect(await stateOf({}, true, buttonProps)).toEqual(enabled);
    },
  );

  test("follows the RadioButton's `disabled` as it changes", async () => {
    const tree = (disabled: boolean) =>
      radio(
        {},
        option("email", {
          button: { disabled },
          hints: [{ children: "We will email you." }],
        }),
      );
    const { container, rerender } = await mount(tree(false));
    expect(state(container, "email")).toEqual(enabled);
    await rerender(tree(true));
    expect(state(container, "email")).toEqual(dimmed);
    await rerender(tree(false));
    expect(state(container, "email")).toEqual(enabled);
  });

  test("is the author's when they pass one", async () => {
    const hint = await hintOf({ disabled: true }, undefined, {
      "aria-disabled": false,
    });
    expect(hint.getAttribute("aria-disabled")).toBe("false");
  });

  test('is the author\'s `"true"` or `true` in an enabled option', async () => {
    for (const value of ["true", true] as const)
      expect(
        (await hintOf({}, undefined, { "aria-disabled": value })).getAttribute(
          "aria-disabled",
        ),
      ).toBe("true");
  });

  // The author then owns the hint's contrast, as with a disabled RadioItem
  test("is the author's `false` when the RadioButton alone is disabled, and the hint still dims", async () => {
    const hint = await hintOf(
      {},
      undefined,
      { "aria-disabled": false },
      { disabled: true },
    );
    expect(hint.getAttribute("aria-disabled")).toBe("false");
    expect(hint.classList.contains(hintDim)).toBe(true);
  });

  test("is kept when the author passes `aria-disabled={undefined}`, with the RadioItem or the RadioButton disabled", async () => {
    const own: HintProps = { "aria-disabled": undefined };
    expect((await hintOf({}, true, own)).getAttribute("aria-disabled")).toBe(
      "true",
    );
    expect(
      (await hintOf({}, undefined, own, { disabled: true })).getAttribute(
        "aria-disabled",
      ),
    ).toBe("true");
  });
});

describe("a RadioLabel and RadioHintText", () => {
  test("carry the data attributes their RadioItem dims them by", async () => {
    const { container } = await mount(
      radio({}, option("email", { hints: [{ children: "Hint." }] })),
    );
    expect(labelOf(container, "email").getAttribute("data-radio-label")).toBe(
      "",
    );
    expect(hints(container, "email")[0]!.getAttribute("data-radio-hint")).toBe(
      "",
    );
  });

  // A RadioButton in a Radio nested in an option doesn't speak for that
  // option, which its own RadioButton does
  test.each([
    ["its own `disabled`", {}, { disabled: true }],
    ["the nested Radio's `disabled`", { disabled: true }, {}],
  ] as const)(
    "in an enabled option stay enabled when its grid holds a nested Radio with a bare RadioButton disabled by %s",
    async (_, innerRadio, innerButton) => {
      const { container } = await mount(
        radio(
          {},
          createElement(
            RadioItem,
            null,
            createElement(RadioButton, { value: "outer", id: "outer" }),
            createElement(
              "div",
              { className: "grid" },
              createElement(RadioLabel, { htmlFor: "outer" }, "Outer"),
              hint("About outer."),
              radio(
                { name: "inner", ...innerRadio },
                createElement(RadioButton, {
                  value: "inner",
                  id: "inner",
                  ...innerButton,
                }),
              ),
            ),
          ),
        ),
      );
      expect(button(container, "inner").disabled).toBe(true);
      expect(state(container, "outer")).toEqual(enabled);
    },
  );

  test("in a disabled option dim, and a bare RadioButton in a nested Radio there inherits the option's `disabled`", async () => {
    const { container } = await mount(
      radio(
        {},
        createElement(
          RadioItem,
          { disabled: true },
          createElement(RadioButton, { value: "outer", id: "outer" }),
          createElement(
            "div",
            { className: "grid" },
            createElement(RadioLabel, { htmlFor: "outer" }, "Outer"),
            hint("About outer."),
            radio(
              { name: "inner" },
              createElement(RadioButton, { value: "inner", id: "inner" }),
            ),
          ),
        ),
      ),
    );
    expect(button(container, "inner").disabled).toBe(true);
    expect(state(container, "outer")).toEqual(dimmed);
  });

  test("in one RadioItem with two RadioButtons, which isn't supported, render without an error", async () => {
    const { container } = await mount(
      radio(
        {},
        createElement(
          RadioItem,
          null,
          createElement(RadioButton, { value: "a", id: "a", disabled: true }),
          createElement(RadioButton, { value: "b", id: "b" }),
          createElement(RadioLabel, { htmlFor: "a" }, "A"),
          hint("About a."),
        ),
      ),
    );
    expect(button(container, "a").disabled).toBe(true);
    expect(button(container, "b").disabled).toBe(false);
  });
});

// RadioItemContext as an older copy's RadioItem provides it, with `disabled`
// alone. The registry holds the one context of that name, which an older
// copy, loaded first, makes.
const OlderItemContext = sharedContext<{ disabled: boolean }>(
  "RadioItemContext",
  { disabled: false },
);

describe("under an older copy's RadioItem, whose context holds only `disabled`", () => {
  const olderOption = (
    disabled: boolean,
    own?: HintProps,
    {
      group = {},
      buttonProps = {},
    }: { group?: RadioProps; buttonProps?: ButtonProps } = {},
  ) =>
    radio(
      group,
      createElement(
        OlderItemContext.Provider,
        { value: { disabled } },
        createElement(
          "div",
          { className: "flex items-center gap-3" },
          createElement(RadioButton, {
            value: "email",
            id: "email",
            ...buttonProps,
          }),
          createElement(
            "div",
            { className: "grid" },
            createElement(RadioLabel, { htmlFor: "email" }, "Email"),
            hint("We will email you.", own),
          ),
        ),
      ),
    );

  // The label's and hint's classes and the hint's `aria-disabled`, as before
  // #225
  test.each([
    [
      "disabled",
      true,
      "font-medium text-body-md text-txt-black-disabled",
      "text-body-sm text-otl-gray-300",
      "true",
    ],
    [
      "enabled",
      false,
      "text-txt-black-700 font-medium text-body-md",
      "text-txt-black-500 text-body-sm",
      null,
    ],
  ] as const)(
    "a RadioLabel and RadioHintText are as before when %s",
    async (_, disabled, labelClasses, hintClasses, ariaDisabled) => {
      const { container } = await mount(olderOption(disabled));
      expect(labelOf(container, "email").className).toBe(labelClasses);
      const [hint] = hints(container, "email");
      expect(hint!.className).toBe(hintClasses);
      expect(hint!.getAttribute("aria-disabled")).toBe(ariaDisabled);
    },
  );

  // As before #225, the text follows the older context's `disabled` alone,
  // though the radio is disabled: the CSS RadioItem dims it by is missing too
  test.each([
    [
      "a disabled Radio's item passes `disabled: false` (#357)",
      { group: { disabled: true } },
    ],
    ["the RadioButton alone is disabled", { buttonProps: { disabled: true } }],
  ] as const)(
    "a RadioLabel and RadioHintText are as before, undimmed and unmarked, when %s",
    async (_, options) => {
      const { container } = await mount(olderOption(false, {}, options));
      expect(button(container, "email").disabled).toBe(true);
      expect(labelOf(container, "email").className).toBe(
        "text-txt-black-700 font-medium text-body-md",
      );
      const [hint] = hints(container, "email");
      expect(hint!.className).toBe("text-txt-black-500 text-body-sm");
      expect(hint!.hasAttribute("aria-disabled")).toBe(false);
    },
  );

  test("a RadioHintText keeps its `aria-disabled` when the author passes `aria-disabled={undefined}`", async () => {
    const { container } = await mount(
      olderOption(true, { "aria-disabled": undefined }),
    );
    expect(hints(container, "email")[0]!.getAttribute("aria-disabled")).toBe(
      "true",
    );
  });
});

describe("server-rendered, then hydrated, a disabled option logs nothing", () => {
  test("and with the RadioButton alone disabled, its hint is marked once the RadioButton reports it", async () => {
    const tree = radio(
      {},
      option("email", {
        button: { disabled: true },
        hints: [{ children: "We will email you." }],
      }),
    );
    const container = serverRender(tree);
    // Not dimmed before it's marked, so checkers never see it unexempt
    const [hint] = hints(container, "email");
    expect(hint!.hasAttribute("aria-disabled")).toBe(false);
    expect(hint!.classList.contains(hintDim)).toBe(false);
    expect(await hydrate(container, tree)).toEqual([]);
    expect(state(container, "email")).toEqual(dimmed);
  });

  test("and in #357's case its hint is marked in the server HTML", async () => {
    const tree = radio(
      { disabled: true },
      option("email", {
        disabled: false,
        hints: [{ children: "We will email you." }],
      }),
    );
    const container = serverRender(tree);
    expect(hints(container, "email")[0]!.getAttribute("aria-disabled")).toBe(
      "true",
    );
    expect(await hydrate(container, tree)).toEqual([]);
    expect(state(container, "email")).toEqual(dimmed);
  });
});
