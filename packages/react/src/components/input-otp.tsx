import React, {
  ComponentProps,
  ComponentPropsWithoutRef,
  ElementRef,
} from "react";
import {
  OTPInput as PrimitiveInputOTP,
  OTPInputContext as PrimitiveInputOTPContext,
} from "input-otp";
import { clx } from "../utils";
import { cva } from "class-variance-authority";

interface BaseInputOTPProps {
  maxLength: number;
  value?: string;
  onChange?: (value: string) => void;
  containerClassName?: string;
  children: React.ReactNode;
  invalid?: boolean;
}

interface InputOTPProps
  extends BaseInputOTPProps,
    Omit<ComponentProps<"input">, keyof BaseInputOTPProps> {}

const InputOTP = React.forwardRef<
  ElementRef<typeof PrimitiveInputOTP>,
  InputOTPProps
>(({ className, containerClassName, children, invalid, ...props }, ref) => (
  <PrimitiveInputOTP
    ref={ref}
    containerClassName={clx(
      "group/input-otp flex items-center gap-1.5",
      containerClassName,
    )}
    className={clx("disabled:cursor-not-allowed", className)}
    aria-invalid={invalid}
    {...props}
  >
    {children}
  </PrimitiveInputOTP>
));
InputOTP.displayName = "InputOTP";

const slot_cva = cva(
  [
    "relative flex h-[68px] w-[50px] items-center justify-center rounded-md border bg-bg-white text-4xl font-medium text-txt-black-900 transition-all",
    // The slots take the error and disabled styling from InputOTP's own
    // input, which input-otp marks data-input-otp and wraps in a div in the
    // container: its aria-invalid, which the invalid prop sets, and its
    // :disabled, which a disabled fieldset also sets. The group is named, so
    // a group ancestor the consumer adds, or a library one such as
    // AccordionItem, doesn't match, and >div> picks only the container's own
    // input, not another control's or InputOTP's among the children or in a
    // wrapper the consumer names group/input-otp. An InputOTP placed among
    // another's children still takes the outer one's look
    "border-otl-gray-200 group-has-[>div>input[data-input-otp][aria-invalid=true]]/input-otp:border-otl-danger-300",
    "group-has-[>div>input[data-input-otp]:disabled]/input-otp:bg-bg-washed group-has-[>div>input[data-input-otp]:disabled]/input-otp:text-txt-black-500",
  ],
  {
    variants: {
      active: {
        // The input is transparent, so under forced colours, which drop the
        // ring, the slot draws the outline (`outline-hidden`). An invalid
        // active slot keeps its danger border, as the Tailwind variant above
        // outranks border-otl-primary-300, and rings fr-danger
        true: "z-10 border-otl-primary-300 ring-3 ring-fr-primary outline-hidden group-has-[>div>input[data-input-otp][aria-invalid=true]]/input-otp:ring-fr-danger",
        false: "",
      },
    },
    defaultVariants: {},
  },
);

const InputOTPSlot = React.forwardRef<
  ElementRef<"div">,
  ComponentPropsWithoutRef<"div"> & { index: number }
>(({ index, className, ...props }, ref) => {
  const { slots } = React.useContext(PrimitiveInputOTPContext);
  const { char, hasFakeCaret, isActive } = slots[index]!;

  return (
    <div
      ref={ref}
      className={slot_cva({ active: isActive, className })}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-bg-black-900 h-11 w-px duration-1000" />
        </div>
      )}
    </div>
  );
});
InputOTPSlot.displayName = "InputOTPSlot";

export { InputOTP, InputOTPSlot };
