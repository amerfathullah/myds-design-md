// @vitest-environment happy-dom
import { act, createElement, type ComponentProps, type ReactNode } from "react";
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

// What an Input holding `children` renders: the side its <input> makes room
// for, the side class each icon draws on, and the whole markup
function rendered(size: Size, ...children: ReactNode[]) {
  const container = document.body.appendChild(document.createElement("div"));
  const root = createRoot(container);
  act(() =>
    root.render(
      createElement(Input, { size, placeholder: "Cari" }, ...children),
    ),
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
  act(() => root.unmount());
  container.remove();
  return result;
}

// React's warnings go to console.error, so every test fails on any of them
beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
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
    (_, props) => {
      const left = rendered(size, icon({ position: "left" }));
      expect(left.room).toEqual({ left: "true", right: "false" });
      expect(left.sides).toEqual([["left-3"]]);
      expect(rendered(size, icon(props))).toEqual(left);
    },
  );

  test('an InputIcon without `position` and one with `position="right"` render as a left and a right one', () => {
    const both = rendered(
      size,
      icon({ position: "left" }),
      icon({ position: "right" }),
    );
    expect(both.room).toEqual({ left: "true", right: "true" });
    expect(both.sides).toEqual([["left-3"], ["right-3"]]);
    expect(rendered(size, icon(null), icon({ position: "right" }))).toEqual(
      both,
    );
  });

  // As the issue's table records them before the fix
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
    (_, icons, room) => {
      const result = rendered(size, ...icons.map(icon));
      expect(result.room).toEqual(room);
      expect(result.sides).toEqual(
        icons.map(({ position }) => [`${position}-3`]),
      );
    },
  );

  // Only an InputIcon defaults to the left. Another direct child makes room
  // only on the side it's given, as an app's own icon component can be
  test("a child that isn't an InputIcon makes room only on the side it's given", () => {
    const AppIcon = (props: IconProps) => icon(props);
    expect(rendered(size, createElement("span", null, "kg")).room).toEqual({
      left: "false",
      right: "false",
    });
    expect(
      rendered(size, createElement(AppIcon, { position: "left" })).room,
    ).toEqual({ left: "true", right: "false" });
    expect(
      rendered(size, createElement(AppIcon, { position: "right" })).room,
    ).toEqual({ left: "false", right: "true" });
  });
});
