// The page data-table-widen.test.mjs renders in Chromium, in a development
// build, so React reports a repeated key. Each table sits in a wrapper whose
// `data-test` names it:
// - `docs`: the docs' Data & Columns table, whose Action column holds an Edit
//   button.
// - `kinds`: a widenable column of each kind, with long text and a footer:
//   one defined with an `id`, one with `accessorKey` only, a leaf inside a
//   grouped header, and, once `window.addColumn()` is called, one added after
//   mount.
// - `groups`: the docs' grouped columns, whose Application group shares its
//   id with its Status leaf. After them, a group with `meta.expandable` shares
//   its id with its widenable Remark leaf. They have footers.
// - `remark` and `long`: the docs' columns, then a column defined with an
//   `id` and no `meta`, whose remark is about 300 and 380 characters long.
// - `pinned-docs`: the docs' Pinned Columns preview.
// - `pinned-story`: Storybook's PinnedColumns story, with its own args.
// The test bundles this file with esbuild.
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import { PinnedColumns } from "../../../apps/storybook/stories/data-table.stories";
import { Button } from "../../react/src/components/button";
import { DataTable } from "../../react/src/components/data-table";
import { Tag } from "../../react/src/components/tag";

window.ready = [];

// The docs' data and columns, as apps/docs/components/myds.tsx defines
// DataTableData, DataTableColumns and DataTableGroupedColumns
const docsData = [
  { age: 25, id: 1, name: "John Doe", position: "Software Engineer" },
  { age: 30, id: 2, name: "Jane Doe", position: "Product Manager" },
  { age: 22, id: 3, name: "Alice", position: "Designer" },
  {
    age: 35,
    id: 4,
    name: "Bob 'With A Very Long Middle Name' Smith",
    position: "Software Engineer",
  },
  { age: 28, id: 5, name: "Charlie", position: "Data Scientist" },
];

const status = () => (
  <Tag variant="success" size={"small"} mode="pill">
    Success
  </Tag>
);
const edit = () => <Button variant="default-outline">Edit</Button>;

const docsColumns = [
  {
    accessorKey: "name",
    header: "Name",
    id: "name",
    meta: { expandable: true },
  },
  {
    accessorKey: "age",
    header: "Age",
    id: "age",
    meta: { expandable: false, tooltip: "Age of the employee" },
  },
  {
    accessorKey: "position",
    header: "Position",
    id: "position",
    meta: {
      expandable: true,
      sortable: true,
      tooltip: "Position of the employee",
    },
  },
  { cell: status, header: "Status", id: "status" },
  { cell: edit, header: "Action", id: "action" },
];

const docsGroupedColumns = [
  {
    id: "employee",
    header: "Employee",
    columns: [
      {
        id: "name",
        header: "Name",
        accessorKey: "name",
        size: 180,
        meta: { expandable: true },
      },
      {
        id: "age",
        header: "Age",
        accessorKey: "age",
        meta: { expandable: false },
      },
      {
        id: "position",
        header: "Position",
        accessorKey: "position",
        meta: { expandable: true },
      },
    ],
  },
  {
    id: "status",
    header: "Application",
    columns: [
      { id: "status", header: "Status", cell: status },
      { id: "action", header: "Action", cell: edit },
    ],
  },
];

// About 300 characters of text that wraps at its spaces, `label` first
const long = (label) =>
  `${label}: permohonan lesen perniagaan ini telah diterima oleh unit pelesenan dan sedang disemak bersama dokumen sokongan yang dikemukakan oleh pemohon melalui portal rasmi agensi, dan pegawai akan menghubungi pemohon sekiranya maklumat tambahan diperlukan sebelum keputusan dimuktamadkan dalam tempoh empat belas hari bekerja.`;

const kindsData = ["Satu", "Dua"].map((row) => ({
  withId: long(`${row} with id`),
  accessor: long(`${row} accessor key`),
  leaf: long(`${row} leaf`),
  added: long(`${row} added`),
}));

const kindsColumns = (added) => [
  {
    id: "with-id",
    accessorKey: "withId",
    header: "With id",
    footer: "With id total",
    meta: { expandable: true },
  },
  {
    accessorKey: "accessor",
    header: "Accessor key",
    footer: "Accessor key total",
    meta: { expandable: true },
  },
  {
    id: "group",
    header: "Group",
    footer: "Group total",
    columns: [
      {
        id: "leaf",
        accessorKey: "leaf",
        header: "Leaf",
        footer: "Leaf total",
        meta: { expandable: true },
      },
    ],
  },
  ...(added
    ? [
        {
          id: "added",
          accessorKey: "added",
          header: "Added",
          footer: "Added total",
          meta: { expandable: true },
        },
      ]
    : []),
];

const groupsData = docsData.map((row) => ({
  ...row,
  remark: long(`Remark ${row.id}`),
}));

const groupsColumns = [
  ...docsGroupedColumns,
  {
    id: "remark",
    header: "Notes",
    footer: "Notes total",
    meta: { expandable: true },
    columns: [
      {
        id: "remark",
        accessorKey: "remark",
        header: "Remark",
        footer: "Remark total",
        meta: { expandable: true },
      },
    ],
  },
];

// The docs' columns, then a column with an `id` and no `meta`
const remarkColumns = [
  ...docsColumns,
  { id: "remark", accessorKey: "remark", header: "Remark" },
];

// About 380 characters of text that wraps at its spaces
const longer = (label) =>
  `${long(label)} Salinan keputusan akan dihantar melalui emel dan boleh dimuat turun dari portal rasmi agensi.`;

const remarkData = docsData.map((row) => ({
  ...row,
  remark: long(`Remark ${row.id}`),
}));
const longData = docsData.map((row) => ({
  ...row,
  remark: longer(`Remark ${row.id}`),
}));

function Page() {
  const [added, setAdded] = useState(false);
  useEffect(() => {
    window.addColumn = () => setAdded(true);
    window.ready.push("page");
  }, []);
  return (
    // A flex column, so each table's scroll wrapper is as wide as the page's
    // content box, however wide its table
    <main
      style={{ padding: 16, display: "flex", flexDirection: "column", gap: 48 }}
    >
      <div data-test="docs">
        <DataTable
          aria-label="Senarai pekerja"
          data={docsData}
          columns={docsColumns}
        />
      </div>
      <div data-test="kinds">
        <DataTable
          aria-label="Kinds"
          data={kindsData}
          columns={kindsColumns(added)}
        />
      </div>
      <div data-test="groups">
        <DataTable
          aria-label="Groups"
          data={groupsData}
          columns={groupsColumns}
        />
      </div>
      <div data-test="remark">
        <DataTable
          aria-label="Remark"
          data={remarkData}
          columns={remarkColumns}
        />
      </div>
      <div data-test="long">
        <DataTable aria-label="Long" data={longData} columns={remarkColumns} />
      </div>
      <div data-test="pinned-docs">
        <DataTable
          aria-label="Pinned"
          data={docsData}
          columns={docsColumns}
          pin={{ left: ["name"], right: ["action"] }}
        />
      </div>
      <div data-test="pinned-story">
        <DataTable {...PinnedColumns.args} />
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<Page />);
