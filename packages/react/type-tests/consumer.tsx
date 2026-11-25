/**
 * Type-only smoke test: code a consumer writes against the package's public
 * entry points, which resolve to the built declarations in `dist`. `pnpm
 * check-types` compiles it against @types/react 19 and 18 after `pnpm build`.
 * `Calendar` is not a public entry point, so it is covered through the pickers.
 */
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@amerfathullah/myds-react/alert-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@amerfathullah/myds-react/breadcrumb";
import type { ButtonProps } from "@amerfathullah/myds-react/button";
import { Callout, CalloutTitle } from "@amerfathullah/myds-react/callout";
import {
  CookieBanner,
  CookieBannerAction,
  CookieBannerClose,
  CookieBannerDescription,
  CookieBannerPreferences,
  CookieBannerPreferencesTrigger,
  CookieBannerTitle,
} from "@amerfathullah/myds-react/cookie-banner";
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
  type DateRangePickerProps,
} from "@amerfathullah/myds-react/daterange-picker";
import {
  Dialog,
  DialogBody,
  DialogTitle,
} from "@amerfathullah/myds-react/dialog";
import {
  Footer,
  FooterSection,
  SiteInfo,
  SiteLink,
  SiteLinkGroup,
} from "@amerfathullah/myds-react/footer";
import {
  ThemeContext,
  ThemeProvider,
  useTheme,
  useToast,
} from "@amerfathullah/myds-react/hooks";
import {
  ChevronDownIcon,
  JataNegaraIcon,
  MalaysiaFlagIcon,
} from "@amerfathullah/myds-react/icon";
import { Input, InputAddon, InputIcon } from "@amerfathullah/myds-react/input";
import { Label } from "@amerfathullah/myds-react/label";
import {
  Masthead,
  MastheadContent,
  MastheadHeader,
  MastheadSection,
  MastheadTitle,
  MastheadTrigger,
} from "@amerfathullah/myds-react/masthead";
import {
  Navbar,
  NavbarAction,
  NavbarLogo,
  NavbarMenu,
  NavbarMenuItem,
} from "@amerfathullah/myds-react/navbar";
import {
  AutoPagination,
  Pagination,
  PaginationContent,
  PaginationContext,
  PaginationEllipsis,
  PaginationItem,
  PaginationLabel,
  PaginationPrevious,
  type AutoPaginationProps,
} from "@amerfathullah/myds-react/pagination";
import { Pill } from "@amerfathullah/myds-react/pill";
import {
  Radio,
  RadioButton,
  RadioHintText,
  RadioItem,
  RadioLabel,
} from "@amerfathullah/myds-react/radio";
import {
  SearchBar,
  SearchBarClearButton,
  SearchBarHint,
  SearchBarInput,
  SearchBarInputContainer,
  SearchBarResults,
  SearchBarResultsGroup,
  SearchBarResultsItem,
  SearchBarResultsList,
  SearchBarSearchButton,
} from "@amerfathullah/myds-react/search-bar";
import {
  Select,
  SelectContent,
  SelectFooter,
  SelectHeader,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@amerfathullah/myds-react/select";
import { Spinner } from "@amerfathullah/myds-react/spinner";
import {
  SummaryList,
  SummaryListAction,
  SummaryListAddition,
  SummaryListBody,
  SummaryListDetail,
  SummaryListHeader,
  SummaryListRow,
  SummaryListTerm,
} from "@amerfathullah/myds-react/summary-list";
import { TableTooltip } from "@amerfathullah/myds-react/table";
import { TextArea } from "@amerfathullah/myds-react/textarea";
import { ThemeSwitch } from "@amerfathullah/myds-react/theme-switch";
import { TimeField } from "@amerfathullah/myds-react/time-field";
import {
  AutoToast,
  ToastClose,
  ToastIcon,
  ToastProgress,
  ToastProvider,
  ToastRoot,
  ToastTitle,
  ToastViewport,
  type ToastEvent,
} from "@amerfathullah/myds-react/toast";
import {
  Toggle,
  ToggleThumb,
  type ToggleThumbProps,
} from "@amerfathullah/myds-react/toggle";
import { getThemeScript } from "@amerfathullah/myds-react/utils";
import {
  createColumnHelper,
  type CellContext,
  type Row,
} from "@tanstack/react-table";
import {
  createRef,
  useContext,
  useId,
  useRef,
  type ComponentProps,
  type ComponentPropsWithoutRef,
  type ForwardRefExoticComponent,
  type FunctionComponent,
  type KeyboardEvent,
  type MouseEvent,
  type RefAttributes,
  type SVGProps,
} from "react";

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
// library passes it, overrides it. DateField's and TimeField's `disabled`
// takes a boolean, as an <input>'s does.
export const Fields = ({ error }: { error?: string }) => (
  <>
    <DateField invalid={null} />
    <DateField invalid={Boolean(error)} size="medium" />
    <TimeField aria-invalid={error ? "true" : undefined} step={1} />
    <TimeField invalid aria-invalid={false} disabled />
    <DateField disabled={Boolean(error)} />
    <TimeField disabled={undefined} />
    {/* @ts-expect-error `disabled` takes no `null` */}
    <DateField disabled={null} />
    {/* @ts-expect-error `disabled` takes no `null` */}
    <TimeField disabled={null} />
    <Input invalid />
    <Input invalid={null} prepend={<InputAddon>RM</InputAddon>} />
    <Input invalid={Boolean(error)} size="medium" />
    <Input invalid={false} />
    <Input aria-invalid={error ? "true" : undefined} />
    <TextArea />
    <TextArea invalid={false} size="large" />
    <TextArea invalid aria-invalid={false} disabled />
    <TextArea invalid={null} />
  </>
);

// `disabled` takes a boolean or null, and sets the label's `data-disabled`,
// which a `data-disabled` prop overrides. Label disables nothing, so the field
// takes `disabled` too.
export const Labels = ({ locked }: { locked?: boolean }) => (
  <>
    <Label disabled htmlFor="name">
      Name
    </Label>
    <Input id="name" disabled />
    <Label disabled={false} size="small">
      Name
    </Label>
    <Label disabled={null}>Name</Label>
    <Label disabled={locked} asChild>
      <span>Name</span>
    </Label>
    <Label disabled data-disabled={false}>
      Name
    </Label>
  </>
);

// InputIcon's `position` is optional and defaults to `left`. TypeScript still
// rejects a side it doesn't list.
export const InputIcons = () => (
  <>
    <Input>
      <InputIcon>
        <ChevronDownIcon />
      </InputIcon>
    </Input>
    <Input>
      <InputIcon position={undefined}>
        <ChevronDownIcon />
      </InputIcon>
    </Input>
    <Input size="medium">
      <InputIcon position="left">
        <ChevronDownIcon />
      </InputIcon>
      <InputIcon position="right">
        <ChevronDownIcon />
      </InputIcon>
    </Input>
    <Input>
      {/* @ts-expect-error `position` is left or right */}
      <InputIcon position="top">
        <ChevronDownIcon />
      </InputIcon>
    </Input>
  </>
);

// AlertDialog's `variant` is optional and defaults to `default`. TypeScript
// still rejects `null` and names it doesn't list.
const alertBody = (
  <>
    <AlertDialogTrigger>
      <button type="button">Delete</button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogTitle>Delete the file?</AlertDialogTitle>
    </AlertDialogContent>
  </>
);

export const AlertDialogs = () => (
  <>
    <AlertDialog>{alertBody}</AlertDialog>
    <AlertDialog variant="default">{alertBody}</AlertDialog>
    <AlertDialog variant="danger" defaultOpen>
      {alertBody}
    </AlertDialog>
    {/* @ts-expect-error `variant` takes no `null` */}
    <AlertDialog variant={null}>{alertBody}</AlertDialog>
    {/* @ts-expect-error `variant` is one of the five names */}
    <AlertDialog variant="bogus">{alertBody}</AlertDialog>
  </>
);

// Select's `size` and `variant` are optional and default to `small` and
// `outline`. They still take `null`, and TypeScript rejects names they don't
// list.
const selectBody = (
  <>
    <SelectTrigger>
      <SelectValue placeholder="Pilih buah" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="apple">Epal</SelectItem>
    </SelectContent>
  </>
);

export const Selects = () => (
  <>
    <Select>{selectBody}</Select>
    <Select size="medium">{selectBody}</Select>
    <Select variant="ghost">{selectBody}</Select>
    <Select size="large" variant="outline">
      {selectBody}
    </Select>
    <Select multiple>{selectBody}</Select>
    <Select
      multiple
      defaultValue={["apple"]}
      onValueChange={(value: string[]) => void value}
    >
      {selectBody}
    </Select>
    <Select onValueChange={(value: string) => void value}>{selectBody}</Select>
    <Select size={null} variant={null}>
      {selectBody}
    </Select>
    {/* @ts-expect-error `size` is small, medium or large */}
    <Select size="xl">{selectBody}</Select>
    {/* @ts-expect-error `variant` is outline or ghost */}
    <Select variant="bogus">{selectBody}</Select>
  </>
);

// SelectHeader and SelectFooter take every prop a div takes and a div ref,
// object or callback, and TypeScript rejects a prop a div doesn't take.
export const SelectHeaderAndFooter = () => {
  const header = useRef<HTMLDivElement>(null);
  const footer = useRef<HTMLDivElement>(null);
  return (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Pilih buah" />
      </SelectTrigger>
      <SelectContent>
        <SelectHeader
          ref={header}
          id="fruit-search"
          role="search"
          aria-label="Cari buah"
          aria-describedby="fruit-hint"
          data-testid="select-header"
          title="Cari"
          tabIndex={-1}
          style={{ paddingBlock: 4 }}
          className="shadow-card"
          onClick={(event: MouseEvent<HTMLDivElement>) => void event}
          onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => void event}
        >
          <span id="fruit-hint">Taip nama buah</span>
        </SelectHeader>
        <SelectItem value="apple">Epal</SelectItem>
        <SelectFooter
          ref={footer}
          id="fruit-actions"
          role="group"
          aria-label="Tindakan"
          aria-describedby="fruit-hint"
          data-testid="select-footer"
          title="Tindakan"
          tabIndex={-1}
          style={{ paddingBlock: 4 }}
          className="shadow-card"
          onClick={(event: MouseEvent<HTMLDivElement>) => void event}
          onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => void event}
        >
          Set semula
        </SelectFooter>
        <SelectHeader ref={(node: HTMLDivElement | null) => void node} />
        <SelectFooter ref={(node: HTMLDivElement | null) => void node} />
        {/* @ts-expect-error a div takes no `bogus` */}
        <SelectHeader bogus />
        {/* @ts-expect-error a div takes no `bogus` */}
        <SelectFooter bogus />
      </SelectContent>
    </Select>
  );
};

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

