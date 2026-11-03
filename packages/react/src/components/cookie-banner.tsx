import {
  ComponentProps,
  ComponentPropsWithoutRef,
  createContext,
  Dispatch,
  ElementType,
  forwardRef,
  ForwardRefExoticComponent,
  Ref,
  RefAttributes,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Presence } from "@radix-ui/react-presence";
import { Slot } from "@radix-ui/react-slot";
import { useControllableState } from "@radix-ui/react-use-controllable-state";
import { cva } from "class-variance-authority";
import { CrossIcon } from "../icons/cross";
import { clx } from "../utils";
import { composeEventHandlers } from "../utils/compose-event-handlers";
import { Button } from "./button";

/*========================================================================================================================*/

// The parts of a banner it finds again to move focus between its views
type Part = "preferences" | "default-action" | "preferences-action" | "trigger";

interface CookieBannerContextValue {
  showPreferences: boolean;
  // Switches views and moves focus into the new one
  togglePreferences: () => void;
  close: () => void;
  // The id of the CookieBannerTitle, which names the banner
  setTitleId: Dispatch<SetStateAction<string | undefined>>;
  // Records `node` as a part of the banner, and returns what forgets it
  registerPart: (node: HTMLElement, part: Part) => () => void;
}

const CookieBannerContext = createContext<CookieBannerContextValue | null>(
  null,
);

// What CookieBannerAction, CookieBannerPreferences and
// CookieBannerPreferencesTrigger read of their banner
type PartContext = Pick<
  CookieBannerContextValue,
  "showPreferences" | "togglePreferences"
>;

// What those parts read outside a banner, where they don't throw: the default
// view, and a CookieBannerPreferencesTrigger that does nothing
const outsideBanner: PartContext = {
  showPreferences: false,
  togglePreferences: () => {},
};

// A part's props: those of the element it renders, and `asChild`, which
// renders its one child in its place
type SlottableProps<T extends ElementType> = ComponentPropsWithoutRef<T> & {
  asChild?: boolean;
};

// Runs before the browser paints, as a layout effect. On the server, where
// CookieBanner renders nothing, it never runs, so React 18 doesn't warn.
const useBeforePaint =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

// False on the server and until the banner has mounted in the browser, as for
// a portal: the banner renders only then, so a `defaultOpen` read from
// browser storage doesn't cause a hydration mismatch
function useMounted() {
  const [mounted, setMounted] = useState(false);
  useBeforePaint(() => setMounted(true), []);
  return mounted;
}

function assignRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") ref(node);
  else if (ref) (ref as { current: T | null }).current = node;
}

// One callback ref that sets both `a` and `b`
function useMergedRef<T>(a: Ref<T> | undefined, b: Ref<T> | undefined) {
  return useCallback(
    (node: T | null) => {
      assignRef(a, node);
      assignRef(b, node);
    },
    [a, b],
  );
}

// A part's banner, and the ref for its element: it sets `ref`, and records
// the element as the banner's `part` as it's attached, before the banner's
// layout effects run
function useBannerPart<T extends HTMLElement>(
  ref: Ref<T> | undefined,
  part: Part,
): { banner: PartContext; ref: (node: T | null) => void } {
  const context = useContext(CookieBannerContext);
  const registerPart = context?.registerPart;
  const forgetRef = useRef<(() => void) | undefined>(undefined);
  const partRef = useCallback(
    (node: HTMLElement | null) => {
      forgetRef.current?.();
      forgetRef.current =
        node && registerPart ? registerPart(node, part) : undefined;
    },
    [registerPart, part],
  );
  return { banner: context ?? outsideBanner, ref: useMergedRef(ref, partRef) };
}

/*========================================================================================================================*/

// What can take focus
const FOCUSABLE = [
  "a[href]",
  "area[href]",
  "button",
  "input:not([type='hidden'])",
  "select",
  "textarea",
  "iframe",
  "summary",
  "audio[controls]",
  "video[controls]",
  "[contenteditable]:not([contenteditable='false'])",
  "[tabindex]",
].join(",");

