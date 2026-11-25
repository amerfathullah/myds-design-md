import {
  forwardRef,
  ForwardRefExoticComponent,
  FunctionComponent,
  useState,
  useContext,
  ReactNode,
  ComponentProps,
  useRef,
  useId,
  useEffect,
  useLayoutEffect,
  useCallback,
  RefObject,
  Ref,
  KeyboardEvent,
  MouseEvent,
  Dispatch,
  SetStateAction,
} from "react";
import { clx } from "../utils";
import { composeEventHandlers } from "../utils/compose-event-handlers";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@radix-ui/react-navigation-menu";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverPortal,
} from "@radix-ui/react-popover";
import { Button } from "./button";
import { Link } from "./link";
import { ChevronDownIcon, CrossIcon, HamburgerMenuIcon } from "../icons";
import { cva } from "class-variance-authority";
import { RemoveScroll } from "react-remove-scroll";
import { Root } from "@radix-ui/react-slot";
import { sharedContext } from "../utils/registry";

type NavbarProps = ComponentProps<"header">;

interface NavbarContextProps {
  // The `<header>`'s id, the author's or a generated one, which the mobile
  // menu finds the header by
  id: string;
  show: boolean;
  setShow: (value: boolean) => void;
  // The fields below are optional, and each reader works without them: a
  // copy of the library from before them provides the context without them
  // (CONTRIBUTING.md, Contexts).
  // NavbarAction's toggle, which the mobile menu returns focus to and keeps
  // in its Tab order
  toggleRef?: RefObject<HTMLButtonElement | null>;
  // The mobile menu's panel while it's rendered, which the toggle controls
  panel?: HTMLElement | null;
  setPanel?: (panel: HTMLElement | null) => void;
  // The panel's `aria-labelledby`, which NavbarAction's toggle gives, so the
  // panel is named as the toggle is: the toggle's own id, or the ids in the
  // toggle's `aria-labelledby`
  panelLabelledBy?: string;
  setPanelLabelledBy?: Dispatch<SetStateAction<string | undefined>>;
}
const NavbarContext = sharedContext<NavbarContextProps>("NavbarContext", {
  id: "",
  show: false,
  setShow: () => {},
});

// The menu toggle's default name, which the mobile menu's panel falls back to
const menuLabel = "Menu";

// Layout effects don't run on the server, and React 18 warns there, so the
// server gets useEffect. In the browser, the panel's name follows the toggle's
// before the page paints.
const useBeforePaint =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

// Whether Tab can reach `element`: it's in the tab order, enabled and shown.
// `tabIndex` is its own, unless the caller passes another (`menuTabIndex`).
// Inside `within`, an element under `aria-hidden` doesn't count either, such
// as an open dropdown's focus proxy.
function isTabbable(
  element: Element,
  within?: HTMLElement,
  tabIndex = element instanceof HTMLElement ? element.tabIndex : -1,
): element is HTMLElement {
  const hidden = within ? element.closest('[aria-hidden="true"]') : null;
  return (
    element instanceof HTMLElement &&
    tabIndex >= 0 &&
    !element.matches(":disabled") &&
    !element.closest("[inert]") &&
    !(hidden && within?.contains(hidden)) &&
    (typeof element.checkVisibility !== "function" ||
      element.checkVisibility({
        checkVisibilityCSS: true,
        visibilityProperty: true,
      }))
  );
}

// An element's tab index in the mobile menu. While focus is outside an open
// dropdown's links, NavigationMenuContent sets them to tabindex="-1" and
// keeps what they had in `data-tabindex`: empty when they had none, as a link
// has none. They're still the menu's.
function menuTabIndex(element: HTMLElement) {
  const kept = element.dataset.tabindex;
  if (element.getAttribute("tabindex") !== "-1" || kept === undefined)
    return element.tabIndex;
  return kept === "" ? 0 : Number(kept);
}

