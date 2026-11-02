// @vitest-environment happy-dom
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

// The accessible name of the one element in `within` that matches `selector`
function nameOf(within: ParentNode, selector: string) {
  const [element, ...others] = within.querySelectorAll(selector);
  expect(others).toEqual([]);
  expect(element).toBeDefined();
  return computeAccessibleName(element!);
}

// The accessible names of every element in `within` that matches `selector`
const namesOf = (within: ParentNode, selector: string) =>
  [...within.querySelectorAll(selector)].map((element) =>
    computeAccessibleName(element),
  );

// The button for the day `isoDate` (e.g. "2026-10-30"), in its month or
// shown outside it
const dayButton = (isoDate: string) => `[data-day="${isoDate}"] button`;

// The number of the trigger that opens each calendar, in the order the
// pickers render them: DatePicker its dialog's trigger, then its popover's;
// DateRangePicker its dialogs' From and To triggers, then its popovers'
const triggers = {
  DatePicker: { dialog: 0, popover: 1 },
  From: { dialog: 0, popover: 2 },
  To: { dialog: 1, popover: 3 },
} as const;

// The props both pickers take that this file sets
type PickerProps = {
  locale?: "en" | "ms";
  previousYearLabel?: string;
  nextYearLabel?: string;
};

// No `previousYearLabel` or `nextYearLabel` reaches the DOM as an attribute.
// React warns about an unknown prop only the first time it meets its name,
// so the warning check would miss every leak after the first.
const strayYearLabels = () =>
  document.querySelectorAll("[previousyearlabel], [nextyearlabel]").length;

