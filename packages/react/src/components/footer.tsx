import {
  Children,
  cloneElement,
  ComponentProps,
  forwardRef,
  ForwardRefExoticComponent,
  isValidElement,
  ReactNode,
  useId,
} from "react";
import { clx } from "../utils";
import { Slot } from "@radix-ui/react-slot";
import { Link } from "./link";

type FooterSectionProps = ComponentProps<"div">;
const FooterSection: ForwardRefExoticComponent<FooterSectionProps> = forwardRef(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clx(
          "border-otl-gray-200 grid grid-cols-2 gap-6 border-b pb-6 md:grid-cols-4 md:pb-8 lg:mx-auto lg:max-w-[1280px] lg:grid-cols-12",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

type FooterProps = ComponentProps<"footer">;
const Footer: ForwardRefExoticComponent<FooterProps> = forwardRef(
  ({ children, className, ...props }, ref) => {
    return (
      <footer
        className={clx(
          "bg-bg-gray-50 border-otl-gray-200 font-body text-body-sm flex flex-col border-t print:hidden",
          "max-md:px-4.5 max-md:gap-6 max-md:py-8",
          "gap-8 md:px-6 md:py-8 md:max-lg:pt-8",
          "lg:py-16",
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </footer>
    );
  },
);

type SiteInfoProps = ComponentProps<"div">;
const SiteInfo: ForwardRefExoticComponent<SiteInfoProps> = forwardRef(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        className={clx(
          "flex flex-col max-lg:col-span-full lg:col-start-1 lg:col-end-4",
          "max-lg:gap-4",
          "lg:gap-3",
          className,
        )}
        {...props}
        ref={ref}
      >
        {children}
      </div>
    );
  },
);

interface SiteLinkGroupProps extends ComponentProps<"nav"> {
  groupTitle: ReactNode;
  linkCount?: number;
}
const SiteLinkGroup: ForwardRefExoticComponent<SiteLinkGroupProps> = forwardRef(
  ({ children, className, groupTitle, linkCount = 8, ...props }, ref) => {
    const titleId = useId();
    const hasTextTitle = typeof groupTitle === "string";
    const titleElement = hasTextTitle ? (
      <div
        id={titleId}
        className="text-txt-black-900 line-clamp-1 font-semibold"
      >
        {groupTitle}
      </div>
    ) : (
      groupTitle
    );

    const processedChildren = Children.toArray(children)
      .slice(0, linkCount)
      .map((child, index) => {
        if (!isValidElement<{ className?: string }>(child)) return child;

        return cloneElement(child, {
          className: clx(
            "line-clamp-1 lg:col-span-full text-txt-black-700",
            child.props.className,
          ),
          key: index,
        });
      });
    return (
      <nav
        aria-labelledby={
          hasTextTitle && !props["aria-label"] ? titleId : undefined
        }
        className={clx(
          "flex flex-col gap-2",
          "max-lg:col-span-full md:gap-3",
          "lg:col-span-2",
          className,
        )}
        {...props}
        ref={ref}
      >
        {titleElement}
        <div
          className={clx(
            "gap-x-4.5 grid grid-cols-2 md:grid-cols-4 md:gap-x-6 lg:grid-cols-2",
            "max-md:gap-y-2 md:max-lg:gap-y-3 lg:gap-y-2",
          )}
        >
          {processedChildren}
        </div>
      </nav>
    );
  },
);

interface FooterLogoProps extends ComponentProps<"div"> {
  logoTitle?: ReactNode;
  logo?: ReactNode;
}
const FooterLogo: ForwardRefExoticComponent<FooterLogoProps> = forwardRef(
  ({ logoTitle, logo, className, ...props }, ref) => {
    const titleElement =
      typeof logoTitle === "string" ? (
        <p className="font-poppins text-body-md font-semibold">{logoTitle}</p>
      ) : (
        logoTitle
      );
    return (
      <div
        className={clx(
          "text-txt-black-900 flex items-center gap-x-2.5",
          className,
        )}
        {...props}
        ref={ref}
      >
        {logo}
        {titleElement}
      </div>
    );
  },
);

interface SiteLinkProps extends ComponentProps<typeof Link> {
  href?: string;
}

const SiteLink: ForwardRefExoticComponent<SiteLinkProps> = forwardRef(
  ({ children, className, asChild = false, href, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          className={clx("hover:text-txt-black-900", className)}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <Link
        className={clx("hover:text-txt-black-900", className)}
        ref={ref}
        href={href}
        underline="hover"
        {...props}
      >
        {children}
      </Link>
    );
  },
);

FooterSection.displayName = "FooterSection";
Footer.displayName = "Footer";
SiteInfo.displayName = "SiteInfo";
SiteLinkGroup.displayName = "SiteLinkGroup";
SiteLink.displayName = "SiteLink";
FooterLogo.displayName = "FooterLogo";

/*========================================================================================================================*/

export { FooterSection, SiteInfo, SiteLinkGroup, SiteLink, Footer, FooterLogo };