// What Tab reaches in the mobile menu's `panel`, in DOM order
const menuTabbables = (panel: HTMLElement) =>
  [...panel.querySelectorAll<HTMLElement>("*")].filter((element) =>
    isTabbable(element, panel, menuTabIndex(element)),
  );

// The first or, with `last`, the last of what Tab reaches in `panel`
function menuEdge(panel: HTMLElement, last: boolean) {
  const tabbables = menuTabbables(panel);
  return tabbables[last ? tabbables.length - 1 : 0];
}

// Where Tab, or Shift+Tab when `back`, moves from `from` in the mobile
// menu's `panel`: to the next of its tabbables in DOM order; past its last,
// or before its first, to the toggle; and with no toggle to reach, around
// to its other end
function menuStop(
  panel: HTMLElement,
  from: Element,
  back: boolean,
  toggle: HTMLElement | null | undefined,
) {
  const side = back
    ? Node.DOCUMENT_POSITION_PRECEDING
    : Node.DOCUMENT_POSITION_FOLLOWING;
  const onward = menuTabbables(panel).filter(
    (element) =>
      element !== from && from.compareDocumentPosition(element) & side,
  );
  const next = onward[back ? onward.length - 1 : 0];
  if (next) return next;
  if (toggle && toggle.isConnected && isTabbable(toggle)) return toggle;
  return menuEdge(panel, back);
}

function assignRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") ref(node);
  else if (ref) (ref as { current: T | null }).current = node;
}

const Navbar: ForwardRefExoticComponent<NavbarProps> = forwardRef(
  ({ children, className, id: givenId, ...props }, ref) => {
    // The header's id, which the mobile menu finds the header by: the
    // author's, unless it's empty, else a generated one. An author's id used
    // to replace the generated one on the header, so the menu found no
    // header to open below (#216). `||`, not `??`, as an empty id finds no
    // element. useId runs on every render, so adding or removing an id
    // doesn't change the order of hooks.
    const generatedId = useId();
    const id = givenId || generatedId;

    const [show, setShow] = useState(false);
    const toggleRef = useRef<HTMLButtonElement | null>(null);
    const [panel, setPanel] = useState<HTMLElement | null>(null);
    const [panelLabelledBy, setPanelLabelledBy] = useState<string>();
    return (
      <NavbarContext.Provider
        value={{
          id,
          show,
          setShow,
          toggleRef,
          panel,
          setPanel,
          panelLabelledBy,
          setPanelLabelledBy,
        }}
      >
        <header
          ref={ref}
          id={id}
          className={clx(
            "bg-bg-white border-otl-gray-200 shadow-button sticky top-0 z-50 h-16 w-full border-b max-md:h-14 print:hidden",
            className,
          )}
          data-nosnippet
          {...props}
        >
          <div className="px-4.5 relative mx-auto flex h-16 max-w-screen-xl items-center justify-between gap-4 max-md:h-14 md:px-6">
            {children}
          </div>
        </header>
      </NavbarContext.Provider>
    );
  },
);

Navbar.displayName = "Navbar";

interface NavbarLogoProps extends ComponentProps<typeof Link> {
  src: string;
  alt: string;
  maxChars?: number;
}

const logo_cva = cva(
  ["font-semibold max-w-[200px] font-heading text-txt-black-900"],
  {
    variants: {
      too_long: {
        false: "text-body-lg",
        true: "text-body-xs leading-[14px] line-clamp-2",
      },
    },
    defaultVariants: {
      too_long: false,
    },
  },
);
const NavbarLogo: ForwardRefExoticComponent<NavbarLogoProps> = forwardRef(
  (
    { src, alt, href = "/", children, maxChars = 19, className, ...props },
    ref,
  ) => {
    return (
      // The header centres the link rather than the link filling the header's
      // height, so the link's focus ring isn't cut off at the window's top
      <Link
        ref={ref}
        href={href}
        underline="none"
        className={clx("flex w-auto items-center gap-2.5", className)}
        {...props}
      >
        <img
          src={src}
          width={40}
          height={32}
          className="aspect-auto h-full max-h-8 w-auto select-none"
          alt={alt}
        />
        {typeof children === "string" ? (
          <span className={logo_cva({ too_long: children.length > maxChars })}>
            {children}
          </span>
        ) : (
          children
        )}
      </Link>
    );
  },
);

