import {
  type CellContext,
  type Column,
  type ColumnDef as TanStackColumnDef,
  type ExpandedState,
  type Header,
  type ReactTable,
  type Row,
  type RowData,
  type RowSelectionState,
  columnFacetingFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createExpandedRowModel,
  createFacetedUniqueValues,
  createSortedRowModel,
  flexRender,
  metaHelper,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  TableSkeleton,
  TableTooltip,
} from "./table";
import {
  createContext,
  CSSProperties,
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ColumnCollapseIcon } from "../icons/column-collapse";
import { ColumnExpandIcon } from "../icons/column-expand";
import { clx, pick } from "../utils";
import { Button, ButtonIcon } from "./button";
import {
  ChevronRightIcon,
  FilterAscIcon,
  FilterDescIcon,
  FilterIcon,
  ReloadIcon,
} from "../icons";
import { Checkbox } from "./checkbox";
import { cva } from "class-variance-authority";
/**
 * The `meta` of a DataTable column definition
 * @see https://tanstack.com/table/latest/docs/guide/table-and-column-meta
 */
interface DataTableColumnMeta {
  className?: {
    header?: string;
    cell?: string;
  };
  sortable?: boolean;
  expandable?: boolean;
  tooltip?: ReactNode;
  /**
   * Accessible name of the header's tooltip trigger, a question-mark icon,
   * that `tooltip` adds. Screen readers announce it; it isn't shown. Set it
   * in your site's language.
   * @default "Tooltip"
   */
  tooltipLabel?: string;
  /**
   * Accessible name of the header's sort button, which `sortable` adds. It
   * replaces the whole default name, whose `{header}` is the text the header
   * renders ("Sort column" if it renders none). Screen readers announce it;
   * it isn't shown. Set it in your site's language.
   * @default "Sort by {header}"
   */
  sortLabel?: string;
  /**
   * Accessible name of the header's widen button, which `expandable` adds.
   * It replaces the whole default name, whose `{header}` is the text the
   * header renders ("Widen column" if it renders none). Screen readers
   * announce it; it isn't shown. Set it in your site's language.
   * @default "Widen {header}"
   */
  widenLabel?: string;
}

/**
 * The TanStack Table features DataTable registers. Only their APIs exist on the
 * table, column, row and cell objects that column definitions receive.
 * - Visibility orders `row.getVisibleCells()` by pinned region, and ordering
 *   provides `column.getIsLastColumn()` for the pinned-edge shadow.
 * - Pagination and faceting keep `table.getRowCount()` and
 *   `column.getFacetedUniqueValues()`: without a paginated row model, no rows
 *   are sliced.
 */
const dataTableFeatures = tableFeatures({
  columnVisibilityFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnSizingFeature,
  columnFacetingFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  expandedRowModel: createExpandedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  sortedRowModel: createSortedRowModel(),
  sortFns,
  columnMeta: metaHelper<DataTableColumnMeta>(),
});
type DataTableFeatures = typeof dataTableFeatures;

type ColumnDef<TData extends RowData, TValue = unknown> = TanStackColumnDef<
  DataTableFeatures,
  TData,
  TValue
>;

/**
 * An accessible name for each row's control: a string names every row's
 * control, and a function is called with each row and returns its name
 */
type RowLabel<TData extends RowData> =
  string | ((row: Row<DataTableFeatures, TData>) => string);

