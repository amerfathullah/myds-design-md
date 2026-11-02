// @vitest-environment happy-dom
import {
  act,
  createElement,
  type ComponentProps,
  type ReactElement,
} from "react";
import { createRoot } from "react-dom/client";
import { computeAccessibleName } from "dom-accessibility-api";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { useToast } from "../hooks";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "./alert-dialog";
import { Callout, CalloutContent, CalloutTitle } from "./callout";
import {
  CookieBanner,
  CookieBannerDescription,
  CookieBannerTitle,
} from "./cookie-banner";
import { Dialog, DialogBody, DialogDescription, DialogTitle } from "./dialog";
import { Pill } from "./pill";
import {
  SearchBar,
  SearchBarClearButton,
  SearchBarInput,
  SearchBarInputContainer,
  SearchBarResults,
  SearchBarResultsItem,
  SearchBarResultsList,
  SearchBarSearchButton,
} from "./search-bar";
import {
  AutoToast,
  ToastClose,
  ToastDescription,
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
// the container. Portalled content lands in `<body>`, outside it.
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

// The accessible name of the one button in `within` that matches `selector`
function nameOf(within: ParentNode, selector = "button") {
  const [element, ...others] = within.querySelectorAll(selector);
  expect(others).toEqual([]);
  expect(element).toBeDefined();
  return computeAccessibleName(element!);
}

// Every button, `role="img"` and `role="progressbar"` in `within` that
// assistive technology meets with no name
function unnamed(within: ParentNode) {
  return [
    ...within.querySelectorAll(
      'button, [role="button"], [role="img"], [role="progressbar"]',
    ),
  ]
    .filter((element) => !element.closest('[aria-hidden="true"]'))
    .filter((element) => computeAccessibleName(element) === "")
    .map((element) => element.outerHTML);
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

// `aria-label` props for `label`, or none when it's undefined, as an author
// who doesn't name a control passes none
const ariaLabel = (label?: string) =>
  label === undefined ? {} : { "aria-label": label };

// No `closeLabel`, `viewportLabel` or `announceLabel` reaches the DOM as an
// attribute. React warns about an unknown prop only the first time it meets
// its name, so the warning check above would miss every leak after the first;
// this check catches each one.
const strayLabels = () =>
  document.querySelectorAll("[closelabel], [viewportlabel], [announcelabel]")
    .length;

// The props that name a close button the author doesn't render, and the
// `aria-label` that must still reach the element it reached before
type CloseLabelProps = { closeLabel?: string; "aria-label"?: string };

describe("Callout's `dismissible` cross", () => {
  const callout = (props: CloseLabelProps) =>
    createElement(
      Callout,
      { dismissible: true, ...props },
      createElement(CalloutTitle, null, "Saved"),
      createElement(CalloutContent, null, "Your changes are saved."),
    );

  test('is named "Close" by default', async () => {
    const page = await mount(callout({}));
    expect(nameOf(page)).toBe("Close");
    expect(unnamed(page)).toEqual([]);
  });

  test("takes its name from `closeLabel`", async () => {
    const page = await mount(callout({ closeLabel: "Tutup" }));
    expect(nameOf(page)).toBe("Tutup");
    expect(strayLabels()).toBe(0);
  });

  test("leaves an `aria-label` on Callout on the alert container", async () => {
    const page = await mount(
      callout({ closeLabel: "Tutup", "aria-label": "Notis" }),
    );
    expect(
      page.querySelector('[role="alert"]')!.getAttribute("aria-label"),
    ).toBe("Notis");
    expect(nameOf(page)).toBe("Tutup");
  });
});

// Every variant a toast fired through `useToast` can take
const variants = ["message", "success", "info", "warning", "error"] as const;

describe("AutoToast", () => {
  // An AutoToast with one toast of each variant, fired through the library's
  // toast hook, as an app fires them. Returns each toast's root.
  async function autoToast(props: CloseLabelProps) {
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
    for (const variant of variants)
      await act(async () => toast({ variant, title: `A ${variant} toast` }));
    const roots = [...page.querySelectorAll("li")];
    expect(roots.map((root) => root.textContent)).toEqual(
      variants.map((variant) => `A ${variant} toast`),
    );
    return roots;
  }

  test.each(variants.map((variant, index) => [variant, index] as const))(
    'names a %s toast\'s close button "Close" by default',
    async (_, index) => {
      const root = (await autoToast({}))[index]!;
      expect(nameOf(root)).toBe("Close");
    },
  );

  // ToastIcon and ToastProgress aren't exported, so only AutoToast renders
  // them. They have no name or value to give, and the title carries the
  // toast's meaning, so assistive technology skips them.
  test.each(variants.map((variant, index) => [variant, index] as const))(
    "hides a %s toast's status icon and countdown bar",
    async (variant, index) => {
      const root = (await autoToast({}))[index]!;
      const statusIcons = [...root.querySelectorAll("svg")].filter(
        (svg) => !svg.querySelector('[id="Icon/cross"]'),
      );
      expect(statusIcons).toHaveLength(variant === "message" ? 0 : 1);
      const countdown = root.querySelector(".animate-expire");
      for (const hidden of [
        ...statusIcons.map((svg) => svg.parentElement),
        countdown,
      ])
        expect(hidden!.getAttribute("aria-hidden")).toBe("true");
      expect(
        root.querySelectorAll('[role="img"], [role="progressbar"]'),
      ).toHaveLength(0);
      expect(unnamed(root)).toEqual([]);
    },
  );

  test("names every close button from `closeLabel`", async () => {
    const roots = await autoToast({ closeLabel: "Tutup" });
    expect(roots.map((root) => nameOf(root))).toEqual(
      variants.map(() => "Tutup"),
    );
    expect(strayLabels()).toBe(0);
  });

  test("leaves an `aria-label` on AutoToast on each toast's root", async () => {
    const roots = await autoToast({
      closeLabel: "Tutup",
      "aria-label": "Notis",
    });
    expect(roots.map((root) => root.getAttribute("aria-label"))).toEqual(
      variants.map(() => "Notis"),
    );
    expect(roots.map((root) => nameOf(root))).toEqual(
      variants.map(() => "Tutup"),
    );
  });
});

describe("AutoToast's region and announcement", () => {
  type RegionLabelProps = { viewportLabel?: string; announceLabel?: string };

  // An AutoToast. Returns its viewport region, and `fire`, which fires a
  // success toast titled "Disimpan" through the library's toast hook, as an
  // app fires one.
  async function autoToast(props: RegionLabelProps) {
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
    const [region, ...others] = page.querySelectorAll('[role="region"]');
    expect(others).toEqual([]);
    const fire = () =>
      act(async () => toast({ variant: "success", title: "Disimpan" }));
    return { region: region!, fire };
  }

  // The text of the one announcement Radix makes for the toast `fire` fires.
  // Radix fills it in on the next animation frame and removes it a second
  // later, so it's read 100ms after the toast fires.
  async function announcement(fire: () => Promise<void>) {
    await fire();
    await act(() => new Promise((resolve) => setTimeout(resolve, 100)));
    const [status, ...others] = document.querySelectorAll('[role="status"]');
    expect(others).toEqual([]);
    return status!.textContent;
  }

  test('names the region "Notifications (F8)" by default', async () => {
    const { region, fire } = await autoToast({});
    expect(computeAccessibleName(region)).toBe("Notifications (F8)");
    await fire();
    expect(region.querySelectorAll("li")).toHaveLength(1);
    expect(computeAccessibleName(region)).toBe("Notifications (F8)");
  });

  test("names the region from `viewportLabel`, with the hotkey", async () => {
    const { region, fire } = await autoToast({
      viewportLabel: "Pemberitahuan ({hotkey})",
    });
    expect(computeAccessibleName(region)).toBe("Pemberitahuan (F8)");
    await fire();
    expect(region.querySelectorAll("li")).toHaveLength(1);
    expect(computeAccessibleName(region)).toBe("Pemberitahuan (F8)");
    expect(strayLabels()).toBe(0);
  });

  test('announces a toast after "Notification" by default', async () => {
    const { fire } = await autoToast({});
    expect(await announcement(fire)).toBe("Notification Disimpan");
  });

  test("announces a toast after `announceLabel`", async () => {
    const { fire } = await autoToast({ announceLabel: "Pemberitahuan" });
    expect(await announcement(fire)).toBe("Pemberitahuan Disimpan");
    expect(strayLabels()).toBe(0);
  });
});

describe("CookieBanner's close cross", () => {
  // An open CookieBanner with the title and description Radix asks of a
  // dialog. Returns the dialog, which portals into `<body>`.
  async function cookieBanner(props: CloseLabelProps) {
    await mount(
      createElement(
        CookieBanner,
        // CookieBanner's type has no `aria-label`, but its props reach the
        // dialog (#83), so an author can pass one from JavaScript or a cast
        { open: true, ...props } as ComponentProps<typeof CookieBanner>,
        createElement(CookieBannerTitle, null, "This site uses cookies"),
        createElement(CookieBannerDescription, null, "Choose which to allow."),
      ),
    );
    return document.querySelector('[role="dialog"]')!;
  }

  test('is named "Close" by default', async () => {
    const dialog = await cookieBanner({});
    expect(nameOf(dialog)).toBe("Close");
    expect(unnamed(dialog)).toEqual([]);
  });

  test("takes its name from `closeLabel`", async () => {
    const dialog = await cookieBanner({ closeLabel: "Tutup" });
    expect(nameOf(dialog)).toBe("Tutup");
    expect(strayLabels()).toBe(0);
  });

  // The dialog takes its name from its title, so check the attribute
  test("leaves an `aria-label` on CookieBanner on the dialog", async () => {
    const dialog = await cookieBanner({
      closeLabel: "Tutup",
      "aria-label": "Kuki",
    });
    expect(dialog.getAttribute("aria-label")).toBe("Kuki");
    expect(nameOf(dialog)).toBe("Tutup");
  });
});

describe("DialogBody's close button", () => {
  // An open Dialog with the title and description Radix asks of one. Returns
  // the dialog, which portals into `<body>`.
  async function dialog(props: CloseLabelProps & { hideClose?: boolean }) {
    await mount(
      createElement(
        Dialog,
        { open: true },
        createElement(
          DialogBody,
          props,
          createElement(DialogTitle, null, "Delete the file?"),
          createElement(DialogDescription, null, "You can't undo this."),
        ),
      ),
    );
    return document.querySelector('[role="dialog"]')!;
  }

  test('is the one button, named "Close" by default', async () => {
    const body = await dialog({});
    expect(nameOf(body)).toBe("Close");
    expect(unnamed(body)).toEqual([]);
  });

  test("takes its name from `closeLabel`", async () => {
    const body = await dialog({ closeLabel: "Tutup" });
    expect(nameOf(body)).toBe("Tutup");
    expect(strayLabels()).toBe(0);
  });

  // The dialog takes its name from its title, so check the attribute
  test("leaves an `aria-label` on DialogBody on the dialog", async () => {
    const body = await dialog({
      closeLabel: "Tutup",
      "aria-label": "Padam fail",
    });
    expect(body.getAttribute("aria-label")).toBe("Padam fail");
    expect(nameOf(body)).toBe("Tutup");
  });

  test.each([
    ["without", {}],
    ["with", { closeLabel: "Tutup" }],
  ])("is left out by `hideClose` %s `closeLabel`", async (_, props) => {
    const body = await dialog({ hideClose: true, ...props });
    expect(body.querySelectorAll("button")).toHaveLength(0);
    expect(strayLabels()).toBe(0);
  });
});

describe("AlertDialogContent's close button", () => {
  // An open danger AlertDialog with the title and description Radix asks of a
  // dialog. Returns the dialog, which portals into `<body>`.
  async function alertDialog(props: CloseLabelProps & { hideClose?: boolean }) {
    await mount(
      createElement(
        AlertDialog,
        { variant: "danger", open: true },
        createElement(
          AlertDialogContent,
          props,
          createElement(AlertDialogTitle, null, "Delete the file?"),
          createElement(AlertDialogDescription, null, "You can't undo this."),
        ),
      ),
    );
    return document.querySelector('[role="dialog"]')!;
  }

  test('is the one button, named "Close" by default', async () => {
    const content = await alertDialog({});
    expect(nameOf(content)).toBe("Close");
    expect(unnamed(content)).toEqual([]);
  });

  test("takes its name from `closeLabel`", async () => {
    const content = await alertDialog({ closeLabel: "Tutup" });
    expect(nameOf(content)).toBe("Tutup");
    expect(strayLabels()).toBe(0);
  });

  test("is left out by `hideClose`", async () => {
    const content = await alertDialog({ hideClose: true, closeLabel: "Tutup" });
    expect(content.querySelectorAll("button")).toHaveLength(0);
    expect(strayLabels()).toBe(0);
  });
});

describe("Pill's remove button", () => {
  // A pill for each of `pills`, side by side, as a list of filters shows
  // them. Returns the container.
  const pills = (
    ...pills: (CloseLabelProps & { name: string; disabled?: boolean })[]
  ) =>
    mount(
      createElement(
        "div",
        null,
        ...pills.map(({ name, ...props }) =>
          createElement(Pill, { onDismiss: () => {}, ...props }, name),
        ),
      ),
    );

  test('is named "Close" by default', async () => {
    const page = await pills({ name: "Kuala Lumpur" });
    expect(nameOf(page)).toBe("Close");
    expect(unnamed(page)).toEqual([]);
  });

  test("takes its name from `closeLabel`", async () => {
    const page = await pills({
      name: "Kuala Lumpur",
      closeLabel: "Buang Kuala Lumpur",
    });
    expect(nameOf(page)).toBe("Buang Kuala Lumpur");
    expect(strayLabels()).toBe(0);
  });

  test("takes a different name on each pill", async () => {
    const page = await pills(
      { name: "Kuala Lumpur", closeLabel: "Buang Kuala Lumpur" },
      { name: "Johor", closeLabel: "Buang Johor" },
    );
    expect(
      [...page.querySelectorAll("button")].map((button) =>
        computeAccessibleName(button),
      ),
    ).toEqual(["Buang Kuala Lumpur", "Buang Johor"]);
    expect(strayLabels()).toBe(0);
  });

  test("carries its name itself, and hides its cross", async () => {
    const page = await pills({
      name: "Kuala Lumpur",
      closeLabel: "Buang Kuala Lumpur",
    });
    const button = page.querySelector("button")!;
    expect(button.getAttribute("aria-label")).toBe("Buang Kuala Lumpur");
    const [cross, ...others] = button.querySelectorAll("svg");
    expect(others).toEqual([]);
    expect(cross!.getAttribute("aria-hidden")).toBe("true");
    expect(cross!.hasAttribute("aria-label")).toBe(false);
  });

  test("leaves an `aria-label` on Pill on its container", async () => {
    const page = await pills({
      name: "Kuala Lumpur",
      closeLabel: "Buang Kuala Lumpur",
      "aria-label": "Negeri",
    });
    const button = page.querySelector("button")!;
    expect(button.parentElement!.getAttribute("aria-label")).toBe("Negeri");
    expect(computeAccessibleName(button)).toBe("Buang Kuala Lumpur");
  });

  test("is left out of a disabled pill", async () => {
    const page = await pills({
      name: "Kuala Lumpur",
      closeLabel: "Buang Kuala Lumpur",
      disabled: true,
    });
    expect(page.querySelectorAll("button")).toHaveLength(0);
    expect(strayLabels()).toBe(0);
  });

  test("is left out of a pill with no `onDismiss`", async () => {
    const page = await mount(
      createElement(Pill, { closeLabel: "Buang Kuala Lumpur" }, "Kuala Lumpur"),
    );
    expect(page.querySelectorAll("button")).toHaveLength(0);
    expect(strayLabels()).toBe(0);
  });
});

describe("SearchBar's buttons", () => {
  // A SearchBar of `size` with an input, a clear button and a search button,
  // as the docs compose one. Returns the two buttons.
  async function searchBar(
    size: "small" | "medium" | "large",
    labels: { search?: string; clear?: string } = {},
  ) {
    const page = await mount(
      createElement(
        SearchBar,
        { size },
        createElement(
          SearchBarInputContainer,
          null,
          createElement(SearchBarInput, { placeholder: "Search by name" }),
          createElement(SearchBarClearButton, ariaLabel(labels.clear)),
          createElement(SearchBarSearchButton, ariaLabel(labels.search)),
        ),
      ),
    );
    expect(unnamed(page)).toEqual([]);
    const [clear, search, ...others] = page.querySelectorAll("button");
    expect(others).toEqual([]);
    return { clear: clear!, search: search! };
  }

  describe.each(["small", "medium", "large"] as const)("size %s", (size) => {
    test('names the search button "Search" by default', async () => {
      const { search } = await searchBar(size);
      expect(computeAccessibleName(search)).toBe("Search");
    });

    test("lets an `aria-label` rename the search button", async () => {
      const { search } = await searchBar(size, { search: "Cari" });
      expect(computeAccessibleName(search)).toBe("Cari");
    });
  });

  test('names the clear button "Clear" by default', async () => {
    const { clear } = await searchBar("medium");
    expect(computeAccessibleName(clear)).toBe("Clear");
  });

  test("lets an `aria-label` rename the clear button", async () => {
    const { clear } = await searchBar("medium", { clear: "Kosongkan" });
    expect(computeAccessibleName(clear)).toBe("Kosongkan");
  });
});

describe("SearchBarResultsList", () => {
  // A SearchBar with its results open, as the docs compose one, whose results
  // list takes `props`. Returns the container.
  const results = (props: { "aria-label"?: string; label?: string }) =>
    mount(
      createElement(
        SearchBar,
        null,
        createElement(
          SearchBarInputContainer,
          null,
          createElement(SearchBarInput, { placeholder: "Search by name" }),
        ),
        createElement(
          SearchBarResults,
          { open: true },
          createElement(
            SearchBarResultsList,
            props,
            createElement(SearchBarResultsItem, null, "Kuala Lumpur"),
          ),
        ),
      ),
    );

  test('is the one listbox, named "Suggestions" by default', async () => {
    const page = await results({});
    expect(nameOf(page, '[role="listbox"]')).toBe("Suggestions");
  });

  test("takes its name from an `aria-label`", async () => {
    const page = await results({ "aria-label": "Cadangan" });
    expect(nameOf(page, '[role="listbox"]')).toBe("Cadangan");
  });

  test("takes its name from cmdk's `label`", async () => {
    const page = await results({ label: "Cadangan" });
    expect(nameOf(page, '[role="listbox"]')).toBe("Cadangan");
  });

  test("takes its name from an `aria-label` over `label`", async () => {
    const page = await results({ "aria-label": "Cadangan", label: "Senarai" });
    expect(nameOf(page, '[role="listbox"]')).toBe("Cadangan");
  });
});

describe("ToastClose in a toast composed by hand", () => {
  // A toast composed as the docs compose one. Returns its root.
  async function toast(label?: string) {
    const page = await mount(
      createElement(
        ToastProvider,
        null,
        createElement(
          ToastRoot,
          { variant: "success" },
          createElement(ToastTitle, null, "Saved"),
          createElement(ToastDescription, null, "Your changes are saved."),
          createElement(ToastClose, ariaLabel(label)),
        ),
        createElement(ToastViewport),
      ),
    );
    const [root, ...others] = page.querySelectorAll("li");
    expect(others).toEqual([]);
    expect(unnamed(root!)).toEqual([]);
    return root!;
  }

  test('is named "Close" by default', async () => {
    expect(nameOf(await toast())).toBe("Close");
  });

  test("lets an `aria-label` rename it", async () => {
    expect(nameOf(await toast("Tutup"))).toBe("Tutup");
  });
});
