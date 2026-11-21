// @vitest-environment happy-dom
//
// ToastIcon and ToastProgress are public parts of the toast entry, so a toast
// composed by hand from ToastRoot can show the status icon and the countdown
// bar that AutoToast shows (#172). Each reads its variant, and the bar its
// duration, from the enclosing ToastRoot, and both are hidden from assistive
// technology, because the toast's title carries its meaning.
import {
  act,
  createElement,
  createRef,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { CheckCircleIcon } from "../icons/check-circle";
import { InfoIcon } from "../icons/info";
import { WarningIcon } from "../icons/warning";
import { WarningCircleIcon } from "../icons/warning-circle";
import { useToast } from "../hooks";
import { CrossIcon } from "../icons/cross";
import { isIcon, type Icon } from "../svg/icon-test-markup";
import {
  AutoToast,
  ToastIcon,
  ToastProgress,
  ToastProvider,
  ToastRoot,
  ToastTitle,
  ToastViewport,
  type ToastEvent,
} from "./toast";

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

type RootProps = Omit<ComponentProps<typeof ToastRoot>, "children">;

// A toast composed by hand: a ToastRoot with `rootProps`, titled "Disimpan",
// holding `parts`, in a provider and viewport. Returns the toast's root.
async function composed(rootProps: RootProps, ...parts: ReactNode[]) {
  const page = await mount(
    createElement(
      ToastProvider,
      null,
      createElement(
        ToastRoot,
        rootProps,
        createElement(ToastTitle, null, "Disimpan"),
        ...parts,
      ),
      createElement(ToastViewport),
    ),
  );
  const [root, ...others] = page.querySelectorAll("li");
  expect(others).toEqual([]);
  return root!;
}

// Each variant that shows a status icon, the icon it shows and the colour
// class the icon takes
const iconVariants = [
  ["success", CheckCircleIcon, "text-txt-success"],
  ["info", InfoIcon, "text-txt-primary"],
  ["warning", WarningCircleIcon, "text-txt-warning"],
  ["error", WarningIcon, "text-txt-danger"],
] as const satisfies readonly (readonly [string, Icon, string])[];

describe("ToastIcon", () => {
  test.each(iconVariants)(
    "inside a %s ToastRoot, is a hidden element holding the variant's icon in its colour",
    async (variant, icon, colour) => {
      const root = await composed({ variant }, createElement(ToastIcon));
      const [svg, ...others] = root.querySelectorAll("svg");
      expect(others).toEqual([]);
      expect(isIcon(svg!, icon)).toBe(true);
      expect(svg!.classList).toContain(colour);
      expect(svg!.parentElement!.getAttribute("aria-hidden")).toBe("true");
      expect(svg!.parentElement!.parentElement).toBe(root);
    },
  );

  test("puts a `className` once, on its outer element, which its ref gets", async () => {
    const ref = createRef<HTMLDivElement>();
    const root = await composed(
      { variant: "success" },
      createElement(ToastIcon, { className: "mt-1", ref }),
    );
    const [marked, ...others] = root.querySelectorAll(".mt-1");
    expect(others).toEqual([]);
    expect(marked).toBe(ref.current);
    expect(ref.current!.getAttribute("aria-hidden")).toBe("true");
    const svg = ref.current!.querySelector("svg")!;
    expect([...svg.classList].sort()).toEqual(
      ["shrink-0", "size-5", "text-txt-success"].sort(),
    );
  });

  test("gives no outer element a class attribute without a `className`", async () => {
    const ref = createRef<HTMLDivElement>();
    await composed({ variant: "error" }, createElement(ToastIcon, { ref }));
    expect(ref.current!.hasAttribute("class")).toBe(false);
  });

  test("inside a message ToastRoot, renders nothing", async () => {
    const root = await composed(
      { variant: "message" },
      createElement(ToastIcon),
    );
    expect(root.querySelectorAll("svg")).toHaveLength(0);
    expect(root.children).toHaveLength(1);
  });
});

// Each variant and the class that fills its countdown bar
const barFills = [
  ["message", "bg-bg-washed"],
  ["success", "bg-txt-success"],
  ["info", "bg-txt-primary"],
  ["warning", "bg-txt-warning"],
  ["error", "bg-txt-danger"],
] as const;

// The one countdown bar in `root`: the element with `animate-expire`
function bar(root: Element) {
  const [element, ...others] = root.querySelectorAll(".animate-expire");
  expect(others).toEqual([]);
  expect(element).toBeInstanceOf(HTMLDivElement);
  return element as HTMLDivElement;
}

describe("ToastProgress", () => {
  test("inside a ToastRoot with `duration={8000}`, is a hidden bar that counts down for 8000ms", async () => {
    const root = await composed(
      { variant: "success", duration: 8000 },
      createElement(ToastProgress),
    );
    const countdown = bar(root);
    expect(countdown.parentElement).toBe(root);
    expect(countdown.getAttribute("aria-hidden")).toBe("true");
    expect(countdown.style.animationDuration).toBe("8000ms");
  });

  test("gives its ref the bar", async () => {
    const ref = createRef<HTMLDivElement>();
    const root = await composed(
      { variant: "warning" },
      createElement(ToastProgress, { ref }),
    );
    expect(ref.current).toBe(bar(root));
  });

  test("counts down for 5000ms inside a ToastRoot without `duration`", async () => {
    const root = await composed(
      { variant: "info" },
      createElement(ToastProgress),
    );
    expect(bar(root).style.animationDuration).toBe("5000ms");
  });

  // The classes that put the bar along the toast's bottom edge and run and
  // pause its countdown
  const barClasses = [
    "absolute",
    "animate-expire",
    "bottom-0",
    "group-hover:paused",
    "group-hover:transition-none",
    "left-0",
    "w-full",
  ];

  test("adds a `className` and `style` to its own, keeping its position and 8000ms countdown", async () => {
    const root = await composed(
      { variant: "success", duration: 8000 },
      createElement(ToastProgress, {
        className: "opacity-50",
        style: { opacity: 0.5 },
      }),
    );
    const countdown = bar(root);
    expect([...countdown.classList].sort()).toEqual(
      [...barClasses, "opacity-50"].sort(),
    );
    expect(countdown.style.animationDuration).toBe("8000ms");
    expect(countdown.style.opacity).toBe("0.5");
    expect(countdown.getAttribute("aria-hidden")).toBe("true");
  });

  test("lets a conflicting utility replace only the class it conflicts with", async () => {
    const root = await composed(
      { variant: "success" },
      createElement(ToastProgress, { className: "bottom-1" }),
    );
    expect([...bar(root).classList].sort()).toEqual(
      [...barClasses.filter((name) => name !== "bottom-0"), "bottom-1"].sort(),
    );
  });

  test("lets `style` set the animation duration itself", async () => {
    const root = await composed(
      { variant: "success", duration: 8000 },
      createElement(ToastProgress, { style: { animationDuration: "2s" } }),
    );
    expect(bar(root).style.animationDuration).toBe("2s");
  });

  test.each(barFills)(
    "inside a %s ToastRoot, fills with %s",
    async (variant, fill) => {
      const root = await composed({ variant }, createElement(ToastProgress));
      const [fillElement, ...others] = bar(root).children;
      expect(others).toEqual([]);
      expect([...fillElement!.classList].sort()).toEqual(
        ["h-1", "w-full", fill].sort(),
      );
    },
  );
});

describe.each([
  ["ToastIcon", ToastIcon],
  ["ToastProgress", ToastProgress],
] as const)("%s", (name, Part) => {
  // Its outer element: the one its ref gets
  async function outer(props: ComponentProps<typeof Part>) {
    const ref = createRef<HTMLDivElement>();
    await composed(
      { variant: "success" },
      createElement(Part, { ...props, ref }),
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    return ref.current!;
  }

  test("passes other props to its outer element", async () => {
    const element = await outer({
      id: "status",
      title: "Status",
      "data-part": "status",
    } as ComponentProps<typeof Part>);
    expect(element.id).toBe("status");
    expect(element.title).toBe("Status");
    expect(element.dataset.part).toBe("status");
    expect(element.getAttribute("aria-hidden")).toBe("true");
  });

  // `aria-hidden` is a default set before the caller's props, as ADR-0008
  // sets a built-in name, so an `aria-hidden` passed in wins
  test("lets an `aria-hidden` passed in replace its default", async () => {
    const element = await outer({ "aria-hidden": false });
    expect(element.getAttribute("aria-hidden")).toBe("false");
  });

  test(`is named "${name}" in React's tools`, () => {
    expect(Part.displayName).toBe(name);
  });
});

// AutoToast's toasts as they rendered on main (4812005), before ToastIcon
// and ToastProgress were exported, recorded from its markup. Each line is an
// element of a toast's root, in document order: its tag, its `aria-hidden`,
// its inline animation duration and its class tokens, sorted, or "(no class)"
// for an element with no class attribute. Each toast is titled "Disimpan",
// with a description; `duration` is the countdown's.
const mainMarkup = (duration: string) => {
  const root =
    "li .bg-bg-dialog-active .border .border-bg-washed-active .data-[state=closed]:animate-out .data-[state=closed]:fade-out-80 .data-[state=closed]:slide-out-to-right-full .data-[state=open]:animate-in .data-[state=open]:slide-in-from-top-full .data-[state=open]:sm:slide-in-from-bottom-full .data-[swipe=cancel]:translate-x-0 .data-[swipe=end]:animate-out .data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] .data-[swipe=move]:transition-none .data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] .flex .focus-visible:outline-hidden .focus-visible:ring-3 .focus-visible:ring-fr-primary .gap-2 .group .items-start .overflow-hidden .p-3 .pointer-events-auto .relative .rounded-md .shadow-card .transition-all .w-full .z-[99]";
  const icon = (colour: string) => [
    'div aria-hidden="true" (no class)',
    `svg .shrink-0 .size-5 .${colour}`,
    "g (no class)",
    "path (no class)",
  ];
  const text = (colour: string) => [
    "div .space-y-1",
    `div .font-semibold .text-body-sm .${colour}`,
    "div .text-body-sm .text-txt-black-700",
  ];
  const close = [
    "button .absolute .focus-visible:outline-hidden .focus-visible:ring-3 .focus-visible:ring-fr-primary .hover:text-txt-black-700 .p-1 .right-1 .rounded-md .text-txt-black-500 .top-1",
    "svg .shrink-0 .size-5",
    "g (no class)",
    "path (no class)",
  ];
  const bar = (fill: string) => [
    `div aria-hidden="true" animation-duration: ${duration} .absolute .animate-expire .bottom-0 .group-hover:paused .group-hover:transition-none .left-0 .w-full`,
    `div .${fill} .h-1 .w-full`,
  ];
  return {
    message: [
      root,
      ...text("text-txt-black-700"),
      ...close,
      ...bar("bg-bg-washed"),
    ],
    success: [
      root,
      ...icon("text-txt-success"),
      ...text("text-txt-success"),
      ...close,
      ...bar("bg-txt-success"),
    ],
    info: [
      root,
      ...icon("text-txt-primary"),
      ...text("text-txt-primary"),
      ...close,
      ...bar("bg-txt-primary"),
    ],
    warning: [
      root,
      ...icon("text-txt-warning"),
      ...text("text-txt-warning"),
      ...close,
      ...bar("bg-txt-warning"),
    ],
    error: [
      root,
      ...icon("text-txt-danger"),
      ...text("text-txt-danger"),
      ...close,
      ...bar("bg-txt-danger"),
    ],
  };
};

// The lines `mainMarkup` describes, for the toast at `root`
const markupOf = (root: Element) =>
  [root, ...root.querySelectorAll("*")].map((element) => {
    const parts = [element.tagName.toLowerCase()];
    if (element.hasAttribute("aria-hidden"))
      parts.push(`aria-hidden="${element.getAttribute("aria-hidden")}"`);
    const duration = (element as HTMLElement | SVGElement).style
      .animationDuration;
    if (duration) parts.push(`animation-duration: ${duration}`);
    parts.push(
      element.hasAttribute("class")
        ? `.${[...element.classList].sort().join(" .")}`
        : "(no class)",
    );
    return parts.join(" ");
  });

// Fires `event`, titled "Disimpan", through the library's toast hook, as an
// app fires one, under an AutoToast with `props`. Returns the toast's root.
async function autoToast(
  event: Omit<ToastEvent, "title">,
  props: ComponentProps<typeof AutoToast> = {},
) {
  let toast: (event: ToastEvent) => void = () => {};
  const Fire = () => {
    toast = useToast().toast;
    return null;
  };
  const page = await mount(
    createElement(
      "div",
      null,
      createElement(AutoToast, props),
      createElement(Fire),
    ),
  );
  await act(async () => toast({ ...event, title: "Disimpan" }));
  const [root, ...others] = page.querySelectorAll("li");
  expect(others).toEqual([]);
  return root!;
}

// How urgently screen readers announce a toast (ADR-0014). Radix announces
// each toast in a visually hidden `role="status"` span of its own, portalled
// to `<body>`, whose `aria-live` follows ToastRoot's `type`: `assertive` for
// `foreground`, which interrupts the screen reader, and `polite` for
// `background`, which waits for a pause. Only an `error` toast interrupts by
// default; a toast's own `type` wins over AutoToast's, which wins over the
// Variant default.
describe("how urgently a toast is announced", () => {
  // The `aria-live` of the one announcement on the page, which holds the
  // toast's title, "Disimpan".
  // Radix fills it in two animation frames after the toast mounts and
  // removes it a second after, so it's read 100ms after the toast fires.
  async function urgency() {
    await act(() => new Promise((resolve) => setTimeout(resolve, 100)));
    const [status, ...others] = document.querySelectorAll('[role="status"]');
    expect(others).toEqual([]);
    expect(status!.textContent).toBe("Notification Disimpan");
    return status!.getAttribute("aria-live");
  }

  // The `aria-live` of the announcement of a toast fired as `autoToast` fires
  // one
  async function urgencyOfFired(
    event: Omit<ToastEvent, "title">,
    props: ComponentProps<typeof AutoToast> = {},
  ) {
    await autoToast(event, props);
    return urgency();
  }

  describe("under a default AutoToast, fired with toast()", () => {
    test.each([
      ["error", "assertive"],
      ["message", "polite"],
      ["success", "polite"],
      ["info", "polite"],
      ["warning", "polite"],
      [undefined, "polite"],
      [null, "polite"],
    ] as const)("a %s toast is %s", async (variant, live) => {
      expect(await urgencyOfFired({ variant })).toBe(live);
    });

    test('a message toast fired with `type: "foreground"` is assertive', async () => {
      expect(
        await urgencyOfFired({ variant: "message", type: "foreground" }),
      ).toBe("assertive");
    });

    test('an error toast fired with `type: "background"` is polite', async () => {
      expect(
        await urgencyOfFired({ variant: "error", type: "background" }),
      ).toBe("polite");
    });
  });

  describe("under an AutoToast with a `type`", () => {
    test('a success toast is assertive under `type="foreground"`', async () => {
      expect(
        await urgencyOfFired({ variant: "success" }, { type: "foreground" }),
      ).toBe("assertive");
    });

    test('an error toast is polite under `type="background"`', async () => {
      expect(
        await urgencyOfFired({ variant: "error" }, { type: "background" }),
      ).toBe("polite");
    });

    test('a toast fired with `type: "background"` is polite under `type="foreground"`', async () => {
      expect(
        await urgencyOfFired(
          { variant: "error", type: "background" },
          { type: "foreground" },
        ),
      ).toBe("polite");
    });

    test('a toast fired with `type: "foreground"` is assertive under `type="background"`', async () => {
      expect(
        await urgencyOfFired(
          { variant: "message", type: "foreground" },
          { type: "background" },
        ),
      ).toBe("assertive");
    });

    test('a toast fired with no `type` is assertive under `type="foreground"`', async () => {
      expect(
        await urgencyOfFired(
          { variant: "message", type: undefined },
          { type: "foreground" },
        ),
      ).toBe("assertive");
    });
  });

  describe("composed by hand", () => {
    // The `aria-live` of the announcement of a toast composed by hand, as
    // `composed` composes one, with `rootProps`
    async function urgencyOfComposed(rootProps: RootProps) {
      await composed(rootProps);
      return urgency();
    }

    test.each([
      ["error", "assertive"],
      ["message", "polite"],
      ["success", "polite"],
      ["info", "polite"],
      ["warning", "polite"],
    ] as const)("a %s ToastRoot is %s", async (variant, live) => {
      expect(await urgencyOfComposed({ variant })).toBe(live);
    });

    test('a message ToastRoot with `type="foreground"` is assertive', async () => {
      expect(
        await urgencyOfComposed({ variant: "message", type: "foreground" }),
      ).toBe("assertive");
    });

    test('an error ToastRoot with `type="background"` is polite', async () => {
      expect(
        await urgencyOfComposed({ variant: "error", type: "background" }),
      ).toBe("polite");
    });

    test.each([
      ["error", "assertive"],
      ["success", "polite"],
    ] as const)(
      "a %s ToastRoot with `type={undefined}` gets its Variant's default, %s",
      async (variant, live) => {
        expect(await urgencyOfComposed({ variant, type: undefined })).toBe(
          live,
        );
      },
    );
  });
});

describe("AutoToast", () => {
  const variants = ["message", "success", "info", "warning", "error"] as const;
  // The icon each variant showed on main, by what it draws
  const mainIcons: Record<(typeof variants)[number], Icon | undefined> = {
    message: undefined,
    success: CheckCircleIcon,
    info: InfoIcon,
    warning: WarningCircleIcon,
    error: WarningIcon,
  };

  describe.each([
    ["without `duration`", {}, "5000ms"],
    ["with `duration={8000}`", { duration: 8000 }, "8000ms"],
  ] as const)("%s", (_, props, duration) => {
    test.each(variants)(
      "renders a %s toast as it did on main",
      async (variant) => {
        const root = await autoToast(
          { variant, description: "Perubahan anda disimpan." },
          props,
        );
        expect(markupOf(root)).toEqual(mainMarkup(duration)[variant]);
        const [status, ...others] = [...root.querySelectorAll("svg")].filter(
          (svg) => !isIcon(svg, CrossIcon),
        );
        expect(others).toEqual([]);
        const icon = mainIcons[variant];
        if (icon) expect(isIcon(status!, icon)).toBe(true);
        else expect(status).toBeUndefined();
      },
    );
  });
});
