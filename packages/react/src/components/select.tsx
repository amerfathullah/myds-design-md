import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { clx } from "../utils";
import { cva } from "class-variance-authority";
import { ChevronDownFillIcon } from "../icons/chevron-down-fill";
import { CheckCircleFillIcon } from "../icons/check-circle-fill";
import { Checkbox } from "./checkbox";
import { sharedContext } from "../utils/registry";

type SelectBase = Omit<
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root>,
  "value" | "defaultValue" | "onValueChange"
> & {
  variant?: "outline" | "ghost" | null;
  size?: "small" | "medium" | "large" | null;
};

type SelectSingle = SelectBase & {
  multiple?: false;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

type SelectMultiple = SelectBase & {
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
};

const isMultiple = (props: SelectProps): props is SelectMultiple =>
  Boolean(props.multiple);

type SelectProps = SelectSingle | SelectMultiple;

// How a string `label` on SelectValue names the select (#134). Its
// SelectLabel names the trigger and the open list, which point their
// `aria-labelledby` at it, unless the consumer names the trigger.
type SelectNaming = {
  // The id of the SelectLabel a string `label` renders
  labelId: string;
  // Whether that label names the trigger and the list: SelectValue renders
  // it, and SelectTrigger has reported that nothing else names it
  labelNames: boolean;
  // SelectValue reports whether it renders a string label
  setHasLabel: (hasLabel: boolean) => void;
  // SelectTrigger reports, once mounted, whether the consumer names it
  setTriggerNamed: (named: boolean) => void;
};

type SelectInternalProps = {
  _value: string | string[];
  // Missing from the default value and from a root of an older copy of the
  // library, which shares this context: then the label names nothing, as
  // before
  _naming?: SelectNaming;
};

// Selects an option of a `multiple` select's form control by default as well,
// so a form's reset keeps every option selected. The reset leaves restoring
// the selection to Select, and the control then follows it.
const selectByDefault = (option: HTMLOptionElement | null) => {
  if (option) option.defaultSelected = true;
};

// Makes an element inert: nothing in it takes focus or a pointer, and
// assistive technology skips it. Set on the element rather than as a prop,
// which React 18 doesn't know and React 19 takes as a boolean.
const makeInert = (element: HTMLElement | null) => {
  element?.setAttribute("inert", "");
};

// Sets `ref` to `node` as React sets a ref it's given, and returns what a
// callback ref returns: under React 19, a cleanup to run in place of a later
// call with `null`
function setRef<T>(ref: React.Ref<T> | undefined, node: T | null): unknown {
  if (typeof ref === "function") return ref(node);
  if (ref) (ref as { current: T | null }).current = node;
}

const SelectContext = sharedContext<SelectProps & SelectInternalProps>(
  "SelectContext",
  {
    _value: "",
    multiple: false,
    value: "",
    defaultValue: "",
    onValueChange: () => {},
    variant: "outline",
    size: "small",
  },
);

// Layout effects don't run on the server, and React 18 warns there, so the
// server gets useEffect. In the browser, the naming each part reports is in
// place before the page paints.
const useBeforePaint =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

const Select: React.ForwardRefExoticComponent<SelectProps> = React.forwardRef(
  (props, ref) => {
    // The defaults the docs give, so every part reads a value
    const { size = "small", variant = "outline" } = props;
    // The selection of an uncontrolled select. A controlled one never reads
    // or writes it.
    const [_uncontrolledValue, _setUncontrolledValue] = React.useState(
      isMultiple(props) ? props.defaultValue || [] : props.defaultValue || "",
    );
    // `value` alone decides what a controlled select shows, checks and
    // submits, `""` and `[]` included
    const isValueControlled = props.value !== undefined;
    const _value = isValueControlled ? props.value! : _uncontrolledValue;
    // Whether the list of a select without `open` shows, from `defaultOpen`
    // on the first render, server render included. A select with `open`
    // never reads or writes it.
    const [_uncontrolledOpen, _setUncontrolledOpen] = React.useState(
      props.defaultOpen ?? false,
    );
    // `open` alone decides whether a controlled select's list shows. Radix's
    // root always gets this boolean, so it never switches between controlled
    // and uncontrolled, which it warns about.
    const isOpenControlled = props.open !== undefined;
    const _open = isOpenControlled ? props.open! : _uncontrolledOpen;
    // Set by a pick in a `multiple` select, until the request to close the
    // list that Radix's item sends straight after it
    const _picking = React.useRef(false);
    // What SelectValue and SelectTrigger report for naming the select. The
    // trigger's report is `null` until it's mounted, so the label names
    // nothing in server HTML, or beside a trigger that never reports.
    const labelId = React.useId();
    const [hasLabel, setHasLabel] = React.useState(false);
    const [triggerNamed, setTriggerNamed] = React.useState<boolean | null>(
      null,
    );
    const _naming: SelectNaming = {
      labelId,
      labelNames: hasLabel && triggerNamed === false,
      setHasLabel,
      setTriggerNamed,
    };

    React.useEffect(() => {
      if (props.multiple && !Array.isArray(_uncontrolledValue))
        _setUncontrolledValue([]);
      if (!props.multiple && Array.isArray(_uncontrolledValue))
        _setUncontrolledValue("");
    }, [props.multiple]);

    // A pick tells the parent the next value, and only an uncontrolled select
    // shows it without waiting for a new `value`. In a `multiple` select, a
    // pick adds or removes its value. A whole array replaces the selection:
    // Radix hands one over on a form's reset, and the form control on a
    // change.
    const handleValueChange = (value: string | string[] | undefined | null) => {
      if (value === undefined || value === null) return;

      if (isMultiple(props)) {
        // Radix's item reports a pick here, then asks to close the list in
        // the same event. The mark is cleared right after, so it skips that
        // request alone, and not a later one, such as Escape.
        if (!Array.isArray(value)) {
          _picking.current = true;
          queueMicrotask(() => {
            _picking.current = false;
          });
        }

        const temp = Array.isArray(value)
          ? value
          : !_value.includes(value)
            ? [..._value, value]
            : (_value as string[]).filter((v) => v !== value);

        if (!isValueControlled) _setUncontrolledValue(temp);
        props.onValueChange?.(temp);
      } else if (!Array.isArray(value)) {
        if (!isValueControlled) _setUncontrolledValue(value);
        props.onValueChange?.(value);
      }
    };

    // Radix asks to open or close the list. Each request tells the parent,
    // and only an uncontrolled select shows it without waiting for a new
    // `open`. A `multiple` select stays open after a pick, so it skips the
    // request to close that the pick sends.
    const handleOpenChange = (open: boolean) => {
      if (!open && _picking.current) {
        _picking.current = false;
        return;
      }
      if (!isOpenControlled) _setUncontrolledOpen(open);
      props.onOpenChange?.(open);
    };

    // Radix's root renders a hidden native `<select>` for a form, which takes
    // a single value. A `multiple` select gets that root without it.
    const Root = isMultiple(props)
      ? SelectPrimitive.unstable_SelectProvider
      : SelectPrimitive.Root;
    // What a `multiple` select's form control holds. In the render after
    // `multiple` turns on, an uncontrolled select's state is still a single
    // value, which the control takes as nothing selected.
    const selection = Array.isArray(_value) ? _value : [];

    return (
      <SelectContext.Provider
        value={{ ...props, size, variant, _value, _naming }}
      >
        <Root
          ref={ref}
          {...props}
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          /* @ts-expect-error */
          value={_value}
          onValueChange={handleValueChange}
          open={_open}
          onOpenChange={handleOpenChange}
        >
          {props.children}
          {isMultiple(props) && (
            // The form control of a `multiple` select, which a form submits
            // and the browser can autofill: one selected option per value
            <select
              aria-hidden
              tabIndex={-1}
              multiple
              name={props.name}
              form={props.form}
              required={props.required}
              disabled={props.disabled}
              autoComplete={props.autoComplete}
              value={selection}
              onChange={(event) =>
                handleValueChange(
                  [...event.currentTarget.options]
                    .filter((option) => option.selected)
                    .map((option) => option.value),
                )
              }
              className="sr-only"
            >
              {[...new Set(selection)].map((value) => (
                <option key={value} value={value} ref={selectByDefault} />
              ))}
            </select>
          )}
        </Root>
      </SelectContext.Provider>
    );
  },
);
Select.displayName = "Select";

const SelectGroup = SelectPrimitive.Group;

/*========================================================================================================================*/

const select_icon_cva = cva(["text-txt-black-900"], {
  variants: {
    size: {
      small: "size-4",
      medium: "size-5",
      large: "size-5",
    },
  },
});

interface SelectValueProps extends Omit<
  React.ComponentProps<typeof SelectPrimitive.Value>,
  "children" | "asChild"
> {
  label?: React.ReactNode;
  icon?: React.JSXElementConstructor<any>;
  children?: (value: string | string[]) => React.ReactNode | React.ReactNode;
}
const SelectValue: React.ForwardRefExoticComponent<SelectValueProps> =
  React.forwardRef(({ label, icon, children, className, ...props }, ref) => {
    const rootProps = React.useContext(SelectContext);
    const naming = rootProps._naming;
    const Icon = icon || ChevronDownFillIcon;

    // Only a non-empty string label can name the select. An empty one still
    // renders its SelectLabel, and an element renders as given, naming
    // nothing.
    const hasStringLabel = typeof label === "string" && label !== "";
    const setHasLabel = naming?.setHasLabel;
    useBeforePaint(() => {
      if (!hasStringLabel || !setHasLabel) return;
      setHasLabel(true);
      return () => setHasLabel(false);
    }, [hasStringLabel, setHasLabel]);

    // While the label names the trigger, it's hidden from assistive
    // technology, so the trigger's value is what follows it. The trigger's
    // `aria-labelledby` still reads it.
    const labelNode =
      typeof label === "string" ? (
        <SelectLabel
          {...(hasStringLabel &&
            naming && {
              id: naming.labelId,
              "aria-hidden": naming.labelNames || undefined,
            })}
        >
          {label}
        </SelectLabel>
      ) : (
        label
      );

    if (!isMultiple(rootProps))
      return (
        <>
          {labelNode}
          <SelectPrimitive.Value
            ref={ref}
            {...props}
            className={clx("text-inherit", className)}
          >
            {children && children(rootProps._value)}
          </SelectPrimitive.Value>
          <SelectPrimitive.Icon asChild>
            <Icon className={select_icon_cva({ size: rootProps.size })} />
          </SelectPrimitive.Icon>
        </>
      );

    return (
      <>
        {labelNode}
        <SelectPrimitive.Value
          ref={ref}
          {...props}
          className={clx("text-inherit", className)}
        >
          {children && children(rootProps._value)}
        </SelectPrimitive.Value>

        {!children && <SelectCounter>{rootProps._value?.length}</SelectCounter>}

        <SelectPrimitive.Icon asChild>
          <Icon className={select_icon_cva({ size: rootProps.size })} />
        </SelectPrimitive.Icon>
      </>
    );
  });
SelectValue.displayName = "SelectValue";

/*========================================================================================================================*/

const select_counter_cva = cva(
  [
    "flex aspect-square shrink-0 leading-none items-center justify-center bg-primary-600",
    "rounded-full px-1 leading-none text-white",
    "group-disabled:bg-bg-white-disabled group-disabled:text-inherit",
  ],
  {
    variants: {
      size: {
        small: "text-body-sm",
        medium: "text-body-md",
        large: "text-body-md",
      },
    },
    defaultVariants: {
      size: "small",
    },
  },
);

type SelectCounterProps = React.ComponentProps<"span">;

const SelectCounter: React.ForwardRefExoticComponent<SelectCounterProps> =
  React.forwardRef(({ children, className, ...props }, ref) => {
    const { size } = React.useContext(SelectContext);

    return (
      <span
        ref={ref}
        className={clx(select_counter_cva({ size }), className)}
        {...props}
      >
        {children}
      </span>
    );
  });

SelectCounter.displayName = "SelectCounter";
/*========================================================================================================================*/

const select_trigger_cva = cva(
  [
    "group inline-flex select-none items-center gap-1.5 outline-hidden rounded-md w-fit text-txt-black-900",
    "focus:ring-3 focus:ring-fr-primary",
    "disabled:bg-bg-white-disabled disabled:text-txt-black-disabled disabled:border-transparent disabled:cursor-not-allowed",
  ],
  {
    variants: {
      variant: {
        outline: [
          "bg-bg-white border border-otl-gray-200 shadow-button",
          "hover:bg-bg-white-hover hover:border-otl-gray-300",
        ],
        ghost: [
          "bg-transparent border border-transparent",
          "hover:bg-bg-white-hover",
        ],
      },
      size: {
        small: "py-1.5 px-2.5 text-body-sm",
        medium: "py-2 px-3 text-body-md",
        large: "py-2.5 px-4 text-body-lg",
      },
    },
    defaultVariants: { variant: "outline", size: "small" },
  },
);

const SelectTrigger: React.ForwardRefExoticComponent<
  React.ComponentProps<typeof SelectPrimitive.Trigger>
> = React.forwardRef(({ className, children, ...props }, ref) => {
  const { variant, size, _naming: naming } = React.useContext(SelectContext);

  // The consumer names the trigger with an `aria-label` or `aria-labelledby`
  // of its own, or with a Label pointed at its `id` or wrapping it, which
  // the button's `labels` hold once it's mounted. Then the label in it names
  // nothing, and the trigger renders as before.
  const namedByProps =
    props["aria-label"] !== undefined || props["aria-labelledby"] !== undefined;
  const button = React.useRef<HTMLButtonElement | null>(null);
  // The button goes to the consumer's ref too. A cleanup it returns runs on
  // unmount, in place of a call with `null`, as Radix's trigger runs it.
  const buttonRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      button.current = node;
      const cleanup = setRef(ref, node);
      if (typeof cleanup === "function")
        return () => {
          button.current = null;
          cleanup();
        };
    },
    [ref],
  );
  const setTriggerNamed = naming?.setTriggerNamed;
  // After every render, as a Label can come or go with any of them
  useBeforePaint(() => {
    setTriggerNamed?.(namedByProps || Boolean(button.current?.labels?.length));
  });
  // A name passed in this render wins at once, before the report above
  const labelNames = naming?.labelNames && !namedByProps;

  return (
    <SelectPrimitive.Trigger
      ref={buttonRef}
      className={select_trigger_cva({
        variant,
        size,
        className,
      })}
      {...(labelNames && { "aria-labelledby": naming.labelId })}
      {...props}
    >
      {children}
    </SelectPrimitive.Trigger>
  );
});
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

