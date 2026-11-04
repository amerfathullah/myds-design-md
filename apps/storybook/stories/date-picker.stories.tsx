import { useId, type ComponentProps } from "react";
import { DatePicker } from "@amerfathullah/myds-react/date-picker";
import { Label } from "@amerfathullah/myds-react/label";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { createRender, createStory } from "../utils";
import { fn } from "storybook/test";

/**
 * ### Overview
 * The Date Picker component allows users to select a date from an interactive calendar.
 *
 * ### Usage
 * ```tsx
 * import * as React from "react"
 * import { DatePicker } from "@amerfathullah/myds-react/date-picker";
 * import { Label } from "@amerfathullah/myds-react/label";
 *
 * export function DatePickerDemo() {
 *    const [date, setDate] = React.useState<Date>();
 *
 *    return (
 *      <>
 *        <Label id="date-of-birth">Date of birth</Label>
 *        <DatePicker
 *          aria-labelledby="date-of-birth"
 *          value={date}
 *          onValueChange={setDate}
 *        />
 *      </>
 *    )
 * }
 * ```
 *
 * ### Naming
 * Name each date picker with a `Label`: give the `Label` an `id`, and pass the same id to the picker's `aria-labelledby`.
 * A `Label`'s `htmlFor` doesn't work, because the picker takes no `id`, and clicking the `Label` doesn't open the picker.
 * Screen readers announce the label, then the date the picker shows, e.g. "Date of birth 31 Aug 1957".
 * If no visible label names the picker, pass an `aria-label`, e.g. `<DatePicker locale="ms" aria-label="Tarikh lahir" />`.
 * Pass a hint's id as `aria-describedby`.
 */
const meta = {
  title: "@amerfathullah/myds-react/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: { onValueChange: fn() },
  argTypes: {
    defaultValue: {
      description:
        "The default date when initially rendered. Use when you do not need to control the state of the date picker.",
    },
    disabled: {
      description:
        "A value or a function that matches a specific day. See: https://daypicker.dev/api/type-aliases/Matcher",
    },
    formatStr: {
      table: {
        defaultValue: {
          summary: "dd MMM yyy",
        },
      },
      description:
        "Returns the formatted date string in the given format. The result may vary by locale. ⚠️ Please note that the format tokens used are from date-fns, which differ from Moment.js and other libraries. See: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md",
    },
    locale: {
      table: {
        defaultValue: {
          summary: "en",
        },
        type: {
          summary: "enum",
        },
      },
      description: "Controls which locale the date picker is in.",
      control: "inline-radio",
      options: ["en", "ms"],
    },
    maxYear: {
      table: {
        defaultValue: {
          summary: "2099",
        },
      },
      description: "Maximum selectable year.",
    },
    minYear: {
      table: {
        defaultValue: {
          summary: "1900",
        },
      },
      description: "Minimum selectable year.",
    },
    placeholder: {
      description: "Text that appears when no value is set.",
    },
    onValueChange: {
      table: {
        type: {
          summary: "function",
        },
      },
      description: "Event handler when a day is selected.",
    },
    value: {
      description:
        "The controlled date currently selected. Should be used in conjunction with `onValueChange`.",
    },
    size: {
      table: {
        defaultValue: {
          summary: "small",
        },
        type: {
          summary: "enum",
        },
      },
      description: "Controls the size of the button.",
      control: "inline-radio",
      options: ["small", "medium", "large"],
    },
    yearOrder: {
      table: {
        defaultValue: {
          summary: "asc",
        },
        type: {
          summary: "enum",
        },
      },
      description:
        "Controls the order of the years displayed. It is in ascending (chronological) order by default.",
      control: "inline-radio",
      options: ["asc", "desc"],
    },
    "aria-labelledby": {
      description:
        "The id of the `Label` whose text names the date picker. Screen readers announce it, then the date the picker shows.",
    },
    "aria-label": {
      description:
        "Accessible name of the date picker, when no visible label names it. Screen readers announce it, then the date the picker shows.",
    },
    "aria-describedby": {
      description:
        "The id of an element whose text describes the date picker, such as a hint.",
    },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The default DatePicker
 */
export const Default: Story = createStory({
  defaultValue: new Date(1957, 7, 31),
});

// A Label names the date picker through `aria-labelledby`. useId gives the
// Label its own id, which doesn't repeat when the docs page shows the story
// twice.
const Labelled = (args: ComponentProps<typeof DatePicker>) => {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <Label id={id} size="small">
        Date of birth
      </Label>
      <DatePicker
        defaultValue={new Date(1957, 7, 31)}
        {...args}
        aria-labelledby={id}
      />
    </div>
  );
};

/**
 * A DatePicker named by a Label: screen readers announce "Date of birth 31 Aug 1957"
 */
export const LabelledByLabel: Story = createRender(Labelled);
