import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeProvider } from "@amerfathullah/myds-react/hooks";
import { ThemeSwitch } from "@amerfathullah/myds-react/theme-switch";
import { createStory } from "../utils";

/**
 * ### Overview
 * The `ThemeSwitch` component allows users to toggle between different themes.
 * It cycles through a list of provided themes, each represented by an icon.
 * ### Usage
 * ```tsx
 * import { ThemeSwitch } from "@amerfathullah/myds-react/theme-switch";
 *
 * <ThemeProvider>
 *   <ThemeSwitch />
 * </ThemeProvider>
 * ```
 */
const meta = {
  title: "@amerfathullah/myds-react/ThemeSwitch",
  // tags: ["!dev"],
  component: ThemeSwitch,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    // One ThemeProvider per story. A story whose switch offers more than
    // Light and Dark lists them in `providerThemes`, so the provider
    // restores each of them and none logs a warning.
    (Story, { parameters }) => (
      <div className="bg-bg-white flex items-center justify-center py-8">
        <ThemeProvider themes={parameters.providerThemes}>
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

const customThemes = [
  { label: "Light", value: "light", icon: "🌞" },
  { label: "Dark", value: "dark", icon: "🌚" },
  { label: "System", value: "system", icon: "🌐" },
];

// A custom-themes story passes every value its switch offers to the
// ThemeProvider's `themes`. `system` is only a class on <html> here: MYDS
// styles the light theme and `.dark`.
const createCustomThemesStory = (as: "toggle" | "select") => {
  const story = createStory({ as, themes: customThemes });
  return {
    ...story,
    parameters: {
      ...story.parameters,
      providerThemes: customThemes.map(({ value }) => value),
    },
  };
};

/**
 * CustomThemes - Toggle story.
 */
export const CustomThemesToggle: Story = createCustomThemesStory("toggle");

/**
 * CustomThemes - Select story.
 */
export const CustomThemesSelect: Story = createCustomThemesStory("select");
