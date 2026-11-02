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
import { Callout, CalloutContent, CalloutTitle } from "./callout";
import {
  CookieBanner,
  CookieBannerDescription,
  CookieBannerTitle,
} from "./cookie-banner";
import {
  SearchBar,
  SearchBarClearButton,
  SearchBarInput,
  SearchBarInputContainer,
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

// No test logs an error or a warning, so a `closeLabel` that reached the DOM,
// which React warns about, fails it. Nothing is left on the page.
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

// No `closeLabel` reaches the DOM as an attribute
const strayCloseLabels = () =>
  document.querySelectorAll("[closelabel], [closeLabel]").length;

describe("Callout's `dismissible` cross", () => {
  const callout = (props: { closeLabel?: string; "aria-label"?: string }) =>
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
    expect(strayCloseLabels()).toBe(0);
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
  async function autoToast(props: {
    closeLabel?: string;
    "aria-label"?: string;
  }) {
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
    expect(strayCloseLabels()).toBe(0);
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

describe("CookieBanner's close cross", () => {
  // An open CookieBanner with the title and description Radix asks of a
  // dialog. Returns the dialog, which portals into `<body>`.
  async function cookieBanner(props: {
    closeLabel?: string;
    "aria-label"?: string;
  }) {
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
    expect(strayCloseLabels()).toBe(0);
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
