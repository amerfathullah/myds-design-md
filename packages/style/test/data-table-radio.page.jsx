// The page data-table-radio.test.mjs renders in Chromium: two DataTables
// with radio selection, with buttons before, between and after them. Each
// has rows a to d, and d can't be selected. After them, a form holds a text
// field, a third radio DataTable and a submit button, and logs its submits to
// `window.submits`. Last, the library's Radio, small, in the states the test
// compares the tables' radios with. The test bundles this file with esbuild.
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import { DataTable } from "../../react/src/components/data-table";
import {
  Radio,
  RadioButton,
  RadioItem,
} from "../../react/src/components/radio";

window.ready = [];
window.submits = [];
// The ids each table's `onSelectionChange` is called with, call by call
window.selections = { first: [], second: [], form: [] };

const people = [
  { id: "a", name: "Aminah" },
  { id: "b", name: "Badrul" },
  { id: "c", name: "Chong" },
  { id: "d", name: "Devi" },
];

const columns = [{ id: "name", accessorKey: "name", header: "Name" }];

// A radio DataTable of `people` in a wrapper with `data-test={table}`. Its
// rows in `locked`, and d, can't be selected.
function RadioTable({ table, locked = [] }) {
  return (
    <div data-test={table}>
      <DataTable
        columns={columns}
        data={people}
        selection={{
          id_by: "id",
          mode: "radio",
          enableRowSelection: (row) =>
            row.id !== "d" && !locked.includes(row.id),
          onSelectionChange: (ids) => window.selections[table].push(ids),
        }}
      />
    </div>
  );
}

// A small Radio group with the items `on` and `off`, `on` checked, with
// `data-test` on each item's button
function RadioPair({ test, disabled }) {
  return (
    <Radio size="small" defaultValue="on" disabled={disabled}>
      {["on", "off"].map((value) => (
        <RadioItem key={value}>
          <RadioButton
            value={value}
            aria-label={value}
            data-test={`${test}-${value}`}
          />
        </RadioItem>
      ))}
    </Radio>
  );
}

function Page() {
  // The rows of each table that `window.lock` made unselectable
  const [locked, setLocked] = useState({});
  useEffect(() => {
    window.lock = (table, ids) =>
      setLocked((previous) => ({ ...previous, [table]: ids }));
    window.ready.push("page");
  }, []);
  return (
    <main style={{ padding: 16 }}>
      <button type="button" data-test="before">
        Before
      </button>
      <RadioTable table="first" locked={locked.first} />
      <button type="button" data-test="between">
        Between
      </button>
      <RadioTable table="second" locked={locked.second} />
      <button type="button" data-test="after">
        After
      </button>
      <form
        data-test="form-element"
        onSubmit={(event) => {
          event.preventDefault();
          const { submitter } = event.nativeEvent;
          window.submits.push({
            submitter: submitter?.dataset.test ?? null,
            entries: [...new FormData(event.currentTarget, submitter)],
          });
        }}
      >
        <input type="text" aria-label="Catatan" data-test="field" />
        <RadioTable table="form" />
        <button type="submit" data-test="submit">
          Hantar
        </button>
      </form>
      <div style={{ display: "flex", gap: 16, padding: 16 }}>
        <RadioPair test="radio" />
        <RadioPair test="radio-disabled" disabled />
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<Page />);
