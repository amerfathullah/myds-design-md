import React, { useId } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { createStory } from "../utils";
import {
  Radio,
  RadioButton,
  RadioHintText,
  RadioItem,
  RadioLabel,
  RadioProps,
} from "@amerfathullah/myds-react/radio";

/**
 * ### Overview
 * Radio buttons allow users to select exactly one choice from a group.
 *
 * ### Usage
 * ```tsx
 * import {
 *   Radio,
 *   RadioButton,
 *   RadioHintText,
 *   RadioItem,
 *   RadioLabel,
 * } from "@amerfathullah/myds-react/radio";
 *
 * <Radio>
 *   <RadioItem>
 *     <RadioButton value="apple" id="apple" />
 *     <RadioLabel htmlFor="apple">Apple</RadioLabel>
 *   </RadioItem>
 *   <RadioItem>
 *     <RadioButton value="banana" id="banana" />
 *     <div>
 *       <RadioLabel htmlFor="banana">Banana</RadioLabel>
 *       <RadioHintText>Comes pre-packaged.</RadioHintText>
 *     </div>
 *   </RadioItem>
 * </Radio>
 * ```
 */
const meta = {
  title: "@amerfathullah/myds-react/Radio",
  component: Radio,
  // A function, so Storybook renders it as a component and it can call
  // useId(): each story prefixes its ids with one of its own, so the stories
  // on the autodocs page never share an id, and each label points at its own
  // radio. It returns the Radio itself, so "Show code" shows its markup.
  render: function Render(props) {
    const id = useId();
    return (
      <Radio {...props}>
        <RadioItem>
          <RadioButton value="email" id={`${id}-email`} />
          <div style={{ display: "grid" }}>
            <RadioLabel htmlFor={`${id}-email`}>Email</RadioLabel>
            <RadioHintText>
              We will send notifications to your registered email address.
            </RadioHintText>
          </div>
        </RadioItem>
        <RadioItem>
          <RadioButton value="phone_call" id={`${id}-phone_call`} />
          <div style={{ display: "grid" }}>
            <RadioLabel htmlFor={`${id}-phone_call`}>Phone Call</RadioLabel>
            <RadioHintText>
              Our representative will call you on your provided phone number.
            </RadioHintText>
          </div>
        </RadioItem>
        <RadioItem>
          <RadioButton value="text_message" id={`${id}-text_message`} />
          <div style={{ display: "grid" }}>
            <RadioLabel htmlFor={`${id}-text_message`}>Text Message</RadioLabel>
            <RadioHintText>
              You will receive SMS updates on your mobile phone.
            </RadioHintText>
          </div>
        </RadioItem>
        <RadioItem disabled>
          <RadioButton value="postal_mail" id={`${id}-postal_mail`} />
          <div style={{ display: "grid" }}>
            <RadioLabel htmlFor={`${id}-postal_mail`}>Postal Mail</RadioLabel>
            <RadioHintText>Not available at the moment.</RadioHintText>
          </div>
        </RadioItem>
        <RadioItem>
          <RadioButton
            value="disable_notifications"
            id={`${id}-disable_notifications`}
          />
          <RadioLabel htmlFor={`${id}-disable_notifications`}>
            Disable Notifications
          </RadioLabel>
        </RadioItem>
      </Radio>
    );
  },
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {},
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["small", "medium", "large"],
      table: {
        type: { summary: "enum", detail: "`small`, `medium`, or `large`" },
        defaultValue: { summary: "medium" },
      },
    },
    disabled: {
      control: "boolean",
      table: {
        type: { summary: "boolean" },
      },
    },
  },
} satisfies Meta<RadioProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Light: Story = createStory({});

export const Disabled: Story = createStory({
  value: "phone_call",
  disabled: true,
});

export const Dark: Story = createStory(
  {
    className: "dark",
  },
  "dark",
);

export const DisabledDark: Story = createStory(
  {
    value: "phone_call",
    disabled: true,
    className: "dark",
  },
  "dark",
);

// A disabled fieldset disables every radio, with no `disabled` prop on Radio,
// and each option's label and hint dim with its own radio. The dark story
// puts `dark` on the fieldset, so its legend takes the dark theme too.
const inDisabledFieldset: Story["render"] = function Render({
  className,
  ...args
}) {
  return (
    <fieldset disabled className={className}>
      <legend className="text-body-sm text-txt-black-900 mb-2">
        Notifications
      </legend>
      {meta.render(args)}
    </fieldset>
  );
};

export const DisabledFieldset: Story = {
  ...createStory({ value: "phone_call" }),
  render: inDisabledFieldset,
};

export const DisabledFieldsetDark: Story = {
  ...createStory({ value: "phone_call", className: "dark" }, "dark"),
  render: inDisabledFieldset,
};
