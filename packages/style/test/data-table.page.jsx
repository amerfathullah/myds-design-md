// The page data-table.test.mjs renders in Chromium: two DataTables with
// sortable and expandable columns. The first has checkbox selection and sits
// in a form, which logs its submits to `window.submits`. The second has no
// selection. Buttons that don't submit the form sit before, between and after
// them. After them, a third DataTable's one column has a header that renders
// no text. The test bundles this file with esbuild.
import { useEffect } from "react";
import { createRoot } from "react-dom/client";

import { DataTable } from "../../react/src/components/data-table";

window.submits = [];
window.ready = [];

// Out of order by name and by age, so a first sort of either reorders them.
// Each long name and position is cut off at 230px until its column widens.
const people = [
  {
    id: "c",
    name: "Chong Wei Ming bin Abdullah Hakim Al-Haj",
    age: 34,
    position: "Head of the Licensing and Enforcement Unit",
  },
  {
    id: "a",
    name: "Aminah binti Abdullah Rahman Hakim Al-Haj",
    age: 41,
    position: "Administrative and Diplomatic Officer",
  },
  { id: "b", name: "Badrul", age: 25, position: "Clerk" },
];

// Name and Position sort and widen; Age, a number, sorts and has a tooltip
const columns = [
  {
    id: "name",
    accessorKey: "name",
    header: "Name",
    meta: { sortable: true, expandable: true },
  },
  {
    id: "age",
    accessorKey: "age",
    header: "Age",
    meta: { sortable: true, tooltip: "Umur dalam tahun" },
  },
  {
    id: "position",
    accessorKey: "position",
    header: "Position",
    meta: { sortable: true, expandable: true },
  },
];

// A column whose header renders no text, with every control a header can
// hold
const blankColumns = [
  {
    id: "position",
    accessorKey: "position",
    header: () => null,
    meta: { sortable: true, expandable: true, tooltip: "Jawatan" },
  },
];

function Page() {
  useEffect(() => void window.ready.push("page"), []);
  return (
    <main style={{ padding: 16 }}>
      <button type="button" data-test="before">
        Before
      </button>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          window.submits.push("first");
        }}
      >
        <div data-test="first">
          <DataTable
            columns={columns}
            data={people}
            selection={{ id_by: "id", mode: "checkbox" }}
          />
        </div>
      </form>
      <button type="button" data-test="between">
        Between
      </button>
      <div data-test="second">
        <DataTable columns={columns} data={people} />
      </div>
      <button type="button" data-test="after">
        After
      </button>
      <div data-test="blank">
        <DataTable columns={blankColumns} data={people} />
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<Page />);