/*========================================================================================================================*/

const select_label_cva = cva(
  ["group-data-[disabled]:text-txt-black-disabled"],
  {
    variants: {
      size: {
        small: "text-body-sm",
        medium: "text-body-md",
        large: "text-body-lg",
      },
      multiple: {
        false: "text-txt-black-500",
        true: "text-txt-black-900",
      },
    },
    defaultVariants: { size: "small", multiple: false },
  },
);

const SelectLabel: React.ForwardRefExoticComponent<
  React.ComponentProps<"span">
> = React.forwardRef(({ className, ...props }, ref) => {
  const { size, multiple } = React.useContext(SelectContext);
  return (
    <span
      ref={ref}
      className={select_label_cva({ size, multiple, className })}
      {...props}
    />
  );
});
SelectLabel.displayName = "SelectLabel";

/*========================================================================================================================*/

const select_content_cva = cva(
  [
    "bg-bg-dialog relative z-50 py-1 max-h-64 min-w-[8rem] overflow-hidden ",
    "rounded-md border border-otl-gray-200 shadow-context-menu",
    "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  ],
  {
    variants: {
      position: {
        popper:
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        "item-aligned": "",
      },
      size: {
        small: "max-h-64",
        medium: "max-h-72",
        large: "max-h-80",
      },
    },
    defaultVariants: { position: "popper", size: "small" },
  },
);

const SelectContent: React.ForwardRefExoticComponent<
  React.ComponentProps<typeof SelectPrimitive.Content>
> = React.forwardRef(
  ({ className, children, position = "popper", ...props }, ref) => {
    const { size, multiple, _naming: naming } = React.useContext(SelectContext);
    // The label that names the trigger names the open list too, unless
    // SelectContent gets a name of its own
    const labelNames =
      naming?.labelNames &&
      props["aria-label"] === undefined &&
      props["aria-labelledby"] === undefined;
    // A press outside the list calls `onPointerDownOutside`, then, unless it
    // calls `preventDefault()`, Radix asks Select's root to close the list
    return (
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          ref={ref}
          className={select_content_cva({ position, size, className })}
          position={position}
          {...(labelNames && { "aria-labelledby": naming.labelId })}
          {...props}
          // Radix has no multi-select list, so a `multiple` select's list
          // says it is one itself
          {...(multiple && { "aria-multiselectable": true })}
        >
          <SelectPrimitive.Viewport
            className={clx(
              position === "popper" &&
                "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
            )}
          >
            {children}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    );
  },
);
SelectContent.displayName = SelectPrimitive.Content.displayName;

/*========================================================================================================================*/

const SelectGroupTitle = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectXPad>
    <SelectPrimitive.Label
      ref={ref}
      className={clx(
        "text-body-xs px-2.5 py-1.5 font-semibold text-gray-400",
        className,
      )}
      {...props}
    />
  </SelectXPad>
));
SelectGroupTitle.displayName = SelectPrimitive.Label.displayName;

