import React, {
  ComponentProps,
  forwardRef,
  ForwardRefExoticComponent,
  ReactNode,
  useContext,
} from "react";
import { clx } from "../utils";
import { EllipsisIcon } from "../icons/ellipsis";
import { Button, ButtonIcon } from "./button";
import { ChevronLeftIcon } from "../icons/chevron-left";
import { ChevronRightIcon } from "../icons/chevron-right";
import { Slot } from "@radix-ui/react-slot";
import { usePagination } from "../hooks/use-pagination";
import { sharedContext } from "../utils/registry";

// The English default names. The parts set them, and AutoPagination sets
// them again where it passes a label prop through to a part.
const PREVIOUS_LABEL = "previous page";
const NEXT_LABEL = "next page";
const pageLabelOf = (page: number) => `page ${page}`;
const ELLIPSIS_LABEL = "More pages";

/**
 * Props for Pagination component.
 * @typedef PaginatorProps
 * @property {number} page - The current page number.
 * @property {number} limit - The number of items per page
 * @property {number} count - The total number of items
 * @property {"default" | "simple" | "full"} [type="default"] - The variation of the pagination: `default`, `simple` or `full`. Defaults to `default`.
 * @property {function} onPageChange - function which tracks the page
 */
export interface PaginatorProps {
  page: number;
  limit: number;
  count: number;
  onPageChange: (page: number) => void;
  /**
   * The variation of the pagination: `default`, `simple` or `full`
   * @default "default"
   */
  type?: "default" | "simple" | "full";
}

// What PaginationContext carries: Pagination's props, with `type` always
// set, and the number of pages
type PaginationContextValue = Omit<PaginatorProps, "type"> & {
  type: NonNullable<PaginatorProps["type"]>;
  totalPages: number;
};

const PaginationContext = sharedContext<PaginationContextValue>(
  "PaginationContext",
  {
    page: 1,
    count: 0,
    limit: 6,
    totalPages: 0,
    type: "default",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onPageChange: (page) => {},
  },
);

interface PaginationProps extends ComponentProps<"nav">, PaginatorProps {}

/**
 * Component that allows users to navigate through a large set of content divided into discrete pages.
 * @component
 * @example
 * <Pagination propName="value" />
 */
const Pagination: ForwardRefExoticComponent<PaginationProps> = forwardRef(
  (
    {
      count,
      limit,
      page,
      children,
      className,
      type = "default",
      onPageChange,
      ...props
    },
    ref,
  ) => {
    const totalPages = Math.ceil(count / limit);
    return (
      <PaginationContext.Provider
        value={{ count, limit, page, totalPages, type, onPageChange }}
      >
        <nav
          ref={ref}
          role="navigation"
          aria-label="pagination"
          className={clx("text-body-md flex w-full justify-center", className)}
          {...props}
        >
          {children}
        </nav>
      </PaginationContext.Provider>
    );
  },
);

Pagination.displayName = "Pagination";

const PaginationContent: ForwardRefExoticComponent<ComponentProps<"ul">> =
  forwardRef(({ className, ...props }, ref) => (
    <ul
      ref={ref}
      className={clx("flex flex-row items-center gap-4", className)}
      {...props}
    />
  ));
PaginationContent.displayName = "PaginationContent";

const PaginationItem: ForwardRefExoticComponent<ComponentProps<"li">> =
  forwardRef(({ className, ...props }, ref) => (
    <li ref={ref} className={clx("rounded-md", className)} {...props} />
  ));
PaginationItem.displayName = "PaginationItem";

const PaginationPrevious: ForwardRefExoticComponent<
  ComponentProps<"button"> & { asChild?: boolean }
> = forwardRef(({ asChild, children, ...props }, ref) => {
  const { page, onPageChange } = useContext(PaginationContext);
  const disabled = page <= 1;
  const handlePreviousPage = () => {
    if (page > 1) {
      onPageChange(page - 1);
    }
  };

  if (asChild)
    return (
      <Slot ref={ref} {...props}>
        {children}
      </Slot>
    );

  return (
    <Button
      ref={ref}
      variant={"default-outline"}
      size={"medium"}
      disabled={disabled}
      className={clx(disabled && "shadow-transparent")}
      onClick={handlePreviousPage}
      // Children name the button. With none, it shows only the chevron.
      aria-label={children ? undefined : PREVIOUS_LABEL}
      {...props}
    >
      <ButtonIcon>
        <ChevronLeftIcon />
      </ButtonIcon>
      {children}
    </Button>
  );
});

PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext: ForwardRefExoticComponent<
  ComponentProps<"button"> & { asChild?: boolean }
> = forwardRef(({ asChild, children, ...props }, ref) => {
  const { page, totalPages, onPageChange } = useContext(PaginationContext);
  const disabled = page === totalPages;
  const handleNextPage = () => {
    if (page < totalPages) {
      onPageChange(page + 1);
    }
  };
  if (asChild)
    return (
      <Slot ref={ref} {...props}>
        {children}
      </Slot>
    );

  return (
    <Button
      ref={ref}
      variant={"default-outline"}
      size={"medium"}
      disabled={disabled}
      className={clx(disabled && "shadow-transparent")}
      onClick={handleNextPage}
      // Children name the button. With none, it shows only the chevron.
      aria-label={children ? undefined : NEXT_LABEL}
      {...props}
    >
      {children}
      <ButtonIcon>
        <ChevronRightIcon />
      </ButtonIcon>
    </Button>
  );
});

PaginationNext.displayName = "PaginationNext";

const PaginationNumber: ForwardRefExoticComponent<
  ComponentProps<"button"> & { number: number }