interface DataTableProps<TData extends Record<string, any>> {
  className?: string;
  columns: ColumnDef<TData>[];
  data: TData[];
  loading?: boolean;
  selection?: {
    id_by: keyof TData;
    mode: "checkbox" | "radio";
    onSelectionChange?: (value: string[]) => void;
    enableRowSelection?:
      boolean | ((row: Row<DataTableFeatures, TData>) => boolean);
    enableSubRowSelection?:
      boolean | ((row: Row<DataTableFeatures, TData>) => boolean);
    /**
     * Accessible name of each row's checkbox or radio. A string names every
     * row's control; a function is called with each row and returns its
     * name. Screen readers announce it; it isn't shown. Set it in your
     * site's language. A string gives every row the same name, so prefer a
     * function that names the row. The default numbers the rows the table
     * shows from 1, top to bottom in the current sort, counting expanded
     * sub-rows.
     * @default "Select row N"
     */
    rowLabel?: RowLabel<TData>;
    /**
     * Accessible name of the header's checkbox, which selects every row, in
     * `checkbox` mode. Screen readers announce it; it isn't shown. Set it
     * in your site's language.
     * @default "Select all rows"
     */
    selectAllLabel?: string;
    /**
     * Accessible name of the header's reset button, which clears the
     * selection, in `radio` mode. Screen readers announce it; it isn't shown.
     * Set it in your site's language.
     * @default "Clear selection"
     */
    clearLabel?: string;
    /**
     * Visually hidden text that heads the selection column, in either mode.
     * Screen readers announce it as the column's header; it isn't shown. Set
     * it in your site's language.
     * @default "Select"
     */
    columnLabel?: string;
  };
  pin?: {
    left?: string[];
    right?: string[];
  };
  nest?: {
    id_by: keyof TData;
    /**
     * Accessible name of each `Cell.Expand` toggle, which shows or hides a
     * row's sub-rows. A string names every toggle; a function is called with
     * each row and returns its name. The toggle's `aria-expanded` says
     * whether the row is expanded, so the name stays the same. Screen
     * readers announce it; it isn't shown. Set it in your site's language.
     * @default "expand row"
     */
    expandLabel?: RowLabel<TData>;
  };
  emptyState?: ReactNode;
}

const pin_cva = cva(["bg-bg-white"], {
  variants: {
    pin_direction: {
      left: "sticky z-10",
      right: "sticky z-10 pl-2",
      false: "",
    },
    pin_last: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    {
      pin_direction: ["left"],
      pin_last: true,
      className:
        "before:right-0 before:border-none before:outline-hidden before:bottom-0 before:pointer-events-none before:contents-[''] before:absolute top-0 before:w-1 before:bg-transparent before:h-full before:py-0 before:shadow-[inset_3px_0_8px_-8px]",
    },
    {
      pin_direction: ["right"],
      pin_last: true,
      className:
        "before:left-0 before:border-none before:outline-hidden before:bottom-0 before:pointer-events-none before:contents-[''] before:absolute top-0 before:w-1 before:bg-transparent before:h-full before:py-0 before:shadow-[inset_-3px_0_8px_-8px]",
    },
  ],
});

const th_cva = cva(
  ["group transition data-[expanded=true]:border-otl-primary-300"],
  {
    variants: {
      expandable: {
        true: "hover:border-otl-primary-300",
      },
      sortable: {
        true: "hover:border-otl-primary-300",
      },
    },
  },
);

const cell_cva = cva([
  "md:whitespace-nowrap whitespace-normal break-words",
  "data-[expanded=false]:truncate data-[expanded=false]:max-w-[230px]",
]);

interface DataTableContextProps {
  /**
   * The rendering components don't depend on the row type, and TanStack's
   * table and row types are invariant in it, so the context holds the table
   * and DataTable's props untyped.
   */
  table: ReactTable<DataTableFeatures, any> | null;
  expandableColumns: Record<string, any>;
  toggleColumnWidth: (columnId: string) => void;
  loading?: DataTableProps<any>["loading"];
  emptyState?: DataTableProps<any>["emptyState"];
  /** The reserved columns and cells take their labels from these */
  selection?: DataTableProps<any>["selection"];
  nest?: DataTableProps<any>["nest"];
}

const DataTableContext = createContext<DataTableContextProps>({
  table: null,
  expandableColumns: {},
  toggleColumnWidth: () => {},
});