beforeEach(() => {
  // Today is after every date this file names, so no day button's name
  // starts "Today, "
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

const october1 = new Date(2026, 9, 1);
const october30 = new Date(2026, 9, 30);

// A DatePicker on 30 October 2026, and a DateRangePicker on 1 to 30 October
// 2026
const datePicker = (props: PickerProps) =>
  createElement(DatePicker, { value: october30, ...props });
const dateRangePicker = (props: PickerProps) =>
  createElement(DateRangePicker, {
    value: { from: october1, to: october30 },
    ...props,
  });

// Every calendar the pickers open, with its picker and trigger
const calendars = [
  ["DatePicker's popover", datePicker, triggers.DatePicker.popover],
  ["DatePicker's dialog", datePicker, triggers.DatePicker.dialog],
  ["DateRangePicker's From popover", dateRangePicker, triggers.From.popover],
  ["DateRangePicker's From dialog", dateRangePicker, triggers.From.dialog],
  ["DateRangePicker's To popover", dateRangePicker, triggers.To.popover],
  ["DateRangePicker's To dialog", dateRangePicker, triggers.To.dialog],
] as const;

describe.each(["popover", "dialog"] as const)(
  "DatePicker's calendar in its %s",
  (where) => {
    const calendar = async (locale: "en" | "ms") =>
      open(await mount(datePicker({ locale })), triggers.DatePicker[where]);

    test('names the day view\'s navigation and grid in Malay under `locale="ms"`', async () => {
      const root = await calendar("ms");
      expect(nameOf(root, "nav")).toBe("Bar navigasi");
      expect(namesOf(root, "nav button")).toEqual([
        "Pergi ke bulan sebelumnya",
        "Pergi ke bulan seterusnya",
      ]);
      expect(nameOf(root, '[role="grid"]')).toBe("Oktober 2026");
    });

    test('names the weekday headings in full in Malay under `locale="ms"`, Sunday first', async () => {
      const headings = (await calendar("ms")).querySelectorAll("th");
      expect([...headings].map((th) => computeAccessibleName(th))).toEqual([
        "Ahad",
        "Isnin",
        "Selasa",
        "Rabu",
        "Khamis",
        "Jumaat",
        "Sabtu",
      ]);
      expect([...headings].map((th) => th.textContent)).toEqual([
        "Ahd",
        "Isn",
        "Sel",
        "Rab",
        "Kha",
        "Jum",
        "Sab",
      ]);
    });

    test('names the day buttons in Malay under `locale="ms"`', async () => {
      const root = await calendar("ms");
      expect(nameOf(root, dayButton("2026-10-30"))).toBe(
        "Jumaat, 30 Oktober 2026, dipilih",
      );
      expect(nameOf(root, dayButton("2026-10-31"))).toBe(
        "Sabtu, 31 Oktober 2026",
      );
      expect(nameOf(root, dayButton("2026-09-27"))).toBe(
        "Ahad, 27 September 2026",
      );
    });

    test('names the day view in react-day-picker\'s en-GB words under `locale="en"`', async () => {
      const root = await calendar("en");
      expect(nameOf(root, "nav")).toBe("Navigation bar");
      expect(namesOf(root, "nav button")).toEqual([
        "Go to the Previous Month",
        "Go to the Next Month",
      ]);
      expect(nameOf(root, '[role="grid"]')).toBe("October 2026");
      const headings = [...root.querySelectorAll("th")];
      expect(headings.map((th) => computeAccessibleName(th))).toEqual([
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ]);
      expect(headings.map((th) => th.textContent)).toEqual([
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
      ]);
      expect(nameOf(root, dayButton("2026-10-30"))).toBe(
        "Friday, 30 October 2026, selected",
      );
      expect(nameOf(root, dayButton("2026-09-27"))).toBe(
        "Sunday, 27 September 2026",
      );
    });

    test.each([
      ["ms", "Pilih bulan"],
      ["en", "Choose the Month"],
    ] as const)(
      'names the month view\'s grid from `locale="%s"`, and its buttons in English',
      async (locale, grid) => {
        const root = await toggle(await calendar(locale), "month");
        expect(nameOf(root, '[role="grid"]')).toBe(grid);
        expect(namesOf(root, "nav button")).toEqual([
          "Go to the Previous Year",
          "Go to the Next Year",
        ]);
      },
    );

    test.each([
      ["ms", "Pilih tahun"],
      ["en", "Choose the Year"],
    ] as const)(
      'names the year view\'s grid from `locale="%s"`',
      async (locale, grid) => {
        const root = await toggle(await calendar(locale), "year");
        expect(nameOf(root, '[role="grid"]')).toBe(grid);
      },
    );
  },
);

describe.each(["popover", "dialog"] as const)(
  "DateRangePicker's To calendar in its %s",
  (where) => {
    test('names the range\'s days, the navigation and the grid in Malay under `locale="ms"`', async () => {
      const root = await open(
        await mount(dateRangePicker({ locale: "ms" })),
        triggers.To[where],
      );
      expect(nameOf(root, dayButton("2026-10-01"))).toBe(
        "Khamis, 1 Oktober 2026, dipilih",
      );
      expect(nameOf(root, dayButton("2026-10-30"))).toBe(
        "Jumaat, 30 Oktober 2026, dipilih",
      );
      expect(nameOf(root, "nav")).toBe("Bar navigasi");
      expect(nameOf(root, '[role="grid"]')).toBe("Oktober 2026");
    });
  },
);

describe.each(calendars)("%s", (_, picker, trigger) => {
  test.each([
    ["ms", "Ahad", "ms"],
    ["en", "Sunday", "en-GB"],
  ] as const)(
    'under `locale="%s"`, starts the week on %s and sets `lang="%s"`',
    async (locale, sunday, lang) => {
      const root = await open(await mount(picker({ locale })), trigger);
      expect(computeAccessibleName(root.querySelector("th")!)).toBe(sunday);
      expect(
        root.querySelector('[role="grid"] td')!.getAttribute("data-day"),
      ).toBe("2026-09-27");
      expect(root.getAttribute("lang")).toBe(lang);
    },
  );

  test("names the month view's year buttons from `previousYearLabel` and `nextYearLabel`", async () => {
    const page = await mount(
      picker({
        locale: "ms",
        previousYearLabel: "Pergi ke tahun sebelumnya",
        nextYearLabel: "Pergi ke tahun seterusnya",
      }),
    );
    const root = await toggle(await open(page, trigger), "month");
    expect(namesOf(root, "nav button")).toEqual([
      "Pergi ke tahun sebelumnya",
      "Pergi ke tahun seterusnya",
    ]);
    expect(strayYearLabels()).toBe(0);
  });
});

// The triggers format their dates with the same locale objects as the
// calendar, and read as they did with date-fns's own
describe("The triggers", () => {
  // The text of every trigger on the page, in the order they render
  const triggerTexts = (page: HTMLElement) =>
    [...page.querySelectorAll("button")].map((button) => button.textContent);

  test.each([
    ["ms", "30 Okt 2026"],
    ["en", "30 Oct 2026"],
  ] as const)(
    'show DatePicker\'s date under `locale="%s"` as "%s"',
    async (locale, date) => {
      const page = await mount(datePicker({ locale }));
      expect(triggerTexts(page)).toEqual([date, date]);
    },
  );

  test.each([
    ["ms", "Dari:01 Okt 2026", "Hingga:30 Okt 2026"],
    ["en", "From:01 Oct 2026", "To:30 Oct 2026"],
  ] as const)(
    'show DateRangePicker\'s dates under `locale="%s"` as "%s" and "%s"',
    async (locale, from, to) => {
      const page = await mount(dateRangePicker({ locale }));
      expect(triggerTexts(page)).toEqual([from, to, from, to]);
    },
  );
});
