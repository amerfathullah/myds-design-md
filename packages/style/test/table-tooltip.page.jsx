// The page table-tooltip.test.mjs renders in Chromium. A plain Table's
// header holds text and a TableTooltip, named from its text with
// `aria-labelledby`, as the Table docs show. Four DataTables each have a Name
// column and an Age column with a header tooltip: alone, after a sort
// button, after a widen button, and after both. Last, a narrow DataTable pins
// its Name column on the left, so its Age column scrolls under it. A button
// before the tables starts the Tab order. The test bundles this file with
// esbuild.
import { useEffect, useId } from "react";
import { createRoot } from "react-dom/client";

import { DataTable } from "../../react/src/components/data-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableTooltip,
} from "../../react/src/components/table";

window.ready = [];

const people = [
  { id: "a", name: "Aminah", age: 41, position: "Clerk", office: "Kuantan" },
  { id: "b", name: "Badrul", age: 25, position: "Officer", office: "Arau" },
];

const nameColumn = { id: "name", accessorKey: "name", header: "Name" };

// A Name column, then an Age column with a tooltip and `meta`'s other options
const ageColumns = (meta) => [
  nameColumn,
  {
    id: "age",
    accessorKey: "age",
    header: "Umur",
    meta: { tooltip: "Umur dalam tahun", ...meta },
  },
];

// Each DataTable, by its `data-test`, and its Age column's `meta`
const dataTables = {
  tooltip: {},
  sort: { sortable: true },
  widen: { expandable: true },
  all: { sortable: true, expandable: true },
};

const pinnedColumns = [
  nameColumn,
  ...ageColumns({ sortable: true }).slice(1),
  { id: "position", accessorKey: "position", header: "Position" },
  { id: "office", accessorKey: "office", header: "Office" },
];

function PlainTable() {
  const labelId = useId();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nama</TableHead>
          <TableHead aria-labelledby={labelId}>
            <div className="flex items-center gap-1">
              <span id={labelId}>Kadar</span>
              <TableTooltip aria-label="Maklumat">
                Kadar faedah tahunan
              </TableTooltip>
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Aminah</TableCell>
          <TableCell>3.5%</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

function Page() {
  useEffect(() => void window.ready.push("page"), []);
  return (
    <main style={{ padding: 16, display: "grid", gap: 16 }}>
      <button type="button" data-test="before">
        Before
      </button>
      <div data-test="plain">
        <PlainTable />
      </div>
      {Object.entries(dataTables).map(([test, meta]) => (
        <div key={test} data-test={test}>
          <DataTable columns={ageColumns(meta)} data={people} />
        </div>
      ))}
      <div data-test="pinned" style={{ width: 320 }}>
        <DataTable
          columns={pinnedColumns}
          data={people}
          pin={{ left: ["name"] }}
        />
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<Page />);
