// @vitest-environment happy-dom
import {
  act,
  createElement,
  forwardRef,
  Fragment,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { Input, InputIcon } from "./input";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

type Size = ComponentProps<typeof Input>["size"];
type IconProps = Omit<ComponentProps<typeof InputIcon>, "children">;

// An InputIcon around an icon, as the docs compose one
const icon = (props: IconProps | null) =>
  createElement(
    InputIcon,
    props,
    createElement("svg", { viewBox: "0 0 20 20" }),
  );

const unmounts: (() => Promise<void>)[] = [];

// Mounts `element` in a container on the page, as an app would. `render`
// renders the root again, with another element.
async function mount(element: ReactElement) {
  const container = document.body.appendChild(document.createElement("div"));
  const root = createRoot(container);
  unmounts.push(async () => {
    await act(async () => root.unmount());
    container.remove();
  });
  const render = (next: ReactElement) => act(async () => root.render(next));
  await render(element);
  return { container, render };
}

// What an Input holding `children` renders: the side its <input> makes room
// for, the side class each icon draws on, and the whole markup
async function rendered(size: Size, ...children: ReactNode[]) {
  const { container } = await mount(
    createElement(Input, { size, placeholder: "Cari" }, ...children),
  );
  const input = container.querySelector("input");
  const result = {
    room: {
      left: input?.getAttribute("data-has-left-icon"),
      right: input?.getAttribute("data-has-right-icon"),
    },
    sides: [...container.querySelectorAll("svg")].map((svg) =>
      svg
        .getAttribute("class")
        ?.split(" ")
        .filter((name) => name === "left-3" || name === "right-3"),
    ),
    markup: container.innerHTML,
  };
  await unmounts.pop()!();
  return result;
}

// React's warnings go to console.error, so every test fails on any of them
beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

// No test logs an error, or leaves anything on the page
afterEach(async () => {
  while (unmounts.length) await unmounts.pop()!();
  const logged = [...vi.mocked(console.error).mock.calls];
  vi.restoreAllMocks();
  expect(logged).toEqual([]);
  expect(document.body.innerHTML).toBe("");
});

// The default size, and each size by name
const sizes = [undefined, "small", "medium", "large"] as const;

// InputIcon draws on the left when it isn't given `position`, so Input makes
// room on the left for it, as it does for `position="left"`
describe.each(sizes)("Input with size %s", (size) => {
  test.each([
    ["without `position`", null],
    ["with `position={undefined}`", { position: undefined }],
  ] as const)(
    'an InputIcon %s renders as one with `position="left"`',
    async (_, props) => {
      const left = await rendered(size, icon({ position: "left" }));
      expect(left.room).toEqual({ left: "true", right: "false" });
      expect(left.sides).toEqual([["left-3"]]);
      expect(await rendered(size, icon(props))).toEqual(left);
    },
  );

  test('an InputIcon without `position` and one with `position="right"` render as a left and a right one', async () => {
    const both = await rendered(
      size,
      icon({ position: "left" }),
      icon({ position: "right" }),
    );
    expect(both.room).toEqual({ left: "true", right: "true" });
    expect(both.sides).toEqual([["left-3"], ["right-3"]]);
    expect(
      await rendered(size, icon(null), icon({ position: "right" })),
    ).toEqual(both);
  });

  // An explicit side still draws on that side, and Input makes room there
  test.each([
    ["left", [{ position: "left" }], { left: "true", right: "false" }],
    ["right", [{ position: "right" }], { left: "false", right: "true" }],
    [
      "left and right",
      [{ position: "left" }, { position: "right" }],
      { left: "true", right: "true" },
    ],
  ] as const)(
    "%s InputIcons draw on their side and make room there",
    async (_, icons, room) => {
      const result = await rendered(size, ...icons.map(icon));
      expect(result.room).toEqual(room);
      expect(result.sides).toEqual(
        icons.map(({ position }) => [`${position}-3`]),
      );
    },
  );

  // Only an InputIcon defaults to the left. Another direct child makes room
  // only on the side it's given, as an app's own icon component can be
  test("a child that isn't an InputIcon makes room only on the side it's given", async () => {
    const AppIcon = (props: IconProps) => icon(props);
    expect(
      (await rendered(size, createElement("span", null, "kg"))).room,
    ).toEqual({ left: "false", right: "false" });
    expect(
      (await rendered(size, createElement(AppIcon, { position: "left" }))).room,
    ).toEqual({ left: "true", right: "false" });
    expect(
      (await rendered(size, createElement(AppIcon, { position: "right" })))
        .room,
    ).toEqual({ left: "false", right: "true" });
  });

  // styled-components and hoist-non-react-statics copy a component's own
  // statics onto the wrapper they make. A wrapper of InputIcon is still not
  // an InputIcon, even one that fixes its side, as `.attrs()` can
  test("a wrapper with InputIcon's statics copied makes room only on the side it's given", async () => {
    const RightIcon = forwardRef<HTMLDivElement, IconProps>((props, ref) =>
      createElement(
        InputIcon,
        { ...props, position: props.position ?? "right", ref },
        createElement("svg", { viewBox: "0 0 20 20" }),
      ),
    );
    for (const key of Reflect.ownKeys(InputIcon))
      if (!(key in RightIcon))
        Object.defineProperty(
          RightIcon,
          key,
          Object.getOwnPropertyDescriptor(InputIcon, key)!,
        );
    const fixed = await rendered(size, createElement(RightIcon));
    expect(fixed.sides).toEqual([["right-3"]]);
    expect(fixed.room).toEqual({ left: "false", right: "false" });
    expect(
      (await rendered(size, createElement(RightIcon, { position: "left" })))
        .room,
    ).toEqual({ left: "true", right: "false" });
  });
});

/*========================================================================================================================*/

// Input makes room for an InputIcon however it's composed: passed directly,
// in a Fragment, an array or a condition, or rendered by an app's own
// component (#125). InputIcon marks the element it renders with the side it
// draws on, and the <input>'s padding classes pad it from a later sibling
// carrying that mark. A browser applies them, so the room is in the server
// markup before the page hydrates. `data-has-left-icon` and
// `data-has-right-icon` still report Input's direct children only (#123).

type Side = "left" | "right";
type Room = { left: string; right: string };

// The classes that pad the <input> on a side when a later sibling in its box
// carries InputIcon's mark for that side
const padding = [
  "has-[~[data-input-icon=left]]:pl-10",
  "has-[~[data-input-icon=right]]:pr-10",
];

// The room the <input> reports for its direct children
const room = (left: boolean, right: boolean): Room => ({
  left: String(left),
  right: String(right),
});

// What an Input's markup shows, as the server sends it or the page holds it:
// the room its <input> reports, whether the <input> has the padding classes,
// and each icon or marked element: the side it's marked with, the side class
// it draws with, and whether it's a later sibling of the <input> in the box
// that positions it
function read(root: ParentNode) {
  const input = root.querySelector("input");
  const box = input?.parentElement;
  const siblings = box ? [...box.children] : [];
  return {
    room: {
      left: input?.getAttribute("data-has-left-icon"),
      right: input?.getAttribute("data-has-right-icon"),
    },
    padded: padding.every((name) => input?.classList.contains(name)),
    icons: [...root.querySelectorAll("svg, [data-input-icon]")].map(
      (element) => ({
        mark: element.getAttribute("data-input-icon"),
        side: element
          .getAttribute("class")
          ?.split(" ")
          .filter((name) => name === "left-3" || name === "right-3"),
        after:
          element.parentElement === box &&
          siblings.indexOf(element) > siblings.indexOf(input!),
      }),
    ),
  };
}

// An icon drawn on `side` and marked with it, after the <input>
const drawn = (side: Side) => ({
  mark: side,
  side: [`${side}-3`],
  after: true,
});

// The markup the server sends for an Input holding `children`
const serverMarkup = (size: Size, ...children: ReactNode[]) =>
  renderToStaticMarkup(
    createElement(Input, { size, placeholder: "Cari" }, ...children),
  );

// Server markup, parsed as the browser parses it
function parse(html: string) {
  const template = document.createElement("template");
  template.innerHTML = html;
  return template.content;
}

// Markup without the room the <input> reports for its direct children
const withoutRoom = (html: string) =>
  html.replace(/ data-has-(?:left|right)-icon="[^"]*"/g, "");

const fragment = (...children: ReactNode[]) =>
  createElement(Fragment, null, ...children);

// An app's own components, which take no props and render an InputIcon
const LeftIcon = () => icon({ position: "left" });
const RightIcon = () => icon({ position: "right" });
const UnplacedIcon = () => icon(null);
// One that's given its side, as #123 keeps the room for
const AppIcon = (props: IconProps) => icon(props);
// One that renders its InputIcon only when `show` is set
const MaybeLeftIcon = ({ show }: { show: boolean }) =>
  show ? icon({ position: "left" }) : null;

// Each composition: Input's children, the side of each icon they draw, in
// order, and the room the <input> reports for its direct children
const compositions: [string, ReactNode[], Side[], Room][] = [
  // Passed directly, or in an array
  [
    "a left InputIcon",
    [icon({ position: "left" })],
    ["left"],
    room(true, false),
  ],
  [
    "a right InputIcon",
    [icon({ position: "right" })],
    ["right"],
    room(false, true),
  ],
  [
    "a left and a right InputIcon",
    [icon({ position: "left" }), icon({ position: "right" })],
    ["left", "right"],
    room(true, true),
  ],
  [
    "an array of a left and a right InputIcon",
    [
      [
        icon({ key: "l", position: "left" }),
        icon({ key: "r", position: "right" }),
      ],
    ],
    ["left", "right"],
    room(true, true),
  ],
  [
    "a left and a right InputIcon from `.map`",
    [
      (["left", "right"] as const).map((side) =>
        icon({ key: side, position: side }),
      ),
    ],
    ["left", "right"],
    room(true, true),
  ],
  // Behind a condition, directly, in a Fragment or in an app's component
  ...[true, false].flatMap((cond): [string, ReactNode[], Side[], Room][] => [
    [
      `\`${cond} && <InputIcon position="left">\``,
      [cond && icon({ position: "left" })],
      cond ? ["left"] : [],
      room(cond, false),
    ],
    [
      `\`${cond} ? <InputIcon position="left"> : null\``,
      [cond ? icon({ position: "left" }) : null],
      cond ? ["left"] : [],
      room(cond, false),
    ],
    [
      `a Fragment holding \`${cond} && <InputIcon position="left">\``,
      [fragment(cond && icon({ position: "left" }))],
      cond ? ["left"] : [],
      room(false, false),
    ],
    [
      `an app's component rendering a left InputIcon when \`show\` is ${cond}`,
      [createElement(MaybeLeftIcon, { show: cond })],
      cond ? ["left"] : [],
      room(false, false),
    ],
  ]),
  // In a Fragment, at any depth
  [
    "a Fragment holding a left InputIcon",
    [fragment(icon({ position: "left" }))],
    ["left"],
    room(false, false),
  ],
  [
    "a Fragment holding a right InputIcon",
    [fragment(icon({ position: "right" }))],
    ["right"],
    room(false, false),
  ],
  [
    "a Fragment holding a left and a right InputIcon",
    [fragment(icon({ position: "left" }), icon({ position: "right" }))],
    ["left", "right"],
    room(false, false),
  ],
  [
    "nested Fragments holding a left and a right InputIcon",
    [
      fragment(
        fragment(icon({ position: "left" })),
        fragment(fragment(icon({ position: "right" }))),
      ),
    ],
    ["left", "right"],
    room(false, false),
  ],
  [
    "a Fragment inside an array, holding a left InputIcon",
    [[createElement(Fragment, { key: "icons" }, icon({ position: "left" }))]],
    ["left"],
    room(false, false),
  ],
  // Rendered by an app's own component
  [
    "an app's component rendering a left InputIcon",
    [createElement(LeftIcon)],
    ["left"],
    room(false, false),
  ],
  [
    "an app's component rendering a right InputIcon",
    [createElement(RightIcon)],
    ["right"],
    room(false, false),
  ],
  [
    "an app's components rendering a left and a right InputIcon",
    [createElement(LeftIcon), createElement(RightIcon)],
    ["left", "right"],
    room(false, false),
  ],
  // A direct child given `position` keeps the room it reports (#123)
  [
    'an app\'s component given `position="left"`, rendering a left InputIcon',
    [createElement(AppIcon, { position: "left" })],
    ["left"],
    room(true, false),
  ],
  [
    'an app\'s component given `position="right"`, rendering a right InputIcon',
    [createElement(AppIcon, { position: "right" })],
    ["right"],
    room(false, true),
  ],
  // An InputIcon without `position` draws on the left (#123)
  [
    "a Fragment holding an InputIcon without `position`",
    [fragment(icon(null))],
    ["left"],
    room(false, false),
  ],
  [
    "an app's component rendering an InputIcon without `position`",
    [createElement(UnplacedIcon)],
    ["left"],
    room(false, false),
  ],
  // A left and a right icon, each composed its own way
  [
    "a direct left InputIcon and an app's component rendering a right one",
    [icon({ position: "left" }), createElement(RightIcon)],
    ["left", "right"],
    room(true, false),
  ],
  [
    "an app's component rendering a left InputIcon and a direct right one",
    [createElement(LeftIcon), icon({ position: "right" })],
    ["left", "right"],
    room(false, true),
  ],
  [
    "a Fragment holding a left InputIcon and a direct right one",
    [fragment(icon({ position: "left" })), icon({ position: "right" })],
    ["left", "right"],
    room(false, true),
  ],
  [
    "an app's component rendering an InputIcon without `position` and a Fragment holding a right one",
    [createElement(UnplacedIcon), fragment(icon({ position: "right" }))],
    ["left", "right"],
    room(false, false),
  ],
];

describe.each(sizes)("Input with size %s, its InputIcons composed", (size) => {
  test.each(compositions)(
    "%s: the server marks each icon with its side, after the <input>, which has the padding classes",
    (_, children, sides, expected) => {
      const html = serverMarkup(size, ...children);
      expect(read(parse(html))).toEqual({
        room: expected,
        padded: true,
        icons: sides.map(drawn),
      });
      // The markup InputIcons passed directly give, apart from the room the
      // <input> reports for its direct children
      expect(withoutRoom(html)).toBe(
        withoutRoom(
          serverMarkup(size, ...sides.map((side) => icon({ position: side }))),
        ),
      );
    },
  );

  test.each(compositions)(
    "%s: the page holds the markup the server sends",
    async (_, children) => {
      const { container } = await mount(
        createElement(Input, { size, placeholder: "Cari" }, ...children),
      );
      expect(read(container)).toEqual(
        read(parse(serverMarkup(size, ...children))),
      );
    },
  );

  // An Input with no icon has nothing marked, and reports no room
  test.each([
    ["no children", []],
    ["a direct <span> without `position`", [createElement("span", null, "kg")]],
  ] as [string, ReactNode[]][])("with %s, nothing is marked", (_, children) => {
    const html = serverMarkup(size, ...children);
    expect(read(parse(html))).toEqual({
      room: room(false, false),
      padded: true,
      icons: [],
    });
  });

  // Toggling the condition on a mounted Input adds and removes the marked
  // icon, as the server would render each state
  test.each([
    [
      "a direct InputIcon",
      (cond: boolean) => [cond && icon({ position: "left" })],
    ],
    [
      "an InputIcon in a Fragment",
      (cond: boolean) => [fragment(cond && icon({ position: "left" }))],
    ],
    [
      "an InputIcon from an app's component",
      (cond: boolean) => [createElement(MaybeLeftIcon, { show: cond })],
    ],
  ] as [string, (cond: boolean) => ReactNode[]][])(
    "%s shown, hidden and shown again on a mounted Input adds and removes its mark",
    async (_, children) => {
      const input = (cond: boolean) =>
        createElement(Input, { size, placeholder: "Cari" }, ...children(cond));
      const { container, render } = await mount(input(true));
      const states = [read(container)];
      for (const cond of [false, true]) {
        await render(input(cond));
        states.push(read(container));
      }
      expect(states.map(({ icons }) => icons)).toEqual([
        [drawn("left")],
        [],
        [drawn("left")],
      ]);
      expect(states).toEqual(
        [true, false, true].map((cond) =>
          read(parse(serverMarkup(size, ...children(cond)))),
        ),
      );
    },
  );
});
