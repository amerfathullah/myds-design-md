/**
 * Type-only smoke test: code a consumer writes against the package's public
 * entry points, which resolve to the built declarations in `dist`. `pnpm
 * check-types` compiles it against @types/react 19 and 18 after `pnpm build`.
 * `Calendar` is not a public entry point, so it is covered through the pickers.
 */
import {
  Cell,
  DataTable,
  type ColumnDef,
  type DataTableFeatures,
} from "@govtechmy/myds-react/data-table";
import { DatePicker } from "@govtechmy/myds-react/date-picker";
import {
  DateRangePicker,
  type DateRange,
} from "@govtechmy/myds-react/daterange-picker";
import {
  createColumnHelper,
  type CellContext,
  type Row,
} from "@tanstack/react-table";

type Employee = {
  id: string;
  name: string;
  age: number;
  reports?: Employee[];
};

const columns: ColumnDef<Employee>[] = [
  {
    id: "name",
    header: "Name",
    accessorKey: "name",
    cell: Cell.Expand,
    meta: { expandable: true, className: { header: "w-1/3" } },
  },
  {
    id: "age",
    header: () => <span>Age</span>,
    accessorKey: "age",
    sortFn: "basic",
    meta: { sortable: true, tooltip: <span>In years</span> },
    footer: ({ table }) => `Employees: ${table.getRowCount()}`,
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <span data-selected={row.getIsSelected()}>
        {row.getValue<string>("name")}
      </span>
    ),
  },
];

// TanStack Table 9 types take DataTableFeatures first.
const canSelect = (row: Row<DataTableFeatures, Employee>) =>
  row.original.age >= 18;
const renderAge = ({
  getValue,
  column,
}: CellContext<DataTableFeatures, Employee, number>) =>
  `${getValue()} (${column.getIsSorted() || "unsorted"})`;

const helper = createColumnHelper<DataTableFeatures, Employee>();
const helperColumns = helper.columns([
  helper.accessor("name", { header: "Name", meta: { expandable: true } }),
  helper.accessor("age", {
    header: "Age",
    sortFn: "alphanumeric",
    cell: renderAge,
  }),
]);

const data: Employee[] = [
  { id: "1", name: "Aminah", age: 34, reports: [] },
  { id: "2", name: "Ravi", age: 17 },
];

export const Table = () => (
  <DataTable
    columns={columns}
    data={data}
    loading={false}
    emptyState={<p>No employees</p>}
    nest={{ id_by: "reports" }}
    pin={{ left: ["name"], right: ["status"] }}
    selection={{
      id_by: "id",
      mode: "checkbox",
      enableRowSelection: canSelect,
      onSelectionChange: (ids: string[]) => void ids,
    }}
  />
);

export const HelperTable = () => (
  <DataTable columns={helperColumns} data={data} pin={{ left: ["name"] }} />
);

export const Dates = () => {
  const range: DateRange = { from: new Date(2026, 0, 1), to: undefined };
  return (
    <>
      <DatePicker
        locale="ms"
        defaultValue={new Date(2026, 0, 15)}
        disabled={[{ before: new Date(2026, 0, 1) }, { dayOfWeek: [0, 6] }]}
        onValueChange={(date: Date) => void date}
        minYear={2000}
        maxYear={2030}
        yearOrder="desc"
      />
      <DateRangePicker
        defaultValue={range}
        disabled={{ after: new Date(2026, 11, 31) }}
        onValueChange={(value: DateRange) => void value}
        fromLabel="Dari"
        toLabel="Hingga"
      />
    </>
  );
};
