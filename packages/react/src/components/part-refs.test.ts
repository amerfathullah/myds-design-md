// @vitest-environment happy-dom
//
// A ref on each part of Masthead, Navbar, DateField, TimeField, Spinner,
// Breadcrumb, Pagination, Radio and SearchBar is the element the part renders,
// the one its props land on, so it works on React 18 as the parts' types say
// (#212). Each part is mounted in the parents its docs use.
import {
  act,
  createElement,
  createRef,
  type ReactElement,
  type Ref,
} from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { Lock2Icon, PutrajayaIcon } from "../icons";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb";
import { DateField } from "./date-field";
import { describeForwardedRefs, whileMounted } from "./forwarded-ref-tests";
import {
  Masthead,
  MastheadContent,
  MastheadHeader,
  MastheadSection,
  MastheadTitle,
  MastheadTrigger,
} from "./masthead";
import {
  Navbar,
  NavbarAction,
  NavbarLogo,
  NavbarMenu,
  NavbarMenuItem,
} from "./navbar";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationNumber,
  PaginationPrevious,
} from "./pagination";
import {
  Radio,
  RadioButton,
  RadioHintText,
  RadioItem,
  RadioLabel,
} from "./radio";
import {
  SearchBar,
  SearchBarClearButton,
  SearchBarHint,
  SearchBarInput,
  SearchBarInputContainer,
  SearchBarResults,
  SearchBarResultsGroup,
  SearchBarResultsItem,
  SearchBarResultsList,
  SearchBarSearchButton,
} from "./search-bar";
import { Spinner } from "./spinner";
import { TimeField } from "./time-field";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const consoleMethods = ["error", "warn", "log", "info"] as const;

beforeEach(() => {
  for (const method of consoleMethods)
    vi.spyOn(console, method).mockImplementation(() => {});
});

// No test logs anything, React's warnings and errors included, and nothing
// is left on the page
afterEach(() => {
  const logged = consoleMethods.flatMap((method) =>
    vi.mocked(console[method]).mock.calls.map((args) => [method, ...args]),
  );
  vi.restoreAllMocks();
  expect(logged).toEqual([]);
  expect(document.body.innerHTML).toBe("");
});

// The props a composition gives `part`, beside its own: a ref, where the test
// puts one on it. Each part's ref is typed as its element's; the type-tests
// check those types.
type Extra = (part: unknown) => { ref: Ref<never> } | null;

// A ref on `on` alone
const refOn =
  (on: unknown, ref: Ref<Element>): Extra =>
  (part) =>
    part === on ? { ref: ref as Ref<never> } : null;

