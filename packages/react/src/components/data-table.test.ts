// @vitest-environment happy-dom
import {
  act,
  createElement,
  createRef,
  type ComponentProps,
  type FormEvent,
  type ReactElement,
} from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
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
// the container and a function that renders another element in its place.
// Portalled content lands in `<body>`, outside it.
async function mountRoot(element: ReactElement) {
  const container = document.body.appendChild(document.createElement("div"));
  const root = createRoot(container);
  unmounts.push(async () => {
    await act(async () => root.unmount());
    container.remove();
  });
  const render = (next: ReactElement) => act(async () => root.render(next));
  await render(element);
  return { container, render };
}

// Mounts `element` as `mountRoot` does, and returns its container
async function mount(element: ReactElement) {
  return (await mountRoot(element)).container;
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

// The label options, as attributes. React warns about an unknown prop only
// the first time it meets its name, so the warning check below would miss
// every leak after the first; checking the attributes catches each one.
const labelAttributes =
  "[rowlabel], [selectalllabel], [clearlabel], [columnlabel], [expandlabel], [tooltiplabel], [sortlabel], [widenlabel]";

// No label option reaches the DOM, no test logs an error or a warning, and
// nothing is left on the page
afterEach(async () => {
  const strayLabels = [...document.querySelectorAll(labelAttributes)].map(
    (element) => element.outerHTML,
  );
  while (unmounts.length) await unmounts.pop()!();
  const logged = [
    ...vi.mocked(console.error).mock.calls,
    ...vi.mocked(console.warn).mock.calls,
  ];
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

// Mounts a DataTable with `props`, and returns its container
async function dataTable<TData extends Record<string, any>>(
  props: ComponentProps<typeof DataTable<TData>>,
) {
  return mount(createElement(DataTable<TData>, props));
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
// The `name` of each row radio in `within`, top to bottom
const radioNames = (within: ParentNode) =>
  [...within.querySelectorAll(rowRadios)].map((radio) =>
    radio.getAttribute("name"),
  );
// Each nested-row toggle, a button that carries its row's `data-expanded`
const toggles = "tbody button[data-expanded]";

// The text of each row in the table body, top to bottom
const rowTexts = (within: ParentNode) =>
  [...within.querySelectorAll("tbody tr")].map((row) => row.textContent);

// The text of each body row's first cell, top to bottom
const firstColumn = (within: ParentNode) =>
  [...within.querySelectorAll("tbody tr td:first-child")].map(
    (cell) => cell.textContent,
  );

// The button in `within` whose accessible name is `name`
function buttonNamed(within: ParentNode, name: string) {
  const button = [...within.querySelectorAll("button")].find(
    (element) => computeAccessibleName(element) === name,
  );
  if (!button) throw new Error(`No button is named "${name}"`);
  return button;
}

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
  test('is `type="button"`: inside a form, it clears the selection and submits nothing', async () => {
    const submits: string[] = [];
    const page = await mount(
      createElement(
        "form",
        {
          onSubmit: (event: FormEvent) => {
            event.preventDefault();
            submits.push("submitted");
          },
        },
        createElement(DataTable<Person>, {
          columns: [nameColumn],
          data: people,
          selection: { id_by: "id", mode: "radio" },
        }),
      ),
    );
    await click(page.querySelectorAll(rowRadios)[1]!);
    const reset = page.querySelector(resetButton)!;
    await click(reset);
    expect({
      type: reset.getAttribute("type"),
      checked: checked(page),
      submits,
    }).toEqual({ type: "button", checked: [false, false, false], submits: [] });
  });
});

describe("Radio selection's row radios", () => {
  test("share one non-empty name per table, which differs between two tables", async () => {
    const first = await dataTable({
      columns: [nameColumn],
      data: people,
      selection: { id_by: "id", mode: "radio" },
    });
    const second = await dataTable({
      columns: [nameColumn],
      data: people,
      selection: { id_by: "id", mode: "radio" },
    });
    const [name] = radioNames(first);
    const [otherName] = radioNames(second);
    expect(name).toBeTruthy();
    expect(otherName).toBeTruthy();
    expect(otherName).not.toBe(name);
    expect(radioNames(first)).toEqual([name, name, name]);
    expect(radioNames(second)).toEqual([otherName, otherName, otherName]);
  });

  test("take their name from `selection.name`", async () => {
    const page = await dataTable({
      columns: [nameColumn],
      data: people,
      selection: { id_by: "id", mode: "radio", name: "pegawai" },
    });
    expect(radioNames(page)).toEqual(["pegawai", "pegawai", "pegawai"]);
  });

  test("take the generated name when `selection.name` is empty", async () => {
    const generated = await dataTable({
      columns: [nameColumn],
      data: people,
      selection: { id_by: "id", mode: "radio" },
    });
    const empty = await dataTable({
      columns: [nameColumn],
      data: people,
      selection: { id_by: "id", mode: "radio", name: "" },
    });
    const [name] = radioNames(empty);
    expect(name).toBeTruthy();
    expect(name).not.toBe(radioNames(generated)[0]);
    expect(radioNames(empty)).toEqual([name, name, name]);
  });

  test("have no `id`", async () => {
    const page = await dataTable({
      columns: [nameColumn],
      data: people,
      selection: { id_by: "id", mode: "radio" },
    });
    const radios = [...page.querySelectorAll(rowRadios)];
    expect(radios).toHaveLength(3);
    expect(radios.filter((radio) => radio.hasAttribute("id"))).toEqual([]);
  });

  test("select their row when clicked, and report no change when clicked again", async () => {
    const onSelectionChange = vi.fn();
    const page = await dataTable<Person>({
      columns: [nameColumn],
      data: people,
      selection: { id_by: "id", mode: "radio", onSelectionChange },
    });
    const radios = page.querySelectorAll<HTMLInputElement>(rowRadios);
    await click(radios[1]!);
    await click(radios[1]!);
    await click(radios[2]!);
    expect({
      checked: [...radios].map((radio) => radio.checked),
      calls: onSelectionChange.mock.calls,
    }).toEqual({
      checked: [false, false, true],
      calls: [[[]], [["b"]], [["c"]]],
    });
  });
});

describe("Server rendering a radio DataTable", () => {
  // Two radio DataTables of `people`, side by side
  const twoTables = () =>
    createElement(
      "div",
      null,
      ...[1, 2].map((key) =>
        createElement(DataTable<Person>, {
          key,
          columns: [nameColumn],
          data: people,
          selection: { id_by: "id", mode: "radio" },
        }),
      ),
    );
  test("logs nothing", () => {
    const html = renderToString(twoTables());
    expect(html).toContain('type="radio"');
  });

  test("hydrates with nothing logged, and the radios keep the names the server gave them", async () => {
    const container = document.body.appendChild(document.createElement("div"));
    container.innerHTML = renderToString(twoTables());
    const served = radioNames(container);
    const recovered: unknown[] = [];
    const root = await act(async () =>
      hydrateRoot(container, twoTables(), {
        onRecoverableError: (error) => recovered.push(error),
      }),
    );
    unmounts.push(async () => {
      await act(async () => root.unmount());
      container.remove();
    });
    const [first, , , second] = served;
    expect(first).toBeTruthy();
    expect(second).toBeTruthy();
    expect(served).toEqual([first, first, first, second, second, second]);
    expect(second).not.toBe(first);
    expect({ hydrated: radioNames(container), recovered }).toEqual({
      hydrated: served,
      recovered: [],
    });
  });
});

describe("A radio DataTable inside a form", () => {
  // A form holding two radio DataTables of `people`. The first takes
  // `name`, and its rows in `locked` can't be selected.
  const twoTableForm = (name?: string, locked: string[] = []) =>
    createElement(
      "form",
      null,
      createElement(DataTable<Person>, {
        columns: [nameColumn],
        data: people,
        selection: {
          id_by: "id",
          mode: "radio",
          name,
          enableRowSelection: (row) => !locked.includes(row.id),
        },
      }),
      createElement(DataTable<Person>, {
        columns: [nameColumn],
        data: people,
        selection: { id_by: "id", mode: "radio" },
      }),
    );
  // The entries the form in `within` submits, as [name, value] pairs
  const entries = (within: ParentNode) => [
    ...new FormData(within.querySelector("form")!).entries(),
  ];
  // The row radios of the first and the second table in `within`
  const tablesRadios = (within: ParentNode) =>
    [...within.querySelectorAll("table")].map((table) => [
      ...table.querySelectorAll<HTMLInputElement>(rowRadios),
    ]);

  test("submits nothing while no row is selected", async () => {
    const page = await mount(twoTableForm());
    expect(entries(page)).toEqual([]);
  });

  test("submits the selected row's id under the table's name, and each table under its own", async () => {
    const page = await mount(twoTableForm());
    const [first, second] = tablesRadios(page);
    const [name, otherName] = [first![0]!.name, second![0]!.name];
    await click(first![1]!);
    expect(entries(page)).toEqual([[name, "b"]]);
    await click(second![2]!);
    expect(entries(page)).toEqual([
      [name, "b"],
      [otherName, "c"],
    ]);
  });

  test("submits the selected row under `selection.name`", async () => {
    const page = await mount(twoTableForm("pegawai"));
    await click(tablesRadios(page)[0]![1]!);
    expect(entries(page)).toEqual([["pegawai", "b"]]);
  });

  test("submits nothing for a table once its selected row can't be selected", async () => {
    const { container: page, render } = await mountRoot(
      twoTableForm("pegawai"),
    );
    await click(tablesRadios(page)[0]![1]!);
    await render(twoTableForm("pegawai", ["b"]));
    const b = tablesRadios(page)[0]![1]!;
    expect({ checked: b.checked, disabled: b.disabled }).toEqual({
      checked: true,
      disabled: true,
    });
    expect(entries(page)).toEqual([]);
  });
});

test("Checkbox selection ignores `selection.name`: no element has a `name`, inside a form or not", async () => {
  const selection = {
    id_by: "id",
    mode: "checkbox",
    name: "pegawai",
  } as const;
  const page = await dataTable<Person>({
    columns: [nameColumn],
    data: people,
    selection,
  });
  const form = await mount(
    createElement(
      "form",
      null,
      createElement(DataTable<Person>, {
        columns: [nameColumn],
        data: people,
        selection,
      }),
    ),
  );
  await click(page.querySelectorAll(rowCheckboxes)[1]!);
  await click(form.querySelectorAll(rowCheckboxes)[1]!);
  expect(document.querySelectorAll("[name]")).toHaveLength(0);
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

type Officer = {
  id: string;
  name: string;
  unit: string;
  office: string;
  age: number;
};

// Out of order by name and by age, so a first sort of either reorders them
const officers: Officer[] = [
  { id: "c", name: "Chong", unit: "Records", office: "Ipoh", age: 34 },
  { id: "a", name: "Aminah", unit: "Licensing", office: "Kuantan", age: 41 },
  { id: "b", name: "Badrul", unit: "Finance", office: "Arau", age: 25 },
];

// Mounts a DataTable of officers, with `officerColumns` unless `props` gives
// other columns, and returns its container
const officerTable = (
  props: Partial<ComponentProps<typeof DataTable<Officer>>>,
) => dataTable<Officer>({ columns: officerColumns, data: officers, ...props });

// A header of each form: a string, a function that renders an element, and
// none, which TanStack's default renders as the accessor key
const officerColumns: ColumnDef<Officer>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: "Name",
    meta: { sortable: true, expandable: true },
  },
  {
    id: "unit",
    accessorKey: "unit",
    header: () => createElement("b", null, "Unit"),
    meta: { sortable: true },
  },
  { accessorKey: "office", meta: { sortable: true } },
];

describe("A column header's sort and widen buttons", () => {
  test('are named "Sort by {header}" and "Widen {header}" from the text each header renders', async () => {
    const page = await officerTable({});
    expect(namesOf(page, "thead button")).toEqual([
      "Widen Name",
      "Sort by Name",
      "Sort by Unit",
      "Sort by office",
    ]);
  });

  test('are named "Sort column" and "Widen column" when the header renders no text', async () => {
    const page = await officerTable({
      columns: [
        {
          id: "office",
          accessorKey: "office",
          header: () => null,
          meta: { sortable: true, expandable: true },
        },
      ],
    });
    expect(namesOf(page, "thead button")).toEqual([
      "Widen column",
      "Sort column",
    ]);
  });

  test("take their names from the column's `meta.sortLabel` and `meta.widenLabel`", async () => {
    const page = await officerTable({
      columns: [
        {
          id: "name",
          accessorKey: "name",
          header: "Nama",
          meta: {
            sortable: true,
            expandable: true,
            sortLabel: "Isih mengikut Nama",
            widenLabel: "Lebarkan Nama",
          },
        },
      ],
    });
    expect(namesOf(page, "thead button")).toEqual([
      "Lebarkan Nama",
      "Isih mengikut Nama",
    ]);
  });

  test("hide their icons from assistive technology", async () => {
    const page = await officerTable({});
    const buttons = page.querySelectorAll("thead button");
    expect(buttons).toHaveLength(4);
    const exposedIcons = [...buttons]
      .flatMap((button) => [...button.querySelectorAll("svg")])
      .filter((icon) => !icon.closest('[aria-hidden="true"]'))
      .map((icon) => icon.outerHTML);
    expect(exposedIcons).toEqual([]);
  });

  test("leave out the sort button of a `sortable` column with no accessor, which can't sort", async () => {
    const page = await officerTable({
      columns: [
        { id: "name", accessorKey: "name", header: "Name" },
        {
          id: "actions",
          header: "Actions",
          cell: () => "Edit",
          meta: { sortable: true, expandable: true },
        },
      ],
    });
    expect(namesOf(page, "thead button")).toEqual(["Widen Actions"]);
  });

  test('are `type="button"`, so activating one inside a form submits nothing', async () => {
    const submits: string[] = [];
    const page = await mount(
      createElement(
        "form",
        {
          onSubmit: (event: FormEvent) => {
            event.preventDefault();
            submits.push("submitted");
          },
        },
        createElement(DataTable<Officer>, {
          columns: officerColumns,
          data: officers,
        }),
        createElement("button", { type: "submit" }, "Save"),
      ),
    );
    const buttons = [
      buttonNamed(page, "Sort by Name"),
      buttonNamed(page, "Widen Name"),
    ];
    for (const button of buttons) await click(button);
    expect(submits).toEqual([]);
    expect(buttons.map((button) => button.getAttribute("type"))).toEqual([
      "button",
      "button",
    ]);
    // The form does submit, from its submit button
    await click(buttonNamed(page, "Save"));
    expect(submits).toEqual(["submitted"]);
  });

  test("keep their names after sorting ascending, sorting descending and widening", async () => {
    const page = await officerTable({});
    const names = [
      "Widen Name",
      "Sort by Name",
      "Sort by Unit",
      "Sort by office",
    ];
    const sort = buttonNamed(page, "Sort by Name");
    const widen = buttonNamed(page, "Widen Name");
    await click(sort);
    expect(firstColumn(page)).toEqual(["Aminah", "Badrul", "Chong"]);
    expect(namesOf(page, "thead button")).toEqual(names);
    await click(sort);
    expect(firstColumn(page)).toEqual(["Chong", "Badrul", "Aminah"]);
    expect(namesOf(page, "thead button")).toEqual(names);
    await click(widen);
    expect(widen.getAttribute("data-expanded")).toBe("true");
    expect(namesOf(page, "thead button")).toEqual(names);
  });
});

describe.each(modes)(
  "A sortable and expandable table in %s selection",
  (mode) => {
    // Every column header has a sort or widen button, and Age a tooltip too
    const columns: ColumnDef<Officer>[] = [
      ...officerColumns,
      {
        id: "age",
        accessorKey: "age",
        header: "Age",
        meta: { sortable: true, tooltip: "Umur dalam tahun" },
      },
    ];

    test("has no unnamed button, at rest, sorted or widened", async () => {
      const page = await officerTable({
        columns,
        selection: { id_by: "id", mode },
      });
      expect(unnamed(page)).toEqual([]);
      await click(buttonNamed(page, "Sort by Name"));
      expect(unnamed(page)).toEqual([]);
      await click(buttonNamed(page, "Widen Name"));
      expect(unnamed(page)).toEqual([]);
    });
  },
);

describe("A column header's widen button", () => {
  test('is `aria-pressed` "false", then "true" while its column is widened, then "false"', async () => {
    const page = await officerTable({});
    const widen = buttonNamed(page, "Widen Name");
    expect(widen.getAttribute("aria-pressed")).toBe("false");
    await click(widen);
    expect(widen.getAttribute("aria-pressed")).toBe("true");
    await click(widen);
    expect(widen.getAttribute("aria-pressed")).toBe("false");
  });
});

describe("A sorted column's header", () => {
  // The headers that have `aria-sort`, as "header text: value"
  const sortedHeaders = (within: ParentNode) =>
    [...within.querySelectorAll("thead th[aria-sort]")].map(
      (header) => `${header.textContent}: ${header.getAttribute("aria-sort")}`,
    );

  test('has `aria-sort` "ascending", then "descending", then none as its sort button cycles', async () => {
    const page = await officerTable({});
    const sort = buttonNamed(page, "Sort by Name");
    expect(sortedHeaders(page)).toEqual([]);
    await click(sort);
    expect(firstColumn(page)).toEqual(["Aminah", "Badrul", "Chong"]);
    expect(sortedHeaders(page)).toEqual(["Name: ascending"]);
    await click(sort);
    expect(firstColumn(page)).toEqual(["Chong", "Badrul", "Aminah"]);
    expect(sortedHeaders(page)).toEqual(["Name: descending"]);
    await click(sort);
    expect(firstColumn(page)).toEqual(["Chong", "Aminah", "Badrul"]);
    expect(sortedHeaders(page)).toEqual([]);
  });

  test('has `aria-sort` "descending" after a number column\'s first sort', async () => {
    const page = await officerTable({
      columns: [
        { id: "name", accessorKey: "name", header: "Name" },
        {
          id: "age",
          accessorKey: "age",
          header: "Age",
          meta: { sortable: true },
        },
      ],
    });
    await click(buttonNamed(page, "Sort by Age"));
    expect(firstColumn(page)).toEqual(["Aminah", "Chong", "Badrul"]);
    expect(sortedHeaders(page)).toEqual(["Age: descending"]);
  });

  test("is only the first column in a Shift+click multi-sort", async () => {
    const page = await officerTable({});
    await click(buttonNamed(page, "Sort by Unit"));
    // Badrul's unit is Finance, Aminah's Licensing and Chong's Records
    expect(firstColumn(page)).toEqual(["Badrul", "Aminah", "Chong"]);
    await act(async () =>
      buttonNamed(page, "Sort by Name").dispatchEvent(
        new MouseEvent("click", { bubbles: true, shiftKey: true }),
      ),
    );
    // Name joined the sort after Unit, rather than replacing it
    expect(firstColumn(page)).toEqual(["Badrul", "Aminah", "Chong"]);
    expect(sortedHeaders(page)).toEqual(["Unit: ascending"]);
  });
});

test("DataTable's classes don't include the two that generate no CSS", async () => {
  await dataTable<Officer>({
    columns: officerColumns,
    data: officers,
    selection: {
      id_by: "id",
      mode: "radio",
      enableRowSelection: (row) => row.id !== "a",
    },
    pin: { left: ["name"], right: ["office"] },
  });
  const classes = [...document.querySelectorAll("[class]")].flatMap(
    (element) => [...element.classList],
  );
  // The pinned columns' edge shadows are drawn
  expect(classes).toEqual(
    expect.arrayContaining([
      "before:shadow-[inset_3px_0_8px_-8px]",
      "before:shadow-[inset_-3px_0_8px_-8px]",
    ]),
  );
  expect(
    classes.filter((name) =>
      [
        "has-[:disabled]:has-[:checked]::bg-primary-600",
        "before:contents-['']",
      ].includes(name),
    ),
  ).toEqual([]);
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

  test("gives a `ref` its trigger button", async () => {
    const ref = createRef<HTMLButtonElement>();
    const page = await tableTooltip({ ref });
    expect(ref.current).toBe(page.querySelector("button"));
  });

  test("puts a `className`, an `id` and `data-*` attributes on its trigger button", async () => {
    const page = await tableTooltip({
      className: "ml-2",
      id: "umur-info",
      "data-column": "umur",
    } as ComponentProps<typeof TableTooltip>);
    const button = page.querySelector("button")!;
    expect({
      id: button.id,
      column: button.dataset.column,
      // The library's own classes stay, with the author's after them
      ring: button.classList.contains("focus-visible:ring-fr-primary"),
      last: [...button.classList].at(-1),
    }).toEqual({ id: "umur-info", column: "umur", ring: true, last: "ml-2" });
  });

  // The root renders no element, so check what `open` does
  test("passes `open` to the tooltip root", async () => {
    await tableTooltip({ open: true, "aria-label": "Maklumat" });
    expect(document.querySelector('[role="tooltip"]')?.textContent).toBe(
      "Umur dalam tahun",
    );
  });

  test("passes `onOpenChange` to the tooltip root, and stays closed while `open` is false", async () => {
    const onOpenChange = vi.fn();
    const page = await tableTooltip({ open: false, onOpenChange });
    // Focus opens a tooltip
    await act(async () => page.querySelector("button")!.focus());
    expect({
      calls: onOpenChange.mock.calls,
      shown: document.querySelector('[role="tooltip"]'),
    }).toEqual({ calls: [[true]], shown: null });
  });

  test('names its trigger "Tooltip" when `aria-label` is `undefined`, as DataTable passes it', async () => {
    const page = await tableTooltip({ "aria-label": undefined });
    expect(namesOf(page, "button")).toEqual(["Tooltip"]);
  });
});
