// @vitest-environment happy-dom
// The names of the dialogs and popovers that DatePicker's and
// DateRangePicker's calendars open in (#169). Each is `role="dialog"` with no
// visible title, so each takes an English default name that a prop replaces
// (ADR-0008): "Choose date" from `calendarLabel`, and "Choose start date" /
// "Choose end date" from `fromCalendarLabel` / `toCalendarLabel`. The names
// don't follow `locale`, and the pickers' own `aria-label`,
// `aria-labelledby` and `aria-describedby` still name only the triggers
// (`date-picker-triggers.test.ts`).
import { act, createElement, Fragment, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { computeAccessibleName } from "dom-accessibility-api";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { DatePicker } from "./date-picker";
import { DateRangePicker } from "./daterange-picker";
import { Label } from "./label";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const unmounts: (() => Promise<void>)[] = [];

// Mounts `element` in a container on the page, as an app would, and returns
// the container. The dialogs and popovers portal into `<body>`, outside it.
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

// No `calendarLabel`, `fromCalendarLabel` or `toCalendarLabel` reaches the
// DOM as an attribute. React warns about an unknown prop only the first time
// it meets its name, so the warning check would miss every leak after the
// first.
const strayCalendarLabels = () =>
  document.querySelectorAll(
    "[calendarlabel], [fromcalendarlabel], [tocalendarlabel]",
  ).length;

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

// No test logs an error or a warning, and nothing is left on the page
afterEach(async () => {
  while (unmounts.length) await unmounts.pop()!();
  const logged = [
    ...vi.mocked(console.error).mock.calls,
    ...vi.mocked(console.warn).mock.calls,
  ];
  vi.restoreAllMocks();
  expect(logged).toEqual([]);
  expect(document.body.innerHTML).toBe("");
});

// Opens the calendar behind trigger number `index` in `page`, counted in the
// order the picker renders them, and returns the one dialog or popover open:
// the element with `role="dialog"`, which holds the calendar
async function open(page: HTMLElement, index: number) {
  await act(async () => page.querySelectorAll("button")[index]!.click());
  const [open, ...others] = document.querySelectorAll('[role="dialog"]');
  expect(others).toEqual([]);
  expect(open).toBeDefined();
  // The calendar's root, react-day-picker's, is the element with `lang`
  expect(open!.querySelector("[lang]")).not.toBeNull();
  return open!;
}

// Opens each of `triggers` in turn, in a picker `render` mounts afresh for
// each, and returns the accessible names of the dialogs they open. No label
// prop reaches the DOM, in the picker or in the open dialog.
async function dialogNames(render: () => ReactElement, triggers: number[]) {
  const names = [];
  for (const trigger of triggers) {
    const page = await mount(render());
    names.push(computeAccessibleName(await open(page, trigger)));
    expect(strayCalendarLabels()).toBe(0);
    await unmounts.pop()!();
  }
  return names;
}

const october1 = new Date(2026, 9, 1);
const october30 = new Date(2026, 9, 30);
const range = { from: october1, to: october30 };

// The triggers that open each calendar, by their number in the order the
// pickers render them: DatePicker its dialog's trigger, then its popover's;
// DateRangePicker its dialogs' From and To triggers, then its popovers'.
// DatePicker's here are its dialog's, then its popover's.
const datePickerTriggers = [0, 1];

// DateRangePicker's, its From dialog's and popover's, then its To dialog's
// and popover's
const dateRangePickerTriggers = [0, 2, 1, 3];

// The names of DateRangePicker's dialogs and popovers, in the order of
// `dateRangePickerTriggers`, with `from` on the From side and `to` on the To
// side
const rangeNames = (from: string, to: string) => [from, from, to, to];

// Their default names
const rangeDefaults = rangeNames("Choose start date", "Choose end date");

// A Label with the id "label" and the text "Dates", then `picker`
const field = (picker: ReactElement) =>
  createElement(
    Fragment,
    null,
    createElement(Label, { id: "label" }, "Dates"),
    picker,
  );

describe("DatePicker's dialog and popover", () => {
  test('are named "Choose date" by default', async () => {
    const names = await dialogNames(
      () => createElement(DatePicker, { value: october30 }),
      datePickerTriggers,
    );
    expect(names).toEqual(["Choose date", "Choose date"]);
  });

  test("are both renamed by `calendarLabel`", async () => {
    const names = await dialogNames(
      () =>
        createElement(DatePicker, {
          value: october30,
          calendarLabel: "Pilih tarikh",
        }),
      datePickerTriggers,
    );
    expect(names).toEqual(["Pilih tarikh", "Pilih tarikh"]);
  });

  test('are still named "Choose date" under `locale="ms"`, which doesn\'t translate the name', async () => {
    const names = await dialogNames(
      () => createElement(DatePicker, { value: october30, locale: "ms" }),
      datePickerTriggers,
    );
    expect(names).toEqual(["Choose date", "Choose date"]);
  });

  test("aren't named by the picker's `aria-labelledby` or `aria-label`, which name only its triggers", async () => {
    const names = await dialogNames(
      () =>
        field(
          createElement(DatePicker, {
            value: october30,
            "aria-labelledby": "label",
          }),
        ),
      datePickerTriggers,
    );
    const labelled = await dialogNames(
      () =>
        createElement(DatePicker, {
          value: october30,
          "aria-label": "Tarikh lahir",
        }),
      datePickerTriggers,
    );
    expect([names, labelled]).toEqual([
      ["Choose date", "Choose date"],
      ["Choose date", "Choose date"],
    ]);
  });
});

describe("DateRangePicker's dialogs and popovers", () => {
  test('are named "Choose start date" on the From side and "Choose end date" on the To side by default', async () => {
    const names = await dialogNames(
      () => createElement(DateRangePicker, { value: range }),
      dateRangePickerTriggers,
    );
    expect(names).toEqual(rangeDefaults);
  });

  test("are renamed on each side by `fromCalendarLabel` and `toCalendarLabel`", async () => {
    const names = await dialogNames(
      () =>
        createElement(DateRangePicker, {
          value: range,
          fromCalendarLabel: "Pilih tarikh mula",
          toCalendarLabel: "Pilih tarikh akhir",
        }),
      dateRangePickerTriggers,
    );
    expect(names).toEqual(
      rangeNames("Pilih tarikh mula", "Pilih tarikh akhir"),
    );
  });

  test.each<[string, { fromCalendarLabel?: string; toCalendarLabel?: string }]>(
    [
      ["`fromCalendarLabel`", { fromCalendarLabel: "Pilih tarikh mula" }],
      ["`toCalendarLabel`", { toCalendarLabel: "Pilih tarikh akhir" }],
    ],
  )("are renamed on one side only by %s", async (_, props) => {
    const names = await dialogNames(
      () => createElement(DateRangePicker, { value: range, ...props }),
      dateRangePickerTriggers,
    );
    expect(names).toEqual(
      rangeNames(
        props.fromCalendarLabel ?? "Choose start date",
        props.toCalendarLabel ?? "Choose end date",
      ),
    );
  });

  test("keep their names when `fromLabel` and `toLabel` change the triggers' prefixes", async () => {
    const names = await dialogNames(
      () =>
        createElement(DateRangePicker, {
          value: range,
          fromLabel: "Bermula:",
          toLabel: "Berakhir:",
        }),
      dateRangePickerTriggers,
    );
    expect(names).toEqual(rangeDefaults);
  });

  test('are still named in English under `locale="ms"`, which doesn\'t translate the names', async () => {
    const names = await dialogNames(
      () => createElement(DateRangePicker, { value: range, locale: "ms" }),
      dateRangePickerTriggers,
    );
    expect(names).toEqual(rangeDefaults);
  });

  test("aren't named by the picker's `aria-labelledby` or `aria-label`, which name only its triggers", async () => {
    const names = await dialogNames(
      () =>
        field(
          createElement(DateRangePicker, {
            value: range,
            "aria-labelledby": "label",
          }),
        ),
      dateRangePickerTriggers,
    );
    const labelled = await dialogNames(
      () =>
        createElement(DateRangePicker, {
          value: range,
          "aria-label": "Tarikh perjalanan",
        }),
      dateRangePickerTriggers,
    );
    expect([names, labelled]).toEqual([rangeDefaults, rangeDefaults]);
  });
});
