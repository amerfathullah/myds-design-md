import React, { createContext, useContext, useId } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clx } from "../utils";

// The visual track. The native checkbox before it, marked `peer`, is the
// switch, so the track follows its state: its focus (`peer-focus:`), which a
// click on the track gives it too, and its disabled state (`peer-disabled:`),
// which a disabled `<fieldset>` sets as well as the `disabled` prop.
const thumbVariants = cva(
  [
    "block bg-otl-gray-200 hover:bg-otl-gray-300 data-[state=checked]:bg-bg-primary-600 cursor-pointer rounded-full transition-color duration-200 z-10",
    // Under forced colours, which drop the ring, `outline-hidden` draws an
    // outline instead
    "peer-focus:ring-3 peer-focus:ring-fr-primary peer-focus:outline-hidden",
    "before:content-[''] before:left-[3px] before:bottom-[3px] before:bg-white before:absolute before:rounded-full before:transition-all before:duration-200",
    "peer-disabled:data-[state=checked]:bg-bg-primary-disabled peer-disabled:cursor-not-allowed peer-disabled:data-[state=checked]:before:bg-bg-white",
    "peer-disabled:data-[state=unchecked]:bg-bg-washed peer-disabled:data-[state=unchecked]:before:bg-bg-white",
  ],
  {
    variants: {
      size: {
        small:
          "h-[16px] w-[24px] before:size-[10px] data-[state=checked]:before:translate-x-2",
        medium:
          "h-[20px] w-[30px] before:size-[14px] data-[state=checked]:before:translate-x-[10px]",
        large:
          "h-[24px] w-[36px] before:size-[18px] data-[state=checked]:before:translate-x-3",
      },
    },
    defaultVariants: {
      size: "medium",
    },
  },
);

interface ToggleContextType extends VariantProps<typeof thumbVariants> {
  checked: boolean;
  disabled: boolean;
  onChange: () => void;
  id: string;
}

const ToggleContext = createContext<ToggleContextType | undefined>(undefined);

export interface ToggleProps extends VariantProps<typeof thumbVariants> {
  /** The switch's id, so a `<Label htmlFor>` names it */
  id?: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

const Toggle: React.FC<ToggleProps> = ({
  id,
  defaultChecked = false,
  checked,
  onCheckedChange,
  size = "medium",
  disabled = false,
  className = "",
  children,
}) => {
  const generatedId = useId();
  const [_checked, set_checked] = React.useState(
    checked || defaultChecked || false,
  );

  React.useEffect(() => {
    if (checked === undefined) return;
    set_checked(checked);
  }, [checked]);

  const handleChange = () => {
    if (disabled) return;

    set_checked(!_checked);
    onCheckedChange?.(!_checked);
  };

  return (
    <ToggleContext.Provider
      value={{
        checked: _checked,
        disabled,
        size,
        onChange: handleChange,
        id: id ?? generatedId,
      }}
    >
      <div
        tabIndex={-1}
        className={clx("flex items-start justify-between gap-2.5", className)}
      >
        {children}
      </div>
    </ToggleContext.Provider>
  );
};
Toggle.displayName = "Toggle";

export interface ToggleThumbProps {
  className?: string;
  /** Names the switch when no `<Label htmlFor>` does. It has no default name. */
  "aria-label"?: string;
  /** Names the switch from the element with this id */
  "aria-labelledby"?: string;
  /** Describes the switch from the element with this id */
  "aria-describedby"?: string;
}

const ToggleThumb: React.FC<ToggleThumbProps> = ({
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
}) => {
  const context = useContext(ToggleContext);
  if (!context) throw new Error("ToggleThumb must be used within Toggle");

  // Space toggles a checkbox natively. Enter toggles it too, as it did, and
  // doesn't submit an enclosing form.
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    context.onChange();
  };

  // The checkbox is the switch: the one element that takes focus, named by a
  // `<Label htmlFor>` or the aria props. A click on the track reaches it
  // through the label around them. The focused checkbox draws no outline of
  // its own; the track rings instead.
  return (
    <label className="relative inline-block">
      <input
        id={context.id}
        type="checkbox"
        role="switch"
        className="peer sr-only outline-hidden"
        checked={context.checked}
        onChange={context.onChange}
        onKeyDown={handleKeyDown}
        disabled={context.disabled}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
      />
      <span
        aria-hidden="true"
        className={clx(thumbVariants({ size: context.size }), className)}
        data-state={context.checked ? "checked" : "unchecked"}
      />
    </label>
  );
};
ToggleThumb.displayName = "ToggleThumb";

export { Toggle, ToggleThumb };
