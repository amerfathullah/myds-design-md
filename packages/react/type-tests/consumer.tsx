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
} from "@amerfathullah/myds-react/data-table";
import { DateField } from "@amerfathullah/myds-react/date-field";
import { DatePicker } from "@amerfathullah/myds-react/date-picker";
import {
  DateRangePicker,
  type DateRange,
} from "@amerfathullah/myds-react/daterange-picker";
import {
  Footer,
  FooterSection,
  SiteInfo,
  SiteLink,
  SiteLinkGroup,
} from "@amerfathullah/myds-react/footer";
import { Input, InputAddon } from "@amerfathullah/myds-react/input";
import { TextArea } from "@amerfathullah/myds-react/textarea";
import { TimeField } from "@amerfathullah/myds-react/time-field";
import {
  createColumnHelper,
  type CellContext,
  type Row,
} from "@tanstack/react-table";
import { useRef } from "react";

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

// `invalid` takes a boolean or null, and an `aria-invalid` prop, as a form
// library passes it, overrides it.
export const Fields = ({ error }: { error?: string }) => (
  <>
    <DateField invalid={null} />
    <DateField invalid={Boolean(error)} size="medium" />
    <TimeField aria-invalid={error ? "true" : undefined} step={1} />
    <TimeField invalid aria-invalid={false} disabled />
    <Input invalid />
    <Input invalid={null} prepend={<InputAddon>RM</InputAddon>} />
    <Input invalid={Boolean(error)} size="medium" />
    <Input aria-invalid={error ? "true" : undefined} />
    <TextArea />
    <TextArea invalid={false} size="large" />
    <TextArea invalid aria-invalid={false} disabled />
    <TextArea invalid={null} />
  </>
);

// SiteInfo renders a div and SiteLinkGroup a nav, which takes its own name.
export const SiteFooter = () => {
  const info = useRef<HTMLDivElement>(null);
  const group = useRef<HTMLElement>(null);
  return (
    <Footer>
      <FooterSection>
        <SiteInfo ref={info}>Kementerian Digital</SiteInfo>
        <SiteLinkGroup ref={group} groupTitle="Services" linkCount={4}>
          <SiteLink href="#">Link</SiteLink>
        </SiteLinkGroup>
        <SiteLinkGroup
          groupTitle={<h2 id="help-title">Help</h2>}
          aria-labelledby="help-title"
        >
          <SiteLink href="#">Link</SiteLink>
        </SiteLinkGroup>
      </FooterSection>
    </Footer>
  );
};
