import { fn } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { createStory } from "../utils";
import {
  Callout,
  CalloutAction,
  CalloutContent,
  CalloutTitle,
} from "@amerfathullah/myds-react/callout";
import { Button } from "@amerfathullah/myds-react/button";
import { ComponentProps } from "react";

type CalloutVariant = NonNullable<ComponentProps<typeof Callout>["variant"]>;

const variantNames: Record<CalloutVariant, string> = {
  info: "Information",
  success: "Success",
  warning: "Warning",
  danger: "Error",
};

const CalloutDemo = (props: ComponentProps<typeof Callout>) => {
  return (
    <Callout {...props}>
      <CalloutTitle>
        {variantNames[props.variant ?? "info"]}: Scheduled system maintenance
      </CalloutTitle>
      <CalloutContent>
        Online services will be down for maintenance on Saturday from 10 PM to 2
        AM. Thank you for your patience!
      </CalloutContent>
    </Callout>
  );
};

/**
 * ### Overview
 * The Callout component notifies users about important information related to their actions inside a Forms.
 * Callouts can indicate success, warnings, errors, or provide additional information depending on the context inside a form
 *
 * ### Usage
 * ```tsx
 * import { Callout, CalloutTitle, CalloutContent, CalloutAction } from "@amerfathullah/myds-react/callout";
 * import { Button } from "@amerfathullah/myds-react/button";
 *
 * <Callout>
 *  <CalloutTitle>Information: Scheduled system maintenance</CalloutTitle>
 *   <CalloutContent> Online services will be down for maintenance on Saturday from 10 PM to 2 AM. Thank you for your patience! </CalloutContent>
 *   <CalloutAction>
 *    <Button variant="default-outline">Primary Button</Button>
 *   </CalloutAction>
 * </Callout>
 * ```
 */
const meta = {
  title: "@amerfathullah/myds-react/Callout",
  component: CalloutDemo,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    variant: "info",
  },
  argTypes: {
    variant: {
      description:
        'Sets the callout\'s colour and icon. Screen readers get neither, so the title must say the Variant, e.g. "Error: Form not sent".',
      control: "radio",
      options: ["success", "warning", "info", "danger"],
    },
    className: {
      description: "Additional CSS classes to apply to the callout",
      control: "text",
    },
  },
} satisfies Meta<typeof Callout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CalloutDefault: Story = createStory({});

export const calloutDefaultWithTitle: Story = {
  ...createStory({}),
  render: () => (
    <Callout>
      <CalloutTitle>Information: Application under review</CalloutTitle>
    </Callout>
  ),
};

export const calloutDefaultWithTitleAndPrimaryButton: Story = {
  ...createStory({}),
  render: () => (
    <Callout>
      <CalloutTitle>Information: Application under review</CalloutTitle>
      <CalloutAction>
        <Button variant="default-outline">Primary Button</Button>
      </CalloutAction>
    </Callout>
  ),
};

export const calloutDefaultWithTitlePrimaryButtonAndDescription: Story = {
  render: () => (
    <Callout>
      <CalloutTitle>Information: Application under review</CalloutTitle>
      <CalloutContent>
        Online services will be down for maintenance on Saturday from 10 PM to 2
        AM. Thank you for your patience!
      </CalloutContent>
      <CalloutAction>
        <Button variant="default-outline">Primary Button</Button>
      </CalloutAction>
    </Callout>
  ),
};

export const calloutDefaultWithTitleDescriptionPrimaryAndSecondaryButton: Story =
  {
    ...createStory({}),
    render: () => (
      <Callout>
        <CalloutTitle>Information: Application under review</CalloutTitle>
        <CalloutContent>
          Online services will be down for maintenance on Saturday from 10 PM to
          2 AM. Thank you for your patience!
        </CalloutContent>
        <CalloutAction>
          <Button variant="default-outline">Primary Button</Button>
          <Button variant="default-ghost">Secondary Button</Button>
        </CalloutAction>
      </Callout>
    ),
  };

export const calloutSuccess: Story = {
  ...createStory({}),
  render: () => (
    <Callout variant="success">
      <CalloutTitle>Success: Data saved</CalloutTitle>
      <CalloutAction>
        <Button variant="default-outline">Primary Button</Button>
      </CalloutAction>
    </Callout>
  ),
};