NavbarLogo.displayName = "NavbarLogo";
interface NavigationMenuProps {
  children: ReactNode;
  classNameNavDesktop?: string;
  classNameNavMobile?: string;
  /**
   * Accessible name of the menu's `<nav>` landmark. Screen readers announce
   * it; it isn't shown. Set it in your site's language.
   * @default "Main"
   */
  "aria-label"?: string;
  /**
   * The id of an element whose text names the menu's `<nav>` landmark, in
   * place of `aria-label`.
   */
  "aria-labelledby"?: string;
}

const NavbarMenu: FunctionComponent<NavigationMenuProps> = ({
  children,
  classNameNavDesktop,
  classNameNavMobile,
  "aria-label": ariaLabel = "Main",
  "aria-labelledby": ariaLabelledBy,
}) => {
  // The children render once: in the desktop list while the mobile menu is
  // closed, and in the mobile menu while it's open. So an author's id is on
  // one element, and a ref holds the element that's mounted (#214). The list
  // itself stays mounted: Radix finds the menu's dropdown triggers through
  // it, so that a press on an open dropdown's trigger closes the dropdown,
  // rather than counting as a press outside it.
  const { show } = useContext(NavbarContext);
  return (
    <NavigationMenu
      className="grow"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      {/* Desktop */}
      <NavigationMenuList
        className={clx(
          "hidden xl:flex xl:justify-start xl:gap-1",
          classNameNavDesktop,
        )}
      >
        {!show && children}
      </NavigationMenuList>

      {/* Tablet / Mobile */}
      <NavbarMobileMenu className={clx(classNameNavMobile)}>
        {children}
      </NavbarMobileMenu>
    </NavigationMenu>
  );
};

interface NavbarMobileMenuProps {
  children: ReactNode;
  className?: string;
}

type Measurable = {
  getBoundingClientRect: () => DOMRect;
};

