import { fn } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { createStory, createRender } from "../utils";
import { Label } from "@amerfathullah/myds-react/label";
import { Checkbox } from "@amerfathullah/myds-react/checkbox";
import { Toggle, ToggleThumb } from "@amerfathullah/myds-react/toggle";

/**
 * ### Overview
 *
 * The Label component from @amerfathullah/myds-react/label is a customizable UI element used to associate text with form controls like checkboxes and toggles. It accepts props such as htmlFor to link it to a specific form element and size to adjust its appearance. This component ensures accessibility and consistent styling across the application.
 *
 *
 * > Label cantik dipandang mata,
 * Menghiasi form dengan gaya tersendiri,
 * Mudah digunakan, mesra semua,
 * Aksesibiliti terjaga, seragam rapi. --Copilot
 *
 *
 * ### Usage
 * ```tsx
 * import Label from "@amerfathullah/myds-react/label";
 *
 *  <Label htmlFor="checkbox" size={size}>
 *   Auto-delete notifications
 * </Label>
 * <Checkbox id="checkbox" size={size}></Checkbox>
 * ```
 */
const meta = {
  title: "@amerfathullah/myds-react/Label",
  component: Label,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  // Label disables nothing, so `disabled` goes to each Label and its field.
  // The ids carry the story's id, so no two stories on the docs page share one
  render: ({ size, disabled }, { id }) => {
    return (
      <div className="min-w-[360px] space-y-3">
        <div className="flex justify-between">
          <Label htmlFor={`${id}-checkbox`} size={size} disabled={disabled}>
            Auto-delete notifications
          </Label>
          <Checkbox
            id={`${id}-checkbox`}
            size={size}
            disabled={disabled ?? undefined}
          ></Checkbox>
        </div>
        <div className="flex justify-between">
          <Label htmlFor={`${id}-toggle`} size={size} disabled={disabled}>
            Enable 2FA security?
          </Label>
          <Toggle
            id={`${id}-toggle`}
            size={size}
            disabled={disabled ?? undefined}
          >
            <ToggleThumb />
          </Toggle>
        </div>
      </div>
    );
  },
  args: { onClick: fn(), disabled: false },
  argTypes: {
    size: {
      table: {
        type: {
          summary: "enum",
        },
      },
      description: "Available sizes",
      control: "inline-radio",
      options: ["small", "medium", "large"],
    },
    disabled: {
      table: {
        type: {
          summary: "boolean",
        },
      },
      description:
        "Whether the label's field is disabled. Sets the label's `data-disabled`, which shows the disabled styling. It doesn't disable the field.",
      control: "boolean",
    },
  },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = createStory({});

export const DefaultDark: Story = createRender(
  ({ size = "medium" as const, disabled = false }, { id }: { id: string }) => (
    <div className="dark min-w-[360px] space-y-3">
      <div className="flex justify-between">
        <Label htmlFor={`${id}-checkbox`} size={size} disabled={disabled}>
          Auto-delete notifications
        </Label>
        <Checkbox
          id={`${id}-checkbox`}
          size={size}
          disabled={disabled ?? undefined}
        ></Checkbox>
      </div>
      <div className="group flex justify-between">
        <Label htmlFor={`${id}-toggle`} size={size} disabled={disabled}>
          Enable 2FA security?
        </Label>
        <Toggle
          id={`${id}-toggle`}
          size={size}
          disabled={disabled ?? undefined}
        >
          <ToggleThumb />
        </Toggle>
      </div>
    </div>
  ),
  "dark",
);

export const DisabledLight: Story = createStory({ disabled: true });

export const DisabledDark: Story = {
  ...DefaultDark,
  args: { disabled: true },
};
