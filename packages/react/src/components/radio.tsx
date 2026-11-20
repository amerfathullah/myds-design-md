"use client";

import React, {
  ComponentProps,
  FunctionComponent,
  HTMLAttributes,
  Ref,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { clx } from "../utils";
import { sharedContext } from "../utils/registry";

type RadioSize = "small" | "medium" | "large";
const DEFAULT_SIZE = "medium";

/**
 * Extends Radix UI's RadioGroup.Root props.
 * @see https://www.radix-ui.com/primitives/docs/components/radio-group#root
 */
export interface RadioProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  size?: RadioSize;
}

const RadioContext = sharedContext<
  Required<Pick<RadioProps, "size" | "disabled">>
>("RadioContext", {
  size: DEFAULT_SIZE,
  disabled: false,
});

interface RadioItemContextValue {
  disabled: boolean;
  // Added within 2.x, so a RadioItem from an older copy leaves them out, and
  // every reader works without them
  /** The ids of the item's RadioHintTexts, in document order */
  hintIds?: readonly string[];
  /** Records a RadioHintText's id and element, and returns what forgets them */
  registerHint?: (id: string, element: HTMLElement) => () => void;
}

// An item needs it's own context because labels and radio buttons need to be
// aware if only the specific item was disabled, and its RadioButton needs the
// ids of its hints.
const RadioItemContext = sharedContext<RadioItemContextValue>(
  "RadioItemContext",
  { disabled: false },
);

// A RadioHintText in a RadioItem: its id, and the element it renders
interface Hint {
  id: string;
  element: HTMLElement;
}

// Sorts hints in document order, as the description reads them
const byDocumentOrder = (a: Hint, b: Hint) =>
  a.element === b.element
    ? 0
    : a.element.compareDocumentPosition(b.element) &
        Node.DOCUMENT_POSITION_FOLLOWING
      ? -1
      : 1;

const noHints: readonly string[] = [];

// Layout effects don't run on the server, and React 18 warns there, so the
// server gets useEffect. In the browser, a hint registers before the page
// paints.
const useBeforePaint =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

// Sets `ref` to `element` as React sets a ref it's given, and returns what a
// callback ref returns: under React 19, a cleanup to run in place of a later
// call with `null`
function setRef<T>(ref: Ref<T> | undefined, element: T | null): unknown {
  if (typeof ref === "function") return ref(element);
  if (ref) (ref as { current: T | null }).current = element;
}

/**
 * Uses RadixUI's RadioGroup.Root API.
 * @see https://www.radix-ui.com/primitives/docs/components/radio-group#api-reference
 */
const Radio = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioProps
>(({ className, size = DEFAULT_SIZE, disabled = false, ...props }, ref) => {
  return (
    <RadioContext.Provider value={{ size, disabled }}>
      <RadioGroupPrimitive.Root
        className={clx("grid gap-3", className)}
        disabled={disabled}
        ref={ref}
        {...props}
      />
    </RadioContext.Provider>
  );
});
Radio.displayName = "Radio";

/**
 * One option: a RadioButton, its RadioLabel and any RadioHintTexts. The
 * RadioButton points `aria-describedby` at the hints in its item.
 */
const RadioItem: FunctionComponent<
  ComponentProps<"div"> & { disabled?: boolean }
> = ({ className, children, ...props }) => {
  const { disabled } = useContext(RadioContext);
  const itemDisabled = props.disabled ?? disabled;
  const [hints, setHints] = useState<readonly Hint[]>([]);
  const registerHint = useCallback((id: string, element: HTMLElement) => {
    const hint: Hint = { id, element };
    setHints((current) => [...current, hint].sort(byDocumentOrder));
    return () => setHints((current) => current.filter((each) => each !== hint));
  }, []);
  const context = useMemo<RadioItemContextValue>(
    () => ({
      disabled: itemDisabled,
      hintIds: hints.map((hint) => hint.id),
      registerHint,
    }),
    [itemDisabled, hints, registerHint],
  );
  return (
    <RadioItemContext.Provider value={context}>
      <div className={clx("flex items-center gap-3", className)} {...props}>
        {children}
      </div>
    </RadioItemContext.Provider>
  );
};
RadioItem.displayName = "RadioItem";

/**
 * Uses RadixUI's RadioGroup.Item API. Its `aria-describedby` lists the ids of
 * the RadioHintTexts in its RadioItem, in document order, then your own.
 * @see https://www.radix-ui.com/primitives/docs/components/radio-group#item
 */
