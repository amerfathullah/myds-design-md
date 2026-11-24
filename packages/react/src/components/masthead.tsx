import {
  ComponentProps,
  forwardRef,
  ForwardRefExoticComponent,
  ReactNode,
  MouseEvent,
} from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@radix-ui/react-collapsible";
import { ChevronDownIcon } from "../icons/chevron-down";
import { MalaysiaFlag } from "../national-marks/malaysia-flag";
import { clx } from "../utils";
import { Slot } from "@radix-ui/react-slot";

/**
 * Its ref is the `<div id="masthead">`, which gets the props, not the
 * collapsible around it.
 */
const Masthead: ForwardRefExoticComponent<ComponentProps<"div">> = forwardRef(
  ({ children, className, ...props }, ref) => {
    // useEffect(() => {
    //   const handleKeyDown = (event: KeyboardEvent) => {
    //     const details = document.getElementById(
    //       "masthead",
    //     ) as HTMLDetailsElement | null;

    //     if (
    //       event.altKey &&
    //       (event.metaKey || event.ctrlKey) &&
    //       event.key === "Enter"
    //     ) {
    //       event.preventDefault();
    //       if (details) {
    //         details.open = !details.open;
    //       }
    //     }

    //     if ((event.metaKey || event.ctrlKey) && event.key === "k") {
    //       event.preventDefault();
    //     }
    //   };

    //   document.addEventListener("keydown", handleKeyDown);
    //   return () => document.removeEventListener("keydown", handleKeyDown);
    // }, []);

    return (
      <Collapsible>
        <div
          ref={ref}
          id="masthead"
          className={clx("bg-bg-washed print:hidden", className)}
          data-nosnippet
          {...props}
        >
          <div className="mx-auto grid w-full max-w-screen-xl transition-[grid-template-rows] duration-500 print:hidden">
            {children}
          </div>
        </div>
      </Collapsible>
    );
  },
);

Masthead.displayName = "Masthead";

const MastheadHeader: ForwardRefExoticComponent<ComponentProps<"div">> =
  forwardRef(({ children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className="px-4.5 flex items-center gap-2 overflow-x-hidden py-2 sm:py-1 md:px-6"
        {...props}
      >
        <MalaysiaFlag className="inline-block aspect-auto w-fit shrink-0" />
        <div className="text-txt-black-700 text-body-sm flex w-full items-center justify-between truncate sm:justify-start">
          {children}
        </div>
      </div>
    );
  });

MastheadHeader.displayName = "MastheadHeader";

const MastheadTitle: ForwardRefExoticComponent<ComponentProps<"p">> =
  forwardRef(({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={clx(
          "text-txt-black-700 text-body-sm truncate sm:max-w-full sm:flex-grow-0",
          className,
        )}
        {...props}
      />
    );
  });

MastheadTitle.displayName = "MastheadTitle";

const MastheadTrigger: ForwardRefExoticComponent<ComponentProps<"button">> =
  forwardRef(({ children, onClick, ...props }, ref) => {
    const handleToggle = (event: MouseEvent<HTMLButtonElement>) => {
      if (onClick) onClick(event);
    };

    return (
      <CollapsibleTrigger
        ref={ref}
        className="text-txt-primary focus:ring-fr-primary bg-otl-gray-200 group flex items-center gap-0.5 rounded-md p-1 px-1 focus:outline-hidden focus:ring-3 focus:ring-inset sm:bg-transparent sm:pl-1.5 xl:rounded-sm"
        // Children name the button. With none, it shows only the chevron.
        aria-label={children ? undefined : "Toggle masthead"}
        tabIndex={0}
        onClick={handleToggle}
        {...props}
      >
        {/* Below `sm:` the text is visually hidden, but it still names the
          button, which shows only its chevron */}
        <span className="text-txt-primary tracking-[-0.01em] select-none max-sm:sr-only">
          {children}
        </span>
        <ChevronDownIcon className="size-4 transform transition-transform group-data-[state=closed]:rotate-0 group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
    );
  });

MastheadTrigger.displayName = "MastheadTrigger";

const MastheadContent: ForwardRefExoticComponent<
  ComponentProps<typeof CollapsibleContent>
> = forwardRef(({ children, className, ...props }, ref) => {
  return (
    <CollapsibleContent
      ref={ref}
      className={clx(
        "data-[state=open]:animate-collapsible-slide-down data-[state=closed]:animate-collapsible-slide-up overflow-hidden",
        "motion-reduce:animate-none",
        className,
      )}
      {...props}
    >
      <div className="px-4.5 gap-4.5 flex flex-col pb-6 pt-3 sm:grid-cols-2 sm:flex-row sm:pb-8 sm:pt-6 md:px-6">
        {children}
      </div>
    </CollapsibleContent>
  );
});

MastheadContent.displayName = "MastheadContent";

interface MastheadSectionProps extends ComponentProps<"div"> {
  icon: ReactNode;
  title: string;
}

const MastheadSection: ForwardRefExoticComponent<MastheadSectionProps> =
  forwardRef(({ icon, children, title, className, ...props }, ref) => {
    return (
      <div ref={ref} className={clx("flex w-full gap-3", className)} {...props}>
        <Slot className="text-txt-black-500 size-6 shrink-0">{icon}</Slot>
        <div className="space-y-1.5">
          <p className="text-txt-black-900 text-body-sm sm:text-body-md font-medium">
            {title}
          </p>
          <p className="text-txt-black-700 text-body-sm max-w-[50ch] text-balance">
            {children}
          </p>
        </div>
      </div>
    );
  });

MastheadSection.displayName = "MastheadSection";

// Exports
export {
  Masthead,
  MastheadHeader,
  MastheadTitle,
  MastheadTrigger,
  MastheadContent,
  MastheadSection,
};
