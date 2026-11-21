import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { clx } from "../utils";
import { cva, VariantProps } from "class-variance-authority";
import { FunctionComponent, ReactNode, useEffect } from "react";
import { CheckCircleIcon } from "../icons/check-circle";
import { InfoIcon } from "../icons/info";
import { WarningCircleIcon } from "../icons/warning-circle";
import { WarningIcon } from "../icons/warning";
import { CrossIcon } from "../icons/cross";
import { useToast } from "../hooks";
import { sharedContext } from "../utils/registry";

/*========================================================================================================================*/

export type ToastEvent = {
  variant:
    | "success"
    | "message"
    | "info"
    | "warning"
    | "error"
    | null
    | undefined;
  title: ReactNode;
  description?: ReactNode;
  /**
   * How urgently screen readers announce the toast: `"foreground"`
   * interrupts what they're reading, and `"background"` waits for a pause.
   * It isn't the design guideline's Type, which is `variant`.
   *
   * An `error` toast defaults to `"foreground"`, and every other Variant to
   * `"background"`. It wins over a `type` passed to AutoToast.
   */
  type?: "foreground" | "background" | undefined;
};

/*========================================================================================================================*/

const ToastProvider = ToastPrimitives.Provider;

const ToastContext = sharedContext<{
  variant: ToastEvent["variant"];
  isHover: boolean;
  duration: number;
}>("ToastContext", {
  variant: "message",
  isHover: false,
  duration: 5000,
});

/*========================================================================================================================*/

type ToastViewportProps = React.ComponentPropsWithoutRef<
  typeof ToastPrimitives.Viewport
>;

const toast_viewport_cva = cva([
  "fixed flex max-h-screen w-full overflow-hidden flex-col-reverse gap-1",
  "p-4.5 sm:p-6 bottom-0 right-0 sm:top-auto sm:flex-col md:max-w-sm z-[99]",
  // F8 focuses the viewport. It sits in the window's corner, so its ring is
  // inset, inside the padding that keeps it clear of the toasts.
  "focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-fr-primary",
]);

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  ToastViewportProps
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={clx(toast_viewport_cva({ className }))}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

/*========================================================================================================================*/

interface ToastRootProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>,
    VariantProps<typeof toast_cva> {
  variant: "message" | "success" | "info" | "warning" | "error";
  /**
   * How urgently screen readers announce the toast: `"foreground"`
   * interrupts what they're reading, and `"background"` waits for a pause.
   * It isn't the design guideline's Type, which is `variant`.
   *
   * An `error` toast defaults to `"foreground"`, and every other Variant to
   * `"background"`, unlike Radix, whose default is `"foreground"` for every
   * toast. A `type` of `undefined` gets the Variant's default.
   */
  type?: "foreground" | "background" | undefined;
}

const toast_cva = cva([
  "group pointer-events-auto relative bg-bg-dialog-active z-[99] p-3 flex w-full items-start gap-2",
  "focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-fr-primary",
  "overflow-hidden rounded-md border shadow-card border-bg-washed-active transition-all data-[swipe=cancel]:translate-x-0 ",
  "data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
  "data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out",
  "data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full",
  "data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
]);

const ToastRoot = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  ToastRootProps
>(
  (
    {
      className,
      variant = "message",
      duration = 5000,
      type = variant === "error" ? "foreground" : "background",
      ...props
    },
    ref,
  ) => {
    const [isHover, setIsHover] = React.useState(false);
    return (
      <ToastContext.Provider value={{ variant, isHover, duration }}>
        <ToastPrimitives.Root
          ref={ref}
          className={toast_cva({ className })}
          onPause={() => setIsHover(true)}
          onResume={() => setIsHover(false)}
          duration={duration}
          type={type}
          {...props}
        />
      </ToastContext.Provider>
    );
  },
);
ToastRoot.displayName = ToastPrimitives.Root.displayName;

/*========================================================================================================================*/

// interface ToastActionProps
//   extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action> {}