const NavbarMobileMenu: FunctionComponent<NavbarMobileMenuProps> = ({
  children,
  className,
}) => {
  const { id, show, setShow, toggleRef, setPanel, panelLabelledBy } =
    useContext(NavbarContext);

  const virtualRef = useRef<Measurable | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  // Whether a press or focus outside the menu, other than on the toggle, is
  // closing it. Focus then stays where it went.
  const closedFromOutsideRef = useRef(false);

  // The panel, for the menu's own focus moves and for the toggle's
  // `aria-controls`
  const attachPanel = useCallback(
    (node: HTMLDivElement | null) => {
      panelRef.current = node;
      setPanel?.(node);
    },
    [setPanel],
  );

  useEffect(() => {
    const node = document.getElementById(id);

    if (node) {
      virtualRef.current = node;
    }
  }, [id]);

  // This component stays mounted while the menu is closed, so each opening
  // starts with no press or focus outside it
  useEffect(() => {
    if (show) closedFromOutsideRef.current = false;
  }, [show]);

  // From `xl:` up the desktop list shows in its place and the toggle hides,
  // so the menu closes once the window is that wide. Left open, it would
  // render the children nowhere seen, and its scroll lock would stop the
  // page scrolling (#214). `80rem` is Tailwind's `xl`, which the preset
  // keeps. Where a test environment has no `matchMedia`, as jsdom has none,
  // or one whose lists have no `addEventListener`, as an older polyfill or a
  // bare mock gives, the menu stays open.
  useEffect(() => {
    if (!show || typeof window.matchMedia !== "function") return;
    const wide: MediaQueryList | undefined =
      window.matchMedia("(min-width: 80rem)");
    if (typeof wide?.addEventListener !== "function") return;
    const closeIfWide = () => {
      if (wide.matches) setShow(false);
    };
    closeIfWide();
    wide.addEventListener("change", closeIfWide);
    return () => wide.removeEventListener("change", closeIfWide);
  }, [show, setShow]);

  if (!show) {
    return null;
  }

  // Opening focuses the menu's first item, whatever it is. Radix would skip
  // links, and focus the panel, which has no size, when only links are left.
  const focusFirstItem = (event: Event) => {
    event.preventDefault();
    const panel = panelRef.current;
    const first = panel && menuEdge(panel, false);
    first?.focus({ preventScroll: true });
  };

  // Closing returns focus to the toggle, unless it went outside the menu.
  // Radix would focus a PopoverTrigger, and there's none. The Popover
  // unmounts as the menu closes, so focus has fallen to `<body>`.
  const returnFocus = (event: Event) => {
    event.preventDefault();
    const toggle = toggleRef?.current;
    const active = toggle?.ownerDocument.activeElement;
    if (
      toggle &&
      !closedFromOutsideRef.current &&
      (!active || active === active.ownerDocument.body)
    )
      toggle.focus();
  };

  // The toggle is part of the menu: focus visiting it doesn't close the
  // menu, and a press on it closes the menu itself. Radix counts it as
  // outside, and would then not return focus on close.
  const keepToggleInside = (event: Event) => {
    const target = event.target;
    if (target instanceof Node && toggleRef?.current?.contains(target))
      event.preventDefault();
    else closedFromOutsideRef.current = true;
  };

  // Tab and Shift+Tab move through the menu's items and the toggle. In the
  // capture phase, as an open dropdown moves focus on Tab itself, and the
  // Popover's own loop then wraps from where it landed. A key press from a
  // portalled child, such as a Dialog opened from an item, reaches the panel
  // through React but isn't the menu's.
  const moveOnTab = (event: KeyboardEvent<HTMLDivElement>) => {
    const panel = event.currentTarget;
    const from = event.target;
    if (event.key !== "Tab" || event.altKey || event.ctrlKey || event.metaKey)
      return;
    if (!(from instanceof Element) || !panel.contains(from)) return;
    const next = menuStop(panel, from, event.shiftKey, toggleRef?.current);
    if (!next) return;
    event.preventDefault();
    event.stopPropagation();
    next.focus();
  };

  // A press on the panel that isn't on something focusable, such as in the
  // list's padding or on the overlay, would focus the panel. Focus stays
  // where it is.
  const keepFocus = (event: MouseEvent<HTMLDivElement>) => {
    const panel = event.currentTarget;
    let node = event.target instanceof Element ? event.target : null;
    if (!node || !panel.contains(node)) return;
    for (; node && node !== panel; node = node.parentElement)
      if (
        node instanceof HTMLElement &&
        (node.tabIndex >= 0 || node.hasAttribute("tabindex"))
      )
        return;
    event.preventDefault();
  };

  return (
    <RemoveScroll as={Root} allowPinchZoom enabled>
      <Popover open={show} onOpenChange={setShow}>
        <PopoverAnchor virtualRef={virtualRef as RefObject<Measurable>} />
        <PopoverPortal>
          <PopoverContent
            ref={attachPanel}
            sideOffset={0}
            align="start"
            className={clx("absolute top-full z-40 h-dvh xl:hidden", className)}
            onOpenAutoFocus={focusFirstItem}
            onCloseAutoFocus={returnFocus}
            onInteractOutside={keepToggleInside}
            onKeyDownCapture={moveOnTab}
            onMouseDown={keepFocus}
            // The panel is a dialog, named as the toggle is. Its own
            // `aria-label` names it only where `aria-labelledby` names
            // nothing: with no toggle to name it, as when the Navbar's
            // context comes from a copy of the library from before
            // `panelLabelledBy`, or when the toggle's `aria-labelledby`
            // points at no element, which leaves the toggle "Menu" too.
            aria-labelledby={panelLabelledBy}
            aria-label={menuLabel}
          >
            <div
              className={clx(
                "absolute h-dvh w-[var(--radix-popper-anchor-width)]",
                "bg-gray-700/60",
                "data-[state=open]:animate-in data-[state=open]:fade-in-0",
                "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
              )}
              aria-hidden
              onClick={() => setShow(false)}
            />
            <ul
              className={clx(
                "absolute max-h-[80dvh] w-[var(--radix-popper-anchor-width)] overflow-y-auto p-3",
                "border-otl-gray-200 rounded-md rounded-t-none border border-t-0",
                "bg-bg-dialog text-txt-black-900 shadow-context-menu",
                "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-2",
                "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2",
              )}
            >
              {children}
            </ul>
          </PopoverContent>
        </PopoverPortal>
      </Popover>
    </RemoveScroll>
  );
};