// ThemeProvider takes the theme names it restores, and `getThemeScript` the
// same options, returning the script's source. ThemeContext keeps its shape,
// so an app can feed it from another theme library.
const themeScript: string = getThemeScript();
const customThemeScript: string = getThemeScript({
  storageKey: "myds-theme",
  defaultTheme: "dark",
  themes: ["light", "dark", "system"],
});
// @ts-expect-error `themes` is a list of names
getThemeScript({ themes: "dark" });

const ThemeName = () => <span>{useTheme().theme}</span>;

export const Themes = ({ resolvedTheme }: { resolvedTheme?: string }) => (
  <>
    <script dangerouslySetInnerHTML={{ __html: themeScript }} />
    <script dangerouslySetInnerHTML={{ __html: customThemeScript }} />
    <ThemeProvider>
      <ThemeSwitch />
    </ThemeProvider>
    <ThemeProvider
      storageKey="myds-theme"
      defaultTheme="dark"
      themes={["light", "dark", "system"]}
    >
      <ThemeSwitch as="select" selectLabel="Tema" />
      <ThemeSwitch toggleLabel="Tema" />
      <ThemeName />
    </ThemeProvider>
    {/* @ts-expect-error `themes` is a list of names */}
    <ThemeProvider themes="dark">
      <ThemeSwitch />
    </ThemeProvider>
    <ThemeContext.Provider
      value={{
        theme: resolvedTheme ?? "light",
        setTheme: (theme: string) => void theme,
        defaultTheme: "light",
      }}
    >
      <ThemeSwitch />
    </ThemeContext.Provider>
  </>
);

// Built-in accessible names: a control the author doesn't render takes its
// name from `closeLabel` on the component that renders it, and an icon-only
// part from its own `aria-label`
export const CloseLabels = () => (
  <>
    <Callout dismissible closeLabel="Tutup">
      <CalloutTitle>Disimpan</CalloutTitle>
    </Callout>
    <AutoToast closeLabel="Tutup" />
    <ToastClose aria-label="Tutup" />
    <CookieBanner open closeLabel="Tutup">
      <CookieBannerTitle>Kuki</CookieBannerTitle>
    </CookieBanner>
    <SearchBar>
      <SearchBarInputContainer>
        <SearchBarClearButton aria-label="Kosongkan" />
        <SearchBarSearchButton aria-label="Cari" />
      </SearchBarInputContainer>
    </SearchBar>
    {/* @ts-expect-error `closeLabel` is a string */}
    <Callout dismissible closeLabel={1} />
  </>
);

