import React, { useId } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "@amerfathullah/myds-react/label";
import { Toggle, ToggleThumb } from "@amerfathullah/myds-react/toggle";
import { createRender, createStory } from "../utils";

/**
 * ### Overview
 * The Toggle component is a versatile switch that allows users to toggle between two states.
 * It's commonly used for enabling or disabling features, settings, or preferences.
 *
 *
 * ### Usage
 *
 * ```tsx
 * import { Label } from "@amerfathullah/myds-react/label"
 * import { Toggle, ToggleThumb } from "@amerfathullah/myds-react/toggle"
 *
 * function MyComponent() {
 *   const [isChecked, setIsChecked] = React.useState(false);
 *   return (
 *     <>
 *       <Label htmlFor="notify">Email notifications</Label>
 *       <Toggle id="notify" checked={isChecked} onCheckedChange={setIsChecked}>
 *         <ToggleThumb />
 *       </Toggle>
 *     </>
 *   );
 * }
 * ```
 *
 * ### Naming
 * The switch has no default name, so name each one. Give the `Toggle` an `id`, and pass the same id to a `Label`'s `htmlFor`.
 * Don't wrap the `Toggle` in a `Label`: `ToggleThumb` renders its own `<label>`.
 * If no visible label names the switch, pass an `aria-label` to `ToggleThumb`, e.g. `<ToggleThumb aria-label="Pemberitahuan e-mel" />`.
 *
 * Space and Enter each toggle the switch. A disabled `<fieldset>` disables it.
 */

const meta: Meta<typeof Toggle> = {
  title: "@amerfathullah/myds-react/Toggle",
  component: Toggle,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    defaultChecked: {
      control: "boolean",
      description: "The default checked state of the toggle (uncontrolled)",
    },
    checked: {
      control: "boolean",
      description: "The controlled checked state of the toggle",
    },
    onCheckedChange: {
      action: "checked changed",
      description: "Callback function when the checked state changes",
    },
    size: {
      control: "inline-radio",
      options: ["medium", "large"],
      description: "The size of the toggle",
    },
    disabled: {
      control: "boolean",
      description: "Whether the toggle is disabled",
    },
    className: {
      control: "text",
      description: "Additional CSS classes for customization",
    },
  },
};

export default meta;

// Each story names its switch with a Label. useId gives each switch its own
// id. An id built from the story's id would repeat on the docs page, which
// shows the first story twice
const Base = () => {
  const id = useId();
  return (
    <div className="flex items-center gap-3">
      <Label htmlFor={id}>Email notifications</Label>
      <Toggle id={id}>
        <ToggleThumb />
      </Toggle>
    </div>
  );
};
export const DefaultMedium = createRender(Base, "light");

const BaseDark = () => {
  const id = useId();
  return (
    <div className="dark flex items-center gap-3">
      <Label htmlFor={id}>Email notifications</Label>
      <Toggle id={id}>
        <ToggleThumb />
      </Toggle>
    </div>
  );
};
export const DefaultMediumDark = createRender(BaseDark, "dark");

const Small = () => {
  const id = useId();
  return (
    <div className="flex items-center gap-3">
      <Label htmlFor={id} size="small">
        Email notifications
      </Label>
      <Toggle id={id} size="small">
        <ToggleThumb />
      </Toggle>
    </div>
  );
};
export const SmallToggle = createRender(Small, "light");

const SmallDark = () => {
  const id = useId();
  return (
    <div className="dark flex items-center gap-3">
      <Label htmlFor={id} size="small">
        Email notifications
      </Label>
      <Toggle id={id} size="small">
        <ToggleThumb />
      </Toggle>
    </div>
  );
};
export const SmallToggleDark = createRender(SmallDark, "dark");

const Large = () => {
  const id = useId();
  return (
    <div className="flex items-center gap-3">
      <Label htmlFor={id} size="large">
        Email notifications
      </Label>
      <Toggle id={id} size="large">
        <ToggleThumb />
      </Toggle>
    </div>
  );
};
export const LargeToggle = createRender(Large, "light");

