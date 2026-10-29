import type { Meta, StoryObj } from "@storybook/react-vite";
import { createRender, createStory } from "../utils";
import { Skeleton } from "@amerfathullah/myds-react/skeleton";

/**
 * ### Overview
 * A loading placeholder in the shape of the content it stands in for. It shimmers while motion is allowed and
 * shows a flat fill under `prefers-reduced-motion`. It is always `aria-hidden`: mark the loading region with
 * `aria-busy="true"` and give it visually hidden "Loading…" text.
 *
 * ### Usage
 * ```tsx
 * import { Skeleton } from "@amerfathullah/myds-react/skeleton";
 *
 * <Skeleton />
 * <Skeleton shape="circle" className="size-10" />
 * <Skeleton shape="block" className="h-32 w-48" />
 * ```
 */
const meta = {
  title: "@amerfathullah/myds-react/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    shape: {
      table: {
        type: {
          summary: "enum",
        },
      },
      description: "Shape of the placeholder. Set its size with `className`.",
      control: "inline-radio",
      options: ["line", "circle", "block"],
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Full-width pill bar, the default. The data table uses it for loading rows.
 */
export const Line: Story = createStory({
  shape: "line",
  className: "w-64",
});

export const LineDark: Story = createStory(
  {
    shape: "line",
    className: "dark w-64",
  },
  "dark",
);

/**
 * Round placeholder for avatars and icons.
 */
export const Circle: Story = createStory({
  shape: "circle",
  className: "size-10",
});

export const CircleDark: Story = createStory(
  {
    shape: "circle",
    className: "dark size-10",
  },
  "dark",
);

/**
 * Placeholder with `rounded.md` corners for images, cards and media.
 */
export const Block: Story = createStory({
  shape: "block",
  className: "h-32 w-48",
});

export const BlockDark: Story = createStory(
  {
    shape: "block",
    className: "dark h-32 w-48",
  },
  "dark",
);

/**
 * The three shapes composed into a loading card, inside a region marked `aria-busy`.
 */
export const LoadingCard: Story = {
  ...createRender(() => (
    <div aria-busy="true" className="flex w-72 flex-col gap-3">
      <span className="sr-only">Loading…</span>
      <Skeleton shape="block" className="h-32 w-full" />
      <div className="flex items-center gap-3">
        <Skeleton shape="circle" className="size-10 shrink-0" />
        <div className="flex w-full flex-col gap-2">
          <Skeleton />
          <Skeleton className="w-2/3" />
        </div>
      </div>
    </div>
  )),
};