// SearchBarInput is named by its own `aria-labelledby`, then its own
// `aria-label`, then SearchBar's `label` (#178). It takes an `id`, which
// doesn't reach its <input>, and no `asChild`, which it always sets (#206).
export const SearchBarInputNames = () => {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <SearchBar label="Cari nama">
        <SearchBarInputContainer>
          <SearchBarInput
            ref={input}
            id="q"
            aria-label="Cari nama"
            aria-labelledby="nama"
            aria-describedby="petunjuk"
          />
        </SearchBarInputContainer>
      </SearchBar>
      {/* @ts-expect-error SearchBarInput takes no `asChild` */}
      <SearchBarInput asChild />
      {/* @ts-expect-error SearchBarInput takes no `asChild` */}
      <SearchBarInput asChild={false} />
      {/* @ts-expect-error SearchBar's `label` is a string */}
      <SearchBar label={1} />
    </>
  );
};

// AutoPagination names the controls it renders from its label props, and
// `pageLabel` names each page button from its number
const paging = {
  count: 100,
  limit: 10,
  page: 5,
  onPageChange: (page: number) => void page,
};

export const PaginationLabels = () => (
  <>
    <AutoPagination
      {...paging}
      type="default"
      aria-label="Penomboran"
      previousLabel="Halaman sebelumnya"
      nextLabel="Halaman seterusnya"
      pageLabel={(page: number) => `Halaman ${page}`}
      ellipsisLabel="Lebih banyak halaman"
    />
    <AutoPagination
      {...paging}
      type="simple"
      previousLabel="Sebelumnya"
      nextLabel="Seterusnya"
    />
    <AutoPagination
      {...paging}
      type="full"
      previous={<PaginationPrevious aria-label="Kembali" />}
    />
    {/* @ts-expect-error `pageLabel` is a function of the page number */}
    <AutoPagination {...paging} type="default" pageLabel="Halaman" />
  </>
);

// Pagination's and AutoPagination's `type` is optional and defaults to
// `default`. TypeScript still rejects a type they don't list, and
// PaginationContext always carries one. PaginationLabel shows `content`, any
// React node, in place of its default.
const autoPaging: AutoPaginationProps = { ...paging, maxDisplay: 4 };

const PaginationType = () => {
  const type: "default" | "simple" | "full" =
    useContext(PaginationContext).type;
  return <span>{type}</span>;
};

export const PaginationTypes = () => (
  <>
    <Pagination {...paging}>
      <PaginationLabel />
      <PaginationLabel content="Halaman 5 daripada 10" />
      <PaginationLabel content={<strong>Halaman 5</strong>} />
      <PaginationType />
    </Pagination>
    <AutoPagination {...paging} />
    <AutoPagination {...autoPaging} />
    {/* @ts-expect-error `type` is default, simple or full */}
    <Pagination {...paging} type="basic" />
    {/* @ts-expect-error `type` is default, simple or full */}
    <AutoPagination {...paging} type="basic" />
  </>
);

// DataTable names the controls it renders from `selection`, `nest` and a
// column's `meta.tooltipLabel`, `meta.sortLabel` and `meta.widenLabel`. A row
// label is a string or a function of the table's row. TableTooltip takes its
// trigger's name from `aria-label`.
export const DataTableLabels = () => (
  <>
    <DataTable
      columns={[
        {
          id: "name",
          header: "Name",
          accessorKey: "name",
          cell: Cell.Expand,
          meta: {
            sortable: true,
            expandable: true,
            sortLabel: "Isih mengikut Nama",
            widenLabel: "Lebarkan Nama",
          },
        },
        {
          id: "age",
          header: "Age",
          accessorKey: "age",
          meta: { tooltip: "Umur dalam tahun", tooltipLabel: "Maklumat umur" },
        },
      ]}
      data={data}
      nest={{
        id_by: "reports",
        expandLabel: (row) => `Kembangkan ${row.original.name}`,
      }}
      selection={{
        id_by: "id",
        mode: "checkbox",
        rowLabel: (row) => `Pilih ${row.original.name}`,
        selectAllLabel: "Pilih semua baris",
        columnLabel: "Pilihan",
      }}
    />
    <DataTable
      columns={columns}
      data={data}
      nest={{ id_by: "reports", expandLabel: "Kembangkan baris" }}
      selection={{
        id_by: "id",
        mode: "radio",
        rowLabel: "Pilih baris",
        clearLabel: "Kosongkan pilihan",
      }}
    />
    <DataTable
      columns={columns}
      data={data}
      selection={{
        id_by: "id",
        mode: "checkbox",
        // @ts-expect-error `rowLabel` returns a string
        rowLabel: (row) => row.original.age,
      }}
    />
    <DataTable
      columns={[
        {
          id: "name",
          header: "Name",
          accessorKey: "name",
          // @ts-expect-error `sortLabel` is a string
          meta: { sortable: true, sortLabel: 1 },
        },
        {
          id: "age",
          header: "Age",
          accessorKey: "age",
          // @ts-expect-error `widenLabel` is a string
          meta: { expandable: true, widenLabel: 1 },
        },
      ]}
      data={data}
    />
    <TableTooltip aria-label="Maklumat">Umur dalam tahun</TableTooltip>
    {/* @ts-expect-error `aria-label` is a string */}
    <TableTooltip aria-label={1}>Umur dalam tahun</TableTooltip>
  </>
);

// A radio DataTable's `selection.name` is the name a form submits its
// selected row under
export const DataTableRadioName = () => (
  <>
    <DataTable
      columns={columns}
      data={data}
      selection={{ id_by: "id", mode: "radio", name: "pegawai" }}
    />
    <DataTable
      columns={columns}
      data={data}
      selection={{
        id_by: "id",
        mode: "radio",
        // @ts-expect-error `name` is a string
        name: 1,
      }}
    />
  </>
);

// DataTable's `aria-labelledby` and `aria-label` name its `<table>`, and take
// strings. DataTable takes no other table attribute, and no caption.
export const DataTableName = () => {
  const headingId = useId();
  return (
    <>
      <h2 id={headingId}>Senarai pemohon</h2>
      <DataTable columns={columns} data={data} aria-labelledby={headingId} />
      <DataTable columns={columns} data={data} aria-label="Senarai pemohon" />
      <DataTable
        columns={columns}
        data={data}
        aria-label="Pemohon"
        aria-labelledby={headingId}
      />
      {/* @ts-expect-error `aria-label` is a string */}
      <DataTable columns={columns} data={data} aria-label={1} />
      {/* @ts-expect-error `aria-labelledby` is a string */}
      <DataTable columns={columns} data={data} aria-labelledby={1} />
      {/* @ts-expect-error DataTable takes no `id` */}
      <DataTable columns={columns} data={data} id="pemohon" />
      {/* @ts-expect-error DataTable takes no `title` */}
      <DataTable columns={columns} data={data} title="Senarai pemohon" />
      {/* @ts-expect-error DataTable takes no `caption` */}
      <DataTable columns={columns} data={data} caption="Senarai pemohon" />
    </>
  );
};

