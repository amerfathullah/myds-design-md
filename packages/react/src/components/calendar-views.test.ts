// @vitest-environment happy-dom
// The dates that DatePicker's and DateRangePicker's calendars build in their
// month and year views (#180). A month cell's date is in its own month, with
// the selected day cut to that month's length, so with 30 October selected
// February's cell gives 28 February rather than rolling into March. The year
// view lists `minYear` to `maxYear`, no more and no fewer, and a year cell
// cuts 29 February to 28 February. Picking a year never changes a Date the
// author passed in or received.
//
// The month view's defect shows only on the 29th to the 31st, and with no
// value the calendar falls back to today, so every test fakes the clock.
import { act, createElement, type ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { computeAccessibleName } from "dom-accessibility-api";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { DatePicker } from "./date-picker";
import { DateRangePicker } from "./daterange-picker";

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

// Presses the button, as a click does
const press = (button: Element) =>
  act(async () => (button as HTMLButtonElement).click());

// Opens the calendar behind the picker's trigger number `index`, counted in
// the order the picker renders them, and returns the calendar's root. Only
// one dialog or popover is open at a time, and the calendar's root is the
// element in it that carries `lang`.
async function open(page: HTMLElement, index: number) {
  await press(page.querySelectorAll("button")[index]!);
  const [calendar, ...others] = document.querySelectorAll(
    '[role="dialog"] [lang]',
  );
  expect(others).toEqual([]);
  expect(calendar).toBeDefined();
  return calendar as HTMLElement;
}

// Presses the caption's month or year toggle in the calendar `root`, and
// returns the root
async function toggle(root: HTMLElement, view: "month" | "year") {
  const [month, year, ...others] = root.querySelectorAll(
    '[role="status"] button',
  );
  expect(others).toEqual([]);
  await press(view === "month" ? month! : year!);
  return root;
}

// The buttons in the open view's grid, in the order they render: the month
// view's months, or the year view's years
const cells = (root: HTMLElement) => [
  ...root.querySelectorAll<HTMLButtonElement>('[role="grid"] button'),
];

// The text of each button in the open view's grid
const texts = (root: HTMLElement) =>
  cells(root).map((button) => button.textContent);

// The one button in the open view's grid that reads `text`
function cell(root: HTMLElement, text: string) {
  const [button, ...others] = cells(root).filter(
    (button) => button.textContent === text,
  );
  expect(others).toEqual([]);
  expect(button).toBeDefined();
  return button!;
}

// The text of each button the open view fills as the shown month or year
const filled = (root: HTMLElement) =>
  cells(root)
    .filter((button) => button.dataset.selected === "true")
    .map((button) => button.textContent);

// The text of each button in the open view's grid, row by row
const rows = (root: HTMLElement) =>
  [...root.querySelectorAll('[role="grid"] tr')].map((row) =>
    [...row.querySelectorAll("button")].map((button) => button.textContent),
  );

// The years `first` to `last` as text, counting up or down
const years = (first: number, last: number) =>
  Array.from({ length: Math.abs(last - first) + 1 }, (_, i) =>
    String(first <= last ? first + i : first - i),
  );

// The number of the trigger that opens each calendar's popover, in the order
// the pickers render their triggers: DatePicker its dialog's trigger, then
// its popover's; DateRangePicker its dialogs' From and To triggers, then its
// popovers'
const triggers = { DatePicker: 1, From: 2, To: 3 } as const;

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

beforeEach(() => {
  // Today is 2 November 2026, which no month rolls over from. A test that
  // relies on today sets its own.
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 10, 2, 12));
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
  vi.useRealTimers();
  expect(logged).toEqual([]);
  expect(document.body.innerHTML).toBe("");
});

describe.each([30, 31])(
  "With %i October 2026 selected, DatePicker's month view",
  (day) => {
    // Opens the month view of a DatePicker on `day` October 2026, and returns
    // the calendar's root and the picker's `onValueChange`
    async function monthView() {
      const onValueChange = vi.fn();
      const page = await mount(
        createElement(DatePicker, {
          defaultValue: new Date(2026, 9, day),
          onValueChange,
        }),
      );
      const root = await toggle(await open(page, triggers.DatePicker), "month");
      return { root, onValueChange };
    }

    test("shows twelve distinct months, January to December", async () => {
      const { root } = await monthView();
      expect(texts(root)).toEqual(months);
    });

    test("picks 28 February 2026 from its second cell, and opens the day view on February 2026", async () => {
      const { root, onValueChange } = await monthView();
      await press(cells(root)[1]!);
      expect(onValueChange.mock.calls).toEqual([[new Date(2026, 1, 28)]]);
      expect(computeAccessibleName(root.querySelector('[role="grid"]')!)).toBe(
        "February 2026",
      );
    });
  },
);

