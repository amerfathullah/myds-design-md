import { useId, type ComponentProps } from "react";
import { DateRangePicker } from "@amerfathullah/myds-react/daterange-picker";
import { Label } from "@amerfathullah/myds-react/label";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { createRender, createStory } from "../utils";

/**
 * ### Overview
 * The Date Range Picker component allows users to select a range of dates from an interactive calendar.
 *
 * ### Usage
 * ```tsx
 * import * as React from "react"
 * import { DateRange, DateRangePicker } from "@amerfathullah/myds-react/daterange-picker";
 * import { Label } from "@amerfathullah/myds-react/label";
 *
 * export function DateRangePickerDemo() {
 *    const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
 *        from: new Date(),
 *        to: new Date(),
 *    });
 *
 *    return (
 *      <>
 *        <Label id="travel-dates">Travel dates</Label>
 *        <DateRangePicker
 *          aria-labelledby="travel-dates"
 *          value={dateRange}
 *          onValueChange={setDateRange}
 *        />
 *      </>
 *    )
 * }
 * ```
 *
 * ### Naming
 * Name each date range picker with a `Label`: give the `Label` an `id`, and pass the same id to the picker's `aria-labelledby`.
 * A `Label`'s `htmlFor` doesn't work, because the picker takes no `id`, and clicking the `Label` doesn't open the picker.
 * Screen readers announce the label, then each button's prefix and date, e.g. "Travel dates From: 31 Aug 1957" and "Travel dates To: 16 Sep 1963".
 * If no visible label names the picker, pass an `aria-label`, e.g. `<DateRangePicker locale="ms" aria-label="Tarikh perjalanan" />`.
 * Pass a hint's id as `aria-describedby`.
 */
const meta = {
  title: "@amerfathullah/myds-react/DateRangePicker",
  component: DateRangePicker,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: { onValueChange: fn() },
  argTypes: {
    defaultValue: {
      description:
        "The date range when initially rendered. Use when you do not need to control the state of the date range picker.",
    },
    disabled: {
      description:
        "`true` disables the whole picker, every trigger it renders. Any other Matcher, or an array of Matchers, disables only the days it matches. See: https://daypicker.dev/api/type-aliases/Matcher",
    },
    excludeDisabled: {
      table: {
        defaultValue: {
          summary: "true",
        },
      },
      description:
        "When `true`, the range will reset when including a disabled day.",
    },
    fromLabel: {
      table: {
        defaultValue: {
          summary: "From",
        },
      },
      description: "The button label for the start date picker.",
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
      description: "Controls which locale the date range picker is in.",
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
    onValueChange: {
      table: {
        type: {
          summary: "function",
        },
      },
      description: "Event handler when a date is selected.",
    },
    placeholder: {
      description: "Text that appears when no value is set.",
    },
    value: {
      description:
        "The controlled date range currently selected. Should be used in conjunction with `onValueChange`.",
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
    toLabel: {
      table: {
        defaultValue: {
          summary: "To",
        },
      },
      description: "The button label for the end date picker.",
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
        "The id of the `Label` whose text names the date range picker. Screen readers announce it, then each button's prefix and date.",
    },
    "aria-label": {
      description:
        "Accessible name of the date range picker, when no visible label names it. Screen readers announce it, then each button's prefix and date.",
    },
    "aria-describedby": {
      description:
        "The id of an element whose text describes the date range picker, such as a hint.",
    },
  },
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The default DateRangePicker
 */
export const Default: Story = createStory({
  defaultDateRange: { from: new Date(1957, 7, 31), to: new Date(1963, 8, 16) },
});

// A Label names the date range picker through `aria-labelledby`. useId gives
// the Label its own id, which doesn't repeat when the docs page shows the
// story twice.
const Labelled = (args: ComponentProps<typeof DateRangePicker>) => {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <Label id={id} size="small">
        Travel dates
      </Label>
      <DateRangePicker
        defaultValue={{
          from: new Date(1957, 7, 31),
          to: new Date(1963, 8, 16),
        }}
        {...args}
        aria-labelledby={id}
      />
    </div>
  );
};

/**
 * A DateRangePicker named by a Label: screen readers announce "Travel dates From: 31 Aug 1957" and "Travel dates To: 16 Sep 1963"
 */
export const LabelledByLabel: Story = createRender(Labelled);