// const toast_action_cva = cva([
//   "hover:bg-secondary focus:ring-ring group-[.destructive]:border-muted/40",
//   "group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive",
//   "group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
//   "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3",
//   "text-body-sm font-medium transition-colors focus:outline-none focus:ring-1",
//   "disabled:pointer-events-none disabled:opacity-50",
// ]);

// const ToastAction = React.forwardRef<
//   React.ElementRef<typeof ToastPrimitives.Action>,
//   ToastActionProps
// >(({ className, ...props }, ref) => (
//   <ToastPrimitives.Action
//     ref={ref}
//     className={clx(toast_action_cva({ className }))}
//     {...props}
//   />
// ));
// ToastAction.displayName = ToastPrimitives.Action.displayName;
// type ToastActionElement = React.ReactElement<typeof ToastAction>;

/*========================================================================================================================*/

const toast_close_cva = cva([
  "text-txt-black-500 hover:text-txt-black-700 absolute right-1 top-1 rounded-md p-1",
  "focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-fr-primary",
]);
/**
 * The toast's icon-only close button. Screen readers announce it as "Close";
 * pass an `aria-label` to name it in your site's language.
 */
const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={clx(toast_close_cva({ className }))}
    toast-close=""
    aria-label="Close"
    {...props}
  >
    <CrossIcon className="size-5 shrink-0" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

/*========================================================================================================================*/

const toast_title_cva = cva(["text-body-sm font-semibold"], {
  variants: {
    variant: {
      success: "text-txt-success",
      message: "text-txt-black-700",
      info: "text-txt-primary",
      warning: "text-txt-warning",
      error: "text-txt-danger",
    },
  },
});

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => {
  const { variant } = React.useContext(ToastContext);
  return (
    <ToastPrimitives.Title
      ref={ref}
      className={clx(toast_title_cva({ variant, className }))}
      {...props}
    />
  );
});
ToastTitle.displayName = ToastPrimitives.Title.displayName;

/*========================================================================================================================*/

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => {
  return (
    <ToastPrimitives.Description
      ref={ref}
      className={clx("text-txt-black-700 text-body-sm", className)}
      {...props}
    />
  );
});
ToastDescription.displayName = ToastPrimitives.Description.displayName;

/*========================================================================================================================*/

const toast_icon_cva = cva("size-5 shrink-0", {
  variants: {
    variant: {
      success: "text-txt-success",
      info: "text-txt-primary",
      warning: "text-txt-warning",
      error: "text-txt-danger",
      message: "text-txt-black-700",
    },
  },
});

// The props of ToastIcon and ToastProgress: a `<div>`'s, without
// `children`, as each draws its own content
type ToastPartProps = Omit<React.ComponentPropsWithoutRef<"div">, "children">;

/**
 * The toast's 20px status icon, in the variant's colour: a tick for
 * `success`, an "i" for `info`, an exclamation mark in a circle for `warning`
 * and in a triangle for `error`. It draws no icon for `message`.
 *
 * Render it inside a `ToastRoot`, which gives it its variant. Outside one it
 * renders nothing.
 *
 * It is hidden from assistive technology (`aria-hidden="true"`), because the
 * toast's title carries its meaning. A `className` goes on its wrapper, which
 * its ref gets.
 */
const ToastIcon = React.forwardRef<HTMLDivElement, ToastPartProps>(
  ({ className, ...props }, ref) => {
    const { variant } = React.useContext(ToastContext);

    if (!variant || variant === "message") return null;

    const iconClassName = toast_icon_cva({ variant });
    return (
      <div
        aria-hidden="true"
        {...props}
        ref={ref}
        // No `class` attribute without a `className`, as AutoToast's icon
        // wrapper always had
        className={clx(className) || undefined}
      >
        {
          {
            success: <CheckCircleIcon className={iconClassName} />,
            info: <InfoIcon className={iconClassName} />,
            warning: <WarningCircleIcon className={iconClassName} />,
            error: <WarningIcon className={iconClassName} />,
          }[variant]
        }
      </div>
    );
  },
);
ToastIcon.displayName = "ToastIcon";

/*========================================================================================================================*/

