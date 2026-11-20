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
// RadioLabel points at, and the label and hints stacked beside it
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
      ...hints.map((hint, index) =>
        createElement(RadioHintText, { key: index, ...hint }),
      ),
    ),
  );

// A RadioHintText reading `text`, marked so the tests find it
function hint(
  text: string,
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
          hints: [{ children: "We will email you.", "data-hint": "" }],
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
              "data-hint": "",
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
              "data-hint": "",
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
          hints: [{ children: "We will email you.", "data-hint": "", ref }],
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
            hints: [{ children: "We will email you.", "data-hint": "" }],
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
          hints: [{ children: "We will email you.", "data-hint": "" }],
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
              "data-hint": "",
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
          hints: [{ children: "Hint.", id: "b", "data-hint": "" }],
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
          hints: [
            { children: "We will email you.", id: "mine", "data-hint": "" },
          ],
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
          hints: [{ children: "We will email you.", id: "", "data-hint": "" }],
        }),
        option("post", {
          hints: [{ children: "We will post it.", "data-hint": "" }],
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
          hints: [{ children: `About ${value}.`, "data-hint": "" }],
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
          hints: [
            { children: "First.", "data-hint": "" },
            { children: "Second.", "data-hint": "" },
          ],
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
});

describe("aria-describedby follows the hints", () => {
  test("when a hint is removed", async () => {
    const tree = (withHint: boolean) =>
      radio(
        {},
        option("email", {
          hints: withHint
            ? [{ children: "We will email you.", "data-hint": "" }]
            : [],
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
          hints: [{ children: "We will email you.", id, "data-hint": "" }],
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
              { children: "First.", "data-hint": "" },
              { children: "Second.", id: "second", "data-hint": "" },
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
      hints: [{ children: "We will email you.", "data-hint": "" }],
    }),
    option("post", {
      hints: [
        { children: "We will post it.", "data-hint": "" },
        { children: "It takes a week.", id: "week", "data-hint": "" },
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
          hints: [{ children: "Hint", "data-hint": "" }],
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