/*========================================================================================================================*/

const select_item_cva = cva(
  [
    "flex items-center w-full cursor-default select-none py-1.5 gap-2 font-medium outline-hidden text-txt-black-700 rounded-xs",
    "data-[highlighted]:bg-bg-washed",
  ],
  {
    variants: {
      size: {
        small: "text-body-xs",
        medium: "text-body-sm",
        large: "text-body-md",
      },
      multiple: {
        false: "pl-2.5 pr-[38px]",
        true: "px-2.5",
      },
      disabled: {
        false: "",
        true: "bg-bg-white-disabled text-txt-black-disabled border-transparent cursor-not-allowed hover:bg-none",
      },
    },
    defaultVariants: { size: "small", multiple: false, disabled: false },
  },
);

const SelectItem: React.ForwardRefExoticComponent<
  React.ComponentProps<typeof SelectPrimitive.Item>
> = React.forwardRef(({ className, children, disabled, ...props }, ref) => {
  const rootProps = React.useContext(SelectContext);
  // `disabled` styles the item and, on Radix's item, disables it: its option
  // takes `aria-disabled`, focus and typeahead skip it and nothing picks it
  if (!isMultiple(rootProps))
    return (
      <SelectXPad>
        <SelectPrimitive.Item
          ref={ref}
          className={clx(
            select_item_cva({
              size: rootProps.size,
              multiple: false,
              disabled,
            }),
            className,
          )}
          {...props}
          disabled={disabled}
        >
          <span className="absolute right-4 flex h-3.5 w-3.5 items-center justify-center">
            <SelectPrimitive.ItemIndicator>
              <CheckCircleFillIcon
                data-size={rootProps.size}
                className="text-primary-600 size-5 data-[size=small]:size-4"
              />
            </SelectPrimitive.ItemIndicator>
          </span>
          <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        </SelectPrimitive.Item>
      </SelectXPad>
    );

  // Radix holds one value, so it never takes an item of a `multiple` select
  // for selected. The item says so itself, to assistive technology too,
  // whichever item has focus.
  const checked = rootProps._value.includes(props.value);

  return (
    <SelectXPad>
      <SelectPrimitive.Item
        ref={ref}
        className={clx(
          select_item_cva({
            size: rootProps.size,
            multiple: true,
            disabled,
            className,
          }),
          className,
        )}
        {...props}
        disabled={disabled}
        aria-selected={checked}
        data-state={checked ? "checked" : "unchecked"}
      >
        {/* Only draws the item's state, which the option itself announces.
            A press on it lands on the option, and focus stays there.
            `aria-hidden` and `pointer-events-none` do what `inert` does, for
            tools and browsers that don't know `inert`. */}
        <Checkbox
          ref={makeInert}
          checked={checked}
          disabled={disabled}
          aria-hidden
          className="pointer-events-none"
        />
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      </SelectPrimitive.Item>
    </SelectXPad>
  );
});
SelectItem.displayName = SelectPrimitive.Item.displayName;