const LargeDark = () => {
  const id = useId();
  return (
    <div className="dark flex items-center gap-3">
      <Label htmlFor={id} size="large">
        Email notifications
      </Label>
      <Toggle id={id} size="large">
        <ToggleThumb />
      </Toggle>
    </div>
  );
};
export const LargeToggleDark = createRender(LargeDark, "dark");

const Checked = () => {
  const id = useId();
  return (
    <div className="flex items-center gap-3">
      <Label htmlFor={id}>Email notifications</Label>
      <Toggle id={id} defaultChecked={true}>
        <ToggleThumb />
      </Toggle>
    </div>
  );
};
export const CheckedToggle = createRender(Checked, "light");

// With no visible label, an `aria-label` on ToggleThumb names the switch
const NamedByAriaLabel = () => (
  <Toggle>
    <ToggleThumb aria-label="Pemberitahuan e-mel" />
  </Toggle>
);
export const AriaLabelToggle = createRender(NamedByAriaLabel, "light");

const DisabledWhileOff = () => {
  const id = useId();
  return (
    <div className="flex items-center gap-3">
      <Label htmlFor={id} disabled>
        Email notifications
      </Label>
      <Toggle id={id} disabled={true}>
        <ToggleThumb />
      </Toggle>
    </div>
  );
};
export const DisabledToggleOff = createRender(DisabledWhileOff, "light");

const DisabledWhileOn = () => {
  const id = useId();
  return (
    <div className="flex items-center gap-3">
      <Label htmlFor={id} disabled>
        Email notifications
      </Label>
      <Toggle id={id} disabled={true} defaultChecked={true}>
        <ToggleThumb />
      </Toggle>
    </div>
  );
};
export const DisabledToggleOn = createRender(DisabledWhileOn, "light");

const DisabledWhileOffDark = () => {
  const id = useId();
  return (
    <div className="dark flex items-center gap-3">
      <Label htmlFor={id} disabled>
        Email notifications
      </Label>
      <Toggle id={id} disabled={true}>
        <ToggleThumb />
      </Toggle>
    </div>
  );
};
export const DisabledToggleOffDark = createRender(DisabledWhileOffDark, "dark");

const DisabledWhileOnDark = () => {
  const id = useId();
  return (
    <div className="dark flex items-center gap-3">
      <Label htmlFor={id} disabled>
        Email notifications
      </Label>
      <Toggle id={id} disabled={true} defaultChecked={true}>
        <ToggleThumb />
      </Toggle>
    </div>
  );
};
export const DisabledToggleOnDark = createRender(DisabledWhileOnDark, "dark");

// A disabled fieldset disables the switch, with no `disabled` prop on Toggle.
// Label disables nothing, so it takes `disabled` for its dimmed look
const InDisabledFieldset = () => {
  const id = useId();
  return (
    <fieldset disabled>
      <legend className="text-body-sm text-txt-black-900 mb-2">
        Notifications
      </legend>
      <div className="flex items-center gap-3">
        <Label htmlFor={id} disabled>
          Email notifications
        </Label>
        <Toggle id={id}>
          <ToggleThumb />
        </Toggle>
      </div>
    </fieldset>
  );
};
export const DisabledFieldset = createRender(InDisabledFieldset, "light");

const ControlledToggle = () => {
  const id = useId();
  const [isChecked, setIsChecked] = React.useState(false);
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <p>Current state: {isChecked ? "On" : "Off"}</p>
      <div className="flex items-center gap-3">
        <Label htmlFor={id}>Email notifications</Label>
        <Toggle id={id} checked={isChecked} onCheckedChange={setIsChecked}>
          <ToggleThumb />
        </Toggle>
      </div>
    </div>
  );
};

export const ControlledToggleExample = createRender(() => {
  return <ControlledToggle></ControlledToggle>;
}, "light");

const Uncontrolled = () => {
  const id = useId();
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="flex items-center gap-3">
        <Label htmlFor={id}>Email notifications</Label>
        <Toggle id={id} defaultChecked={false}>
          <ToggleThumb />
        </Toggle>
      </div>
      <p className="">This toggle manages its own state internally.</p>
    </div>
  );
};
export const UncontrolledToggle = createRender(Uncontrolled, "light");
