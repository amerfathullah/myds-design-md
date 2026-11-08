// @vitest-environment happy-dom
// Two copies of an icon on one page each refer only to their own clip paths,
// masks and gradients: the ids a copy refers to are its own, and each of its
// `url(#…)` and `href="#…"` references names an element inside it. A browser
// resolves such a reference to the first element in the page with that id, so
// copies that shared ids would draw with the first copy's, and hiding that copy
// would blank or distort the others (#151). Nor does a copy carry an id that
// nothing in it refers to, such as a Figma layer name like `Vector`, which
// every copy would repeat, and which an app's own id could clash with (#153).
// This checks every icon that `@amerfathullah/myds-react/icon` exports,
// rendered on the page and on the server, by its ids and references, not its
// pixels. It sits outside the icon directory, which the icon generator
// rewrites.
import {
  act,
  createElement,
  Fragment,
  type FunctionComponent,
  type SVGProps,
} from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import * as icons from "../icons";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

type Icon = FunctionComponent<SVGProps<SVGSVGElement>>;

// The deprecated Jata Negara keeps its source's fixed ids until the next major
// deletes it (ADR-0007, #140)
const sharingIds = ["JataNegaraIcon"];

const exported = Object.entries(icons as Record<string, Icon>);
const checked = exported.filter(([name]) => !sharingIds.includes(name));

/** Two copies of the icon, side by side */
const twoCopies = (icon: Icon) =>
  createElement(Fragment, null, createElement(icon), createElement(icon));

/** The ids the copy's `url(#…)`, `href="#…"` and `xlink:href="#…"` name */
function references(copy: Element): string[] {
  return [copy, ...copy.querySelectorAll("*")].flatMap((element) =>
    [...element.attributes].flatMap(({ name, value }) => {
      if (name === "href" || name === "xlink:href") {
        return value.startsWith("#") ? [value.slice(1)] : [];
      }
      return [...value.matchAll(/url\(\s*["']?#([^"')\s]+)/g)].map(
        ([, id]) => id!,
      );
    }),
  );
}

/** The references of the copy that don't resolve to an element inside it */
function strayReferences(copy: Element): string[] {
  return references(copy).filter(
    (id) => !copy.contains(document.getElementById(id)),
  );
}

/** The ids in the copy, the copy's own too, that nothing in it refers to */
function unreferencedIds(copy: Element): string[] {
  const referred = new Set(references(copy));
  return [copy, ...copy.querySelectorAll("[id]")]
    .map((element) => element.id)
    .filter((id) => id && !referred.has(id));
}

/** The ids both copies refer to */
function sharedReferences([first, second]: Element[]): string[] {
  const firstIds = new Set(references(first!));
  return [...new Set(references(second!))].filter((id) => firstIds.has(id));
}

const cleanups: (() => Promise<void>)[] = [];

/** A container on the page, removed after the test */
function container() {
  const element = document.body.appendChild(document.createElement("div"));
  cleanups.push(async () => element.remove());
  return element;
}

/** The copies, rendered in the browser */
async function renderOnPage(icon: Icon) {
  const element = container();
  const root = createRoot(element);
  await act(async () => root.render(twoCopies(icon)));
  cleanups.push(async () => act(async () => root.unmount()));
  return [...element.children];
}

// What has gone through `console.error`, React's warnings included
const errors = () => vi.mocked(console.error).mock.calls;

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

// No test logs an error or leaves anything on the page
afterEach(async () => {
  while (cleanups.length) await cleanups.pop()!();
  const logged = errors();
  vi.restoreAllMocks();
  expect(logged).toEqual([]);
  expect(document.body.innerHTML).toBe("");
});

describe.each(checked)("two copies of %s", (_, icon) => {
  test("refer to no id in common, rendered on the page", async () => {
    const copies = await renderOnPage(icon);

    expect(copies).toHaveLength(2);
    expect(sharedReferences(copies)).toEqual([]);
  });

  test("each resolve every reference inside themselves, rendered on the page", async () => {
    const copies = await renderOnPage(icon);

    for (const copy of copies) expect(strayReferences(copy)).toEqual([]);
  });

  test("each carry only ids they refer to, rendered on the page", async () => {
    const copies = await renderOnPage(icon);

    for (const copy of copies) expect(unreferencedIds(copy)).toEqual([]);
  });

  test("refer to no id in common, rendered on the server, and hydrate with no mismatch", async () => {
    const element = container();
    element.innerHTML = renderToString(twoCopies(icon));
    const copies = [...element.children];
    const server = element.innerHTML;

    expect(copies).toHaveLength(2);
    expect(sharedReferences(copies)).toEqual([]);
    for (const copy of copies) expect(strayReferences(copy)).toEqual([]);

    const recoverable: unknown[] = [];
    await act(async () => {
      const root = hydrateRoot(element, twoCopies(icon), {
        onRecoverableError: (error) => void recoverable.push(error),
      });
      cleanups.push(async () => act(async () => root.unmount()));
    });

    expect(recoverable).toEqual([]);
    expect(errors()).toEqual([]);
    expect(element.innerHTML).toBe(server);
  });
});

test("some icons refer to their own ids, so the checks above check something", async () => {
  const referring = [];
  for (const [name, icon] of checked) {
    const [copy] = await renderOnPage(icon);
    if (references(copy!).length) referring.push(name);
  }

  // The kinds the issue found: a clip path, a mask, a gradient
  expect(referring).toEqual(
    expect.arrayContaining([
      "FacebookIcon",
      "MiniInternetMCMCIcon",
      "ExcelMediaIcon",
    ]),
  );
});

test.each(sharingIds)(
  "%s still shares its ids, the one exception, until the next major deletes it",
  async (name) => {
    const icon = (icons as Record<string, Icon>)[name]!;

    expect(sharedReferences(await renderOnPage(icon))).not.toEqual([]);
  },
);