// Whether Tab can reach `element`
function isTabbable(element: Element): element is HTMLElement {
  return (
    element instanceof HTMLElement &&
    element.tabIndex >= 0 &&
    !element.matches(":disabled") &&
    !element.closest("[inert]") &&
    (typeof element.checkVisibility !== "function" ||
      element.checkVisibility({
        checkVisibilityCSS: true,
        visibilityProperty: true,
      }))
  );
}

// Moves focus to `element` without scrolling the page, and returns whether
// it took focus
function focusWithoutScroll(element: HTMLElement) {
  element.focus({ preventScroll: true });
  return element.ownerDocument.activeElement === element;
}

// Focuses the first of `elements` that Tab can reach and that takes focus,
// and returns whether one did
function focusFirstTabbable(elements: Iterable<Element>) {
  for (const element of elements)
    if (isTabbable(element) && focusWithoutScroll(element)) return true;
  return false;
}

// What can take focus inside each of `roots`, in order
const focusablesIn = (roots: HTMLElement[]) =>
  roots.flatMap((root) => [...root.querySelectorAll(FOCUSABLE)]);

// What can take focus after `node` in DOM order, outside it
function* focusablesAfter(node: HTMLElement) {
  for (const element of node.ownerDocument.querySelectorAll(FOCUSABLE))
    if (
      !node.contains(element) &&
      node.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING
    )
      yield element;
}

const inDocumentOrder = (a: Node, b: Node) =>
  a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;

// Whether the browser has just seen a visitor action, such as a click or a
// key press
const userActivated = () =>
  typeof navigator !== "undefined" && navigator.userActivation?.isActive;

// Returns what puts `element`'s inline `property` back as it is now
function snapshotInline(element: HTMLElement, property: string) {
  const value = element.style.getPropertyValue(property);
  const priority = element.style.getPropertyPriority(property);
  return () => {
    if (value) element.style.setProperty(property, value, priority);
    else element.style.removeProperty(property);
  };
}

// Each document's shown banners, the padding each needs, and what puts the
// page's inline values back as they were before the first was shown
const pagePaddings = new WeakMap<
  Document,
  { needs: Map<HTMLElement, number>; restore: () => void }
>();

// Sets `document`'s page padding to the most any of `needs` asks for
function setPagePadding(document: Document, needs: Map<HTMLElement, number>) {
  const value = `${Math.max(...needs.values())}px`;
  document.documentElement.style.setProperty("scroll-padding-bottom", value);
  document.body.style.setProperty("padding-bottom", value);
}

// Pads `banner`'s page by the most any shown banner needs, `need` pixels for
// this one
function padPage(banner: HTMLElement, need: number) {
  const document = banner.ownerDocument;
  let padding = pagePaddings.get(document);
  if (!padding) {
    const restore = [
      snapshotInline(document.documentElement, "scroll-padding-bottom"),
      snapshotInline(document.body, "padding-bottom"),
    ];
    padding = {
      needs: new Map(),
      restore: () => restore.forEach((put) => put()),
    };
    pagePaddings.set(document, padding);
  }
  padding.needs.set(banner, need);
  setPagePadding(document, padding.needs);
}

// Stops padding `banner`'s page for it. Once no banner is shown, the page's
// inline values go back as they were before the first one was.
function unpadPage(banner: HTMLElement) {
  const document = banner.ownerDocument;
  const padding = pagePaddings.get(document);
  if (!padding?.needs.delete(banner)) return;
  if (padding.needs.size) return setPagePadding(document, padding.needs);
  padding.restore();
  pagePaddings.delete(document);
}

/*========================================================================================================================*/

interface CookieBannerProps extends ComponentPropsWithoutRef<"section"> {
  /**
   * Whether the banner is shown, when you control it. Use with
   * `onOpenChange`.
   */
  open?: boolean;
  /**
   * Whether the banner is shown when it mounts, when you don't control it.
   * @default false
   */
  defaultOpen?: boolean;
  /**
   * Called when the banner opens or closes. Only a CookieBannerClose and the
   * close cross close it: a press or focus outside it doesn't, and neither
   * does Escape.
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Does nothing. CookieBanner is a page region, not a dialog, so it never
   * blocks the page.
   * @deprecated Removed at the next major. Leave it out.
   */
  modal?: boolean;
  /**
   * Accessible name of the close button in the banner's top-right corner.
   * Screen readers announce it; it isn't shown. Set it in your site's
   * language.
   * @default "Close"
   */
  closeLabel?: string;
}