export const calloutWarning: Story = {
  ...createStory({}),
  render: () => (
    <Callout variant="warning">
      <CalloutTitle>Warning: Session ends soon</CalloutTitle>
      <CalloutAction>
        <Button variant="default-outline">Primary Button</Button>
      </CalloutAction>
    </Callout>
  ),
};

export const calloutInformation: Story = {
  ...createStory({}),
  render: () => (
    <Callout variant="info">
      <CalloutTitle>Information: Application under review</CalloutTitle>
      <CalloutAction>
        <Button variant="default-outline">Primary Button</Button>
      </CalloutAction>
    </Callout>
  ),
};

export const calloutError: Story = {
  ...createStory({}),
  render: () => (
    <Callout variant="danger">
      <CalloutTitle>Error: Form not sent</CalloutTitle>
      <CalloutAction>
        <Button variant="default-outline">Primary Button</Button>
      </CalloutAction>
    </Callout>
  ),
};

export const CalloutDefaultDark: Story = {
  ...createStory({}, "dark"),
  render: () => (
    <div className="dark">
      <Callout></Callout>
    </div>
  ),
};

export const calloutDefaultDarkWithTitle: Story = {
  ...createStory({}, "dark"),
  render: () => (
    <div className="dark">
      <Callout>
        <CalloutTitle>Information: Application under review</CalloutTitle>
      </Callout>
    </div>
  ),
};

export const calloutDefaultDarkWithTitleAndPrimaryButton: Story = {
  ...createStory({}, "dark"),
  render: () => (
    <div className="dark">
      <Callout>
        <CalloutTitle>Information: Application under review</CalloutTitle>
        <CalloutAction>
          <Button variant="default-outline">Primary Button</Button>
        </CalloutAction>
      </Callout>
    </div>
  ),
};

export const calloutDefaultDarkWithTitlePrimaryButtonAndDescription: Story = {
  ...createStory({}, "dark"),
  render: () => (
    <div className="dark">
      <Callout>
        <CalloutTitle>Information: Application under review</CalloutTitle>
        <CalloutContent>
          Online services will be down for maintenance on Saturday from 10 PM to
          2 AM. Thank you for your patience!
        </CalloutContent>
        <CalloutAction>
          <Button variant="default-outline">Primary Button</Button>
        </CalloutAction>
      </Callout>
    </div>
  ),
};

export const calloutDefaultDarkWithTitleDescriptionPrimaryAndSecondaryButton: Story =
  {
    ...createStory({}, "dark"),
    render: () => (
      <div className="dark">
        <Callout>
          <CalloutTitle>Information: Application under review</CalloutTitle>
          <CalloutContent>
            Online services will be down for maintenance on Saturday from 10 PM
            to 2 AM. Thank you for your patience!
          </CalloutContent>
          <CalloutAction>
            <Button variant="default-outline">Primary Button</Button>
            <Button variant="default-ghost">Secondary Button</Button>
          </CalloutAction>
        </Callout>
      </div>
    ),
  };

export const calloutSuccessDark: Story = {
  ...createStory({}, "dark"),
  render: () => (
    <div className="dark">
      <Callout variant="success">
        <CalloutTitle>Success: Data saved</CalloutTitle>
        <CalloutAction>
          <Button variant="default-outline">Primary Button</Button>
        </CalloutAction>
      </Callout>
    </div>
  ),
};

export const calloutWarningDark: Story = {
  ...createStory({}, "dark"),
  render: () => (
    <div className="dark">
      <Callout variant="warning">
        <CalloutTitle>Warning: Session ends soon</CalloutTitle>
        <CalloutAction>
          <Button variant="default-outline">Primary Button</Button>
        </CalloutAction>
      </Callout>
    </div>
  ),
};

export const calloutInformationDark: Story = {
  ...createStory({}, "dark"),
  render: () => (
    <div className="dark">
      <Callout variant="info">
        <CalloutTitle>Information: Application under review</CalloutTitle>
        <CalloutAction>
          <Button variant="default-outline">Primary Button</Button>
        </CalloutAction>
      </Callout>
    </div>
  ),
};

export const calloutErrorDark: Story = {
  ...createStory({}, "dark"),
  render: () => (
    <div className="dark">
      <Callout variant="danger">
        <CalloutTitle>Error: Form not sent</CalloutTitle>
        <CalloutAction>
          <Button variant="default-outline">Primary Button</Button>
        </CalloutAction>
      </Callout>
    </div>
  ),
};
