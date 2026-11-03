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
} from "@amerfathullah/myds-react/hooks";
import {
  ChevronDownIcon,
  JataNegaraIcon,
  MalaysiaFlagIcon,
} from "@amerfathullah/myds-react/icon";
import { Input, InputAddon } from "@amerfathullah/myds-react/input";
import { Label } from "@amerfathullah/myds-react/label";
import {
  Navbar,
  NavbarMenu,
  NavbarMenuItem,
} from "@amerfathullah/myds-react/navbar";
import {
  AutoPagination,
  PaginationPrevious,
} from "@amerfathullah/myds-react/pagination";
import { Pill } from "@amerfathullah/myds-react/pill";
import {
  SearchBar,
  SearchBarClearButton,
  SearchBarInputContainer,
  SearchBarResults,
  SearchBarResultsList,
  SearchBarSearchButton,
} from "@amerfathullah/myds-react/search-bar";
import { TableTooltip } from "@amerfathullah/myds-react/table";
import { TextArea } from "@amerfathullah/myds-react/textarea";
import { ThemeSwitch } from "@amerfathullah/myds-react/theme-switch";
import { TimeField } from "@amerfathullah/myds-react/time-field";
import { AutoToast, ToastClose } from "@amerfathullah/myds-react/toast";
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
