// @vitest-environment happy-dom
import {
  act,
  createElement,
  type ComponentProps,
  type ReactElement,
} from "react";
import { createRoot } from "react-dom/client";
import { computeAccessibleName } from "dom-accessibility-api";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { Cell, DataTable, type ColumnDef } from "./data-table";
import { TableTooltip } from "./table";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const unmounts: (() => Promise<void>)[] = [];

// Mounts `element` in a container on the page, as an app would, and returns
// the container. Portalled content lands in `<body>`, outside it.
async function mount(element: ReactElement) {
  const container = document.body.appendChild(document.createElement("div"));
  const root = createRoot(container);
  unmounts.push(async () => {
    await act(async () => root.unmount());
    container.remove();
  });
  await act(async () => root.render(element));
  return container;
}

// React's warning for each of DataTable's radios, which have `checked` and no
// `onChange` (#165). A test that renders radio selection allows it.
const radioWarning =
  "You provided a `checked` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultChecked`. Otherwise, set either `onChange` or `readOnly`.";
let radioWarningAllowed = false;

beforeEach(() => {
  radioWarningAllowed = false;
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

// The label options, as attributes. React warns about an unknown prop only
// the first time it meets its name, so the warning check below would miss
// every leak after the first; checking the attributes catches each one.
const labelAttributes =
  "[rowlabel], [selectalllabel], [clearlabel], [columnlabel], [expandlabel], [tooltiplabel]";

// No label option reaches the DOM, no test logs an error or a warning apart
// from an allowed radio warning, and nothing is left on the page
afterEach(async () => {
  const strayLabels = [...document.querySelectorAll(labelAttributes)].map(
    (element) => element.outerHTML,
  );
  while (unmounts.length) await unmounts.pop()!();
  const logged = [
    ...vi.mocked(console.error).mock.calls,
    ...vi.mocked(console.warn).mock.calls,
  ].filter((call) => !(radioWarningAllowed && call[0] === radioWarning));
  vi.restoreAllMocks();
  expect(strayLabels).toEqual([]);
  expect(logged).toEqual([]);
  expect(document.body.innerHTML).toBe("");
});

type Person = { id: string; name: string; children?: Person[] };

const people: Person[] = [
  { id: "a", name: "Aminah" },
  { id: "b", name: "Badrul" },
  { id: "c", name: "Chong" },
];

const nameColumn: ColumnDef<Person> = {
  id: "name",
  accessorKey: "name",
  header: "Name",
};

// Two top-level rows with one sub-row each
const family: Person[] = [
  { id: "p", name: "Parent", children: [{ id: "c", name: "Child" }] },
  { id: "n", name: "Next", children: [{ id: "o", name: "Other child" }] },
];

// A name column whose cells hold the nested-row toggle
const expandColumn: ColumnDef<Person> = { ...nameColumn, cell: Cell.Expand };

type ExpandLabel = NonNullable<
  ComponentProps<typeof DataTable<Person>>["nest"]
>["expandLabel"];

// Mounts a DataTable of people with `props`, and returns its container. Radio
// selection allows the radio warning, and no other.
async function dataTable(props: ComponentProps<typeof DataTable<Person>>) {
  if (props.selection?.mode === "radio") radioWarningAllowed = true;
  return mount(createElement(DataTable<Person>, props));
}

// The accessible names of the elements in `within` that match `selector`,
// top to bottom
const namesOf = (within: ParentNode, selector: string) =>
  [...within.querySelectorAll(selector)].map((element) =>
    computeAccessibleName(element),
  );

// Every button in `within` that assistive technology meets with no name
const unnamed = (within: ParentNode) =>
  [...within.querySelectorAll('button, [role="button"]')]
    .filter((element) => !element.closest('[aria-hidden="true"]'))
    .filter((element) => computeAccessibleName(element) === "")
    .map((element) => element.outerHTML);

// Each row's checkbox in the table body, and the select-all checkbox
const rowCheckboxes = 'tbody [role="checkbox"]';
const selectAllCheckbox = 'thead [role="checkbox"]';
// Each row's radio in the table body
const rowRadios = 'tbody input[type="radio"]';
// Each nested-row toggle, a button that carries its row's `data-expanded`
const toggles = "tbody button[data-expanded]";

// The text of each row in the table body, top to bottom
const rowTexts = (within: ParentNode) =>
  [...within.querySelectorAll("tbody tr")].map((row) => row.textContent);

async function click(element: Element) {
  await act(async () => (element as HTMLElement).click());
}

// Both selection modes, and the selector for each row's control in them
const modes = [
  ["checkbox", rowCheckboxes],
  ["radio", rowRadios],
] as const;

describe.each(modes)("Each row's control in %s selection", (mode, controls) => {
  test('is named "Select row N" by default', async () => {
    const page = await dataTable({
      columns: [nameColumn],
      data: people,
      selection: { id_by: "id", mode },
    });
    expect(namesOf(page, controls)).toEqual([
      "Select row 1",
      "Select row 2",
      "Select row 3",
    ]);
  });

  test("is numbered top to bottom after a sort", async () => {
    const page = await dataTable({
      columns: [{ ...nameColumn, meta: { sortable: true } }],
      data: [people[2]!, people[0]!, people[1]!],
      selection: { id_by: "id", mode },
    });
    expect(rowTexts(page)).toEqual(["Chong", "Aminah", "Badrul"]);
    await click(page.querySelector('thead th[id="name"] button')!);
    expect(rowTexts(page)).toEqual(["Aminah", "Badrul", "Chong"]);
    expect(namesOf(page, controls)).toEqual([
      "Select row 1",
      "Select row 2",
      "Select row 3",
    ]);
  });

  test("counts an expanded sub-row as a row", async () => {
    const page = await dataTable({
      columns: [expandColumn],
      data: family,
      nest: { id_by: "children" },
      selection: { id_by: "id", mode },
    });
    expect(namesOf(page, controls)).toEqual(["Select row 1", "Select row 2"]);
    await click(page.querySelector(toggles)!);
    expect(rowTexts(page)).toEqual(["Parent", "Child", "Next"]);
    expect(namesOf(page, controls)).toEqual([
      "Select row 1",
      "Select row 2",
      "Select row 3",
    ]);
  });

  test("counts a row whose control is disabled", async () => {
    const page = await dataTable({
      columns: [nameColumn],
      data: people,
      selection: {
        id_by: "id",
        mode,
        enableRowSelection: (row) => row.original.name !== "Aminah",
      },
    });
    const [first] = page.querySelectorAll(controls);
    expect(first!.hasAttribute("disabled")).toBe(true);
    expect(namesOf(page, controls)).toEqual([
      "Select row 1",
      "Select row 2",
      "Select row 3",
    ]);
  });

  test("takes its name from a `rowLabel` function", async () => {
    const page = await dataTable({
      columns: [nameColumn],
      data: people,
      selection: {
        id_by: "id",
        mode,
        rowLabel: (row) => `Pilih ${row.original.name}`,
      },
    });
    expect(namesOf(page, controls)).toEqual([
      "Pilih Aminah",
      "Pilih Badrul",
      "Pilih Chong",
    ]);
  });

  test("takes a `rowLabel` string as every row's name", async () => {
    const page = await dataTable({
      columns: [nameColumn],
      data: people,
      selection: { id_by: "id", mode, rowLabel: "Pilih baris" },
    });
    expect(namesOf(page, controls)).toEqual([
      "Pilih baris",
      "Pilih baris",
      "Pilih baris",
    ]);
  });
});

describe("The select-all checkbox", () => {
  test('is named "Select all rows" by default', async () => {
    const page = await dataTable({
      columns: [nameColumn],
      data: people,
      selection: { id_by: "id", mode: "checkbox" },
    });
    expect(namesOf(page, selectAllCheckbox)).toEqual(["Select all rows"]);
  });

  test("takes its name from `selectAllLabel`", async () => {
    const page = await dataTable({
      columns: [nameColumn],
      data: people,
      selection: {
        id_by: "id",
        mode: "checkbox",
        selectAllLabel: "Pilih semua baris",
      },
    });
    expect(namesOf(page, selectAllCheckbox)).toEqual(["Pilih semua baris"]);
  });
});

describe("The radio column's reset button", () => {
  // A radio-selection table with no sortable or expandable column, whose
  // header's only button is the reset button
  const radioTable = (clearLabel?: string) =>
    dataTable({
      columns: [nameColumn],
      data: people,
      selection: { id_by: "id", mode: "radio", clearLabel },
    });
  const resetButton = "thead button";
  const checked = (within: ParentNode) =>
    [...within.querySelectorAll<HTMLInputElement>(rowRadios)].map(
      (radio) => radio.checked,
    );

  test('is named "Clear selection" before and after a row is selected', async () => {
    const page = await radioTable();
    expect(namesOf(page, resetButton)).toEqual(["Clear selection"]);
    expect(unnamed(page)).toEqual([]);
    await click(page.querySelectorAll(rowRadios)[1]!);
    expect(checked(page)).toEqual([false, true, false]);
    expect(namesOf(page, resetButton)).toEqual(["Clear selection"]);
    expect(unnamed(page)).toEqual([]);
  });

  test("takes its name from `clearLabel`", async () => {
    const page = await radioTable("Kosongkan pilihan");
    expect(namesOf(page, resetButton)).toEqual(["Kosongkan pilihan"]);
  });

  test("clears the selection, and shows only while a row is selected", async () => {
    const page = await radioTable();
    const reset = page.querySelector(resetButton)!;
    expect(reset.getAttribute("data-selected")).toBe("false");
    await click(page.querySelectorAll(rowRadios)[1]!);
    expect(reset.getAttribute("data-selected")).toBe("true");
    await click(reset);
    expect(checked(page)).toEqual([false, false, false]);
    expect(reset.getAttribute("data-selected")).toBe("false");
  });
});

describe.each(modes)("The %s selection column's header", (mode) => {
  // The visually hidden text in the selection column's header cell
  const headerText = (within: ParentNode) =>
    [...within.querySelectorAll("thead th:first-child .sr-only")].map(
      (text) => text.textContent,
    );

  test('holds the visually hidden text "Select" by default', async () => {
    const page = await dataTable({
      columns: [nameColumn],
      data: people,
      selection: { id_by: "id", mode },
    });
    expect(headerText(page)).toEqual(["Select"]);
    expect(document.body.innerHTML).not.toContain("selection-column");
  });

  test("holds `columnLabel` as its text", async () => {
    const page = await dataTable({
      columns: [nameColumn],
      data: people,
      selection: { id_by: "id", mode, columnLabel: "Pilihan" },
    });
    expect(headerText(page)).toEqual(["Pilihan"]);
  });
});

describe("The nested-row toggle", () => {
  const nestedTable = (expandLabel?: ExpandLabel) =>
    dataTable({
      columns: [expandColumn],
      data: family,
      nest: { id_by: "children", expandLabel },
    });

  test('is named "expand row" and exposes its row\'s state', async () => {
    const page = await nestedTable();
    const toggle = page.querySelector(toggles)!;
    expect(toggle.getAttribute("aria-label")).toBe("expand row");
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(toggle.querySelectorAll("[aria-label]")).toHaveLength(0);
    expect(computeAccessibleName(toggle)).toBe("expand row");
    await click(toggle);
    expect(rowTexts(page)).toEqual(["Parent", "Child", "Next"]);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(computeAccessibleName(toggle)).toBe("expand row");
    expect(unnamed(page)).toEqual([]);
  });

  test("takes an `expandLabel` string as every toggle's name", async () => {
    const page = await nestedTable("Kembangkan baris");
    expect(namesOf(page, toggles)).toEqual([
      "Kembangkan baris",
      "Kembangkan baris",
    ]);
  });

  test("takes its name from an `expandLabel` function", async () => {
    const page = await nestedTable((row) => `Kembangkan ${row.original.name}`);
    expect(namesOf(page, toggles)).toEqual([
      "Kembangkan Parent",
      "Kembangkan Next",
    ]);
  });
});

describe("A column header's tooltip trigger", () => {
  const tooltipTable = (meta: ColumnDef<Person>["meta"]) =>
    dataTable({
      columns: [nameColumn, { id: "age", header: "Age", meta }],
      data: people,
    });

  test('is named "Tooltip" by default', async () => {
    const page = await tooltipTable({ tooltip: "Umur dalam tahun" });
    expect(namesOf(page, "thead button")).toEqual(["Tooltip"]);
  });

  test("takes its name from the column's `meta.tooltipLabel`", async () => {
    const page = await tooltipTable({
      tooltip: "Umur dalam tahun",
      tooltipLabel: "Maklumat umur",
    });
    expect(namesOf(page, "thead button")).toEqual(["Maklumat umur"]);
  });
});

describe("TableTooltip", () => {
  // A TableTooltip with `props`. Returns the page, whose only button is the
  // trigger.
  const tableTooltip = (props: ComponentProps<typeof TableTooltip>) =>
    mount(createElement(TableTooltip, props, "Umur dalam tahun"));

  test('names its trigger "Tooltip" by default', async () => {
    const page = await tableTooltip({});
    expect(namesOf(page, "button")).toEqual(["Tooltip"]);
  });

  test("lets an `aria-label` rename its trigger", async () => {
    const page = await tableTooltip({ "aria-label": "Maklumat" });
    expect(namesOf(page, "button")).toEqual(["Maklumat"]);
  });

  // The root renders no element, so check what `open` does
  test("passes its other props to the tooltip root", async () => {
    await tableTooltip({ open: true, "aria-label": "Maklumat" });
    expect(document.querySelector('[role="tooltip"]')?.textContent).toBe(
      "Umur dalam tahun",
    );
  });
});