interface DataTableProviderProps<TData extends Record<string, any>>
  extends DataTableProps<TData> {
  children: ReactNode;
}
const DataTableProvider = <TData extends Record<string, any>>({
  children,
  className,
  ...props
}: DataTableProviderProps<TData>) => {
  const { columns, data, selection, pin, nest } = props;
  const [expandableColumns, setExpandableColumns] = useState(
    pick(columns, "id", () => false),
  );
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [expandedSelection, setExpandedSelection] = useState<ExpandedState>({});

  const toggleColumnWidth = (columnId: string) => {
    setExpandableColumns((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  const _columns = useMemo(() => {
    switch (selection?.mode) {
      case "checkbox":
        return [Column.Checkbox<TData>(), ...columns];
      case "radio":
        return [Column.Radio<TData>(), ...columns];
      default:
        return columns;
    }
  }, [columns, selection?.mode]);

  const table = useTable<DataTableFeatures, TData>({
    features: dataTableFeatures,
    data,
    columns: _columns,
    state: {
      expanded: expandedSelection,
      rowSelection: rowSelection,
      columnPinning: {
        start: pin?.left ?? [],
        end: pin?.right ?? [],
      },
    },
    enableRowSelection: selection?.enableRowSelection,
    enableSubRowSelection: selection?.enableSubRowSelection,
    enableMultiRowSelection: selection?.mode === "checkbox",
    enableRowRangeSelection: false,
    getRowId: selection?.id_by
      ? (row) => row[selection.id_by] as string
      : undefined,
    getSubRows: nest ? (row) => row[nest.id_by] : undefined,
    onExpandedChange: setExpandedSelection,
    onRowSelectionChange: setRowSelection,
    debugTable: false,
    debugHeaders: false,
  });

  useEffect(() => {
    if (!selection) return;
    selection?.onSelectionChange?.(Object.keys(rowSelection));
  }, [rowSelection]);

  return (
    <DataTableContext.Provider
      value={{
        table: table as ReactTable<DataTableFeatures, any>,
        expandableColumns,
        toggleColumnWidth,
        ...(props as DataTableProps<any>),
      }}
    >
      <Table
        className={className}
        style={{
          width: props.pin ? table.getTotalSize() : undefined,
        }}
      >
        {children}
      </Table>
    </DataTableContext.Provider>
  );
};

const DataTableHeader: FunctionComponent = () => {
  const { table } = useContext(DataTableContext);

  if (!table) return null;

  return (
    <TableHeader>
      {table.getHeaderGroups().map((headerGroup) => {
        return (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <DataTableHead key={header.id} header={header} />
            ))}
          </TableRow>
        );
      })}
    </TableHeader>
  );
};

// Layout effects don't run on the server, and React 18 warns there, so the
// server gets useEffect
const useBeforePaint =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/** The text an element renders, its runs of whitespace collapsed */
const renderedText = (element: HTMLElement | null) =>
  element?.textContent?.replace(/\s+/g, " ").trim() ?? "";

