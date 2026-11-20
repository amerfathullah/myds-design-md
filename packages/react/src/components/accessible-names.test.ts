// @vitest-environment happy-dom
import {
  act,
  createElement,
  useContext,
  type ComponentProps,
  type ReactElement,
} from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { computeAccessibleName } from "dom-accessibility-api";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { useToast } from "../hooks";
import { CrossIcon } from "../icons";
import { isIcon } from "../svg/icon-test-markup";
import { sharedContext } from "../utils/registry";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "./alert-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb";
import { Callout, CalloutContent, CalloutTitle } from "./callout";
import {
  CookieBanner,
  CookieBannerDescription,
  CookieBannerTitle,
} from "./cookie-banner";
import { Dialog, DialogBody, DialogDescription, DialogTitle } from "./dialog";
import { Label } from "./label";
import { Pill } from "./pill";
import {
  Masthead,
  MastheadHeader,
  MastheadTitle,
  MastheadTrigger,
} from "./masthead";
import { Navbar, NavbarAction, NavbarMenu, NavbarMenuItem } from "./navbar";
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

  test("leaves an `aria-label` on Callout on the note container", async () => {
    const page = await mount(
      callout({ closeLabel: "Tutup", "aria-label": "Notis" }),
    );
    expect(
      page.querySelector('[role="note"]')!.getAttribute("aria-label"),
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

  // AutoToast renders ToastIcon and ToastProgress in every toast. They have
  // no name or value to give, and the title carries the toast's meaning, so
  // assistive technology skips them.
  test.each(variants.map((variant, index) => [variant, index] as const))(
    "hides a %s toast's status icon and countdown bar",
    async (variant, index) => {
      const root = (await autoToast({}))[index]!;
      const statusIcons = [...root.querySelectorAll("svg")].filter(
        (svg) => !isIcon(svg, CrossIcon),
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
  // An open CookieBanner with a title, which names it, and a description.
  // Returns its region, which renders in place.
  async function cookieBanner(props: CloseLabelProps) {
    const container = await mount(
      createElement(
        CookieBanner,
        { open: true, ...props },
        createElement(CookieBannerTitle, null, "This site uses cookies"),
        createElement(CookieBannerDescription, null, "Choose which to allow."),
      ),
    );
    return container.querySelector("section")!;
  }

  test('is named "Close" by default', async () => {
    const region = await cookieBanner({});
    expect(computeAccessibleName(region)).toBe("This site uses cookies");
    expect(nameOf(region)).toBe("Close");
    expect(unnamed(region)).toEqual([]);
  });

  test("takes its name from `closeLabel`", async () => {
    const region = await cookieBanner({ closeLabel: "Tutup" });
    expect(nameOf(region)).toBe("Tutup");
    expect(strayLabels()).toBe(0);
  });

  test("leaves an `aria-label` on CookieBanner to name the region", async () => {
    const region = await cookieBanner({
      closeLabel: "Tutup",
      "aria-label": "Kuki",
    });
    expect(computeAccessibleName(region)).toBe("Kuki");
    expect(nameOf(region)).toBe("Tutup");
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

// SearchBarInput is a form control the author names, so it has no default
// (ADR-0008's Scope). Its own `aria-labelledby` names it, then its own
// `aria-label`, then SearchBar's `label`, which cmdk renders in a hidden
// `<label>` (#178).
describe("SearchBarInput's name", () => {
  type BarProps = Omit<ComponentProps<typeof SearchBar>, "children">;
  type InputProps = ComponentProps<typeof SearchBarInput>;

  // A SearchBar whose input takes `input`, as the docs compose one, with the
  // docs' placeholder
  const searchBar = (bar: BarProps = {}, input: InputProps = {}) =>
    createElement(
      SearchBar,
      bar,
      createElement(
        SearchBarInputContainer,
        null,
        createElement(SearchBarInput, {
          placeholder: "Search by name",
          ...input,
        }),
      ),
    );

  // The one <input> in `within`
  function inputIn(within: ParentNode) {
    const [input, ...others] = within.querySelectorAll("input");
    expect(others).toEqual([]);
    expect(input).toBeDefined();
    return input!;
  }

  // The `id` of cmdk's hidden `<label>` in `within`, which SearchBar's
  // `label` fills
  function cmdkLabelId(within: ParentNode) {
    const [label, ...others] = within.querySelectorAll("label[cmdk-label]");
    expect(others).toEqual([]);
    expect(label?.id).toBeTruthy();
    return label!.id;
  }

  // Mounts a SearchBar after `before`, such as a Label or a heading, and
  // returns its <input>
  async function input(
    bar: BarProps,
    props: InputProps,
    before: ReactElement | null = null,
  ) {
    const page = await mount(
      createElement("div", null, before, searchBar(bar, props)),
    );
    return inputIn(page);
  }

  test("is the placeholder-only input's empty name: there is no default", async () => {
    const field = await input({}, {});
    expect(field.getAttribute("role")).toBe("combobox");
    expect(computeAccessibleName(field)).toBe("");
  });

  test("comes from its `aria-label`, and cmdk's `aria-labelledby` is dropped", async () => {
    const field = await input({}, { "aria-label": "Cari nama" });
    expect(computeAccessibleName(field)).toBe("Cari nama");
    expect(field.hasAttribute("aria-labelledby")).toBe(false);
  });

  test("comes from a Label's `id` that its `aria-labelledby` points at", async () => {
    const field = await input(
      {},
      { "aria-labelledby": "nama" },
      createElement(Label, { id: "nama" }, "Cari nama"),
    );
    expect(field.getAttribute("aria-labelledby")).toBe("nama");
    expect(computeAccessibleName(field)).toBe("Cari nama");
  });

  test("comes from a heading its `aria-labelledby` points at", async () => {
    const field = await input(
      {},
      { "aria-labelledby": "tajuk" },
      createElement("h2", { id: "tajuk" }, "Cari pegawai"),
    );
    expect(computeAccessibleName(field)).toBe("Cari pegawai");
  });

  test("comes from its `aria-labelledby` over its `aria-label`", async () => {
    const field = await input(
      {},
      { "aria-labelledby": "tajuk", "aria-label": "Nama" },
      createElement("h2", { id: "tajuk" }, "Cari pegawai"),
    );
    expect(computeAccessibleName(field)).toBe("Cari pegawai");
  });

  test("comes from SearchBar's `label`", async () => {
    const field = await input({ label: "Cari nama" }, {});
    expect(computeAccessibleName(field)).toBe("Cari nama");
  });

  test("comes from its `aria-label` over SearchBar's `label`", async () => {
    const field = await input({ label: "Cari nama" }, { "aria-label": "Nama" });
    expect(computeAccessibleName(field)).toBe("Nama");
  });

  test("comes from its `aria-labelledby` over SearchBar's `label`", async () => {
    const field = await input(
      { label: "Cari nama" },
      { "aria-labelledby": "tajuk" },
      createElement("h2", { id: "tajuk" }, "Cari pegawai"),
    );
    expect(computeAccessibleName(field)).toBe("Cari pegawai");
  });

  // A prop-forwarding wrapper passes `undefined`, and an empty or blank
  // string names nothing, so each counts as not passed
  test.each<[string, InputProps]>([
    ["aria-labelledby={undefined}", { "aria-labelledby": undefined }],
    ['aria-labelledby=""', { "aria-labelledby": "" }],
    ['aria-labelledby="  "', { "aria-labelledby": "  " }],
    ["aria-label={undefined}", { "aria-label": undefined }],
    ['aria-label=""', { "aria-label": "" }],
    ['aria-label="  "', { "aria-label": "  " }],
  ])(
    "comes from SearchBar's `label` with %s, through cmdk's hidden label",
    async (_, props) => {
      const page = await mount(searchBar({ label: "Cari nama" }, props));
      const field = inputIn(page);
      expect(computeAccessibleName(field)).toBe("Cari nama");
      expect(field.getAttribute("aria-labelledby")).toBe(cmdkLabelId(page));
    },
  );

  test('comes from its `aria-label` with aria-labelledby=""', async () => {
    const field = await input(
      {},
      { "aria-labelledby": "", "aria-label": "Cari nama" },
    );
    expect(computeAccessibleName(field)).toBe("Cari nama");
    expect(field.hasAttribute("aria-labelledby")).toBe(false);
  });

  test("is each SearchBar's own, with several on one page", async () => {
    const bars = (ids: string[]) =>
      ids.map((id) =>
        createElement("div", { key: id, "data-bar": id }, [
          createElement(Label, { key: "label", id }, `Cari ${id}`),
          createElement(
            SearchBar,
            { key: "bar" },
            createElement(SearchBarInput, { "aria-labelledby": id }),
          ),
        ]),
      );
    const page = await mount(
      createElement(
        "div",
        null,
        createElement(
          "div",
          { "data-bar": "satu" },
          searchBar({}, { "aria-label": "Satu" }),
        ),
        createElement(
          "div",
          { "data-bar": "dua" },
          searchBar({ label: "Dua" }),
        ),
        ...bars(["negeri", "daerah"]),
      ),
    );
    const named = (bar: string) =>
      computeAccessibleName(inputIn(page.querySelector(`[data-bar=${bar}]`)!));
    expect(["satu", "dua", "negeri", "daerah"].map(named)).toEqual([
      "Satu",
      "Dua",
      "Cari negeri",
      "Cari daerah",
    ]);
  });

  test("follows an `aria-label` added and removed across renders", async () => {
    const container = document.body.appendChild(document.createElement("div"));
    const root = createRoot(container);
    unmounts.push(async () => {
      await act(async () => root.unmount());
      container.remove();
    });
    const names: string[] = [];
    for (const props of [{}, { "aria-label": "Nama" }, {}]) {
      await act(async () =>
        root.render(searchBar({ label: "Cari nama" }, props)),
      );
      names.push(computeAccessibleName(inputIn(container)));
    }
    expect(names).toEqual(["Cari nama", "Nama", "Cari nama"]);
    expect(inputIn(container).getAttribute("aria-labelledby")).toBe(
      cmdkLabelId(container),
    );
  });

  test("leaves an `aria-describedby` on the <input>", async () => {
    const field = await input(
      {},
      { "aria-label": "Cari nama", "aria-describedby": "petunjuk" },
      createElement("p", { id: "petunjuk" }, "Taip sekurang-kurangnya 3 huruf"),
    );
    expect(field.getAttribute("aria-describedby")).toBe("petunjuk");
  });
});

describe("A toast composed by hand", () => {
  // A toast composed as the docs compose one, with its status icon, title,
  // description, close button and countdown bar. Returns its root.
  async function toast(label?: string) {
    const page = await mount(
      createElement(
        ToastProvider,
        null,
        createElement(
          ToastRoot,
          { variant: "success" },
          createElement(ToastIcon),
          createElement(
            "div",
            { className: "space-y-1" },
            createElement(ToastTitle, null, "Saved"),
            createElement(ToastDescription, null, "Your changes are saved."),
          ),
          createElement(ToastClose, ariaLabel(label)),
          createElement(ToastProgress),
        ),
        createElement(ToastViewport),
      ),
    );
    const [root, ...others] = page.querySelectorAll("li");
    expect(others).toEqual([]);
    expect(unnamed(root!)).toEqual([]);
    return root!;
  }

  test('names its ToastClose "Close" by default', async () => {
    expect(nameOf(await toast())).toBe("Close");
  });

  test("lets an `aria-label` rename its ToastClose", async () => {
    expect(nameOf(await toast("Tutup"))).toBe("Tutup");
  });

  // As in AutoToast's toasts, the title carries the toast's meaning
  test("hides its ToastIcon and ToastProgress", async () => {
    const root = await toast();
    const [statusIcon, ...others] = [...root.querySelectorAll("svg")].filter(
      (svg) => !isIcon(svg, CrossIcon),
    );
    expect(others).toEqual([]);
    const countdown = root.querySelector(".animate-expire");
    for (const hidden of [statusIcon!.parentElement, countdown])
      expect(hidden!.getAttribute("aria-hidden")).toBe("true");
    expect(
      root.querySelectorAll('[role="img"], [role="progressbar"]'),
    ).toHaveLength(0);
  });
});

// The props that name NavbarMenu's `<nav>` landmark, and the classes it
// passes to its desktop list and mobile menu
type NavbarMenuProps = Omit<ComponentProps<typeof NavbarMenu>, "children">;

// Every element on the page whose attribute `name` is `value`. React doesn't
// warn when an `aria-*` attribute lands on the wrong element, or on none, so
// check where each one lands.
const withAttribute = (name: string, value: string) => [
  ...document.querySelectorAll(`[${name}="${value}"]`),
];

describe("NavbarMenu's `<nav>`", () => {
  // A Navbar with a menu and its toggle, as the docs compose one, after a
  // heading that `aria-labelledby` can point at. `menu` goes to NavbarMenu
  // and `header` to Navbar. Returns the page; the mobile menu, once open,
  // portals into `<body>`.
  const navbar = (
    menu: NavbarMenuProps = {},
    header: ComponentProps<typeof Navbar> = {},
  ) =>
    mount(
      createElement(
        "div",
        null,
        createElement("h2", { id: "menu-title" }, "Menu utama"),
        createElement(
          Navbar,
          header,
          createElement(NavbarMenu, {
            ...menu,
            children: createElement(NavbarMenuItem, {
              href: "#perkhidmatan",
              children: "Perkhidmatan",
            }),
          }),
          createElement(NavbarAction),
        ),
      ),
    );

  test('is the page\'s one `<nav>`, named "Main" by default', async () => {
    await navbar();
    expect(nameOf(document, "nav")).toBe("Main");
    expect(withAttribute("aria-label", "Main")).toEqual([
      document.querySelector("nav"),
    ]);
  });

  test("takes its name from an `aria-label` on NavbarMenu", async () => {
    await navbar({ "aria-label": "Utama" });
    expect(nameOf(document, "nav")).toBe("Utama");
    expect(withAttribute("aria-label", "Utama")).toEqual([
      document.querySelector("nav"),
    ]);
  });

  test("takes its name from the element `aria-labelledby` names", async () => {
    await navbar({ "aria-labelledby": "menu-title" });
    expect(nameOf(document, "nav")).toBe("Menu utama");
    expect(withAttribute("aria-labelledby", "menu-title")).toEqual([
      document.querySelector("nav"),
    ]);
  });

  test("leaves an `aria-label` on Navbar on the `<header>`", async () => {
    await navbar({}, { "aria-label": "Pengepala" });
    expect(withAttribute("aria-label", "Pengepala")).toEqual([
      document.querySelector("header"),
    ]);
    expect(nameOf(document, "nav")).toBe("Main");
  });

  test("keeps its class and passes on the list's and mobile menu's", async () => {
    const page = await navbar({
      classNameNavDesktop: "senarai-desktop",
      classNameNavMobile: "menu-mudah-alih",
    });
    const nav = document.querySelector("nav")!;
    expect([...nav.classList]).toEqual(["grow"]);

    const [list, ...otherLists] = document.querySelectorAll(".senarai-desktop");
    expect(otherLists).toEqual([]);
    expect(list!.tagName).toBe("UL");
    expect(list!.closest("nav")).toBe(nav);
    expect(list!.textContent).toBe("Perkhidmatan");

    // The mobile menu renders only once the toggle opens it
    expect(document.querySelectorAll(".menu-mudah-alih")).toHaveLength(0);
    await act(async () => page.querySelector("button")!.click());
    const [menu, ...otherMenus] = document.querySelectorAll(".menu-mudah-alih");
    expect(otherMenus).toEqual([]);
    expect([...menu!.classList]).toContain("xl:hidden");
    expect(menu!.textContent).toBe("Perkhidmatan");
  });
});

describe("NavbarAction's menu toggle", () => {
  // A Navbar with only its toggle. Returns the toggle's name.
  const toggle = async (label?: string) =>
    nameOf(
      await mount(
        createElement(
          Navbar,
          null,
          createElement(NavbarAction, ariaLabel(label)),
        ),
      ),
    );

  test('is named "Menu" by default', async () => {
    expect(await toggle()).toBe("Menu");
  });

  test("lets an `aria-label` rename it", async () => {
    expect(await toggle("Menu navigasi")).toBe("Menu navigasi");
  });
});

// The toggle as it opens and closes the mobile menu (#162). Its name stays
// the same, and `aria-expanded` and `aria-controls` give the menu's state.
describe("NavbarAction's menu toggle, opening and closing the menu", () => {
  // A Navbar with a one-item menu and its toggle, or with only its toggle
  // when `menu` is false. `action` goes to NavbarAction. Returns the toggle.
  async function toggle(
    action: ComponentProps<typeof NavbarAction> = {},
    { menu = true } = {},
  ) {
    const page = await mount(
      createElement(
        Navbar,
        null,
        menu &&
          createElement(NavbarMenu, {
            children: createElement(NavbarMenuItem, {
              href: "#perkhidmatan",
              children: "Perkhidmatan",
            }),
          }),
        createElement(NavbarAction, action),
      ),
    );
    const [button, ...others] = page.querySelectorAll("button");
    expect(others).toEqual([]);
    return button!;
  }

  const press = (button: HTMLButtonElement) => act(async () => button.click());

  // The toggle's name, `aria-expanded` and `aria-controls`
  const state = (button: HTMLButtonElement) => ({
    name: computeAccessibleName(button),
    expanded: button.getAttribute("aria-expanded"),
    controls: button.getAttribute("aria-controls"),
  });

  test('is named "Menu", and says the menu is closed, then open, then closed', async () => {
    const button = await toggle();
    const named = () => [
      computeAccessibleName(button),
      button.getAttribute("aria-expanded"),
    ];
    const closed = named();
    await press(button);
    const open = named();
    await press(button);
    expect([closed, open, named()]).toEqual([
      ["Menu", "false"],
      ["Menu", "true"],
      ["Menu", "false"],
    ]);
  });

  test("controls the menu's panel only while it's open", async () => {
    const button = await toggle();
    expect(button.hasAttribute("aria-controls")).toBe(false);
    await press(button);
    const panel = document.getElementById(
      button.getAttribute("aria-controls")!,
    );
    expect(panel?.querySelector('a[href="#perkhidmatan"]')).not.toBeNull();
    // The panel is the menu, not part of the header around the toggle
    expect(panel?.contains(button)).toBe(false);
    await press(button);
    expect(button.hasAttribute("aria-controls")).toBe(false);
  });

  test("with no NavbarMenu, says it's open but controls nothing", async () => {
    const button = await toggle({}, { menu: false });
    await press(button);
    expect(state(button)).toEqual({
      name: "Menu",
      expanded: "true",
      controls: null,
    });
  });

  test("lets an `aria-label` rename it, open or closed", async () => {
    const button = await toggle(ariaLabel("Navigasi"));
    const closed = computeAccessibleName(button);
    await press(button);
    expect([closed, computeAccessibleName(button)]).toEqual([
      "Navigasi",
      "Navigasi",
    ]);
    expect(withAttribute("aria-label", "Navigasi")).toEqual([button]);
  });

  test("calls `onClick` with no arguments on each press, opening and closing", async () => {
    const onClick = vi.fn();
    const button = await toggle({ onClick });
    await press(button);
    await press(button);
    expect(onClick.mock.calls).toEqual([[], []]);
  });

  test('outside a Navbar, mounts as a toggle named "Menu" that opens nothing', async () => {
    const onClick = vi.fn();
    const page = await mount(createElement(NavbarAction, { onClick }));
    const button = page.querySelector("button")!;
    await press(button);
    expect(state(button)).toEqual({
      name: "Menu",
      expanded: "false",
      controls: null,
    });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('outside a Navbar, renders on the server as a closed toggle named "Menu"', () => {
    const html = renderToString(createElement(NavbarAction));
    const page = document.body.appendChild(document.createElement("div"));
    unmounts.push(async () => page.remove());
    page.innerHTML = html;
    expect(state(page.querySelector("button")!)).toEqual({
      name: "Menu",
      expanded: "false",
      controls: null,
    });
  });
});

// The mobile menu's panel, a `role="dialog"` with no visible title, takes its
// name from the toggle (#169), so renaming the toggle renames the panel too
describe("The mobile menu's panel", () => {
  // A menu with one item
  const menu = () =>
    createElement(NavbarMenu, {
      children: createElement(NavbarMenuItem, {
        href: "#perkhidmatan",
        children: "Perkhidmatan",
      }),
    });

  // A Navbar with a one-item menu and its toggle, after a heading that the
  // toggle's `aria-labelledby` can point at. `action` goes to NavbarAction.
  const navbar = (action: ComponentProps<typeof NavbarAction> = {}) =>
    createElement(
      "div",
      null,
      createElement("h2", { id: "menu-title" }, "Menu utama"),
      createElement(Navbar, null, menu(), createElement(NavbarAction, action)),
    );

  // The one toggle in `page`
  const toggleIn = (page: ParentNode) => {
    const [button, ...others] = page.querySelectorAll("button");
    expect(others).toEqual([]);
    expect(button).toBeDefined();
    return button!;
  };

  // The panel `toggle` controls. Its `aria-controls` names the panel only
  // while the menu is open.
  const panelOf = (toggle: HTMLButtonElement) => {
    const panel = document.getElementById(
      toggle.getAttribute("aria-controls") ?? "",
    );
    expect(panel).not.toBeNull();
    return panel!;
  };

  // Opens the menu from the toggle in `page`, and returns the toggle and the
  // panel
  async function openMenu(page: ParentNode) {
    const toggle = toggleIn(page);
    await act(async () => toggle.click());
    return { toggle, panel: panelOf(toggle) };
  }

  test('is a dialog named "Menu", after the toggle, by default', async () => {
    const { toggle, panel } = await openMenu(await mount(navbar()));
    expect({
      role: panel.getAttribute("role"),
      name: computeAccessibleName(panel),
    }).toEqual({ role: "dialog", name: "Menu" });
    expect(computeAccessibleName(toggle)).toBe("Menu");
    expect(toggle.hasAttribute("aria-haspopup")).toBe(false);
  });

  test("is renamed with the toggle by an `aria-label` on NavbarAction", async () => {
    const { toggle, panel } = await openMenu(
      await mount(navbar(ariaLabel("Navigasi"))),
    );
    expect([
      computeAccessibleName(toggle),
      computeAccessibleName(panel),
    ]).toEqual(["Navigasi", "Navigasi"]);
    // The panel refers to the toggle's name, rather than copying it
    expect(withAttribute("aria-label", "Navigasi")).toEqual([toggle]);
  });

  test("is renamed with the toggle by an `aria-labelledby` on NavbarAction", async () => {
    const { toggle, panel } = await openMenu(
      await mount(navbar({ "aria-labelledby": "menu-title" })),
    );
    expect([
      computeAccessibleName(toggle),
      computeAccessibleName(panel),
    ]).toEqual(["Menu utama", "Menu utama"]);
  });

  test('is still named "Menu", as the toggle is, when NavbarAction\'s `aria-labelledby` points at no element on the page', async () => {
    const { toggle, panel } = await openMenu(
      await mount(navbar({ "aria-labelledby": "no-such-element" })),
    );
    expect([
      computeAccessibleName(toggle),
      computeAccessibleName(panel),
    ]).toEqual(["Menu", "Menu"]);
  });

  test('leaves an `id` on NavbarAction on the toggle, and is still named "Menu"', async () => {
    const { toggle, panel } = await openMenu(
      await mount(navbar({ id: "my-toggle" })),
    );
    expect(toggle.id).toBe("my-toggle");
    expect(document.querySelectorAll("#my-toggle")).toHaveLength(1);
    expect(computeAccessibleName(panel)).toBe("Menu");
  });

  test("follows the toggle's name as NavbarAction's `id`, `aria-label` and `aria-labelledby` change while the menu is open", async () => {
    const container = document.body.appendChild(document.createElement("div"));
    const root = createRoot(container);
    unmounts.push(async () => {
      await act(async () => root.unmount());
      container.remove();
    });
    const render = (action: ComponentProps<typeof NavbarAction>) =>
      act(async () => root.render(navbar(action)));
    await render({});
    const { toggle } = await openMenu(container);
    const names = [computeAccessibleName(panelOf(toggle))];
    for (const action of [
      { id: "my-toggle" },
      { id: "my-toggle", "aria-label": "Navigasi" },
      { "aria-labelledby": "menu-title" },
      {},
    ]) {
      await render(action);
      names.push(computeAccessibleName(panelOf(toggleIn(container))));
    }
    expect(names).toEqual(["Menu", "Menu", "Navigasi", "Menu utama", "Menu"]);
  });

  test("hydrates from server HTML with no error or warning, and is then named after the toggle", async () => {
    const tree = () => navbar(ariaLabel("Navigasi"));
    const container = document.body.appendChild(document.createElement("div"));
    container.innerHTML = renderToString(tree());
    // The toggle's own id, which the panel will refer to
    const serverId = toggleIn(container).id;
    const recoverable: unknown[] = [];
    const root = await act(async () =>
      hydrateRoot(container, tree(), {
        onRecoverableError: (error) => recoverable.push(error),
      }),
    );
    unmounts.push(async () => {
      await act(async () => root.unmount());
      container.remove();
    });
    expect(recoverable).toEqual([]);
    expect(serverId).not.toBe("");
    const { toggle, panel } = await openMenu(container);
    expect(toggle.id).toBe(serverId);
    expect(computeAccessibleName(panel)).toBe("Navigasi");
  });

  // NavbarContext, under the name the library's registry holds it by, so a
  // test can provide what a copy of the library from before #169 provides,
  // or toggle the menu as such a copy's toggle does (CONTRIBUTING.md,
  // Contexts)
  const OlderNavbarContext = sharedContext<{
    id: string;
    show: boolean;
    setShow: (value: boolean) => void;
  }>("NavbarContext", { id: "", show: false, setShow: () => {} });

  test("is still named \"Menu\" when the Navbar's context comes from an older copy, without the toggle's name", async () => {
    await mount(
      createElement(
        OlderNavbarContext.Provider,
        { value: { id: "older-header", show: true, setShow: () => {} } },
        createElement("header", { id: "older-header" }, menu()),
        createElement(NavbarAction, ariaLabel("Navigasi")),
      ),
    );
    const [panel, ...others] = document.querySelectorAll('[role="dialog"]');
    expect(others).toEqual([]);
    expect(computeAccessibleName(panel!)).toBe("Menu");
  });

  test("is still named \"Menu\" when an older copy's toggle opens it, which doesn't give its name", async () => {
    const OlderToggle = () => {
      const { show, setShow } = useContext(OlderNavbarContext);
      return createElement("button", {
        type: "button",
        "aria-label": "Navigasi",
        onClick: () => setShow(!show),
      });
    };
    const page = await mount(
      createElement(Navbar, null, menu(), createElement(OlderToggle)),
    );
    await act(async () => toggleIn(page).click());
    const [panel, ...others] = document.querySelectorAll('[role="dialog"]');
    expect(others).toEqual([]);
    expect(computeAccessibleName(panel!)).toBe("Menu");
  });
});

describe("MastheadTrigger", () => {
  const text = "Kenal pasti begini";

  // A Masthead whose trigger takes `props`, which show "Kenal pasti begini"
  // unless they're given. Returns the trigger.
  async function trigger(
    props: ComponentProps<typeof MastheadTrigger> = { children: text },
  ) {
    const page = await mount(
      createElement(
        Masthead,
        null,
        createElement(
          MastheadHeader,
          null,
          createElement(
            MastheadTitle,
            null,
            "Laman Web Rasmi Kerajaan Malaysia",
          ),
          createElement(MastheadTrigger, props),
        ),
      ),
    );
    const [button, ...others] = page.querySelectorAll("button");
    expect(others).toEqual([]);
    return button!;
  }

  // Its text names it, below `sm:` too, where only its chevron shows, so
  // the name holds what sighted users see (WCAG 2.5.3, #177)
  test("is named by the text it shows, with no `aria-label`", async () => {
    const button = await trigger();
    expect(button.textContent).toBe(text);
    expect(computeAccessibleName(button)).toBe(text);
    expect(button.hasAttribute("aria-label")).toBe(false);
  });

  // With no children it shows only its chevron, at every width
  test.each([undefined, null, false, ""])(
    'is named "Toggle masthead" when its children are %j',
    async (children) => {
      const button = await trigger({ children });
      expect(button.textContent).toBe("");
      expect(computeAccessibleName(button)).toBe("Toggle masthead");
    },
  );

  test("takes its name from an `aria-label` that repeats its text", async () => {
    const button = await trigger({ "aria-label": text, children: text });
    expect(computeAccessibleName(button)).toBe(text);
  });

  // ADR-0008: the author's `aria-label` wins over the default
  test.each([
    ["with", text],
    ["without", undefined],
  ])("lets an `aria-label` rename it, %s children", async (_, children) => {
    const button = await trigger({ "aria-label": "Tunjuk cara", children });
    expect(computeAccessibleName(button)).toBe("Tunjuk cara");
  });

  // The state is on `aria-expanded`, so the name stays as it is
  test("keeps its name, and says the masthead is closed, then open, then closed", async () => {
    const button = await trigger();
    const named = () => [
      computeAccessibleName(button),
      button.getAttribute("aria-expanded"),
    ];
    const closed = named();
    await act(async () => button.click());
    const open = named();
    await act(async () => button.click());
    expect([closed, open, named()]).toEqual([
      [text, "false"],
      [text, "true"],
      [text, "false"],
    ]);
  });
});

describe("Breadcrumb's `<nav>`", () => {
  // A breadcrumb trail of a link and the current page. Returns the trail's
  // name.
  const breadcrumb = async (label?: string) =>
    nameOf(
      await mount(
        createElement(
          Breadcrumb,
          ariaLabel(label),
          createElement(
            BreadcrumbItem,
            null,
            createElement(BreadcrumbLink, { href: "#utama" }, "Laman Utama"),
          ),
          createElement(BreadcrumbSeparator),
          createElement(
            BreadcrumbItem,
            null,
            createElement(BreadcrumbPage, null, "Laman Anda"),
          ),
        ),
      ),
      "nav",
    );

  test('is named "breadcrumb" by default', async () => {
    expect(await breadcrumb()).toBe("breadcrumb");
  });

  test("lets an `aria-label` rename it", async () => {
    expect(await breadcrumb("Laluan halaman")).toBe("Laluan halaman");
  });
});