// Each component composed as its docs compose it, with `extra(part)` on each
// part
const compositions = {
  masthead: (extra: Extra) =>
    createElement(
      Masthead,
      extra(Masthead),
      createElement(
        MastheadHeader,
        extra(MastheadHeader),
        createElement(
          MastheadTitle,
          extra(MastheadTitle),
          "Official Malaysian Government Website",
        ),
        createElement(
          MastheadTrigger,
          extra(MastheadTrigger),
          "Here's how you know",
        ),
      ),
      createElement(
        MastheadContent,
        extra(MastheadContent),
        createElement(
          MastheadSection,
          {
            ...extra(MastheadSection),
            icon: createElement(PutrajayaIcon),
            title: "Official government websites end with .gov.my",
          },
          "If the link does not end with .gov.my, exit the website immediately even if it looks similar.",
        ),
        createElement(
          MastheadSection,
          {
            icon: createElement(Lock2Icon),
            title: "Secure websites use HTTPS",
          },
          "Look for a lock or https:// as an added precaution.",
        ),
      ),
    ),
  navbar: (extra: Extra) =>
    createElement(
      Navbar,
      extra(Navbar),
      createElement(
        NavbarLogo,
        { ...extra(NavbarLogo), src: "/jata-negara.png", alt: "Jata Negara" },
        "Kementerian Digital",
      ),
      createElement(
        NavbarMenu,
        null,
        createElement(NavbarMenuItem, {
          ...extra(NavbarMenuItem),
          href: "/perkhidmatan",
          children: "Perkhidmatan",
        }),
        createElement(NavbarMenuItem, {
          href: "/hubungi",
          children: "Hubungi",
        }),
      ),
      createElement(NavbarAction, extra(NavbarAction)),
    ),
  "date field": (extra: Extra) =>
    createElement(DateField, {
      ...extra(DateField),
      "aria-label": "Tarikh lahir",
    }),
  "time field": (extra: Extra) =>
    createElement(TimeField, {
      ...extra(TimeField),
      "aria-label": "Masa temujanji",
    }),
  spinner: (extra: Extra) => createElement(Spinner, extra(Spinner)),
  breadcrumb: (extra: Extra) =>
    createElement(
      Breadcrumb,
      null,
      createElement(
        BreadcrumbItem,
        null,
        createElement(BreadcrumbLink, { href: "#home" }, "Home"),
      ),
      createElement(BreadcrumbSeparator, extra(BreadcrumbSeparator)),
      createElement(
        BreadcrumbItem,
        null,
        createElement(BreadcrumbPage, null, "Your Page"),
      ),
    ),
  pagination: (extra: Extra) =>
    createElement(
      Pagination,
      { count: 100, limit: 10, page: 1, onPageChange: () => {} },
      createElement(
        PaginationContent,
        null,
        createElement(PaginationItem, null, createElement(PaginationPrevious)),
        createElement(
          PaginationItem,
          null,
          createElement(PaginationNumber, { number: 1 }),
        ),
        createElement(
          PaginationItem,
          null,
          createElement(PaginationEllipsis, extra(PaginationEllipsis)),
        ),
        createElement(PaginationItem, null, createElement(PaginationNext)),
      ),
    ),
  radio: (extra: Extra) =>
    createElement(
      Radio,
      { defaultValue: "email" },
      createElement(
        RadioItem,
        extra(RadioItem),
        createElement(RadioButton, { value: "email", id: "email" }),
        createElement(
          "div",
          null,
          createElement(
            RadioLabel,
            { ...extra(RadioLabel), htmlFor: "email" },
            "Email",
          ),
          createElement(
            RadioHintText,
            extra(RadioHintText),
            "We will email you.",
          ),
        ),
      ),
    ),
  "search bar": (extra: Extra) =>
    createElement(
      SearchBar,
      extra(SearchBar),
      createElement(
        SearchBarInputContainer,
        extra(SearchBarInputContainer),
        createElement(SearchBarInput, {
          ...extra(SearchBarInput),
          "aria-label": "Search by name",
          placeholder: "Search by name",
        }),
        createElement(SearchBarHint, extra(SearchBarHint), "Press / to search"),
        createElement(SearchBarClearButton, extra(SearchBarClearButton)),
        createElement(SearchBarSearchButton, extra(SearchBarSearchButton)),
      ),
      createElement(
        SearchBarResults,
        { ...extra(SearchBarResults), open: true },
        createElement(
          SearchBarResultsList,
          extra(SearchBarResultsList),
          createElement(
            SearchBarResultsGroup,
            { ...extra(SearchBarResultsGroup), heading: "People" },
            createElement(
              SearchBarResultsItem,
              { ...extra(SearchBarResultsItem), value: "Tunku Abdul Rahman" },
              "Tunku Abdul Rahman",
            ),
          ),
        ),
      ),
    ),
} satisfies Record<string, (extra: Extra) => ReactElement>;

// The search bar's input
const searchInput = (container: Element) =>
  container.querySelector<HTMLInputElement>("input")!;

// The masthead's content: inside the masthead, the one `<div>` the
// collapsible marks with its state
const mastheadContent = (container: Element) =>
  container.querySelector("#masthead div[data-state]");

// Opens the masthead, as its trigger does, so its content shows its sections
async function openMasthead(container: Element) {
  await act(async () => container.querySelector("button")!.click());
}