const toast_progress_cva = cva("w-full h-1", {
  variants: {
    variant: {
      success: "bg-txt-success",
      info: "bg-txt-primary",
      warning: "bg-txt-warning",
      error: "bg-txt-danger",
      message: "bg-bg-washed",
    },
  },
});

/**
 * The toast's 4px countdown bar, along its bottom edge. It is filled in the
 * variant's colour, or `bg-washed` for `message`, and shrinks to nothing over
 * the toast's `duration`, pausing while the pointer is over the toast.
 *
 * Render it inside a `ToastRoot`, which gives it its variant and its duration
 * (default 5000ms). Outside one it draws the `message` bar over 5000ms.
 *
 * It is hidden from assistive technology (`aria-hidden="true"`), because the
 * toast's title carries its meaning. A `className` adds to the classes that
 * place and animate the bar, and a conflicting utility, such as `bottom-1`,
 * replaces only the one it conflicts with. A `style` adds to the bar's
 * `animationDuration`, which it can also set.
 */
const ToastProgress = React.forwardRef<HTMLDivElement, ToastPartProps>(
  ({ className, style, ...props }, ref) => {
    const { variant, duration } = React.useContext(ToastContext);

    return (
      <div
        aria-hidden="true"
        {...props}
        ref={ref}
        className={clx(
          "animate-expire group-hover:paused absolute bottom-0 left-0 w-full group-hover:transition-none",
          className,
        )}
        style={{ animationDuration: `${duration}ms`, ...style }}
      >
        <div className={toast_progress_cva({ variant })} />
      </div>
    );
  },
);
ToastProgress.displayName = "ToastProgress";

/*========================================================================================================================*/

interface AutoToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> {
  /**
   * Accessible name of each toast's close button. Screen readers announce
   * it; it isn't shown. Set it in your site's language.
   * @default "Close"
   */
  closeLabel?: string;
  /**
   * Accessible name of the region that holds the toasts. Screen readers
   * announce it; it isn't shown. `{hotkey}` is replaced with the key that
   * focuses the region, F8. Set it in your site's language.
   * @default "Notifications ({hotkey})"
   */
  viewportLabel?: string;
  /**
   * What screen readers announce before each toast's text, as in
   * "Notification Saved". It isn't shown. Set it in your site's language.
   * Don't pass an empty one: Radix logs an error if it's empty or only
   * whitespace.
   * @default "Notification"
   */
  announceLabel?: string;
  /**
   * How urgently screen readers announce each toast: `"foreground"`
   * interrupts what they're reading, and `"background"` waits for a pause.
   * It isn't the design guideline's Type, which is `variant`.
   *
   * It sets every toast's `type`, but a toast's own `type`, passed to
   * `toast()`, wins. Without either, an `error` toast defaults to
   * `"foreground"`, and every other Variant to `"background"`.
   */
  type?: "foreground" | "background" | undefined;
}

const AutoToast: FunctionComponent<AutoToastProps> = ({
  closeLabel = "Close",
  viewportLabel = "Notifications ({hotkey})",
  announceLabel = "Notification",
  type,
  ...props
}) => {
  const { toasts, subscribe, unsubscribe } = useToast();

  useEffect(() => {
    subscribe();
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <ToastProvider label={announceLabel}>
      {toasts.map((toast, index) => (
        <ToastRoot
          key={props.id || index}
          variant={toast.variant || "message"}
          // AutoToast's other props apply to every toast, over what it sets
          // for each. `type` is the one where a toast's own value wins: it
          // sets how urgently that toast is announced. With neither,
          // ToastRoot picks it by Variant (ADR-0014).
          type={toast.type ?? type}
          {...props}
        >
          <ToastIcon />
          <div className="space-y-1">
            <ToastTitle>{toast.title}</ToastTitle>
            {toast.description && (
              <ToastDescription>{toast.description}</ToastDescription>
            )}
          </div>
          <ToastClose aria-label={closeLabel} />
          <ToastProgress />
        </ToastRoot>
      ))}

      <ToastViewport label={viewportLabel} />
    </ToastProvider>
  );
};

export {
  ToastProvider,
  ToastViewport,
  ToastRoot,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastIcon,
  ToastProgress,
  AutoToast,
};