/*========================================================================================================================*/

const SelectSeparator: React.ForwardRefExoticComponent<
  React.ComponentProps<typeof SelectPrimitive.Separator>
> = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={clx("bg-otl-divider -mx-1 my-1 h-px", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

/*========================================================================================================================*/

const SelectHeader: React.ForwardRefExoticComponent<
  React.ComponentProps<"div">
> = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <SelectXPad
      ref={ref}
      className={clx("bg-bg-dialog sticky top-0 z-50 pb-1", className)}
      {...props}
    />
  );
});
SelectHeader.displayName = "SelectHeader";

/*========================================================================================================================*/

const SelectFooter: React.ForwardRefExoticComponent<
  React.ComponentProps<"div">
> = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <SelectXPad
      ref={ref}
      className={clx(
        "bg-bg-dialog border-otl-gray-200 sticky bottom-0 z-50 border-t py-1",
        className,
      )}
      {...props}
    />
  );
});
SelectFooter.displayName = "SelectFooter";

/*========================================================================================================================*/

// Select's side padding around the header, the footer, a group title and an
// item. It puts every prop and its ref on its `div`, which is the header's and
// the footer's own `div`.
const SelectXPad: React.ForwardRefExoticComponent<React.ComponentProps<"div">> =
  React.forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={clx("px-1", className)} {...props} />
  ));
SelectXPad.displayName = "SelectXPad";

export {
  Select,
  SelectGroup,
  SelectGroupTitle,
  SelectValue,
  SelectTrigger,
  SelectLabel,
  SelectContent,
  SelectHeader,
  SelectFooter,
  SelectItem,
  SelectSeparator,
  // SelectScrollUpButton,
  // SelectScrollDownButton,
};