const cookie_content_cva = cva([
  "bg-bg-white p-4.5 shadow-card border-otl-gray-200 fixed bottom-0 right-0 z-30 max-w-[500px]",
  "space-y-1 rounded-lg border transition-all outline-hidden",
  "max-h-dvh overflow-y-auto sm:max-h-[calc(100dvh-1rem)]",
  "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-full data-[state=open]:fade-in data-[state=open]:duration-400",
  "data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom-full data-[state=closed]:fade-out data-[state=closed]:duration-200",
  "sm:mb-4 sm:mr-4 sm:p-6",
]);

/**
 * The page's cookie banner: a `<section>` named by its CookieBannerTitle.
 * Render it first in `<body>`, before SkipLink. It doesn't block the page,
 * and stays until the visitor uses one of its close controls.
 */
const CookieBanner: ForwardRefExoticComponent<
  CookieBannerProps & RefAttributes<HTMLElement>
> = forwardRef(
  (
    {
      open: openProp,
      defaultOpen,
      onOpenChange,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- deprecated; taken out so it doesn't reach the section
      modal,
      closeLabel = "Close",
      className,
      children,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      ...props
    },
    forwardedRef,
  ) => {
    const [open, setOpen] = useControllableState({
      prop: openProp,
      defaultProp: defaultOpen ?? false,
      onChange: onOpenChange,
      caller: "CookieBanner",
    });
    const mounted = useMounted();
    const [showPreferences, setShowPreferences] = useState(false);
    const [titleId, setTitleId] = useState<string | undefined>();

    // Every opening starts in the default view
    const [lastOpen, setLastOpen] = useState(open);
    if (open !== lastOpen) {
      setLastOpen(open);
      if (open) setShowPreferences(false);
    }

    const [node, setNode] = useState<HTMLElement | null>(null);
    const nodeRef = useRef<HTMLElement | null>(null);
    const ownRef = useCallback((element: HTMLElement | null) => {
      nodeRef.current = element;
      setNode(element);
    }, []);
    const sectionRef = useMergedRef(forwardedRef, ownRef);

    const partsRef = useRef(new Map<HTMLElement, Part>());
    const registerPart = useCallback((element: HTMLElement, part: Part) => {
      partsRef.current.set(element, part);
      return () => {
        if (partsRef.current.get(element) === part)
          partsRef.current.delete(element);
      };
    }, []);
    // The parts recorded as `part`, in DOM order
    const partsOf = (part: Part) =>
      [...partsRef.current]
        .filter(
          ([element, recorded]) => recorded === part && element.isConnected,
        )
        .map(([element]) => element)
        .sort(inDocumentOrder);

    const close = useCallback(() => setOpen(false), [setOpen]);
    const viewFocusRef = useRef(false);
    const togglePreferences = useCallback(() => {
      viewFocusRef.current = true;
      setShowPreferences((shown) => !shown);
    }, []);

    // Opening right after a visitor action moves focus to the banner, and
    // remembers what had it. Closing with focus inside moves it out: back to
    // what had it, else to what follows the banner, else to `<body>`.
    const wasOpenRef = useRef(false);
    const focusOnShowRef = useRef(false);
    const returnFocusRef = useRef<HTMLElement | null>(null);
    useBeforePaint(() => {
      const wasOpen = wasOpenRef.current;
      wasOpenRef.current = open;
      if (open && !wasOpen) {
        const activated = userActivated() === true;
        const active = document.activeElement;
        focusOnShowRef.current = activated;
        returnFocusRef.current =
          activated && active instanceof HTMLElement && active !== document.body
            ? active
            : null;
      } else if (!open && wasOpen) {
        focusOnShowRef.current = false;
        const section = nodeRef.current;
        const active = document.activeElement;
        const remembered = returnFocusRef.current;
        returnFocusRef.current = null;
        if (
          section &&
          active instanceof HTMLElement &&
          section.contains(active)
        ) {
          const returned =
            remembered?.isConnected &&
            !section.contains(remembered) &&
            focusWithoutScroll(remembered);
          if (!returned && !focusFirstTabbable(focusablesAfter(section)))
            active.blur();
        }
      }
    }, [open]);
    // The section mounts after `open` turns true, so it takes focus here
    useBeforePaint(() => {
      if (open && node && focusOnShowRef.current) {
        focusOnShowRef.current = false;
        focusWithoutScroll(node);
      }
    }, [open, node]);

    // A CookieBannerPreferencesTrigger moves focus into the view it shows:
    // the Customise view's first preference, else its first action; the
    // default view's trigger
    useBeforePaint(() => {
      if (!viewFocusRef.current) return;
      viewFocusRef.current = false;
      const moved = showPreferences
        ? focusFirstTabbable(focusablesIn(partsOf("preferences"))) ||
          focusFirstTabbable(focusablesIn(partsOf("preferences-action")))
        : focusFirstTabbable(
            partsOf("trigger").filter((trigger) =>
              partsOf("default-action").some((action) =>
                action.contains(trigger),
              ),
            ),
          ) || focusFirstTabbable(focusablesIn(partsOf("default-action")));
      if (!moved && nodeRef.current) focusWithoutScroll(nodeRef.current);
    }, [showPreferences]);

    // While the banner is shown, the page's scroll area is padded by its
    // height and bottom offset, so a focused control scrolls into view above
    // it (WCAG 2.2 SC 2.4.11)
    useBeforePaint(() => {
      if (!open || !node) return;
      const view = node.ownerDocument.defaultView ?? window;
      const pad = () => {
        const style = view.getComputedStyle(node);
        const offset =
          (parseFloat(style.bottom) || 0) +
          (parseFloat(style.marginBottom) || 0);
        padPage(node, Math.ceil(node.getBoundingClientRect().height + offset));
      };
      pad();
      const observer =
        typeof ResizeObserver === "undefined"
          ? undefined
          : new ResizeObserver(pad);
      observer?.observe(node);
      view.addEventListener("resize", pad);
      return () => {
        observer?.disconnect();
        view.removeEventListener("resize", pad);
        unpadPage(node);
      };
    }, [open, node]);

    const context = useMemo(
      () => ({
        showPreferences,
        togglePreferences,
        close,
        setTitleId,
        registerPart,
      }),
      [showPreferences, togglePreferences, close, registerPart],
    );

    if (!mounted) return null;

    return (
      <CookieBannerContext.Provider value={context}>
        <Presence present={open}>
          <section
            tabIndex={-1}
            aria-label={ariaLabel}
            aria-labelledby={
              ariaLabelledBy ?? (ariaLabel ? undefined : titleId)
            }
            {...props}
            ref={sectionRef}
            data-state={open ? "open" : "closed"}
            className={clx(cookie_content_cva(), className)}
          >
            <button
              type="button"
              className="ring-fr-primary absolute top-0 right-0 mt-4 mr-4 rounded-md p-1.5 outline-hidden transition-all focus:ring-3"
              aria-label={closeLabel}
              onClick={close}
            >
              <CrossIcon className="size-4 shrink-0" />
            </button>
            {children}
          </section>
        </Presence>
      </CookieBannerContext.Provider>
    );
  },
);

