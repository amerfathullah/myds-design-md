import type { Meta, StoryObj } from "@storybook/react";
import { ThemeProvider } from "@govtechmy/myds-react/hooks";
import { ThemeSwitch } from "@govtechmy/myds-react/theme-switch";
import { createStory } from "../utils";

/**
 * ### Overview
 * The `ThemeSwitch` component allows users to toggle between different themes.
 * It cycles through a list of provided themes, each represented by an icon.
 * ### Usage
 * ```tsx
 * import { ThemeSwitch } from "@govtechmy/myds-react/theme-switch";
 *
 * <ThemeProvider>
 *   <ThemeSwitch />
 * </ThemeProvider>
 * ```
 */
const meta = {
  title: "@govtechmy/myds-react/ThemeSwitch",
  // tags: ["!dev"],
  component: ThemeSwitch,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story: typeof ThemeSwitch) => (
      <div className="bg-bg-white flex items-center justify-center py-8">
        <ThemeProvider>
          <Story />
        </ThemeProvider>
      </div>
    ),
  ],
  argTypes: {
    themes: {
      table: {
        type: { summary: "Themes[]" },
      },
      description:
        "Array of theme objects containing theme name and associated icon.",
      control: "object",
    },
    selectLabel: {
      table: {
        type: { summary: "string" },
        defaultValue: { summary: '"Theme"' },
      },
      description:
        'Accessible name of the select trigger, when `as="select"`. Screen readers announce it; it is not shown.',
      control: "text",
    },
  },
} satisfies Meta<typeof ThemeSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * As Toggle ThemeSwitch story.
 */
export const AsToggle: Story = createStory({
  as: "toggle",
});

/**
 * As Switch ThemeSwitch story.
 */
export const AsSelect: Story = createStory({
  as: "select",
});

/**
 * CustomThemes - Select story.
 */
export const CustomThemesToggle: Story = createStory({
  as: "toggle",
  themes: [
    { label: "Light", value: "light", icon: "🌞" },
    { label: "Dark", value: "dark", icon: "🌚" },
    { label: "System", value: "system", icon: "🌐" },
  ],
});

/**
 * CustomThemes - Select story.
 */
export const CustomThemesSelect: Story = createStory({
  as: "select",
  themes: [
    { label: "Light", value: "light", icon: "🌞" },
    { label: "Dark", value: "dark", icon: "🌚" },
    { label: "System", value: "system", icon: "🌐" },
  ],
});