NavbarMenu.displayName = "NavbarMenu";

interface NavbarMenuItemProps
  extends ComponentProps<typeof NavigationMenuItem> {
  children: ReactNode;
  href: string;
  className?: string;
  asChild?: boolean;
}

// A menu item's hover background, which the NavbarMenuDropdown trigger shares
const navbar_menu_item_cva = cva(
  [
    "bg-transparent hover:bg-bg-washed text-txt-black-700",
    "transition-colors motion-reduce:transition-none list-none",
    "w-full xl:w-fit text-body-sm flex items-center cursor-pointer",
  ],
  {
    variants: {
      is_from_dropdown: {
        true: "text-sm font-normal ml-3 mt-1 xl:ml-0 xl:w-full xl:mt-0 rounded-xs text-left",
        false: "font-medium rounded-md",
      },
    },
  },
);

// The padding, truncation and radius of the area a menu item's hover
// background fills. A menu item's link takes them and fills the item, so its
// focus ring outlines that area; the trigger takes them itself.
const navbar_menu_link_cva = cva(["truncate px-2.5 py-1.5"], {
  variants: {
    is_from_dropdown: {
      true: "rounded-xs",
      false: "rounded-md",
    },
  },
});

const NavbarMenuItem: ForwardRefExoticComponent<NavbarMenuItemProps> =
  forwardRef(({ className, children, href, asChild, ...props }, ref) => {
    const is_from_dropdown = useContext(NavbarMenuDropdownContext);
    return (
      <NavigationMenuItem
        ref={ref}
        className={clx(navbar_menu_item_cva({ is_from_dropdown }), className)}
        {...props}
      >
        {/* With `asChild`, Link slots the child, which gets Link's classes and
          `target`, and Link keeps `underline` */}
        <Link
          asChild={asChild}
          href={href}
          underline="none"
          className={clx("w-full", navbar_menu_link_cva({ is_from_dropdown }))}
        >
          {children}
        </Link>
      </NavigationMenuItem>
    );
  });

NavbarMenuItem.displayName = "NavbarMenuItem";

interface NavbarMenuDropdownProps {
  children: ReactNode;
  title: ReactNode;
  className?: string;
}

const NavbarMenuDropdownContext = sharedContext(
  "NavbarMenuDropdownContext",
  false,
);

const NavbarMenuDropdown: FunctionComponent<NavbarMenuDropdownProps> = ({
  children,
  title,
  className,
}) => {
  return (
    <NavbarMenuDropdownContext.Provider value={true}>
      <NavigationMenuItem key="desktop-dropdown" className="relative list-none">
        <NavigationMenuTrigger
          className={clx(
            navbar_menu_item_cva({ is_from_dropdown: false }),
            navbar_menu_link_cva({ is_from_dropdown: false }),
            "data-[state=open]:bg-bg-washed group w-full select-none bg-transparent transition-colors xl:w-max",
            "focus-visible:ring-fr-primary focus-visible:ring-3 focus-visible:outline-hidden",
          )}
        >
          {title}
          <ChevronDownIcon
            className="relative top-px ml-1.5 size-4 transition group-data-[state=open]:rotate-180 motion-reduce:transition-none"
            aria-hidden="true"
          />
        </NavigationMenuTrigger>
        <NavigationMenuContent
          className={clx(
            "xl:absolute xl:left-0 xl:top-full xl:mt-2 xl:min-w-[220px]",
            "xl:bg-bg-white xl:shadow-context-menu xl:list-none xl:rounded-md xl:p-1.5",
            "w-full xl:w-fit",
            className,
          )}
        >
          <ul>{children}</ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    </NavbarMenuDropdownContext.Provider>
  );
};