/*========================================================================================================================*/

const cookie_action_cva = cva(
  ["w-full flex-col justify-start gap-[0.5rem] p-0 pt-3 sm:flex-row"],
  {
    variants: {
      showPreferences: {
        true: "flex",
        false: "hidden",
      },
    },
    defaultVariants: {
      showPreferences: false,
    },
  },
);

/** The banner's heading, an `<h2>`. Its id names the banner. */
const CookieBannerTitle: ForwardRefExoticComponent<
  SlottableProps<"h2"> & RefAttributes<HTMLHeadingElement>
> = forwardRef(({ className, asChild = false, id, ...props }, ref) => {
  const context = useContext(CookieBannerContext);
  const generatedId = useId();
  const titleId = id ?? generatedId;
  const setTitleId = context?.setTitleId;
  useBeforePaint(() => {
    if (!setTitleId) return;
    setTitleId(titleId);
    return () =>
      setTitleId((current) => (current === titleId ? undefined : current));
  }, [setTitleId, titleId]);

  if (!context)
    throw new Error("CookieBannerTitle must be used within CookieBanner");

  const Comp = asChild ? Slot : "h2";
  return (
    <Comp
      ref={ref}
      id={titleId}
      className={clx(
        "text-body-md font-body text-txt-black-900 font-semibold",
        className,
      )}
      {...props}
    />
  );
});