// TableTooltip passes the tooltip root's props to the root, and its other
// props and its ref to the trigger button. The trigger renders its own icon,
// so it takes no `asChild`.
export const TableTooltipTrigger = () => {
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <>
      <TableTooltip
        ref={trigger}
        id="umur-info"
        className="ml-2"
        type="button"
        style={{ marginInlineStart: 4 }}
        data-column="umur"
        aria-describedby="umur-hint"
        onClick={(event: MouseEvent<HTMLButtonElement>) => void event}
        open
        defaultOpen={false}
        onOpenChange={(open: boolean) => void open}
        delayDuration={0}
        disableHoverableContent
      >
        Umur dalam tahun
      </TableTooltip>
      <TableTooltip
        ref={(node: HTMLButtonElement | null) => void node}
        aria-label={undefined}
      >
        Umur dalam tahun
      </TableTooltip>
      {/* @ts-expect-error its ref is the trigger button */}
      <TableTooltip ref={createRef<HTMLDivElement>()}>
        Umur dalam tahun
      </TableTooltip>
      {/* @ts-expect-error the trigger renders its own icon */}
      <TableTooltip asChild>Umur dalam tahun</TableTooltip>
      {/* @ts-expect-error a button takes no `bogus` */}
      <TableTooltip bogus>Umur dalam tahun</TableTooltip>
    </>
  );
};

// The date pickers' calendar takes its names from `locale`, apart from the
// month view's year buttons, which take theirs from `previousYearLabel` and
// `nextYearLabel`
export const CalendarLabels = () => (
  <>
    <DatePicker
      locale="ms"
      previousYearLabel="Pergi ke tahun sebelumnya"
      nextYearLabel="Pergi ke tahun seterusnya"
    />
    <DateRangePicker
      locale="ms"
      previousYearLabel="Pergi ke tahun sebelumnya"
      nextYearLabel="Pergi ke tahun seterusnya"
    />
    {/* @ts-expect-error `previousYearLabel` is a string */}
    <DatePicker previousYearLabel={1} />
    {/* @ts-expect-error `nextYearLabel` is a string */}
    <DateRangePicker nextYearLabel={1} />
  </>
);

// The dialogs and popovers the date pickers' calendars open in take their
// names from `calendarLabel`, and `fromCalendarLabel` / `toCalendarLabel`
// (#169)
export const CalendarDialogLabels = () => (
  <>
    <DatePicker locale="ms" calendarLabel="Pilih tarikh" />
    <DateRangePicker
      locale="ms"
      fromCalendarLabel="Pilih tarikh mula"
      toCalendarLabel="Pilih tarikh akhir"
    />
    {/* @ts-expect-error `calendarLabel` is a string */}
    <DatePicker calendarLabel={1} />
    {/* @ts-expect-error `fromCalendarLabel` is a string */}
    <DateRangePicker fromCalendarLabel={1} />
    {/* @ts-expect-error `toCalendarLabel` is a string */}
    <DateRangePicker toCalendarLabel={1} />
    {/* @ts-expect-error DateRangePicker's are `fromCalendarLabel` and `toCalendarLabel` */}
    <DateRangePicker calendarLabel="Pilih tarikh" />
  </>
);

// The date pickers' triggers take their names from `aria-labelledby`, the id
// of a Label, or from `aria-label`, and take `aria-describedby`. The pickers
// take no `id`, so a Label's `htmlFor` can't name them (ADR-0011).
const rangeNames: DateRangePickerProps = {
  "aria-labelledby": "travel",
  "aria-label": "Tarikh perjalanan",
  "aria-describedby": "travel-hint",
};

export const DatePickerNames = () => (
  <>
    <Label id="dob">Date of birth</Label>
    <p id="dob-hint">No earlier than 1 January 1950</p>
    <DatePicker aria-labelledby="dob" aria-describedby="dob-hint" />
    <DatePicker locale="ms" aria-label="Tarikh lahir" />
    <Label id="travel">Travel dates</Label>
    <p id="travel-hint">Up to 30 days</p>
    <DateRangePicker aria-labelledby="travel" aria-describedby="travel-hint" />
    <DateRangePicker locale="ms" aria-label="Tarikh perjalanan" />
    <DateRangePicker {...rangeNames} />
    {/* @ts-expect-error the pickers take no `id` */}
    <DatePicker id="dob" />
    {/* @ts-expect-error the pickers take no `id` */}
    <DateRangePicker id="travel" />
    {/* @ts-expect-error `aria-labelledby` is a string */}
    <DatePicker aria-labelledby={1} />
    {/* @ts-expect-error `aria-label` is a string */}
    <DatePicker aria-label={1} />
    {/* @ts-expect-error `aria-describedby` is a string */}
    <DatePicker aria-describedby={1} />
    {/* @ts-expect-error `aria-labelledby` is a string */}
    <DateRangePicker aria-labelledby={1} />
    {/* @ts-expect-error `aria-label` is a string */}
    <DateRangePicker aria-label={1} />
    {/* @ts-expect-error `aria-describedby` is a string */}
    <DateRangePicker aria-describedby={1} />
  </>
);

// DialogBody, AlertDialogContent and Pill take `closeLabel` for the close
// button they render, and AutoToast takes `viewportLabel` and `announceLabel`
// for its region and the word before each announcement. SearchBarResultsList
// takes its name from its own `aria-label`.
export const CloseAndRegionLabels = () => (
  <>
    <Dialog open>
      <DialogBody closeLabel="Tutup">
        <DialogTitle>Padam fail?</DialogTitle>
      </DialogBody>
    </Dialog>
    <AlertDialog variant="danger" open>
      <AlertDialogContent closeLabel="Tutup">
        <AlertDialogTitle>Padam fail?</AlertDialogTitle>
      </AlertDialogContent>
    </AlertDialog>
    <Pill onDismiss={() => {}} closeLabel="Tutup">
      Johor
    </Pill>
    <AutoToast
      viewportLabel="Pemberitahuan ({hotkey})"
      announceLabel="Pemberitahuan"
    />
    <SearchBar>
      <SearchBarResults open>
        <SearchBarResultsList aria-label="Cadangan" />
      </SearchBarResults>
    </SearchBar>
    {/* @ts-expect-error `closeLabel` is a string */}
    <Pill onDismiss={() => {}} closeLabel={1}>
      Johor
    </Pill>
  </>
);