const DataTableHead: FunctionComponent<{
  header: Header<DataTableFeatures, any, unknown>;
}> = ({ header }) => {
  const { expandableColumns, toggleColumnWidth, selection } =
    useContext(DataTableContext);
  const { tooltip, tooltipLabel, expandable, sortable, sortLabel, widenLabel } =
    header.column.columnDef.meta || {};

  // A selection column is headed by its visually hidden label, and any other
  // by the text its header renders. The header is named by that text alone,
  // so its name leaves out the names of the buttons and tooltip trigger
  // inside it.
  const isSelection =
    header.column.columnDef.id == "_checkbox" ||
    header.column.columnDef.id == "_radio";
  const labelId = useId();

  // The text the header renders names its buttons. A header can be a string,
  // a function or TanStack's default, so the text is read once it renders.
  const textRef = useRef<HTMLSpanElement>(null);
  const [text, setText] = useState("");
  useBeforePaint(() => setText(renderedText(textRef.current)));

  // Only the primary sort column, the first in the sorting state, has
  // `aria-sort`, so a Shift+click multi-sort doesn't give it to the others
  const sorted =
    !header.isPlaceholder &&
    header.column.getSortIndex() === 0 &&
    header.column.getIsSorted();

  return (
    <TableHead
      id={header.id}
      colSpan={header.colSpan}
      aria-labelledby={
        isSelection || !header.isPlaceholder ? labelId : undefined
      }
      aria-sort={
        sorted ? (sorted === "desc" ? "descending" : "ascending") : undefined
      }
      data-expanded={expandableColumns[header.id]}
      data-pinned={getPinnedSide(header.column)}
      className={clx(
        th_cva({ expandable, sortable }),
        pin_cva({
          pin_direction: getPinnedSide(header.column),
          pin_last: header.column.getIsLastColumn(header.column.getIsPinned()),
        }),
        header.column.columnDef.meta?.className?.header,
      )}
      style={{ ...getCommonPinningStyles(header.column) }}
    >
      <span className="sr-only" id={isSelection ? labelId : undefined}>
        {isSelection && (selection?.columnLabel ?? "Select")}
      </span>
      {header.isPlaceholder ? null : (
        <div className="flex w-full items-center justify-between gap-2 whitespace-nowrap">
          <span ref={textRef} id={isSelection ? undefined : labelId}>
            {flexRender(header.column.columnDef.header, header.getContext())}
          </span>

          <div className="flex justify-end gap-1">
            {/* Expand */}
            {expandable && (
              <Button
                type="button"
                size="small"
                variant={"primary-outline"}
                onClick={() => toggleColumnWidth(header.id)}
                className="rounded-md px-1 py-0"
                data-expanded={expandableColumns[header.id]}
                aria-label={
                  widenLabel ?? (text ? `Widen ${text}` : "Widen column")
                }
                aria-pressed={Boolean(expandableColumns[header.id])}
              >
                {expandableColumns[header.id] ? (
                  <ColumnCollapseIcon
                    aria-hidden
                    className="text-txt-primary size-4"
                  />
                ) : (
                  <ColumnExpandIcon
                    aria-hidden
                    className="text-txt-primary size-4"
                  />
                )}
              </Button>
            )}

            {/* Sortable, if TanStack can sort it: a column without an
                accessor can't sort */}
            {sortable && header.column.getCanSort() && (
              <Button
                type="button"
                size="small"
                variant={"primary-outline"}
                onClick={header.column.getToggleSortingHandler()}
                className="rounded-md px-1 py-0"
                data-sorted={Boolean(header.column.getIsSorted())}
                aria-label={
                  sortLabel ?? (text ? `Sort by ${text}` : "Sort column")
                }
              >
                {{
                  desc: <FilterDescIcon aria-hidden className="size-4" />,
                  asc: <FilterAscIcon aria-hidden className="size-4" />,
                }[header.column.getIsSorted() as string] ?? (
                  <FilterIcon aria-hidden className="size-4" />
                )}
              </Button>
            )}

            {/* Tooltip */}
            {tooltip && (
              <TableTooltip aria-label={tooltipLabel}>{tooltip}</TableTooltip>
            )}
          </div>
        </div>
      )}
    </TableHead>
  );
};

const DataTableBody: FunctionComponent = () => {
  const { table, expandableColumns, loading, emptyState } =
    useContext(DataTableContext);

  if (!table)
    throw new Error("Table instance failed to initialize. Please check");

  return (
    <TableBody>
      {loading ? (
        Array.from({ length: 5 }).map((_, index) => (
          <TableRow key={index}>
            {table.getAllLeafColumns().map((column) => (
              <TableCell key={column.id} className="py-3">
                <TableSkeleton />
              </TableCell>
            ))}
          </TableRow>
        ))
      ) : table?.getRowModel()?.rows?.length > 0 ? (
        table.getRowModel().rows.map((row) => {
          return (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => {
                return (
                  <TableCell
                    id={cell.id}
                    key={cell.id}
                    data-expanded={expandableColumns[cell.column.id]}
                    data-pinned={getPinnedSide(cell.column)}
                    className={clx(
                      cell_cva(),
                      pin_cva({
                        pin_direction: getPinnedSide(cell.column),
                        pin_last: cell.column.getIsLastColumn(
                          cell.column.getIsPinned(),
                        ),
                      }),
                      cell.column.columnDef.meta?.className?.cell,
                    )}
                    style={{ ...getCommonPinningStyles(cell.column) }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                );
              })}
            </TableRow>
          );
        })
      ) : (
        <TableRow>
          <TableEmpty colSpan={table.getAllLeafColumns().length}>
            {emptyState || "No data available"}
          </TableEmpty>
        </TableRow>
      )}
    </TableBody>
  );
};

