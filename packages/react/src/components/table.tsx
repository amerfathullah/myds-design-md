import { QuestionCircleIcon } from "../icons";
import { clx } from "../utils";
import { forwardRef, ForwardRefExoticComponent, ComponentProps } from "react";
import { Skeleton } from "./skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

const Table: ForwardRefExoticComponent<ComponentProps<"table">> = forwardRef(
  ({ className, ...props }, ref) => (
    <div className={clx("relative w-full overflow-auto", className)}>
      <table
        ref={ref}
        className="w-full caption-bottom border-separate border-spacing-0 text-sm"
        {...props}
      />
    </div>
  ),
);
Table.displayName = "Table";

const TableHeader: ForwardRefExoticComponent<ComponentProps<"thead">> =
  forwardRef(({ className, ...props }, ref) => (
    <thead ref={ref} className={clx("sticky top-0", className)} {...props} />
  ));
TableHeader.displayName = "TableHeader";

const TableBody: ForwardRefExoticComponent<ComponentProps<"tbody">> =
  forwardRef(({ className, ...props }, ref) => (
    <tbody ref={ref} className={clx(className)} {...props} />
  ));
TableBody.displayName = "TableBody";

const TableFooter: ForwardRefExoticComponent<ComponentProps<"tfoot">> =
  forwardRef(({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={clx(
        "font-medium",
        "[&_td]:border-otl-gray-200 [&_td]:border-y-2",
        className,
      )}
      {...props}
    />
  ));
TableFooter.displayName = "TableFooter";

const TableRow: ForwardRefExoticComponent<ComponentProps<"tr">> = forwardRef(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={clx(
        "*:border-otl-gray-200 *:border-b",
        "first:[&_th]:border-t-2 last:[&_th]:border-b-2 only:[&_th]:border-t-0",
        className,
      )}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

const TableHead: ForwardRefExoticComponent<ComponentProps<"th">> = forwardRef(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={clx(
        "text-txt-black-500 min-h-[30px] py-3 pr-3 text-left align-middle text-xs font-medium",
        "[&:has([role=checkbox])]:w-8 [&:has([role=checkbox])]:pl-1",
        "[&:has([role=radio])]:w-8 [&:has([role=radio])]:pl-1",
        className,
      )}
      {...props}
    />
  ),
);
TableHead.displayName = "TableHead";

const TableCell: ForwardRefExoticComponent<ComponentProps<"td">> = forwardRef(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      role="gridcell"
      tabIndex={-1}
      className={clx(
        "border-otl-gray-200 text-txt-black-900 border-b py-1.5 pr-3 align-middle text-sm leading-[33.11px]",
        // Inset, so the table's scroll wrapper, its sticky header and the
        // neighbouring cells' fills don't hide the ring
        "focus-visible:ring-fr-primary rounded-[1px] focus-visible:ring-3 focus-visible:outline-hidden focus-visible:ring-inset",
        "[&:has([role=checkbox])]:w-8 [&:has([role=checkbox])]:pl-1",
        // A Radix radio has the role; DataTable's native radio input doesn't
        "[&:has([role=radio])]:w-8 [&:has([role=radio])]:pl-1",
        "[&:has(input[type=radio])]:w-8 [&:has(input[type=radio])]:pl-1",
        className,
      )}
      {...props}
    />
  ),
);
TableCell.displayName = "TableCell";

const TableCaption: ForwardRefExoticComponent<ComponentProps<"caption">> =
  forwardRef(({ className, ...props }, ref) => (
    <caption
      ref={ref}
      className={clx("text-txt-black-500 mt-4 text-sm", className)}
      {...props}
    />
  ));
TableCaption.displayName = "TableCaption";

interface TableTooltipProps extends ComponentProps<typeof Tooltip> {
  /**
   * Accessible name of the trigger, a question-mark icon. Screen readers
   * announce it; it isn't shown. Set it in your site's language. The other
   * props go to the tooltip root.
   * @default "Tooltip"
   */
  "aria-label"?: string;
}

const TableTooltip: ForwardRefExoticComponent<TableTooltipProps> = forwardRef(
  // eslint-disable-next-line  @typescript-eslint/no-unused-vars
  ({ children, "aria-label": label = "Tooltip", ...props }, ref) => {
    return (
      <Tooltip {...props}>
        <TooltipTrigger aria-label={label}>
          <QuestionCircleIcon className="text-txt-black-500 size-4 cursor-help" />
        </TooltipTrigger>
        <TooltipContent side="top" align="center">
          {children}
        </TooltipContent>
      </Tooltip>
    );
  },
);
TableTooltip.displayName = "TableTooltip";

const TableSkeleton: ForwardRefExoticComponent<ComponentProps<"div">> =
  forwardRef((props, ref) => <Skeleton ref={ref} {...props} shape="line" />);

TableSkeleton.displayName = "TableSkeleton";

const TableEmpty: ForwardRefExoticComponent<ComponentProps<"td">> = forwardRef(
  ({ className, children, colSpan = 100, ...props }, ref) => {
    return (
      <TableCell
        ref={ref}
        colSpan={colSpan}
        className={clx("text-txt-black-500 py-8 text-center", className)}
        {...props}
      >
        {children || "No data available"}
      </TableCell>
    );
  },
);
TableEmpty.displayName = "TableEmpty";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableTooltip,
  TableSkeleton,
  TableEmpty,
};