// NavbarMenu's `<nav>` takes its name from `aria-label` (default "Main") or
// from the element `aria-labelledby` names. NavbarMenu takes no other
// NavigationMenu props.
export const NavbarMenuNames = () => (
  <Navbar>
    <h2 id="menu-title">Menu utama</h2>
    <NavbarMenu aria-label="Utama">
      <NavbarMenuItem href="/">Utama</NavbarMenuItem>
    </NavbarMenu>
    <NavbarMenu aria-labelledby="menu-title">
      <NavbarMenuItem href="/">Utama</NavbarMenuItem>
    </NavbarMenu>
    {/* @ts-expect-error `aria-label` is a string */}
    <NavbarMenu aria-label={1}>
      <NavbarMenuItem href="/">Utama</NavbarMenuItem>
    </NavbarMenu>
    {/* @ts-expect-error `orientation` is NavigationMenu's, not NavbarMenu's */}
    <NavbarMenu orientation="vertical">
      <NavbarMenuItem href="/">Utama</NavbarMenuItem>
    </NavbarMenu>
  </Navbar>
);

// Icons take an SVG's props. The national marks are deprecated on `/icon` and
// leave it at the next major (ADR-0007), so these two imports, and this test,
// stop compiling then.
export const Icons = () => (
  <>
    <ChevronDownIcon className="size-4" aria-hidden />
    <MalaysiaFlagIcon className="h-4 w-auto" />
    <JataNegaraIcon width={32} height={32} />
  </>
);

// Each icon, the deprecated national marks too, forwards its ref to its
// `<svg>` (#215), so a ref works on React 18 too. The ref is typed as an
// `<svg>`'s, so TypeScript refuses an HTML element's.
export const IconRefs = () => {
  const svg = useRef<SVGSVGElement>(null);
  const div = createRef<HTMLDivElement>();
  return (
    <>
      <ChevronDownIcon ref={svg} />
      <ChevronDownIcon ref={(node: SVGSVGElement | null) => void node} />
      <MalaysiaFlagIcon ref={svg} />
      <JataNegaraIcon ref={createRef<SVGSVGElement>()} />
      {/* @ts-expect-error An icon's ref is its `<svg>`, not a `<div>` */}
      <ChevronDownIcon ref={div} />
    </>
  );
};

// Each icon is built as a forwardRef component, and still assigns to the
// function component type it had. The deprecated national marks keep that
// type until the next major removes them.
export const IconTypes: ForwardRefExoticComponent<SVGProps<SVGSVGElement>>[] = [
  ChevronDownIcon,
];
export const IconsAsTheirOldType: FunctionComponent<SVGProps<SVGSVGElement>>[] =
  [ChevronDownIcon, MalaysiaFlagIcon, JataNegaraIcon];

// The Switch takes its name from a Label's `htmlFor` (Toggle's `id`), or from
// `aria-label` or `aria-labelledby` on ToggleThumb, and has no default name.
// ToggleThumb also takes `aria-describedby`, and no other input props.
const thumbProps: ToggleThumbProps = {
  "aria-label": "Pemberitahuan e-mel",
  "aria-labelledby": "notify-title",
  "aria-describedby": "notify-hint",
};

export const Switches = () => (
  <>
    <Label htmlFor="notify">Email notifications</Label>
    <Toggle id="notify" onCheckedChange={(checked: boolean) => void checked}>
      <ToggleThumb />
    </Toggle>
    <Toggle size="small" defaultChecked>
      <ToggleThumb aria-label="Pemberitahuan e-mel" />
    </Toggle>
    <h3 id="notify-title">Pemberitahuan e-mel</h3>
    <p id="notify-hint">Disimpan secara automatik</p>
    <Toggle disabled>
      <ToggleThumb
        aria-labelledby="notify-title"
        aria-describedby="notify-hint"
        className="mt-1"
      />
    </Toggle>
    <Toggle>
      <ToggleThumb {...thumbProps} />
    </Toggle>
    <Toggle>
      {/* @ts-expect-error `aria-label` is a string */}
      <ToggleThumb aria-label={1} />
    </Toggle>
    <Toggle>
      {/* @ts-expect-error `name` is out of ToggleThumb's scope */}
      <ToggleThumb name="notify" />
    </Toggle>
  </>
);

// CookieBanner is a page region: section attributes and a ref reach its
// `<section>`, and `modal` still compiles, though it does nothing. Its parts
// keep their prop and ref types.
export const CookieBannerRegion = () => {
  const region = useRef<HTMLElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const description = useRef<HTMLParagraphElement>(null);
  const preferences = useRef<HTMLParagraphElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  return (
    <>
      <CookieBanner
        ref={region}
        id="kuki"
        aria-label="Kuki"
        style={{ zIndex: 40 }}
        data-test="cookie-banner"
        defaultOpen
        modal={false}
        closeLabel="Tutup"
        onOpenChange={(open: boolean) => void open}
      >
        <CookieBannerTitle ref={title}>Kuki</CookieBannerTitle>
        <CookieBannerDescription ref={description}>
          Laman ini menggunakan kuki.
        </CookieBannerDescription>
        <CookieBannerPreferences ref={preferences} className="gap-3" />
        <CookieBannerPreferences asChild>
          <fieldset />
        </CookieBannerPreferences>
        <CookieBannerAction>
          <CookieBannerClose
            ref={close}
            onClick={(event) => event.preventDefault()}
          >
            Terima semua
          </CookieBannerClose>
          <CookieBannerPreferencesTrigger
            onClick={(event) => event.preventDefault()}
          >
            Sesuaikan
          </CookieBannerPreferencesTrigger>
        </CookieBannerAction>
      </CookieBanner>
      <CookieBanner open onOpenChange={(open: boolean) => void open} modal>
        <CookieBannerTitle asChild>
          <h3>Kuki</h3>
        </CookieBannerTitle>
      </CookieBanner>
      {/* @ts-expect-error Radix dialog props no longer reach the banner */}
      <CookieBanner onInteractOutside={() => {}} />
    </>
  );
};

// SummaryListHeader is an `<h2>` by default, or the heading it's given with
// `asChild`, and its ref is that heading. Code written for the `<div>` its
// props used to be typed as still compiles: a `<div>` ref, a `<div>` event
// handler, spread `<div>` props, and its old component type.
export const SummaryListTitle = () => {
  const heading = useRef<HTMLHeadingElement>(null);
  const div = createRef<HTMLDivElement>();
  return (
    <SummaryList>
      <SummaryListHeader>Permohonan</SummaryListHeader>
      <SummaryListHeader asChild>
        <h3>Permohonan</h3>
      </SummaryListHeader>
      <SummaryListHeader ref={heading}>Permohonan</SummaryListHeader>
      <SummaryListHeader ref={div}>Permohonan</SummaryListHeader>
      <SummaryListHeader
        onClick={(event: MouseEvent<HTMLDivElement>) => event.preventDefault()}
      >
        Permohonan
      </SummaryListHeader>
      {/* @ts-expect-error `asChild` is the one way to choose its element */}
      <SummaryListHeader as="h3">Permohonan</SummaryListHeader>
      {/* @ts-expect-error `asChild` is the one way to choose its element */}
      <SummaryListHeader level={3}>Permohonan</SummaryListHeader>
    </SummaryList>
  );
};