const RadioButton = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  const { size } = useContext(RadioContext);
  const { disabled, hintIds = noHints } = useContext(RadioItemContext);
  // Each id once, the hints' first, and none when there are none, so an
  // item without a hint points at no missing id
  const describedBy =
    [
      ...new Set([
        ...hintIds,
        ...(props["aria-describedby"]?.split(/\s+/).filter(Boolean) ?? []),
      ]),
    ].join(" ") || undefined;
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={clx(
        "shadow-button hover:border-otl-gray-300 border-otl-gray-200 aspect-square rounded-full border",
        "focus-visible:ring-fr-primary focus:outline-hidden focus-visible:ring-3",
        "disabled:bg-bg-washed disabled:cursor-not-allowed",
        "data-[state=checked]:bg-primary-600 data-[state=checked]:border-none",
        "data-[state=checked]:disabled:bg-primary-600 data-[state=checked]:disabled:opacity-30",
        size === "small" && "w-4",
        size === "medium" && "w-5",
        size === "large" && "w-5",
        className,
      )}
      disabled={props.disabled ?? disabled}
      {...props}
      // After the spread, so `aria-describedby={undefined}` keeps the hints
      aria-describedby={describedBy}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <div
          className="bg-bg-white aspect-square w-2/5 rounded-full"
          aria-hidden="true"
        />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioButton.displayName = "RadioButton";

const RadioLabel = ({
  className,
  children,
  ...props
}: ComponentProps<"label">) => {
  const { size } = useContext(RadioContext);
  const { disabled } = useContext(RadioItemContext);
  return (
    <label
      className={clx(
        "text-txt-black-700 font-medium",
        size === "small" && "text-body-sm",
        size === "medium" && "text-body-md",
        size === "large" && "text-lg",
        disabled && "text-txt-black-disabled",
        className,
      )}
      {...props}
    >
      {children}
    </label>
  );
};
RadioLabel.displayName = "RadioLabel";

interface RadioHintTextProps extends HTMLAttributes<HTMLElement> {
  /**
   * Does nothing. The hint describes the RadioButton in its RadioItem by
   * itself, and is no longer a `<label>`.
   * @deprecated Removed at the next major. Leave it out.
   */
  htmlFor?: string;
  /**
   * Does nothing. The hint is no longer a `<label>`.
   * @deprecated Removed at the next major. Leave it out.
   */
  form?: string;
  /**
   * The hint's `<div>`. A ref typed for the `<label>` it used to render still
   * compiles.
   */
  ref?: Ref<HTMLElement>;
}

/**
 * Hint text for an option: a `<div>` that describes the RadioButton in its
 * RadioItem, which points `aria-describedby` at it. Screen readers read it
 * after the radio's name, which the RadioLabel gives. Clicking it doesn't
 * select the radio. It renders your `id`, or generates one.
 */
const RadioHintText = ({
  className,
  children,
  id,
  ref,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- deprecated; taken out so it doesn't reach the div
  htmlFor,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- deprecated; taken out so it doesn't reach the div
  form,
  ...props
}: RadioHintTextProps) => {
  const { size } = useContext(RadioContext);
  const { disabled, registerHint } = useContext(RadioItemContext);
  const generatedId = useId();
  const hintId = id || generatedId;
  const element = useRef<HTMLDivElement | null>(null);
  // The `<div>` goes to the author's ref too. A cleanup it returns runs on
  // unmount, in place of a call with `null`.
  const divRef = useCallback(
    (node: HTMLDivElement | null) => {
      element.current = node;
      const cleanup = setRef(ref, node);
      if (typeof cleanup === "function")
        return () => {
          element.current = null;
          cleanup();
        };
    },
    [ref],
  );
  // Describe the item's RadioButton before the browser paints, and stop when
  // the hint unmounts or its id changes. Outside a RadioItem, or in one from
  // an older copy, it wires nothing.
  useBeforePaint(() => {
    if (!registerHint || !element.current) return;
    return registerHint(hintId, element.current);
  }, [registerHint, hintId]);
  return (
    <div
      ref={divRef}
      id={hintId}
      className={clx(
        "text-txt-black-500",
        size === "small" && "text-xs",
        size === "medium" && "text-body-sm",
        size === "large" && "text-body-md",
        disabled && "text-otl-gray-300",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
RadioHintText.displayName = "RadioHintText";

export { Radio, RadioItem, RadioButton, RadioLabel, RadioHintText };