const DataTableFooter: FunctionComponent = () => {
  const { table, expandableColumns } = useContext(DataTableContext);

  if (!table) return null;

  const footers = table
    .getFooterGroups()
    .map((group) =>
      group.headers.map((header) => header.column.columnDef.footer),
    )
    .flat()
    .filter(Boolean);

  if (footers.length === 0) return;

  return (
    <TableFooter>
      {table.getFooterGroups().map((footerGroup) => (
        <TableRow key={footerGroup.id}>
          {footerGroup.headers.map((header) => (
            <TableCell
              key={header.id}
              colSpan={header.colSpan}
              data-expanded={expandableColumns[header.column.id]}
              data-pinned={getPinnedSide(header.column)}
              className={clx(
                cell_cva(),
                pin_cva({
                  pin_direction: getPinnedSide(header.column),
                  pin_last: header.column.getIsLastColumn(
                    header.column.getIsPinned(),
                  ),
                }),
                header.column.columnDef.meta?.className?.cell,
              )}
              style={{ ...getCommonPinningStyles(header.column) }}
            >
              {header.isPlaceholder
                ? null
                : flexRender(
                    header.column.columnDef.footer,
                    header.getContext(),
                  )}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableFooter>
  );
};

const CheckboxColumn = <TData extends Record<string, any>>() => {
  const columnHelper = createColumnHelper<DataTableFeatures, TData>();
  return columnHelper.display({
    id: "_checkbox",
    size: 46,
    header: function SelectAllCheckbox({ table }) {
      const { selection } = useContext(DataTableContext);
      return (
        <Checkbox
          key="checkbox-all"
          checked={
            table.getIsAllRowsSelected() ||
            (table.getIsSomeRowsSelected() && "indeterminate")
          }
          aria-label={selection?.selectAllLabel ?? "Select all rows"}
          onClick={table.getToggleAllRowsSelectedHandler()}
        />
      );
    },
    cell: function RowCheckbox(context) {
      const { row } = context;
      const { selection } = useContext(DataTableContext);
      return (
        <Checkbox
          key={`checkbox-${row.id}`}
          checked={row.getIsSelected()}
          value={row.id}
          disabled={!row.getCanSelect()}
          aria-label={getSelectRowLabel(context, selection)}
          onClick={row.getToggleSelectedHandler()}
        />
      );
    },
  });
};

const RadioColumn = <TData extends Record<string, any>>() => {
  const columnHelper = createColumnHelper<DataTableFeatures, TData>();
  return columnHelper.display({
    id: "_radio",
    size: 46,
    header: function ClearSelectionButton({ table }) {
      const { selection } = useContext(DataTableContext);
      return (
        <div className="flex items-center gap-1">
          <Button
            size="small"
            variant="default-ghost"
            onClick={() => table.resetRowSelection(false)}
            className="invisible px-1 py-0 transition data-[selected=true]:visible"
            data-selected={table.getIsSomeRowsSelected()}
            aria-label={selection?.clearLabel ?? "Clear selection"}
          >
            <ReloadIcon className="text-txt-black-500 size-4 rotate-45" />
          </Button>
        </div>
      );
    },
    cell: function RowRadio(context) {
      const { row } = context;
      const { selection } = useContext(DataTableContext);
      return (
        <div
          className={clx(
            "shadow-button hover:border-otl-gray-300 border-otl-gray-200 flex aspect-square size-4 items-center justify-center rounded-full border",
            // The wrapper can't match :focus-visible itself, so it rings while
            // its input does
            "has-[:focus-visible]:ring-fr-primary focus:outline-hidden has-[:focus-visible]:ring-3",
            "has-[:checked]:bg-primary-600 has-[:disabled]:has-[:checked]::bg-primary-600 has-[:checked]:border-none has-[:disabled]:opacity-30",
          )}
        >
          <input
            type="radio"
            aria-label={getSelectRowLabel(context, selection)}
            id={row.id}
            value={row.id}
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onClick={row.getToggleSelectedHandler()}
            className={clx(
              "disabled:bg-bg-washed relative h-full w-full focus-visible:outline-hidden disabled:cursor-not-allowed",
              "before:bg-bg-white before:contents-[''] appearance-none before:absolute before:left-[5px] before:top-[5px] before:size-[6px] before:rounded-full",
            )}
          />
        </div>
      );
    },
  });
};

/**
 * The accessible name `label` gives the control in a row's cell: the string,
 * or what the function returns for the row. Without a label, the control
 * takes `fallback`.
 */
const getRowLabel = (
  { row }: CellContext<DataTableFeatures, any, unknown>,
  label: RowLabel<any> | undefined,
  fallback: string,
) => (typeof label === "function" ? label(row) : (label ?? fallback));

/**
 * The accessible name of a row's checkbox or radio: `selection.rowLabel`, or
 * "Select row N". N is the row's 1-based position among the rows the body
 * renders, so expanded sub-rows count and N follows the current sort.
 */
const getSelectRowLabel = (
  context: CellContext<DataTableFeatures, any, unknown>,
  selection: DataTableProps<any>["selection"],
) => {
  const { row, table } = context;
  const position = table.getRowModel().rows.indexOf(row) + 1;
  return getRowLabel(context, selection?.rowLabel, `Select row ${position}`);
};

const ExpandCell = <TData extends Record<string, any>>(
  context: CellContext<DataTableFeatures, TData, unknown>,
  cell?: ReactNode,
) => {
  const { row, getValue } = context;
  const { nest } = useContext(DataTableContext);
  const useDefault = !cell || JSON.stringify(cell) === JSON.stringify({});
  return (
    <div
      className="flex gap-1"
      style={{ paddingLeft: `calc(${row.depth}rem + 4px)` }}
    >
      {row.getCanExpand() && (
        <Button
          size="small"
          variant="default-ghost"
          onClick={row.getToggleExpandedHandler()}
          data-expanded={row.getIsExpanded()}
          aria-label={getRowLabel(context, nest?.expandLabel, "expand row")}
          aria-expanded={row.getIsExpanded()}
        >
          <ButtonIcon
            data-expanded={row.getIsExpanded()}
            className="transform transition-transform data-[expanded=true]:rotate-90"
          >
            <ChevronRightIcon />
          </ButtonIcon>
        </Button>
      )}
      {useDefault ? (getValue() as string) : cell}
    </div>
  );
};

/**
 * The side a column is pinned to. DataTable's `pin.left` columns are TanStack's
 * `start` region and `pin.right` columns its `end` region.
 */
const getPinnedSide = <TData extends Record<string, any>>(
  column: Column<DataTableFeatures, TData>,
): "left" | "right" | false => {
  const position = column.getIsPinned();
  if (position === "start") return "left";
  if (position === "end") return "right";
  return false;
};

const getCommonPinningStyles = <TData extends Record<string, any>>(
  column: Column<DataTableFeatures, TData>,
): CSSProperties => {
  const isPinned = column.getIsPinned();
  return {
    left: isPinned === "start" ? `${column.getStart("start")}px` : undefined,
    right: isPinned === "end" ? `${column.getAfter("end")}px` : undefined,
    width: isPinned ? column.getSize() : undefined,
  };
};

/**
 * Reserved columns for DataTable
 */
const Column = {
  Checkbox: CheckboxColumn,
  Radio: RadioColumn,
};

/**
 * Reserved cells for DataTable
 */
const Cell = {
  Expand: ExpandCell,
};

const DataTable = <TData extends Record<string, any>>(
  props: DataTableProps<TData>,
) => {
  return (
    <DataTableProvider<TData> {...props}>
      <DataTableHeader />
      <DataTableBody />
      <DataTableFooter />
    </DataTableProvider>
  );
};
DataTable.displayName = "DataTable";

export { DataTable, Cell, type ColumnDef, type DataTableFeatures };
