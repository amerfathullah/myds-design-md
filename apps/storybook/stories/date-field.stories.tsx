import { useId } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { createRender, createStory } from "../utils";
import { Label } from "@amerfathullah/myds-react/label";
import { DateField } from "@amerfathullah/myds-react/date-field";

/**
 * ### Overview
 * The Date Field component allows users to input a date in a structured format
 * using separate fields for day, month, and year.
 * Name it with a `Label` (`htmlFor`) and pass the matching `id`.
 *
 * _Based on [HTML's date input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date)_
 *
 * ### Usage
 * ```tsx
 * import { DateField } from "@amerfathullah/myds-react/date-field";
 * import { Label } from "@amerfathullah/myds-react/label";
 *
 * const [date, setDate] = useState("1957-08-31");
 *
 * <Label htmlFor="date-of-birth">Date of birth</Label>
 * <DateField id="date-of-birth" value={date} onChange={(e) => setDate(e.target.value)} />
 * ```
 */
const meta = {
  title: "@amerfathullah/myds-react/DateField",
  component: DateField,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    size: "medium",
    invalid: false,
    // Stories render the field alone, so name it here; in an app, pair it with a `Label` instead.
    "aria-label": "Date of birth",
  },
  argTypes: {
    size: {
      table: {
        defaultValue: {
          summary: "medium",
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
    invalid: {
      table: { category: "myds API" },
      type: "boolean",
      description: "Whether the DateField is invalid.",
      control: "boolean",
    },
  },
} satisfies Meta<typeof DateField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Light: Story = createStory({ defaultValue: "1957-08-31" });

export const DisabledLight: Story = createStory({ disabled: true });

export const ErrorLight: Story = createStory({ invalid: true });

export const Dark: Story = createStory(
  {
    className: "dark",
    defaultValue: "1957-08-31",
  },
  "dark",
);

export const DisabledDark: Story = createStory(
  { disabled: true, className: "dark" },
  "dark",
);

export const ErrorDark: Story = createStory(
  { invalid: true, className: "dark" },
  "dark",
);

// A disabled fieldset disables the date field, with no `disabled` prop on
// DateField, and gives it the disabled look. Label disables nothing, so it
// takes `disabled` for its dimmed look
const InDisabledFieldset = () => {
  const id = useId();
  return (
    <fieldset disabled>
      <legend className="text-body-sm text-txt-black-900 mb-2">
        Applicant
      </legend>
      <div className="flex flex-col gap-2">
        <Label htmlFor={id} disabled>
          Date of birth
        </Label>
        <DateField id={id} size="medium" defaultValue="1957-08-31" />
      </div>
    </fieldset>
  );
};
export const DisabledFieldset = createRender(InDisabledFieldset, "light");