test("With 31 October 2026 selected, DatePicker's month view picks 30 November 2026 from its November cell", async () => {
  const onValueChange = vi.fn();
  const page = await mount(
    createElement(DatePicker, {
      defaultValue: new Date(2026, 9, 31),
      onValueChange,
    }),
  );
  const root = await toggle(await open(page, triggers.DatePicker), "month");
  await press(cells(root)[10]!);
  expect(onValueChange.mock.calls).toEqual([[new Date(2026, 10, 30)]]);
});

test("With no value and today 30 January 2026, DatePicker's month view picks 28 February 2026 from its February cell", async () => {
  vi.setSystemTime(new Date(2026, 0, 30, 12));
  const onValueChange = vi.fn();
  const page = await mount(createElement(DatePicker, { onValueChange }));
  const root = await toggle(await open(page, triggers.DatePicker), "month");
  expect(texts(root)).toEqual(months);
  await press(cells(root)[1]!);
  expect(onValueChange.mock.calls).toEqual([[new Date(2026, 1, 28)]]);
});

test.each([
  ["March", 2],
  ["February", 1],
])(
  "With 30 October 2026 selected, a `disabled` function that matches every day of %s disables only that month's cell",
  async (_, monthIndex) => {
    const page = await mount(
      createElement(DatePicker, {
        defaultValue: new Date(2026, 9, 30),
        disabled: (date: Date) => date.getMonth() === monthIndex,
      }),
    );
    const root = await toggle(await open(page, triggers.DatePicker), "month");
    expect(
      cells(root)
        .filter((button) => button.disabled)
        .map((button) => button.textContent),
    ).toEqual([months[monthIndex]]);
  },
);

test("DateRangePicker from 30 January to 15 April 2026 picks 28 February as `from` from the From calendar's February cell", async () => {
  const onValueChange = vi.fn();
  const page = await mount(
    createElement(DateRangePicker, {
      defaultValue: { from: new Date(2026, 0, 30), to: new Date(2026, 3, 15) },
      onValueChange,
    }),
  );
  const root = await toggle(await open(page, triggers.From), "month");
  expect(texts(root)).toEqual(months);
  await press(cells(root)[1]!);
  expect(onValueChange.mock.calls).toEqual([
    [{ from: new Date(2026, 1, 28), to: new Date(2026, 3, 15) }],
  ]);
});

describe("DatePicker's year view", () => {
  type YearProps = {
    minYear?: number;
    maxYear?: number;
    yearOrder?: "asc" | "desc";
  };

  // Opens the year view of a DatePicker on `value`, 15 June 2026 unless
  // given, and returns the calendar's root
  async function yearView(props: YearProps, value = new Date(2026, 5, 15)) {
    const page = await mount(
      createElement(DatePicker, { defaultValue: value, ...props }),
    );
    return toggle(await open(page, triggers.DatePicker), "year");
  }

  test.each([
    ["asc", 1900, 2099],
    ["desc", 2099, 1900],
  ] as const)(
    'lists the 200 years from 1900 to 2099 by default, with `yearOrder="%s"` from %i to %i',
    async (yearOrder, first, last) => {
      const root = await yearView({ yearOrder });
      const shown = texts(root);
      expect(shown).toHaveLength(200);
      expect(shown).toEqual(years(first, last));
      expect(shown).not.toContain("2100");
      expect(shown).not.toContain("1899");
    },
  );

  test.each([
    ["asc", 2020, 2030, "2019", "2031"],
    ["desc", 2030, 2020, "2019", "2031"],
  ] as const)(
    'lists 2020 to 2030 with `minYear={2020} maxYear={2030} yearOrder="%s"`, from %i to %i',
    async (yearOrder, first, last, before, after) => {
      const shown = texts(
        await yearView({ minYear: 2020, maxYear: 2030, yearOrder }),
      );
      expect(shown).toEqual(years(first, last));
      expect(shown).not.toContain(before);
      expect(shown).not.toContain(after);
    },
  );

  test.each([
    ["asc", [["2000", "2001", "2002"], ["2003"]]],
    ["desc", [["2003", "2002", "2001"], ["2000"]]],
  ] as const)(
    'lists 2000 to 2003 with `minYear={2000} maxYear={2003} yearOrder="%s"`, in rows of three with the short row last',
    async (yearOrder, shape) => {
      const root = await yearView(
        { minYear: 2000, maxYear: 2003, yearOrder },
        new Date(2001, 5, 15),
      );
      expect(rows(root)).toEqual(shape);
    },
  );

  test.each(["asc", "desc"] as const)(
    'lists only 2026 with `minYear={2026} maxYear={2026} yearOrder="%s"`',
    async (yearOrder) => {
      const root = await yearView({ minYear: 2026, maxYear: 2026, yearOrder });
      expect(rows(root)).toEqual([["2026"]]);
    },
  );

  test.each(["asc", "desc"] as const)(
    'lists no years with `minYear={2030} maxYear={2026} yearOrder="%s"`',
    async (yearOrder) => {
      const root = await yearView({ minYear: 2030, maxYear: 2026, yearOrder });
      expect(computeAccessibleName(root.querySelector('[role="grid"]')!)).toBe(
        "Choose the Year",
      );
      expect(rows(root)).toEqual([]);
    },
  );
});