export const SummaryListTitleFromDivProps = (props: ComponentProps<"div">) => (
  <SummaryListHeader {...props} />
);

export const SummaryListTitleAsDivComponent: FunctionComponent<
  ComponentProps<"div">
> = SummaryListHeader;

// Every other SummaryList part forwards its ref to the element it renders
// (#209): the list's `<div>`, the body's `<table>` (not its `<tbody>`), the
// row's `<tr>`, the term's `<th>` and the other cells' `<td>`. Each cell's ref,
// the term's included, is an `HTMLTableCellElement`, as the term keeps its
// `<td>` props. Each part's old component type still holds it.
export const SummaryListRefs = () => {
  const list = useRef<HTMLDivElement>(null);
  const body = createRef<HTMLTableElement>();
  const row = useRef<HTMLTableRowElement>(null);
  const term = useRef<HTMLTableCellElement>(null);
  const detail = useRef<HTMLTableCellElement>(null);
  const action = useRef<HTMLTableCellElement>(null);
  const addition = useRef<HTMLTableCellElement>(null);
  const div = createRef<HTMLDivElement>();
  return (
    <SummaryList ref={list}>
      <SummaryListBody ref={body}>
        <SummaryListRow ref={row}>
          <SummaryListTerm ref={term}>Nama</SummaryListTerm>
          <SummaryListDetail ref={detail}>Aminah</SummaryListDetail>
          <SummaryListAction ref={action}>Ubah</SummaryListAction>
          <SummaryListAddition ref={addition}>Disahkan</SummaryListAddition>
        </SummaryListRow>
        <SummaryListRow
          ref={(element: HTMLTableRowElement | null) => void element}
        >
          <SummaryListTerm>Status</SummaryListTerm>
          <SummaryListDetail>Lulus</SummaryListDetail>
          <SummaryListAction
            ref={(cell: HTMLTableCellElement | null) => void cell}
          />
        </SummaryListRow>
      </SummaryListBody>
      {/* @ts-expect-error The body's ref is its `<table>`, not a `<div>` */}
      <SummaryListBody ref={div} />
    </SummaryList>
  );
};

export const SummaryListPartsAsTheirOldTypes: [
  FunctionComponent<ComponentProps<"div">>,
  FunctionComponent<ComponentProps<"table">>,
  FunctionComponent<ComponentProps<"tr">>,
  ...FunctionComponent<ComponentProps<"td">>[],
] = [
  SummaryList,
  SummaryListBody,
  SummaryListRow,
  SummaryListTerm,
  SummaryListDetail,
  SummaryListAction,
  SummaryListAddition,
];

// Each part's type as it's built: its element's props, ref included
export const SummaryListPartTypes: [
  ForwardRefExoticComponent<ComponentProps<"div">>,
  ForwardRefExoticComponent<ComponentProps<"table">>,
  ForwardRefExoticComponent<ComponentProps<"tr">>,
  ...ForwardRefExoticComponent<ComponentProps<"td">>[],
] = [
  SummaryList,
  SummaryListBody,
  SummaryListRow,
  SummaryListTerm,
  SummaryListDetail,
  SummaryListAction,
  SummaryListAddition,
];

// The parts of Masthead, Navbar, DateField, TimeField, Spinner, Breadcrumb,
// Pagination, Radio and SearchBar forward their refs to the element they
// render (#212), so a ref works on React 18 too. Each ref is typed as that
// element's. TypeScript compares elements by their members, so it refuses a
// ref only to an element unlike that one, such as a `<table>` or an `<svg>`.
export const MastheadRefs = () => {
  const masthead = useRef<HTMLDivElement>(null);
  const header = createRef<HTMLDivElement>();
  const title = useRef<HTMLParagraphElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const content = createRef<HTMLDivElement>();
  const section = useRef<HTMLDivElement>(null);
  return (
    <Masthead ref={masthead}>
      <MastheadHeader ref={header}>
        <MastheadTitle ref={title}>
          Laman Web Rasmi Kerajaan Malaysia
        </MastheadTitle>
        <MastheadTrigger ref={trigger}>
          Ini cara anda mengetahuinya
        </MastheadTrigger>
      </MastheadHeader>
      <MastheadContent ref={content}>
        <MastheadSection
          ref={section}
          icon={<ChevronDownIcon />}
          title="Laman web rasmi berakhir dengan .gov.my"
        >
          Jika pautan tidak berakhir dengan .gov.my, keluar segera.
        </MastheadSection>
        <MastheadSection
          ref={(node: HTMLDivElement | null) => void node}
          icon={<ChevronDownIcon />}
          title="Laman web selamat menggunakan HTTPS"
        >
          Cari ikon kunci atau https://.
        </MastheadSection>
      </MastheadContent>
    </Masthead>
  );
};

export const NavbarRefs = () => {
  const header = useRef<HTMLElement>(null);
  const logo = createRef<HTMLAnchorElement>();
  const item = useRef<HTMLLIElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  return (
    <>
      <Navbar ref={header}>
        <NavbarLogo ref={logo} src="/jata-negara.png" alt="Jata Negara">
          Kementerian Digital
        </NavbarLogo>
        <NavbarMenu>
          <NavbarMenuItem ref={item} href="/perkhidmatan">
            Perkhidmatan
          </NavbarMenuItem>
          <NavbarMenuItem
            ref={(node: HTMLLIElement | null) => void node}
            href="/hubungi"
          >
            Hubungi
          </NavbarMenuItem>
        </NavbarMenu>
        <NavbarAction ref={toggle} />
      </Navbar>
      {/* @ts-expect-error The navbar's ref is its `<header>`, not an `<svg>` */}
      <Navbar ref={createRef<SVGSVGElement>()} />
    </>
  );
};

export const SpinnerRefs = () => {
  const spinner = createRef<HTMLDivElement>();
  return (
    <>
      <Spinner ref={spinner} />
      <Spinner ref={(node: HTMLDivElement | null) => void node} show={false} />
    </>
  );
};

export const FieldRefs = () => {
  const date = useRef<HTMLInputElement>(null);
  return (
    <>
      <DateField ref={date} />
      <TimeField ref={(input: HTMLInputElement | null) => input?.focus()} />
      {/* @ts-expect-error The field's ref is its `<input>`, not a `<table>` */}
      <DateField ref={createRef<HTMLTableElement>()} />
    </>
  );
};

