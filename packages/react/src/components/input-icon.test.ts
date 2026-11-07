// @vitest-environment happy-dom
import {
  act,
  createElement,
  forwardRef,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from "react";
import { createRoot } from "react-dom/client";
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

// Mounts `element` in a container on the page, as an app would
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

// What an Input holding `children` renders: the side its <input> makes room
// for, the side class each icon draws on, and the whole markup
async function rendered(size: Size, ...children: ReactNode[]) {
  const container = await mount(
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
