import { useId } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { createRender, createStory } from "../utils";
import { Label } from "@amerfathullah/myds-react/label";
import { TimeField } from "@amerfathullah/myds-react/time-field";

/**
 * ### Overview
 * The Time Field component allows users to enter a time of day in hours and minutes. It matches DateField in
 * every size and state. 12/24-hour display follows the user's browser locale; the value is 24-hour `HH:mm`
 * (`HH:mm:ss` when `step` is below 60).
 * Name it with a `Label` (`htmlFor`) and pass the matching `id`.
 *
 * _Based on [HTML's time input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/time)_
 *
 * ### Usage
 * ```tsx
 * import { TimeField } from "@amerfathullah/myds-react/time-field";
 * import { Label } from "@amerfathullah/myds-react/label";
 *
 * const [time, setTime] = useState("16:30");
 *
 * <Label htmlFor="appointment-time">Appointment time</Label>
 * <TimeField id="appointment-time" value={time} onChange={(e) => setTime(e.target.value)} />
 * ```
 */
const meta = {
  title: "@amerfathullah/myds-react/TimeField",
  component: TimeField,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    size: "medium",
    invalid: false,
    // Stories render the field alone, so name it here; in an app, pair it with a `Label` instead.
    "aria-label": "Appointment time",
  },
  argTypes: {
    size: {
      table: {
        defaultValue: {
          summary: "small",
        },
        type: {
          summary: "enum",
          detail: "small, medium, large",
        },
        category: "myds API",
      },
      control: "inline-radio",
      options: ["small", "medium", "large"],
    },
    step: {
      table: {
        defaultValue: { summary: "60" },
        category: "myds API",
      },
      description:
        "Step between allowed times, in seconds. `900` gives 15-minute steps.",
      control: "number",
    },
    invalid: {
      table: { category: "myds API" },
      type: "boolean",
      description: "Whether the TimeField is invalid.",
      control: "boolean",
    },
  },
} satisfies Meta<typeof TimeField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Light: Story = createStory({ defaultValue: "16:30" });

export const Small: Story = createStory({
  size: "small",
  defaultValue: "16:30",
});

export const Large: Story = createStory({
  size: "large",
  defaultValue: "16:30",
});

export const FifteenMinuteStep: Story = createStory({
  step: 900,
  defaultValue: "16:00",
});

export const DisabledLight: Story = createStory({
  disabled: true,
  defaultValue: "16:30",
});

export const ErrorLight: Story = createStory({ invalid: true });

export const Dark: Story = createStory(
  {
    className: "dark",
    defaultValue: "16:30",
  },
  "dark",
);

export const DisabledDark: Story = createStory(
  { disabled: true, className: "dark", defaultValue: "16:30" },
  "dark",
);

export const ErrorDark: Story = createStory(
  { invalid: true, className: "dark" },
  "dark",
);

// A disabled fieldset disables the time field, with no `disabled` prop on
// TimeField, and gives it the disabled look. Label disables nothing, so it
// takes `disabled` for its dimmed look
const InDisabledFieldset = () => {
  const id = useId();
  return (
    <fieldset disabled>
      <legend className="text-body-sm text-txt-black-900 mb-2">
        Appointment
      </legend>
      <div className="flex flex-col gap-2">
        <Label htmlFor={id} disabled>
          Appointment time
        </Label>
        <TimeField id={id} size="medium" defaultValue="16:30" />
      </div>
    </fieldset>
  );
};
export const DisabledFieldset = createRender(InDisabledFieldset, "light");