export const BreadcrumbAndPaginationRefs = () => {
  const separator = useRef<HTMLLIElement>(null);
  const ellipsis = createRef<HTMLSpanElement>();
  return (
    <>
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbPage>Utama</BreadcrumbPage>
        </BreadcrumbItem>
        <BreadcrumbSeparator ref={separator} />
        <BreadcrumbSeparator ref={(node: HTMLLIElement | null) => void node} />
      </Breadcrumb>
      <Pagination {...paging}>
        <PaginationContent>
          <PaginationItem>
            <PaginationEllipsis ref={ellipsis} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  );
};

export const RadioRefs = () => {
  const item = useRef<HTMLDivElement>(null);
  const label = createRef<HTMLLabelElement>();
  const hint = useRef<HTMLDivElement>(null);
  return (
    <Radio>
      <RadioItem ref={item}>
        <RadioButton value="email" id="email" />
        <RadioLabel ref={label} htmlFor="email">
          E-mel
        </RadioLabel>
        <RadioHintText ref={hint}>Kami akan menghantar e-mel.</RadioHintText>
      </RadioItem>
      <RadioItem ref={(node: HTMLDivElement | null) => void node}>
        {/* @ts-expect-error The label's ref is its `<label>`, not a `<table>` */}
        <RadioLabel ref={createRef<HTMLTableElement>()}>SMS</RadioLabel>
      </RadioItem>
    </Radio>
  );
};

export const SearchBarRefs = () => {
  const root = useRef<HTMLDivElement>(null);
  const container = createRef<HTMLDivElement>();
  const input = useRef<HTMLInputElement>(null);
  const hint = useRef<HTMLDivElement>(null);
  const clear = createRef<HTMLButtonElement>();
  const search = useRef<HTMLButtonElement>(null);
  const results = useRef<HTMLDivElement>(null);
  const list = createRef<HTMLDivElement>();
  const group = useRef<HTMLDivElement>(null);
  const item = useRef<HTMLDivElement>(null);
  return (
    <SearchBar ref={root}>
      <SearchBarInputContainer ref={container}>
        <SearchBarInput ref={input} aria-label="Cari nama" />
        <SearchBarHint ref={hint}>Tekan / untuk mencari</SearchBarHint>
        <SearchBarClearButton ref={clear} />
        <SearchBarSearchButton ref={search} />
      </SearchBarInputContainer>
      <SearchBarResults ref={results} open>
        <SearchBarResultsList ref={list}>
          <SearchBarResultsGroup ref={group} heading="Tokoh">
            <SearchBarResultsItem ref={item} value="Tunku Abdul Rahman">
              Tunku Abdul Rahman
            </SearchBarResultsItem>
            <SearchBarResultsItem
              ref={(node: HTMLDivElement | null) => void node}
              value="Tun Abdul Razak"
            >
              Tun Abdul Razak
            </SearchBarResultsItem>
          </SearchBarResultsGroup>
        </SearchBarResultsList>
      </SearchBarResults>
    </SearchBar>
  );
};

// Their props types don't change, so each part's old component type still
// holds it
export const ForwardingPartsAsTheirOldTypes: [
  FunctionComponent<ComponentProps<"div">>,
  FunctionComponent<ComponentProps<"div">>,
  FunctionComponent<ComponentProps<"p">>,
  FunctionComponent<ComponentProps<"button">>,
  FunctionComponent<ComponentProps<typeof MastheadContent>>,
  FunctionComponent<ComponentProps<typeof MastheadSection>>,
  FunctionComponent<ComponentProps<"header">>,
  FunctionComponent<ComponentProps<typeof NavbarLogo>>,
  FunctionComponent<ComponentProps<typeof NavbarMenuItem>>,
  FunctionComponent<ComponentProps<typeof NavbarAction>>,
  FunctionComponent<ComponentProps<typeof DateField>>,
  FunctionComponent<ComponentProps<typeof TimeField>>,
  FunctionComponent<ComponentProps<typeof Spinner>>,
  FunctionComponent<ComponentProps<"li">>,
  FunctionComponent<ComponentProps<"span">>,
  FunctionComponent<ComponentProps<"div"> & { disabled?: boolean }>,
  FunctionComponent<ComponentProps<"label">>,
  FunctionComponent<ComponentProps<typeof RadioHintText>>,
  FunctionComponent<ComponentProps<typeof SearchBar>>,
  FunctionComponent<ComponentProps<"div">>,
  FunctionComponent<ComponentProps<typeof SearchBarInput>>,
  FunctionComponent<ButtonProps>,
  FunctionComponent<ButtonProps>,
  FunctionComponent<ComponentProps<"div">>,
  FunctionComponent<ComponentProps<"div"> & { open: boolean }>,
  FunctionComponent<ComponentProps<typeof SearchBarResultsList>>,
  FunctionComponent<ComponentProps<typeof SearchBarResultsGroup>>,
  FunctionComponent<ComponentProps<typeof SearchBarResultsItem>>,
] = [
  Masthead,
  MastheadHeader,
  MastheadTitle,
  MastheadTrigger,
  MastheadContent,
  MastheadSection,
  Navbar,
  NavbarLogo,
  NavbarMenuItem,
  NavbarAction,
  DateField,
  TimeField,
  Spinner,
  BreadcrumbSeparator,
  PaginationEllipsis,
  RadioItem,
  RadioLabel,
  RadioHintText,
  SearchBar,
  SearchBarInputContainer,
  SearchBarInput,
  SearchBarSearchButton,
  SearchBarClearButton,
  SearchBarHint,
  SearchBarResults,
  SearchBarResultsList,
  SearchBarResultsGroup,
  SearchBarResultsItem,
];