describeForwardedRefs([
  {
    name: "Masthead",
    part: Masthead,
    element: '`<div id="masthead">`, not the collapsible around it',
    render: (ref) => compositions.masthead(refOn(Masthead, ref)),
    find: (container) => container.querySelector("#masthead"),
  },
  {
    name: "MastheadHeader",
    part: MastheadHeader,
    element: "`<div>`",
    render: (ref) => compositions.masthead(refOn(MastheadHeader, ref)),
    // The `<div>` around the flag and the title
    find: (container) =>
      container.querySelector("#masthead svg")!.parentElement,
  },
  {
    name: "MastheadTitle",
    part: MastheadTitle,
    element: "`<p>`",
    render: (ref) => compositions.masthead(refOn(MastheadTitle, ref)),
    find: (container) => container.querySelector("p"),
  },
  {
    name: "MastheadTrigger",
    part: MastheadTrigger,
    element: "`<button>`",
    render: (ref) => compositions.masthead(refOn(MastheadTrigger, ref)),
    find: (container) => container.querySelector("button"),
  },
  {
    name: "MastheadContent",
    part: MastheadContent,
    element: "`<div>`, which the trigger opens",
    render: (ref) => compositions.masthead(refOn(MastheadContent, ref)),
    find: mastheadContent,
  },
  {
    name: "MastheadSection",
    part: MastheadSection,
    element: "`<div>`",
    render: (ref) => compositions.masthead(refOn(MastheadSection, ref)),
    show: openMasthead,
    // The `<div>` around the first section's icon and text
    find: (container) =>
      mastheadContent(container)!.querySelector("svg")!.parentElement,
  },
  {
    name: "Navbar",
    part: Navbar,
    element: "`<header>`",
    render: (ref) => compositions.navbar(refOn(Navbar, ref)),
    find: (container) => container.querySelector("header"),
  },
  {
    name: "NavbarLogo",
    part: NavbarLogo,
    element: "`<a>`",
    render: (ref) => compositions.navbar(refOn(NavbarLogo, ref)),
    find: (container) => container.querySelector("img")!.closest("a"),
  },
  {
    name: "NavbarMenuItem",
    part: NavbarMenuItem,
    element: "`<li>`",
    render: (ref) => compositions.navbar(refOn(NavbarMenuItem, ref)),
    find: (container) => container.querySelector("nav li"),
  },
  {
    name: "NavbarAction",
    part: NavbarAction,
    element: "`<button>`, not the `<div>` around it",
    render: (ref) => compositions.navbar(refOn(NavbarAction, ref)),
    find: (container) => container.querySelector("button[aria-expanded]"),
  },
  {
    name: "DateField",
    part: DateField,
    element: '`<input type="date">`, not the frame around it',
    render: (ref) => compositions["date field"](refOn(DateField, ref)),
    find: (container) => container.querySelector('input[type="date"]'),
  },
  {
    name: "TimeField",
    part: TimeField,
    element: '`<input type="time">`, not the frame around it',
    render: (ref) => compositions["time field"](refOn(TimeField, ref)),
    find: (container) => container.querySelector('input[type="time"]'),
  },
  {
    name: "Spinner",
    part: Spinner,
    element: "outer `<div>`",
    render: (ref) => compositions.spinner(refOn(Spinner, ref)),
    find: (container) => container.firstElementChild,
  },
  {
    name: "BreadcrumbSeparator",
    part: BreadcrumbSeparator,
    element: "`<li>`",
    render: (ref) => compositions.breadcrumb(refOn(BreadcrumbSeparator, ref)),
    find: (container) => container.querySelector('li[role="presentation"]'),
  },
  {
    name: "PaginationEllipsis",
    part: PaginationEllipsis,
    element: "`<span>`",
    render: (ref) => compositions.pagination(refOn(PaginationEllipsis, ref)),
    // The `<span>` around the ellipsis icon and its hidden text
    find: (container) => container.querySelector("span.sr-only")!.parentElement,
  },
  {
    name: "RadioItem",
    part: RadioItem,
    element: "`<div>`",
    render: (ref) => compositions.radio(refOn(RadioItem, ref)),
    find: (container) => container.querySelector('[role="radiogroup"] > div'),
  },
  {
    name: "RadioLabel",
    part: RadioLabel,
    element: "`<label>`",
    render: (ref) => compositions.radio(refOn(RadioLabel, ref)),
    find: (container) => container.querySelector("label"),
  },
  {
    name: "RadioHintText",
    part: RadioHintText,
    element: "`<div>`, which describes the radio",
    render: (ref) => compositions.radio(refOn(RadioHintText, ref)),
    find: (container) =>
      document.getElementById(
        container
          .querySelector('[role="radio"]')!
          .getAttribute("aria-describedby")!,
      ),
  },
  {
    name: "SearchBar",
    part: SearchBar,
    element: "cmdk's root `<div>`",
    render: (ref) => compositions["search bar"](refOn(SearchBar, ref)),
    find: (container) => container.querySelector("[cmdk-root]"),
  },
  {
    name: "SearchBarInputContainer",
    part: SearchBarInputContainer,
    element: "`<div>`",
    render: (ref) =>
      compositions["search bar"](refOn(SearchBarInputContainer, ref)),
    find: (container) => searchInput(container).parentElement,
  },
  {
    name: "SearchBarInput",
    part: SearchBarInput,
    element: "`<input>`",
    render: (ref) => compositions["search bar"](refOn(SearchBarInput, ref)),
    find: searchInput,
  },
  {
    name: "SearchBarHint",
    part: SearchBarHint,
    element: "`<div>`",
    render: (ref) => compositions["search bar"](refOn(SearchBarHint, ref)),
    find: (container) => searchInput(container).nextElementSibling,
  },
  {
    name: "SearchBarClearButton",
    part: SearchBarClearButton,
    element: "`<button>`",
    render: (ref) =>
      compositions["search bar"](refOn(SearchBarClearButton, ref)),
    find: (container) => container.querySelector('button[aria-label="Clear"]'),
  },
  {
    name: "SearchBarSearchButton",
    part: SearchBarSearchButton,
    element: "`<button>`",
    render: (ref) =>
      compositions["search bar"](refOn(SearchBarSearchButton, ref)),
    find: (container) => container.querySelector('button[aria-label="Search"]'),
  },
  {
    name: "SearchBarResults",
    part: SearchBarResults,
    element: "`<div>`, around the list",
    render: (ref) => compositions["search bar"](refOn(SearchBarResults, ref)),
    find: (container) =>
      container.querySelector('[role="listbox"]')!.parentElement,
  },
  {
    name: "SearchBarResultsList",
    part: SearchBarResultsList,
    element: 'cmdk\'s `<div role="listbox">`',
    render: (ref) =>
      compositions["search bar"](refOn(SearchBarResultsList, ref)),
    find: (container) => container.querySelector('[role="listbox"]'),
    // cmdk renders the list again as its first item registers, which
    // detaches its ref and attaches it again. React 19 did this before the
    // list forwarded its ref too.
    attachments: 2,
  },
  {
    name: "SearchBarResultsGroup",
    part: SearchBarResultsGroup,
    element: 'cmdk\'s `<div role="presentation">`',
    render: (ref) =>
      compositions["search bar"](refOn(SearchBarResultsGroup, ref)),
    find: (container) => container.querySelector("[cmdk-group]"),
  },
  {
    name: "SearchBarResultsItem",
    part: SearchBarResultsItem,
    element: 'cmdk\'s `<div role="option">`',
    render: (ref) =>
      compositions["search bar"](refOn(SearchBarResultsItem, ref)),
    find: (container) =>
      container.querySelector(
        '[role="option"][data-value="Tunku Abdul Rahman"]',
      ),
    // cmdk renders the item again as it registers it, which detaches its ref
    // and attaches it again. React 19 did this before the item forwarded its
    // ref too.
    attachments: 2,
  },
]);

// With `show={false}` a Spinner renders nothing, so there's no element to
// give its ref
describe("a ref on a Spinner that isn't shown", () => {
  test("as an object, stays `null`", async () => {
    const ref = createRef<HTMLDivElement>();
    await whileMounted(createElement(Spinner, { ref, show: false }), async () =>
      expect(ref.current).toBeNull(),
    );
  });

  test("as a callback, isn't called", async () => {
    const ref = vi.fn();
    await whileMounted(
      createElement(Spinner, { ref, show: false }),
      async () => {},
    );
    expect(ref).not.toHaveBeenCalled();
  });
});

// A ref changes nothing a part renders: each composition server-renders the
// same with a ref on every part as with none. Forwarding the refs changed no
// markup either: on React 18.3.1 and 19.3.1, each composition, with a ref on
// every part and with none, server-rendered as on main (4e50f8f).
test.each(Object.keys(compositions) as (keyof typeof compositions)[])(
  "the %s server-renders the same with a ref on every part as with none",
  (name) => {
    const compose = compositions[name];
    const withRefs = compose(() => ({ ref: createRef() as Ref<never> }));
    expect(renderToStaticMarkup(withRefs)).toBe(
      renderToStaticMarkup(compose(() => null)),
    );
  },
);