> = forwardRef(({ number, ...props }, ref) => {
  const { page, onPageChange } = useContext(PaginationContext);
  const isActive = page === number;
  const handleClickPage = () => {
    onPageChange(number);
  };
  return (
    <Button
      ref={ref}
      onClick={handleClickPage}
      variant={"default-ghost"}
      size={"medium"}
      className={clx(
        isActive && "bg-bg-washed-active",
        "h-10 w-10 items-center justify-center",
      )}
      aria-label={pageLabelOf(number)}
      {...props}
    >
      {number}
    </Button>
  );
});

PaginationNumber.displayName = "PaginationNumber";

// `content` replaces the <p>'s RDFa `content` attribute, a string, so that
// it takes any React node
const PaginationLabel: ForwardRefExoticComponent<
  Omit<ComponentProps<"p">, "content"> & { content?: ReactNode }
> = forwardRef(({ className, content, ...props }, ref) => {
  const { page, totalPages, type } = useContext(PaginationContext);
  return (
    <p ref={ref} className={clx("text-txt-black-700", className)} {...props}>
      {content ? content : type === "full" && `Page ${page} of ${totalPages}`}
    </p>
  );
});

PaginationLabel.displayName = "PaginationLabel";

const PaginationEllipsis = ({
  className,
  children = ELLIPSIS_LABEL,
  ...props
}: ComponentProps<"span">) => (
  <span
    className={clx("flex size-8 items-center justify-center", className)}
    {...props}
  >
    <EllipsisIcon aria-hidden className="text-txt-black-700 size-4" />
    <span className="sr-only">{children}</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

interface AutoPaginationProps extends ComponentProps<"nav">, PaginatorProps {
  maxDisplay?: number;
  next?: ReactNode;
  previous?: ReactNode;
  fullText?: string;
  /**
   * Names the previous button. With `type="default"` the button shows only a
   * chevron, so screen readers announce this name and it isn't shown. With
   * `type="simple"` or `type="full"` it is the button's visible text, which
   * also names it. Not used when you pass `previous`. Set it in your site's
   * language.
   * @default "previous page" with `type="default"`; "Previous" with `type="simple"` or `type="full"`
   */
  previousLabel?: string;
  /**
   * Names the next button. With `type="default"` the button shows only a
   * chevron, so screen readers announce this name and it isn't shown. With
   * `type="simple"` or `type="full"` it is the button's visible text, which
   * also names it. Not used when you pass `next`. Set it in your site's
   * language.
   * @default "next page" with `type="default"`; "Next" with `type="simple"` or `type="full"`
   */
  nextLabel?: string;
  /**
   * Names each page button with `type="default"`, from its page number.
   * Screen readers announce it; the button shows the number. Set it in your
   * site's language.
   * @default (page) => `page ${page}`
   */
  pageLabel?: (page: number) => string;
  /**
   * Text each ellipsis with `type="default"` announces where pages are
   * skipped. Screen readers announce it; it isn't shown. Set it in your
   * site's language.
   * @default "More pages"
   */
  ellipsisLabel?: string;
}

const AutoPagination: ForwardRefExoticComponent<AutoPaginationProps> =
  forwardRef(
    (
      {
        type = "default",
        maxDisplay = 4,
        next,
        previous,
        fullText,
        previousLabel,
        nextLabel,
        pageLabel = pageLabelOf,
        ellipsisLabel = ELLIPSIS_LABEL,
        ...props
      },
      ref,
    ) => {
      const { visiblePages } = usePagination({
        count: props.count,
        limit: props.limit,
        page: props.page,
        maxDisplay,
      });

      if (type === "simple") {
        return (
          <Pagination ref={ref} type={type} {...props}>
            <PaginationContent>
              <PaginationItem>
                {previous || (
                  <PaginationPrevious>
                    {previousLabel ?? "Previous"}
                  </PaginationPrevious>
                )}
              </PaginationItem>
              <PaginationItem>
                <PaginationLabel />
              </PaginationItem>
              <PaginationItem>
                {next || <PaginationNext>{nextLabel ?? "Next"}</PaginationNext>}
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        );
      }
      if (type === "full") {
        return (
          <Pagination ref={ref} type={type} {...props}>
            <PaginationContent className="w-[512px]">
              <PaginationItem className="flex-1">
                <PaginationLabel content={fullText} />
              </PaginationItem>
              <PaginationItem>
                {previous || (
                  <PaginationPrevious>
                    {previousLabel ?? "Previous"}
                  </PaginationPrevious>
                )}
              </PaginationItem>

              <PaginationItem>
                {next || <PaginationNext>{nextLabel ?? "Next"}</PaginationNext>}
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        );
      }

      return (
        <Pagination ref={ref} type={type} {...props}>
          <PaginationContent>
            <PaginationItem>
              {previous || (
                <PaginationPrevious
                  aria-label={previousLabel ?? PREVIOUS_LABEL}
                />
              )}
            </PaginationItem>
            {visiblePages.map((page, index) => (
              <PaginationItem key={index}>
                {page === "..." ? (
                  <PaginationEllipsis>{ellipsisLabel}</PaginationEllipsis>
                ) : (
                  typeof page === "number" && (
                    <PaginationNumber
                      number={page}
                      aria-label={pageLabel(page)}
                    />
                  )
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              {next || <PaginationNext aria-label={nextLabel ?? NEXT_LABEL} />}
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );
    },
  );

export {
  Pagination,
  PaginationContext,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLabel,
  PaginationNext,
  PaginationNumber,
  PaginationPrevious,
  AutoPagination,
};

export type { AutoPaginationProps };
