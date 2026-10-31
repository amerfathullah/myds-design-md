// @vitest-environment happy-dom
import { act, createElement, type ComponentProps } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";
import { Button } from "./button";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

type AlertDialogProps = Omit<ComponentProps<typeof AlertDialog>, "children">;

// An AlertDialog composed as the docs compose one, with a title, which Radix
// requires, and a description
const alertDialog = (props: AlertDialogProps = {}) =>
  createElement(
    AlertDialog,
    props,
    createElement(
      AlertDialogTrigger,
      null,
      createElement(Button, { variant: "primary-fill" }, "Delete"),
    ),
    createElement(
      AlertDialogContent,
      null,
      createElement(AlertDialogTitle, null, "Delete the file?"),
      createElement(AlertDialogDescription, null, "You can't undo this."),
      createElement(
        AlertDialogAction,
        null,
        createElement(
          AlertDialogClose,
          null,
          createElement(Button, { variant: "default-outline" }, "Cancel"),
        ),
      ),
    ),
  );

// What plain JavaScript, or a cast, can pass for `variant`, besides leaving
// it out
const untyped = {
  undefined: { variant: undefined },
  null: { variant: null as any },
  "an unknown name": { variant: "bogus" as any },
  "an inherited key": { variant: "toString" as any },
} satisfies Record<string, AlertDialogProps>;

const unmounts: (() => Promise<void>)[] = [];

// Mounts `element` in a container on the page, as an app would. The dialog's
// content portals into `<body>`, outside the container.
async function mount(element: ReturnType<typeof alertDialog>) {
  const container = document.body.appendChild(document.createElement("div"));
  const root = createRoot(container);
  unmounts.push(async () => {
    await act(async () => root.unmount());
    container.remove();
  });
  await act(async () => root.render(element));
  return {
    trigger: container.querySelector("button"),
    open: () => act(async () => container.querySelector("button")!.click()),
  };
}

const dialog = () => document.querySelector('[role="dialog"]');

// The open dialog's status icon: every icon in it but the close button's cross
const statusIcons = () =>
  [...dialog()!.querySelectorAll("svg")].filter(
    (svg) => !svg.querySelector('[id="Icon/cross"]'),
  );

// The page's markup, with the ids Radix generates, which differ between
// mounts, replaced
const page = () =>
  document.body.innerHTML.replace(/radix-[^"\s]*/g, "radix-id");

// The page's markup with `props`' dialog mounted closed, then open
async function markup(props: AlertDialogProps) {
  const { open } = await mount(alertDialog(props));
  const closed = page();
  await open();
  const opened = page();
  await unmounts.pop()!();
  return { closed, opened };
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

// No test logs an error or a warning
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

describe("AlertDialog without a `variant`", () => {
  test("mounts closed, rendering its trigger", async () => {
    const { trigger } = await mount(alertDialog());
    expect(trigger?.textContent).toBe("Delete");
    expect(trigger?.getAttribute("aria-expanded")).toBe("false");
    expect(dialog()).toBeNull();
  });

  test("opens with its title and no status icon", async () => {
    const { open } = await mount(alertDialog());
    await open();
    expect(dialog()?.querySelector("h2")?.textContent).toBe("Delete the file?");
    expect(statusIcons()).toEqual([]);
    expect(dialog()!.querySelectorAll('[id="Icon/cross"]')).toHaveLength(1);
  });

  test('renders as `variant="default"` does, closed and open', async () => {
    expect(await markup({})).toEqual(await markup({ variant: "default" }));
  });

  test('renders on the server as `variant="default"` does', () => {
    const html = renderToStaticMarkup(alertDialog());
    expect(html).toContain(">Delete</button>");
    expect(html).toBe(
      renderToStaticMarkup(alertDialog({ variant: "default" })),
    );
  });
});

describe.each(Object.entries(untyped))(
  "AlertDialog with %s for `variant`",
  (_, props) => {
    test('renders as `variant="default"` does, closed and open', async () => {
      expect(await markup(props)).toEqual(await markup({ variant: "default" }));
    });

    test('renders on the server as `variant="default"` does', () => {
      expect(renderToStaticMarkup(alertDialog(props))).toBe(
        renderToStaticMarkup(alertDialog({ variant: "default" })),
      );
    });
  },
);

// The afterEach hook checks the console after every test; this names the
// cases on their own
test.each([
  ["no `variant`", {}],
  ['`variant="default"`', { variant: "default" }],
  ["`variant={null}`", untyped.null],
  ['`variant="bogus"`', untyped["an unknown name"]],
] satisfies [string, AlertDialogProps][])(
  "opening an AlertDialog with %s logs nothing",
  async (_, props) => {
    const { open } = await mount(alertDialog(props));
    await open();
    expect(dialog()).not.toBeNull();
    expect(console.error).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
  },
);

// Each status variant still leads with its icon, in its colour, 16px above
// its title and description
describe.each([
  ["info", "info", "text-txt-primary stroke-txt-primary"],
  ["success", "check-circle", "text-txt-success stroke-txt-success"],
  ["warning", "warning-circle", "text-txt-warning stroke-txt-warning"],
  ["danger", "warning-diamond", "text-txt-danger stroke-txt-danger"],
] as const)('AlertDialog with `variant="%s"`', (variant, icon, colour) => {
  test(`leads with the ${icon} icon in its colour`, async () => {
    const { open } = await mount(alertDialog({ variant }));
    await open();
    const [status, ...others] = statusIcons();
    expect(others).toEqual([]);
    expect(status?.querySelector("g")?.id).toBe(`Icon/${icon}`);
    expect(status?.getAttribute("class")).toBe(
      `block stroke-[1.5px] size-10.5 shrink-0 ${colour} mb-4`,
    );
    // It sits above the title and description
    expect(status?.nextElementSibling).toBe(
      dialog()!.querySelector("h2")?.parentElement,
    );
  });
});