test("With 29 February 2024 selected, DatePicker's year view picks 28 February 2025 from 2025, and the month view then fills February", async () => {
  const onValueChange = vi.fn();
  const page = await mount(
    createElement(DatePicker, {
      defaultValue: new Date(2024, 1, 29),
      onValueChange,
    }),
  );
  const root = await toggle(await open(page, triggers.DatePicker), "year");
  await press(cell(root, "2025"));
  expect(onValueChange.mock.calls).toEqual([[new Date(2025, 1, 28)]]);
  expect(computeAccessibleName(root.querySelector('[role="grid"]')!)).toBe(
    "Choose the Month",
  );
  expect(filled(root)).toEqual(["Feb"]);
});

// Each test's `onValueChange` records the change and ignores it, so the
// picker keeps showing the author's Date
describe("Picking a year in the year view leaves unchanged", () => {
  test("DatePicker's `value`", async () => {
    const value = new Date(2026, 9, 15);
    const onValueChange = vi.fn();
    const page = await mount(
      createElement(DatePicker, { value, onValueChange }),
    );
    const root = await toggle(await open(page, triggers.DatePicker), "year");
    await press(cell(root, "2030"));
    expect(onValueChange.mock.calls).toEqual([[new Date(2030, 9, 15)]]);
    expect(value).toEqual(new Date(2026, 9, 15));
  });

  test("DateRangePicker's `from`, picked in the From calendar", async () => {
    const value = { from: new Date(2026, 9, 1), to: new Date(2026, 10, 20) };
    const onValueChange = vi.fn();
    const page = await mount(
      createElement(DateRangePicker, { value, onValueChange }),
    );
    const root = await toggle(await open(page, triggers.From), "year");
    await press(cell(root, "2025"));
    expect(onValueChange.mock.calls).toEqual([
      [{ from: new Date(2025, 9, 1), to: new Date(2026, 10, 20) }],
    ]);
    expect(value).toEqual({
      from: new Date(2026, 9, 1),
      to: new Date(2026, 10, 20),
    });
  });

  test("DateRangePicker's `to`, picked in the To calendar", async () => {
    const value = { from: new Date(2026, 9, 1), to: new Date(2026, 10, 20) };
    const onValueChange = vi.fn();
    const page = await mount(
      createElement(DateRangePicker, { value, onValueChange }),
    );
    const root = await toggle(await open(page, triggers.To), "year");
    await press(cell(root, "2027"));
    expect(onValueChange.mock.calls).toEqual([
      [{ from: new Date(2026, 9, 1), to: new Date(2027, 10, 20) }],
    ]);
    expect(value).toEqual({
      from: new Date(2026, 9, 1),
      to: new Date(2026, 10, 20),
    });
  });

  test("DateRangePicker's `from`, when it is the same Date as `to` and the To calendar picks a year", async () => {
    const date = new Date(2026, 9, 15);
    const onValueChange = vi.fn();
    const page = await mount(
      createElement(DateRangePicker, {
        defaultValue: { from: date, to: date },
        onValueChange,
      }),
    );
    const root = await toggle(await open(page, triggers.To), "year");
    await press(cell(root, "2027"));
    expect(onValueChange.mock.calls).toEqual([
      [{ from: new Date(2026, 9, 15), to: new Date(2027, 9, 15) }],
    ]);
    expect(date).toEqual(new Date(2026, 9, 15));
    // The From triggers still show 15 October 2026
    expect(
      [...page.querySelectorAll("button")].map((button) => button.textContent),
    ).toEqual([
      "From:15 Oct 2026",
      "To:15 Oct 2027",
      "From:15 Oct 2026",
      "To:15 Oct 2027",
    ]);
  });

  test("a Date that DatePicker's month view picked, when the same calendar then picks a year", async () => {
    const onValueChange = vi.fn();
    const page = await mount(
      createElement(DatePicker, {
        value: new Date(2026, 9, 15),
        onValueChange,
      }),
    );
    const root = await toggle(await open(page, triggers.DatePicker), "month");
    await press(cell(root, "Mar"));
    await press(cell(await toggle(root, "year"), "2027"));
    expect(onValueChange).toHaveBeenCalledTimes(2);
    expect(onValueChange.mock.calls[0]).toEqual([new Date(2026, 2, 15)]);
  });
});

test.each(["asc", "desc"] as const)(
  'With `yearOrder="%s"`, DatePicker\'s year view scrolls the shown year into view as it opens',
  async (yearOrder) => {
    const scrollIntoView = vi.spyOn(Element.prototype, "scrollIntoView");
    const page = await mount(
      createElement(DatePicker, {
        defaultValue: new Date(2026, 9, 15),
        yearOrder,
      }),
    );
    const root = await toggle(await open(page, triggers.DatePicker), "year");
    expect(filled(root)).toEqual(["2026"]);
    const [scrolled, ...others] = scrollIntoView.mock.contexts;
    expect(others).toEqual([]);
    expect(scrolled).toBe(cell(root, "2026"));
  },
);