NavbarMenuDropdown.displayName = "NavbarMenuDropdown";

interface NavbarActionProps extends ComponentProps<typeof Button> {
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
  /**
   * Accessible name of the toggle that opens and closes the mobile menu, and
   * of the menu's panel, which is named after the toggle. Screen readers
   * announce it; it isn't shown. Set it in your site's language.
   * `aria-labelledby` names both instead.
   * @default "Menu"
   */
  "aria-label"?: string;
  /**
   * The id of an element whose text names the toggle and the mobile menu's
   * panel, in place of `aria-label`.
   */
  "aria-labelledby"?: string;
}

/**
 * The mobile menu's toggle, after any children. Its ref is the toggle's
 * `<button>`, which gets the props, not the `<div>` around it.
 */
const NavbarAction: ForwardRefExoticComponent<NavbarActionProps> = forwardRef(
  ({ children, className, onClick, onKeyDown, id: idProp, ...props }, ref) => {
    const { show, setShow, toggleRef, panel, setPanelLabelledBy } =
      useContext(NavbarContext);
    // The toggle's id, which an author's `id` replaces
    const generatedId = useId();
    const id = idProp || generatedId;
    // The mobile menu's panel is named as the toggle is. It points at the ids
    // in an author's `aria-labelledby` on the toggle, since a name computed
    // through the toggle would skip the toggle's own `aria-labelledby`.
    // Otherwise it points at the toggle, which its `aria-label` names.
    const ariaLabelledBy = props["aria-labelledby"];
    const panelLabelledBy = ariaLabelledBy?.trim() ? ariaLabelledBy : id;
    useBeforePaint(() => {
      if (!setPanelLabelledBy) return;
      setPanelLabelledBy(panelLabelledBy);
      return () =>
        setPanelLabelledBy((current) =>
          current === panelLabelledBy ? undefined : current,
        );
    }, [setPanelLabelledBy, panelLabelledBy]);
    // The toggle, for the Navbar, and for an author's ref
    const attachToggle = useCallback(
      (node: HTMLButtonElement | null) => {
        assignRef(ref, node);
        assignRef(toggleRef, node);
      },
      [ref, toggleRef],
    );
    const handleToggle = () => {
      setShow(!show);
      if (onClick) onClick();
    };
    // The panel, while the menu shows it
    const shownPanel = show ? panel : null;
    // While the menu is open, Tab moves from the toggle to its first item, and
    // Shift+Tab to its last
    const enterMenu = (event: KeyboardEvent<HTMLButtonElement>) => {
      if (!shownPanel || event.key !== "Tab") return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const next = menuEdge(shownPanel, event.shiftKey);
      if (!next) return;
      event.preventDefault();
      next.focus();
    };
    return (
      <div className="flex items-center justify-end gap-2">
        {children}
        <Button
          variant="default-ghost"
          iconOnly
          className={clx("xl:hidden", className)}
          id={id}
          aria-label={menuLabel}
          aria-expanded={show}
          aria-controls={shownPanel?.id || undefined}
          {...props}
          ref={attachToggle}
          onClick={handleToggle}
          onKeyDown={composeEventHandlers(onKeyDown, enterMenu)}
        >
          {show ? <CrossIcon /> : <HamburgerMenuIcon />}
        </Button>
      </div>
    );
  },
);

NavbarAction.displayName = "NavbarAction";

export {
  Navbar,
  NavbarLogo,
  NavbarAction,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuDropdown,
};