/** The banner's text, a `<p>`, read in reading order. */
const CookieBannerDescription: ForwardRefExoticComponent<
  SlottableProps<"p"> & RefAttributes<HTMLParagraphElement>
> = forwardRef(({ className, asChild = false, ...props }, ref) => {
  const context = useContext(CookieBannerContext);
  if (!context)
    throw new Error("CookieBannerDescription must be used within CookieBanner");

  const Comp = asChild ? Slot : "p";
  return (
    <Comp
      ref={ref}
      className={clx(
        "text-body-sm font-body text-txt-black-900 font-normal",
        className,
      )}
      {...props}
    />
  );
});

/**
 * A row of the banner's controls. It shows in the default view, or with
 * `preferences` in the Customise view.
 */
const CookieBannerAction: ForwardRefExoticComponent<
  ComponentProps<"div"> & { preferences?: boolean }
> = forwardRef(({ className, preferences = false, ...props }, ref) => {
  const {
    banner: { showPreferences },
    ref: actionRef,
  } = useBannerPart(ref, preferences ? "preferences-action" : "default-action");

  return (
    <div
      ref={actionRef}
      className={clx(
        cookie_action_cva({
          showPreferences: showPreferences === preferences,
        }),
        className,
      )}
      {...props}
    />
  );
});

/** The Customise view's preferences, a `<div>`. It renders only in that view. */
const CookieBannerPreferences: ForwardRefExoticComponent<
  SlottableProps<"div"> & RefAttributes<HTMLDivElement>
> = forwardRef(({ className, asChild = false, ...props }, ref) => {
  const {
    banner: { showPreferences },
    ref: preferencesRef,
  } = useBannerPart(ref, "preferences");

  if (!showPreferences) return null;

  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      ref={preferencesRef}
      className={clx("flex flex-col gap-2 px-0 py-3", className)}
      {...props}
    />
  );
});

/**
 * Switches between the default view and the Customise view, and moves focus
 * into the view it shows. Its `onClick` runs first; calling
 * `preventDefault()` there keeps the view.
 */
const CookieBannerPreferencesTrigger: ForwardRefExoticComponent<
  ComponentProps<typeof Button>
> = forwardRef(
  ({ children, className, asChild = false, onClick, ...props }, ref) => {
    const {
      banner: { togglePreferences },
      ref: triggerRef,
    } = useBannerPart(ref, "trigger");

    const Comp = asChild ? Slot : Button;
    return (
      <Comp
        variant="primary-outline"
        size="medium"
        className={clx("w-full justify-center sm:w-auto", className)}
        {...props}
        ref={triggerRef}
        onClick={composeEventHandlers(onClick, togglePreferences)}
      >
        {children}
      </Comp>
    );
  },
);

/**
 * Closes the banner: Accept, Reject or Save. Its `onClick` runs first;
 * calling `preventDefault()` there keeps the banner open.
 */
const CookieBannerClose: ForwardRefExoticComponent<
  SlottableProps<"button"> & RefAttributes<HTMLButtonElement>
> = forwardRef(({ asChild = false, onClick, ...props }, ref) => {
  const context = useContext(CookieBannerContext);
  if (!context)
    throw new Error("CookieBannerClose must be used within CookieBanner");

  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      type="button"
      {...props}
      ref={ref}
      onClick={composeEventHandlers(onClick, context.close)}
    />
  );
});

CookieBanner.displayName = "CookieBanner";
CookieBannerAction.displayName = "CookieBannerAction";
CookieBannerDescription.displayName = "CookieBannerDescription";
CookieBannerClose.displayName = "CookieBannerClose";
CookieBannerPreferences.displayName = "CookieBannerPreferences";
CookieBannerTitle.displayName = "CookieBannerTitle";
CookieBannerPreferencesTrigger.displayName = "CookieBannerPreferencesTrigger";

export {
  CookieBanner,
  CookieBannerTitle,
  CookieBannerDescription,
  CookieBannerClose,
  CookieBannerPreferences,
  CookieBannerAction,
  CookieBannerPreferencesTrigger,
};
