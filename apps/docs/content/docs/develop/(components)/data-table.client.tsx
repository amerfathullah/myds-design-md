"use client";

import { DataTable, type ColumnDef } from "@/components/myds";
import { useId } from "react";

type Applicant = {
  id: string;
  name: string;
  reference: string;
  status: string;
};

const applicants: Applicant[] = [
  {
    id: "1",
    name: "Aminah binti Yusof",
    reference: "PMH-0142",
    status: "Diluluskan",
  },
  {
    id: "2",
    name: "Ravi a/l Muthu",
    reference: "PMH-0143",
    status: "Dalam semakan",
  },
  { id: "3", name: "Tan Mei Ling", reference: "PMH-0144", status: "Ditolak" },
];

// DataTable gives its header and body cells ids made from the column ids, so
// these differ from the other examples' columns on the page
const applicantColumns: ColumnDef<Applicant>[] = [
  { id: "applicant-name", accessorKey: "name", header: "Nama" },
  {
    id: "applicant-reference",
    accessorKey: "reference",
    header: "No. rujukan",
  },
  { id: "applicant-status", accessorKey: "status", header: "Status" },
];

// A heading above the table names it through `aria-labelledby`. `useId()`
// gives the heading an id of its own, so the page repeats no id however many
// times this renders.
export function DataTableNamedExample() {
  const headingId = useId();
  return (
    <div className="flex flex-col gap-3">
      <h4
        id={headingId}
        className="font-heading text-txt-black-900 text-body-lg font-semibold"
      >
        Senarai pemohon
      </h4>
      <DataTable
        aria-labelledby={headingId}
        columns={applicantColumns}
        data={applicants}
      />
    </div>
  );
}