// Each part's type as it's built: its props, ref included
export const ForwardingPartTypes: [
  ForwardRefExoticComponent<ComponentProps<"div">>,
  ForwardRefExoticComponent<ComponentProps<"div">>,
  ForwardRefExoticComponent<ComponentProps<"p">>,
  ForwardRefExoticComponent<ComponentProps<"button">>,
  ForwardRefExoticComponent<ComponentProps<typeof MastheadContent>>,
  ForwardRefExoticComponent<ComponentProps<typeof MastheadSection>>,
  ForwardRefExoticComponent<ComponentProps<"header">>,
  ForwardRefExoticComponent<ComponentProps<typeof NavbarLogo>>,
  ForwardRefExoticComponent<ComponentProps<typeof NavbarMenuItem>>,
  ForwardRefExoticComponent<ComponentProps<typeof NavbarAction>>,
  ForwardRefExoticComponent<ComponentProps<typeof DateField>>,
  ForwardRefExoticComponent<ComponentProps<typeof TimeField>>,
  ForwardRefExoticComponent<ComponentProps<typeof Spinner>>,
  ForwardRefExoticComponent<ComponentProps<"li">>,
  ForwardRefExoticComponent<ComponentProps<"span">>,
  ForwardRefExoticComponent<ComponentProps<"div"> & { disabled?: boolean }>,
  ForwardRefExoticComponent<ComponentProps<"label">>,
  ForwardRefExoticComponent<ComponentProps<typeof RadioHintText>>,
  ForwardRefExoticComponent<ComponentProps<typeof SearchBar>>,
  ForwardRefExoticComponent<ComponentProps<"div">>,
  ForwardRefExoticComponent<ComponentProps<typeof SearchBarInput>>,
  ForwardRefExoticComponent<ButtonProps>,
  ForwardRefExoticComponent<ButtonProps>,
  ForwardRefExoticComponent<ComponentProps<"div">>,
  ForwardRefExoticComponent<ComponentProps<"div"> & { open: boolean }>,
  ForwardRefExoticComponent<ComponentProps<typeof SearchBarResultsList>>,
  ForwardRefExoticComponent<ComponentProps<typeof SearchBarResultsGroup>>,
  ForwardRefExoticComponent<ComponentProps<typeof SearchBarResultsItem>>,
] = [
  Masthead,
  MastheadHeader,
  MastheadTitle,
  MastheadTrigger,
  MastheadContent,
  MastheadSection,
  Navbar,
  NavbarLogo,
  NavbarMenuItem,
  NavbarAction,
  DateField,
  TimeField,
  Spinner,
  BreadcrumbSeparator,
  PaginationEllipsis,
  RadioItem,
  RadioLabel,
  RadioHintText,
  SearchBar,
  SearchBarInputContainer,
  SearchBarInput,
  SearchBarSearchButton,
  SearchBarClearButton,
  SearchBarHint,
  SearchBarResults,
  SearchBarResultsList,
  SearchBarResultsGroup,
  SearchBarResultsItem,
];

// ToastIcon and ToastProgress are exported for a toast composed by hand
// (#172). Each takes a `<div>`'s props but `children`, as each draws its own
// content, and its ref is its outer `<div>`.
type ToastPart = ForwardRefExoticComponent<
  Omit<ComponentPropsWithoutRef<"div">, "children"> &
    RefAttributes<HTMLDivElement>
>;
export const ToastPartTypes: ToastPart[] = [ToastIcon, ToastProgress];

export const ToastParts = () => {
  const icon = useRef<HTMLDivElement>(null);
  const bar = createRef<HTMLDivElement>();
  return (
    <ToastProvider>
      <ToastRoot variant="success" duration={8000}>
        <ToastIcon ref={icon} className="mt-1" style={{ marginTop: 2 }} />
        <ToastTitle>Disimpan</ToastTitle>
        <ToastClose aria-label="Tutup" />
        <ToastProgress
          ref={bar}
          className="opacity-50"
          style={{ opacity: 0.5 }}
          data-part="countdown"
        />
        {/* @ts-expect-error ToastIcon draws its own icon */}
        <ToastIcon>!</ToastIcon>
        {/* @ts-expect-error ToastProgress draws its own bar */}
        <ToastProgress>
          <span />
        </ToastProgress>
        {/* @ts-expect-error its ref is its outer `<div>` */}
        <ToastIcon ref={createRef<HTMLButtonElement>()} />
        {/* @ts-expect-error its ref is its outer `<div>` */}
        <ToastProgress ref={createRef<HTMLButtonElement>()} />
      </ToastRoot>
      <ToastViewport />
    </ToastProvider>
  );
};

// `type` sets how urgently screen readers announce a toast (#198). `toast()`
// takes it, as do a hand-composed ToastRoot and AutoToast, which sets it for
// every toast. It is Radix's `"foreground"` or `"background"`, or undefined.
export const ToastUrgency = () => {
  const { toast } = useToast();
  const later: ToastEvent = {
    variant: "error",
    title: "Ralat: Fail tidak dimuat naik",
    type: "background",
  };
  return (
    <>
      <button
        onClick={() =>
          toast({ variant: "info", title: "x", type: "background" })
        }
      />
      <button onClick={() => toast(later)} />
      <button
        onClick={() => toast({ variant: "info", title: "x", type: undefined })}
      />
      <button
        onClick={() =>
          // @ts-expect-error `type` is "foreground" or "background"
          toast({ variant: "info", title: "x", type: "urgent" })
        }
      />
      <AutoToast type="foreground" />
      <ToastProvider>
        <ToastRoot variant="warning" type="foreground">
          <ToastTitle>Amaran: Sesi anda akan tamat</ToastTitle>
        </ToastRoot>
        <ToastRoot variant="error" type={undefined}>
          <ToastTitle>Ralat: Borang tidak dihantar</ToastTitle>
        </ToastRoot>
        {/* @ts-expect-error `type` is "foreground" or "background" */}
        <ToastRoot variant="error" type="urgent" />
        <ToastViewport />
      </ToastProvider>
      {/* @ts-expect-error `type` is "foreground" or "background" */}
      <AutoToast type="urgent" />
    </>
  );
};

// RadioHintText renders a `<div>` that describes the RadioButton in its
// RadioItem (#173). It takes a `<div>`'s attributes, an `id` among them, and
// `htmlFor` and `form` still compile, deprecated and ignored. Code written for
// the `<label>` it used to render still compiles: a ref typed for a
// `<label>`, and an event handler typed for one.
export const RadioHint = () => {
  const label = useRef<HTMLLabelElement>(null);
  const element = useRef<HTMLElement>(null);
  const div = createRef<HTMLDivElement>();
  return (
    <Radio defaultValue="email">
      <RadioItem>
        <RadioButton value="email" id="email" aria-describedby="email-error" />
        <div className="grid">
          <RadioLabel htmlFor="email">E-mel</RadioLabel>
          <RadioHintText htmlFor="email" form="notifications">
            Kami akan menghantar e-mel.
          </RadioHintText>
          <RadioHintText
            ref={element}
            id="email-hint"
            className="mt-1"
            style={{ marginTop: 4 }}
            title="Petunjuk"
            aria-live="polite"
            data-part="hint"
            onClick={(event: MouseEvent<HTMLDivElement>) =>
              event.preventDefault()
            }
          >
            Semak folder spam anda.
          </RadioHintText>
          <RadioHintText
            ref={label}
            onClick={(event: MouseEvent<HTMLLabelElement>) =>
              event.preventDefault()
            }
          >
            Sekali sehari.
          </RadioHintText>
          <RadioHintText ref={div}>Percuma.</RadioHintText>
          <RadioHintText ref={(node: HTMLLabelElement | null) => void node}>
            Boleh dibatalkan.
          </RadioHintText>
          {/* @ts-expect-error its ref is an HTML element */}
          <RadioHintText ref={createRef<SVGSVGElement>()}>Tidak.</RadioHintText>
        </div>
      </RadioItem>
    </Radio>
  );
};
